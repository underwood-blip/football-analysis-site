import { HashRouter, Routes, Route } from 'react-router-dom'
import { EplProvider } from './data/EplData'
import { Ligue1Provider } from './data/Ligue1Data'
import { Layout } from './ui/Layout'
import EplPage from './pages/EplPage'
import MatchPage from './pages/MatchPage'
import StandingsPage from './pages/StandingsPage'
import MethodPage from './pages/MethodPage'
import Ligue1Page from './pages/Ligue1Page'

import { useMemo } from 'react'

export default function App() {
  return (
    <HashRouter>
      <EplProvider>
        <Ligue1Provider>
          <AppInner />
        </Ligue1Provider>
      </EplProvider>
    </HashRouter>
  )
}

function AppInner() {
  const hash = window.location.hash || '#'
  const active = useMemo(() => {
    if (hash.startsWith('#/match')) return 'epl'
    if (hash === '#/standings') return 'standings'
    if (hash === '#/method') return 'method'
    if (hash.startsWith('#/ligue1')) return 'ligue1'
    return 'epl'
  }, [hash])

  return (
    <>
      <Routes>
        <Route path="/" element={<EplPage active={active} />} />
        <Route path="/match/:id" element={<MatchPage />} />
        <Route path="/standings" element={<StandingsPage />} />
        <Route path="/method" element={<MethodPage />} />
        <Route path="/ligue1" element={<Ligue1Page active={active} />} />
      </Routes>
    </>
  )
}
