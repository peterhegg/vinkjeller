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
    <div className="stack" style={{ gap: "var(--sp-3)" }}>
      <form onSubmit={submit} className="row">
        <input
          type="search"
          className="input"
          style={{ flex: 1, width: "auto" }}
          placeholder="Søk vinnavn…"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            if (!e.target.value) clear();
          }}
          aria-label="Søk etter vin på Vinmonopolet"
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
        <p className="error-text">
          Vinmonopolet-søk er ikke satt opp ennå (mangler proxy-konfigurasjon). Bruk manuell input.
        </p>
      )}
      {error && error.code !== "not_configured" && (
        <p className="error-text">Kunne ikke hente treff akkurat nå.</p>
      )}
      {loading && <p className="hint">Søker…</p>}
      {notFound && (
        <p className="hint">Fant ingen vin med den strekkoden. Legg til manuelt.</p>
      )}

      {results.length > 0 && (
        <ul className="plain-list">
          {results.map((r, i) => (
            <li key={r.vinmonopoletId ?? i}>
              <button type="button" className="result-item" onClick={() => onSelect(r)}>
                <span className="wine-name result-title">
                  {r.name}
                  {r.vintage ? ` ${r.vintage}` : ""}
                </span>
                <span className="result-meta">
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
