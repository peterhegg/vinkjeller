import { WINE_STATUS } from "../data/wineSchema.js";

/** Segmented toggle between "smakt" and "ønske" status. */
export default function WishlistToggle({ status, onChange }) {
  const isTasted = status === WINE_STATUS.TASTED;
  return (
    <div role="radiogroup" aria-label="Status" className="segmented">
      <button
        type="button"
        role="radio"
        aria-checked={isTasted}
        onClick={() => onChange(WINE_STATUS.TASTED)}
      >
        Smakt
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!isTasted}
        onClick={() => onChange(WINE_STATUS.WISH)}
      >
        Ønskeliste
      </button>
    </div>
  );
}
