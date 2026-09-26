import { Link } from 'react-router-dom'
import { useEpl } from '../data/EplData'
import { TEAMS } from '../data/teams'

function formatProb(p: number) { return `${Math.round(p * 100)}%` }
function formatStake(s: string) {
  if (s === 'high') return '高'
  if (s === 'medium') return '中'
  if (s === 'low') return '低'
  return ''
}

export default function EplPage() {
  const { predictions, table, matches, loading, historyLoading } = useEpl()
  if (loading) return <div className="loading-state">正在載入數據，请稍候…</div>
  const lastRoundMatches = matches.filter(m => m.season === '2627' && m.played)
  const lastRound = Math.max(...lastRoundMatches.map(m => m.round), 0)
  const lastRoundData = lastRound > 0 ? lastRoundMatches.filter(m => m.round === lastRound) : []
  return (
    <div>
      <h2 className="section-title">賽事預測 <span className="badge">第 {predictions[0]?.matchId.split('-')[1] ?? '6'} 輪</span></h2>
      <div className="pred-list">
        {predictions.length === 0 ? <div className="empty-state">暫無預測數據</div> :
          predictions.map(p => {
            const homeTeam = TEAMS.find(t => t.id === p.home)?.short ?? p.home
            const awayTeam = TEAMS.find(t => t.id === p.away)?.short ?? p.away
            return (
              <Link key={p.matchId} to={`/match/${p.matchId}`} className={`pred-row ${p.matchId === 'mw6-liv-mci' ? 'focus' : ''}`}>
                <div className="pred-home">
                  <div className="team-name">{homeTeam}</div>
                  <div className="pred-meta">
                    <div className="prob-bar">
                      <div className="prob-home" style={{ flex: p.probHomeWin }} />
                      <div className="prob-draw" style={{ flex: p.probDraw }} />
                      <div className="prob-away" style={{ flex: p.probAwayWin }} />
                    </div>
                    <span className="probs">{formatProb(p.probHomeWin)} / {formatProb(p.probDraw)} / {formatProb(p.probAwayWin)}</span>
                  </div>
                </div>
                <div className="pred-vs">
                  <div>λ {p.lambdaHome.toFixed(1)}:{p.lambdaAway.toFixed(1)}</div>
                  {p.suggestedStake && <span className={`stake-badge stake-${p.suggestedStake}`}>{formatStake(p.suggestedStake)}</span>}
                  <div className="confidence-text">信心 {Math.round(p.confidence * 100)}%</div>
                </div>
                <div className="pred-away">
                  <div className="team-name">{awayTeam}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>O2.5 {formatProb(p.probOver25)} · BTTS {formatProb(p.probBTTS)}</div>
                </div>
              </Link>
            )
          })
        }
      </div>
      {historyLoading && <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: 16 }}>歷史數據載入中…</p>}
      {lastRound > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 className="section-title" style={{ fontSize: '1.05rem' }}>上輪賽果 <span className="badge">第 {lastRound} 輪</span></h3>
          <div className="card" style={{ padding: '12px 16px' }}>
            {lastRoundData.map(m => {
              const home = TEAMS.find(t => t.id === m.home)?.short ?? m.home
              const away = TEAMS.find(t => t.id === m.away)?.short ?? m.away
              const homeWin = (m.homeGoals ?? 0) > (m.awayGoals ?? 0)
              const awayWin = (m.homeGoals ?? 0) < (m.awayGoals ?? 0)
              return (
                <div key={m.id} className="result-row">
                  <div className={`result-home ${homeWin ? 'winner' : ''}`}>{home}</div>
                  <div className="result-score">{m.homeGoals ?? '-'} : {m.awayGoals ?? '-'}</div>
                  <div className={`result-away ${awayWin ? 'winner' : ''}`}>{away}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: 16 }}>
        聯賽均值：{table.avgGoals.toFixed(2)} 球/場（主 {table.avgHomeGoals.toFixed(2)} / 客 {table.avgAwayGoals.toFixed(2)}）
        · 基於 {matches.filter(m => m.played).length} 場已賽數據
      </p>
    </div>
  )
}
