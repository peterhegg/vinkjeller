import { useState } from "react";
import { WINE_TYPES, WINE_STATUS } from "../data/wineSchema.js";
import { SORT } from "../hooks/useWineDB.js";

const selectStyle = {
  minHeight: "var(--tap)",
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "var(--radius-sm)",
  color: "var(--text)",
  padding: "0 10px",
};

/** Filtering, sorting and free-text search for the wine list. */
export default function FilterBar({ filters, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input
        type="search"
        placeholder="Søk i kjelleren…"
        value={filters.search || ""}
        onChange={(e) => set({ search: e.target.value })}
        aria-label="Søk i kjelleren"
        style={{ ...selectStyle, width: "100%", padding: "0 14px" }}
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select
          value={filters.status || ""}
          onChange={(e) => set({ status: e.target.value || undefined })}
          style={selectStyle}
          aria-label="Status"
        >
          <option value="">Alle</option>
          <option value={WINE_STATUS.TASTED}>Smakt</option>
          <option value={WINE_STATUS.WISH}>Ønskeliste</option>
        </select>

        <select
          value={filters.sort || SORT.NEWEST}
          onChange={(e) => set({ sort: e.target.value })}
          style={selectStyle}
          aria-label="Sortering"
        >
          <option value={SORT.NEWEST}>Nyest tilsatt</option>
          <option value={SORT.SCORE_DESC}>Høyest poengsum</option>
          <option value={SORT.PRICE_ASC}>Lavest pris</option>
          <option value={SORT.NAME_ASC}>Navn A–Å</option>
        </select>

        <select
          value={filters.type || ""}
          onChange={(e) => set({ type: e.target.value || undefined })}
          style={selectStyle}
          aria-label="Type"
        >
          <option value="">Alle typer</option>
          {WINE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <button type="button" className="btn btn-ghost" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Færre filtre ▲" : "Flere filtre ▼"}
        </button>
      </div>

      {expanded && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input
            placeholder="Land"
            value={filters.country || ""}
            onChange={(e) => set({ country: e.target.value || undefined })}
            style={{ ...selectStyle, padding: "0 12px" }}
          />
          <input
            placeholder="Region"
            value={filters.region || ""}
            onChange={(e) => set({ region: e.target.value || undefined })}
            style={{ ...selectStyle, padding: "0 12px" }}
          />
          <input
            placeholder="Drue"
            value={filters.grape || ""}
            onChange={(e) => set({ grape: e.target.value || undefined })}
            style={{ ...selectStyle, padding: "0 12px" }}
          />
          <input
            placeholder="Produsent"
            value={filters.producer || ""}
            onChange={(e) => set({ producer: e.target.value || undefined })}
            style={{ ...selectStyle, padding: "0 12px" }}
          />
          <input
            placeholder="Leverandør"
            value={filters.supplier || ""}
            onChange={(e) => set({ supplier: e.target.value || undefined })}
            style={{ ...selectStyle, padding: "0 12px" }}
          />
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={!!filters.wantAgain}
              onChange={(e) => set({ wantAgain: e.target.checked || undefined })}
              style={{ minHeight: "auto", width: 20, height: 20 }}
            />
            Vil ha igjen
          </label>
        </div>
      )}
    </div>
  );
}
