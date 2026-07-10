import { useEffect } from "react";
import { useBarcode } from "../hooks/useBarcode.js";

/** Full-screen camera overlay. Calls onDetected(ean) once, then onClose(). */
export default function BarcodeScanner({ onDetected, onClose }) {
  const { supported, scanning, error, videoRef, start, stop } = useBarcode({
    onDetected: (ean) => {
      onDetected(ean);
      onClose();
    },
  });

  useEffect(() => {
    if (supported) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supported]);

  return (
    <div className="scanner-overlay">
      <div className="scanner-stage">
        {supported ? (
          <video ref={videoRef} className="scanner-video" muted playsInline />
        ) : (
          <div style={{ padding: "var(--sp-5)", color: "var(--text)" }}>
            <p>
              Strekkodeskanning krever <strong>BarcodeDetector</strong>-støtte i nettleseren.
              Dette virker foreløpig kun i Chrome på Android.
            </p>
            <p className="hint">Bruk søk eller «Legg til manuelt» i stedet.</p>
          </div>
        )}
        {supported && scanning && <div className="scanner-frame" aria-hidden="true" />}
        {error && supported && (
          <p className="error-text" style={{ position: "absolute", bottom: 24, left: 16, right: 16 }}>
            Fikk ikke tilgang til kamera. Sjekk tillatelser.
          </p>
        )}
      </div>
      <div className="scanner-actions">
        <button type="button" className="btn btn-ghost" style={{ width: "100%" }} onClick={onClose}>
          Avbryt
        </button>
      </div>
    </div>
  );
}
