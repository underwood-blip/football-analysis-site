import { Match } from './types'
import { TEAMS, NAME_TO_ID } from './teams'

const TEAM_IDS = TEAMS.map(t => t.id)

// Pre-defined realistic score patterns for mock data
const SCORE_PATTERNS: Record<string, { home: number[]; away: number[] }> = {
  LIV: { home: [2, 3, 1, 2, 4], away: [0, 1, 0, 1, 0] },
  MCI: { home: [3, 2, 1, 2, 3], away: [0, 1, 0, 0, 1] },
  ARS: { home: [2, 3, 1, 2, 1], away: [0, 1, 0, 0, 1] },
  CHE: { home: [2, 1, 2, 1, 3], away: [1, 0, 1, 0, 1] },
  MUN: { home: [1, 2, 1, 0, 2], away: [1, 0, 1, 0, 1] },
  TOT: { home: [2, 1, 3, 2, 1], away: [1, 0, 1, 2, 0] },
  NEW: { home: [2, 1, 2, 1, 2], away: [0, 1, 0, 0, 1] },
  AVL: { home: [1, 2, 1, 0, 1], away: [0, 1, 0, 0, 0] },
}

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function generateMockMatches(season: string, playedCount: number): Match[] {
  const matches: Match[] = []
  const rng = seededRandom(season.split('').reduce((a, c) => a + c.charCodeAt(0), 0))

  let matchDay = 1
  for (let homeIdx = 0; homeIdx < TEAM_IDS.length; homeIdx++) {
    for (let awayIdx = 0; awayIdx < TEAM_IDS.length; awayIdx++) {
      if (homeIdx === awayIdx) continue
      const home = TEAM_IDS[homeIdx]
      const away = TEAM_IDS[awayIdx]

      const month = 8 + Math.floor(matchDay / 4)
      const day = 1 + (matchDay % 4)
      const date = `${season.slice(0, 2) === '26' ? '2026' : '20' + season.slice(0, 2)}-${String(Math.min(month, 12)).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      const isPlayed = matchDay <= playedCount
      const round = Math.ceil(matchDay / 10)  // 英超每轮10场比赛

      let homeGoals: number | undefined, awayGoals: number | undefined
      if (isPlayed) {
        const sp = SCORE_PATTERNS[home] ?? { home: [1, 1, 2, 0, 1], away: [0, 1, 0, 0, 1] }
        homeGoals = sp.home[Math.floor(rng() * sp.home.length)]
        awayGoals = (SCORE_PATTERNS[away] ?? { home: [], away: [0, 1, 0] }).away[Math.floor(rng() * 3)]
        // Add some randomness
        if (rng() > 0.7) homeGoals = Math.max(0, homeGoals + (rng() > 0.5 ? 1 : 0))
        if (rng() > 0.7) awayGoals = Math.max(0, awayGoals + (rng() > 0.5 ? 1 : 0))
      }

      const matchId = `mw${round}-${home.toLowerCase()}-${away.toLowerCase()}`
      matches.push({
        id: matchId,
        season,
        date,
        round,
        home,
        away,
        homeGoals,
        awayGoals,
        played: isPlayed,
      })
      matchDay++
    }
  }

  return matches
}

function parseDate(s: string): string {
  const [y, m, d] = s.split('-')
  return `${y}-${m}-${d}`
}

function parseCSV(text: string, season: string): Match[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const vals = line.split(',')
    const row = Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
    const home = row['HomeTeam'] ?? ''
    const away = row['AwayTeam'] ?? ''
    const homeId = Object.values(NAME_TO_ID).find(k => home.includes(k) || k.toLowerCase() === home.toLowerCase()) ?? home
    const awayId = Object.values(NAME_TO_ID).find(k => away.includes(k) || k.toLowerCase() === away.toLowerCase()) ?? away
    const date = row['Date'] ?? ''
    const played = !!row['FTHG'] && row['FTHG'] !== ''
    return {
      id: `s${season}-${homeId}-${awayId}`,
      season,
      date: played ? parseDate(date) : date,
      round: parseInt(row['Round'] ?? '1'),
      home: homeId,
      away: awayId,
      homeGoals: played ? parseInt(row['FTHG'] ?? '0') : undefined,
      awayGoals: played ? parseInt(row['FTAG'] ?? '0') : undefined,
      played,
    }
  })
}

// Current season: assume 6 rounds played (matches 1-120 of 380)
const CURRENT_PLAYED = 120

export async function loadSeasonData(season: string): Promise<{ matches: Match[], source: string }> {
  try {
    const resp = await fetch(`/data/history/E0-${season}.csv`)
    if (resp.ok) {
      const text = await resp.text()
      const matches = parseCSV(text, season)
      if (matches.length > 100) {
        return { matches, source: 'snapshot' }
      }
    }
  } catch {}
  const played = season === '2627' ? 0 : Math.floor(380 * 0.85)
  return { matches: generateMockMatches(season, played), source: 'builtin' }
}

export async function loadCurrentSeason(): Promise<{ matches: Match[], source: string }> {
  try {
    const resp = await fetch('/data/E0-2627.csv')
    if (resp.ok) {
      const text = await resp.text()
      const matches = parseCSV(text, '2627')
      if (matches.length > 10) {
        return { matches, source: 'snapshot' }
      }
    }
  } catch {}
  return { matches: generateMockMatches('2627', CURRENT_PLAYED), source: 'builtin' }
}
