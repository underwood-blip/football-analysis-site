export interface Match {
  id: string
  season: string
  date: string
  time?: string
  round: number
  home: string
  away: string
  homeGoals?: number
  awayGoals?: number
  played: boolean
  odds?: { home: number; draw: number; away: number }
}

export interface SeasonData {
  season: string
  matches: Match[]
  source: 'proxy' | 'direct' | 'snapshot' | 'builtin'
}

export interface TeamStrength {
  att: number
  def: number
  homeAtt: number
  homeDef: number
  awayAtt: number
  awayDef: number
  games: number
}

export interface FormRecord {
  last5: string[]
  score: number
}

export interface Prediction {
  matchId: string
  home: string
  away: string
  lambdaHome: number
  lambdaAway: number
  probHomeWin: number
  probDraw: number
  probAwayWin: number
  probOver25: number
  probUnder25: number
  probBTTS: number
  matrix: number[][]
  odds?: { home: number; draw: number; away: number }
  evHome?: number
  evDraw?: number
  evAway?: number
  confidence: number
  suggestedStake: 'high' | 'medium' | 'low' | ''
  narrative: string
}

export interface StandingsRow {
  id: string
  name: string
  gp: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  gd: number
  pts: number
  rank: number
}

export interface StandingsTable {
  rows: StandingsRow[]
  avgGoals: number
  avgHomeGoals: number
  avgAwayGoals: number
}

export type CSVRow = Record<string, string>
