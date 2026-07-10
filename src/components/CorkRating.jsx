const CORKS = Array.from({ length: 10 }, (_, i) => i + 1);

/** 1–10 cork rating. Click a cork to set score; click the active one again to clear. */
export default function CorkRating({ value, onChange, readOnly = false, size = 20 }) {
  return (
    <div
      role={readOnly ? undefined : "radiogroup"}
      aria-label="Korkpoeng"
      style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
    >
      {CORKS.map((n) => {
        const active = value != null && n <= value;
        const content = (
          <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <rect
              x="7" y="2" width="10" height="8" rx="2"
              fill={active ? "var(--cork)" : "var(--cork-empty)"}
            />
            <rect
              x="9" y="10" width="6" height="11" rx="1"
              fill={active ? "var(--gold)" : "var(--surface-2)"}
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
            style={{ padding: 4, minHeight: "auto", minWidth: 32 }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
