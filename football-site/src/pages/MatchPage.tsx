import { useParams, Link } from 'react-router-dom'
import { useEpl } from '../data/EplData'
import { TEAMS, VENUES } from '../data/teams'

function ScoreMatrix({ matrix }: { matrix: number[][] }) {
  const rows = []
  for (let i = 0; i <= 6; i++) {
    const cells = []
    for (let j = 0; j <= 6; j++) {
      const prob = matrix[i]?.[j] ?? 0
      const cls = i === j ? 'cell-draw' : i > j ? 'cell-home' : 'cell-away'
      cells.push(<td key={j} className={cls}>{prob > 0 ? (prob * 100).toFixed(1) + '%' : '-'}</td>)
    }
    rows.push(<tr key={i}>{cells}</tr>)
  }
  return (
    <div className="matrix-container">
      <table className="score-matrix">
        <thead><tr><th></th>{Array.from({ length: 7 }, (_, i) => <th key={i}>{i}</th>)}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
      <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 8, textAlign: 'center' }}>行 = 主隊進球 · 列 = 客隊進球</p>
    </div>
  )
}

export default function MatchPage() {
  const { id } = useParams<{ id: string }>()
  const { predictions, matches, loading } = useEpl()
  if (loading) return <div className="loading-state">載入中…</div>
  if (!id) return <div className="empty-state">請選擇一場比賽</div>
  const pred = predictions.find(p => p.matchId === id)
  const match = matches.find(m => m.id === id)
  if (!pred || !match) return <div className="empty-state">找不到該場比賽的預測</div>
  const homeName = TEAMS.find(t => t.id === pred.home)?.short ?? pred.home
  const awayName = TEAMS.find(t => t.id === pred.away)?.short ?? pred.away
  const venue = VENUES[pred.home] ?? ''
  return (
    <div>
      <Link to="/" style={{ fontSize: '0.82rem', color: '#64748b' }}>← 返回預測列表</Link>
      <div className="card" style={{ marginTop: 16 }}>
        <div className="match-detail-header">
          <div className="team-block"><div className="name">{homeName}</div><div className="venue">{venue}</div></div>
          <div style={{ textAlign: 'center' }}><div className="vs-label">VS</div><div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>{match.date}</div></div>
          <div className="team-block"><div className="name">{awayName}</div><div className="venue">客場</div></div>
        </div>
        <div className="lambda-row">
          <div className="lambda-item"><div className="lambda-value">{pred.lambdaHome.toFixed(2)}</div><div className="lambda-label">{homeName} λ</div></div>
          <div className="lambda-item"><div className="lambda-value">{pred.lambdaAway.toFixed(2)}</div><div className="lambda-label">{awayName} λ</div></div>
        </div>
        <div className="prob-grid">
          {[{ label: '主勝', val: pred.probHomeWin, ev: pred.evHome }, { label: '和局', val: pred.probDraw, ev: pred.evDraw }, { label: '客勝', val: pred.probAwayWin, ev: pred.evAway }].map(item => (
            <div key={item.label} className="prob-card">
              <div className="label">{item.label}</div>
              <div className="value" style={{ color: item.val > 0.35 ? '#10b981' : item.val > 0.25 ? '#f59e0b' : '#64748b' }}>{Math.round(item.val * 100)}%</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.ev != null ? (item.ev > 0 ? '+' : '') + (item.ev * 100).toFixed(1) + '% EV' : '無賠率'}</div>
            </div>
          ))}
        </div>
        <div className="prob-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[{ label: '大 2.5 球', val: pred.probOver25 }, { label: '小 2.5 球', val: pred.probUnder25 }, { label: '兩隊都進球', val: pred.probBTTS }, { label: '信心度', val: pred.confidence }].map(item => (
            <div key={item.label} className="prob-card">
              <div className="label">{item.label}</div>
              <div className="value">{Math.round(item.val * 100)}%</div>
            </div>
          ))}
        </div>
        {pred.suggestedStake && (
          <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' }}>
            <span className={`stake-badge stake-${pred.suggestedStake}`}>建議倉位：{pred.suggestedStake === 'high' ? '高' : pred.suggestedStake === 'medium' ? '中' : '低'}</span>
          </div>
        )}
        <ScoreMatrix matrix={pred.matrix} />
      </div>
      <div className="narrative-box">{pred.narrative}</div>
    </div>
  )
}
