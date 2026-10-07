// Run locally when a source changes. Production builds use the committed atlases.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const sources = [
  ["analyst-copilot", "depth-clip-02.mp4"],
  ["prototype-making", "depth-clip-03-tooling.mp4"],
  ["knowledge-structure", "depth-clip-04.mp4"],
  ["industry-map", "depth-clip-05.mp4"],
];
const columns = 4;
const rows = 4;

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr);
  return result.stdout;
}

for (const [id, file] of sources) {
  const source = join("assets/dotmorph-source", file);
  const metadata = JSON.parse(run("ffprobe", [
    "-v", "error", "-select_streams", "v:0", "-show_entries",
    "stream=width,height,avg_frame_rate,nb_frames:format=duration", "-of", "json", source,
  ]));
  const stream = metadata.streams[0];
  const [numerator, denominator] = stream.avg_frame_rate.split("/").map(Number);
  const fps = numerator / denominator;
  const frameCount = Number(stream.nb_frames);
  const directory = join("public/dotmorph-assets/frames", id);
  mkdirSync(directory, { recursive: true });
  const temporaryDirectory = mkdtempSync(join(tmpdir(), "depth-frames-"));
  try {
    run("ffmpeg", [
      "-v", "error", "-y", "-i", source, "-an", "-vf", `tile=${columns}x${rows}`,
      "-fps_mode", "passthrough", join(temporaryDirectory, "atlas-%03d.png"),
    ]);
    const atlases = [];
    for (let index = 1; index <= Math.ceil(frameCount / (columns * rows)); index += 1) {
      const temporary = join(temporaryDirectory, `atlas-${String(index).padStart(3, "0")}.png`);
      const bytes = await sharp(readFileSync(temporary)).webp({ quality: 95, effort: 6 }).toBuffer();
      const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
      const name = `atlas-${String(index).padStart(3, "0")}-${hash}.webp`;
      writeFileSync(join(directory, name), bytes);
      atlases.push(`/dotmorph-assets/frames/${id}/${name}`);
    }
    const manifest = {
      version: 1, width: stream.width, height: stream.height, columns, rows,
      frameCount, fps, duration: Number(metadata.format.duration), atlases,
    };
    writeFileSync(join(directory, "sequence.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`${id}: ${frameCount} frames, ${atlases.length} image atlases`);
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}
