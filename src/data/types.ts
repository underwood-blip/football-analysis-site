export type TeamId =
  | "ARS"
  | "AVL"
  | "BOU"
  | "BRE"
  | "BHA"
  | "CHE"
  | "COV"
  | "CRY"
  | "EVE"
  | "FUL"
  | "HUL"
  | "IPS"
  | "LEE"
  | "LIV"
  | "MCI"
  | "MUN"
  | "NEW"
  | "NFO"
  | "SUN"
  | "TOT";

export interface MarketOdds {
  home?: number;
  draw?: number;
  away?: number;
  over25?: number;
  under25?: number;
  ahLine?: number;
  ahHome?: number;
  ahAway?: number;
}

export interface Match {
  id: string;
  season: string;
  /** ISO 日期 YYYY-MM-DD（英格蘭當地） */
  date: string;
  /** 當地開球時間 HH:MM */
  kickoff?: string;
  round?: number;
  home: TeamId;
  away: TeamId;
  homeGoals?: number;
  awayGoals?: number;
  played: boolean;
  odds?: MarketOdds;
  hxg?: number;
  axg?: number;
  referee?: string;
}

export interface TeamStrength {
  att: number;
  def: number;
  homeAtt: number;
  homeDef: number;
  awayAtt: number;
  awayDef: number;
  games: number;
}

export type LoadSource = "proxy" | "direct" | "snapshot" | "builtin" | "none";

export interface LoadMeta {
  current: LoadSource;
  history: LoadSource;
  loadedAt?: string;
}
