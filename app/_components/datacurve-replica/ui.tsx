export function IconMark({ className = "" }: { className?: string }) {
  const classes = ["brand-mark", className].filter(Boolean).join(" ");
  return <img src="/xtyopen-icon.svg" width={202} height={202} alt="" aria-hidden="true" className={classes} />;
}

export function BrandLogo({ className = "" }: { className?: string }) {
  const classes = ["brand-logo", className].filter(Boolean).join(" ");
  return (
    <img
      src="/xtyopen-logo.svg"
      width={844}
      height={202}
      alt="xtyopen"
      className={classes}
    />
  );
}

export function CurveGlyph({ height = 14 }: { height?: number }) {
  return (
    <svg viewBox="0 0 61 48" fill="none" aria-hidden="true" style={{ height }} className="curve-glyph">
      <g stroke="currentColor" strokeWidth="3.81691" strokeLinecap="round" fill="none">
        <path d="M58.1224 1.90869C37.6042 1.90869 22.4264 1.90869 1.9082 1.90869" />
        <path d="M58.1224 1.90869C37.6042 1.90869 22.4264 45.8688 1.9082 45.8688" />
        <path d="M58.1224 45.8682C37.6042 45.8682 22.4264 45.8682 1.9082 45.8682" />
        <path d="M58.1224 1.90869C37.6042 1.90869 22.4264 12.8987 1.9082 12.8987" />
        <path d="M1.9082 45.868C22.4264 45.868 37.6042 34.8779 58.1224 34.8779" />
        <path d="M58.1224 1.90869C37.6042 1.90869 22.4264 23.8887 1.9082 23.8887" />
        <path d="M1.9082 45.8687C22.4264 45.8687 37.6042 23.8887 58.1224 23.8887" />
        <path d="M58.1224 1.90869C37.6042 1.90869 22.4264 34.8788 1.9082 34.8788" />
        <path d="M1.9082 45.8685C22.4264 45.8685 37.6042 12.8984 58.1224 12.8984" />
      </g>
    </svg>
  );
}

export function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.7806 12.5306L14.0306 19.2806C13.8899 19.4214 13.699 19.5004 13.5 19.5004C13.301 19.5004 13.1101 19.4214 12.9694 19.2806C12.8286 19.1399 12.7496 18.949 12.7496 18.75C12.7496 18.551 12.8286 18.3601 12.9694 18.2194L18.4397 12.75H3.75C3.55109 12.75 3.36032 12.671 3.21967 12.5303C3.07902 12.3897 3 12.1989 3 12C3 11.8011 3.07902 11.6103 3.21967 11.4697C3.36032 11.329 3.55109 11.25 3.75 11.25H18.4397L12.9694 5.78062C12.8286 5.63989 12.7496 5.44902 12.7496 5.25C12.7496 5.05097 12.8286 4.8601 12.9694 4.71937C13.1101 4.57864 13.301 4.49958 13.5 4.49958C13.699 4.49958 13.8899 4.57864 14.0306 4.71937L20.7806 11.4694C20.8504 11.539 20.9057 11.6217 20.9434 11.7128C20.9812 11.8038 21.0006 11.9014 21.0006 12C21.0006 12.0986 20.9812 12.1962 20.9434 12.2872C20.9057 12.3783 20.8504 12.461 20.7806 12.5306Z" />
    </svg>
  );
}

export function LoadingDots({ visible }: { visible: boolean }) {
  return (
    <div role="status" aria-label="Loading visualization" className="dotmorph-loading" style={{ opacity: visible ? 1 : 0 }}>
      <span />
      <span />
      <span />
    </div>
  );
}
