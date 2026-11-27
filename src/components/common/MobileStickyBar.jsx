export default function MobileStickyBar({
  label,
  value,
  subText,
  actionLabel,
  onAction,
  targetSideId,
  variant = 'accent',
}) {
  const handleJump = () => {
    if (!targetSideId) return;
    const el = document.getElementById(targetSideId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`mobile-sticky-bar ${variant} no-print`}>
      <button
        type="button"
        className="msb-summary"
        onClick={handleJump}
        title="પૂરી ગણતરી જુઓ"
      >
        <span className="msb-label">
          {label} <span className="msb-jump-hint">↓ વિગત</span>
        </span>
        <strong className="msb-value">{value}</strong>
        {subText && <span className="msb-sub">{subText}</span>}
      </button>

      {actionLabel && onAction && (
        <button
          type="button"
          className={`btn ${
            variant === 'maroon'
              ? 'btn-maroon'
              : variant === 'teal'
              ? 'btn-success'
              : 'btn-primary'
          } msb-cta`}
          onClick={onAction}
        >
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
