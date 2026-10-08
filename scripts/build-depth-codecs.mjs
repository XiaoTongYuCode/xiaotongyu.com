// Offline packaging only: preserve the original H.264 samples without transcoding.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const sources = [
  ["analyst-copilot", "depth-clip-02.mp4"],
  ["prototype-making", "depth-clip-03-tooling.mp4"],
  ["knowledge-structure", "depth-clip-04.mp4"],
  ["industry-map", "depth-clip-05.mp4"],
];
function probe(path, args) {
  const result = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", ...args, "-of", "json", path], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw result.error || new Error(result.stderr);
  return JSON.parse(result.stdout);
}
mkdirSync("public/dotmorph-assets/codecs", { recursive: true });
const catalog = {};
for (const [id, file] of sources) {
  const path = `assets/dotmorph-source/${file}`;
  const bytes = readFileSync(path);
  const stream = probe(path, ["-show_streams", "-show_data"]).streams[0];
  if (stream.codec_name !== "h264") throw new Error(`Unsupported codec: ${file}`);
  const description = Buffer.from(stream.extradata.split("\n").filter((line) => line.includes(": "))
    .map((line) => line.split(": ")[1].split("  ")[0].replace(/\s/g, "")).join(""), "hex");
  const packets = probe(path, ["-show_packets"]).packets;
  const frameManifest = JSON.parse(readFileSync(`public/dotmorph-assets/frames/${id}/sequence.json`, "utf8"));
  let offset = 0;
  const payloads = [];
  const samples = packets.map((packet) => {
    const size = Number(packet.size);
    const position = Number(packet.pos);
    const sample = { offset, size, timestamp: Math.round(Number(packet.pts_time) * 1e6),
      duration: Math.round(Number(packet.duration_time) * 1e6), key: packet.flags.includes("K") };
    if (!Number.isSafeInteger(position) || position < 0 || position + size > bytes.length) throw new Error("Invalid packet range");
    payloads.push(bytes.subarray(position, position + size));
    offset += size;
    return sample;
  });
  const metadata = Buffer.from(JSON.stringify({ version: 1, codec: `avc1.${description.subarray(1, 4).toString("hex")}`,
    description: [...description], width: stream.width, height: stream.height,
    fps: frameManifest.fps, duration: frameManifest.duration, frameCount: samples.length, samples }));
  const header = Buffer.alloc(8);
  header.write("DPC1");
  header.writeUInt32LE(metadata.length, 4);
  const packed = Buffer.concat([header, metadata, ...payloads]);
  const hash = createHash("sha256").update(packed).digest("hex").slice(0, 12);
  const url = `/dotmorph-assets/codecs/${id}-${hash}.depth`;
  writeFileSync(`public${url}`, packed);
  catalog[`/dotmorph-assets/frames/${id}/sequence.json`] = url;
  console.log(`${id}: ${samples.length} frames, ${packed.length} bytes (original ${bytes.length})`);
}
writeFileSync("app/_components/datacurve-replica/encodedSources.generated.json", `${JSON.stringify(catalog, null, 2)}\n`);
