export function SiteChromeStyles() {
  return (
    <style jsx global>{`
      .dotmorph-page {
        --surface-default: #f8f7f5;
        --surface-raised: #ffffff;
        --surface-invert: #080808;
        --text-primary: #171310;
        --text-secondary: rgba(23, 19, 16, 0.66);
        --text-invert: #f8f7f5;
        --blue-100: #dceaff;
        --blue-700: #1d4ed8;
        --radius: 8px;
        --footer-reveal-height: min(58vh, 560px);
        min-height: 100vh;
        background: #080808;
        color: var(--text-primary);
        font-family: "Suisse Intl", "Helvetica Neue", Helvetica, Arial, sans-serif;
      }

      .curve-glyph {
        width: auto;
        flex-shrink: 0;
      }

      .site-nav {
        position: fixed;
        inset: 0 0 auto;
        z-index: 55;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 88px;
        pointer-events: none;
        color: #ffffff;
        animation: dotmorph-site-nav-enter 760ms cubic-bezier(0.12, 0.86, 0.18, 1) 80ms both;
        will-change: transform, opacity;
      }

      .site-nav-desktop {
        mix-blend-mode: difference;
      }

      .site-nav-framed.site-nav-desktop {
        color: var(--text-primary);
        mix-blend-mode: normal;
      }

      .site-nav-mobile {
        display: none;
        background: var(--surface-default);
        color: var(--text-primary);
        mix-blend-mode: normal;
      }

      .brand {
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        color: inherit;
        font-size: 15px;
        font-weight: 650;
        letter-spacing: 0;
      }

      .brand-mark {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        border-radius: 3px;
      }

      .brand-logo {
        display: block;
        width: auto;
        height: 28px;
        flex-shrink: 0;
      }

      .site-nav-desktop .brand-logo {
        filter: invert(1);
      }

      .site-nav-framed .brand,
      .site-nav-framed > div,
      .site-nav-framed .mobile-nav-actions {
        border: 0;
        background: rgba(248, 247, 245, 0.64);
        box-shadow: none;
        backdrop-filter: blur(14px) saturate(1.18);
        -webkit-backdrop-filter: blur(14px) saturate(1.18);
      }

      .site-nav-framed .brand {
        border-radius: 14px;
        padding: 4px 10px 4px 8px;
      }

      .site-nav-framed > div {
        border-radius: 14px;
        padding: 3px 6px;
      }

      .site-nav-framed.site-nav-desktop .brand-logo,
      .site-nav-framed.site-nav-desktop .language-trigger img {
        filter: none;
      }

      .site-nav div {
        pointer-events: auto;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .site-nav a:not(.brand) {
        border-radius: 8px;
        padding: 7px 12px;
        color: inherit;
        font-size: 14px;
        transition: background 180ms ease;
      }

      .site-nav a:not(.brand):hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .site-nav-framed a:not(.brand):hover {
        background: rgba(23, 19, 16, 0.07);
      }

      .language-trigger {
        appearance: none;
        pointer-events: auto;
        display: inline-flex;
        width: 34px;
        height: 34px;
        align-items: center;
        justify-content: center;
        border: 0;
        border-radius: 8px;
        background: transparent;
        color: inherit;
        padding: 0;
        font: inherit;
        line-height: 1;
        transition: background 180ms ease;
      }

      .language-trigger:hover,
      .language-trigger[aria-expanded="true"] {
        background: rgba(255, 255, 255, 0.1);
      }

      .language-trigger img {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      .site-nav-desktop .language-trigger img {
        filter: invert(1);
      }

      .mobile-nav-actions {
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .mobile-nav-toggle {
        appearance: none;
        pointer-events: auto;
        position: relative;
        display: grid;
        width: 32px;
        height: 32px;
        place-items: center;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: inherit;
        padding: 0;
      }

      .mobile-nav-toggle span {
        position: absolute;
        width: 16px;
        height: 1.5px;
        background: currentColor;
        border-radius: 999px;
        transition:
          opacity 160ms ease,
          transform 180ms ease;
      }

      .mobile-nav-toggle span:first-child {
        transform: translateY(-4px);
      }

      .mobile-nav-toggle span:last-child {
        transform: translateY(4px);
      }

      .mobile-nav-toggle[aria-expanded="true"] span:first-child {
        transform: rotate(45deg);
      }

      .mobile-nav-toggle[aria-expanded="true"] span:last-child {
        transform: rotate(-45deg);
      }

      .mobile-menu {
        position: absolute;
        top: 100%;
        right: 24px;
        display: flex;
        min-width: 200px;
        flex-direction: column;
        border-radius: 8px;
        background: var(--surface-default);
        padding: 4px;
        box-shadow: 0 22px 70px rgba(0, 0, 0, 0.12);
        opacity: 0;
        pointer-events: none;
        transform: translateY(-4px);
        transition:
          opacity 160ms ease,
          transform 160ms ease;
      }

      .mobile-menu[data-open="true"] {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }

      .mobile-menu a {
        color: var(--text-primary);
      }

      .contact-actions {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
      }

      .contact-actions span {
        display: inline-flex;
        min-height: 42px;
        align-items: center;
        border: 1px solid rgba(23, 19, 16, 0.14);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.52);
        padding: 10px 14px;
        color: rgba(23, 19, 16, 0.72);
        font-size: 15px;
      }

      .contact-actions a,
      .contact-actions button {
        appearance: none;
        display: inline-flex;
        min-height: 42px;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        padding: 10px 16px;
        font: inherit;
        font-size: 15px;
        font-weight: 650;
        line-height: 1;
        transition:
          background 180ms ease,
          transform 180ms ease;
      }

      .contact-actions a {
        border: 1px solid rgba(23, 19, 16, 0.86);
        background: rgba(23, 19, 16, 0.88);
        color: var(--text-invert);
      }

      .contact-actions button {
        border: 1px solid rgba(23, 19, 16, 0.14);
        background: #ffffff;
        color: var(--text-primary);
        cursor: pointer;
      }

      .contact-actions a:active,
      .contact-actions button:active {
        transform: scale(0.98);
      }

      .site-footer {
        position: fixed;
        inset: auto 0 0;
        z-index: 0;
        isolation: isolate;
        overflow: hidden;
        background: #080808;
        color: var(--text-invert);
        min-height: var(--footer-reveal-height);
        padding: 80px 140px 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .footer-inner {
        display: flex;
        justify-content: space-between;
        gap: 64px;
      }

      .footer-heading p {
        margin: 0;
        max-width: 700px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(30px, 3.8vw, 46px);
        line-height: 1.14;
        letter-spacing: -0.025em;
        text-wrap: balance;
      }

      .footer-side {
        display: flex;
        width: 300px;
        flex-shrink: 0;
        flex-direction: column;
        gap: 56px;
      }

      .footer-brand {
        color: var(--text-invert);
      }

      .footer-brand .brand-mark {
        filter: invert(1);
      }

      .footer-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
      }

      .footer-columns div {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .footer-columns span,
      .footer-bottom {
        color: rgba(248, 247, 245, 0.48);
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .footer-columns a {
        color: var(--text-invert);
        font-size: 14px;
        transition: opacity 180ms ease;
      }

      .footer-columns a:hover {
        opacity: 0.72;
      }

      .footer-bottom {
        margin-top: 72px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        flex-wrap: wrap;
        text-transform: none;
        letter-spacing: 0;
      }

      .footer-legal {
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }

      .contact-copy-toast {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 100;
        max-width: min(420px, calc(100vw - 48px));
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        background: rgba(8, 8, 8, 0.94);
        box-shadow: 0 18px 52px rgba(0, 0, 0, 0.24);
        color: #ffffff;
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.45;
        opacity: 0;
        transform: translateY(8px);
        transition:
          opacity 180ms ease,
          transform 180ms ease;
      }

      .contact-copy-toast[data-contact-feedback="warning"] {
        border-color: rgba(255, 196, 92, 0.42);
      }

      .contact-copy-toast[data-visible="true"] {
        opacity: 1;
        transform: translateY(0);
      }

      @keyframes dotmorph-site-nav-enter {
        0% {
          opacity: 0;
          transform: translate3d(0, -120%, 0);
        }
        62% {
          opacity: 1;
        }
        100% {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      @media (max-width: 1024px) {
        .dotmorph-page {
          --footer-reveal-height: 0px;
        }

        .brand-logo {
          height: 28px;
        }

        .site-nav-desktop {
          display: none;
        }

        .site-nav-mobile {
          display: flex;
          inset: 0 0 auto;
          padding: 10px 24px;
        }

        .site-nav-framed.site-nav-mobile {
          background: transparent;
        }

        .site-nav-framed .mobile-nav-actions {
          border-radius: 14px;
          padding: 3px 5px;
        }

        .site-nav-mobile .language-trigger {
          width: 32px;
          height: 32px;
          background: transparent;
          color: var(--text-primary);
        }

        .site-nav-mobile .language-trigger:hover,
        .site-nav-mobile .language-trigger[aria-expanded="true"] {
          background: rgba(23, 19, 16, 0.07);
        }

        .contact-actions {
          align-items: stretch;
        }

        .contact-actions span,
        .contact-actions a,
        .contact-actions button {
          width: 100%;
        }

        .site-footer {
          position: relative;
          inset: auto;
          z-index: 1;
          min-height: 0;
          padding: 56px 24px 20px;
        }

        .footer-inner {
          flex-direction: column;
          gap: 40px;
        }

        .footer-side {
          width: auto;
        }

        .footer-heading p {
          font-size: 32px;
        }

        .footer-bottom {
          align-items: flex-start;
        }

        .footer-legal {
          gap: 12px 20px;
          flex-wrap: wrap;
        }

        .contact-copy-toast {
          right: 16px;
          bottom: 16px;
          max-width: calc(100vw - 32px);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .site-nav a,
        .contact-copy-toast,
        .site-nav {
          animation: none;
          transition: none;
        }
      }
    `}</style>
  );
}
