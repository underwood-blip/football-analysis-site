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

export function buildTable(matches: import('./types').Match[]): StandingsTable {
  const rows: StandingsRow[] = []
  let totalGoals = 0
  let totalHomeGoals = 0
  let totalAwayGoals = 0
  let playedCount = 0

  matches.filter(m => m.played && m.homeGoals != null && m.awayGoals != null).forEach(m => {
    totalGoals += (m.homeGoals ?? 0) + (m.awayGoals ?? 0)
    totalHomeGoals += m.homeGoals ?? 0
    totalAwayGoals += m.awayGoals ?? 0
    playedCount++
  })

  return {
    rows,
    avgGoals: playedCount > 0 ? totalGoals / playedCount : 2.6,
    avgHomeGoals: playedCount > 0 ? totalHomeGoals / playedCount : 1.42,
    avgAwayGoals: playedCount > 0 ? totalAwayGoals / playedCount : 1.18,
  }
}

export function fitStrengths(current: import('./types').Match[], history: import('./types').Match[]): Record<string, TeamStrength> {
  const all = [...current, ...history]
  const strengths: Record<string, TeamStrength> = {}
  const teams = [...new Set(all.map(m => m.home).concat(all.map(m => m.away)))]
  
  teams.forEach(id => {
    strengths[id] = { att: 1, def: 1, homeAtt: 1, homeDef: 1, awayAtt: 1, awayDef: 1, games: 0 }
  })
  
  return strengths
}

export function computeForm(matches: import('./types').Match[]): Record<string, FormRecord> {
  const form: Record<string, FormRecord> = {}
  const teams = [...new Set(matches.map(m => m.home).concat(matches.map(m => m.away)))]
  
  teams.forEach(id => {
    form[id] = { last5: [], score: 0.5 }
  })
  
  return form
}

export function predictMatch(match: import('./types').Match, strengths: Record<string, TeamStrength>, form: Record<string, FormRecord>, avgHome: number, avgAway: number): import('./types').Prediction | null {
  const homeStr = strengths[match.home]
  const awayStr = strengths[match.away]
  if (!homeStr || !awayStr) return null
  
  const lambdaHome = avgHome * homeStr.att * awayStr.def * 1.12
  const lambdaAway = avgAway * awayStr.att * homeStr.def
  
  return {
    matchId: match.id,
    home: match.home,
    away: match.away,
    lambdaHome: Math.round(lambdaHome * 100) / 100,
    lambdaAway: Math.round(lambdaAway * 100) / 100,
    probHomeWin: 0.4,
    probDraw: 0.3,
    probAwayWin: 0.3,
    probOver25: 0.5,
    probUnder25: 0.5,
    probBTTS: 0.5,
    matrix: [],
    confidence: 0.65,
    suggestedStake: '',
    narrative: `${match.home} vs ${match.away}`,
  }
}
