import CorkRating from "./CorkRating.jsx";

/** Compact card for the wine list. */
export default function WineCard({ wine, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(wine)}
      style={{
        width: "100%",
        display: "flex",
        gap: 12,
        textAlign: "left",
        background: "var(--surface)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius)",
        padding: 12,
        boxShadow: "var(--shadow)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: "var(--radius-sm)",
          overflow: "hidden",
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {wine.labelImageBase64 ? (
          <img
            src={wine.labelImageBase64}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 22 }} aria-hidden="true">🍷</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <span className="wine-name" style={{ fontSize: 17, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {wine.name || "Uten navn"}
            {wine.vintage ? ` ${wine.vintage}` : ""}
          </span>
          {wine.wantAgain && <span aria-label="Vil ha igjen" title="Vil ha igjen">⭐</span>}
        </div>
        <span style={{ color: "var(--text-soft)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {[wine.producer, wine.type, wine.country].filter(Boolean).join(" · ") || "—"}
        </span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {wine.myScore ? <CorkRating value={wine.myScore} readOnly size={14} /> : <span />}
          <span style={{ color: "var(--text-soft)", fontSize: 13 }}>
            {wine.quantity > 0 ? `${wine.quantity} stk` : ""}
          </span>
        </div>
      </div>
    </button>
  );
}
