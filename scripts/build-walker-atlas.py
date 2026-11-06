"""Bake a licensed, segmented side-view walk into a 48-frame alpha atlas.

Requires numpy, opencv-python-headless and Pillow. Raw video stays outside the
repository. Run segment-walkers.swift first; see docs/crowd-prototype.md.
"""
import argparse
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

TILE = (88, 140)
ANCHOR = (44, 117)
BODY_HEIGHT = 99
COUNT = 48
SCALE = 4
BLURS = [2.2, 3.6, 5.8, 9]


def normalize(frames, masks, poses, cleanup="pavement", pose_envelope=False, limit=None, skip=0, preserve_carry=False, pose_constraints=True, return_frames=False):
    records = []
    for file in sorted(masks.glob("*.png"))[skip:][:limit]:
        frame = cv2.imread(str(frames / file.name))
        mask = cv2.imread(str(file), 0)
        mask = cv2.resize(mask, (frame.shape[1], frame.shape[0]))
        count, labels, stats, _ = cv2.connectedComponentsWithStats((mask > 145).astype("uint8"))
        largest = 1 + np.argmax(stats[1:, 4])
        x, y, w, h = stats[largest, :4]
        if pose_constraints:
            mask[labels != largest] = 0
        # Vision includes part of the warm pavement shadow between the legs.
        # This clip-specific color gate removes that shadow, retaining the cool
        # trousers and pale shoes. Review other footage before reusing this gate.
        b, g, r = [channel.astype(float) for channel in cv2.split(frame)]
        garment = (b > r * .91) | (g > r * 1.12) | (r < 43)
        garment[:int(y + h * .60)] = True
        if cleanup == "pavement":
            mask[~garment] = 0
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8))
        pose = poses.get(file.name, {})
        allowed = np.zeros(mask.shape, np.uint8)
        allowed[:int(y + h * .60)] = 255
        if pose_envelope:
            allowed[:] = 0
            def point(key):
                v=pose[key]
                return (round(v[0]*frame.shape[1]),round(v[1]*frame.shape[0]))
            cv2.line(allowed, point("neck_1_joint"), point("root"), 255, round(h*.16))
            cv2.ellipse(allowed, point("head_joint"), (round(h*.065),round(h*.085)),0,0,360,255,-1)
            cv2.line(allowed, point("head_joint"), point("neck_1_joint"),255,round(h*.07))
            for side in ["left","right"]:
                cv2.line(allowed, point(f"{side}_shoulder_1_joint"),point(f"{side}_forearm_joint"),255,round(h*.075))
                cv2.line(allowed, point(f"{side}_forearm_joint"),point(f"{side}_hand_joint"),255,round(h*.06))
                cv2.circle(allowed,point(f"{side}_hand_joint"),round(h*.035),255,-1)
        for side in ["left", "right"]:
            knee = pose.get(f"{side}_leg_joint")
            ankle = pose.get(f"{side}_foot_joint")
            hip = pose.get(f"{side}_upLeg_joint")
            if pose_constraints and (not knee or not ankle or min(knee[2], ankle[2]) < .25):
                raise ValueError(f"Review missing leg landmark: {file.name}, {side}")
            k = (round(knee[0] * frame.shape[1]), round(knee[1] * frame.shape[0]))
            a = (round(ankle[0] * frame.shape[1]), round(ankle[1] * frame.shape[0]))
            if hip:
                hip_point = (round(hip[0] * frame.shape[1]), round(hip[1] * frame.shape[0]))
                cv2.line(allowed, hip_point, k, 255, round(h * .14))
            cv2.line(allowed, k, a, 255, round(h * .115))
            cv2.ellipse(allowed, (round(a[0] + h * .028), round(a[1] + h * .025)),
                        (round(h * .082), round(h * .044)), 0, 0, 360, 255, -1)
        if preserve_carry:
            for side in ["left","right"]:
                hand=pose.get(f"{side}_hand_joint")
                if hand and hand[2]>.2:
                    hx,hy=hand[0]*frame.shape[1],hand[1]*frame.shape[0]
                    cv2.rectangle(allowed,(round(hx-h*.17),round(hy-h*.02)),(round(hx+h*.17),round(hy+h*.27)),255,-1)
        if not pose_constraints:
            allowed[:]=255
        mask[allowed == 0] = 0
        # Hip/torso center, independent of the feet and swinging hands.
        torso = mask[int(y + h * .34):int(y + h * .51)] > 150
        center = float(np.median(np.where(torso)[1]))
        ground = float(np.max(np.where(mask > 160)[0]))
        feet = [pose[f"{side}_foot_joint"] for side in ["left", "right"]]
        records.append((mask, center, ground, h, feet, frame.shape[1], cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY) if return_frames else None))
    if not pose_constraints:
        # Bag-occluded pose roots can jump to a reflection. Register against the
        # actual upper-body mask; a short median removes isolated mask glitches.
        smoothed = []
        for i, record in enumerate(records):
            neighbors = records[max(0, i-2):i+3]
            smoothed.append((record[0], float(np.median([r[1] for r in neighbors])),
                float(np.median([r[2] for r in neighbors])), *record[3:]))
        records = smoothed
    reference = float(np.median([r[3] for r in records]))
    factor = BODY_HEIGHT * SCALE / reference
    normalized = []
    landmarks = []
    registered=[]
    for mask, center, ground, _, feet, width, gray_frame in records:
        matrix = np.float32([[factor, 0, ANCHOR[0] * SCALE - center * factor],
                             [0, factor, ANCHOR[1] * SCALE - ground * factor]])
        normalized.append(cv2.warpAffine(mask, matrix, (TILE[0] * SCALE, TILE[1] * SCALE)))
        landmarks.append([(point[0] * width - center) * factor / SCALE for point in feet])
        if return_frames:
            registered.append(cv2.warpAffine(gray_frame,matrix,(TILE[0]*SCALE,TILE[1]*SCALE)))
    return (normalized,np.asarray(landmarks),registered) if return_frames else (normalized,np.asarray(landmarks))


def find_cycle(masks, minimum=27, maximum=37):
    small = [cv2.resize(m, TILE).astype(float) / 255 for m in masks]
    candidates = []
    # A full left/right cycle for this 29.97 fps recording, never a half-step.
    for period in range(minimum, maximum + 1):
        for start in range(3, min(len(small) - period - 3, 58)):
            error = np.mean([np.mean(np.abs(small[start + i] - small[start + period + i])) for i in range(-2, 3)])
            candidates.append((float(error), start, period))
    return min(candidates)


def silhouette(mask, kind, phase):
    # All three retain the captured legs/head. Clothes and accessories are
    # authored additions, not extra actors or independently captured gaits.
    alpha = Image.fromarray(mask.astype("uint8"))
    if kind != "everyday":
        draw = ImageDraw.Draw(alpha)
        # The real torso's small rise and lean drive the attached garment too.
        ys, xs = np.where(mask[160:260] > 160)
        cx = float(np.median(xs)) if len(xs) else 44 * SCALE
        def pts(points):
            return [(cx + x * SCALE, y * SCALE) for x, y in points]
        if kind == "coat":
            # A wider curved coat, instead of stretching the full person.
            layer = Image.new("L", alpha.size)
            d = ImageDraw.Draw(layer)
            d.rounded_rectangle((cx-9*SCALE, 37*SCALE, cx+8*SCALE, 76*SCALE), radius=7*SCALE, fill=255)
            hem = .8 * np.sin(phase - .6)
            d.polygon(pts([(-8,49),(7,49),(11+hem,79),(-12+hem,79)]), fill=255)
            layer = layer.filter(ImageFilter.GaussianBlur(.45*SCALE))
            alpha = Image.fromarray(np.maximum(np.asarray(alpha), np.asarray(layer)))
        else:
            # Backpack is attached to the back at shoulder level; it never
            # changes the foot trajectory or full-body aspect ratio.
            draw.rounded_rectangle((cx-15*SCALE, 37*SCALE, cx-3*SCALE, 62*SCALE), radius=5*SCALE, fill=255)
            draw.line(pts([(-9,39),(-7,35),(-4,35)]), fill=255, width=2*SCALE)
    # No color/face/logo pixels survive; only the edited alpha contour is used.
    alpha = alpha.filter(ImageFilter.GaussianBlur(.27 * SCALE))
    rgba = Image.new("RGBA", alpha.size, (83, 84, 80, 0))
    rgba.putalpha(alpha)
    return rgba.resize(TILE, Image.Resampling.LANCZOS)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--frames", type=Path, required=True)
    parser.add_argument("--masks", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--poses", type=Path, required=True)
    parser.add_argument("--qa-dir", type=Path)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    masks, feet = normalize(args.frames, args.masks, json.loads(args.poses.read_text()))
    error, start, period = find_cycle(masks)
    points = feet[start:start+period]
    # Low-pass the measured ankles, select the backward-moving support foot,
    # then solve a periodic root offset. This preserves the captured joints,
    # while keeping support travel proportional to the code's root movement.
    points = sum(np.roll(points, k, axis=0) * weight for k, weight in
                 [(-2, 1), (-1, 2), (0, 3), (1, 2), (2, 1)]) / 9
    delta = np.roll(points, -1, axis=0) - points
    support = np.argmin(delta, axis=1)
    support_delta = delta[np.arange(period), support]
    travel = float(-np.sum(support_delta))
    correction = np.r_[0., np.cumsum(-travel / period - support_delta)]
    correction -= np.mean(correction[:-1])
    calibration = {
        "source": "Mixkit #4855 / stockyana",
        "sourceFps": 30000/1001, "segmentStartSeconds": 7.5,
        "cycleStartFrameInSegment": start, "cyclePeriodSourceFrames": period,
        "frameCount": COUNT, "bodyHeight": BODY_HEIGHT,
        "stridePerBodyHeight": travel / BODY_HEIGHT,
        "rootOffsets": correction.tolist(), "smoothedAnkles": points.tolist(),
        "supportLeg": support.tolist(), "uncorrectedSeamMeanAlphaDifference": error,
        "note": "Ankle-estimated support calibration; toe/heel roll and segmentation remain approximate."
    }
    (args.out / "calibration.json").write_text(json.dumps(calibration, indent=2) + "\n")
    print(json.dumps({"start": start, "period": period, "stride": travel / BODY_HEIGHT,
                      "rootCorrectionRange": [float(min(correction)), float(max(correction))]}))
    if args.qa_dir:
        args.qa_dir.mkdir(parents=True, exist_ok=True)
        np.savez_compressed(args.qa_dir / "normalized.npz", masks=np.asarray(masks), start=start, period=period)
    for kind in ["everyday", "coat", "backpack"]:
        atlas = Image.new("RGBA", (TILE[0] * 8, TILE[1] * 6))
        for i in range(COUNT):
            t = start + period * i / COUNT
            a = int(t)
            mask = masks[a].astype(float) * (1 - (t-a)) + masks[a+1].astype(float) * (t-a)
            shift = float(np.interp(period * i / COUNT, np.arange(period + 1), correction)) * SCALE
            mask = cv2.warpAffine(mask, np.float32([[1, 0, shift], [0, 1, 0]]), (TILE[0] * SCALE, TILE[1] * SCALE))
            atlas.paste(silhouette(mask, kind, i / COUNT * np.pi * 2), ((i % 8) * TILE[0], (i // 8) * TILE[1]))
        atlas.save(args.out / f"{kind}.webp", lossless=True, method=6)
        blurred = Image.new("RGBA", (atlas.width, atlas.height * len(BLURS)))
        for bank, blur in enumerate(BLURS):
            alpha = atlas.getchannel("A").filter(ImageFilter.GaussianBlur(blur))
            tinted = Image.new("RGBA", atlas.size, (83, 84, 80, 0))
            tinted.putalpha(alpha)
            blurred.paste(tinted, (0, bank * atlas.height))
        # Blur already removes high-frequency detail; half-resolution fallback
        # keeps Safari's download/decoded memory close to the sharp images.
        blurred = blurred.resize((blurred.width // 2, blurred.height // 2), Image.Resampling.LANCZOS)
        blurred.save(args.out / f"{kind}-blurred.webp", lossless=True, method=6)
        # This one is for inspecting edge quality, not shipped to the browser.
        if args.qa_dir: atlas.save(args.qa_dir / f"{kind}-atlas.png")


if __name__ == "__main__":
    main()
