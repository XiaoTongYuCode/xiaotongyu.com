import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

async function moduleFromFile(file) {
  const source = readFileSync(`app/_components/datacurve-replica/${file}`, "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
    .replace('from "three"', `from "${import.meta.resolve("three")}"`)
    .replaceAll("import.meta.url", JSON.stringify(new URL(`../app/_components/datacurve-replica/${file}`, import.meta.url).href));
  return await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
}
const { parseDepthCodec, depthDecodeWindow, DepthWindowCache } = await moduleFromFile("depthCodecFormat.ts");
const { WebCodecsDepthSequence } = await moduleFromFile("WebCodecsDepthSequence.ts");
const catalog = JSON.parse(readFileSync("app/_components/datacurve-replica/encodedSources.generated.json"));
const bytes = (path) => Uint8Array.from(readFileSync(`public${path}`)).buffer;

test("all four codec packets retain native dimensions, frame counts, and a compact payload", () => {
  let total = 0;
  for (const [source, packed] of Object.entries(catalog)) {
    const original = JSON.parse(readFileSync(`public${source}`));
    const buffer = bytes(packed);
    total += buffer.byteLength;
    const { manifest, payload } = parseDepthCodec(buffer);
    for (const key of ["width", "height", "frameCount", "duration", "fps"]) assert.equal(manifest[key], original[key]);
    assert.ok(payload.byteLength > 0);
    assert.ok(manifest.samples.some((sample) => !sample.key));
    for (let frame = 0; frame < manifest.frameCount; frame++) {
      const window = depthDecodeWindow(manifest.samples, frame);
      assert.ok(manifest.samples[window.start].key);
      assert.ok(window.timestamps.size <= 24);
      assert.ok(window.end < manifest.frameCount);
    }
  }
  assert.ok(total < 2_600_000, `Unexpected packet size ${total}`);
});

test("rejects corrupt packet headers, truncation, and out-of-bounds sample offsets", () => {
  const valid = bytes(Object.values(catalog)[0]);
  assert.throws(() => parseDepthCodec(valid.slice(0, 7)));
  assert.throws(() => parseDepthCodec(valid.slice(0, valid.byteLength - 1)));
  const wrongHeader = valid.slice(0);
  new Uint8Array(wrongHeader)[0] = 0;
  assert.throws(() => parseDepthCodec(wrongHeader));
  const { manifest, payload } = parseDepthCodec(valid);
  manifest.samples[1].offset++;
  const json = new TextEncoder().encode(JSON.stringify(manifest));
  const damaged = new Uint8Array(8 + json.length + payload.length);
  damaged.set(new TextEncoder().encode("DPC1"));
  new DataView(damaged.buffer).setUint32(4, json.length, true);
  damaged.set(json, 8); damaged.set(payload, 8 + json.length);
  assert.throws(() => parseDepthCodec(damaged.buffer), /sample/);
});

test("a B frame decodes from its earlier key frame and includes future reference packets", () => {
  const samples = [0, 3, 1, 2, 6, 4, 5].map((timestamp, i) => ({ timestamp, key: i === 0 }));
  const result = depthDecodeWindow(samples, 1, 1);
  assert.deepEqual({ start: result.start, end: result.end, timestamps: [...result.timestamps] }, { start: 0, end: 2, timestamps: [1] });
});

test("frame cache closes evicted windows, retains a reverse-scroll hit, and releases all frames", () => {
  const closed = [];
  const frame = (id) => ({ close() { closed.push(id); } });
  const cache = new DepthWindowCache();
  cache.put(0, new Map([[0, frame(0)]]));
  cache.put(1, new Map([[1, frame(1)]]));
  assert.ok(cache.get(0));
  cache.put(2, new Map([[2, frame(2)]]));
  assert.deepEqual(closed, [1]);
  assert.equal(cache.size, 2);
  cache.clear();
  assert.deepEqual(closed.sort(), [0, 1, 2]);
  assert.equal(cache.size, 0);
});

function mockWorker(t) {
  const workers = [];
  class Worker {
    sent = [];
    terminated = false;
    constructor() { workers.push(this); }
    postMessage(message) { this.sent.push(message); }
    terminate() { this.terminated = true; }
    emit(data) { this.onmessage({ data }); }
  }
  for (const [key, value] of Object.entries({ isSecureContext: true, VideoDecoder: class {}, Worker })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    t.after(() => previous ? Object.defineProperty(globalThis, key, previous) : delete globalThis[key]);
  }
  return workers;
}
const manifest = { width: 640, height: 360, duration: 4, fps: 30, frameCount: 120 };
const fakeFrame = () => ({ closed: false, close() { this.closed = true; } });

test("seeks coalesce to the latest target and replaced or late transferred frames are closed", async (t) => {
  const workers = mockWorker(t);
  const sequence = new WebCodecsDepthSequence(() => assert.fail("unexpected failure"));
  t.after(() => sequence.dispose());
  const load = sequence.load("/sample.depth");
  const worker = workers[0];
  const first = fakeFrame();
  worker.emit({ type: "ready", frame: first, manifest });
  await load;
  sequence.seek(0.5);
  sequence.seek(0.1);
  sequence.seek(0.9);
  assert.equal(worker.sent.length, 2, "only one seek can be in flight");
  const second = fakeFrame();
  worker.emit({ type: "frame", frame: second, index: 59 });
  assert.equal(first.closed, true);
  assert.equal(worker.sent.at(-1).frame, 107, "discard intermediate targets");
  sequence.dispose();
  assert.ok(worker.terminated && second.closed);
  const late = fakeFrame();
  worker.emit({ type: "frame", frame: late, index: 107 });
  assert.ok(late.closed);
});

test("worker failures reject initialization or trigger fallback once after initialization", async (t) => {
  const workers = mockWorker(t);
  const reasons = [];
  const first = new WebCodecsDepthSequence((reason) => reasons.push(reason));
  const failed = first.load("/sample.depth");
  workers[0].emit({ type: "error", reason: "unsupported codec" });
  await assert.rejects(failed, /unsupported codec/);
  assert.ok(workers[0].terminated);
  first.dispose();
  const next = new WebCodecsDepthSequence((reason) => reasons.push(reason));
  t.after(() => next.dispose());
  const loaded = next.load("/sample.depth");
  workers[1].emit({ type: "ready", frame: fakeFrame(), manifest });
  await loaded;
  workers[1].emit({ type: "error", reason: "decoder failed" });
  workers[1].emit({ type: "error", reason: "duplicate" });
  assert.deepEqual(reasons, ["decoder failed"]);
  assert.ok(workers[1].terminated);
});
