import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import {
  DEFAULT_CHICKEN_MODEL_URL,
  type ChickenAnimationMode,
  type ChickenGlbRuntime,
  type CoinAssets,
  type GameStore,
  type ObstacleKind,
  type ObstacleModel,
  type RocketPickupModel,
} from "./gameModel";

function makeToonMaterial(color: string, roughness = 0.82) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0,
    flatShading: true,
  });
}

export function createRocketPickupModel(): RocketPickupModel {
  const root = new THREE.Group();
  root.name = "rocket-pickup-3d";

  const bodyMaterial = makeToonMaterial("#c12a2c", 0.68);
  const bandMaterial = makeToonMaterial("#fff4da", 0.72);
  const metalMaterial = makeToonMaterial("#2b2b2b", 0.58);
  const flameMaterial = makeToonMaterial("#ffb340", 0.56);
  const windowMaterial = makeToonMaterial("#6fd7ff", 0.5);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 1.72, 8), bodyMaterial);
  body.name = "rocket-pickup-body";
  body.rotation.x = Math.PI / 2;
  root.add(body);

  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.22, 8), bandMaterial);
  band.name = "rocket-pickup-band";
  band.rotation.x = Math.PI / 2;
  band.position.z = 0.16;
  root.add(band);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 8), metalMaterial);
  nose.name = "rocket-pickup-nose";
  nose.rotation.x = Math.PI / 2;
  nose.position.z = 1.1;
  root.add(nose);

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.28, 8), metalMaterial);
  nozzle.name = "rocket-pickup-nozzle";
  nozzle.rotation.x = Math.PI / 2;
  nozzle.position.z = -1.04;
  root.add(nozzle);

  const window = new THREE.Mesh(new THREE.DodecahedronGeometry(0.115, 0), windowMaterial);
  window.name = "rocket-pickup-window";
  window.position.set(0, 0.22, 0.35);
  window.scale.set(1, 0.36, 1);
  root.add(window);

  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 8), flameMaterial);
  flame.name = "rocket-pickup-flame";
  flame.rotation.x = -Math.PI / 2;
  flame.position.z = -1.35;
  root.add(flame);

  const makeFin = (x: number) => {
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 4), bandMaterial);
    fin.position.set(x, -0.16, -0.62);
    fin.rotation.set(Math.PI / 2, 0, Math.PI / 4);
    fin.scale.set(0.76, 0.92, 0.54);
    return fin;
  };
  root.add(makeFin(-0.23));
  root.add(makeFin(0.23));

  return { root, flame };
}

export function createObstacleModel(kind: ObstacleKind): ObstacleModel {
  const root = new THREE.Group();
  root.name = `${kind}-obstacle-3d`;

  if (kind === "spike") {
    const spikeMaterial = makeToonMaterial("#2f343c", 0.72);
    const spikeSideMaterial = makeToonMaterial("#171b22", 0.82);
    const highlightMaterial = makeToonMaterial("#737984", 0.7);
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 4), [
      spikeSideMaterial,
      spikeMaterial,
    ]);
    spike.name = "spike-body";
    spike.rotation.y = Math.PI / 4;
    root.add(spike);

    const highlight = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.72, 3), highlightMaterial);
    highlight.name = "spike-highlight";
    highlight.position.set(0.12, 0.04, 0.28);
    highlight.rotation.set(0.1, -0.18, -0.18);
    highlight.scale.set(0.42, 0.9, 0.32);
    root.add(highlight);
  } else {
    const topMaterial = makeToonMaterial("#bd8750", 0.84);
    const frontMaterial = makeToonMaterial("#81502b", 0.9);
    const sideMaterial = makeToonMaterial("#593018", 0.92);
    const panelMaterial = makeToonMaterial("#4a240f", 0.96);
    const edgeMaterial = makeToonMaterial("#9b6538", 0.86);
    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.58), [
      sideMaterial,
      sideMaterial,
      topMaterial,
      frontMaterial,
      frontMaterial,
      sideMaterial,
    ]);
    box.name = "crate-body";
    root.add(box);

    const topLip = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.12, 0.62), edgeMaterial);
    topLip.name = "crate-top-lip";
    topLip.position.set(0, 0.42, 0.04);
    root.add(topLip);

    const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.18, 0.03), panelMaterial);
    frontPanel.name = "crate-front-panel";
    frontPanel.position.set(0.02, -0.18, 0.31);
    root.add(frontPanel);

    const sidePanel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.48, 0.032), panelMaterial);
    sidePanel.name = "crate-side-panel";
    sidePanel.position.set(0.48, -0.06, 0.03);
    sidePanel.rotation.y = Math.PI / 2;
    root.add(sidePanel);
  }

  return { root, kind };
}

export function createChickenModel() {
  const root = new THREE.Group();
  root.name = "runner-chicken";

  const bodyMaterial = makeToonMaterial("#e3e8dc");
  const bellyMaterial = makeToonMaterial("#5f6860");
  const wingMaterial = makeToonMaterial("#d7ded6");
  const combMaterial = makeToonMaterial("#bd2325");
  const beakMaterial = makeToonMaterial("#c77a16");
  const eyeMaterial = makeToonMaterial("#070707", 0.55);
  const mouthInteriorMaterial = makeToonMaterial("#180b08", 0.72);
  const tongueMaterial = makeToonMaterial("#c93624", 0.66);
  const rocketBodyMaterial = makeToonMaterial("#c12a2c", 0.68);
  const rocketBandMaterial = makeToonMaterial("#fff4da", 0.72);
  const rocketMetalMaterial = makeToonMaterial("#2b2b2b", 0.58);
  const rocketFlameMaterial = makeToonMaterial("#ffb340", 0.56);

  const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.96, 0), bodyMaterial);
  body.scale.set(1.08, 1.02, 0.92);
  body.position.y = -0.1;
  root.add(body);

  const lowerBodyShade = new THREE.Mesh(new THREE.DodecahedronGeometry(0.66, 0), bellyMaterial);
  lowerBodyShade.name = "lower-body-shade";
  lowerBodyShade.position.set(0, -0.6, 0.08);
  lowerBodyShade.scale.set(1.24, 0.42, 0.88);
  root.add(lowerBodyShade);

  const belly = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.68, 5), bellyMaterial);
  belly.name = "belly";
  belly.rotation.x = Math.PI;
  belly.position.set(0, -0.47, 0.43);
  belly.scale.set(1.2, 0.84, 0.36);
  root.add(belly);

  const flankFeathers = new THREE.Group();
  flankFeathers.name = "flank-feathers";
  const makeFlankFeather = (x: number, z: number, rotationZ: number) => {
    const feather = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.48, 4), bellyMaterial);
    feather.position.set(x, -0.58, z);
    feather.rotation.set(Math.PI, 0, rotationZ);
    feather.scale.set(0.82, 0.78, 0.45);
    return feather;
  };
  flankFeathers.add(makeFlankFeather(-0.34, 0.42, -0.18));
  flankFeathers.add(makeFlankFeather(0.34, 0.42, 0.18));
  flankFeathers.visible = false;
  root.add(flankFeathers);

  const breastFeathers = new THREE.Group();
  breastFeathers.name = "breast-feathers";
  const makeBreastTriangle = (x: number, width: number, height: number) => {
    const shape = new THREE.Shape();
    shape.moveTo(-width / 2, height / 2);
    shape.lineTo(width / 2, height / 2);
    shape.lineTo(0, -height / 2);
    shape.closePath();
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), bellyMaterial);
    mesh.position.set(x, -0.68, 0.62);
    mesh.rotation.x = -0.16;
    mesh.scale.set(0.78, 0.72, 1);
    return mesh;
  };
  breastFeathers.add(makeBreastTriangle(-0.28, 0.32, 0.36));
  breastFeathers.add(makeBreastTriangle(0, 0.38, 0.42));
  breastFeathers.add(makeBreastTriangle(0.28, 0.32, 0.36));
  root.add(breastFeathers);

  const leftWing = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), wingMaterial);
  leftWing.name = "left-wing";
  leftWing.scale.set(0.78, 1.42, 0.54);
  leftWing.position.set(-0.8, -0.06, 0.02);
  leftWing.rotation.z = 0.16;
  root.add(leftWing);

  const rightWing = new THREE.Mesh(new THREE.DodecahedronGeometry(0.36, 0), wingMaterial);
  rightWing.name = "right-wing";
  rightWing.scale.set(0.78, 1.42, 0.54);
  rightWing.position.set(0.8, -0.06, 0.02);
  rightWing.rotation.z = -0.16;
  root.add(rightWing);

  const tail = new THREE.Group();
  tail.name = "tail";
  const makeTailFeather = (x: number, y: number, rotationZ: number) => {
    const feather = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), wingMaterial);
    feather.scale.set(0.82, 0.5, 1.26);
    feather.position.set(x, y, -0.76);
    feather.rotation.set(0.2, -0.32, rotationZ);
    return feather;
  };
  tail.add(makeTailFeather(-0.16, -0.3, -0.28));
  tail.add(makeTailFeather(0.02, -0.24, 0.04));
  tail.add(makeTailFeather(0.18, -0.31, 0.28));
  root.add(tail);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.31, 0.76, 4), beakMaterial);
  beak.name = "beak";
  beak.rotation.x = Math.PI / 2;
  beak.rotation.z = Math.PI / 4;
  beak.position.set(0, 0.12, 0.9);
  beak.scale.set(1.08, 0.74, 0.62);
  root.add(beak);

  const lowerBeak = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.54, 4), beakMaterial);
  lowerBeak.name = "lower-beak";
  lowerBeak.rotation.x = Math.PI / 2;
  lowerBeak.rotation.z = Math.PI / 4;
  lowerBeak.position.set(0, -0.08, 0.87);
  lowerBeak.scale.set(0.86, 0.44, 0.46);
  root.add(lowerBeak);

  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.035), mouthInteriorMaterial);
  mouth.name = "mouth";
  mouth.position.set(0, -0.01, 1.1);
  mouth.rotation.x = -0.12;
  mouth.scale.set(1, 0.74, 1);
  root.add(mouth);

  const tongue = new THREE.Mesh(new THREE.DodecahedronGeometry(0.11, 0), tongueMaterial);
  tongue.name = "tongue";
  tongue.position.set(0, -0.08, 1.12);
  tongue.scale.set(1.24, 0.42, 0.5);
  root.add(tongue);

  const leftEye = new THREE.Mesh(new THREE.DodecahedronGeometry(0.085, 0), eyeMaterial);
  leftEye.name = "left-eye";
  leftEye.position.set(-0.28, 0.38, 0.78);
  root.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.DodecahedronGeometry(0.085, 0), eyeMaterial);
  rightEye.name = "right-eye";
  rightEye.position.set(0.28, 0.38, 0.78);
  root.add(rightEye);

  const comb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), combMaterial);
  comb.name = "comb";
  comb.scale.set(0.86, 1.34, 0.62);
  comb.position.set(0.02, 0.94, -0.04);
  comb.rotation.set(-0.2, 0.08, -0.1);
  root.add(comb);

  const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.54, 5), beakMaterial);
  leftLeg.name = "left-leg";
  leftLeg.position.set(-0.23, -0.88, 0.06);
  leftLeg.rotation.z = -0.2;
  root.add(leftLeg);

  const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.54, 5), beakMaterial);
  rightLeg.name = "right-leg";
  rightLeg.position.set(0.23, -0.88, 0.06);
  rightLeg.rotation.z = 0.2;
  root.add(rightLeg);

  const leftFoot = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.32, 4), beakMaterial);
  leftFoot.name = "left-foot";
  leftFoot.position.set(-0.25, -1.14, 0.2);
  leftFoot.rotation.set(Math.PI / 2, 0, Math.PI / 4);
  leftFoot.scale.set(1.0, 0.92, 0.62);
  root.add(leftFoot);

  const rightFoot = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.32, 4), beakMaterial);
  rightFoot.name = "right-foot";
  rightFoot.position.set(0.25, -1.14, 0.2);
  rightFoot.rotation.set(Math.PI / 2, 0, Math.PI / 4);
  rightFoot.scale.set(1.0, 0.92, 0.62);
  root.add(rightFoot);

  const callWaveMaterial = new THREE.MeshBasicMaterial({
    color: "#f5c55e",
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const callWave = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.012, 6, 28), callWaveMaterial);
  callWave.name = "call-wave";
  callWave.position.set(0, -0.02, 1.38);
  callWave.rotation.x = Math.PI / 2;
  callWave.visible = false;
  root.add(callWave);

  const callWaveSecondary = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.01, 6, 28),
    callWaveMaterial.clone(),
  );
  callWaveSecondary.name = "call-wave-secondary";
  callWaveSecondary.position.set(0, -0.02, 1.42);
  callWaveSecondary.rotation.x = Math.PI / 2;
  callWaveSecondary.visible = false;
  root.add(callWaveSecondary);

  const rocket = new THREE.Group();
  rocket.name = "boost-rocket";
  rocket.visible = false;
  rocket.position.set(0, -1.08, -0.02);

  const rocketBody = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 1.72, 8), rocketBodyMaterial);
  rocketBody.name = "rocket-body";
  rocketBody.rotation.x = Math.PI / 2;
  rocket.add(rocketBody);

  const rocketBand = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.22, 8), rocketBandMaterial);
  rocketBand.name = "rocket-band";
  rocketBand.rotation.x = Math.PI / 2;
  rocketBand.position.z = 0.16;
  rocket.add(rocketBand);

  const rocketNose = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 8), rocketMetalMaterial);
  rocketNose.name = "rocket-nose";
  rocketNose.rotation.x = Math.PI / 2;
  rocketNose.position.z = 1.1;
  rocket.add(rocketNose);

  const rocketNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.28, 8), rocketMetalMaterial);
  rocketNozzle.name = "rocket-nozzle";
  rocketNozzle.rotation.x = Math.PI / 2;
  rocketNozzle.position.z = -1.04;
  rocket.add(rocketNozzle);

  const rocketFlame = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.58, 8), rocketFlameMaterial);
  rocketFlame.name = "rocket-flame";
  rocketFlame.rotation.x = -Math.PI / 2;
  rocketFlame.position.z = -1.42;
  rocket.add(rocketFlame);

  const makeRocketFin = (x: number) => {
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.34, 4), rocketBandMaterial);
    fin.position.set(x, -0.16, -0.62);
    fin.rotation.set(Math.PI / 2, 0, Math.PI / 4);
    fin.scale.set(0.76, 0.92, 0.54);
    return fin;
  };
  rocket.add(makeRocketFin(-0.23));
  rocket.add(makeRocketFin(0.23));
  root.add(rocket);

  return {
    root,
    parts: {
      body,
      lowerBodyShade,
      belly,
      flankFeathers,
      leftWing,
      rightWing,
      tail,
      leftLeg,
      rightLeg,
      leftFoot,
      rightFoot,
      comb,
      beak,
      lowerBeak,
      mouth,
      tongue,
      leftEye,
      rightEye,
      breastFeathers,
      callWave,
      callWaveSecondary,
      rocket,
      rocketFlame,
    },
  };
}

function createCoinTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(88, 70, 18, 128, 128, 116);
    gradient.addColorStop(0, "#fff8ba");
    gradient.addColorStop(0.5, "#ffbd25");
    gradient.addColorStop(1, "#b96a08");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(128, 128, 116, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(128, 70, 4, 0.38)";
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.fillStyle = "rgba(92, 48, 0, 0.66)";
    ctx.font = "bold 72px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("AI", 128, 133);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createCoinAssets(): CoinAssets {
  const texture = createCoinTexture();
  const faceMaterial = new THREE.MeshStandardMaterial({
    color: "#ffc439",
    map: texture,
    roughness: 0.38,
    metalness: 0.32,
    flatShading: true,
  });
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: "#c8790d",
    roughness: 0.48,
    metalness: 0.22,
    flatShading: true,
  });
  return {
    geometry: new THREE.CylinderGeometry(0.48, 0.48, 0.24, 32),
    materials: [edgeMaterial, faceMaterial, faceMaterial],
    texture,
  };
}

export function createCoinModel(assets: CoinAssets) {
  const root = new THREE.Group();
  root.name = "shared-rotating-coin-model";
  const coin = new THREE.Mesh(assets.geometry, assets.materials);
  coin.name = "shared-rotating-coin-mesh";
  coin.rotation.x = Math.PI / 2;
  root.add(coin);
  return root;
}

export function disposeCoinAssets(assets: CoinAssets) {
  assets.geometry.dispose();
  assets.texture.dispose();
  for (const material of assets.materials) {
    material.dispose();
  }
}

export function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) {
          value.dispose();
        }
      }
      material.dispose();
    }
  });
}

export async function loadOptionalChickenModel() {
  try {
    const manifest = await fetch("/game/1/chicken-model.json");
    let url = DEFAULT_CHICKEN_MODEL_URL;
    if (manifest.ok) {
      const data = await manifest.json() as { url?: unknown };
      if (typeof data.url === "string" && data.url) {
        url = data.url;
      }
    }
    const gltf = await new GLTFLoader().loadAsync(url);
    return {
      scene: gltf.scene,
      animations: gltf.animations,
    };
  } catch {
    return null;
  }
}

export function prepareLoadedChickenModel(model: THREE.Group) {
  model.name = "loaded-chicken-glb";
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.frustumCulled = false;
    child.castShadow = false;
    child.receiveShadow = false;
  });

  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  if (size.y <= 0) return;

  const center = bounds.getCenter(new THREE.Vector3());
  const scale = 2.26 / size.y;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -bounds.min.y * scale - 1.12, -center.z * scale);
}

function getChickenClipName(mode: ChickenAnimationMode, clipNames: string[]) {
  const patternsByMode: Record<ChickenAnimationMode, string[]> = {
    idle: ["idle"],
    "landing-call": ["idle"],
    jump: ["run"],
    boost: ["idle"],
    run: ["run"],
  };
  const patterns = patternsByMode[mode];
  const match = clipNames.find((clipName) => {
    const name = clipName.toLowerCase();
    return patterns.some((pattern) => name.includes(pattern.toLowerCase()));
  });
  return match ?? clipNames[0] ?? null;
}

export function applyChickenGlbAnimation(runtime: ChickenGlbRuntime, mode: ChickenAnimationMode, store: GameStore, dt: number) {
  const clipName = getChickenClipName(mode, [...runtime.actions.keys()]);
  if (!clipName) {
    store.chickenAnimationClip = null;
    return;
  }

  if (runtime.currentMode !== mode) {
    const nextAction = runtime.actions.get(clipName);
    if (nextAction) {
      if (mode === "idle") {
        for (const action of runtime.actions.values()) {
          action.stop();
          action.enabled = false;
        }
      }
      nextAction.enabled = true;
      nextAction.reset();
      nextAction.setEffectiveTimeScale(mode === "run" || mode === "jump" ? 1.16 : 1);
      nextAction.setEffectiveWeight(1);
      nextAction.setLoop(THREE.LoopRepeat, Infinity);
      if (mode !== "idle" && runtime.currentAction && runtime.currentAction !== nextAction) {
        runtime.currentAction.crossFadeTo(nextAction, mode === "landing-call" ? 0.18 : 0.12, false);
      }
      nextAction.play();
      runtime.currentAction = nextAction;
      runtime.currentMode = mode;
    }
  } else if (runtime.currentAction) {
    runtime.currentAction.setEffectiveTimeScale(mode === "run" || mode === "jump" ? 1.16 : 1);
  }

  runtime.mixer.update(dt);
  store.chickenAnimationClip = clipName;
}
