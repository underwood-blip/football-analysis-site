import { NavLink } from 'react-router-dom'
import '../styles.css'

const TEAM_COLORS: Record<string, string> = {
  LIV: '#C8102E', MCI: '#6CABDD', ARS: '#EF0107', CHE: '#034694',
  MUN: '#DA291C', TOT: '#132257', NEW: '#41B6E6', AVL: '#95BFE5',
  BHA: '#0057B8', BRE: '#e30613', EVE: '#003399', FUL: '#CC0000',
  BOU: '#B50E12', CRY: '#1B458F', LEI: '#FFCD00', SUN: '#EE2737',
  WHU: '#7A263A', IPS: '#3a64a3', WOL: '#FDB913',
}

export function getTeamColor(id: string): string {
  return TEAM_COLORS[id] ?? '#22e58a'
}

export function teamDot(id: string, size = 38) {
  const color = getTeamColor(id)
  const abbr = id.slice(-2)
  return `<div class="dot" style="background:linear-gradient(135deg,${color},${color}cc);width:${size}px;height:${size}px;font-size:${size * 0.38}px">${abbr}</div>`
}

export function Layout({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <>
      <div className="bg-glow" />
      <div className="bg-grid" />
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-badge">λ</div>
            <div>
              <span className="brand-text">英超智预测</span>
              <span className="brand-sub">泊松 · Dixon-Coles 混合模型</span>
            </div>
          </div>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>比赛预测</NavLink>
            <NavLink to="/standings" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>积分榜</NavLink>
            <NavLink to="/method" className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}>方法论</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        {children}
      </main>
      <p className="footer-note">
        <b>英超智预测</b> · 泊松分布 × 主客攻防强度模型<br />
        基于 {Intl.NumberFormat().format(380)} 场已完成比赛训练 · 仅供数据研究参考
      </p>
    </>
  )
}
