import { useCallback, useEffect, useRef, useState } from "react";

const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e"];

export const barcodeSupported =
  typeof window !== "undefined" && "BarcodeDetector" in window;

/**
 * Live barcode scanning via the BarcodeDetector API (Android Chrome).
 * Attach `videoRef` to a <video> element, call start(), and receive the
 * first EAN through onDetected. Scanning stops automatically on a hit.
 */
export function useBarcode({ onDetected } = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const detectorRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  // Diagnostics only — lets the UI show *why* nothing is happening instead of
  // a silent camera feed. `framesChecked` proves detect() is actually running;
  // `anySeen` proves the device's barcode backend sees *something* (even the
  // wrong format), which rules out "camera works, detection backend doesn't".
  const [debug, setDebug] = useState({ formats: [], framesChecked: 0, anySeen: null });

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!barcodeSupported) {
      setError(new Error("unsupported"));
      return;
    }
    try {
      let supportedFormats = [];
      if (!detectorRef.current) {
        // Only request formats the device actually supports.
        let formats = FORMATS;
        try {
          supportedFormats = await window.BarcodeDetector.getSupportedFormats();
          formats = FORMATS.filter((f) => supportedFormats.includes(f));
          if (!formats.length) formats = FORMATS;
        } catch {
          /* keep default formats */
        }
        detectorRef.current = new window.BarcodeDetector({ formats });
      }
      setDebug((d) => ({ ...d, formats: supportedFormats }));

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          // Helps close-range barcode focus on phones that support it; ignored elsewhere.
          advanced: [{ focusMode: "continuous" }],
        },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();
      setScanning(true);

      const tick = async () => {
        if (!streamRef.current || !videoRef.current) return;
        try {
          const codes = await detectorRef.current.detect(videoRef.current);
          setDebug((d) => ({
            ...d,
            framesChecked: d.framesChecked + 1,
            anySeen: codes.length > 0 ? codes.map((c) => `${c.format}:${c.rawValue}`) : d.anySeen,
          }));
          const hit = codes.find((c) => /^\d{8,14}$/.test(c.rawValue));
          if (hit) {
            stop();
            onDetectedRef.current?.(hit.rawValue);
            return;
          }
        } catch {
          /* transient decode error — keep scanning */
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      setError(e);
      stop();
    }
  }, [stop]);

  // Clean up camera on unmount.
  useEffect(() => stop, [stop]);

  return { supported: barcodeSupported, scanning, error, videoRef, start, stop, debug };
}
