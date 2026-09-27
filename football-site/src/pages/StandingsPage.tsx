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
        <div className="disclaimer" style={{ textAlign: 'center', padding: '64px 0' }}>載入積分榜中…</div>
      </Layout>
    )
  }

  return (
    <Layout active="standings">
      <div className="section-title">
        <h3>英超積分榜</h3>
        <span>{table.rows.length} 隊</span>
      </div>
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              {COLUMNS.map(col => (
                <th key={col.key} className={col.key !== 'name' ? 'num' : ''}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map(row => (
              <tr key={row.id}>
                <td className="pos">{row.rank}</td>
                <td>
                  <strong>{row.name}</strong>
                </td>
                <td className="num">{row.gp}</td>
                <td className="num">{row.w}</td>
                <td className="num">{row.d}</td>
                <td className="num">{row.l}</td>
                <td className="num">{row.gf}</td>
                <td className="num">{row.ga}</td>
                <td className={`num ${row.gd > 0 ? 'home' : row.gd < 0 ? 'away' : ''}`}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="num" style={{ color: 'var(--gold)', fontWeight: 700 }}>{row.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
        均值：{table.avgGoals.toFixed(2)} 球/場（主 {table.avgHomeGoals.toFixed(2)} / 客 {table.avgAwayGoals.toFixed(2)}）
      </p>
    </Layout>
  )
}
