export function WorkPageStyles() {
  return (
    <style jsx global>{`
      .work-page {
        --site-content-inset: max(var(--site-gutter), calc((100% - 1300px) / 2));
        background: var(--surface-default);
      }

      .work-page-surface {
        position: relative;
        z-index: 1;
        min-height: calc(100svh - 80px);
        background: var(--surface-default);
        color: var(--text-primary);
      }

      .work-page-content {
        width: calc(100% - var(--site-gutter) * 2);
        max-width: 1300px;
        margin: 0 auto;
        padding: 72px 0 110px;
      }

      .work-page-heading {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }

      .work-page-list {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .work-page-list > li {
        border-bottom: 1px solid #e0e2da;
      }

      .work-featured {
        display: grid;
        grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.4fr);
        align-items: center;
        gap: clamp(40px, 5vw, 80px);
        padding: 0 0 40px;
      }

      .work-item-number {
        font-size: 11px;
        line-height: 1.5;
        font-variant-numeric: tabular-nums;
        color: var(--text-secondary);
      }

      .work-featured h2 {
        margin: 0 0 18px;
        font-family: var(--font-handwriting-en);
        font-size: 60px;
        line-height: 1;
        font-weight: 400;
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
        border: 0;
        background: var(--surface-secondary);
        border-radius: 28px;
        font-size: 13px;
        font-weight: 500;
        transition: background 180ms, color 180ms;
        -webkit-tap-highlight-color: transparent;
      }

      .work-visit:hover {
        background: var(--text-primary);
        color: var(--surface-default);
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
        background: transparent;
      }

      .work-media-stage video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        background: transparent;
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
        font-family: var(--site-font);
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
          width: calc(100% - var(--site-gutter) * 2);
          padding: 60px 0 88px;
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
          width: calc(100% - var(--site-gutter) * 2);
          padding: 48px 0 64px;
        }

        .work-featured { grid-template-columns: 1fr; gap: 28px; padding-bottom: 24px; }
        .work-featured h2 { font-size: 50px; margin-bottom: 16px; }
        .work-row { grid-template-columns: 20px minmax(0, 1fr) 16px; gap: 14px; min-height: 120px; padding: 24px 0; }
        .work-item-title { font-size: 28px; }
        .work-row-visit { margin-left: 0; gap: 0; font-size: 0; }
      }

      @media (prefers-reduced-motion: reduce) {
        .work-visit { transition: none; }
      }
    `}</style>
  );
}
