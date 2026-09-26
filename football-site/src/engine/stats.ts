import { Match, TeamStrength, FormRecord, StandingsTable, StandingsRow } from '../data/types'
import { TEAMS, SEASON_WEIGHTS, PRIOR_GAMES } from '../data/teams'

export function buildTable(matches: Match[]): StandingsTable {
  const stats: Record<string, { gp: number; w: number; d: number; l: number; gf: number; ga: number }> = {}
  TEAMS.forEach(t => { stats[t.id] = { gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 } })
  let totalGoals = 0, homeGoals = 0, awayGoals = 0, played = 0
  matches.forEach(m => {
    if (!m.played || m.homeGoals == null || m.awayGoals == null) return
    const h = stats[m.home], a = stats[m.away]
    if (!h || !a) return
    h.gp++; a.gp++; h.gf += m.homeGoals; h.ga += m.awayGoals
    a.gf += m.awayGoals; a.ga += m.homeGoals
    if (m.homeGoals > m.awayGoals) { h.w++; a.l++ }
    else if (m.homeGoals < m.awayGoals) { h.l++; a.w++ }
    else { h.d++; a.d++ }
    totalGoals += m.homeGoals + m.awayGoals
    homeGoals += m.homeGoals; awayGoals += m.awayGoals; played++
  })
  const rows: StandingsRow[] = TEAMS.map(t => {
    const s = stats[t.id]
    return { id: t.id, name: t.short, gp: s.gp, w: s.w, d: s.d, l: s.l, gf: s.gf, ga: s.ga, gd: s.gf - s.ga, pts: s.w * 3 + s.d, rank: 0 }
  }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf).map((r, i) => ({ ...r, rank: i + 1 }))
  return { rows, avgGoals: played > 0 ? totalGoals / played : 2.6, avgHomeGoals: played > 0 ? homeGoals / played : 1.42, avgAwayGoals: played > 0 ? awayGoals / played : 1.18 }
}

export function fitStrengths(_current: Match[], all: Match[]): Record<string, TeamStrength> {
  const hCount = all.filter(m => m.played && m.homeGoals != null).length || 1
  const aCount = all.filter(m => m.played && m.awayGoals != null).length || 1
  const leagueAvgHome = all.filter(m => m.played && m.homeGoals != null).reduce((s, m) => s + (m.homeGoals ?? 0), 0) / hCount || 1.42
  const leagueAvgAway = all.filter(m => m.played && m.awayGoals != null).reduce((s, m) => s + (m.awayGoals ?? 0), 0) / aCount || 1.18
  const teamStats: Record<string, { att: number; def: number; homeAtt: number; homeDef: number; awayAtt: number; awayDef: number; games: number }> = {}
  TEAMS.forEach((_t) => { teamStats[_t.id] = { att: 0, def: 0, homeAtt: 0, homeDef: 0, awayAtt: 0, awayDef: 0, games: 0 } })
  all.forEach(m => {
    if (!m.played || m.homeGoals == null || m.awayGoals == null) return
    const w = SEASON_WEIGHTS[m.season] ?? 1
    const home = teamStats[m.home], away = teamStats[m.away]
    if (!home || !away) return
    home.att += (m.homeGoals ?? 0) * w; home.def += (m.awayGoals ?? 0) * w
    home.homeAtt += (m.homeGoals ?? 0) * w; home.homeDef += (m.awayGoals ?? 0) * w; home.games += w
    away.att += (m.awayGoals ?? 0) * w; away.def += (m.homeGoals ?? 0) * w
    away.awayAtt += (m.awayGoals ?? 0) * w; away.awayDef += (m.homeGoals ?? 0) * w; away.games += w
  })
  const result: Record<string, TeamStrength> = {}
  TEAMS.forEach((_t) => {
    const s = teamStats[_t.id]
    if (!s || s.games === 0) { result[_t.id] = { att: 1, def: 1, homeAtt: 1, homeDef: 1, awayAtt: 1, awayDef: 1, games: 0 }; return }
    result[_t.id] = {
      att: (s.att + PRIOR_GAMES * leagueAvgAway) / (s.games + PRIOR_GAMES),
      def: (s.def + PRIOR_GAMES * leagueAvgHome) / (s.games + PRIOR_GAMES),
      homeAtt: (s.homeAtt + PRIOR_GAMES * leagueAvgHome) / (s.games + PRIOR_GAMES),
      homeDef: (s.homeDef + PRIOR_GAMES * leagueAvgAway) / (s.games + PRIOR_GAMES),
      awayAtt: (s.awayAtt + PRIOR_GAMES * leagueAvgAway) / (s.games + PRIOR_GAMES),
      awayDef: (s.awayDef + PRIOR_GAMES * leagueAvgHome) / (s.games + PRIOR_GAMES),
      games: s.games,
    }
  })
  return result
}

export function computeForm(all: Match[]): Record<string, FormRecord> {
  const byTeam: Record<string, Match[]> = {}
  TEAMS.forEach(t => { byTeam[t.id] = [] })
  all.forEach(m => {
    if (!m.played || m.homeGoals == null) return
    if (byTeam[m.home]) byTeam[m.home].push(m)
    if (byTeam[m.away]) byTeam[m.away].push(m)
  })
  const result: Record<string, FormRecord> = {}
  TEAMS.forEach((_t) => {
    const ms = (byTeam[_t.id] ?? []).sort((a, b) => a.date.localeCompare(b.date)).slice(-5)
    const last5 = ms.map(m => {
      const isHome = m.home === _t.id
      const scored = isHome ? (m.homeGoals ?? 0) : (m.awayGoals ?? 0)
      const conceded = isHome ? (m.awayGoals ?? 0) : (m.homeGoals ?? 0)
      if (scored > conceded) return 'W'
      if (scored < conceded) return 'L'
      return 'D'
    })
    result[_t.id] = { last5, score: last5.filter(r => r === 'W').length / 5 }
  })
  return result
}
