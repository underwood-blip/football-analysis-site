import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

const NAV_LINKS = [
  { to: "/epl", label: "預測" },
  { to: "/epl/standings", label: "積分榜" },
  { to: "/epl/method", label: "方法論" },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/epl" className="logo">
            <span className="logo-icon">⚽</span>
            <span className="logo-text">英超大模型數據分析</span>
          </Link>
          <nav className="nav">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link${location.pathname.startsWith(l.to) ? " active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="container main">
        {children}
      </main>

      <footer className="site-footer">
        <div className="container">
          <p className="disclaimer">
            免責聲明：本站僅供數據研究與教育用途，所有預測基於統計模型，不構成任何投注建議。
            足球比賽存在高度不確定性，模型預測不保證準確。請理性看待數據，勿將此網站內容用於違法賭博活動。
            數據來源：football-data.co.uk（英超賽果、賠率、xG）。
          </p>
          <p className="copyright">
            © 2026 Football Analysis Site · 基於泊松分佈與多賽季強度擬合
          </p>
        </div>
      </footer>
    </div>
  );
}
