import {
  BASE_CROWD_COUNT,
  MAX_CROWD_COUNT,
  crowdCountForSize,
  createCrowd,
  CrowdMotion,
  CrowdTimeline,
  projectPerson,
  SHUTTER_SAMPLES,
  TRACK_COLORS,
  type CrowdPerson,
  type ProjectedPerson,
  type TrackingLayer,
} from "./crowdSimulation";
import { DigitalRain } from "./DigitalRain";
import { drawWalker, WALKER_VARIANTS } from "./WalkerRig";
import { PointerTracking, type CrowdPointer } from "./PointerTracking";
import { WALKER_ATLAS, WALKER_BLURS, BAKED_BLUR_SCALE, type WalkerAtlasSource } from "./walkerAtlas";

export type CrowdProfile = { name: string; caption: string; url: string; visitLabel: string };
type TrackingElement = HTMLAnchorElement | null;
const { tileWidth: TILE_WIDTH, tileHeight: TILE_HEIGHT, columns: COLUMNS } = WALKER_ATLAS;
const BLURS = WALKER_BLURS;
const TAU = Math.PI * 2;

function createAtlases(source: WalkerAtlasSource | null, frameCount: number) {
  const rows = Math.ceil(frameCount / COLUMNS);
  return Array.from({ length: source ? source.images.length : WALKER_VARIANTS }, (_, variant) => {
    if (source?.preblurred) {
      const atlas = document.createElement("canvas");
      atlas.width = TILE_WIDTH * COLUMNS;
      atlas.height = TILE_HEIGHT * rows * BLURS.length;
      const ctx = atlas.getContext("2d");
      if (!ctx) throw new Error("Canvas is unavailable");
      BLURS.forEach((_, bank) => {
        for (let frame = 0; frame < frameCount; frame++) {
          const captured = Math.floor(frame / frameCount * WALKER_ATLAS.frameCount);
          ctx.drawImage(source.images[variant],
            captured % COLUMNS * TILE_WIDTH * BAKED_BLUR_SCALE,
            (bank * WALKER_ATLAS.frameCount / COLUMNS + Math.floor(captured / COLUMNS)) * TILE_HEIGHT * BAKED_BLUR_SCALE,
            TILE_WIDTH * BAKED_BLUR_SCALE, TILE_HEIGHT * BAKED_BLUR_SCALE,
            frame % COLUMNS * TILE_WIDTH, (bank * rows + Math.floor(frame / COLUMNS)) * TILE_HEIGHT,
            TILE_WIDTH, TILE_HEIGHT);
        }
      });
      return atlas;
    }
    const sharp = document.createElement("canvas");
    sharp.width = TILE_WIDTH * COLUMNS;
    sharp.height = TILE_HEIGHT * rows;
    const sharpContext = sharp.getContext("2d");
    if (!sharpContext) throw new Error("Canvas is unavailable");
    for (let frame = 0; frame < frameCount; frame++) {
      sharpContext.save();
      const x = frame % COLUMNS * TILE_WIDTH;
      const y = Math.floor(frame / COLUMNS) * TILE_HEIGHT;
      if (source) {
        const capturedFrame = Math.floor(frame / frameCount * WALKER_ATLAS.frameCount);
        sharpContext.drawImage(source.images[variant],
          capturedFrame % COLUMNS * TILE_WIDTH, Math.floor(capturedFrame / COLUMNS) * TILE_HEIGHT,
          TILE_WIDTH, TILE_HEIGHT, x, y, TILE_WIDTH, TILE_HEIGHT);
      } else {
        sharpContext.translate(x, y);
        drawWalker(sharpContext, (frame / frameCount) * TAU, variant);
      }
      sharpContext.restore();
    }
    const atlas = document.createElement("canvas");
    atlas.width = sharp.width;
    atlas.height = sharp.height * BLURS.length;
    const ctx = atlas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable");
    BLURS.forEach((blur, index) => {
      ctx.filter = `blur(${blur}px)`;
      ctx.drawImage(sharp, 0, index * sharp.height);
    });
    return atlas;
  });
}

type LabelBinding = {
  element: HTMLAnchorElement;
  name: HTMLElement;
  caption: HTMLElement;
  personId: number;
  profileVersion: number;
};

/** Separate the crowd exposure, world-space links, and crisp tracking UI. */
export class CrowdRenderer {
  private context: CanvasRenderingContext2D;
  private atlases: HTMLCanvasElement[];
  private atlasFrameCount: number;
  private atlasRows: number;
  private captured: boolean;
  private heatmaps: HTMLCanvasElement[];
  private rain: DigitalRain;
  private highlightSurface: HTMLCanvasElement;
  private highlightContext: CanvasRenderingContext2D;
  private people: CrowdPerson[];
  private activeCount = BASE_CROWD_COUNT;
  private timeline: CrowdTimeline;
  private pointerTracking = new PointerTracking();
  private pointer: CrowdPointer | null = null;
  private bindings: (LabelBinding | null)[];
  private profileVersion = 0;
  private width = 0;
  private height = 0;
  private time = 0;
  private previousTime = 0;
  private frame = 0;
  private paused = false;
  private focused = false;
  private visible = true;
  private disposed = false;
  private resizeObserver: ResizeObserver;
  private intersectionObserver: IntersectionObserver;

  constructor(
    private canvas: HTMLCanvasElement,
    labels: TrackingElement[],
    private profiles: CrowdProfile[],
    source: WalkerAtlasSource | null = null,
  ) {
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas is unavailable");
    this.context = ctx;
    this.captured = source !== null;
    // Each dimension stays below 4096px. A phone uses half the pose samples.
    this.atlasFrameCount = window.matchMedia("(max-width: 699px)").matches ? 24 : WALKER_ATLAS.frameCount;
    this.atlasRows = Math.ceil(this.atlasFrameCount / COLUMNS);
    this.atlases = createAtlases(source, this.atlasFrameCount);
    canvas.dataset.walkerSource = this.captured ? "video-derived" : "procedural";
    canvas.dataset.walkerBlur = source?.preblurred ? "baked" : "filter" in ctx ? "canvas-filter" : "unavailable";
    canvas.dataset.walkerFrames = String(this.atlasFrameCount);
    canvas.dataset.walkerVariants = String(this.atlases.length);
    canvas.dataset.walkerAtlasBytes = String(this.atlases.reduce((sum, atlas) => sum + atlas.width * atlas.height * 4, 0));
    this.heatmaps = this.createHeatmaps();
    this.rain = new DigitalRain();
    this.highlightSurface = document.createElement("canvas");
    this.highlightSurface.width = 96;
    this.highlightSurface.height = 224;
    this.highlightContext = this.highlightSurface.getContext("2d")!;
    this.people = createCrowd(profiles.length, MAX_CROWD_COUNT, source?.cast);
    // Keep the tracking cast and its timeline stable when more background
    // walkers enter on a wider canvas. All walkers retain their pose history.
    this.timeline = new CrowdTimeline(this.people.slice(0, BASE_CROWD_COUNT), new CrowdMotion(this.people));
    this.bindings = labels.map((element) => element ? {
      element,
      name: element.querySelector<HTMLElement>("[data-track-name]")!,
      caption: element.querySelector<HTMLElement>("[data-track-caption]")!,
      personId: -1,
      profileVersion: -1,
    } : null);
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(canvas);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.syncPlayback();
    }, { threshold: 0 });
    this.intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", this.syncPlayback);
    this.resize();
  }

  updateProfiles(profiles: CrowdProfile[]) {
    this.profiles = profiles;
    this.profileVersion++;
    this.draw();
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    this.syncPlayback();
  }

  setPointer(x: number, y: number, personId?: number) {
    this.pointer = { x, y, personId };
    if (this.paused || this.focused) this.draw();
  }

  clearPointer() {
    this.pointer = null;
    if (this.paused || this.focused) this.draw();
  }

  // Hold only for keyboard focus; clicking a tracking link keeps playback running.
  setFocused(focused: boolean) {
    this.focused = focused;
    this.syncPlayback();
  }

  private resize = () => {
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.activeCount = crowdCountForSize(this.width, this.height);
    this.timeline.motion.setActiveCount(this.activeCount);
    if (this.captured) this.timeline.motion.setGaitProjection(this.width);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * ratio);
    this.canvas.height = Math.round(this.height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.draw();
    this.syncPlayback();
  };

  private syncPlayback = () => {
    if (this.disposed) return;
    if (document.hidden) this.pointer = null;
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.previousTime = 0;
    if (!this.paused && !this.focused && this.visible && !document.hidden) {
      this.frame = requestAnimationFrame(this.animate);
    } else {
      this.draw();
    }
  };

  private animate = (now: number) => {
    if (this.disposed) return;
    const delta = this.previousTime ? Math.min((now - this.previousTime) / 1000, .08) : 0;
    this.previousTime = now;
    this.time += delta;
    this.timeline.update(this.time);
    this.draw();
    this.frame = requestAnimationFrame(this.animate);
  };

  private createHeatmaps() {
    const palettes = [
      ["#94c66f", "#28aa6b", "#16845b", "#edb34f"],
      ["#ffbd38", "#f78b3e", "#e16d89", "#858fd3"],
      ["#6389eb", "#3c62d9", "#5374d0", "#ad8dcd"],
      ["#ffdc77", "#f3ab4c", "#e88336", "#bd6449"],
    ];
    return palettes.map((colors) => {
      const tile = document.createElement("canvas");
      tile.width = 64;
      tile.height = 160;
      const ctx = tile.getContext("2d")!;
      const gradient = ctx.createLinearGradient(0, 0, 0, 160);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(.3, colors[1]);
      gradient.addColorStop(.68, colors[2]);
      gradient.addColorStop(1, colors[3]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 160);
      return tile;
    });
  }

  private sprite(person: ProjectedPerson, blur: number, alpha: number, ctx = this.context) {
    const size = person.bodyHeight / WALKER_ATLAS.bodyHeight;
    const gaitFrame = Math.floor((((person.gait % TAU) + TAU) % TAU) / TAU * this.atlasFrameCount);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(person.screenX, person.screenY);
    ctx.scale(person.direction, 1);
    ctx.drawImage(
      this.atlases[person.variant],
      gaitFrame % COLUMNS * TILE_WIDTH, (blur * this.atlasRows + Math.floor(gaitFrame / COLUMNS)) * TILE_HEIGHT,
      TILE_WIDTH, TILE_HEIGHT,
      -WALKER_ATLAS.anchorX * size, -WALKER_ATLAS.anchorY * size, TILE_WIDTH * size, TILE_HEIGHT * size,
    );
    ctx.restore();
  }

  private drawPerson(person: ProjectedPerson) {
    const ctx = this.context;
    const edgeBlur = Math.max(0, Math.abs(person.normalizedX - .5) - .28) * 11;
    const blur = Math.min(BLURS.length - 1, Math.floor(Math.abs(person.depth - .36) * 6 + .5 + edgeBlur));
    ctx.save();
    ctx.globalAlpha = person.opacity * .1;
    ctx.fillStyle = "#8b8c87";
    ctx.beginPath();
    ctx.ellipse(person.screenX + 2, person.screenY, person.bodyHeight * .16, person.bodyHeight * .024, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    if (this.time < .05) {
      this.sprite(person, blur, person.opacity);
      return;
    }
    // Sample actual earlier positions AND gait poses. Fixed exposure times keep
    // the directional ghosts consistent at 30/60/120 Hz; the UI never accumulates.
    const exposure = .85 + person.depth * .9;
    for (const sample of SHUTTER_SAMPLES) {
      const past = sample.delay === 0 ? person : projectPerson(
        this.people[person.id], this.timeline.motion.sample(person.id, Math.max(0, this.time - sample.delay * exposure)), this.width, this.height,
      );
      // A walker wrapping outside the frame leaves no streak across the scene.
      if (Math.abs(past.screenX - person.screenX) > this.width * .5) continue;
      this.sprite(past, Math.min(BLURS.length - 1, blur + (sample.delay > .14 ? 1 : 0)), person.opacity * sample.weight);
    }
  }

  private drawLine(from: ProjectedPerson, to: ProjectedPerson, layer: TrackingLayer, index: number) {
    const ctx = this.context;
    const sx = from.screenX;
    const sy = from.screenY - from.bodyHeight * .57;
    const ex = to.screenX;
    const ey = to.screenY - to.bodyHeight * .56;
    const t = Math.max(0, Math.min(1, layer.reveal * 1.25 - index * .09));
    const progress = 1 - Math.pow(1 - t, 3);
    const edgeOpacity = Math.min(1, to.opacity / .45, from.opacity / .45);
    ctx.globalAlpha = layer.lineOpacity * .28 * edgeOpacity;
    ctx.strokeStyle = TRACK_COLORS[layer.slot];
    ctx.lineWidth = .75;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (ex - sx) * progress, sy + (ey - sy) * progress);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  private placeLabel(person: ProjectedPerson, layer: TrackingLayer, x: number, y: number, width: number, height: number) {
    const binding = this.bindings[layer.slot * 2 + layer.bank];
    if (!binding) return;
    const { element, name, caption } = binding;
    if (binding.personId !== person.id || binding.profileVersion !== this.profileVersion) {
      const profile = this.profiles[person.profileIndex];
      name.textContent = profile.name.toUpperCase();
      caption.textContent = profile.caption;
      element.href = profile.url;
      element.target = profile.url.startsWith("http") ? "_blank" : "_self";
      element.setAttribute("aria-label", `${profile.visitLabel} ${profile.name} — ${profile.caption}`);
      element.dataset.person = String(person.id);
      binding.personId = person.id;
      binding.profileVersion = this.profileVersion;
    }
    const interactive = layer.current && layer.opacity > .5;
    element.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
    element.style.width = `${width.toFixed(2)}px`;
    element.style.height = `${height.toFixed(2)}px`;
    element.style.opacity = layer.opacity.toFixed(3);
    element.style.visibility = "visible";
    element.style.pointerEvents = interactive ? "auto" : "none";
    element.tabIndex = interactive ? 0 : -1;
    element.setAttribute("aria-hidden", interactive ? "false" : "true");
    element.dataset.state = layer.state;
    element.dataset.captionSide = person.normalizedX > .64 ? "right" : "left";
  }

  private drawTrackingBody(person: ProjectedPerson, layer: TrackingLayer) {
    const ctx = this.context;
    const width = person.bodyHeight * (this.captured ? .74 : .44);
    const height = person.bodyHeight * 1.05;
    const x = person.screenX - width / 2;
    const y = person.screenY - height;

    // The person's current articulated silhouette is the alpha mask. Color and
    // falling digits belong to the body, while empty space inside the box stays
    // transparent. Reuse a small surface for every current/outgoing target.
    const surface = this.highlightSurface;
    const mask = this.highlightContext;
    mask.setTransform(1, 0, 0, 1, 0, 0);
    mask.clearRect(0, 0, surface.width, surface.height);
    mask.setTransform(surface.width / width, 0, 0, surface.height / height,
      -x * surface.width / width, -y * surface.height / height);
    this.sprite(person, 0, 1, mask);
    mask.globalCompositeOperation = "source-in";
    mask.drawImage(this.heatmaps[layer.slot], x, y, width, height);
    mask.globalCompositeOperation = "source-atop";
    this.rain.draw(mask, layer.slot, this.time, person.id, x, y, width, height, 1);
    mask.globalCompositeOperation = "source-over";

    ctx.globalAlpha = layer.opacity * .82;
    ctx.drawImage(surface, x, y, width, height);
    ctx.globalAlpha = 1;
  }

  private draw() {
    if (!this.width || !this.height || this.disposed) return;
    const ctx = this.context;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(0, 0, this.width, this.height);
    const all = this.people.map((person) => projectPerson(person, this.timeline.motion.sample(person.id, this.time), this.width, this.height));
    const projected = all.filter((person) => person.id < this.activeCount
      && (this.width >= 700 || person.id % 3 !== 0)).sort((a, b) => a.screenY - b.screenY);
    const pointer = this.pointer ? { ...this.pointer, x: this.pointer.x * this.width, y: this.pointer.y * this.height } : null;
    if (pointer?.personId !== undefined && !this.bindings.some((binding) =>
      binding !== null && binding.personId === pointer.personId && binding.element.matches(":hover"))) {
      pointer.personId = undefined;
    }
    const pointerLayers = this.pointerTracking.update(projected, pointer, this.time, this.width, this.paused, this.focused);
    const layers = this.timeline.layers(this.time).map((layer) => {
      // An orange selection takes precedence on the same body without stacking
      // two colored masks or labels. Automatic tracking continues underneath.
      const selectedOpacity = pointerLayers.find((selected) => selected.personId === layer.personId)?.opacity ?? 0;
      return { ...layer, opacity: layer.opacity * (1 - selectedOpacity), lineOpacity: layer.lineOpacity * (1 - selectedOpacity) };
    }).concat(pointerLayers);
    for (const person of projected) {
      this.drawPerson(person);
      // Colored bodies share the crowd's depth order, so a nearer passerby can
      // naturally occlude them. Tracking labels remain a separate UI layer.
      for (const layer of layers) {
        if (layer.personId === person.id && layer.opacity > .001) this.drawTrackingBody(person, layer);
      }
    }

    // Fade the atmospheric crowd before painting sharp labels and relationship lines.
    const fog = ctx.createLinearGradient(0, 0, 0, this.height);
    fog.addColorStop(0, "#f7f7f7");
    fog.addColorStop(.13, "#f7f7f700");
    fog.addColorStop(.65, "#f7f7f700");
    fog.addColorStop(.89, "#f7f7f7e8");
    fog.addColorStop(1, "#f7f7f7");
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, this.width, this.height);

    for (const layer of layers) {
      layer.edges.forEach((id, index) => this.drawLine(all[layer.personId], all[id], layer, index));
    }
    const visibleLabels = new Set(layers.filter((layer) => layer.opacity > .001).map((layer) => layer.slot * 2 + layer.bank));
    this.bindings.forEach((binding, index) => {
      if (!binding || visibleLabels.has(index)) return;
      binding.element.style.visibility = "hidden";
      binding.element.style.opacity = "0";
      binding.element.style.pointerEvents = "none";
      binding.element.tabIndex = -1;
      binding.element.setAttribute("aria-hidden", "true");
      binding.element.dataset.state = "idle";
    });
    for (const layer of layers) {
      if (layer.opacity <= .001) continue;
      const person = all[layer.personId];
      const width = person.bodyHeight * (this.captured ? .74 : .44);
      const height = person.bodyHeight * 1.05;
      this.placeLabel(person, layer, person.screenX - width / 2, person.screenY - height, width, height);
    }
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", this.syncPlayback);
    this.rain.dispose();
    [...this.atlases, ...this.heatmaps, this.highlightSurface].forEach((atlas) => { atlas.width = 0; atlas.height = 0; });
    this.atlases = [];
    this.heatmaps = [];
  }
}
