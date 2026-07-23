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
        overflow: hidden;
        border-radius: 0 0 18px 18px;
        background: var(--surface-default);
        color: var(--text-primary);
      }

      .work-page-content {
        width: min(100%, 1120px);
        min-height: max(720px, calc(100vh - 80px));
        margin: 0 auto;
        padding: clamp(160px, 19vh, 240px) 48px 144px;
      }

      .work-page-heading {
        display: grid;
        grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1.1fr);
        align-items: end;
        gap: clamp(48px, 9vw, 128px);
        margin-bottom: 48px;
      }

      .work-page-heading h1 {
        max-width: 540px;
        margin: 0;
        font-family: "Exposure", Georgia, "Times New Roman", serif;
        font-size: clamp(56px, 5.6vw, 80px);
        font-weight: 600;
        line-height: 0.92;
        letter-spacing: -0.045em;
        text-wrap: balance;
      }

      :lang(zh-CN) .work-page-heading h1 {
        font-family:
          "Noto Serif CJK SC",
          "Songti SC",
          "STSong",
          Georgia,
          serif;
        font-size: clamp(50px, 5.2vw, 72px);
        font-weight: 520;
        line-height: 1.04;
        letter-spacing: -0.04em;
      }

      .work-page-heading p {
        max-width: 470px;
        margin: 0 0 4px;
        color: var(--text-secondary);
        font-size: 15px;
        line-height: 1.55;
        text-wrap: pretty;
      }

      .work-page-list {
        margin: 0;
        padding: 0;
        border-top: 1px solid rgba(23, 19, 16, 0.18);
        list-style: none;
      }

      .work-page-list li {
        border-bottom: 1px solid rgba(23, 19, 16, 0.18);
      }

      .work-page-list a {
        display: grid;
        grid-template-columns: 48px minmax(270px, 1.25fr) minmax(250px, 1fr) 24px;
        align-items: center;
        gap: 18px;
        min-height: 116px;
        padding: 22px 0;
        color: inherit;
        transition:
          background 180ms ease,
          padding 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      .work-page-list a:hover,
      .work-page-list a:focus-visible {
        padding-right: 14px;
        padding-left: 14px;
        background: rgba(23, 19, 16, 0.045);
      }

      .work-page-list a:focus-visible {
        outline: 2px solid var(--blue-700);
        outline-offset: 3px;
      }

      .work-item-number,
      .work-item-kind {
        color: rgba(23, 19, 16, 0.48);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .work-item-copy {
        display: flex;
        min-width: 0;
        flex-direction: column;
        gap: 5px;
      }

      .work-item-title {
        font-family: Georgia, "Times New Roman", serif;
        font-size: 30px;
        line-height: 1.05;
        letter-spacing: -0.025em;
      }

      .work-item-description {
        max-width: 470px;
        color: rgba(23, 19, 16, 0.58);
        font-size: 13px;
        line-height: 1.45;
      }

      .work-item-kind {
        text-align: right;
        line-height: 1.4;
      }

      .work-item-arrow {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        transition: transform 180ms ease;
      }

      .work-page-list a:hover .work-item-arrow,
      .work-page-list a:focus-visible .work-item-arrow {
        transform: translateX(3px);
      }

      @media (max-width: 1024px) {
        .work-page-surface {
          margin-bottom: 0;
          border-radius: 0;
        }

        .work-page-content {
          min-height: 0;
          padding: 152px 24px 104px;
        }

        .work-page-heading {
          grid-template-columns: 1fr;
          gap: 28px;
          margin-bottom: 44px;
        }

        .work-page-heading h1 {
          font-size: clamp(48px, 8vw, 64px);
          line-height: 0.94;
        }

        :lang(zh-CN) .work-page-heading h1 {
          font-size: clamp(44px, 7vw, 58px);
        }

        .work-page-heading p {
          max-width: 560px;
          font-size: 15px;
        }

        .work-page-list a {
          grid-template-columns: 36px minmax(0, 1fr) 20px;
          gap: 14px;
          min-height: 0;
          padding: 24px 0;
        }

        .work-item-kind {
          grid-column: 2;
          text-align: left;
        }

        .work-item-arrow {
          grid-column: 3;
          grid-row: 1 / span 2;
        }
      }

      @media (max-width: 560px) {
        .work-page-content {
          padding-top: 132px;
          padding-bottom: 80px;
        }

        .work-page-heading {
          gap: 22px;
          margin-bottom: 36px;
        }

        .work-page-heading h1 {
          max-width: 5em;
          font-size: clamp(44px, 13vw, 58px);
        }

        :lang(zh-CN) .work-page-heading h1 {
          font-size: clamp(40px, 11vw, 52px);
        }

        .work-page-list a {
          grid-template-columns: 30px minmax(0, 1fr) 18px;
          gap: 10px;
        }

        .work-page-list a:hover,
        .work-page-list a:focus-visible {
          padding-right: 8px;
          padding-left: 8px;
        }

        .work-item-title {
          font-size: 25px;
        }

        .work-item-description {
          font-size: 12px;
        }

        .work-item-kind {
          font-size: 10px;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .work-page-list a,
        .work-item-arrow {
          transition: none;
        }
      }
    `}</style>
  );
}
