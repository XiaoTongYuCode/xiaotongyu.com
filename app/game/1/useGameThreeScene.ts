import { type Dispatch, type RefObject, type SetStateAction, useEffect } from "react";
import * as THREE from "three";

import {
  GROUND_Y,
  HEIGHT,
  INTRO_CHICKEN_Y,
  SIDE_YAW,
  WIDTH,
  clamp,
  easeInOutCubic,
  easeOutCubic,
  getChickenAnimationState,
  getScoreTagTarget,
  getTerrainBands,
  lerp,
  mergeTerrainBands,
  type ChickenGlbRuntime,
  type GameStore,
  type ObstacleModel,
  type RocketPickupModel,
} from "./gameModel";
import {
  applyChickenGlbAnimation,
  createChickenModel,
  createCoinAssets,
  createCoinModel,
  createObstacleModel,
  createRocketPickupModel,
  disposeCoinAssets,
  disposeObject3D,
  loadOptionalChickenModel,
  prepareLoadedChickenModel,
} from "./gameThreeAssets";

type ThreeSceneRefs = {
  threeLayerRef: RefObject<HTMLDivElement | null>;
  titleCoinSlotRef: RefObject<HTMLSpanElement | null>;
  scorePillRef: RefObject<HTMLButtonElement | null>;
  storeRef: RefObject<GameStore>;
  setGameModelReady: Dispatch<SetStateAction<boolean>>;
};

export function useGameThreeScene({
  threeLayerRef,
  titleCoinSlotRef,
  scorePillRef,
  storeRef,
  setGameModelReady,
}: ThreeSceneRefs) {
  useEffect(() => {
    const host = threeLayerRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.HemisphereLight(0xfff7df, 0x5e6670, 2.2);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 2.7);
    key.position.set(-2.8, 4.4, 5.8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd6a1, 1.1);
    rim.position.set(3.4, 1.5, 2.3);
    scene.add(rim);

    const terrainGroup = new THREE.Group();
    terrainGroup.name = "terrain-3d-models";
    scene.add(terrainGroup);
    const terrainTopMaterial = new THREE.MeshStandardMaterial({
      color: "#c47a3a",
      roughness: 0.86,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainFrontMaterial = new THREE.MeshStandardMaterial({
      color: "#753012",
      roughness: 0.9,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainSideMaterial = new THREE.MeshStandardMaterial({
      color: "#3f190c",
      roughness: 0.92,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainShadeMaterial = new THREE.MeshStandardMaterial({
      color: "#5e260f",
      roughness: 0.92,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainLipMaterial = new THREE.MeshStandardMaterial({
      color: "#8b3d18",
      roughness: 0.88,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainRailMaterial = new THREE.MeshStandardMaterial({
      color: "#d08a4a",
      roughness: 0.8,
      metalness: 0,
      flatShading: false,
      side: THREE.DoubleSide,
    });
    const terrainDetailMaterial = new THREE.MeshStandardMaterial({
      color: "#421708",
      roughness: 0.96,
      metalness: 0,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    const terrainFaceShadowMaterial = new THREE.MeshStandardMaterial({
      color: "#4c1d0c",
      roughness: 0.96,
      metalness: 0,
      flatShading: false,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });
    const terrainShadowMaterial = new THREE.MeshBasicMaterial({
      color: "#4a2a14",
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const terrainMaterials: THREE.Material[] = [
      terrainTopMaterial,
      terrainLipMaterial,
      terrainFrontMaterial,
      terrainSideMaterial,
      terrainShadeMaterial,
      terrainRailMaterial,
      terrainDetailMaterial,
      terrainFaceShadowMaterial,
    ];
    const terrainMesh = new THREE.Mesh(new THREE.BufferGeometry(), terrainMaterials);
    terrainMesh.name = "terrain-single-extruded-model";
    terrainMesh.renderOrder = -2;
    terrainGroup.add(terrainMesh);
    const terrainShadowMesh = new THREE.Mesh(new THREE.BufferGeometry(), terrainShadowMaterial);
    terrainShadowMesh.name = "terrain-contact-shadows";
    terrainShadowMesh.renderOrder = -1;
    terrainGroup.add(terrainShadowMesh);

    const chicken = createChickenModel();
    scene.add(chicken.root);
    const proceduralChickenParts: THREE.Object3D[] = [
      chicken.parts.body,
      chicken.parts.lowerBodyShade,
      chicken.parts.belly,
      chicken.parts.flankFeathers,
      chicken.parts.leftWing,
      chicken.parts.rightWing,
      chicken.parts.tail,
      chicken.parts.leftLeg,
      chicken.parts.rightLeg,
      chicken.parts.leftFoot,
      chicken.parts.rightFoot,
      chicken.parts.comb,
      chicken.parts.beak,
      chicken.parts.lowerBeak,
      chicken.parts.mouth,
      chicken.parts.tongue,
      chicken.parts.leftEye,
      chicken.parts.rightEye,
      chicken.parts.breastFeathers,
    ];
    let cancelledModelLoad = false;
    let chickenGlbRuntime: ChickenGlbRuntime | null = null;
    void loadOptionalChickenModel().then((loadedChicken) => {
      if (cancelledModelLoad) return;
      if (!loadedChicken) {
        setGameModelReady(true);
        return;
      }
      prepareLoadedChickenModel(loadedChicken.scene);
      chicken.root.add(loadedChicken.scene);
      const mixer = new THREE.AnimationMixer(loadedChicken.scene);
      const actions = new Map<string, THREE.AnimationAction>();
      for (const clip of loadedChicken.animations) {
        actions.set(clip.name, mixer.clipAction(clip));
      }
      chickenGlbRuntime = {
        mixer,
        actions,
        currentAction: null,
        currentMode: null,
        model: loadedChicken.scene,
        clipCount: loadedChicken.animations.length,
      };
      storeRef.current.chickenModelSource = "glb";
      storeRef.current.chickenAnimationClipCount = loadedChicken.animations.length;
      applyChickenGlbAnimation(chickenGlbRuntime, "idle", storeRef.current, 0);
      for (const part of proceduralChickenParts) {
        part.visible = false;
      }
      setGameModelReady(true);
    });
    const sharedRotatingCoinAssets = createCoinAssets();
    const titleCoin = createCoinModel(sharedRotatingCoinAssets);
    titleCoin.visible = false;
    scene.add(titleCoin);
    const coinMeshes = new Map<number, THREE.Group>();
    const coinEffectMeshes = new Map<number, THREE.Group>();
    const rocketPickupMeshes = new Map<number, RocketPickupModel>();
    const obstacleMeshes = new Map<number, ObstacleModel>();

    const resize = () => {
      const rect = host.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / Math.max(1, rect.height);
      camera.updateProjectionMatrix();
    };

    const screenToScene = (x: number, y: number) => {
      const rect = host.getBoundingClientRect();
      const distance = camera.position.z;
      const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
      const width = height * camera.aspect;
      return {
        x: (x / WIDTH - 0.5) * width,
        y: -(y / HEIGHT - 0.5) * height,
        rect,
      };
    };

    const clientToScene = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      const logicalX = ((clientX - rect.left) / Math.max(1, rect.width)) * WIDTH;
      const logicalY = ((clientY - rect.top) / Math.max(1, rect.height)) * HEIGHT;
      return screenToScene(logicalX, logicalY);
    };

    const terrainPoint = (x: number, y: number, z: number) => {
      const point = screenToScene(x, y);
      return new THREE.Vector3(point.x, point.y, z);
    };

    const createTerrainModelGeometry = (
      bands: Array<{ x: number; y: number; width: number; height: number }>,
      worldOffset: number,
    ) => {
      const geometry = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const groups: Array<{ start: number; count: number; materialIndex: number }> = [];
      const push = (point: THREE.Vector3) => vertices.push(point.x, point.y, point.z);
      const addQuad = (
        a: THREE.Vector3,
        b: THREE.Vector3,
        c: THREE.Vector3,
        d: THREE.Vector3,
        materialIndex: number,
      ) => {
        const start = vertices.length / 3;
        push(a);
        push(b);
        push(c);
        push(a);
        push(c);
        push(d);
        groups.push({ start, count: 6, materialIndex });
      };
      const addRoundedRail = (
        x1: number,
        x2: number,
        centerY: number,
        centerZ: number,
        radiusY: number,
        radiusZ: number,
      ) => {
        const segments = 8;
        for (let i = 0; i < segments; i += 1) {
          const angleA = (i / segments) * Math.PI;
          const angleB = ((i + 1) / segments) * Math.PI;
          const yA = centerY - Math.sin(angleA) * radiusY;
          const yB = centerY - Math.sin(angleB) * radiusY;
          const zA = centerZ + Math.cos(angleA) * radiusZ;
          const zB = centerZ + Math.cos(angleB) * radiusZ;
          addQuad(
            terrainPoint(x1, yA, zA),
            terrainPoint(x2, yA, zA),
            terrainPoint(x2, yB, zB),
            terrainPoint(x1, yB, zB),
            5,
          );
        }
      };
      const addFrontBrick = (x: number, y: number, width: number, height: number, z: number) => {
        addQuad(
          terrainPoint(x, y, z),
          terrainPoint(x + width, y, z),
          terrainPoint(x + width, y + height, z),
          terrainPoint(x, y + height, z),
          6,
        );
      };
      const addDiagonalFaceShadow = (x: number, y: number, width: number, height: number, z: number) => {
        addQuad(
          terrainPoint(x, y, z),
          terrainPoint(x + width, y + 12, z),
          terrainPoint(x + width - 22, y + height, z),
          terrainPoint(x - 22, y + height - 12, z),
          7,
        );
      };

      const topDepth = 24;
      const lipHeight = 18;
      const bottom = HEIGHT + 96;
      const backZ = -0.68;
      const frontZ = -0.14;
      const lipZ = -0.02;

      for (const band of bands) {
        const x1 = band.x;
        const x2 = band.x + band.width;
        const topY = band.y;
        const blockBottom = bottom;
        const topBackLeft = terrainPoint(x1, topY, backZ);
        const topBackRight = terrainPoint(x2, topY, backZ);
        const topFrontLeft = terrainPoint(x1, topY + topDepth, frontZ);
        const topFrontRight = terrainPoint(x2, topY + topDepth, frontZ);
        const lipBottomLeft = terrainPoint(x1, topY + topDepth + lipHeight, lipZ);
        const lipBottomRight = terrainPoint(x2, topY + topDepth + lipHeight, lipZ);
        const frontBottomLeft = terrainPoint(x1, blockBottom, lipZ);
        const frontBottomRight = terrainPoint(x2, blockBottom, lipZ);
        const backBottomLeft = terrainPoint(x1, blockBottom, backZ);
        const backBottomRight = terrainPoint(x2, blockBottom, backZ);

        addQuad(topBackLeft, topBackRight, topFrontRight, topFrontLeft, 0);
        addQuad(topFrontLeft, topFrontRight, lipBottomRight, lipBottomLeft, 1);
        addQuad(lipBottomLeft, lipBottomRight, frontBottomRight, frontBottomLeft, 2);
        addQuad(topBackRight, topBackLeft, backBottomLeft, backBottomRight, 4);
        addQuad(topBackLeft, topFrontLeft, frontBottomLeft, backBottomLeft, 3);
        addQuad(topFrontRight, topBackRight, backBottomRight, frontBottomRight, 3);
        addRoundedRail(x1 + 4, x2 - 4, topY + 3, backZ + 0.08, 8, 0.07);
        addRoundedRail(x1 + 4, x2 - 4, topY + topDepth + 5, frontZ + 0.02, 9, 0.075);

        const brickRows = Math.max(1, Math.floor((blockBottom - topY) / 128));
        const brickSpacing = 236;
        for (let row = 0; row < Math.min(3, brickRows); row += 1) {
          const rowY = topY + 72 + row * 104;
          const rowOffset = row % 2 === 0 ? 34 : 118;
          const firstBrickWorldX =
            Math.floor((x1 + worldOffset - rowOffset) / brickSpacing) * brickSpacing + rowOffset;
          for (let brickWorldX = firstBrickWorldX; brickWorldX < x2 + worldOffset - 52; brickWorldX += brickSpacing) {
            const brickX = brickWorldX - worldOffset;
            const clippedBrickX = Math.max(brickX, x1 + 24);
            const clippedBrickRight = Math.min(brickX + 126, x2 - 24);
            const brickWidth = clippedBrickRight - clippedBrickX;
            if (brickWidth > 44) {
              addFrontBrick(clippedBrickX, rowY, brickWidth, 22, lipZ + 0.006);
            }
          }
        }

        if (topY < GROUND_Y && band.width > 116) {
          addDiagonalFaceShadow(
            x2 - Math.min(122, band.width * 0.42),
            topY + topDepth + 10,
            Math.min(104, band.width * 0.34),
            Math.min(118, blockBottom - topY - topDepth - 36),
            lipZ + 0.012,
          );
        }
      }

      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      for (const group of groups) {
        geometry.addGroup(group.start, group.count, group.materialIndex);
      }
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
      return geometry;
    };

    const createTerrainShadowGeometry = (bands: Array<{ x: number; y: number; width: number; height: number }>) => {
      const geometry = new THREE.BufferGeometry();
      const vertices: number[] = [];
      const push = (point: THREE.Vector3) => vertices.push(point.x, point.y, point.z);
      const addQuad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3) => {
        push(a);
        push(b);
        push(c);
        push(a);
        push(c);
        push(d);
      };

      const shadowZ = -0.74;
      for (const band of bands) {
        const inset = Math.min(72, Math.max(20, band.width * 0.14));
        const y = band.y + 74;
        addQuad(
          terrainPoint(band.x + inset, y, shadowZ),
          terrainPoint(band.x + band.width - inset, y, shadowZ),
          terrainPoint(band.x + band.width - inset + 34, y + 24, shadowZ),
          terrainPoint(band.x + inset + 34, y + 24, shadowZ),
        );
      }

      geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
      return geometry;
    };

    const rebuildTerrainModels = (store: GameStore) => {
      if (store.phase === "ready") {
        terrainMesh.visible = false;
        terrainShadowMesh.visible = false;
        store.terrainMeshCount = 0;
        store.terrainPieceCount = 0;
        return;
      }

      const isNight = store.theme === "night";
      terrainTopMaterial.color.set(isNight ? "#6f5a44" : "#a85f2a");
      terrainFrontMaterial.color.set(isNight ? "#271b2b" : "#61260e");
      terrainSideMaterial.color.set(isNight ? "#120d1b" : "#321207");
      terrainShadeMaterial.color.set(isNight ? "#201427" : "#4d1c09");
      terrainLipMaterial.color.set(isNight ? "#382934" : "#733011");
      terrainRailMaterial.color.set(isNight ? "#7b6148" : "#bd7638");
      terrainDetailMaterial.color.set(isNight ? "#1d0d1d" : "#351104");
      terrainFaceShadowMaterial.color.set(isNight ? "#140914" : "#3d1608");
      terrainFaceShadowMaterial.opacity = isNight ? 0.55 : 0.42;
      terrainShadowMaterial.opacity = isNight ? 0.34 : 0.22;

      const terrainBands = mergeTerrainBands(getTerrainBands(store));
      terrainMesh.geometry.dispose();
      terrainMesh.geometry = createTerrainModelGeometry(terrainBands, store.worldOffset);
      terrainMesh.visible = terrainBands.length > 0;
      terrainShadowMesh.geometry.dispose();
      terrainShadowMesh.geometry = createTerrainShadowGeometry(terrainBands);
      terrainShadowMesh.visible = terrainBands.length > 0;
      store.terrainMeshCount = terrainBands.length > 0 ? 2 : 0;
      store.terrainPieceCount = terrainBands.length;
    };

    let frame = 0;
    let lastThreeFrameAt = 0;
    const loop = (now: number) => {
      const store = storeRef.current;
      const seconds = now / 1000;
      const threeDt = Math.min(0.05, Math.max(0, (now - lastThreeFrameAt) / 1000 || 0));
      lastThreeFrameAt = now;
      const animation = getChickenAnimationState(store, now);
      const { isLanding, boosting, airborne, jumpKick, landImpact, landingCall } = animation;
      const flap = Math.sin(seconds * (airborne ? 16 : 9));
      const blink = Math.pow(Math.max(0, Math.sin(seconds * (store.phase === "ready" ? 2.7 : 3.8) + 0.9)), 20);
      const idleBreath = store.phase === "ready" ? Math.sin(seconds * 2.4) : 0;
      const runBounce = store.phase === "playing" && !airborne ? Math.abs(Math.sin(store.runTime * 12)) : 0;
      const callPunch = Math.sin(landingCall * Math.PI);
      let logicalX = WIDTH * 0.5;
      let logicalY = INTRO_CHICKEN_Y;
      let logicalScale = 1.86;
      let yaw = 0;
      let roll = Math.sin(seconds * 1.3) * 0.025;
      let pitch = Math.sin(seconds * 1.1) * 0.03;
      let jumpMorph = airborne ? 1 : 0;

      if (store.phase === "ready") {
        logicalY += Math.sin(seconds * 2.2) * 10;
        logicalScale += idleBreath * 0.018 + Math.sin(seconds * 3.4) * 0.014;
        pitch += idleBreath * 0.025;
        roll += Math.sin(seconds * 1.8) * 0.018;
      }

      if (store.phase === "playing") {
        if (isLanding) {
          const duration = Math.max(1, store.landingUntil - store.launchStartAt);
          const t = clamp((now - store.launchStartAt) / duration, 0, 1);
          const eased = easeOutCubic(t);
          jumpMorph = 1 - clamp((t - 0.8) / 0.2, 0, 1);
          logicalX = lerp(WIDTH * 0.5, store.player.x, eased);
          logicalY = lerp(INTRO_CHICKEN_Y, store.player.y, eased) - Math.sin(t * Math.PI) * 120 + landingCall * 18 - callPunch * 8;
          logicalScale = lerp(1.86, 0.76, eased);
          yaw = easeInOutCubic(clamp((t - 0.08) / 0.58, 0, 1)) * SIDE_YAW;
          pitch = lerp(0.04, -0.16, Math.sin(t * Math.PI)) + landingCall * 0.18 - callPunch * 0.06;
          roll = lerp(0, -0.08, eased) - landingCall * 0.035;
        } else {
          logicalX = store.player.x;
          logicalY = store.player.y - runBounce * 2.2 + landImpact * 3;
          logicalScale = 0.76;
          yaw = SIDE_YAW;
          if (boosting) {
            logicalY -= 16 + Math.sin(seconds * 22) * 4;
          }
          pitch = airborne ? clamp(store.player.vy / 2300, -0.24, 0.18) : 0;
          roll = boosting ? -0.14 + Math.sin(seconds * 18) * 0.018 : airborne ? -0.12 - jumpKick * 0.04 : Math.sin(store.runTime * 8) * 0.018;
        }
      }

      chicken.root.visible = true;
      const position = screenToScene(logicalX, logicalY);
      chicken.root.position.set(position.x, position.y, 0);
      chicken.root.rotation.set(pitch, yaw, roll);
      const baseScale = logicalScale * 0.32;
      const idlePulse = store.phase === "ready" ? idleBreath * 0.035 : 0;
      const squash = airborne ? 0.92 - landingCall * 0.2 - jumpKick * 0.1 : 1 + runBounce * 0.035 + idlePulse + landImpact * 0.18;
      const stretch = airborne ? 1.1 + landingCall * 0.28 + jumpKick * 0.2 : 1 - runBounce * 0.025 - idlePulse * 0.45 - landImpact * 0.14;
      if (chickenGlbRuntime) {
        const glbPulse = store.phase === "ready" ? idleBreath * 0.012 : landImpact * 0.035;
        chicken.root.scale.setScalar(baseScale * (1 + glbPulse));
      } else {
        chicken.root.scale.set(baseScale * squash, baseScale * stretch, baseScale * (1 + landingCall * 0.06));
      }

      const wingLift = airborne ? 0.86 + flap * 0.34 + landingCall * 0.48 + jumpKick * 0.46 : 0.16 + flap * 0.06 + idlePulse * 0.42 + landImpact * 0.2;
      chicken.parts.leftWing.rotation.set(0.08, 0.1, 0.16 + wingLift);
      chicken.parts.rightWing.rotation.set(0.08, -0.1, -0.16 - wingLift);
      chicken.parts.leftLeg.rotation.z = airborne ? -0.86 + flap * 0.1 - jumpKick * 0.22 - landingCall * 0.08 : -0.2 + Math.sin(seconds * 12) * 0.12 - landImpact * 0.24;
      chicken.parts.rightLeg.rotation.z = airborne ? 0.66 - flap * 0.1 + jumpKick * 0.2 + landingCall * 0.06 : 0.2 - Math.sin(seconds * 12) * 0.12 + landImpact * 0.2;
      chicken.parts.leftFoot.rotation.z = Math.PI / 4 + (airborne ? -0.52 - jumpKick * 0.22 : Math.sin(seconds * 12) * 0.1 - landImpact * 0.18);
      chicken.parts.rightFoot.rotation.z = Math.PI / 4 + (airborne ? 0.38 + jumpKick * 0.18 : -Math.sin(seconds * 12) * 0.1 + landImpact * 0.16);
      chicken.parts.tail.rotation.set(0.12 + flap * 0.025, -0.28 + (airborne ? jumpKick * 0.1 : Math.sin(seconds * 9) * 0.04), Math.sin(seconds * 10) * 0.034 - landingCall * 0.12);
      chicken.parts.tail.scale.set(1 + landingCall * 0.12, 1 + jumpKick * 0.16, 1 + landImpact * 0.12);
      chicken.parts.comb.rotation.x = -0.2 + (airborne ? flap * 0.05 : idleBreath * 0.035) - jumpKick * 0.1 + landingCall * 0.2;
      chicken.parts.body.scale.set(
        1.08 + landingCall * 0.1 - jumpKick * 0.06 + landImpact * 0.1 + runBounce * 0.02,
        0.96 + jumpMorph * 0.08 - landingCall * 0.22 + jumpKick * 0.14 - landImpact * 0.12,
        0.9 + landingCall * 0.12,
      );
      chicken.parts.lowerBodyShade.scale.set(
        1.18 + landingCall * 0.08 + landImpact * 0.08,
        0.44 - landingCall * 0.08 + jumpKick * 0.06 - landImpact * 0.04,
        0.84 + landingCall * 0.08,
      );
      chicken.parts.belly.scale.set(
        1.28 + landingCall * 0.08 + landImpact * 0.08,
        0.78 - landingCall * 0.16 + jumpKick * 0.1 - landImpact * 0.1,
        0.38 + landingCall * 0.05,
      );
      chicken.parts.flankFeathers.scale.set(1 + landingCall * 0.06 + landImpact * 0.08, 1 - landingCall * 0.08 + jumpKick * 0.06, 1);
      chicken.parts.breastFeathers.visible = store.phase === "ready" || isLanding;
      chicken.parts.breastFeathers.scale.set(1 + landingCall * 0.1 - jumpKick * 0.04 + landImpact * 0.08, 1 + jumpMorph * 0.05 - landingCall * 0.1 - landImpact * 0.08, 1);
      chicken.parts.beak.rotation.x = Math.PI / 2 - landingCall * 0.22 - jumpKick * 0.07;
      chicken.parts.beak.rotation.y = store.phase === "ready" ? Math.sin(seconds * 3) * 0.035 : 0;
      chicken.parts.beak.scale.set(1.12 + landingCall * 0.12, 0.82 + landingCall * 0.2, 0.72);
      chicken.parts.lowerBeak.rotation.x = Math.PI / 2 + landingCall * 0.36 + jumpKick * 0.08;
      chicken.parts.lowerBeak.rotation.y = store.phase === "ready" ? Math.sin(seconds * 3) * 0.025 : 0;
      chicken.parts.lowerBeak.position.y = -0.09 - landingCall * 0.16;
      chicken.parts.lowerBeak.position.z = 0.84 + landingCall * 0.05;
      const mouthOpen = store.phase === "ready" ? 0.7 + Math.max(0, Math.sin(seconds * 4.2)) * 0.24 : landingCall;
      chicken.parts.mouth.visible = mouthOpen > 0.08;
      chicken.parts.mouth.scale.x = 0.64 + mouthOpen * 0.44;
      chicken.parts.mouth.scale.y = 0.26 + mouthOpen * 0.9;
      chicken.parts.tongue.visible = mouthOpen > 0.18;
      chicken.parts.tongue.scale.set(1 + mouthOpen * 0.18, 0.32 + mouthOpen * 0.36, 0.44);
      chicken.parts.tongue.position.y = -0.08 - mouthOpen * 0.035;
      const eyeSquint = clamp(1 - blink * 0.86 + landingCall * 0.2, 0.12, 1.2);
      chicken.parts.leftEye.scale.set(1 + landingCall * 0.08, eyeSquint, 1);
      chicken.parts.rightEye.scale.set(1 + landingCall * 0.08, eyeSquint, 1);
      chicken.parts.callWave.visible = landingCall > 0.02;
      chicken.parts.callWave.scale.setScalar(0.66 + landingCall * 1.62);
      chicken.parts.callWave.position.z = 1.2 + landingCall * 0.52;
      const callMaterial = chicken.parts.callWave.material as THREE.MeshBasicMaterial;
      callMaterial.opacity = landingCall * 0.5;
      const secondaryCall = Math.max(0, landingCall - 0.26) / 0.74;
      chicken.parts.callWaveSecondary.visible = secondaryCall > 0.02;
      chicken.parts.callWaveSecondary.scale.setScalar(0.82 + secondaryCall * 2.0);
      chicken.parts.callWaveSecondary.position.z = 1.18 + secondaryCall * 0.76;
      const secondaryCallMaterial = chicken.parts.callWaveSecondary.material as THREE.MeshBasicMaterial;
      secondaryCallMaterial.opacity = secondaryCall * 0.26;
      const rocketThrust = boosting ? 0.64 + (store.input.thrust ? 0.36 : 0) : 0;
      chicken.parts.rocket.visible = boosting;
      chicken.parts.rocketFlame.visible = boosting;
      chicken.parts.rocket.position.y = -1.1 + Math.sin(seconds * 28) * 0.022;
      chicken.parts.rocket.rotation.set(
        0.03 + Math.sin(seconds * 20) * 0.018,
        0,
        Math.sin(seconds * 24) * 0.024,
      );
      chicken.parts.rocket.scale.set(
        1.28 + Math.sin(seconds * 22) * 0.024 * rocketThrust,
        1.1,
        1.26 + Math.sin(seconds * 17) * 0.032 * rocketThrust,
      );
      chicken.parts.rocketFlame.scale.set(
        0.5 + rocketThrust * 0.84 + Math.sin(seconds * 42) * 0.18 * rocketThrust,
        0.74 + rocketThrust * 0.38 + Math.sin(seconds * 36) * 0.12 * rocketThrust,
        0.54 + rocketThrust * 0.84 + Math.sin(seconds * 45) * 0.18 * rocketThrust,
      );
      if (chickenGlbRuntime) {
        applyChickenGlbAnimation(chickenGlbRuntime, animation.mode, store, threeDt);
        for (const part of proceduralChickenParts) {
          part.visible = false;
        }
        chicken.parts.callWave.visible = false;
        chicken.parts.callWaveSecondary.visible = false;
      }

      titleCoin.visible = store.phase === "playing";
      store.titleCoinVisible = titleCoin.visible;
      if (titleCoin.visible) {
        const slot = titleCoinSlotRef.current?.getBoundingClientRect();
        const titlePosition = slot
          ? clientToScene(slot.left + slot.width / 2, slot.top + slot.height / 2)
          : screenToScene(565, 314);
        titleCoin.position.set(titlePosition.x, titlePosition.y, 0.08);
        titleCoin.scale.setScalar(0.23);
        titleCoin.rotation.set(0.2, seconds * 3.2, 0.02);
      }

      rebuildTerrainModels(store);

      const activeRocketPickupIds = new Set<number>();
      for (const pickup of store.pickups) {
        if (pickup.kind !== "rocket") continue;
        activeRocketPickupIds.add(pickup.id);
        let rocketPickup = rocketPickupMeshes.get(pickup.id);
        if (!rocketPickup) {
          rocketPickup = createRocketPickupModel();
          rocketPickupMeshes.set(pickup.id, rocketPickup);
          scene.add(rocketPickup.root);
        }
        const rocketPosition = screenToScene(pickup.x, pickup.y + Math.sin(pickup.spin * 2) * 5);
        rocketPickup.root.position.set(rocketPosition.x, rocketPosition.y, 0.24);
        rocketPickup.root.scale.setScalar(0.2);
        rocketPickup.root.rotation.set(-0.08, SIDE_YAW + 0.34, Math.sin(seconds * 5.6 + pickup.id) * 0.08);
        rocketPickup.flame.scale.set(
          0.68 + Math.sin(seconds * 18 + pickup.id) * 0.12,
          0.72,
          0.68 + Math.sin(seconds * 21 + pickup.id) * 0.16,
        );
        rocketPickup.root.visible = true;
      }

      for (const [id, rocketPickup] of rocketPickupMeshes) {
        if (activeRocketPickupIds.has(id)) continue;
        scene.remove(rocketPickup.root);
        disposeObject3D(rocketPickup.root);
        rocketPickupMeshes.delete(id);
      }

      const activeObstacleIds = new Set<number>();
      for (const obstacle of store.obstacles) {
        activeObstacleIds.add(obstacle.id);
        let obstacleModel = obstacleMeshes.get(obstacle.id);
        if (!obstacleModel || obstacleModel.kind !== obstacle.kind) {
          if (obstacleModel) {
            scene.remove(obstacleModel.root);
            disposeObject3D(obstacleModel.root);
          }
          obstacleModel = createObstacleModel(obstacle.kind);
          obstacleMeshes.set(obstacle.id, obstacleModel);
          scene.add(obstacleModel.root);
        }
        const center = screenToScene(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
        const xScale =
          Math.abs(screenToScene(obstacle.x + obstacle.width, obstacle.y).x - screenToScene(obstacle.x, obstacle.y).x) *
          (obstacle.kind === "spike" ? 1.0 : 0.98);
        const yScale =
          Math.abs(screenToScene(obstacle.x, obstacle.y + obstacle.height).y - screenToScene(obstacle.x, obstacle.y).y) *
          (obstacle.kind === "spike" ? 1.0 : 0.98);
        obstacleModel.root.position.set(center.x, center.y, 0.36);
        obstacleModel.root.scale.set(xScale, yScale, Math.min(xScale, yScale) * (obstacle.kind === "spike" ? 0.72 : 0.9));
        obstacleModel.root.rotation.set(0.04, obstacle.kind === "spike" ? -0.14 : -0.18, 0);
        obstacleModel.root.visible = true;
      }

      for (const [id, obstacleModel] of obstacleMeshes) {
        if (activeObstacleIds.has(id)) continue;
        scene.remove(obstacleModel.root);
        disposeObject3D(obstacleModel.root);
        obstacleMeshes.delete(id);
      }
      store.obstacleMeshCount = activeObstacleIds.size;

      const activeCoinIds = new Set<number>();
      for (const pickup of store.pickups) {
        if (pickup.kind !== "coin") continue;
        activeCoinIds.add(pickup.id);
        let coin = coinMeshes.get(pickup.id);
        if (!coin) {
          coin = createCoinModel(sharedRotatingCoinAssets);
          coinMeshes.set(pickup.id, coin);
          scene.add(coin);
        }
        const coinPosition = screenToScene(pickup.x, pickup.y);
        coin.position.set(coinPosition.x, coinPosition.y, 0.1);
        coin.scale.setScalar(0.16);
        coin.rotation.set(0.12, pickup.spin + seconds * 2.3, 0);
        coin.visible = true;
      }

      for (const [id, coin] of coinMeshes) {
        if (activeCoinIds.has(id)) continue;
        scene.remove(coin);
        coinMeshes.delete(id);
      }
      store.coinMeshCount = activeCoinIds.size;

      const activeCoinEffectIds = new Set<number>();
      for (const effect of store.coinEffects) {
        const t = clamp((now - effect.startedAt) / effect.duration, 0, 1);
        if (t >= 1) continue;
        activeCoinEffectIds.add(effect.id);
        let coin = coinEffectMeshes.get(effect.id);
        if (!coin) {
          coin = createCoinModel(sharedRotatingCoinAssets);
          coinEffectMeshes.set(effect.id, coin);
          scene.add(coin);
        }
        const eased = easeInOutCubic(t);
        const from = screenToScene(effect.fromX, effect.fromY);
        const scoreRect = scorePillRef.current?.getBoundingClientRect();
        const target = scoreRect
          ? clientToScene(scoreRect.left + scoreRect.width / 2, scoreRect.top + scoreRect.height / 2)
          : screenToScene(getScoreTagTarget().x, getScoreTagTarget().y);
        coin.position.set(
          lerp(from.x, target.x, eased),
          lerp(from.y, target.y, eased) + Math.sin(t * Math.PI) * 0.86,
          0.34,
        );
        coin.scale.setScalar(lerp(0.12, 0.058, eased) * (1 + Math.sin(t * Math.PI) * 0.2));
        coin.rotation.set(0.16, seconds * 9.8 + effect.id * 0.1, 0.03);
        coin.visible = true;
      }

      for (const [id, coin] of coinEffectMeshes) {
        if (activeCoinEffectIds.has(id)) continue;
        scene.remove(coin);
        coinEffectMeshes.delete(id);
      }
      store.coinEffectMeshCount = activeCoinEffectIds.size;

      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(loop);

    return () => {
      cancelledModelLoad = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      for (const coin of coinMeshes.values()) {
        scene.remove(coin);
      }
      for (const coin of coinEffectMeshes.values()) {
        scene.remove(coin);
      }
      for (const rocketPickup of rocketPickupMeshes.values()) {
        scene.remove(rocketPickup.root);
        disposeObject3D(rocketPickup.root);
      }
      for (const obstacleModel of obstacleMeshes.values()) {
        scene.remove(obstacleModel.root);
        disposeObject3D(obstacleModel.root);
      }
      terrainMesh.geometry.dispose();
      terrainShadowMesh.geometry.dispose();
      terrainGroup.remove(terrainMesh);
      terrainGroup.remove(terrainShadowMesh);
      terrainTopMaterial.dispose();
      terrainFrontMaterial.dispose();
      terrainSideMaterial.dispose();
      terrainShadeMaterial.dispose();
      terrainLipMaterial.dispose();
      terrainRailMaterial.dispose();
      terrainDetailMaterial.dispose();
      terrainFaceShadowMaterial.dispose();
      terrainShadowMaterial.dispose();
      disposeObject3D(chicken.root);
      disposeCoinAssets(sharedRotatingCoinAssets);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
}
