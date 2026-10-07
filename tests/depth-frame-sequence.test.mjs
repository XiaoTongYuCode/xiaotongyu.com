import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import * as THREE from "three";
import sharp from "sharp";

const source = readFileSync(new URL("../app/_components/datacurve-replica/DepthFrameSequence.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
  .replace('from "three"', `from "${import.meta.resolve("three")}"`);
const { DepthFrameSequence, parseDepthFrameManifest, depthFrameAtProgress, depthFrameRect } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const config = JSON.parse(readFileSync("public/dotmorph-assets/depth-scenes.json", "utf8"));
const manifest = JSON.parse(readFileSync(`public${config.clips[0].src}`, "utf8"));
const tick = () => new Promise((resolve) => setImmediate(resolve));

test("all deployed sources are static image atlases, with every original frame", async () => {
  const expectedFrames = [120, 61, 145, 119];
  for (const [index, clip] of config.clips.entries()) {
    const sequence = parseDepthFrameManifest(JSON.parse(readFileSync(`public${clip.src}`, "utf8")));
    assert.equal(sequence.frameCount, expectedFrames[index]);
    for (const src of sequence.atlases) {
      const metadata = await sharp(`public${src}`).metadata();
      assert.equal(metadata.format, "webp");
      assert.equal(metadata.width, sequence.width * sequence.columns);
      assert.equal(metadata.height, sequence.height * sequence.rows);
      assert.ok(!metadata.pages || metadata.pages === 1, "animated images would reintroduce a media resource");
    }
  }
  for (const name of ["02", "03-tooling", "04", "05"]) {
    assert.ok(!existsSync(`public/dotmorph-assets/depth-clip-${name}.mp4`));
    assert.ok(existsSync(`assets/dotmorph-source/depth-clip-${name}.mp4`));
  }
  assert.throws(() => parseDepthFrameManifest({ ...manifest, atlases: ["/source.mp4"] }));
});

test("scrubbing clamps to valid frames and tile edges cannot sample a neighboring frame", () => {
  assert.equal(depthFrameAtProgress(manifest, -1), 0);
  assert.equal(depthFrameAtProgress(manifest, 0.5), 59);
  assert.equal(depthFrameAtProgress(manifest, 2), 118);
  for (let frame = 0; frame < manifest.frameCount; frame++) {
    const [x, y, w, h] = depthFrameRect(manifest, frame);
    const column = frame % manifest.columns;
    const row = Math.floor((frame % 16) / manifest.columns);
    assert.ok(x > column / manifest.columns);
    assert.ok(x + w < (column + 1) / manifest.columns);
    assert.ok(y > (manifest.rows - row - 1) / manifest.rows);
    assert.ok(y + h < (manifest.rows - row) / manifest.rows);
  }
});

function mockImages(t) {
  const pending = [];
  const requested = [];
  const disposed = [];
  t.mock.method(globalThis, "fetch", async () => ({ ok: true, json: async () => manifest }));
  t.mock.method(THREE.TextureLoader.prototype, "load", (src, loaded, _progress, error) => {
    const texture = new THREE.Texture();
    texture.image = { naturalWidth: 2560, naturalHeight: 1440 };
    texture.addEventListener("dispose", () => disposed.push(texture));
    pending.push({ src, texture, loaded, error });
    requested.push(src);
    return texture;
  });
  return { requested, disposed, pending, complete(index = 0) {
    const [request] = pending.splice(index, 1);
    request.loaded(request.texture);
    return request.texture;
  } };
}

test("fast forward and backward scrolling releases old atlases and late image loads", async (t) => {
  const images = mockImages(t);
  const sequence = new DepthFrameSequence();
  t.after(() => sequence.dispose());
  const load = sequence.load(config.clips[0].src);
  await tick();
  const first = images.complete();
  await load;
  sequence.seek(0.3); // Skip directly to atlas 3; atlas 4 is prefetched.
  assert.equal(sequence.texture, first, "retain a frame until the destination image decodes");
  const forward = images.complete();
  images.complete();
  await tick();
  assert.equal(sequence.texture, forward);
  assert.ok(images.disposed.includes(first));
  sequence.seek(0);
  const backward = images.complete();
  await tick();
  assert.equal(sequence.texture, backward);
  assert.ok(images.disposed.includes(forward));
  sequence.seek(0.8);
  const late = images.pending.map((request) => request.texture);
  sequence.dispose();
  while (images.pending.length) images.complete();
  await tick();
  assert.equal(sequence.texture, null);
  assert.ok(late.every((texture) => images.disposed.includes(texture)));
});

test("a missing atlas keeps the last frame without repeated failed requests", async (t) => {
  const images = mockImages(t);
  const sequence = new DepthFrameSequence();
  t.after(() => sequence.dispose());
  const load = sequence.load(config.clips[0].src);
  await tick();
  const first = images.complete();
  await load;
  sequence.seek(0.15);
  images.pending.shift().error(new Error("404"));
  images.complete();
  await tick();
  const requests = images.requested.length;
  for (let frame = 0; frame < 60; frame++) sequence.seek(0.15);
  assert.equal(sequence.texture, first);
  assert.equal(images.requested.length, requests);
});

test("an error from an evicted prefetch cannot poison a later visit to that atlas", async (t) => {
  const images = mockImages(t);
  const sequence = new DepthFrameSequence();
  t.after(() => sequence.dispose());
  const load = sequence.load(config.clips[0].src);
  await tick();
  images.complete();
  await load;
  sequence.seek(0); // Prefetch atlas 2, then leave the scene before it loads.
  const stale = images.pending.shift();
  sequence.pause();
  stale.error(new Error("old request failed"));
  await tick();
  sequence.seek(0.15);
  assert.equal(images.requested.filter((src) => src === stale.src).length, 2);
  while (images.pending.length) images.complete();
  await tick();
  assert.notEqual(sequence.texture, stale.texture);
  assert.deepEqual(sequence.frameRect.toArray(), [...depthFrameRect(manifest, 17)]);
});
