import { useRef, useState } from "react";

const MAX_WIDTH = 800;
const JPEG_QUALITY = 0.7;

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image_load_failed"));
    };
    img.src = url;
  });
}

export default function LabelPhoto({ value, onChange }) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch {
      // ignore — user can retry
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="field">
      <label>Etikettbilde</label>
      {value && (
        <img
          src={value}
          alt="Etikett"
          style={{ width: "100%", maxWidth: 240, borderRadius: "var(--radius-sm)", border: "1px solid var(--line)" }}
        />
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className="btn btn-ghost" onClick={() => cameraRef.current?.click()} disabled={busy}>
          📷 Ta bilde
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => galleryRef.current?.click()} disabled={busy}>
          🖼️ Velg fra galleri
        </button>
        {value && (
          <button type="button" className="btn btn-danger" onClick={() => onChange(null)}>
            Fjern bilde
          </button>
        )}
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFile}
      />
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={handleFile} />
    </div>
  );
}
