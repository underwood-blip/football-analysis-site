import { useEpl } from '../data/EplData'
import { TEAMS } from '../data/teams'
import { Layout } from '../ui/Layout'

const COLUMNS = [
  { key: 'rank', label: '#' },
  { key: 'name', label: '球隊' },
  { key: 'gp', label: '賽' },
  { key: 'w', label: '勝' },
  { key: 'd', label: '和' },
  { key: 'l', label: '負' },
  { key: 'gf', label: '進' },
  { key: 'ga', label: '失' },
  { key: 'gd', label: '差' },
  { key: 'pts', label: '點' },
]

export default function StandingsPage() {
  const { table, loading } = useEpl()

  if (loading) {
    return (
      <Layout active="standings">
        <div className="empty-note">載入積分榜中…</div>
      </Layout>
    )
  }

  return (
    <Layout active="standings">
      <div className="view-header">
        <h2>2026-2027 賽季 <em>積分榜</em></h2>
        <p className="view-desc">數據截至當前已完賽輪次</p>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {COLUMNS.map(col => (
                <th key={col.key} className={col.key !== 'name' ? 'num' : ''}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map(row => {
              let zone = ''
              if (row.rank <= 4) zone = 'zone-ucl'
              else if (row.rank === 5) zone = 'zone-uel'
              else if (row.rank === 6) zone = 'zone-ecl'
              else if (row.rank >= 18) zone = 'zone-rel'

              return (
                <tr key={row.id} className={zone}>
                  <td><span className="rank-cell">{row.rank}</span></td>
                  <td><strong>{row.name}</strong></td>
                  <td className="num">{row.gp}</td>
                  <td className="num">{row.w}</td>
                  <td className="num">{row.d}</td>
                  <td className="num">{row.l}</td>
                  <td className="num">{row.gf}</td>
                  <td className="num">{row.ga}</td>
                  <td className={`num ${row.gd > 0 ? 'pos' : row.gd < 0 ? 'neg' : ''}`}>
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  <td className="num" style={{ fontWeight: 800, color: 'var(--gold)' }}>{row.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="legend">
        <span><i className="lg-box lg-ucl" />欧冠区</span>
        <span><i className="lg-box lg-uel" />欧联区</span>
        <span><i className="lg-box lg-ecl" />欧协联</span>
        <span><i className="lg-box lg-rel" />降级区</span>
      </div>
    </Layout>
  )
}
