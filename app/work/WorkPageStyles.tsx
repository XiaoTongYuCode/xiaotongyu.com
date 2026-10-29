export function WorkPageStyles() {
  return (
    <style jsx global>{`
      .work-page {
        background: var(--surface-invert);
      }

      .work-page-surface {
        position: relative;
        z-index: 1;
        min-height: 100vh;
        margin-bottom: var(--footer-reveal-height);
        border-radius: 0 0 18px 18px;
        background: var(--surface-default);
        color: var(--text-primary);
      }

      .work-page-content {
        width: min(100% - 96px, 1280px);
        margin: 0 auto;
        padding: 128px 0 120px;
      }

      .work-page-heading {
        margin-bottom: 32px;
      }

      .work-page-heading h1 {
        margin: 0;
        font-family: "Exposure", Georgia, "Times New Roman", serif;
        font-size: 42px;
        font-weight: 600;
        line-height: 1.15;
        letter-spacing: -0.035em;
      }

      :lang(zh-CN) .work-page-heading h1 {
        font-family: "Noto Serif CJK SC", "Songti SC", "STSong", Georgia, serif;
        font-weight: 520;
        letter-spacing: -0.04em;
      }

      .work-page-list {
        margin: 0;
        padding: 0;
        border-top: 1px solid rgba(23, 19, 16, 0.18);
        list-style: none;
      }

      .work-page-list > li {
        border-bottom: 1px solid rgba(23, 19, 16, 0.18);
      }

      .work-featured {
        display: grid;
        grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.4fr);
        align-items: center;
        gap: clamp(40px, 5vw, 80px);
        padding: 40px 0;
      }

      .work-item-number {
        font-size: 11px;
        line-height: 1.5;
        font-variant-numeric: tabular-nums;
        color: var(--text-secondary);
      }

      .work-featured h2 {
        margin: 0 0 18px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 52px;
        line-height: 1;
        font-weight: 400;
        letter-spacing: -0.04em;
      }

      .work-featured-description {
        max-width: 390px;
        margin: 0;
        color: var(--text-secondary);
        font-size: 14px;
        line-height: 1.8;
        text-wrap: pretty;
      }

      .work-item-kind {
        margin: 0;
        color: var(--text-secondary);
        font-size: 11px;
        line-height: 1.7;
        letter-spacing: 0.025em;
      }

      .work-visit {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: 28px;
        min-height: 44px;
        margin-top: 28px;
        padding: 0 15px 0 18px;
        border: 1px solid rgba(23, 19, 16, 0.2);
        border-radius: 8px;
        font-size: 13px;
        font-weight: 500;
        transition: transform 100ms ease-out;
        -webkit-tap-highlight-color: transparent;
      }

      .work-visit:hover {
        background: var(--text-primary);
        color: var(--surface-default);
      }

      .work-visit:active {
        transform: scale(0.97);
      }

      .work-page-content a:focus-visible,
      .work-page-content button:focus-visible,
      .work-page-content video:focus-visible {
        outline: 2px solid var(--blue-700);
        outline-offset: 5px;
      }

      .work-media {
        min-width: 0;
      }

      .work-media-stage {
        position: relative;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        border-radius: 16px;
        background: #080808;
        outline: 1px solid rgba(23, 19, 16, 0.08);
        outline-offset: -1px;
      }

      .work-media-stage video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background: #080808;
        object-fit: contain;
      }

      .work-film-error {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 16px;
        margin: 0;
        padding: 24px;
        background: #080808;
        color: #f8f7f5;
        font-size: 14px;
        text-align: center;
      }

      .work-film-error a {
        text-decoration: underline;
        text-underline-offset: 4px;
      }

      .work-row {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr) minmax(160px, 0.65fr) auto;
        align-items: center;
        gap: 24px;
        min-height: 148px;
        padding: 30px 0;
      }

      .work-row:hover {
        background: rgba(23, 19, 16, 0.025);
      }

      .work-item-title {
        margin: 0 0 10px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 32px;
        font-weight: 400;
        line-height: 1.1;
        letter-spacing: -0.03em;
      }

      .work-item-description {
        max-width: 460px;
        margin: 0;
        color: var(--text-secondary);
        font-size: 13px;
        line-height: 1.7;
      }

      .work-row > .work-item-kind {
        justify-self: end;
        text-align: right;
      }

      .work-row-visit {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 16px;
        margin-left: 12px;
        font-size: 12px;
        white-space: nowrap;
      }

      @media (max-width: 1024px) {
        .work-page-surface {
          margin-bottom: 0;
          border-radius: 0;
        }

        .work-page-content {
          width: calc(100% - 64px);
          padding: 128px 0 88px;
        }

        .work-featured {
          gap: 32px;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
        }

        .work-featured h2 { font-size: 44px; }
        .work-featured-description { font-size: 13px; }
        .work-row { grid-template-columns: 30px minmax(0, 1fr) auto; gap: 20px; }
        .work-row > .work-item-kind { grid-column: 2; justify-self: start; text-align: left; margin-top: -12px; }
        .work-row-visit { grid-column: 3; grid-row: 1 / 3; }
        .work-item-number { align-self: start; padding-top: 7px; }
      }

      @media (max-width: 720px) {
        .work-page-content {
          width: calc(100% - 40px);
          padding: 104px 0 64px;
        }

        .work-page-heading { margin-bottom: 24px; }
        .work-page-heading h1 { font-size: 32px; }
        .work-featured { grid-template-columns: 1fr; gap: 28px; padding: 28px 0 24px; }
        .work-featured h2 { font-size: 44px; margin-bottom: 16px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .work-visit { transition: none; }
      }
    `}</style>
  );
}
