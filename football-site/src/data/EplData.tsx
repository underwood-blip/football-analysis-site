import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Match, TeamStrength, FormRecord, StandingsTable, Prediction } from './types'
import { loadCurrentSeason, loadSeasonData } from './footballData'
import { buildTable, fitStrengths, computeForm } from '../engine/stats'
import { predictMatch } from '../engine/poisson'

interface EplContextType {
  matches: Match[]
  history: Match[]
  strengths: Record<string, TeamStrength>
  form: Record<string, FormRecord>
  table: StandingsTable
  predictions: Prediction[]
  loading: boolean
  historyLoading: boolean
  meta: { current: string; history: string; historySeasons: number; historyMatches: number; played: number }
  focusMatchId: string
}

const EplContext = createContext<EplContextType | null>(null)

export function EplProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([])
  const [history, setHistory] = useState<Match[]>([])
  const [strengths, setStrengths] = useState<Record<string, TeamStrength>>({})
  const [form, setForm] = useState<Record<string, FormRecord>>({})
  const [table, setTable] = useState<StandingsTable>({ rows: [], avgGoals: 2.6, avgHomeGoals: 1.42, avgAwayGoals: 1.18 })
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [meta, setMeta] = useState({ current: 'none', history: 'none', historySeasons: 0, historyMatches: 0, played: 0 })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [current, histories] = await Promise.all([
        loadCurrentSeason(),
        Promise.all(['1718', '1819', '1920', '2021', '2122', '2223', '2324', '2425', '2526'].map(s => loadSeasonData(s))),
      ])
      if (cancelled) return

      const allMatches = [...current.matches, ...histories.flatMap(h => h.matches)]
      setMatches(current.matches)
      setHistory(allMatches)
      setMeta(m => ({
        ...m,
        current: current.source,
        history: histories[0]?.source ?? 'none',
        historySeasons: histories.length,
        historyMatches: histories.reduce((acc, h) => acc + h.matches.filter(mm => mm.played).length, 0),
        played: current.matches.filter(mm => mm.played).length,
      }))
      setLoading(false)
      setHistoryLoading(false)

      const st = fitStrengths(current.matches, allMatches)
      const fm = computeForm(allMatches)
      const tb = buildTable(allMatches)
      setStrengths(st)
      setForm(fm)
      setTable(tb)

      const preds = current.matches
        .filter(m => !m.played)
        .map(m => predictMatch(m, st, fm, tb.avgHomeGoals, tb.avgAwayGoals))
        .filter(Boolean) as Prediction[]
      setPredictions(preds)
    }
    setLoading(true)
    setHistoryLoading(true)
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <EplContext.Provider value={{
      matches, history, strengths, form, table, predictions,
      loading, historyLoading, meta, focusMatchId: 'mw6-liv-mci'
    }}>
      {children}
    </EplContext.Provider>
  )
}

export function useEpl() {
  const ctx = useContext(EplContext)
  if (!ctx) throw new Error('useEpl must be used within EplProvider')
  return ctx
}
