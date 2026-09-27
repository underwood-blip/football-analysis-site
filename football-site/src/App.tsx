import { HashRouter, Routes, Route } from 'react-router-dom'
import { EplProvider } from './data/EplData'
import Layout from './ui/Layout'
import EplPage from './pages/EplPage'
import MatchPage from './pages/MatchPage'
import StandingsPage from './pages/StandingsPage'
import MethodPage from './pages/MethodPage'

export default function App() {
  return (
    <HashRouter>
      <EplProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<EplPage />} />
            <Route path="/match/:id" element={<MatchPage />} />
            <Route path="/standings" element={<StandingsPage />} />
            <Route path="/method" element={<MethodPage />} />
          </Routes>
        </Layout>
      </EplProvider>
    </BrowserRouter>
  )
}
