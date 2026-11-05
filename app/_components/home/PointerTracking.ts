import { smoothstep, type ProjectedPerson, type TrackingLayer } from "./crowdSimulation";

export const POINTER_SLOT = 3;
const FADE_DURATION = .24;
export type CrowdPointer = { x: number; y: number; personId?: number };
type Target = { personId: number; edges: number[]; bank: number; startedAt: number };
type DepartingTarget = Target & { exitAt: number; exitOpacity: number };

/** A fourth tracking channel, selected by proximity rather than the automatic timeline. */
export class PointerTracking {
  private current?: Target;
  private departing?: DepartingTarget;

  update(people: ProjectedPerson[], pointer: CrowdPointer | null, time: number, width: number, instant: boolean, hold: boolean) {
    if (this.departing && time - this.departing.exitAt >= FADE_DURATION) this.departing = undefined;
    if (hold) return this.layers(time);

    const visible = people.filter((person) => person.opacity > .22 && person.normalizedX > .025 && person.normalizedX < .975);
    let selected: ProjectedPerson | undefined;
    if (pointer) {
      const radius = Math.max(24, Math.min(56, width * .05));
      const distance = (person: ProjectedPerson) => {
        const dx = Math.max(0, Math.abs(pointer.x - person.screenX) - person.bodyHeight * .22);
        const dy = Math.max(0, person.screenY - person.bodyHeight * 1.05 - pointer.y, pointer.y - person.screenY);
        return Math.hypot(dx, dy);
      };
      const score = (person: ProjectedPerson) => distance(person)
        + Math.hypot(pointer.x - person.screenX, pointer.y - person.screenY + person.bodyHeight * .5) * .08;
      // A label belongs to its walker even when the pointer is over its caption.
      selected = visible.find((person) => person.id === pointer.personId);
      if (!selected) {
        selected = visible.filter((person) => distance(person) <= radius).sort((a, b) => score(a) - score(b))[0];
        const retained = visible.find((person) => person.id === this.current?.personId);
        // Small hysteresis prevents flickering between nearby walkers.
        if (retained && distance(retained) <= radius * 1.15 && (!selected || score(retained) <= score(selected) + 8)) selected = retained;
      }
    }

    if (selected?.id !== this.current?.personId) {
      if (this.current) {
        this.departing = {
          ...this.current, exitAt: time,
          exitOpacity: smoothstep((time - this.current.startedAt) / FADE_DURATION),
        };
      }
      const bank = this.departing ? 1 - this.departing.bank : 0;
      if (instant) this.departing = undefined;
      this.current = selected ? {
        personId: selected.id,
        bank,
        startedAt: instant ? time - FADE_DURATION : time,
        edges: visible.filter((person) => person.id !== selected.id
          && Math.hypot(person.screenX - selected.screenX, person.screenY - selected.screenY) > 45)
          .sort((a, b) => Math.hypot(a.screenX - selected.screenX, a.screenY - selected.screenY)
            - Math.hypot(b.screenX - selected.screenX, b.screenY - selected.screenY))
          .slice(0, 2).map((person) => person.id),
      } : undefined;
    }
    if (instant) {
      this.departing = undefined;
      if (this.current) this.current.startedAt = time - FADE_DURATION;
    }
    return this.layers(time);
  }

  private layers(time: number): TrackingLayer[] {
    const layers: TrackingLayer[] = [];
    if (this.departing) {
      const opacity = this.departing.exitOpacity * (1 - smoothstep((time - this.departing.exitAt) / FADE_DURATION));
      if (opacity > .001) layers.push({
        ...this.departing, slot: POINTER_SLOT, opacity, lineOpacity: opacity,
        reveal: 1, current: false, state: "outgoing",
      });
    }
    if (this.current) {
      const progress = smoothstep((time - this.current.startedAt) / FADE_DURATION);
      layers.push({
        ...this.current, slot: POINTER_SLOT, opacity: progress, lineOpacity: progress,
        reveal: progress, current: true, state: progress < 1 ? "incoming" : "tracked",
      });
    }
    return layers;
  }
}
