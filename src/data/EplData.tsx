/**
 * React Context：資料載入、強度擬合、泊松推論，一次掛載完成。
 *
 * 載入順序（每賽季）：proxy → direct → snapshot → builtin
 * 載入策略：先載本季（快速），再並行載入歷史賽季；歷史就位後重新擬合。
 */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Match, TeamId, TeamStrength, LoadMeta } from "./types";
import { CURRENT_SEASON } from "./teams";
import { BUILT_IN_MATCHES } from "./matches";
import { loadCurrentSeason, loadHistory } from "./footballData";
import { buildTable, fitStrengths, computeForm } from "../engine/stats";
import { predictMatch } from "../engine/poisson";
import type { FormRecord, LeagueTable } from "../engine/stats";
import type { Prediction } from "../engine/poisson";

interface EplContextValue {
  matches: Match[];
  history: Match[];
  strengths: Record<TeamId, TeamStrength>;
  form: Record<TeamId, FormRecord>;
  table: LeagueTable;
  predictions: Prediction[];
  loading: boolean;
  historyLoading: boolean;
  meta: LoadMeta;
  focusMatchId: string;
}

const EplContext = createContext<EplContextValue | null>(null);

function mapBuiltIn(b: (typeof BUILT_IN_MATCHES)[number]): Match {
  const played = b.homeGoals != null;
  return {
    id: b.id,
    season: CURRENT_SEASON,
    date: b.date,
    kickoff: b.time ? `${b.date}T${b.time}:00+01:00` : undefined,
    round: b.round,
    home: b.home,
    away: b.away,
    homeGoals: played ? b.homeGoals : undefined,
    awayGoals: played ? b.awayGoals : undefined,
    played,
  };
}

export function EplProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [history, setHistory] = useState<Match[]>([]);
  const [strengths, setStrengths] = useState<Record<TeamId, TeamStrength>>({} as any);
  const [form, setForm] = useState<Record<TeamId, FormRecord>>({} as any);
  const [table, setTable] = useState<LeagueTable>({
    rows: [],
    avgGoals: 2.6,
    avgHomeGoals: 1.42,
    avgAwayGoals: 1.18,
  });
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [meta, setMeta] = useState<LoadMeta>({ current: "none", history: "none" });

  useEffect(() => {
    if (matches.length === 0) return;
    const s = fitStrengths(matches, history);
    const f = computeForm(matches);
    const t = buildTable(matches);
    const upcoming = matches.filter((m) => !m.played);
    const preds = upcoming
      .map((m) => predictMatch(m, s, f, t.avgHomeGoals, t.avgAwayGoals))
      .filter((p): p is Prediction => p !== null);
    setStrengths(s);
    setForm(f);
    setTable(t);
    setPredictions(preds);
  }, [matches, history]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const cur = await loadCurrentSeason();
      if (cancelled) return;
      const curMatches =
        cur.matches.length > 0 ? cur.matches : BUILT_IN_MATCHES.map(mapBuiltIn);
      setMatches(curMatches);
      setMeta((m) => ({ ...m, current: (cur.source as any) ?? "builtin" }));
      setLoading(false);

      setHistoryLoading(true);
      const histResults = await loadHistory();
      if (cancelled) return;
      setHistory(histResults.flatMap((r) => r.matches));
      setMeta((m) => ({
        ...m,
        history: histResults.length > 0 ? (histResults[0].source as any) : "none",
      }));
      setHistoryLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const value: EplContextValue = {
    matches,
    history,
    strengths,
    form,
    table,
    predictions,
    loading,
    historyLoading,
    meta,
    focusMatchId: "mw6-liv-mci",
  };

  return <EplContext.Provider value={value}>{children}</EplContext.Provider>;
}

export function useEpl(): EplContextValue {
  const ctx = useContext(EplContext);
  if (!ctx) throw new Error("useEpl must be used within EplProvider");
  return ctx;
}

export default EplProvider;
