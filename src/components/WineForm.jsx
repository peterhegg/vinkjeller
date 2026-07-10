import { useState } from "react";
import { createWine, WINE_TYPES, WINE_STATUS } from "../data/wineSchema.js";
import CorkRating from "./CorkRating.jsx";
import LabelPhoto from "./LabelPhoto.jsx";
import WishlistToggle from "./WishlistToggle.jsx";

const numOrNull = (v) => (v === "" || v == null ? null : Number(v));

/** Full editable wine form, prefilled from `initial` (API result, existing wine, or blank). */
export default function WineForm({ initial, onSave, onCancel }) {
  const [wine, setWine] = useState(() => createWine(initial));

  const set = (patch) => setWine((w) => ({ ...w, ...patch }));

  const submit = (e) => {
    e.preventDefault();
    const next = { ...wine };
    if (next.status === WINE_STATUS.TASTED && !next.tastedAt) {
      next.tastedAt = new Date().toISOString();
    }
    onSave(createWine(next));
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <WishlistToggle status={wine.status} onChange={(status) => set({ status })} />

      <div className="field">
        <label htmlFor="name">Navn</label>
        <input
          id="name"
          required
          value={wine.name}
          onChange={(e) => set({ name: e.target.value })}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label htmlFor="producer">Produsent</label>
          <input id="producer" value={wine.producer} onChange={(e) => set({ producer: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="vintage">Årgang</label>
          <input
            id="vintage"
            type="number"
            value={wine.vintage ?? ""}
            onChange={(e) => set({ vintage: numOrNull(e.target.value) })}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label htmlFor="type">Type</label>
          <select id="type" value={wine.type} onChange={(e) => set({ type: e.target.value })}>
            <option value="">Velg type…</option>
            {WINE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="supplier">Leverandør</label>
          <input id="supplier" value={wine.supplier} onChange={(e) => set({ supplier: e.target.value })} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label htmlFor="country">Land</label>
          <input id="country" value={wine.country} onChange={(e) => set({ country: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="region">Region</label>
          <input id="region" value={wine.region} onChange={(e) => set({ region: e.target.value })} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="subregion">Underregion</label>
        <input id="subregion" value={wine.subregion} onChange={(e) => set({ subregion: e.target.value })} />
      </div>

      <div className="field">
        <label htmlFor="grapes">Druer (kommaseparert)</label>
        <input
          id="grapes"
          value={wine.grapes.join(", ")}
          onChange={(e) =>
            set({ grapes: e.target.value.split(",").map((g) => g.trim()).filter(Boolean) })
          }
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label htmlFor="alcohol">Alkohol %</label>
          <input
            id="alcohol"
            type="number"
            step="0.1"
            value={wine.alcoholPct ?? ""}
            onChange={(e) => set({ alcoholPct: numOrNull(e.target.value) })}
          />
        </div>
        <div className="field">
          <label htmlFor="volume">Volum (l)</label>
          <input
            id="volume"
            type="number"
            step="0.01"
            value={wine.volumeLitre ?? ""}
            onChange={(e) => set({ volumeLitre: numOrNull(e.target.value) })}
          />
        </div>
        <div className="field">
          <label htmlFor="price">Pris (kr)</label>
          <input
            id="price"
            type="number"
            value={wine.priceNOK ?? ""}
            onChange={(e) => set({ priceNOK: numOrNull(e.target.value) })}
          />
        </div>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "4px 0" }} />

      <div className="field">
        <label>Mine korkpoeng</label>
        <CorkRating value={wine.myScore} onChange={(myScore) => set({ myScore })} />
      </div>

      <div className="field">
        <label htmlFor="notes">Mine notater</label>
        <textarea id="notes" value={wine.myNotes} onChange={(e) => set({ myNotes: e.target.value })} />
      </div>

      <div className="field">
        <label htmlFor="food">Matpar</label>
        <input id="food" value={wine.foodPairing} onChange={(e) => set({ foodPairing: e.target.value })} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="field">
          <label htmlFor="purchasedAt">Kjøpt hos</label>
          <input id="purchasedAt" value={wine.purchasedAt} onChange={(e) => set({ purchasedAt: e.target.value })} />
        </div>
        <label
          style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22, fontSize: 14 }}
        >
          <input
            type="checkbox"
            checked={wine.wantAgain}
            onChange={(e) => set({ wantAgain: e.target.checked })}
            style={{ minHeight: "auto", width: 20, height: 20 }}
          />
          Vil ha igjen
        </label>
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--line)", margin: "4px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="field">
          <label htmlFor="quantity">Antall flasker</label>
          <input
            id="quantity"
            type="number"
            min="0"
            value={wine.quantity}
            onChange={(e) => set({ quantity: Math.max(0, numOrNull(e.target.value) ?? 0) })}
          />
        </div>
        <div className="field">
          <label htmlFor="drinkFrom">Drikk fra (år)</label>
          <input
            id="drinkFrom"
            type="number"
            value={wine.drinkFrom ?? ""}
            onChange={(e) => set({ drinkFrom: numOrNull(e.target.value) })}
          />
        </div>
        <div className="field">
          <label htmlFor="drinkBy">Drikk innen (år)</label>
          <input
            id="drinkBy"
            type="number"
            value={wine.drinkBy ?? ""}
            onChange={(e) => set({ drinkBy: numOrNull(e.target.value) })}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="cellarLocation">Kjellerplassering</label>
        <input
          id="cellarLocation"
          placeholder="f.eks. Hylle 3, rom B"
          value={wine.cellarLocation}
          onChange={(e) => set({ cellarLocation: e.target.value })}
        />
      </div>

      <LabelPhoto value={wine.labelImageBase64} onChange={(labelImageBase64) => set({ labelImageBase64 })} />

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
          Avbryt
        </button>
        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
          Lagre
        </button>
      </div>
    </form>
  );
}
