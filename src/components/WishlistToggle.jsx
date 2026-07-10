import { WINE_STATUS } from "../data/wineSchema.js";

/** Segmented toggle between "smakt" and "ønske" status. */
export default function WishlistToggle({ status, onChange }) {
  const isTasted = status === WINE_STATUS.TASTED;
  return (
    <div
      role="radiogroup"
      aria-label="Status"
      style={{
        display: "flex",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-sm)",
        padding: 3,
        gap: 3,
      }}
    >
      <button
        type="button"
        role="radio"
        aria-checked={isTasted}
        className="btn"
        style={{
          flex: 1,
          minHeight: 40,
          background: isTasted ? "var(--gold)" : "transparent",
          color: isTasted ? "#1A0A0E" : "var(--text-soft)",
          fontWeight: isTasted ? 600 : 500,
        }}
        onClick={() => onChange(WINE_STATUS.TASTED)}
      >
        Smakt
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!isTasted}
        className="btn"
        style={{
          flex: 1,
          minHeight: 40,
          background: !isTasted ? "var(--gold)" : "transparent",
          color: !isTasted ? "#1A0A0E" : "var(--text-soft)",
          fontWeight: !isTasted ? 600 : 500,
        }}
        onClick={() => onChange(WINE_STATUS.WISH)}
      >
        Ønskeliste
      </button>
    </div>
  );
}
