import { useEffect, useMemo, useState } from "react";
import { getMe, getProfile, optimize } from "./lib/api";
import type { ArmorItem, Loadout, StatKey } from "./lib/types";
import { DEFAULT_WEIGHTS, STAT_LABELS } from "./lib/stats";
import InventoryGrid from "./components/InventoryGrid";
import StatSliders from "./components/StatSliders";
import LoadoutCard from "./components/LoadoutCard";

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [armor, setArmor] = useState<ArmorItem[]>([]);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [preferSet, setPreferSet] = useState("Edge of Fate");
  const [oneExotic, setOneExotic] = useState(true);
  const [result, setResult] = useState<Loadout | null>(null);

  async function init() {
    const me = await getMe();
    setAuthed(!!me?.authenticated);
    if (me?.authenticated) {
      setLoading(true);
      const prof = await getProfile();
      setArmor(prof.armor || []);
      setLoading(false);
    }
  }

  useEffect(() => {
    init();
  }, []);
  const API_BASE = "https://a41533c3a539.ngrok-free.app";
  function login() {
    window.location.href = `${API_BASE}/auth/login`;
  }

  async function runOptimize() {
    setLoading(true);
    const res = await optimize(weights, preferSet || undefined, oneExotic);
    setResult(res.result || null);
    setLoading(false);
  }

  return (
    <div className="container">
      <header className="header">
        <h1>D2 Armor Optimizer</h1>
        {!authed ? (
          <button className="btn" onClick={login}>
            Sign in with Bungie
          </button>
        ) : (
          <span className="ok">Signed in ✅</span>
        )}
      </header>

      {authed && (
        <>
          <section className="panel">
            <h2>Stat Weights (200-cap with secondary bonuses past 100)</h2>
            <StatSliders weights={weights} onChange={setWeights} />
            <div className="row">
              <label>
                Prefer set (2/4-piece bonus):&nbsp;
                <input
                  value={preferSet}
                  placeholder="Edge of Fate"
                  onChange={(e) => setPreferSet(e.target.value)}
                />
              </label>
              <label style={{ marginLeft: 16 }}>
                <input
                  type="checkbox"
                  checked={oneExotic}
                  onChange={(e) => setOneExotic(e.target.checked)}
                />
                &nbsp;Enforce ≤ 1 Exotic
              </label>
              <button
                className="btn run"
                onClick={runOptimize}
                disabled={loading}
              >
                Optimize
              </button>
            </div>
          </section>

          <section className="panel">
            <h2>Recommended Loadout</h2>
            {result ? (
              <LoadoutCard loadout={result} />
            ) : (
              <p>No result yet. Click Optimize.</p>
            )}
          </section>

          <section className="panel">
            <h2>Armor (All characters + Vault)</h2>
            {loading ? <p>Loading...</p> : <InventoryGrid items={armor} />}
          </section>
        </>
      )}
    </div>
  );
}
