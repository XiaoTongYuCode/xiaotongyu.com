import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import sharp from "sharp";

function moduleUrl(file, replacements = {}) {
  const source = readFileSync(new URL(file, import.meta.url), "utf8").replace('import walkerCast from "../../../public/walkers/cast.json";', `const walkerCast = ${readFileSync(new URL("../public/walkers/cast.json", import.meta.url), "utf8")};`);
  let output = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  for (const [name, url] of Object.entries(replacements)) output = output.replace(`from "${name}"`, `from "${url}"`);
  return `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`;
}
const styles = moduleUrl("../app/_components/home/walkingStyles.ts");
const { SILHOUETTE_CAST, WALKER_ATLAS } = await import(moduleUrl("../app/_components/home/walkerAtlas.ts"));
const { createCrowd, CrowdMotion, projectPerson } = await import(moduleUrl("../app/_components/home/crowdSimulation.ts", { "./walkingStyles": styles }));
const calibration = JSON.parse(readFileSync(new URL("../public/walkers/calibration.json", import.meta.url)));

test("captured casts have complete, bounded alpha frames and a normal loop seam", async () => {
  for (const variant of SILHOUETTE_CAST) {
    const image = sharp(`public${variant.src}`);
    const metadata = await image.metadata();
    assert.equal(metadata.width, 704);
    assert.equal(metadata.height, 840);
    assert.equal(metadata.pages ?? 1, 1, "browser receives a static atlas, not video");
    const fallback = await sharp(`public${variant.src.replace(".webp", "-blurred.webp")}`).metadata();
    assert.equal(fallback.width, 352);
    assert.equal(fallback.height, 1680, "WebKit fallback contains all four baked blur banks at half resolution");
    const frames = [];
    for (let i = 0; i < WALKER_ATLAS.frameCount; i++) {
      const pixels = await image.clone().extract({ left: i % 8 * 88, top: Math.floor(i / 8) * 140, width: 88, height: 140 }).ensureAlpha().raw().toBuffer();
      const alpha = [];
      let occupied = 0;
      for (let y = 0; y < 140; y++) for (let x = 0; x < 88; x++) {
        const a = pixels[(y * 88 + x) * 4 + 3];
        alpha.push(a);
        if (a > 100) occupied++;
        if (x < 2 || x > 85 || y < 2 || y > 137) assert.ok(a < 5, "silhouette must not clip against a tile edge");
      }
      assert.ok(occupied > 900 && occupied < 4000, "full body must be present in every frame");
      frames.push(alpha);
    }
    const changes = frames.map((frame, i) => frame.reduce((sum, a, j) => sum + Math.abs(a - frames[(i + 1) % frames.length][j]), 0) / frame.length / 255);
    const median = [...changes].sort((a, b) => a - b)[24];
    assert.ok(changes.at(-1) < median * 2, `loop seam exceeded normal movement: ${variant.id}`);
    assert.ok(changes.at(-1) <= Math.max(...changes.slice(0, -1)), "wrap is no larger than an ordinary frame transition");
  }
});

test("periodic support calibration cancels estimated ankle travel", () => {
  const { smoothedAnkles: ankles, rootOffsets: offsets, supportLeg: support, bodyHeight, cyclePeriodSourceFrames: period, stridePerBodyHeight: stride } = calibration;
  assert.ok(Math.abs(offsets[0] - offsets.at(-1)) < 1e-8, "root correction must close at the seam");
  assert.ok(Math.max(...offsets) - Math.min(...offsets) < 5, "avoid replacing capture with a large body sway");
  for (let i = 0; i < period; i++) {
    const leg = support[i];
    const movement = ankles[(i + 1) % period][leg] - ankles[i][leg] + offsets[i + 1] - offsets[i] + stride * bodyHeight / period;
    assert.ok(Math.abs(movement) < 1e-8);
  }
  assert.equal(SILHOUETTE_CAST[0].stride, stride, "simulation must use measured capture stride");
});

test("screen displacement and gait stay synchronized at phone, tablet and desktop sizes", () => {
  for (const style of SILHOUETTE_CAST) for (const width of [390, 768, 1440, 2560]) {
    const person = { ...createCrowd(4, 72, SILHOUETTE_CAST)[0], id: 0, x: 0, z: 15, heading: 0, direction: 1, group: -1, phase: .4, height: style.height, stride: style.stride };
    const motion = new CrowdMotion([person]);
    motion.setGaitProjection(width);
    const first = projectPerson(person, motion.sample(0, 0), width, 430);
    motion.update(1);
    const last = projectPerson(person, motion.sample(0, 1), width, 430);
    const travelled = last.screenX - first.screenX;
    const gaitTravel = (last.gait - first.gait) / (Math.PI * 2) * first.bodyHeight * person.stride;
    assert.ok(Math.abs(travelled - gaitTravel) < .001, `stride drift at ${width}px: ${travelled - gaitTravel}`);
  }
});


test("six forms use four captures and independent periodic travel calibration", () => {
  assert.equal(SILHOUETTE_CAST.length, 6);
  assert.equal(new Set(SILHOUETTE_CAST.map(s => s.calibration)).size, 4);
  for (const variant of SILHOUETTE_CAST.slice(3)) {
    const c = JSON.parse(readFileSync(`public${variant.calibration}`));
    const { rootOffsets: offsets, supportDeltas: delta, cyclePeriodSourceFrames: period } = c;
    assert.equal(variant.stride, c.stridePerBodyHeight);
    assert.ok(Math.abs(offsets[0] - offsets.at(-1)) < 1e-8);
    assert.ok(Math.max(...offsets) - Math.min(...offsets) < 7, "root correction remains below 7% of body height");
    assert.ok(c.measuredGroundDeltas.filter(v => v !== null).length >= period * .6);
    for (let i=0; i<period; i++) assert.ok(Math.abs(delta[i]+offsets[i+1]-offsets[i]+c.stridePerBodyHeight*99/period)<1e-8);
    assert.ok(c.supportResidualP95PixelsAt99Height < 1.5, "raw ground flow remains near the fitted travel");
  }
});
