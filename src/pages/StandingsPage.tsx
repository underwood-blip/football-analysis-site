import { useEpl } from "../data/EplData";

const STANDINGS_COLS = [
  { key: "rank", label: "#" },
  { key: "name", label: "球隊" },
  { key: "gp", label: "賽" },
  { key: "w", label: "勝" },
  { key: "d", label: "和" },
  { key: "l", label: "負" },
  { key: "gf", label: "進" },
  { key: "ga", label: "失" },
  { key: "gd", label: "差" },
  { key: "pts", label: "點" },
] as const;

export default function StandingsPage() {
  const { table, loading } = useEpl();

  if (loading) return <div className="loading-state">載入積分榜中…</div>;

  return (
    <div>
      <h2 className="section-title">英超積分榜 <span className="badge">{table.rows.length} 隊</span></h2>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="standings-table">
          <thead>
            <tr>
              {STANDINGS_COLS.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r) => {
              const zone =
                r.rank <= 4
                  ? "champions"
                  : r.rank <= 6
                  ? "europa"
                  : r.rank >= 18
                  ? "relegation"
                  : "";
              return (
                <tr key={r.id} className={zone}>
                  <td className="rank-cell">{r.rank}</td>
                  <td className="team-cell">{r.name}</td>
                  <td>{r.gp}</td>
                  <td>{r.w}</td>
                  <td>{r.d}</td>
                  <td>{r.l}</td>
                  <td>{r.gf}</td>
                  <td>{r.ga}</td>
                  <td className={r.gd > 0 ? "gd-pos" : r.gd < 0 ? "gd-neg" : ""}>
                    {r.gd > 0 ? `+${r.gd}` : r.gd}
                  </td>
                  <td className="pts-cell">{r.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: "0.78rem", color: "#475569", marginTop: 12 }}>
        藍色區：歐聯資格 · 紫色區：歐協聯資格 · 紅色區：降級區 · 均值：{table.avgGoals.toFixed(2)} 球/場（主 {table.avgHomeGoals.toFixed(2)} / 客 {table.avgAwayGoals.toFixed(2)}）
      </p>
    </div>
  );
}
