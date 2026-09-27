import { Link } from 'react-router-dom'
import { useEpl } from '../data/EplData'
import { TEAMS } from '../data/teams'
import { Layout, teamDot } from '../ui/Layout'

function pct(n: number) {
  return `${Math.round(n * 100)}%`
}

function fmtStake(stake: string) {
  if (stake === 'high') return '重倉'
  if (stake === 'medium') return '標準'
  if (stake === 'low') return '輕倉'
  return '觀望'
}

function confBadge(conf: number) {
  if (conf > 0.65) return '<span class="conf-badge conf-高">高信心</span>'
  if (conf > 0.45) return '<span class="conf-badge conf-中">中信心</span>'
  return '<span class="conf-badge conf-低">低信心</span>'
}

export default function EplPage({ active }: { active?: string }) {
  const { predictions, table, matches, loading, meta } = useEpl()

  if (loading) {
    return (
      <Layout active={active ?? 'epl'}>
        <div className="empty-note">正在載入數據…</div>
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
      {/* Hero stats */}
      <div className="hero">
        <div className="stat-card">
          <div className="stat-value">{table.rows[0]?.pts ?? 0}</div>
          <div className="stat-label">榜首積分</div>
        </div>
        <div className="stat-card">
          <div className="stat-value gold">{table.avgGoals.toFixed(2)}</div>
          <div className="stat-label">場均總進球</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{predictions.length}</div>
          <div className="stat-label">本輪場次</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{matches.filter(m => m.played).length}</div>
          <div className="stat-label">訓練樣本</div>
        </div>
      </div>

      {/* Featured match */}
      {featured && (
        <div className="view-header" style={{ marginTop: 0 }}>
          <h2>本輪主推 <em>{TEAMS.find(t => t.id === featured.home)?.short ?? featured.home} vs {TEAMS.find(t => t.id === featured.away)?.short ?? featured.away}</em></h2>
          <p className="view-desc">
            λ {featured.lambdaHome.toFixed(2)} : {featured.lambdaAway.toFixed(2)} · 信心 {pct(featured.confidence)} · {fmtStake(featured.suggestedStake ?? 'low')}
          </p>
        </div>
      )}

      {/* Predictions grid */}
      <div className="view-header">
        <h2>第 <em>{nextGw}</em> 轮比赛预测</h2>
      </div>
      <div className="cards-grid">
        {predictions.length === 0 ? (
          <div className="empty-note">暫無預測數據</div>
        ) : (
          predictions.map(pred => {
            const homeName = TEAMS.find(t => t.id === pred.home)?.short ?? pred.home
            const awayName = TEAMS.find(t => t.id === pred.away)?.short ?? pred.away
            const homeColor = getTeamColor(pred.home)
            const awayColor = getTeamColor(pred.away)
            const maxProb = Math.max(pred.probHomeWin, pred.probDraw, pred.probAwayWin)
            const rec = maxProb === pred.probHomeWin ? 'home' : maxProb === pred.probAwayWin ? 'away' : 'draw'

            return (
              <Link to={`/match/${pred.matchId}`} key={pred.matchId} className="match-card">
                <span className={`rec-tag rec-${rec}`}>
                  {rec === 'home' ? '主勝' : rec === 'away' ? '客勝' : '平局'}
                </span>
                <div className="mc-top">
                  <span className="mc-round">第 {pred.matchId.split('-')[1]} 輪</span>
                  {confBadge(pred.confidence)}
                </div>
                <div className="mc-teams">
                  <div className="mc-team">
                    <div className="dot" style={{ background: `linear-gradient(135deg,${homeColor},${homeColor}cc)`, width: 38, height: 38, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#04121f' }}>
                      {homeName.slice(-2)}
                    </div>
                    <div className="name">{homeName}</div>
                  </div>
                  <div className="mc-vs">VS</div>
                  <div className="mc-team">
                    <div className="dot" style={{ background: `linear-gradient(135deg,${awayColor},${awayColor}cc)`, width: 38, height: 38, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#04121f' }}>
                      {awayName.slice(-2)}
                    </div>
                    <div className="name">{awayName}</div>
                  </div>
                </div>
                <div className="prob-bar">
                  <div className="prob-seg home" style={{ width: `${pred.probHomeWin * 100}%` }}>
                    {pred.probHomeWin >= 0.12 ? Math.round(pred.probHomeWin * 100) + '%' : ''}
                  </div>
                  <div className="prob-seg draw" style={{ width: `${pred.probDraw * 100}%` }}>
                    {pred.probDraw >= 0.12 ? Math.round(pred.probDraw * 100) + '%' : ''}
                  </div>
                  <div className="prob-seg away" style={{ width: `${pred.probAwayWin * 100}%` }}>
                    {pred.probAwayWin >= 0.12 ? Math.round(pred.probAwayWin * 100) + '%' : ''}
                  </div>
                </div>
                <div className="prob-legend">
                  <span><b>主勝</b> {pct(pred.probHomeWin)}</span>
                  <span><b>平</b> {pct(pred.probDraw)}</span>
                  <span><b>客勝</b> {pct(pred.probAwayWin)}</span>
                </div>
                <div className="mc-meta">
                  <span className="chip hl">最可能 {(pred.lambdaHome + pred.lambdaAway).toFixed(1)} 球</span>
                  <span className="chip">大2.5 {pct(pred.probOver25)}</span>
                  <span className="chip">BTTS {pct(pred.probBTTS)}</span>
                  {pred.suggestedStake && (
                    <span className={`stake ${fmtStake(pred.suggestedStake)}`}>{fmtStake(pred.suggestedStake)}</span>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Last round results */}
      {maxRound > 0 && (
        <>
          <div className="section-t" style={{ marginTop: 32 }}>上輪賽果 · 第 {maxRound} 輪</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>主隊</th>
                  <th className="num">比分</th>
                  <th>客隊</th>
                </tr>
              </thead>
              <tbody>
                {lastGw.map(m => {
                  const homeName = TEAMS.find(t => t.id === m.home)?.short ?? m.home
                  const awayName = TEAMS.find(t => t.id === m.away)?.short ?? m.away
                  const homeGoals = m.homeGoals ?? 0
                  const awayGoals = m.awayGoals ?? 0
                  return (
                    <tr key={m.id}>
                      <td><strong className={homeGoals > awayGoals ? 'pos' : ''}>{homeName}</strong></td>
                      <td className="num" style={{ fontWeight: 700, color: 'var(--gold)' }}>{homeGoals} : {awayGoals}</td>
                      <td><strong className={awayGoals > homeGoals ? 'pos' : ''}>{awayName}</strong></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  )
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
