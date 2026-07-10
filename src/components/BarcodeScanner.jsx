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
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, position: "relative" }}>
        {supported ? (
          <video
            ref={videoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            muted
            playsInline
          />
        ) : (
          <div style={{ padding: 24, color: "var(--text)" }}>
            <p>
              Strekkodeskanning krever <strong>BarcodeDetector</strong>-støtte i nettleseren.
              Dette virker foreløpig kun i Chrome på Android.
            </p>
            <p style={{ color: "var(--text-soft)" }}>
              Bruk søk eller «Legg til manuelt» i stedet.
            </p>
          </div>
        )}
        {supported && scanning && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: "30% 12%",
              border: "3px solid var(--gold)",
              borderRadius: 12,
              boxShadow: "0 0 0 2000px rgba(0,0,0,0.4)",
            }}
          />
        )}
        {error && supported && (
          <p style={{ position: "absolute", bottom: 100, left: 16, right: 16, color: "var(--danger)" }}>
            Fikk ikke tilgang til kamera. Sjekk tillatelser.
          </p>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <button type="button" className="btn btn-ghost" style={{ width: "100%" }} onClick={onClose}>
          Avbryt
        </button>
      </div>
    </div>
  );
}
