import { useParams, Link } from "react-router-dom";
import { useEpl } from "../data/EplData";
import { TEAMS } from "../data/teams";
import { venueOf } from "../data/venues";

const MATRIX_SIZE = 6; // show 0–5 goals per side

function ScoreMatrix({ matrix }: { matrix: number[][] }) {
  const maxVal = Math.max(...matrix.flat(), 0.001);
  const rows = [];
  for (let h = 0; h <= MATRIX_SIZE; h++) {
    const cells = [];
    for (let a = 0; a <= MATRIX_SIZE; a++) {
      const v = matrix[h]?.[a] ?? 0;
      const bg = v > 0 ? `rgba(16,185,129,${Math.min(v / maxVal, 0.8).toFixed(2)})` : "#1e293b";
      const cls =
        h === a ? "cell-draw" : h > a ? "cell-home" : "cell-away";
      cells.push(
        <td key={a} className={cls} style={{ background: v > 0 ? bg : undefined }}>
          {v > 0 ? (v * 100).toFixed(1) + "%" : "-"}
        </td>
      );
    }
    rows.push(
      <tr key={h}>
        <th>{h}</th>
        {...cells}
      </tr>
    );
  }
  const colHeaders = [
    <th key="lbl" />,
    ...Array.from({ length: MATRIX_SIZE + 1 }, (_, i) => <th key={i}>{i}</th>),
  ];
  return (
    <div className="matrix-container">
      <table className="score-matrix">
        <thead>
          <tr>{colHeaders}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      <p style={{ fontSize: "0.72rem", color: "#475569", marginTop: 8, textAlign: "center" }}>
        行 = 主隊進球 · 列 = 客隊進球 · 黃色 = 平局格（含 DRAW_INFLATION）
      </p>
    </div>
  );
}

export default function MatchPage() {
  const { id } = useParams<{ id: string }>();
  const { predictions, matches, loading } = useEpl();

  if (loading) return <div className="loading-state">載入中…</div>;
  if (!id) return <div className="empty-state">請選擇一場比賽</div>;

  const pred = predictions.find((p) => p.matchId === id);
  const match = matches.find((m) => m.id === id);
  if (!pred || !match) return <div className="empty-state">找不到該場比賽的預測</div>;

  const hName = TEAMS[pred.home]?.short ?? pred.home;
  const aName = TEAMS[pred.away]?.short ?? pred.away;
  const venue = venueOf(pred.home);
  const dateStr = match.date ?? "";
  const timeStr = match.kickoff ? match.kickoff.slice(11, 16) : "";

  const evItems = [
    { label: "主勝 EV", value: pred.evHome, pct: pred.probHomeWin },
    { label: "和局 EV", value: pred.evDraw, pct: pred.probDraw },
    { label: "客勝 EV", value: pred.evAway, pct: pred.probAwayWin },
  ];

  return (
    <div>
      <Link to="/epl" style={{ fontSize: "0.82rem", color: "#64748b" }}>
        ← 返回預測列表
      </Link>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="match-detail-header">
          <div className="team-block">
            <div className="name">{hName}</div>
            <div className="venue">{venue ?? ""}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="vs-label">VS</div>
            <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: 4 }}>
              {dateStr} {timeStr}
            </div>
          </div>
          <div className="team-block">
            <div className="name">{aName}</div>
            <div className="venue">客場</div>
          </div>
        </div>

        <div className="lambda-row">
          <div className="lambda-item">
            <div className="lambda-value">{pred.lambdaHome.toFixed(2)}</div>
            <div className="lambda-label">{hName} 期望進球 λ</div>
          </div>
          <div className="lambda-item">
            <div className="lambda-value">{pred.lambdaAway.toFixed(2)}</div>
            <div className="lambda-label">{aName} 期望進球 λ</div>
          </div>
        </div>

        <div className="prob-grid">
          {evItems.map((item) => (
            <div key={item.label} className="prob-card">
              <div className="label">{item.label}</div>
              <div className="value" style={{ color: item.pct > 0.35 ? "#10b981" : item.pct > 0.25 ? "#f59e0b" : "#64748b" }}>
                {Math.round(item.pct * 100)}%
              </div>
              <div className={`ev ${item.value !== undefined ? (item.value > 0 ? "ev-positive" : "ev-negative") : ""}`}>
                {item.value !== undefined ? (item.value > 0 ? `+EV ${(item.value * 100).toFixed(1)}%` : `EV ${(item.value * 100).toFixed(1)}%`) : "無賠率"}
              </div>
            </div>
          ))}
        </div>

        <div className="prob-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { label: "大 2.5 球", val: pred.probOver25 },
            { label: "小 2.5 球", val: pred.probUnder25 },
            { label: "兩隊都進球", val: pred.probBTTS },
            { label: "信心度", val: pred.confidence },
          ].map((item) => (
            <div key={item.label} className="prob-card">
              <div className="label">{item.label}</div>
              <div className="value">{Math.round(item.val * 100)}%</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center" }}>
          {pred.suggestedStake && (
            <span className={`stake-badge stake-${pred.suggestedStake}`}>
              建議倉位：{pred.suggestedStake === "high" ? "高" : pred.suggestedStake === "medium" ? "中" : "低"}
            </span>
          )}
        </div>

        <ScoreMatrix matrix={pred.matrix} />
      </div>

      <div className="narrative-box">{pred.narrative}</div>
    </div>
  );
}
