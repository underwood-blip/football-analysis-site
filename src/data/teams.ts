import type { TeamId } from "./types";

export const CURRENT_SEASON = "2627";
export const HISTORY_SEASONS = [
  "1718",
  "1819",
  "1920",
  "2021",
  "2122",
  "2223",
  "2324",
  "2425",
  "2526",
] as const;

export interface TeamInfo {
  id: TeamId;
  name: string;
  short: string;
}

export const TEAMS: Record<TeamId, TeamInfo> = {
  ARS: { id: "ARS", name: "Arsenal", short: "阿仙奴" },
  AVL: { id: "AVL", name: "Aston Villa", short: "維拉" },
  BOU: { id: "BOU", name: "Bournemouth", short: "般尼茅夫" },
  BRE: { id: "BRE", name: "Brentford", short: "賓福特" },
  BHA: { id: "BHA", name: "Brighton", short: "白禮頓" },
  CHE: { id: "CHE", name: "Chelsea", short: "車路士" },
  COV: { id: "COV", name: "Coventry", short: "高雲地利" },
  CRY: { id: "CRY", name: "Crystal Palace", short: "水晶宮" },
  EVE: { id: "EVE", name: "Everton", short: "愛華頓" },
  FUL: { id: "FUL", name: "Fulham", short: "富咸" },
  HUL: { id: "HUL", name: "Hull", short: "侯城" },
  IPS: { id: "IPS", name: "Ipswich", short: "葉士域治" },
  LEE: { id: "LEE", name: "Leeds", short: "列斯聯" },
  LIV: { id: "LIV", name: "Liverpool", short: "利物浦" },
  MCI: { id: "MCI", name: "Man City", short: "曼城" },
  MUN: { id: "MUN", name: "Man United", short: "曼聯" },
  NEW: { id: "NEW", name: "Newcastle", short: "紐卡素" },
  NFO: { id: "NFO", name: "Nott'm Forest", short: "諾定咸" },
  SUN: { id: "SUN", name: "Sunderland", short: "新特蘭" },
  TOT: { id: "TOT", name: "Tottenham", short: "熱刺" },
};

export function teamName(id: TeamId): string {
  return TEAMS[id]?.name ?? id;
}

export function teamShort(id: TeamId): string {
  return TEAMS[id]?.short ?? id;
}

/**
 * 隊名 → TeamId 對映。歷史賽季會出現本季已不在英超的隊伍，
 * 對映成合成 TeamId（只進入訓練用的 history，不可進入 buildTable）。
 */
export const NAME_TO_ID: Record<string, TeamId> = {
  Arsenal: "ARS",
  "Aston Villa": "AVL",
  Bournemouth: "BOU",
  Brentford: "BRE",
  Brighton: "BHA",
  Chelsea: "CHE",
  Coventry: "COV",
  "Crystal Palace": "CRY",
  Everton: "EVE",
  Fulham: "FUL",
  Hull: "HUL",
  Ipswich: "IPS",
  Leeds: "LEE",
  Liverpool: "LIV",
  "Man City": "MCI",
  "Man United": "MUN",
  Newcastle: "NEW",
  "Nott'm Forest": "NFO",
  "Nottm Forest": "NFO",
  Sunderland: "SUN",
  Tottenham: "TOT",
  // 歷史合成 ID（僅訓練用）
  Burnley: "BUR" as TeamId,
  Cardiff: "CAR" as TeamId,
  Huddersfield: "HUD" as TeamId,
  Leicester: "LEI" as TeamId,
  Southampton: "SOU" as TeamId,
  Stoke: "STK" as TeamId,
  Swansea: "SWA" as TeamId,
  Watford: "WAT" as TeamId,
  "West Brom": "WBA" as TeamId,
  Wolves: "WOL" as TeamId,
};

/** 近季權重高、舊季權重低；未列出的賽季回退 0.2 */
export const SEASON_WEIGHTS: Record<string, number> = {
  "2627": 1,
  "2526": 0.78,
  "2425": 0.61,
  "2324": 0.48,
  "2223": 0.37,
  "2122": 0.29,
  "2021": 0.23,
  "1920": 0.18,
  "1819": 0.14,
  "1718": 0.11,
};

export function seasonWeight(season: string): number {
  return SEASON_WEIGHTS[season] ?? 0.2;
}
