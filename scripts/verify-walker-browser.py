"""Production preview QA. Requires Python Playwright with Chromium and WebKit."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument("--url", default="http://localhost:3112")
parser.add_argument("--out", type=Path, required=True)
args = parser.parse_args()
args.out.mkdir(parents=True, exist_ok=True)
results = []

INSTRUMENT = """(() => {
  const raf = window.requestAnimationFrame.bind(window);
  window.__gaitPerf = [];
  window.requestAnimationFrame = callback => {
    const crowd = String(callback).includes('timeline');
    return raf(now => {
      const started = performance.now();
      callback(now);
      if (crowd) window.__gaitPerf.push({ now, cost: performance.now() - started });
    });
  };
})()"""

def percentile(values, p):
    return sorted(values)[min(len(values)-1, int(len(values)*p))]


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for name, width, height, mobile, cpu, original in [
        ("desktop", 1440, 1000, False, 1, False),
        ("desktop-original", 1440, 1000, False, 1, True),
        ("phone", 390, 844, True, 1, False),
        ("phone-cpu4", 390, 844, True, 4, False),
    ]:
        context = browser.new_context(viewport={"width": width, "height": height},
            device_scale_factor=3 if mobile else 1, is_mobile=mobile, has_touch=mobile)
        context.add_init_script(INSTRUMENT)
        page = context.new_page()
        errors, requests = [], []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("request", lambda request: requests.append(request.url))
        if cpu != 1:
            context.new_cdp_session(page).send("Emulation.setCPUThrottlingRate", {"rate": cpu})
        response = page.goto(args.url + "/zh" + ("?crowd=original" if original else ""), wait_until="networkidle")
        assert response.status == 200
        expected = "procedural" if original else "video-derived"
        page.wait_for_function("source => document.querySelector('canvas')?.dataset.walkerSource === source", arg=expected)
        assert page.locator("canvas").get_attribute("data-walker-variants") == ("8" if original else "6")
        assert page.locator("video").count() == 0
        assert not [url for url in requests if url.endswith(".mp4")]
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        page.evaluate("window.__gaitPerf = []")
        page.wait_for_timeout(3200)
        samples = page.evaluate("window.__gaitPerf")
        assert len(samples) > 30, "crowd frames must be observed"
        costs = [sample["cost"] for sample in samples]
        intervals = [b["now"] - a["now"] for a, b in zip(samples, samples[1:])]
        result = {"name": name, "browser": browser.version, "viewport": [width, height], "cpuThrottle": cpu,
            "frames": len(samples), "fps": round((len(samples)-1)*1000/(samples[-1]["now"]-samples[0]["now"]), 2),
            "drawMedianMs": round(percentile(costs, .5), 2), "drawP95Ms": round(percentile(costs, .95), 2),
            "frameIntervalP95Ms": round(percentile(intervals, .95), 2),
            "canvas": page.locator("canvas").evaluate("c=>({...c.dataset,width:c.width,height:c.height})"), "errors": errors}
        assert not errors
        page.screenshot(path=str(args.out / f"{name}.png"), full_page=True)
        if not mobile and not original:
            track = page.locator("a[data-person][aria-hidden='false']").first
            box = track.bounding_box()
            page.mouse.move(box["x"] + box["width"]/2, box["y"] + box["height"]*.6)
            page.wait_for_timeout(500)
            assert page.locator("a[data-pointer-track='true'][aria-hidden='false']").count() > 0
            result["pointerTracking"] = "passed"
        results.append(result)
        print(json.dumps(result), flush=True)
        context.close()

    context = browser.new_context()
    page = context.new_page()
    page.goto(args.url + "/zh?crowd=three", wait_until="networkidle")
    page.wait_for_function("document.querySelector('canvas')?.dataset.walkerVariants === '3'")
    results.append({"name": "three-comparison", "variants": 3})
    context.close()

    context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
    page = context.new_page()
    page.goto(args.url + "/zh", wait_until="networkidle")
    page.wait_for_function("document.querySelector('canvas')?.dataset.walkerSource === 'video-derived'")
    first = page.locator("canvas").evaluate("c=>c.toDataURL()")
    page.wait_for_timeout(300)
    assert first == page.locator("canvas").evaluate("c=>c.toDataURL()")
    results.append({"name": "reduced-motion", "stableCanvas": True})
    context.close()

    context = browser.new_context()
    page = context.new_page()
    page.route("**/walkers/*.webp", lambda route: route.abort())
    page.goto(args.url + "/zh", wait_until="networkidle")
    page.wait_for_function("document.querySelector('canvas')?.dataset.walkerSource === 'procedural'")
    assert page.locator("a[data-person][aria-hidden='false']").count() > 0
    results.append({"name": "failed-atlas", "proceduralFallback": True})
    context.close()

    context = browser.new_context(viewport={"width": 1440, "height": 1000}, record_video_dir=str(args.out / "video"),
        record_video_size={"width": 1440, "height": 1000})
    page = context.new_page()
    page.goto(args.url + "/walkers/lab.html", wait_until="networkidle")
    assert page.locator("#status").inner_text() == ""
    assert page.locator(".cards canvas").count() == 6
    page.wait_for_timeout(3500)
    page.locator("#play").click()
    page.locator("#frame").fill("12")
    page.locator("#frame").dispatch_event("input")
    assert page.locator("#frame-value").inner_text() == "13 / 48"
    page.screenshot(path=str(args.out / "lab-desktop.png"), full_page=True)
    page.set_viewport_size({"width": 390, "height": 844})
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
    page.screenshot(path=str(args.out / "lab-phone.png"), full_page=True)
    results.append({"name": "lab", "scrubAndPause": True, "mobileOverflow": False})
    context.close()
    browser.close()

    webkit = playwright.webkit.launch(headless=True)
    context = webkit.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=3, is_mobile=True, has_touch=True)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(args.url + "/zh", wait_until="networkidle")
    page.wait_for_function("document.querySelector('canvas')?.dataset.walkerSource === 'video-derived'")
    assert page.locator("canvas").get_attribute("data-walker-blur") == "baked"
    first = page.locator("canvas").evaluate("c=>c.toDataURL()")
    page.wait_for_timeout(250)
    assert first != page.locator("canvas").evaluate("c=>c.toDataURL()")
    assert not errors
    page.screenshot(path=str(args.out / "webkit-phone.png"), full_page=True)
    results.append({"name": "webkit-phone", "browser": webkit.version, "animatedCanvas": True, "blur": page.locator("canvas").get_attribute("data-walker-blur"), "errors": errors})
    context.close()
    webkit.close()

(args.out / "browser-results.json").write_text(json.dumps(results, indent=2) + "\n")
print("All browser checks passed.", flush=True)
