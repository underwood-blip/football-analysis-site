/** CSV 解析、線上拉取、快照回退、多賽季載入 */
import type { MarketOdds, Match } from "./types";
import { CURRENT_SEASON, NAME_TO_ID } from "./teams";

// ─── CSV 解析 ────────────────────────────────────────────────────────────────

function parseLine(line: string): string[] {
  const result: string[] = [];
  let cur = "", inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuote = !inQuote;
    else if (ch === "," && !inQuote) { result.push(cur); cur = ""; }
    else cur += ch;
  }
  result.push(cur);
  return result;
}

function parseDateRaw(raw: string): string | null {
  const parts = raw.trim().split("/");
  if (parts.length !== 3) return null;
  let [dd, mm, yy] = parts;
  if (yy.length === 2) yy = (+yy < 50 ? "20" : "19") + yy;
  return `${yy}-${mm}-${dd}`;
}

function parseTime(timeStr: string): string | undefined {
  if (!timeStr || !timeStr.trim()) return undefined;
  const [h, m] = timeStr.trim().split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return undefined;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function ukOffset(dateStr: string): string {
  const m = parseInt(dateStr.slice(5, 7), 10);
  return m >= 4 && m <= 10 ? "+01:00" : "+00:00";
}

function parseOdds(row: string[], header: string[]): MarketOdds | undefined {
  const col = (name: string) => {
    const idx = header.indexOf(name);
    return idx >= 0 ? row[idx] : undefined;
  };
  const isNum = (v?: string) => v !== undefined && !isNaN(parseFloat(v));

  const avgH = col("AvgH"), avgD = col("AvgD"), avgA = col("AvgA");
  const b365H = col("B365H"), b365D = col("B365D"), b365A = col("B365A");
  const o25 = col("Avg>2.5") ?? col("BbAv>2.5");
  const u25 = col("Avg<2.5") ?? col("BbAv<2.5");
  const ahLine = col("AHh") ?? col("BbAHh");
  const ahHome = col("AvgAHH") ?? col("BbAvAHH");
  const ahAway = col("AvgAHA") ?? col("BbAvAHA");

  const home = isNum(avgH) ? parseFloat(avgH ?? "") : isNum(b365H) ? parseFloat(b365H ?? "") : undefined;
  const draw = isNum(avgD) ? parseFloat(avgD ?? "") : isNum(b365D) ? parseFloat(b365D ?? "") : undefined;
  const away = isNum(avgA) ? parseFloat(avgA ?? "") : isNum(b365A) ? parseFloat(b365A ?? "") : undefined;
  const over25 = isNum(o25) ? parseFloat(o25 ?? "") : undefined;
  const under25 = isNum(u25) ? parseFloat(u25 ?? "") : undefined;
  const ahLineNum = isNum(ahLine) ? parseFloat(ahLine ?? "") : undefined;
  const ahHomeNum = isNum(ahHome) ? parseFloat(ahHome ?? "") : undefined;
  const ahAwayNum = isNum(ahAway) ? parseFloat(ahAway ?? "") : undefined;

  if (!home && !draw && !away && !over25 && !under25) return undefined;
  return { home, draw, away, over25, under25, ahLine: ahLineNum, ahHome: ahHomeNum, ahAway: ahAwayNum };
}

function parseCsvRow(row: string[], header: string[], season: string, rowIdx: number): Match | null {
  const col = (name: string) => {
    const idx = header.indexOf(name);
    return idx >= 0 ? row[idx] : undefined;
  };

  const homeName = col("HomeTeam");
  const awayName = col("AwayTeam");
  if (!homeName || !awayName) return null;

  const homeId = NAME_TO_ID[homeName];
  const awayId = NAME_TO_ID[awayName];
  if (!homeId || !awayId) return null;

  const dateRaw = col("Date") ?? "";
  const isoDate = parseDateRaw(dateRaw);
  if (!isoDate) return null;
  const timeStr = col("Time") ?? "";
  const kickoff = timeStr ? parseTime(timeStr) : undefined;
  const utcKickoff = kickoff ? `${isoDate}T${kickoff}${ukOffset(isoDate)}` : undefined;

  const fthg = col("FTHG");
  const ftag = col("FTAG");
  const ftr = col("FTR");
  const played = !!ftr && ftr.trim() !== "";

  const hxgRaw = col("HxG"), axgRaw = col("AxG");
  const hxg = hxgRaw ? parseFloat(hxgRaw) : undefined;
  const axg = axgRaw ? parseFloat(axgRaw) : undefined;
  const referee = col("Referee");

  const odds = parseOdds(row, header);

  const hSlug = homeId.toLowerCase().slice(0, 3);
  const aSlug = awayId.toLowerCase().slice(0, 3);
  const baseId = `mw${rowIdx + 1}-${hSlug}-${aSlug}`;

  return {
    id: baseId,
    season,
    date: isoDate,
    kickoff: utcKickoff,
    home: homeId,
    away: awayId,
    homeGoals: played ? (fthg ? parseInt(fthg, 10) : undefined) : undefined,
    awayGoals: played ? (ftag ? parseInt(ftag, 10) : undefined) : undefined,
    played,
    odds,
    hxg,
    axg,
    referee: referee || undefined,
  };
}

export function parseFootballDataCsv(text: string, season: string, prefix = ""): Match[] {
  const clean = text.replace(/^\uFEFF/, "");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = parseLine(lines[0]);
  const rows = lines.slice(1);
  const seen = new Set<string>();
  const matches: Match[] = [];

  for (let r = 0; r < rows.length; r++) {
    const match = parseCsvRow(parseLine(rows[r]), header, season, r);
    if (!match) continue;
    const uniqueKey = `${match.date}_${match.home}_${match.away}`;
    if (seen.has(uniqueKey)) continue;
    seen.add(uniqueKey);
    if (prefix) match.id = `${prefix}-${match.id}`;
    matches.push(match);
  }
  return matches;
}

// ─── 資料載入管道 ────────────────────────────────────────────────────────────

const PROXY_PATH = (season: string) => `/api/fd/mmz4281/${season}/E0.csv`;
const DIRECT_URL = (season: string) => `https://football-data.co.uk/mmz4281/${season}/E0.csv`;
const SNAPSHOT_PATH = (season: string) =>
  `/data${season === CURRENT_SEASON ? "/E0-" : "/history/E0-"}${season}.csv`;

const FETCH_TIMEOUT = 8000;

async function tryFetch(url: string, timeoutMs = FETCH_TIMEOUT): Promise<{ text: string; ok: boolean }> {
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(tid);
    if (!res.ok) return { text: "", ok: false };
    return { text: await res.text(), ok: true };
  } catch {
    return { text: "", ok: false };
  }
}

async function loadSeasonCsv(season: string): Promise<{ text: string; source: "proxy" | "direct" | "snapshot" | null }> {
  const proxyRes = await tryFetch(PROXY_PATH(season));
  if (proxyRes.ok && proxyRes.text.trim().length > 100) return { text: proxyRes.text, source: "proxy" };

  const directRes = await tryFetch(DIRECT_URL(season));
  if (directRes.ok && directRes.text.trim().length > 100) return { text: directRes.text, source: "direct" };

  try {
    const snapRes = await fetch(SNAPSHOT_PATH(season));
    if (snapRes.ok) {
      const snapText = await snapRes.text();
      if (snapText.trim().length > 100) return { text: snapText, source: "snapshot" };
    }
  } catch {}

  return { text: "", source: null };
}

export type SeasonData = { matches: Match[]; source: "proxy" | "direct" | "snapshot" | "builtin" | null };

export async function loadCurrentSeason(): Promise<SeasonData> {
  const { text, source } = await loadSeasonCsv(CURRENT_SEASON);
  if (text && text.trim().length > 100) {
    return { matches: parseFootballDataCsv(text, CURRENT_SEASON), source: source ?? "builtin" };
  }
  return { matches: [], source: null };
}

export async function loadHistory(): Promise<{ season: string; matches: Match[]; source: string }[]> {
  const results: { season: string; matches: Match[]; source: string }[] = [];
  for (const season of ["1718" as const, "1819" as const, "1920" as const, "2021" as const, "2122" as const, "2223" as const, "2324" as const, "2425" as const, "2526" as const]) {
    const { text, source } = await loadSeasonCsv(season);
    if (text && text.trim().length > 100) {
      const matches = parseFootballDataCsv(text, season, `s${season}`);
      results.push({ season, matches, source: source ?? "none" });
    }
  }
  return results;
}
