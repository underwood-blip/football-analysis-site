import { useEpl } from '../data/EplData'

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

  if (loading) return <div className="loading-state">載入積分榜中…</div>

  return (
    <div>
      <h2 className="section-title">
        英超積分榜
        <span className="badge">{table.rows.length} 隊</span>
      </h2>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="standings-table">
          <thead>
            <tr>
              {COLUMNS.map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map(row => (
              <tr key={row.id}>
                <td className="rank-cell">{row.rank}</td>
                <td className="team-cell">{row.name}</td>
                <td>{row.gp}</td>
                <td>{row.w}</td>
                <td>{row.d}</td>
                <td>{row.l}</td>
                <td>{row.gf}</td>
                <td>{row.ga}</td>
                <td className={row.gd > 0 ? 'gd-pos' : row.gd < 0 ? 'gd-neg' : ''}>
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="pts-cell">{row.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: 12 }}>
        均值：{table.avgGoals.toFixed(2)} 球/場（主 {table.avgHomeGoals.toFixed(2)} / 客 {table.avgAwayGoals.toFixed(2)}）
      </p>
    </div>
  )
}
