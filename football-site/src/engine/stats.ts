import { Match, TeamStrength, FormRecord, StandingsRow, StandingsTable } from '../data/types'
import { TEAMS, NAME_TO_ID } from '../data/teams'
import { poissonPMF, predictMatch as pmPoisson } from './poisson'
import { PRIOR_GAMES, HOME_ADVANTAGE, DRAW_INFLATION, MAX_GOALS, CONFIDENCE_CAP, DISPLAY_MARGIN } from '../data/teams'

// ---- Standings ----

export function buildTable(matches: Match[]): StandingsTable {
  const points: Record<string, { gp: number; w: number; d: number; l: number; gf: number; ga: number }> = {}
  let totalGoals = 0, totalHomeGoals = 0, totalAwayGoals = 0, playedCount = 0

  matches.filter(m => m.played && m.homeGoals != null && m.awayGoals != null).forEach(m => {
    totalGoals += (m.homeGoals ?? 0) + (m.awayGoals ?? 0)
    totalHomeGoals += m.homeGoals ?? 0
    totalAwayGoals += m.awayGoals ?? 0
    playedCount++

    ;[m.home, m.away].forEach(id => {
      if (!points[id]) points[id] = { gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 }
      const r = points[id]
      r.gp++
      r.gf += (id === m.home ? m.homeGoals : m.awayGoals) ?? 0
      r.ga += (id === m.home ? m.awayGoals : m.homeGoals) ?? 0
    })

    const hg = m.homeGoals ?? 0, ag = m.awayGoals ?? 0
    if (hg > ag) { points[m.home].w++; points[m.away].l++ }
    else if (hg < ag) { points[m.home].l++; points[m.away].w++ }
    else { points[m.home].d++; points[m.away].d++ }
  })

  const rows: StandingsRow[] = Object.entries(points).map(([id, r]) => ({
    id, name: TEAMS.find(t => t.id === id)?.cn ?? id, ...r,
    gd: r.gf - r.ga, pts: r.w * 3 + r.d
  })).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf).map((r, i) => ({ ...r, rank: i + 1 }))

  return {
    rows,
    avgGoals: playedCount > 0 ? totalGoals / playedCount : 2.6,
    avgHomeGoals: playedCount > 0 ? totalHomeGoals / playedCount : 1.42,
    avgAwayGoals: playedCount > 0 ? totalAwayGoals / playedCount : 1.18,
  }
}

// ---- Strength fitting (Dixon-Coles inspired) ----

export function fitStrengths(current: Match[], history: Match[]): Record<string, TeamStrength> {
  const all: Match[] = [...current, ...history]
  const teams = [...new Set(all.map(m => m.home).concat(all.map(m => m.away)))]

  // Separate home/away games for each team
  const homeGames: Record<string, Match[]> = {}
  const awayGames: Record<string, Match[]> = {}
  teams.forEach(t => { homeGames[t] = []; awayGames[t] = [] })

  all.filter(m => m.played && m.homeGoals != null && m.awayGoals != null).forEach(m => {
    homeGames[m.home]?.push(m)
    awayGames[m.away]?.push(m)
  })

  const priorAtt = 1, priorDef = 1
  const priorWeight = PRIOR_GAMES

  const strengths: Record<string, TeamStrength> = {}
  teams.forEach(id => {
    const hg = homeGames[id] ?? []
    const ag = awayGames[id] ?? []
    const allGames = [...hg, ...ag]

    const homeGF = hg.reduce((s, m) => s + (m.homeGoals ?? 0), 0)
    const homeGA = hg.reduce((s, m) => s + (m.awayGoals ?? 0), 0)
    const awayGF = ag.reduce((s, m) => s + (m.awayGoals ?? 0), 0)
    const awayGA = ag.reduce((s, m) => s + (m.homeGoals ?? 0), 0)

    const homeAtt = (homeGF + priorAtt * priorWeight) / (hg.length + priorWeight)
    const homeDef = (homeGA + priorDef * priorWeight) / (hg.length + priorWeight)
    const awayAtt = (awayGF + priorAtt * priorWeight) / (ag.length + priorWeight)
    const awayDef = (awayGA + priorDef * priorWeight) / (ag.length + priorWeight)

    // Normalize so league average is ~1.0
    strengths[id] = {
      att: Math.max(0.5, Math.min(2.0, (homeAtt + awayAtt) / 2)),
      def: Math.max(0.5, Math.min(2.0, (homeDef + awayDef) / 2)),
      homeAtt: Math.max(0.5, Math.min(2.0, homeAtt)),
      homeDef: Math.max(0.5, Math.min(2.0, homeDef)),
      awayAtt: Math.max(0.5, Math.min(2.0, awayAtt)),
      awayDef: Math.max(0.5, Math.min(2.0, awayDef)),
      games: allGames.length,
    }
  })

  // Second pass: refine using opponent-adjusted values
  const leagueAvgHomeGoals = 1.42
  const leagueAvgAwayGoals = 1.18
  teams.forEach(id => {
    const s = strengths[id]
    s.att = Math.max(0.5, Math.min(2.0, s.att * (leagueAvgHomeGoals / 1.42)))
    s.def = Math.max(0.5, Math.min(2.0, s.def * (leagueAvgAwayGoals / 1.18)))
  })

  return strengths
}

// ---- Form calculation ----

export function computeForm(matches: Match[]): Record<string, FormRecord> {
  const form: Record<string, FormRecord> = {}
  const teams = [...new Set(matches.map(m => m.home).concat(matches.map(m => m.away)))]
  teams.forEach(t => { form[t] = { last5: [], score: 0.5 } })

  // Sort by round then date
  const sorted = [...matches].sort((a, b) => a.round - b.round || a.date.localeCompare(b.date))

  sorted.filter(m => m.played && m.homeGoals != null && m.awayGoals != null).forEach(m => {
    const result = (m.homeGoals ?? 0) > (m.awayGoals ?? 0) ? 'W'
      : (m.homeGoals ?? 0) < (m.awayGoals ?? 0) ? 'L' : 'D'

    ;[m.home, m.away].forEach((id, i) => {
      const r = form[id]
      if (!r) return
      const myResult = i === 0 ? result : (result === 'W' ? 'L' : result === 'L' ? 'W' : 'D')
      r.last5 = [myResult, ...r.last5].slice(0, 5)
      r.score = r.last5.filter(x => x === 'W').length * 1 + r.last5.filter(x => x === 'D').length * 0.5
    })
  })

  // Normalize scores to 0-1 range
  teams.forEach(t => {
    const r = form[t]
    if (r && r.last5.length > 0) {
      r.score = r.score / 5
    }
  })

  return form
}

// ---- Prediction (wrapper around poisson engine) ----

export function predictMatch(match: Match, strengths: Record<string, TeamStrength>, form: Record<string, FormRecord>, avgHomeGoals: number, avgAwayGoals: number): import('../data/types').Prediction | null {
  return pmPoisson(match, strengths, form, avgHomeGoals, avgAwayGoals)
}
