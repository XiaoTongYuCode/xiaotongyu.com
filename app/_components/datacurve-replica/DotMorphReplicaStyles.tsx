export function DotMorphReplicaStyles() {
  return (
    <style jsx global>{`
      .defining-intelligence-section {
        position: relative;
        z-index: 20;
        height: 1960vh;
        background: var(--surface-default);
        color: var(--text-primary);
      }

      .dotmorph-sticky {
        --dotmorph-canvas-opacity: 0;
        position: sticky;
        top: 0;
        isolation: isolate;
        height: 111.12vh;
        width: 100%;
        overflow: hidden;
        background: var(--surface-default);
      }

      .dotmorph-canvas-mask {
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 0;
        width: 100%;
        height: 100%;
        opacity: var(--dotmorph-canvas-opacity);
        will-change: opacity, transform;
      }

      .hero-line-field {
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 0;
        width: 100%;
        height: 100%;
      }

      .hero-line-field svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }

      .dotmorph-loading {
        pointer-events: none;
        position: absolute;
        bottom: 44px;
        left: 50%;
        z-index: 1;
        display: flex;
        gap: 7px;
        transform: translateX(-50%);
        transition: opacity 360ms ease;
      }

      .dotmorph-loading span {
        width: 5px;
        height: 5px;
        border-radius: 999px;
        background: rgba(23, 19, 16, 0.42);
        animation: dotmorph-loading-pulse 920ms ease-in-out infinite;
      }

      .dotmorph-loading span:nth-child(2) {
        animation-delay: 120ms;
      }

      .dotmorph-loading span:nth-child(3) {
        animation-delay: 240ms;
      }

      .dotmorph-intro {
        position: absolute;
        inset: 0;
        z-index: 5;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 0 128px;
        text-align: center;
        transition: opacity 200ms linear;
      }

      .dotmorph-intro > div {
        margin: 0 auto;
        display: flex;
        max-width: 1100px;
        flex-direction: column;
        align-items: center;
        gap: 44px;
        animation: dotmorph-intro-enter 920ms cubic-bezier(0.16, 1, 0.3, 1) 170ms both;
        will-change: transform, opacity;
      }

      .dotmorph-intro h1 {
        margin: 0;
        max-width: 100%;
        color: var(--text-primary);
        font-family: "Exposure", "Suisse Intl", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: clamp(52px, 4.7vw, 76px);
        font-weight: 400;
        line-height: 1.1;
        letter-spacing: -0.04em;
        text-wrap: balance;
      }

      :lang(zh-CN) .dotmorph-intro h1 {
        max-width: 980px;
        font-family:
          "XTY Hero Display",
          "Noto Sans SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Noto Sans CJK SC",
          "Suisse Intl",
          "Helvetica Neue",
          Arial,
          sans-serif;
        font-size: clamp(48px, 4.35vw, 68px);
        font-weight: 400;
        line-height: 1.08;
        letter-spacing: 0.02em;
        font-synthesis: none;
      }

      .dotmorph-intro p {
        margin: 0;
        max-width: 565px;
        color: rgba(23, 19, 16, 0.55);
        font-size: clamp(15px, 1.1vw, 17px);
        line-height: 1.31;
        letter-spacing: 0.01em;
      }

      :lang(zh-CN) .dotmorph-intro p {
        max-width: 660px;
        line-height: 1.48;
        letter-spacing: 0;
      }

      .dotmorph-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 14px;
      }

      .dotmorph-actions a {
        display: inline-flex;
        min-height: 46px;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 15px;
        font-weight: 650;
        line-height: 1;
        transition:
          background 180ms ease,
          transform 180ms ease;
      }

      .dotmorph-actions a:first-child {
        background: rgba(23, 19, 16, 0.86);
        color: var(--text-invert);
        outline: 2px solid rgba(255, 255, 255, 0.1);
        outline-offset: -2px;
      }

      .dotmorph-actions a:last-child {
        background: #ffffff;
        color: var(--text-primary);
        outline: 2px solid rgba(23, 19, 16, 0.12);
        outline-offset: -2px;
      }

      .dotmorph-actions a:active {
        transform: scale(0.98);
      }

      .dotmorph-story {
        pointer-events: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        z-index: 5;
        display: flex;
        width: min(100%, 1600px);
        align-items: center;
        opacity: 0;
        padding: 0 120px;
        transform: translateX(-50%);
        transition: opacity 300ms linear;
      }

      .dotmorph-story p {
        margin: 0 0 0 auto;
        max-width: 440px;
        text-align: right;
        color: var(--text-primary);
        font-family: Georgia, "Times New Roman", serif;
        font-size: 40px;
        font-weight: 400;
        line-height: 1.2;
        letter-spacing: -0.4px;
        text-wrap: pretty;
      }

      .content-section {
        position: relative;
        z-index: 30;
        scroll-margin-top: 96px;
        background: var(--surface-default);
        margin-bottom: var(--footer-reveal-height);
        padding: 26vh 0 128px;
        border-radius: 0 0 18px 18px;
        color: var(--text-primary);
      }

      .section-anchor {
        position: absolute;
        inset: 0 auto auto 0;
      }

      .content-section > div {
        margin: 0 auto;
        width: 100%;
        max-width: 980px;
        padding: 0 48px;
      }

      .section-kicker {
        margin: 0 auto;
        max-width: 720px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 44px;
        line-height: 1.18;
        letter-spacing: -0.6px;
      }

      .copy-stack {
        margin: 48px auto 0;
        max-width: 720px;
        display: grid;
        gap: 28px;
        color: rgba(23, 19, 16, 0.7);
        font-size: 18px;
        line-height: 1.6;
      }

      .copy-stack p {
        margin: 0;
      }

      .copy-stack a {
        color: #1d4ed8;
        font-weight: 650;
      }

      @keyframes dotmorph-loading-pulse {
        0%,
        100% {
          opacity: 0.28;
          transform: translateY(0);
        }
        50% {
          opacity: 0.92;
          transform: translateY(-3px);
        }
      }

      @keyframes dotmorph-intro-enter {
        0% {
          opacity: 0;
          transform: translate3d(0, 42px, 0);
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      @media (max-width: 1024px) {
        .dotmorph-sticky {
          height: 100svh;
        }

        .dotmorph-canvas-mask {
          inset: auto 0 auto;
          top: calc(50vh - 65vw);
          height: 65vw;
        }

        .dotmorph-intro {
          align-items: flex-start;
          padding: 72px 24px 0;
          text-align: left;
        }

        .dotmorph-intro > div {
          align-items: flex-start;
          gap: 28px;
        }

        .dotmorph-intro h1 {
          font-size: 44px;
          line-height: 1.06;
        }

        :lang(zh-CN) .dotmorph-intro h1 {
          max-width: 11em;
          font-size: 40px;
          line-height: 1.16;
        }

        .dotmorph-intro p {
          font-size: 15px;
          line-height: 1.4;
        }

        :lang(zh-CN) .dotmorph-intro p {
          max-width: 24em;
          line-height: 1.5;
        }

        .dotmorph-story {
          top: 50vh;
          right: 0;
          bottom: 0;
          left: 0;
          width: auto;
          align-items: flex-start;
          padding: 24px 24px 0;
          transform: none;
        }

        .dotmorph-story p {
          margin: 0 auto;
          max-width: 440px;
          text-align: center;
          font-size: 24px;
          line-height: 1.2;
        }

        .content-section {
          margin-bottom: 0;
          padding: 18vh 0 96px;
          border-radius: 0;
        }

        .content-section > div {
          padding: 0 24px;
        }

        .section-kicker {
          font-size: 28px;
        }

        .copy-stack {
          margin-top: 40px;
          gap: 20px;
          font-size: 15px;
          line-height: 1.55;
        }

      }

      @media (prefers-reduced-motion: reduce) {
        .dotmorph-loading span,
        .dotmorph-canvas-mask,
        .dotmorph-intro,
        .dotmorph-intro > div,
        .dotmorph-story,
        .dotmorph-actions a {
          animation: none;
          transition: none;
        }
      }
    `}</style>
  );
}
