import { WALKING_STYLES } from "./walkingStyles";

const TAU = Math.PI * 2;
export const CAMERA = { near: 8.5, far: 23, focal: .28 };
const STEP = 1 / 60;
const TIME_SCALE = .57;
const HISTORY = 64;
export const BASE_CROWD_COUNT = 72;
export const MAX_CROWD_COUNT = 120;

/** Keep the established 1100 × 330 scene density as the canvas grows. */
export function crowdCountForSize(width: number, height: number) {
  const area = Math.min(width, 1400) * Math.min(height, 430);
  return Math.min(MAX_CROWD_COUNT, Math.round(BASE_CROWD_COUNT * Math.max(1, area / (1100 * 330))));
}

export type CrowdPerson = {
  id: number;
  x: number;
  z: number;
  speed: number;
  direction: number;
  heading: number;
  group: number;
  phase: number;
  variant: number;
  height: number;
  stride: number;
  profileIndex: number;
};

export type WorldPose = { x: number; z: number; vx: number; vz: number; gait: number };
export type ProjectedPerson = CrowdPerson & {
  depth: number;
  screenX: number;
  screenY: number;
  bodyHeight: number;
  opacity: number;
  gait: number;
  normalizedX: number;
};

export const TRACK_COLORS = ["#16865e", "#e36572", "#4267cf", "#d97728"];
export const TRACK_CYCLE = 10.2;
export const HANDOFF_DURATION = .95;
export const FIRST_HANDOFFS = [8.4, 5, 1.6];
export const SHUTTER_SAMPLES = [
  { delay: .32, weight: .07 }, { delay: .19, weight: .12 },
  { delay: .095, weight: .18 }, { delay: .035, weight: .22 }, { delay: 0, weight: .74 },
];

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
export function smoothstep(value: number) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function depthAt(z: number) {
  return (1 / z - 1 / CAMERA.far) / (1 / CAMERA.near - 1 / CAMERA.far);
}

export function createCrowd(profileCount: number, count = BASE_CROWD_COUNT,
  cast?: readonly { height: number; stride: number }[]): CrowdPerson[] {
  let seed = 231105;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
  const sampleDistance = () => 1 / (1 / CAMERA.far
    + Math.pow(random(), 1.65) * (1 / CAMERA.near - 1 / CAMERA.far));
  const people: CrowdPerson[] = [];
  for (let id = 0; id < count; id++) {
    const groupIndex = Math.floor(id / 8);
    const member = id % 8;
    const grouped = member < 2 || (member === 2 && groupIndex % 3 === 0);
    const leader = grouped && member > 0 ? people[id - member] : undefined;
    let z = sampleDistance();
    let x = (random() * 1.28 - .64) * z / CAMERA.focal;
    if (leader) {
      x = leader.x + (member === 1 ? -.55 : .65);
      z = clamp(leader.z + (member === 1 ? .62 : -.57), CAMERA.near, CAMERA.far);
    } else {
      // Random ground positions with only a body-clearance test. No grid, equal
      // screen spacing or density-restoring force: small gatherings are welcome.
      for (let attempt = 0; attempt < 20; attempt++) {
        if (people.every((other) => Math.hypot(x - other.x, z - other.z) > .72)) break;
        z = sampleDistance();
        x = (random() * 1.28 - .64) * z / CAMERA.focal;
      }
    }
    people.push({
      id, x, z,
      speed: leader ? leader.speed * (.96 + random() * .08) : .85 + random() * .58,
      direction: leader?.direction ?? (random() > .48 ? 1 : -1),
      heading: leader?.heading ?? (random() - .5) * .26,
      group: grouped ? groupIndex : -1,
      phase: random() * TAU,
      variant: Math.floor(random() * (cast?.length ?? WALKING_STYLES.length)),
      height: 1.65 + random() * .20,
      stride: 0,
      profileIndex: (id + groupIndex * 3) % profileCount,
    });
  }
  const assigned = new Set<number>();
  for (const [id, x, depth, profileIndex] of [[23, .29, .45, 0], [25, .48, .30, 1], [37, .64, .56, 2], [17, .72, .29, 3]]) {
    const nearest = people.filter((person) => person.id < BASE_CROWD_COUNT && !assigned.has(person.id)).sort((a, b) =>
      Math.hypot(.5 + CAMERA.focal * a.x / a.z - x, (depthAt(a.z) - depth) * .55)
      - Math.hypot(.5 + CAMERA.focal * b.x / b.z - x, (depthAt(b.z) - depth) * .55),
    )[0];
    const previous = people[id];
    people[id] = { ...nearest, id, profileIndex: profileIndex % profileCount };
    if (nearest.id !== id) people[nearest.id] = { ...previous, id: nearest.id };
    assigned.add(id);
  }
  for (const person of people) {
    if (cast) {
      person.height *= cast[person.variant].height / 1.75;
      person.stride = cast[person.variant].stride;
    } else person.stride = WALKING_STYLES[person.variant].stride;
  }
  return people;
}

export function crowdFocalForWidth(width: number) {
  return width < 700 ? 265 : clamp(width * CAMERA.focal, 245, 510);
}

/** Ground-plane pedestrian steering, with a fixed clock and real pose history. */
export class CrowdMotion {
  private states: WorldPose[];
  private tick = 0;
  private history: Float64Array[];
  private ax: Float64Array;
  private az: Float64Array;
  private activeCount: number;
  private gaitProjectionRatio = 1;
  private matchSideView = false;

  constructor(private people: CrowdPerson[]) {
    this.activeCount = people.length;
    this.states = people.map((person) => ({
      x: person.x, z: person.z, vx: person.speed * person.direction,
      vz: person.heading * person.speed, gait: person.phase,
    }));
    this.history = Array.from({ length: HISTORY }, () => new Float64Array(people.length * 5));
    this.ax = new Float64Array(people.length);
    this.az = new Float64Array(people.length);
    this.record();
  }

  setActiveCount(count: number) {
    this.activeCount = Math.min(this.people.length, Math.max(0, Math.round(count)));
  }

  /** Mobile enlarges bodies independently of the camera; match screen travel. */
  setGaitProjection(width: number) {
    this.matchSideView = true;
    this.gaitProjectionRatio = width * CAMERA.focal / crowdFocalForWidth(width);
  }

  private gaitSpeed(pose: WorldPose) {
    return this.matchSideView
      ? Math.abs(pose.vx - pose.x * pose.vz / pose.z) * this.gaitProjectionRatio
      : Math.hypot(pose.vx, pose.vz);
  }

  private record() {
    const frame = this.history[this.tick % HISTORY];
    this.states.forEach((pose, id) => {
      const offset = id * 5;
      frame[offset] = pose.x; frame[offset + 1] = pose.z;
      frame[offset + 2] = pose.vx; frame[offset + 3] = pose.vz;
      frame[offset + 4] = pose.gait;
    });
  }

  update(time: number) {
    while (this.tick * STEP + 1e-9 < time) this.step();
  }

  private step() {
    const dt = STEP * TIME_SCALE;
    const time = this.tick * dt;
    this.states.forEach((state, id) => {
      const person = this.people[id];
      const pace = 1 + .09 * Math.sin(time * .35 + person.phase);
      const desiredX = person.direction * person.speed * pace;
      const desiredZ = person.heading * person.speed + (person.z - state.z) * .10;
      this.ax[id] = (desiredX - state.vx) / .7;
      this.az[id] = (desiredZ - state.vz) / .9;
      this.az[id] += Math.max(0, CAMERA.near + .7 - state.z) * 1.6
        - Math.max(0, state.z - CAMERA.far + .7) * 1.6;
    });

    for (let i = 0; i < this.activeCount; i++) {
      const a = this.states[i], person = this.people[i];
      for (let j = i + 1; j < this.activeCount; j++) {
        const b = this.states[j], other = this.people[j];
        const dx = b.x - a.x, dz = b.z - a.z;
        const distance = Math.hypot(dx, dz);
        if (distance > 4.2) continue;
        const nx = distance > .001 ? dx / distance : (i % 2 ? -1 : 1);
        const nz = distance > .001 ? dz / distance : .5;
        const sameGroup = person.group >= 0 && person.group === other.group;
        const clearance = sameGroup ? .52 : .72;
        const separation = Math.min(3.5, 1.4 * Math.exp((clearance - distance) / .27));
        this.ax[i] -= nx * separation; this.az[i] -= nz * separation;
        this.ax[j] += nx * separation; this.az[j] += nz * separation;

        if (sameGroup) {
          // Gentle cohesion/alignment, weaker than personal-space avoidance.
          const cohesion = clamp((distance - 1.0) * .24, 0, .28);
          this.ax[i] += nx * cohesion + (b.vx - a.vx) * .14;
          this.az[i] += nz * cohesion + (b.vz - a.vz) * .14;
          this.ax[j] -= nx * cohesion + (b.vx - a.vx) * .14;
          this.az[j] -= nz * cohesion + (b.vz - a.vz) * .14;
        } else {
          const dvx = b.vx - a.vx, dvz = b.vz - a.vz;
          const speedSquared = dvx * dvx + dvz * dvz;
          const encounter = speedSquared > .02 ? -(dx * dvx + dz * dvz) / speedSquared : -1;
          if (encounter > 0 && encounter < 1.8) {
            const gap = Math.hypot(dx + dvx * encounter, dz + dvz * encounter);
            const urgency = Math.max(0, 1 - gap / .85) * (1 - encounter / 2.4);
            const side = Math.abs(dz) > .05 ? Math.sign(dz) : (i % 2 ? -1 : 1);
            this.az[i] -= side * urgency * .95;
            this.az[j] += side * urgency * .95;
            this.ax[i] -= person.direction * urgency * .28;
            this.ax[j] -= other.direction * urgency * .28;
          }
        }
      }
    }

    this.states.forEach((state, id) => {
      const person = this.people[id];
      const acceleration = Math.hypot(this.ax[id], this.az[id]);
      const limit = Math.min(1, 2.5 / Math.max(.001, acceleration));
      state.vx += this.ax[id] * limit * dt;
      state.vz += this.az[id] * limit * dt;
      const speed = Math.hypot(state.vx, state.vz);
      const speedLimit = Math.min(1, person.speed * 1.35 / Math.max(.001, speed));
      state.vx *= speedLimit; state.vz *= speedLimit;
      state.x += state.vx * dt;
      state.z = clamp(state.z + state.vz * dt, CAMERA.near, CAMERA.far);
      state.gait += this.gaitSpeed(state) * dt / (person.height * person.stride) * TAU;
      // Recycle only beyond both faded margins, where the jump is invisible.
      const span = 1.36 * state.z / CAMERA.focal;
      if (.5 + CAMERA.focal * state.x / state.z > 1.18) state.x -= span;
      if (.5 + CAMERA.focal * state.x / state.z < -.18) state.x += span;
    });
    this.tick++;
    this.record();
  }

  sample(id: number, time: number): WorldPose {
    if (time >= this.tick * STEP) {
      const pose = this.states[id];
      const ahead = Math.max(0, time - this.tick * STEP) * TIME_SCALE;
      const z = clamp(pose.z + pose.vz * ahead, CAMERA.near, CAMERA.far);
      return { ...pose, x: pose.x + pose.vx * ahead, z,
        gait: pose.gait + this.gaitSpeed(pose) * ahead / (this.people[id].height * this.people[id].stride) * TAU };
    }
    const frame = Math.max(Math.max(0, this.tick - HISTORY + 1), time / STEP);
    const first = Math.floor(frame), second = Math.min(first + 1, this.tick), mix = frame - first;
    const a = this.history[first % HISTORY], b = this.history[second % HISTORY], offset = id * 5;
    const discontinuity = Math.abs(a[offset] - b[offset]) > 10;
    const blend = (index: number) => a[offset + index] + (b[offset + index] - a[offset + index]) * mix;
    return { x: discontinuity ? b[offset] : blend(0), z: blend(1), vx: blend(2), vz: blend(3), gait: blend(4) };
  }
}

export function projectPerson(person: CrowdPerson, pose: WorldPose, width: number, height: number): ProjectedPerson {
  const mobile = width < 700;
  const x = .5 + CAMERA.focal * pose.x / pose.z;
  const depth = depthAt(pose.z);
  const focal = crowdFocalForWidth(width);
  const edge = Math.min(1, Math.max(0, x / .12), Math.max(0, (1 - x) / .12));
  return {
    ...person, depth, normalizedX: x, screenX: x * width,
    // Ground position and body scale both depend on inverse camera distance.
    screenY: (.23 + depth * (mobile ? .55 : .60)) * height,
    bodyHeight: person.height * focal / pose.z,
    opacity: edge * (.76 - .14 * smoothstep((depth - .68) / .32)),
    gait: pose.gait,
  };
}

type Target = { personId: number; edges: number[]; bank: number; startedAt: number };
type Slot = { current: Target; previous?: Target; nextAt: number; generation: number };
export type TrackingLayer = Target & {
  slot: number;
  opacity: number;
  lineOpacity: number;
  reveal: number;
  current: boolean;
  state: "incoming" | "outgoing" | "tracked";
};

/** Three independent highlight channels, sharing a persistent population. */
export class CrowdTimeline {
  private slots: Slot[];

  constructor(private people: CrowdPerson[], readonly motion = new CrowdMotion(people)) {
    const initial = [23, 25, 37];
    this.slots = initial.map((personId, slot) => ({
      current: { personId, edges: [], bank: 0, startedAt: -2 },
      nextAt: FIRST_HANDOFFS[slot],
      generation: 0,
    }));
    this.slots.forEach((slot, index) => {
      slot.current.edges = this.connections(slot.current.personId, 0, index, new Set(initial));
    });
  }

  private point(person: CrowdPerson, time: number) {
    return projectPerson(person, this.motion.sample(person.id, time), 1, 1);
  }

  private connections(personId: number, time: number, slot: number, occupied: Set<number>) {
    const source = this.point(this.people[personId], time);
    const positions = [[-.28, -.21], [.30, -.04], [.14, .29]];
    const chosen = new Set<number>(occupied);
    chosen.add(personId);
    const result: number[] = [];
    for (const [dx, dy] of positions.slice(0, slot === 2 ? 2 : 3)) {
      const candidates = this.people.filter((person) => person.id % 3 !== 0 && !chosen.has(person.id));
      const ranked = candidates.map((person) => {
        const projected = this.point(person, time);
        const distance = Math.hypot(projected.normalizedX - source.normalizedX, (projected.depth - source.depth) * .6);
        return {
          person,
          score: Math.hypot(projected.normalizedX - source.normalizedX - dx, (projected.depth - source.depth - dy) * .6)
            + (projected.normalizedX < .08 || projected.normalizedX > .92 ? 5 : 0)
            + (distance < .13 ? 3 : 0),
        };
      }).sort((a, b) => a.score - b.score);
      if (ranked[0]) {
        result.push(ranked[0].person.id);
        chosen.add(ranked[0].person.id);
      }
    }
    return result;
  }

  private nextPerson(slotIndex: number, time: number) {
    const occupied = new Set(this.slots.flatMap((slot) => [slot.current.personId, ...(slot.previous ? [slot.previous.personId] : [])]));
    const usedProfiles = new Set([...occupied].map((id) => this.people[id].profileIndex));
    const center = [.29, .49, .73][slotIndex];
    const preferredDepth = (this.slots[slotIndex].generation % 2 === 0) ? .32 : .51;
    const candidates = this.people.filter((person) => {
      const depth = this.point(person, time).depth;
      return person.id % 3 !== 0 && !occupied.has(person.id) && depth > .15 && depth < .75;
    });
    const ranked = candidates.map((person) => {
      const point = this.point(person, time);
      const x = point.normalizedX;
      const endX = this.point(person, time + TRACK_CYCLE).normalizedX;
      // A pedestrian may accelerate after yielding. Reserve the full speed
      // envelope as well as the instantaneous-velocity prediction.
      const pose = this.motion.sample(person.id, time);
      const horizonX = x + person.direction * person.speed * 1.35 * TIME_SCALE * TRACK_CYCLE
        * CAMERA.focal / Math.max(CAMERA.near, pose.z - 1);
      const collision = this.slots.some((slot, index) => {
        if (index === slotIndex) return false;
        const other = this.people[slot.current.personId];
        const until = Math.max(0, Math.min(TRACK_CYCLE, slot.nextAt - time));
        const startGap = this.point(other, time).normalizedX - x;
        const endGap = this.point(other, time + until).normalizedX - this.point(person, time + until).normalizedX;
        const closest = startGap * endGap <= 0 ? 0 : Math.min(Math.abs(startGap), Math.abs(endGap));
        return closest < .13 && Math.abs(this.point(other, time).depth - point.depth) < .19;
      });
      return {
        person,
        score: Math.abs(x - center) * 4 + Math.abs(point.depth - preferredDepth)
          + (usedProfiles.has(person.profileIndex) ? 6 : 0)
          + (person.profileIndex === this.people[this.slots[slotIndex].current.personId].profileIndex ? 12 : 0)
          + (x < .15 || x > .80 || endX < .10 || endX > .85 || horizonX < .10 || horizonX > .85 ? 1000 : 0)
          + (collision ? 50 : 0),
      };
    }).sort((a, b) => a.score - b.score);
    return ranked[0]?.person.id ?? this.slots[slotIndex].current.personId;
  }

  update(time: number) {
    this.motion.update(time);
    this.slots.forEach((slot) => {
      if (slot.previous && time - slot.current.startedAt >= HANDOFF_DURATION) slot.previous = undefined;
    });
    // Process crossings chronologically, including a slower device's skipped frames.
    for (;;) {
      let next = -1;
      for (let index = 0; index < this.slots.length; index++) {
        if (this.slots[index].nextAt <= time && (next < 0 || this.slots[index].nextAt < this.slots[next].nextAt)) next = index;
      }
      if (next < 0) break;
      const slot = this.slots[next];
      const at = slot.nextAt;
      this.slots.forEach((other) => {
        if (other.previous && at - other.current.startedAt >= HANDOFF_DURATION) other.previous = undefined;
      });
      const personId = this.nextPerson(next, at);
      const occupied = new Set(this.slots.flatMap((other) => [other.current.personId, ...(other.previous ? [other.previous.personId] : [])]));
      slot.previous = slot.current;
      slot.current = {
        personId,
        edges: this.connections(personId, at, next, occupied),
        bank: 1 - slot.current.bank,
        startedAt: at,
      };
      slot.generation++;
      slot.nextAt += TRACK_CYCLE;
    }
  }

  layers(time: number): TrackingLayer[] {
    return this.slots.flatMap((slot, index) => {
      const elapsed = time - slot.current.startedAt;
      const current: TrackingLayer = {
        ...slot.current,
        slot: index,
        opacity: smoothstep(elapsed / .55),
        lineOpacity: smoothstep(elapsed / .35),
        reveal: Math.max(0, Math.min(1, elapsed / .85)),
        current: true,
        state: elapsed < HANDOFF_DURATION ? "incoming" : "tracked",
      };
      if (!slot.previous || elapsed >= HANDOFF_DURATION) return [current];
      return [{
        ...slot.previous,
        slot: index,
        opacity: 1 - smoothstep(elapsed / HANDOFF_DURATION),
        lineOpacity: 1 - smoothstep(elapsed / .5),
        reveal: 1,
        current: false,
        state: "outgoing" as const,
      }, current];
    });
  }
}
