import { Match } from './types'
import { TEAMS, NAME_TO_ID } from './teams'

const TEAM_IDS = TEAMS.map(t => t.id)

function generateMockMatches(season: string): Match[] {
  const matches: Match[] = []
  const isCurrentSeason = season === '2627'
  const isPlayed = !isCurrentSeason
  
  let matchDay = 1
  for (let homeIdx = 0; homeIdx < TEAM_IDS.length; homeIdx++) {
    for (let awayIdx = 0; awayIdx < TEAM_IDS.length; awayIdx++) {
      if (homeIdx === awayIdx) continue
      const home = TEAM_IDS[homeIdx]
      const away = TEAM_IDS[awayIdx]
      
      const month = 8 + Math.floor(matchDay / 4)
      const day = 1 + (matchDay % 4)
      const date = `${season.slice(0, 2) === '26' ? '2026' : '20' + season.slice(0, 2)}-${String(Math.min(month, 12)).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      
      const matchId = `s${season}-${home}-${away}`
      const played = isPlayed
      
      matches.push({
        id: matchId,
        season,
        date,
        round: Math.ceil(matchDay / 2),
        home,
        away,
        homeGoals: played ? Math.floor(Math.random() * 4) : undefined,
        awayGoals: played ? Math.floor(Math.random() * 3) : undefined,
        played,
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
  return { matches: generateMockMatches(season), source: 'builtin' }
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
  return { matches: generateMockMatches('2627'), source: 'builtin' }
}
