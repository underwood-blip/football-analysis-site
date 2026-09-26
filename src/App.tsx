import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./ui/Layout";
import EplProvider from "./data/EplData";
import EplPage from "./pages/EplPage";
import MatchPage from "./pages/MatchPage";
import StandingsPage from "./pages/StandingsPage";
import MethodPage from "./pages/MethodPage";

export default function App() {
  return (
    <BrowserRouter>
      <EplProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/epl" replace />} />
            <Route path="/epl" element={<EplPage />} />
            <Route path="/epl/match/:id" element={<MatchPage />} />
            <Route path="/epl/standings" element={<StandingsPage />} />
            <Route path="/epl/method" element={<MethodPage />} />
            <Route path="*" element={<Navigate to="/epl" replace />} />
          </Routes>
        </Layout>
      </EplProvider>
    </BrowserRouter>
  );
}
