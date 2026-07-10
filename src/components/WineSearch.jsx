import { useState } from "react";
import { useVinmonopolet } from "../hooks/useVinmonopolet.js";
import { barcodeSupported } from "../hooks/useBarcode.js";
import BarcodeScanner from "./BarcodeScanner.jsx";

/** Search-first entry point: Vinmonopolet search, barcode lookup, or manual entry. */
export default function WineSearch({ onSelect, onManual }) {
  const { results, loading, error, search, lookupBarcode, clear } = useVinmonopolet();
  const [term, setTerm] = useState("");
  const [scanning, setScanning] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setNotFound(false);
    if (term.trim()) search(term.trim());
  };

  const handleBarcode = async (ean) => {
    setNotFound(false);
    const hits = await lookupBarcode(ean);
    if (!hits.length) setNotFound(true);
  };

  return (
    <div className="field" style={{ gap: 12 }}>
      <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
        <input
          type="search"
          placeholder="Søk vinnavn…"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            if (!e.target.value) clear();
          }}
          aria-label="Søk etter vin på Vinmonopolet"
          style={{
            flex: 1,
            minHeight: "var(--tap)",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-sm)",
            color: "var(--text)",
            padding: "0 14px",
          }}
        />
        <button
          type="button"
          className="btn btn-ghost"
          aria-label="Skann strekkode"
          onClick={() => setScanning(true)}
          disabled={!barcodeSupported}
          title={barcodeSupported ? "Skann strekkode" : "Ikke støttet i denne nettleseren"}
        >
          📷
        </button>
        <button type="submit" className="btn btn-primary" disabled={!term.trim()}>
          Søk
        </button>
      </form>

      {error?.code === "not_configured" && (
        <p style={{ color: "var(--danger)", fontSize: 13.5 }}>
          Vinmonopolet-søk er ikke satt opp ennå (mangler proxy-konfigurasjon). Bruk manuell input.
        </p>
      )}
      {error && error.code !== "not_configured" && (
        <p style={{ color: "var(--danger)", fontSize: 13.5 }}>Kunne ikke hente treff akkurat nå.</p>
      )}
      {loading && <p style={{ color: "var(--text-soft)" }}>Søker…</p>}
      {notFound && (
        <p style={{ color: "var(--text-soft)" }}>Fant ingen vin med den strekkoden. Legg til manuelt.</p>
      )}

      {results.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {results.map((r, i) => (
            <li key={r.vinmonopoletId ?? i}>
              <button
                type="button"
                onClick={() => onSelect(r)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-sm)",
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span className="wine-name" style={{ fontSize: 17 }}>
                  {r.name}
                  {r.vintage ? ` ${r.vintage}` : ""}
                </span>
                <span style={{ color: "var(--text-soft)", fontSize: 13.5 }}>
                  {[r.producer, r.country].filter(Boolean).join(" · ")}
                  {r.priceNOK ? ` · ${r.priceNOK} kr` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="btn btn-ghost" onClick={onManual}>
        + Legg til manuelt
      </button>

      {scanning && (
        <BarcodeScanner onDetected={handleBarcode} onClose={() => setScanning(false)} />
      )}
    </div>
  );
}
