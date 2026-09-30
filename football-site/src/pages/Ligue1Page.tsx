import { Link } from 'react-router-dom'
import { useLigue1 } from '../data/Ligue1Data'
import { LIGUE1_TEAMS } from '../data/ligue1Teams'
import { Layout } from '../ui/Layout'

function pct(n: number) {
  return `${Math.round(n * 100)}%`
}

function fmtStake(stake: string) {
  if (stake === 'high') return '重仓'
  if (stake === 'medium') return '标准'
  if (stake === 'low') return '轻仓'
  return '观望'
}

function confBadge(conf: number) {
  if (conf > 0.65) return <span className="conf-badge conf-高">高信心</span>
  if (conf > 0.45) return <span className="conf-badge conf-中">中信心</span>
  return <span className="conf-badge conf-低">低信心</span>
}

export default function Ligue1Page({ active }: { active?: string }) {
  const { predictions, table, matches, loading, meta } = useLigue1()

  if (loading) {
    return (
      <Layout active={active ?? 'ligue1'}>
        <div className="empty-note">正在加载数据…</div>
      </Layout>
    )
  }

  const currentSeason = '2627'
  const playedMatches = matches.filter(m => m.season === currentSeason && m.played)
  const maxRound = Math.max(...playedMatches.map(m => m.round), 0)
  const lastGw = matches.filter(m => m.round === maxRound && m.played)
  const featured = predictions[0]

  return (
    <Layout active={active ?? 'ligue1'}>
      {/* Hero stats */}
      <div className="hero">
        <div className="stat-card">
          <div className="stat-value">{table.rows[0]?.pts ?? 0}</div>
          <div className="stat-label">榜首积分</div>
        </div>
        <div className="stat-card">
          <div className="stat-value gold">{table.avgGoals.toFixed(2)}</div>
          <div className="stat-label">场均总进球</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{predictions.length}</div>
          <div className="stat-label">本轮场次</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{matches.filter(m => m.played).length}</div>
          <div className="stat-label">训练样本</div>
        </div>
      </div>

      {/* Featured match */}
      {featured && (
        <div className="view-header" style={{ marginTop: 0 }}>
          <h2>本轮主推 <em>{LIGUE1_TEAMS.find(t => t.id === featured.home)?.cn ?? featured.home} vs {LIGUE1_TEAMS.find(t => t.id === featured.away)?.cn ?? featured.away}</em></h2>
          <p className="view-desc">
            λ {featured.lambdaHome.toFixed(2)} : {featured.lambdaAway.toFixed(2)} · 信心 {pct(featured.confidence)} · {fmtStake(featured.suggestedStake ?? 'low')}
          </p>
        </div>
      )}

      {/* Predictions grid */}
      <div className="view-header">
        <h2>下一轮比赛预测</h2>
      </div>
      <div className="cards-grid">
        {predictions.length === 0 ? (
          <div className="empty-note">暂无预测数据</div>
        ) : (
          predictions.map(pred => {
            const homeName = LIGUE1_TEAMS.find(t => t.id === pred.home)?.cn ?? pred.home
            const awayName = LIGUE1_TEAMS.find(t => t.id === pred.away)?.cn ?? pred.away
            const homeAbbr = LIGUE1_TEAMS.find(t => t.id === pred.home)?.short ?? pred.home
            const awayAbbr = LIGUE1_TEAMS.find(t => t.id === pred.away)?.short ?? pred.away
            const homeColor = getTeamColor(pred.home)
            const awayColor = getTeamColor(pred.away)
            const maxProb = Math.max(pred.probHomeWin, pred.probDraw, pred.probAwayWin)
            const rec = maxProb === pred.probHomeWin ? 'home' : maxProb === pred.probAwayWin ? 'away' : 'draw'

            return (
              <Link to={`/match/${pred.matchId}`} key={pred.matchId} className="match-card">
                <span className={`rec-tag rec-${rec}`}>
                  {rec === 'home' ? '主胜' : rec === 'away' ? '客胜' : '平局'}
                </span>
                <div className="mc-top">
                  {confBadge(pred.confidence)}
                </div>
                <div className="mc-teams">
                  <div className="mc-team">
                    <div className="dot" style={{ background: `linear-gradient(135deg,${homeColor},${homeColor}cc)`, width: 38, height: 38, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#04121f' }}>
                      {homeAbbr.slice(-2)}
                    </div>
                    <div className="name">{homeName}</div>
                  </div>
                  <div className="mc-vs">VS</div>
                  <div className="mc-team">
                    <div className="dot" style={{ background: `linear-gradient(135deg,${awayColor},${awayColor}cc)`, width: 38, height: 38, borderRadius: '50%', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#04121f' }}>
                      {awayAbbr.slice(-2)}
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
                  <span><b>主胜</b> {pct(pred.probHomeWin)}</span>
                  <span><b>平</b> {pct(pred.probDraw)}</span>
                  <span><b>客胜</b> {pct(pred.probAwayWin)}</span>
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
    </Layout>
  )
}

function getTeamColor(id: string): string {
  const colors: Record<string, string> = {
    PSG: '#004170', MAR: '#0057B8', MON: '#E82536', OL: '#DA251D',
    LIL: '#E30613', NCE: '#F94D00', REN: '#F26522', LEN: '#DE2600',
    STR: '#00BFFF', TOU: '#1B4F9F', BRE: '#ED1C24', LOR: '#C8102E',
    HAV: '#0055A4', AUX: '#FF6600', PFC: '#0055A4', TRO: '#FF0000',
    MNS: '#00AEEF', ANG: '#E30613',
  }
  return colors[id] ?? '#22e58a'
}
