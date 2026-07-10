import { useCallback, useRef, useState } from "react";
import { PROXY_URL, APP_TOKEN } from "../constants.js";

/** Safe nested getter. */
const g = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

function toNumber(v) {
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function parseVintage(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 1900 && n < 2100 ? n : null;
}

/** Vinmonopolet returns Volume in cL (e.g. 75). Normalize to litres. */
function toLitre(v) {
  const n = toNumber(v);
  if (n == null) return null;
  return n > 10 ? +(n / 100).toFixed(3) : n;
}

/** Map one Vinmonopolet product to a partial wine (spec field mapping). */
export function mapProduct(p, ean = null) {
  if (!p || typeof p !== "object") return null;
  return {
    vinmonopoletId: g(p, "ProductId") ?? null,
    name: g(p, "ProductShortName") ?? g(p, "ProductLongName") ?? "",
    producer: g(p, "ProducerName") ?? "",
    supplier: g(p, "DistributorName") || g(p, "WholesalerName") || "",
    country: g(p, "Country.Name") ?? "",
    region: g(p, "District.Name") ?? "",
    subregion: g(p, "SubDistrict.Name") ?? "",
    grapes: Array.isArray(p.Grapes) ? p.Grapes.map((x) => x?.Name).filter(Boolean) : [],
    vintage: parseVintage(g(p, "Vintage")),
    type: g(p, "ProductType.Name") ?? "",
    alcoholPct: toNumber(g(p, "AlcoholContent")),
    volumeLitre: toLitre(g(p, "Volume.Value")),
    priceNOK: toNumber(g(p, "Price.SalesPrice")),
    vinmonopoletUrl: g(p, "ProductUrl") ?? null,
    barcode: ean,
  };
}

/** Extract the product array from whatever shape the API/proxy returns. */
function extractProducts(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (data && typeof data === "object" && (data.ProductId || data.ProductShortName)) return [data];
  return [];
}

async function callProxy(path, params, signal) {
  if (!PROXY_URL || !APP_TOKEN) {
    const err = new Error("proxy_not_configured");
    err.code = "not_configured";
    throw err;
  }
  const url = new URL(path, PROXY_URL.endsWith("/") ? PROXY_URL : PROXY_URL + "/");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${APP_TOKEN}` },
    signal,
  });
  if (!res.ok) {
    const err = new Error(`proxy_${res.status}`);
    err.code = res.status;
    throw err;
  }
  return res.json();
}

export function useVinmonopolet() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const run = useCallback(async (path, params) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      const data = await callProxy(path, params, ctrl.signal);
      const mapped = extractProducts(data)
        .map((p) => mapProduct(p, params.ean ?? null))
        .filter(Boolean);
      setResults(mapped);
      return mapped;
    } catch (e) {
      if (e.name === "AbortError") return [];
      setError(e);
      setResults([]);
      return [];
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  }, []);

  const search = useCallback((term) => run("search", { q: term }), [run]);
  const lookupBarcode = useCallback((ean) => run("barcode", { ean }), [run]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setResults([]);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, search, lookupBarcode, clear };
}
