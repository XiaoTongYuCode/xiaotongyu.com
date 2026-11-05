import { useEffect, useId, useRef } from "react";
import styles from "./home.module.css";

/** A softly focused three-quarter view, with the monitor's back toward the viewer. */
export default function DeskPerson() {
  const sceneRef = useRef<SVGSVGElement>(null);
  const gazeRef = useRef<SVGGElement>(null);
  const id = useId().replaceAll(":", "");
  const soft = `${id}-soft`;
  const cloth = `${id}-cloth`;
  const monitor = `${id}-monitor`;
  const tabletop = `${id}-table`;
  const profile = `${id}-profile`;

  useEffect(() => {
    const scene = sceneRef.current;
    const gaze = gazeRef.current;
    if (!scene || !gaze) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pose = { yaw: 1, tilt: 0, shift: 0 };
    let target = { ...pose };
    let frame = 0, previous = 0;
    const apply = () => {
      gaze.style.setProperty("--gaze-scale", (.78 + Math.abs(pose.yaw) * .22).toFixed(4));
      gaze.style.setProperty("--gaze-right", ((1 + pose.yaw) * .5).toFixed(4));
      gaze.style.setProperty("--gaze-left", ((1 - pose.yaw) * .5).toFixed(4));
      gaze.style.setProperty("--gaze-tilt", `${pose.tilt.toFixed(3)}deg`);
      gaze.style.setProperty("--gaze-shift", `${pose.shift.toFixed(3)}px`);
    };
    const animate = (now: number) => {
      const blend = 1 - Math.exp(-(previous ? Math.min(now - previous, 64) : 16) / 150);
      previous = now;
      pose.yaw += (target.yaw - pose.yaw) * blend;
      pose.tilt += (target.tilt - pose.tilt) * blend;
      pose.shift += (target.shift - pose.shift) * blend;
      apply();
      if (Math.abs(target.yaw - pose.yaw) + Math.abs(target.tilt - pose.tilt) + Math.abs(target.shift - pose.shift) > .003) {
        frame = requestAnimationFrame(animate);
      } else {
        frame = 0;
        previous = 0;
      }
    };
    const aim = (next: typeof pose, engaged: boolean) => {
      target = next;
      gaze.dataset.engaged = String(engaged);
      if (preference.matches) {
        cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
        Object.assign(pose, target);
        apply();
      } else if (!frame && Math.abs(target.yaw - pose.yaw) + Math.abs(target.tilt - pose.tilt) + Math.abs(target.shift - pose.shift) > .003) {
        frame = requestAnimationFrame(animate);
      }
    };
    const rest = () => aim({ yaw: 1, tilt: 0, shift: 0 }, false);
    const follow = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = scene.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width * 94 / 260);
      const dy = event.clientY - (rect.top + rect.height * 57 / 190);
      const distance = Math.hypot(dx, dy);
      if (distance >= 150 || rect.bottom < 0 || rect.top > window.innerHeight) {
        rest();
        return;
      }
      const near = 1 - distance / 150;
      const attention = near * near * (3 - 2 * near);
      const side = Math.tanh(dx / 22);
      const pitch = Math.max(-12, Math.min(12, Math.atan2(dy, Math.abs(dx) + 35) * 180 / Math.PI * .3));
      aim({
        yaw: 1 + (side - 1) * attention,
        tilt: pitch * (dx < 0 ? -1 : 1) * attention,
        shift: side * attention * 1.1,
      }, true);
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) rest(); };
    window.addEventListener("pointermove", follow, { passive: true });
    window.addEventListener("pointerout", leave);
    window.addEventListener("blur", rest);
    window.addEventListener("scroll", rest, { passive: true });
    preference.addEventListener("change", rest);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", follow);
      window.removeEventListener("pointerout", leave);
      window.removeEventListener("blur", rest);
      window.removeEventListener("scroll", rest);
      preference.removeEventListener("change", rest);
    };
  }, []);

  return (
    <div className={styles.aboutIllustration} aria-hidden="true">
      <svg ref={sceneRef} className={styles.deskScene} viewBox="0 0 260 190" fill="none" focusable="false">
        <defs>
          <filter id={soft} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
          <linearGradient id={cloth} x1="78" y1="87" x2="110" y2="103" gradientUnits="userSpaceOnUse">
            <stop stopColor="#818181" /><stop offset=".5" stopColor="#606060" /><stop offset="1" stopColor="#494949" />
          </linearGradient>
          <linearGradient id={monitor} x1="144" y1="76" x2="194" y2="111" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a8adaa" /><stop offset="1" stopColor="#7f8581" />
          </linearGradient>
          <linearGradient id={tabletop} x1="124" y1="104" x2="175" y2="137" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d4d6d2" /><stop offset="1" stopColor="#b6bab5" />
          </linearGradient>
          <g id={profile}>
            <path d="M87 64 Q81 59 84 51 Q85 44 93 44 Q101 44 102 51 L102 56 L105 59 L102 61 Q100 69 93 70 L87 67Z" fill="#929292" />
            <path d="M86 65 Q79 56 84 49 Q88 42 96 44 Q103 45 103 51 Q98 49 95 54 L94 61 L90 63 L88 68Z" fill="#505050" />
            <path d="M100 56 L101 61 L98 64" stroke="#777" strokeWidth="1.2" strokeLinecap="round" opacity=".5" />
          </g>
        </defs>

        <ellipse cx="149" cy="178" rx="83" ry="8" fill="#656963" opacity=".065" transform="rotate(-6 149 178)" />
        <g filter={`url(#${soft})`}>
          {/* The chair and staggered feet sit behind the desk's nearer edge. */}
          <path d="M76 79 Q66 80 67 91 L72 120 L95 117 L91 84 Q87 77 76 79Z" fill="#979a95" />
          <path d="M72 120 L98 114 L117 127 L90 139 L72 130Z" fill="#777c77" />
          <path d="M91 137 L92 165 M92 165 L72 176 M92 165 L114 173 M92 165 L96 181" stroke="#848983" strokeWidth="3" strokeLinecap="round" />
          <path d="M98 116 Q110 115 130 126 L135 156 L127 158 L120 134 L95 129Z" fill="#737373" />
          <path d="M127 155 L135 155 L140 160 L149 162 Q152 166 146 167 L128 165Z" fill="#555" />
          <path d="M82 118 Q93 116 116 134 Q120 138 117 145 L114 172 L105 173 L106 142 L81 133Z" fill="#535353" />
          <path d="M105 169 L114 169 L119 174 L130 176 Q133 180 127 181 L106 178Z" fill="#454545" />

          {/* One shared perspective: receding edges, visible top, thick fascia. */}
          <path d="M106 116 L104 164 M176 98 L178 151" stroke="#a5aaa4" strokeWidth="3" strokeLinecap="round" />
          <path d="M103 113 L177 94 L221 119 L147 140Z" fill={`url(#${tabletop})`} />
          <path d="M103 113 L147 140 L147 144 L103 117Z" fill="#a4aaa3" />
          <path d="M147 140 L221 119 L221 123 L147 144Z" fill="#969d95" />
          <path d="M148 144 L146 184 M218 124 L219 172" stroke="#969d95" strokeWidth="3.6" strokeLinecap="round" />
          <path d="M116 114 L141 107 L155 115 L129 123Z" fill="#9fa59e" />

          <g className={styles.deskBody}>
            {/* Both shoulders are visible; the near shoulder and sleeve are fuller. */}
            <path d="M83 76 Q94 70 106 77 Q112 85 111 99 L116 121 Q99 131 78 123 L76 100 Q75 83 83 76Z" fill={`url(#${cloth})`} />
            <path d="M89 77 L89 66 L97 65 L100 77 Q95 81 89 77Z" fill="#8d8d8d" />
            <path d="M95 80 Q101 95 101 119" stroke="#4b4b4b" strokeWidth="1.4" opacity=".3" />
            <g ref={gazeRef} className={styles.deskGaze}>
              <g className={styles.deskHead}>
                <use href={`#${profile}`} className={styles.deskFaceRight} />
                <use href={`#${profile}`} transform="translate(188 0) scale(-1 1)" className={styles.deskFaceLeft} />
              </g>
            </g>
            <path d="M105 81 Q111 80 114 86 L120 102 L138 108 L136 114 L116 110 Q112 109 110 103 L103 90Z" fill="#666" />
            <g className={styles.deskFarHand}>
              <path d="M136 108 L146 110 L148 114 L145 116 L134 113Z" fill="#929292" />
            </g>
            <path d="M83 82 Q90 80 93 88 L99 106 L124 115 L121 122 L94 114 Q89 112 87 106 L79 92Z" fill="#626262" />
            <g className={styles.deskNearHand}>
              <path d="M122 115 L132 117 L136 121 Q136 125 130 124 L120 121Z" fill="#989898" />
            </g>
          </g>

          {/* The screen faces the sitter; only its rear casing and stand face us. */}
          <path d="M153 130 L171 124 L190 133 L173 138Z" fill="#838a82" />
          <path d="M164 106 L170 105 L175 130 L168 132Z" fill="#747c73" />
          <path d="M142 76 L190 65 L193 104 L146 116Z" fill={`url(#${monitor})`} />
          <path d="M190 65 L194 67 L197 106 L193 104Z" fill="#696f69" />
          <path d="M146 116 L193 104 L197 106 L150 119Z" fill="#70776f" />
          <path d="M144 77 L189 67" stroke="#c1c5c0" strokeWidth="1.2" opacity=".6" />
          <path d="M158 96 L176 92 M159 99 L177 95" stroke="#6f776f" strokeWidth="1.1" opacity=".35" />
        </g>
      </svg>
    </div>
  );
}
