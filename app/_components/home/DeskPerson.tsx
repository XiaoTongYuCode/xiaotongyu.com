import { useEffect, useId, useRef } from "react";
import styles from "./home.module.css";
import { WALKER_ATLAS, WALKER_BLURS } from "./walkerAtlas";

/** A seated adult in the crowd's soft silhouette style, traced from concept A. */
export default function DeskPerson() {
  const sceneRef = useRef<SVGSVGElement>(null);
  const gazeRef = useRef<SVGGElement>(null);
  const id = useId().replaceAll(":", "");
  const soft = `${id}-soft`;
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
      const dx = event.clientX - (rect.left + rect.width * 90 / 260);
      const dy = event.clientY - (rect.top + rect.height * 39 / 190);
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
          <filter id={soft} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
            {/* Match the crowd's blur relative to the silhouette's rendered height. */}
            <feGaussianBlur stdDeviation={WALKER_BLURS[0] * 156 / WALKER_ATLAS.bodyHeight} />
          </filter>
          <linearGradient id={monitor} x1="168" y1="58" x2="199" y2="69" gradientUnits="userSpaceOnUse">
            <stop stopColor="#92948e" /><stop offset="1" stopColor="#797b75" />
          </linearGradient>
          <linearGradient id={tabletop} x1="135" y1="94" x2="194" y2="101" gradientUnits="userSpaceOnUse">
            <stop stopColor="#bfc1bb" /><stop offset="1" stopColor="#a8aaa3" />
          </linearGradient>
          <g id={profile}>
            <path d="M80 46 Q76 40 78 32 Q79 24 88 24 Q97 23 101 28 L102 35 L105 40 Q105 41 102 42 L103 45 Q103 50 98 52 L88 51Z" fill="#535450" />
          </g>
        </defs>

        <ellipse cx="140" cy="179" rx="88" ry="5" fill="#656963" opacity=".07" />
        <g filter={`url(#${soft})`} opacity=".76">
          {/* Far desk frame sits behind the legs; each frame reaches the same floor. */}
          <path d="M124 98 L124 169 L204 169 L204 98" stroke="#999b95" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M124 100 L204 100" stroke="#a3a59f" strokeWidth="3" />

          {/* Chair seat, stem and five-point base support the pelvis. */}
          <path d="M70 83 Q62 79 62 88 L65 119 Q65 124 72 124 L77 121 L75 88 Q75 84 70 83Z" fill="#7d7f78" />
          <path d="M68 120 Q65 133 77 135" stroke="#73756e" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M75 129 L115 129 Q120 129 119 134 Q118 137 113 137 L78 137 Q72 136 73 132Z" fill="#73756e" />
          <path d="M94 137 L94 161" stroke="#7f817a" strokeWidth="4.5" />
          <path d="M94 160 L69 170 M94 160 L115 169 M94 160 L62 176 M94 160 L119 177 M94 160 L94 179" stroke="#73756e" strokeWidth="3" strokeLinecap="round" />
          <g fill="#686a63">
            <ellipse cx="69" cy="172" rx="3.2" ry="3.3" />
            <ellipse cx="115" cy="171" rx="3.2" ry="3.3" />
            <ellipse cx="62" cy="177" rx="3.2" ry="3.5" />
            <ellipse cx="119" cy="178" rx="3.2" ry="3.5" />
            <ellipse cx="94" cy="180" rx="3.2" ry="3.5" />
          </g>

          {/* Horizontal thighs, long upright shins, and two grounded shoes. */}
          <path d="M90 115 Q111 110 139 113 Q149 114 149 123 L146 167 L136 167 L136 130 L97 132Z" fill="#535450" />
          <path d="M136 166 L146 166 L148 171 L159 174 Q162 178 158 178 L136 177Z" fill="#535450" />
          <path d="M76 116 Q87 112 101 115 L135 117 Q142 118 142 126 L139 171 L128 171 L129 133 L86 132 Q76 132 74 124Z" fill="#535450" />
          <path d="M128 170 L139 170 L142 176 L152 178 Q155 182 150 182 L129 181 Q126 179 128 170Z" fill="#535450" />

          {/* The keyboard and monitor stand sit on the same shallow desktop plane. */}
          <path d="M118 97 L204 94 L225 98 L139 101 L118 100Z" fill={`url(#${tabletop})`} />
          <path d="M118 100 L139 101 L225 98 L225 102 L139 105 L118 103Z" fill="#989b93" />
          <path d="M133 95 L153 94 L159 96 L138 98Z" fill="#777a71" />
          <path d="M180 96 L204 95 L207 97 L183 98Z" fill="#888b83" />
          <path d="M185 65 L191 65 L199 95 L190 96Z" fill="#777a71" />
          <path d="M173 43 L201 39 L198 82 L167 87Z" fill={`url(#${monitor})`} />
          <path d="M201 39 L203 40 L200 84 L198 82Z" fill="#71746c" />

          <g className={styles.deskBody}>
            <path d="M83 57 L84 48 L94 48 L96 60 L91 65Z" fill="#535450" />
            <path d="M81 57 Q90 55 99 63 Q105 69 103 82 L104 111 L108 117 Q94 123 76 121 L73 93 Q71 68 81 57Z" fill="#535450" />
            <g ref={gazeRef} className={styles.deskGaze}>
              <g className={styles.deskHead}>
                <use href={`#${profile}`} className={styles.deskFaceRight} />
                <use href={`#${profile}`} transform="translate(180 0) scale(-1 1)" className={styles.deskFaceLeft} />
              </g>
            </g>

            {/* Hands pivot at the cuffs, keeping the wrists attached while typing. */}
            <path d="M98 66 Q103 65 105 74 L107 88 L126 90 L126 94 L101 94 Q97 93 96 88 L94 73Z" fill="#535450" />
            <g className={styles.deskFarHand}>
              <path d="M124 90 L133 88 Q136 88 139 90 L145 93 L144 95 L136 92 L133 93 L124 94Z" fill="#535450" />
            </g>
            <path d="M81 65 Q88 62 91 71 L94 95 L118 91 L120 98 L90 103 Q81 104 80 97 L76 74 Q75 68 81 65Z" fill="#535450" />
            <g className={styles.deskNearHand}>
              <path d="M117 91 L127 90 Q131 87 135 90 L142 94 L141 97 L134 93 L130 95 L119 98Z" fill="#535450" />
            </g>
          </g>

          {/* The near desk frame occludes the far shoe tip at the desk's edge. */}
          <path d="M155 105 L155 180 L220 180 L220 102" stroke="#85887f" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M155 105 L220 102" stroke="#93968d" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}
