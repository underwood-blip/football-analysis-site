/**
 * 多賽季強度擬合、積分榜計算、近況評分。
 *
 * 核心設計：
 *  - buildTable：僅用本季已賽場次計算聯賽積分榜與聯賽均值。
 *  - fitStrengths：用本季 + 歷史賽季加權計算每隊攻防強度，並以 PRIOR_GAMES
 *    為虛構場次向聯賽均值收縮（shrinkage），避免升班馬樣本過少的偏離。
 *  - computeForm：本季最後 5 場賽果轉為 0–1 分數，供泊松推論調適。
 */
import type { Match, TeamId, TeamStrength } from "../data/types";
import { TEAMS, CURRENT_SEASON, seasonWeight } from "../data/teams";

// ─── 積分榜 ──────────────────────────────────────────────────────────────────

export interface StandingsRow {
  rank: number;
  id: TeamId;
  name: string;
  gp: number; w: number; d: number; l: number; gf: number; ga: number; gd: number; pts: number;
}

export interface LeagueTable {
  rows: StandingsRow[];
  avgGoals: number;
  avgHomeGoals: number;
  avgAwayGoals: number;
}

export function buildTable(matches: Match[]): LeagueTable {
  const stats: Record<TeamId, { gp: number; w: number; d: number; l: number; gf: number; ga: number }> =
    Object.fromEntries(Object.keys(TEAMS).map((id) => [id, { gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }])) as any;

  let totalGoals = 0, homeGoals = 0, awayGoals = 0, n = 0;

  for (const m of matches) {
    if (m.season !== CURRENT_SEASON || !m.played || m.homeGoals == null || m.awayGoals == null) continue;
    const h = stats[m.home], a = stats[m.away];
    if (!h || !a) continue;
    h.gp++; a.gp++;
    h.gf += m.homeGoals; h.ga += m.awayGoals;
    a.gf += m.awayGoals; a.ga += m.homeGoals;
    if (m.homeGoals > m.awayGoals) { h.w++; a.l++; }
    else if (m.homeGoals < m.awayGoals) { h.l++; a.w++; }
    else { h.d++; a.d++; }
    totalGoals += m.homeGoals + m.awayGoals;
    homeGoals += m.homeGoals;
    awayGoals += m.awayGoals;
    n++;
  }

  const rows = (Object.keys(TEAMS) as TeamId[])
    .map((id) => {
      const s = stats[id];
      return {
        id, name: TEAMS[id].short, gp: s.gp, w: s.w, d: s.d, l: s.l,
        gf: s.gf, ga: s.ga, gd: s.gf - s.ga, pts: s.w * 3 + s.d,
      };
    })
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return {
    rows,
    avgGoals: n > 0 ? totalGoals / n : 2.6,
    avgHomeGoals: n > 0 ? homeGoals / n : 1.42,
    avgAwayGoals: n > 0 ? awayGoals / n : 1.18,
  };
}

// ─── 強度擬合 ────────────────────────────────────────────────────────────────

const PRIOR_GAMES = 6;

interface AccItem {
  attGoals: number;
  defGoalsConceded: number;
  homeAttGoals: number;
  homeDefGoals: number;
  awayAttGoals: number;
  awayDefGoals: number;
  weightedGames: number;
}

export function fitStrengths(
  currentMatches: Match[],
  historyMatches: Match[],
): Record<TeamId, TeamStrength> {
  const acc: Record<string, AccItem> = {};

  function ensure(id: string): AccItem {
    if (!acc[id]) acc[id] = { attGoals: 0, defGoalsConceded: 0, homeAttGoals: 0, homeDefGoals: 0, awayAttGoals: 0, awayDefGoals: 0, weightedGames: 0 };
    return acc[id];
  }

  function add(m: Match) {
    const w = seasonWeight(m.season);
    const h = ensure(m.home), a = ensure(m.away);
    h.attGoals += (m.homeGoals ?? 0) * w;
    h.defGoalsConceded += (m.awayGoals ?? 0) * w;
    h.homeAttGoals += (m.homeGoals ?? 0) * w;
    h.homeDefGoals += (m.awayGoals ?? 0) * w;
    h.weightedGames += w;
    a.attGoals += (m.awayGoals ?? 0) * w;
    a.defGoalsConceded += (m.homeGoals ?? 0) * w;
    a.awayAttGoals += (m.awayGoals ?? 0) * w;
    a.awayDefGoals += (m.homeGoals ?? 0) * w;
    a.weightedGames += w;
  }

  for (const m of currentMatches) { if (m.played && m.homeGoals != null && m.awayGoals != null) add(m); }
  // 歷史賽季：只累積能對映到當前 TEAMS 的隊伍
  for (const m of historyMatches) {
    if (!m.played || m.homeGoals == null || m.awayGoals == null) continue;
    if (!(m.home in TEAMS) || !(m.away in TEAMS)) continue;
    add(m);
  }

  // 聯賽均值（含歷史 + 本季）
  let totalHGoals = 0, totalAGoals = 0, totalGames = 0;
  for (const m of [...currentMatches, ...historyMatches]) {
    if (!m.played || m.homeGoals == null || m.awayGoals == null) continue;
    totalHGoals += m.homeGoals; totalAGoals += m.awayGoals; totalGames++;
  }
  const avgHome = totalGames > 0 ? totalHGoals / totalGames : 1.42;
  const avgAway = totalGames > 0 ? totalAGoals / totalGames : 1.18;

  const result: Record<TeamId, TeamStrength> = {} as any;
  for (const id of Object.keys(TEAMS) as TeamId[]) {
    const s = acc[id];
    if (!s || s.weightedGames === 0) {
      result[id] = { att: 1, def: 1, homeAtt: 1, homeDef: 1, awayAtt: 1, awayDef: 1, games: 0 };
      continue;
    }
    const wg = s.weightedGames;
    const rateAtt = (s.attGoals + PRIOR_GAMES * avgHome) / (wg + PRIOR_GAMES);
    const rateDef = (s.defGoalsConceded + PRIOR_GAMES * avgAway) / (wg + PRIOR_GAMES);
    const rateHA = (s.homeAttGoals + PRIOR_GAMES * avgHome) / (wg + PRIOR_GAMES);
    const rateHD = (s.homeDefGoals + PRIOR_GAMES * avgAway) / (wg + PRIOR_GAMES);
    const rateAA = (s.awayAttGoals + PRIOR_GAMES * avgAway) / (wg + PRIOR_GAMES);
    const rateAD = (s.awayDefGoals + PRIOR_GAMES * avgHome) / (wg + PRIOR_GAMES);
    result[id] = {
      att: rateAtt / avgHome,
      def: rateDef / avgAway,
      homeAtt: rateHA / avgHome,
      homeDef: rateHD / avgAway,
      awayAtt: rateAA / avgAway,
      awayDef: rateAD / avgHome,
      games: wg,
    };
  }
  return result;
}

// ─── 近況 ────────────────────────────────────────────────────────────────────

export interface FormRecord {
  last5: ("W" | "D" | "L")[];
  /** 0–1，1 表示全勝 */
  score: number;
}

export function computeForm(matches: Match[]): Record<TeamId, FormRecord> {
  const byTeam: Record<TeamId, Match[]> = {} as any;
  for (const id of Object.keys(TEAMS) as TeamId[]) byTeam[id] = [];
  for (const m of matches) {
    if (m.season !== CURRENT_SEASON || !m.played || m.homeGoals == null || m.awayGoals == null) continue;
    byTeam[m.home]?.push(m);
    byTeam[m.away]?.push(m);
  }
  const result: Record<TeamId, FormRecord> = {} as any;
  for (const id of Object.keys(TEAMS) as TeamId[]) {
    const ms = (byTeam[id] ?? [])
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-5);
    const last5: ("W" | "D" | "L")[] = ms.map((m) => {
      const isHome = m.home === id;
      const gf = isHome ? (m.homeGoals ?? 0) : (m.awayGoals ?? 0);
      const ga = isHome ? (m.awayGoals ?? 0) : (m.homeGoals ?? 0);
      if (gf > ga) return "W";
      if (gf < ga) return "L";
      return "D";
    });
    result[id] = { last5, score: last5.filter((r) => r === "W").length / 5 };
  }
  return result;
}

export function formAdj(score: number): number {
  return 0.85 + score * 0.35;
}
