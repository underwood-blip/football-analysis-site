import { NavLink } from 'react-router-dom'
import '../styles.css'

export function Layout({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="logo">λ</div>
          <div>
            <h1>大模型買球分析</h1>
            <p>Poisson · Dixon-Coles 風格 · 英超 2026/27</p>
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/" end className={active === 'epl' ? 'active' : ''}>英超 EPL</NavLink>
          <NavLink to="/standings" className={active === 'standings' ? 'active' : ''}>積分榜</NavLink>
          <NavLink to="/method" className={active === 'method' ? 'active' : ''}>方法論</NavLink>
        </nav>
      </header>
      {children}
      <p className="disclaimer">
        賽果與市場賠率來自 football-data.co.uk E0.csv；模型以泊松分佈推 1X2、大小球。
        服務娛樂與研究，不是即時走地。請理性看待模型輸出，遵守當地法規。
      </p>
    </div>
  )
}
