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
      if (!detectorRef.current) {
        // Only request formats the device actually supports.
        let formats = FORMATS;
        try {
          const avail = await window.BarcodeDetector.getSupportedFormats();
          formats = FORMATS.filter((f) => avail.includes(f));
          if (!formats.length) formats = FORMATS;
        } catch {
          /* keep default formats */
        }
        detectorRef.current = new window.BarcodeDetector({ formats });
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
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

  return { supported: barcodeSupported, scanning, error, videoRef, start, stop };
}
