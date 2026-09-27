import { Link } from 'react-router-dom'
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

export default function EplPage({ active }: { active?: string }) {
  const { predictions, table, matches, loading, historyLoading, meta } = useEpl()

  if (loading) {
    return (
      <Layout active={active ?? 'epl'}>
        <div className="disclaimer" style={{ textAlign: 'center', padding: '64px 0' }}>正在載入數據…</div>
      </Layout>
    )
  }

  const currentSeason = '2627'
  const playedMatches = matches.filter(m => m.season === currentSeason && m.played)
  const maxRound = Math.max(...playedMatches.map(m => m.round), 0)
  const lastGw = matches.filter(m => m.round === maxRound && m.played)
  const nextGw = predictions[0]?.matchId?.split('-')[1] ?? '6'
  const featured = predictions.find(p => p.matchId === 'mw6-liv-mci') ?? predictions[0]

  return (
    <Layout active={active ?? 'epl'}>
      {/* Hero section */}
      <section className="hero">
        <div className="card">
          <p className="kicker">EPL 2026/27 · MW {nextGw}</p>
          <h2>大模型買球分析：第 {nextGw} 輪</h2>
          <p className="lead">
            模型吃 {meta.historySeasons + 1} 個賽季、{meta.historyMatches + meta.played} 場賽果做訓練，
            用加權攻擊/防守強度收斂到本季，再以泊松分布推 1X2、大小球。
          </p>
          <div className="stats">
            <div className="stat">
              <b>{table.rows[0]?.pts ?? 0}</b>
              <span>榜首積分</span>
            </div>
            <div className="stat">
              <b>{table.avgGoals.toFixed(2)}</b>
              <span>場均總進球</span>
            </div>
            <div className="stat">
              <b>{predictions.length}</b>
              <span>本輪場次</span>
            </div>
            <div className="stat">
              <b>{matches.filter(m => m.played).length}</b>
              <span>訓練樣本</span>
            </div>
          </div>
        </div>

        {/* Featured match */}
        {featured && (
          <div className="card">
            <p className="kicker">本輪主推</p>
            <h3 style={{ margin: '0 0 6px' }}>
              {TEAMS.find(t => t.id === featured.home)?.short ?? featured.home} vs{' '}
              {TEAMS.find(t => t.id === featured.away)?.short ?? featured.away}
            </h3>
            <p className="lead" style={{ marginBottom: 10 }}>
              λ {featured.lambdaHome.toFixed(2)} : {featured.lambdaAway.toFixed(2)}
            </p>
            <div className="bars">
              <div className="bar-row">
                <span>1X2</span>
                <div className="track">
                  <i className="h" style={{ width: `${featured.probHomeWin * 100}%` }} />
                  <i className="d" style={{ width: `${featured.probDraw * 100}%` }} />
                  <i className="a" style={{ width: `${featured.probAwayWin * 100}%` }} />
                </div>
                <span>{pct(featured.probHomeWin)} / {pct(featured.probDraw)} / {pct(featured.probAwayWin)}</span>
              </div>
            </div>
            <div className="meta" style={{ marginTop: 12 }}>
              <span>信心 <b>{pct(featured.confidence)}</b></span>
              {featured.suggestedStake && (
                <span className={`stake ${fmtStake(featured.suggestedStake)}`}>{fmtStake(featured.suggestedStake)}</span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Main content grid */}
      <div className="grid">
        {/* Predictions list */}
        <div>
          <div className="section-title">
            <h3>本輪賽事預測</h3>
            <span>{predictions.length} 場</span>
          </div>
          <div className="card" style={{ padding: 0 }}>
            {predictions.length === 0 ? (
              <div className="disclaimer" style={{ padding: '32px 0', textAlign: 'center' }}>暫無預測數據</div>
            ) : (
              predictions.map(pred => {
                const homeName = TEAMS.find(t => t.id === pred.home)?.short ?? pred.home
                const awayName = TEAMS.find(t => t.id === pred.away)?.short ?? pred.away
                return (
                  <Link
                    key={pred.matchId}
                    to={`/match/${pred.matchId}`}
                    className={`match ${pred.matchId === 'mw6-liv-mci' ? 'focus' : ''}`}
                  >
                    <div className="team">
                      <strong>{homeName}</strong>
                      <em>主場</em>
                    </div>
                    <div className="vs">
                      <b>λ {pred.lambdaHome.toFixed(1)}:{pred.lambdaAway.toFixed(1)}</b>
                    </div>
                    <div className="team right">
                      <strong>{awayName}</strong>
                      <em>客場</em>
                    </div>
                    <div className="tagwrap">
                      <span className={`tag ${pred.probHomeWin > pred.probAwayWin ? 'home' : 'away'}`}>
                        {pct(Math.max(pred.probHomeWin, pred.probAwayWin))}
                      </span>
                      {pred.suggestedStake && (
                        <span className={`stake ${fmtStake(pred.suggestedStake)}`}>
                          {fmtStake(pred.suggestedStake)}
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Last round results */}
        <div>
          {maxRound > 0 && (
            <>
              <div className="section-title">
                <h3>上輪賽果</h3>
                <span>第 {maxRound} 輪</span>
              </div>
              <div className="card" style={{ padding: 0 }}>
                {lastGw.map(m => {
                  const homeName = TEAMS.find(t => t.id === m.home)?.short ?? m.home
                  const awayName = TEAMS.find(t => t.id === m.away)?.short ?? m.away
                  const homeGoals = m.homeGoals ?? 0
                  const awayGoals = m.awayGoals ?? 0
                  return (
                    <div key={m.id} className="match">
                      <div className="team">
                        <strong className={homeGoals > awayGoals ? 'winner' : ''}>{homeName}</strong>
                      </div>
                      <div className="vs">
                        <b>{homeGoals} : {awayGoals}</b>
                      </div>
                      <div className="team right">
                        <strong className={awayGoals > homeGoals ? 'winner' : ''}>{awayName}</strong>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* League averages */}
          <div style={{ marginTop: 16 }}>
            <div className="section-title">
              <h3>聯賽統計</h3>
            </div>
            <div className="card">
              <div className="scores">
                <div className="scorechip">
                  <b>{table.avgGoals.toFixed(2)}</b>
                  <span>總進球/場</span>
                </div>
                <div className="scorechip">
                  <b>{table.avgHomeGoals.toFixed(2)}</b>
                  <span>主隊進球</span>
                </div>
                <div className="scorechip">
                  <b>{table.avgAwayGoals.toFixed(2)}</b>
                  <span>客隊進球</span>
                </div>
                <div className="scorechip">
                  <b>{matches.filter(m => m.played).length}</b>
                  <span>已賽場次</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
