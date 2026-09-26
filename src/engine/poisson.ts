import type { Match, TeamId, MarketOdds, TeamStrength } from "../data/types";
import type { FormRecord } from "./stats";
import { TEAMS } from "../data/teams";
import { formAdj } from "./stats";

const MAX_GOALS = 8;
const HOME_ADVANTAGE = 1.12;
const DRAW_INFLATION = 1.08;
const LAMBDA_HOME_MIN = 0.35, LAMBDA_HOME_MAX = 3.6;
const LAMBDA_AWAY_MIN = 0.25, LAMBDA_AWAY_MAX = 3.2;
const CONFIDENCE_CAP = 0.78;

function poissonPMF(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let p = Math.exp(-lambda);
  for (let i = 1; i <= k; i++) p *= lambda / i;
  return p;
}

export interface Prediction {
  matchId: string;
  home: TeamId;
  away: TeamId;
  lambdaHome: number;
  lambdaAway: number;
  probHomeWin: number;
  probDraw: number;
  probAwayWin: number;
  probOver25: number;
  probUnder25: number;
  probBTTS: number;
  matrix: number[][];
  odds?: MarketOdds;
  evHome?: number;
  evDraw?: number;
  evAway?: number;
  confidence: number;
  suggestedStake?: "low" | "medium" | "high";
  narrative: string;
}

export function predictMatch(
  match: Match,
  strengths: Record<TeamId, TeamStrength>,
  form: Record<TeamId, FormRecord>,
  avgHomeGoals: number,
  avgAwayGoals: number,
): Prediction | null {
  const homeStr = strengths[match.home];
  const awayStr = strengths[match.away];
  if (!homeStr || !awayStr) return null;

  const homeForm = form[match.home]?.score ?? 0.5;
  const awayForm = form[match.away]?.score ?? 0.5;

  let lambdaHome = avgHomeGoals * homeStr.homeAtt * awayStr.awayDef * HOME_ADVANTAGE * formAdj(homeForm);
  let lambdaAway = avgAwayGoals * awayStr.awayAtt * homeStr.homeDef * formAdj(awayForm);
  lambdaHome = Math.max(LAMBDA_HOME_MIN, Math.min(LAMBDA_HOME_MAX, lambdaHome));
  lambdaAway = Math.max(LAMBDA_AWAY_MIN, Math.min(LAMBDA_AWAY_MAX, lambdaAway));

  // ── 比分矩陣（含平局膨脹） ─────────────────────────────────────────────
  const raw: number[][] = [];
  let total = 0;
  for (let h = 0; h <= MAX_GOALS; h++) {
    raw[h] = [];
    for (let a = 0; a <= MAX_GOALS; a++) {
      let p = poissonPMF(h, lambdaHome) * poissonPMF(a, lambdaAway);
      if (h === a) p *= DRAW_INFLATION;
      raw[h][a] = p;
      total += p;
    }
  }
  const matrix: number[][] = raw.map((row) => row.map((v) => v / total));

  let probHomeWin = 0, probDraw = 0, probAwayWin = 0;
  let probOver25 = 0, probUnder25 = 0;
  let probBTTS = 0;
  for (let h = 0; h <= MAX_GOALS; h++) {
    for (let a = 0; a <= MAX_GOALS; a++) {
      const p = matrix[h][a];
      if (h > a) probHomeWin += p;
      else if (h === a) probDraw += p;
      else probAwayWin += p;
      if (h + a > 2.5) probOver25 += p;
      else probUnder25 += p;
      if (h > 0 && a > 0) probBTTS += p;
    }
  }

  // ── 賠率與 EV ──────────────────────────────────────────────────────────
  const odds = match.odds;
  const evHome = odds?.home ? probHomeWin * odds.home - 1 : undefined;
  const evDraw = odds?.draw ? probDraw * odds.draw - 1 : undefined;
  const evAway = odds?.away ? probAwayWin * odds.away - 1 : undefined;

  // ── 信心度 ─────────────────────────────────────────────────────────────
  const baseConf = Math.min(homeStr.games + awayStr.games, 40) / 40;
  const oddsComplete = odds?.home && odds?.draw && odds?.away ? 1 : 0.6;
  const confidence = Math.min(
    CONFIDENCE_CAP,
    Math.round((0.5 + baseConf * 0.28) * (0.7 + oddsComplete * 0.3) * 100) / 100,
  );

  // ── 倉位建議 ───────────────────────────────────────────────────────────
  const bestEV = Math.max(evHome ?? -Infinity, evDraw ?? -Infinity, evAway ?? -Infinity);
  let suggestedStake: "low" | "medium" | "high" | undefined;
  if (bestEV > 0.08 && confidence > 0.55) suggestedStake = "high";
  else if (bestEV > 0.05 && confidence > 0.50) suggestedStake = "medium";
  else if (bestEV > 0.02) suggestedStake = "low";

  // ── 敘事 ───────────────────────────────────────────────────────────────
  const hName = TEAMS[match.home]?.short ?? match.home;
  const aName = TEAMS[match.away]?.short ?? match.away;
  const lean =
    probHomeWin > 0.45
      ? `${hName} 勝`
      : probAwayWin > 0.45
      ? `${aName} 勝`
      : "傾向和局";
  const narrative = `${hName} vs ${aName}：模型預測 ${lean}（主勝 ${Math.round(probHomeWin * 100)}% 和 ${Math.round(probDraw * 100)}% 客 ${Math.round(probAwayWin * 100)}%），預期進球 ${lambdaHome.toFixed(2)}:${lambdaAway.toFixed(2)}。`;

  return {
    matchId: match.id,
    home: match.home,
    away: match.away,
    lambdaHome,
    lambdaAway,
    probHomeWin: Math.round(probHomeWin * 10000) / 10000,
    probDraw: Math.round(probDraw * 10000) / 10000,
    probAwayWin: Math.round(probAwayWin * 10000) / 10000,
    probOver25: Math.round(probOver25 * 10000) / 10000,
    probUnder25: Math.round(probUnder25 * 10000) / 10000,
    probBTTS: Math.round(probBTTS * 10000) / 10000,
    matrix,
    odds,
    evHome,
    evDraw,
    evAway,
    confidence,
    suggestedStake,
    narrative,
  };
}
