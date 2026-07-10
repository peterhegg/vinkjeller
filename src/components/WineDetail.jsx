import { useState } from "react";
import CorkRating from "./CorkRating.jsx";

const Row = ({ label, value }) =>
  value ? (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
      <span style={{ color: "var(--text-soft)", fontSize: 13.5 }}>{label}</span>
      <span style={{ fontSize: 14, textAlign: "right" }}>{value}</span>
    </div>
  ) : null;

/** Full-page single-wine view. */
export default function WineDetail({ wine, onEdit, onDelete, onToggleWantAgain, onBack }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button type="button" className="btn btn-ghost" onClick={onBack} style={{ alignSelf: "flex-start" }}>
        ← Tilbake
      </button>

      {wine.labelImageBase64 && (
        <img
          src={wine.labelImageBase64}
          alt={`Etikett — ${wine.name}`}
          style={{ width: "100%", maxHeight: 320, objectFit: "contain", borderRadius: "var(--radius)", background: "var(--surface)" }}
        />
      )}

      <div>
        <h2 className="wine-name" style={{ fontSize: 26 }}>
          {wine.name}
          {wine.vintage ? ` ${wine.vintage}` : ""}
        </h2>
        <p style={{ color: "var(--text-soft)", margin: "4px 0 0" }}>
          {[wine.producer, wine.country, wine.region].filter(Boolean).join(" · ")}
        </p>
      </div>

      {wine.myScore != null && (
        <div>
          <CorkRating value={wine.myScore} readOnly size={22} />
        </div>
      )}

      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => onToggleWantAgain(!wine.wantAgain)}
        style={{ alignSelf: "flex-start" }}
      >
        {wine.wantAgain ? "⭐ Vil ha igjen" : "☆ Vil ha igjen?"}
      </button>

      {wine.myNotes && (
        <div className="field">
          <label>Mine notater</label>
          <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{wine.myNotes}</p>
        </div>
      )}

      <div style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: "4px 14px" }}>
        <Row label="Type" value={wine.type} />
        <Row label="Druer" value={wine.grapes?.join(", ")} />
        <Row label="Subregion" value={wine.subregion} />
        <Row label="Alkohol" value={wine.alcoholPct != null ? `${wine.alcoholPct}%` : null} />
        <Row label="Volum" value={wine.volumeLitre != null ? `${wine.volumeLitre} l` : null} />
        <Row label="Pris" value={wine.priceNOK != null ? `${wine.priceNOK} kr` : null} />
        <Row label="Leverandør" value={wine.supplier} />
        <Row label="Matpar" value={wine.foodPairing} />
        <Row label="Kjøpt hos" value={wine.purchasedAt} />
        <Row label="Antall flasker" value={wine.quantity > 0 ? wine.quantity : null} />
        <Row label="Kjellerplassering" value={wine.cellarLocation} />
        <Row
          label="Drikkevindu"
          value={wine.drinkFrom || wine.drinkBy ? `${wine.drinkFrom ?? "?"} – ${wine.drinkBy ?? "?"}` : null}
        />
        {wine.vinmonopoletUrl && (
          <div style={{ padding: "8px 0" }}>
            <a href={wine.vinmonopoletUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--gold)", fontSize: 14 }}>
              Se på Vinmonopolet →
            </a>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => onEdit(wine)}>
          Rediger
        </button>
        {!confirmDelete ? (
          <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
            Slett
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-danger" onClick={() => onDelete(wine.id)}>
              Bekreft sletting
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
              Avbryt
            </button>
          </>
        )}
      </div>
    </div>
  );
}
