import { Match } from './types'
import { TEAMS } from './teams'

function parseDate(s: string): string {
  const [d, m, y] = s.split('/')
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
    const homeId = TEAMS.find(t => t.name === home || t.short === home)?.id ?? home
    const awayId = TEAMS.find(t => t.name === away || t.short === away)?.id ?? away
    const date = parseDate(row['Date'] ?? '')
    const played = !!row['FTHG'] && row['FTHG'] !== ''
    return {
      id: `s${season}-${homeId}-${awayId}`,
      season,
      date,
      round: 1,
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
  return { matches: [], source: 'builtin' }
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
  return { matches: [], source: 'builtin' }
}
