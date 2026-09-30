import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Match, TeamStrength, FormRecord, StandingsTable, Prediction } from './types'
import { LIGUE1_TEAMS, LIGUE1_NAME_TO_ID } from './ligue1Teams'
import { buildTable, fitStrengths, computeForm } from '../engine/stats'
import { predictMatch } from '../engine/poisson'

interface Ligue1ContextType {
  matches: Match[]
  history: Match[]
  strengths: Record<string, TeamStrength>
  form: Record<string, FormRecord>
  table: StandingsTable
  predictions: Prediction[]
  loading: boolean
  meta: { current: string; history: string; historySeasons: number; historyMatches: number; played: number }
}

const Ligue1Context = createContext<Ligue1ContextType | null>(null)

export function Ligue1Provider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([])
  const [history, setHistory] = useState<Match[]>([])
  const [strengths, setStrengths] = useState<Record<string, TeamStrength>>({})
  const [form, setForm] = useState<Record<string, FormRecord>>({})
  const [table, setTable] = useState<StandingsTable>({ rows: [], avgGoals: 2.6, avgHomeGoals: 1.42, avgAwayGoals: 1.18 })
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current: 'none', history: 'none', historySeasons: 0, historyMatches: 0, played: 0 })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const BASE = import.meta.env.BASE_URL || '/'
      
      // Load current season
      let currentText = ''
      try {
        const resp = await fetch(`${BASE}data/F1-2627.csv`)
        if (resp.ok) currentText = await resp.text()
      } catch {}

      // Load history
      const historySeasons = ['2122', '2223', '2324', '2425', '2526']
      const historyTexts: string[] = []
      for (const s of historySeasons) {
        try {
          const resp = await fetch(`${BASE}data/history/F1-${s}.csv`)
          if (resp.ok) historyTexts.push(await resp.text())
        } catch {}
      }

      if (cancelled) return

      const currentMatches = parseCSV(currentText, '2627')
      const allHistory = historyTexts.flatMap(t => parseCSV(t, '2627'))

      setMatches(currentMatches)
      setHistory(allHistory)
      setMeta({
        current: currentText ? 'snapshot' : 'none',
        history: 'football-data.co.uk',
        historySeasons: historySeasons.length,
        historyMatches: allHistory.filter(m => m.played).length,
        played: currentMatches.filter(m => m.played).length,
      })
      setLoading(false)

      const st = fitStrengths(currentMatches, allHistory)
      const fm = computeForm([...currentMatches, ...allHistory])
      const tb = buildTable(currentMatches)
      setStrengths(st)
      setForm(fm)
      setTable(tb)

      const preds = currentMatches
        .filter(m => !m.played)
        .map(m => predictMatch(m, st, fm, tb.avgHomeGoals, tb.avgAwayGoals))
        .filter(Boolean) as Prediction[]
      setPredictions(preds)
    }
    setLoading(true)
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <Ligue1Context.Provider value={{
      matches, history, strengths, form, table, predictions,
      loading, meta
    }}>
      {children}
    </Ligue1Context.Provider>
  )
}

export function useLigue1() {
  const ctx = useContext(Ligue1Context)
  if (!ctx) throw new Error('useLigue1 must be used within Ligue1Provider')
  return ctx
}

function parseCSV(text: string, season: string): Match[] {
  if (!text || text.trim().length < 10) return []
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim())
  
  return lines.slice(1).map(line => {
    const vals = line.split(',')
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = vals[i] ?? '' })
    
    const homeRaw = row['HomeTeam'] ?? ''
    const awayRaw = row['AwayTeam'] ?? ''
    
    // 匹配球队ID
    let homeId = ''
    let awayId = ''
    for (const [name, id] of Object.entries(LIGUE1_NAME_TO_ID)) {
      if (homeRaw.toLowerCase().includes(name.toLowerCase())) homeId = id
      if (awayRaw.toLowerCase().includes(name.toLowerCase())) awayId = id
    }
    if (!homeId) homeId = homeRaw.slice(0, 3).toUpperCase()
    if (!awayId) awayId = awayRaw.slice(0, 3).toUpperCase()
    
    const date = row['Date'] ?? ''
    const played = !!row['FTHG'] && row['FTHG'] !== ''
    
    return {
      id: `f1-${date.replace(/\//g, '-')}-${homeId.toLowerCase()}-${awayId.toLowerCase()}`,
      season,
      date,
      round: 0,
      home: homeId,
      away: awayId,
      homeGoals: played ? parseInt(row['FTHG'] ?? '0') : undefined,
      awayGoals: played ? parseInt(row['FTAG'] ?? '0') : undefined,
      played,
    }
  }).filter(m => m.home && m.away && m.home !== m.away)
}
