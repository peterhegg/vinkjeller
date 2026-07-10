import { useEffect, useMemo, useState } from "react";
import { useWineDB } from "./hooks/useWineDB.js";
import { filterAndSortWines, SORT } from "./hooks/useWineDB.js";
import WineSearch from "./components/WineSearch.jsx";
import WineForm from "./components/WineForm.jsx";
import WineCard from "./components/WineCard.jsx";
import WineDetail from "./components/WineDetail.jsx";
import FilterBar from "./components/FilterBar.jsx";
import ExportImport from "./components/ExportImport.jsx";

const TABS = [
  { id: "cellar", label: "Kjeller", icon: "🍷" },
  { id: "add", label: "Legg til", icon: "➕" },
  { id: "settings", label: "Innstillinger", icon: "⚙️" },
];

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export default function App() {
  const { wines, addWine, updateWine, deleteWine, stats } = useWineDB();
  const online = useOnlineStatus();

  const [tab, setTab] = useState("cellar");
  const [detailId, setDetailId] = useState(null);
  const [formInitial, setFormInitial] = useState(null); // non-null → form screen is showing
  const [filters, setFilters] = useState({ sort: SORT.NEWEST });

  const visibleWines = useMemo(() => filterAndSortWines(wines, filters), [wines, filters]);
  const detailWine = wines.find((w) => w.id === detailId) || null;

  const closeForm = () => {
    setFormInitial(null);
    setTab("cellar");
  };

  const saveWine = async (wine) => {
    if (wine.id && wines.some((w) => w.id === wine.id)) {
      await updateWine(wine);
    } else {
      await addWine(wine);
    }
    closeForm();
  };

  const editWine = (wine) => {
    setDetailId(null);
    setFormInitial(wine);
    setTab("add");
  };

  return (
    <div className="app-shell">
      {!online && <div className="offline-banner">Ingen nettforbindelse — Vinmonopolet-søk krever nett</div>}

      {detailWine ? (
        <WineDetail
          wine={detailWine}
          onBack={() => setDetailId(null)}
          onEdit={editWine}
          onDelete={async (id) => {
            await deleteWine(id);
            setDetailId(null);
          }}
          onToggleWantAgain={(wantAgain) => updateWine({ ...detailWine, wantAgain })}
        />
      ) : formInitial !== null ? (
        <WineForm initial={formInitial} onSave={saveWine} onCancel={closeForm} />
      ) : tab === "cellar" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h1 style={{ fontSize: 28 }}>Vinkjeller</h1>
            <span style={{ color: "var(--text-soft)", fontSize: 13 }}>
              {stats.tasted} smakt · {stats.bottles} flasker
            </span>
          </div>
          <FilterBar filters={filters} onChange={setFilters} />
          {visibleWines.length === 0 ? (
            <p style={{ color: "var(--text-soft)", textAlign: "center", marginTop: 40 }}>
              Ingen viner ennå. Trykk «Legg til» for å komme i gang.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visibleWines.map((w) => (
                <WineCard key={w.id} wine={w} onOpen={(wine) => setDetailId(wine.id)} />
              ))}
            </div>
          )}
        </div>
      ) : tab === "add" ? (
        <div style={{ paddingTop: 12 }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Legg til vin</h1>
          <WineSearch
            onSelect={(product) => setFormInitial(product)}
            onManual={() => setFormInitial({})}
          />
        </div>
      ) : (
        <div style={{ paddingTop: 12 }}>
          <h1 style={{ fontSize: 24, marginBottom: 16 }}>Innstillinger</h1>
          <ExportImport />
        </div>
      )}

      {!detailWine && formInitial === null && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            background: "var(--surface)",
            borderTop: "1px solid var(--line)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                minHeight: "var(--tap)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                color: tab === t.id ? "var(--gold)" : "var(--text-soft)",
                fontSize: 11,
              }}
            >
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
