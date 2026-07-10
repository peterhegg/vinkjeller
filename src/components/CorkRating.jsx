const CORKS = Array.from({ length: 10 }, (_, i) => i + 1);

/**
 * 1–10 cork rating. Click a cork to set score; click the active one again to clear.
 * Inactive corks use `--cork-empty` for both shapes so they stay visible (≥3:1)
 * against any surface they're placed on — never the raw panel color.
 */
export default function CorkRating({ value, onChange, readOnly = false, size = 20 }) {
  const label = value != null ? `${value} av 10 korker` : "Ingen korkpoeng satt";
  return (
    <div
      role={readOnly ? "img" : "radiogroup"}
      aria-label={readOnly ? label : "Korkpoeng"}
      style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
    >
      {CORKS.map((n) => {
        const active = value != null && n <= value;
        const content = (
          <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect
              x="7" y="2" width="10" height="8" rx="2"
              fill={active ? "var(--cork)" : "var(--cork-empty)"}
            />
            <rect
              x="9" y="10" width="6" height="11" rx="1"
              fill={active ? "var(--gold)" : "var(--cork-empty)"}
            />
          </svg>
        );
        if (readOnly) {
          return <span key={n}>{content}</span>;
        }
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} kork${n === 1 ? "" : "er"}`}
            onClick={() => onChange(value === n ? null : n)}
            style={{ padding: 6, minHeight: 44, minWidth: 44 }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
