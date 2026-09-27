import { Match } from './types'
import { TEAMS, NAME_TO_ID } from './teams'

const TEAM_IDS = TEAMS.map(t => t.id)

// Realistic home/away goal patterns per team
const SCORE_PROFILES: Record<string, { home: number[]; away: number[] }> = {
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

/**
 * Generate a proper double round-robin fixture for N teams (N must be even).
 * Returns 2*(N-1) rounds, each with N/2 matches. Every pair plays twice
 * (once home, once away).
 */
function generateDoubleRoundRobin(teams: string[]): [string, string][][] {
  const n = teams.length
  const halfRounds = n - 1
  const result: [string, string][][] = []

  // Circle method: fix position[0], rotate positions[1..n-1]
  const arr = [...teams]
  for (let round = 0; round < halfRounds; round++) {
    const pairs: [string, string][] = []
    for (let i = 0; i < n / 2; i++) {
      pairs.push([arr[i], arr[n - 1 - i]])
    }
    result.push(pairs)
    // Rotate: move last element to position 1 (keep position 0 fixed)
    const last = arr.pop()!
    arr.splice(1, 0, last)
  }

  const secondHalf = result.map(round =>
    round.map(([a, b]) => [b, a] as [string, string])
  )

  return [...result, ...secondHalf]
}

function getScorePattern(teamId: string, isHome: boolean, rng: () => number): number {
  const profile = SCORE_PROFILES[teamId] ?? { home: [1, 1, 2, 0, 1], away: [0, 1, 0, 1, 0] }
  const goals = isHome ? profile.home : profile.away
  const base = goals[Math.floor(rng() * goals.length)]
  const variation = rng() > 0.6 ? (rng() > 0.5 ? 1 : 0) : 0
  return Math.max(0, base + variation)
}

function generateMockMatches(season: string, playedCount: number): Match[] {
  const matches: Match[] = []
  const seed = season.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rng = seededRandom(seed)

  const fixtures = generateDoubleRoundRobin(TEAM_IDS)
  const year = season.slice(0, 2) === '26' ? 2026 : 2027

  let matchIndex = 0
  for (let r = 0; r < fixtures.length; r++) {
    const roundNum = r + 1
    const month = 8 + Math.floor(r / 4)
    const day = 1 + (r % 4)
    const date = `${year}-${String(Math.min(month, 12)).padStart(2, '0')}-${String(Math.min(day, 28)).padStart(2, '0')}`
    const isPlayed = matchIndex < playedCount

    for (const [home, away] of fixtures[r]) {
      let homeGoals: number | undefined, awayGoals: number | undefined
      if (isPlayed) {
        homeGoals = getScorePattern(home, true, rng)
        awayGoals = getScorePattern(away, false, rng)
      }

      matches.push({
        id: `mw${roundNum}-${home.toLowerCase()}-${away.toLowerCase()}`,
        season,
        date,
        round: roundNum,
        home,
        away,
        homeGoals,
        awayGoals,
        played: isPlayed,
      })
      matchIndex++
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

const CURRENT_PLAYED = 50
const HISTORY_PLAYED_RATIO = 0.95

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
  const played = season === '2627' ? 0 : Math.floor(380 * HISTORY_PLAYED_RATIO)
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
// Build: 1790503989
const BUILD_TIMESTAMP = '1790504013';
