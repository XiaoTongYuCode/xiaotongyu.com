export function SiteChromeStyles() {
  return (
    <style jsx global>{`
      .dotmorph-page {
        --surface-raised: #ffffff;
        --surface-invert: #20221f;
        --text-invert: #f7f7f7;
        --blue-700: #24775b;
        min-height: 100vh;
        background: var(--surface-default);
        color: var(--text-primary);
        font-family: var(--site-font);
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


      @media (prefers-reduced-motion: reduce) { .contact-copy-toast { transition: none; } }
    `}</style>
  );
}
