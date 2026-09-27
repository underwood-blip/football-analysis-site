import { Link } from 'react-router-dom'
import { useEpl } from '../data/EplData'
import { TEAMS } from '../data/teams'

function formatPercent(p: number) {
  return `${Math.round(p * 100)}%`
}

function formatStake(stake: string) {
  if (stake === 'high') return '高'
  if (stake === 'medium') return '中'
  if (stake === 'low') return '低'
  return ''
}

export default function EplPage() {
  const { predictions, table, matches, loading, historyLoading } = useEpl()

  if (loading) {
    return <div className="loading-state">正在載入數據，请稍候…</div>
  }

  const currentSeason = '2627'
  const playedMatches = matches.filter(m => m.season === currentSeason && m.played)
  const maxRound = Math.max(...playedMatches.map(m => m.round), 0)
  const lastRoundMatches = maxRound > 0 ? playedMatches.filter(m => m.matchId?.includes(`-${maxRound}`)) : []

  return (
    <div>
      <h2 className="section-title">
        賽事預測
        <span className="badge">第 {predictions[0]?.matchId?.split('-')[1] ?? '6'} 輪</span>
      </h2>

      <div className="pred-list">
        {predictions.length === 0 ? (
          <div className="empty-state">暫無預測數據</div>
        ) : (
          predictions.map(pred => {
            const homeName = TEAMS.find(t => t.id === pred.home)?.short ?? pred.home
            const awayName = TEAMS.find(t => t.id === pred.away)?.short ?? pred.away
            return (
              <Link
                key={pred.matchId}
                to={`/match/${pred.matchId}`}
                className={`pred-row ${pred.matchId === 'mw6-liv-mci' ? 'focus' : ''}`}
              >
                <div className="pred-home">
                  <div className="team-name">{homeName}</div>
                  <div className="pred-meta">
                    <div className="prob-bar">
                      <div className="prob-home" style={{ flex: pred.probHomeWin }} />
                      <div className="prob-draw" style={{ flex: pred.probDraw }} />
                      <div className="prob-away" style={{ flex: pred.probAwayWin }} />
                    </div>
                    <span className="probs">
                      {formatPercent(pred.probHomeWin)} / {formatPercent(pred.probDraw)} / {formatPercent(pred.probAwayWin)}
                    </span>
                  </div>
                </div>
                <div className="pred-vs">
                  <div>λ {pred.lambdaHome.toFixed(1)}:{pred.lambdaAway.toFixed(1)}</div>
                  {pred.suggestedStake && (
                    <span className={`stake-badge stake-${pred.suggestedStake}`}>
                      {formatStake(pred.suggestedStake)}
                    </span>
                  )}
                  <div className="confidence-text">信心 {Math.round(pred.confidence * 100)}%</div>
                </div>
                <div className="pred-away">
                  <div className="team-name">{awayName}</div>
                  <div className="team-meta">
                    O2.5 {formatPercent(pred.probOver25)} · BTTS {formatPercent(pred.probBTTS)}
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {historyLoading && (
        <p className="loading-hint">歷史數據載入中…</p>
      )}

      {maxRound > 0 && (
        <div className="recent-section">
          <h3 className="section-title" style={{ fontSize: '1.05rem' }}>
            上輪賽果
            <span className="badge">第 {maxRound} 輪</span>
          </h3>
          <div className="card result-card">
            {playedMatches
              .filter(m => m.round === maxRound)
              .map(m => {
                const homeName = TEAMS.find(t => t.id === m.home)?.short ?? m.home
                const awayName = TEAMS.find(t => t.id === m.away)?.short ?? m.away
                const homeWins = (m.homeGoals ?? 0) > (m.awayGoals ?? 0)
                const awayWins = (m.homeGoals ?? 0) < (m.awayGoals ?? 0)
                return (
                  <div key={m.id} className="result-row">
                    <div className={`result-home ${homeWins ? 'winner' : ''}`}>{homeName}</div>
                    <div className="result-score">
                      {m.homeGoals ?? '-'} : {m.awayGoals ?? '-'}
                    </div>
                    <div className={`result-away ${awayWins ? 'winner' : ''}`}>{awayName}</div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      <p className="stats-footer">
        聯賽均值：{table.avgGoals.toFixed(2)} 球/場
        （主 {table.avgHomeGoals.toFixed(2)} / 客 {table.avgAwayGoals.toFixed(2)}）
        · 基於 {matches.filter(m => m.played).length} 場已賽數據
      </p>
    </div>
  )
}
