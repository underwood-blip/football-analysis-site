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

function ScoreMatrix({ matrix }: { matrix: number[][] }) {
  const rows: JSX.Element[] = []
  for (let i = 0; i <= 6; i++) {
    const cells: JSX.Element[] = []
    for (let j = 0; j <= 6; j++) {
      const prob = matrix[i]?.[j] ?? 0
      const cls = i === j ? 'draw' : i > j ? 'home' : 'away'
      cells.push(<td key={j} className={cls}>{prob > 0 ? (prob * 100).toFixed(1) + '%' : '-'}</td>)
    }
    rows.push(<tr key={i}>{cells}</tr>)
  }
  return (
    <div className="card" style={{ marginTop: 16, overflowX: 'auto' }}>
      <p className="kicker">比分機率矩陣</p>
      <table>
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: 7 }, (_, i) => <th key={i} className="num">{i}</th>)}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>行 = 主隊進球 · 列 = 客隊進球</p>
    </div>
  )
}

export default function MatchPage() {
  const { id } = useParams<{ id: string }>()
  const { predictions, matches, loading } = useEpl()

  if (loading) {
    return (
      <Layout active="epl">
        <div className="disclaimer" style={{ textAlign: 'center', padding: '64px 0' }}>載入中…</div>
      </Layout>
    )
  }
  if (!id) {
    return (
      <Layout active="epl">
        <p>請選擇一場比賽</p>
        <Link to="/" className="back">← 返回預測</Link>
      </Layout>
    )
  }

  const pred = predictions.find(p => p.matchId === id)
  const match = matches.find(m => m.id === id)
  if (!pred || !match) {
    return (
      <Layout active="epl">
        <p>找不到該場比賽的預測</p>
        <Link to="/" className="back">← 返回預測</Link>
      </Layout>
    )
  }

  const homeName = TEAMS.find(t => t.id === pred.home)?.short ?? pred.home
  const awayName = TEAMS.find(t => t.id === pred.away)?.short ?? pred.away

  return (
    <Layout active="epl">
      <Link to="/" className="back">← 返回第 {match.round} 輪列表</Link>

      {/* Hero */}
      <section className="hero" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card">
          <p className="kicker">MW{match.round} · {match.date}</p>
          <h2>
            {homeName} vs {awayName}
          </h2>
          <p className="lead">
            主場優勢 × 攻守強度 · 泊松推論
          </p>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="stat">
              <b style={{ color: 'var(--home)' }}>{pred.lambdaHome.toFixed(2)}</b>
              <span>{homeName} λ</span>
            </div>
            <div className="stat">
              <b>{pct(pred.confidence)}</b>
              <span>信心度</span>
            </div>
            <div className="stat">
              <b style={{ color: 'var(--gold)' }}>{pred.suggestedStake ? fmtStake(pred.suggestedStake) : '觀望'}</b>
              <span>建議倉位</span>
            </div>
          </div>
        </div>
      </section>

      {/* Probabilities */}
      <div className="grid">
        <div>
          <div className="section-title">
            <h3>1X2 機率</h3>
          </div>
          <div className="bars">
            <div className="bar-row">
              <span>主勝</span>
              <div className="track">
                <i className="h" style={{ width: `${pred.probHomeWin * 100}%` }} />
              </div>
              <span style={{ color: 'var(--home)', fontWeight: 600 }}>{pct(pred.probHomeWin)}</span>
            </div>
            <div className="bar-row">
              <span>和局</span>
              <div className="track">
                <i className="d" style={{ width: `${pred.probDraw * 100}%` }} />
              </div>
              <span style={{ color: 'var(--draw)', fontWeight: 600 }}>{pct(pred.probDraw)}</span>
            </div>
            <div className="bar-row">
              <span>客勝</span>
              <div className="track">
                <i className="a" style={{ width: `${pred.probAwayWin * 100}%` }} />
              </div>
              <span style={{ color: 'var(--away)', fontWeight: 600 }}>{pct(pred.probAwayWin)}</span>
            </div>
          </div>

          <div className="section-title" style={{ marginTop: 20 }}>
            <h3>其他市場</h3>
          </div>
          <div className="odds-grid">
            <div>
              <em>大 2.5 球</em>
              <b style={{ color: pred.probOver25 > 0.5 ? 'var(--home)' : 'var(--text)' }}>{pct(pred.probOver25)}</b>
            </div>
            <div>
              <em>小 2.5 球</em>
              <b>{pct(pred.probUnder25)}</b>
            </div>
            <div>
              <em>兩隊都進球</em>
              <b style={{ color: pred.probBTTS > 0.5 ? 'var(--home)' : 'var(--text)' }}>{pct(pred.probBTTS)}</b>
            </div>
            <div>
              <em>信心度</em>
              <b style={{ color: pred.confidence > 0.6 ? 'var(--gold)' : 'var(--text)' }}>{pct(pred.confidence)}</b>
            </div>
          </div>
        </div>

        <div>
          <div className="section-title">
            <h3>預測摘要</h3>
          </div>
          <div className="card">
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>
              {pred.narrative}
            </p>
            {pred.suggestedStake && (
              <div style={{ marginTop: 12 }}>
                <span className={`stake ${fmtStake(pred.suggestedStake)}`}>
                  建議倉位：{fmtStake(pred.suggestedStake)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ScoreMatrix matrix={pred.matrix} />
    </Layout>
  )
}
