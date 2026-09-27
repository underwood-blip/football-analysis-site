import { Link, useLocation } from 'react-router-dom'
import '../styles.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-inner">
            <Link to="/" className="logo">英超數據分析</Link>
            <nav className="nav">
              <Link to="/" className={location.pathname === '/' || location.hash === '#/' ? 'active' : ''}>賽事預測</Link>
              <Link to="/standings" className={location.pathname === '/standings' || location.hash === '#/standings' ? 'active' : ''}>積分榜</Link>
              <Link to="/method" className={location.pathname === '/method' || location.hash === '#/method' ? 'active' : ''}>方法論</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p className="disclaimer">免責聲明：本站僅供數據研究參考，不構成任何投注建議。足球比賽結果具有不確定性，請理性看待數據分析結果。</p>
          <p className="copyright">© 2026 英超大模型數據分析站</p>
        </div>
      </footer>
    </div>
  )
}
