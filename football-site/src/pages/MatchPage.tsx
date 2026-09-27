import { Link, useParams } from 'react-router-dom'
import { useEpl } from '../data/EplData'
import { TEAMS } from '../data/teams'
import { Layout } from '../ui/Layout'

function pct(n: number) {
  return `${Math.round(n * 100)}%`
}

function fmtStake(stake: string) {
  if (stake === 'high') return '重倉'
  if (stake === 'medium') return '標準'
  if (stake === 'low') return '輕倉'
  return '觀望'
}

function getTeamColor(id: string): string {
  const colors: Record<string, string> = {
    LIV: '#C8102E', MCI: '#6CABDD', ARS: '#EF0107', CHE: '#034694',
    MUN: '#DA291C', TOT: '#132257', NEW: '#41B6E6', AVL: '#95BFE5',
    BHA: '#0057B8', BRE: '#e30613', EVE: '#003399', FUL: '#CC0000',
    BOU: '#B50E12', CRY: '#1B458F', LEI: '#FFCD00', SUN: '#EE2737',
    WHU: '#7A263A', IPS: '#3a64a3', WOL: '#FDB913', COV: '#0596d4',
    HUL: '#F18A01', NFO: '#DD0000',
  }
  return colors[id] ?? '#22e58a'
}

function ScoreMatrix({ matrix }: { matrix: number[][] }) {
  const rows: JSX.Element[] = []
  for (let i = 0; i <= 6; i++) {
    const cells: JSX.Element[] = []
    for (let j = 0; j <= 6; j++) {
      const prob = matrix[i]?.[j] ?? 0
      const cls = i === j ? 'cell-draw' : i > j ? 'cell-home' : 'cell-away'
      cells.push(<td key={j} className={cls}>{prob > 0 ? (prob * 100).toFixed(1) + '%' : '-'}</td>)
    }
    rows.push(<tr key={i}>{cells}</tr>)
  }
  return (
    <div className="matrix-container">
      <div className="section-t">比分機率矩陣</div>
      <table className="score-matrix">
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: 7 }, (_, i) => <th key={i}>{i}</th>)}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      <p className="matrix-caption">行 = 主隊進球 · 列 = 客隊進球</p>
    </div>
  )
}

export default function MatchPage() {
  const { id } = useParams<{ id: string }>()
  const { predictions, matches, loading } = useEpl()

  if (loading) {
    return (
      <Layout active="epl">
        <div className="empty-note">載入中…</div>
      </Layout>
    )
  }
  if (!id) {
    return (
      <Layout active="epl">
        <Link to="/" className="back">← 返回預測</Link>
        <div className="empty-note">請選擇一場比賽</div>
      </Layout>
    )
  }

  const pred = predictions.find(p => p.matchId === id)
  const match = matches.find(m => m.id === id)
  if (!pred || !match) {
    return (
      <Layout active="epl">
        <Link to="/" className="back">← 返回預測</Link>
        <div className="empty-note">找不到該場比賽的預測</div>
      </Layout>
    )
  }

  const homeName = TEAMS.find(t => t.id === pred.home)?.short ?? pred.home
  const awayName = TEAMS.find(t => t.id === pred.away)?.short ?? pred.away
  const homeColor = getTeamColor(pred.home)
  const awayColor = getTeamColor(pred.away)

  return (
    <Layout active="epl">
      <Link to="/" className="back">← 返回第 {match.round} 輪列表</Link>

      {/* Hero */}
      <div className="view-header" style={{ marginBottom: 20 }}>
        <h2>
          {homeName} <em>vs</em> {awayName}
        </h2>
        <p className="view-desc">
          第 {match.round} 輪 · λ {pred.lambdaHome.toFixed(2)} : {pred.lambdaAway.toFixed(2)}
        </p>
      </div>

      {/* Match detail card */}
      <div className="match-card" style={{ marginBottom: 24, cursor: 'default' }}>
        <div className="mc-teams" style={{ marginBottom: 20 }}>
          <div className="mc-team">
            <div className="dot" style={{ background: `linear-gradient(135deg,${homeColor},${homeColor}cc)`, width: 56, height: 56, borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, font: '18px sans-serif', color: '#04121f' }}>
              {homeName.slice(-2)}
            </div>
            <div className="name" style={{ fontSize: 16 }}>{homeName}</div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gold)', letterSpacing: 2 }}>VS</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{match.date}</div>
          </div>
          <div className="mc-team">
            <div className="dot" style={{ background: `linear-gradient(135deg,${awayColor},${awayColor}cc)`, width: 56, height: 56, borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, font: '18px sans-serif', color: '#04121f' }}>
              {awayName.slice(-2)}
            </div>
            <div className="name" style={{ fontSize: 16 }}>{awayName}</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="hero" style={{ marginBottom: 0, gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--green)', WebkitTextFillColor: 'var(--green)', fontSize: 24 }}>{pred.lambdaHome.toFixed(2)}</div>
            <div className="stat-label">{homeName} λ</div>
          </div>
          <div className="stat-card">
            <div className="stat-value gold" style={{ fontSize: 24 }}>{pct(pred.confidence)}</div>
            <div className="stat-label">信心度</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ fontSize: 24, WebkitTextFillColor: 'var(--gold)' }}>{pred.suggestedStake ? fmtStake(pred.suggestedStake) : '觀望'}</div>
            <div className="stat-label">建議倉位</div>
          </div>
        </div>
      </div>

      {/* Probability bars */}
      <div className="section-t">1X2 機率</div>
      <div className="match-card" style={{ cursor: 'default', marginBottom: 24 }}>
        <div className="prob-bar" style={{ height: 48, marginBottom: 12 }}>
          <div className="prob-seg home" style={{ width: `${pred.probHomeWin * 100}%` }}>
            {pred.probHomeWin >= 0.15 ? <span style={{ fontSize: 14 }}>{pct(pred.probHomeWin)}</span> : null}
          </div>
          <div className="prob-seg draw" style={{ width: `${pred.probDraw * 100}%` }}>
            {pred.probDraw >= 0.15 ? <span style={{ fontSize: 14 }}>{pct(pred.probDraw)}</span> : null}
          </div>
          <div className="prob-seg away" style={{ width: `${pred.probAwayWin * 100}%` }}>
            {pred.probAwayWin >= 0.15 ? <span style={{ fontSize: 14 }}>{pct(pred.probAwayWin)}</span> : null}
          </div>
        </div>
        <div className="prob-legend" style={{ marginBottom: 0 }}>
          <span><b>主勝</b> {pct(pred.probHomeWin)}</span>
          <span><b>平局</b> {pct(pred.probDraw)}</span>
          <span><b>客勝</b> {pct(pred.probAwayWin)}</span>
        </div>
      </div>

      {/* Other markets */}
      <div className="section-t">其他市場</div>
      <div className="odds-grid" style={{ marginBottom: 24 }}>
        <div>
          <em>大 2.5 球</em>
          <b style={{ color: pred.probOver25 > 0.5 ? 'var(--green)' : 'var(--text)' }}>{pct(pred.probOver25)}</b>
        </div>
        <div>
          <em>小 2.5 球</em>
          <b>{pct(pred.probUnder25)}</b>
        </div>
        <div>
          <em>兩隊都進球</em>
          <b style={{ color: pred.probBTTS > 0.5 ? 'var(--green)' : 'var(--text)' }}>{pct(pred.probBTTS)}</b>
        </div>
        <div>
          <em>總期望進球</em>
          <b>{(pred.lambdaHome + pred.lambdaAway).toFixed(2)}</b>
        </div>
      </div>

      {/* Narrative */}
      <div className="match-card" style={{ cursor: 'default', marginBottom: 24 }}>
        <div className="section-t" style={{ marginTop: 0 }}>預測分析</div>
        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.8, margin: 0 }}>{pred.narrative}</p>
      </div>

      <ScoreMatrix matrix={pred.matrix} />
    </Layout>
  )
}
