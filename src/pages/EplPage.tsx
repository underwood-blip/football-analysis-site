import { useEpl } from "../data/EplData";
import { TEAMS } from "../data/teams";

function ProbBar({ home, draw, away }: { home: number; draw: number; away: number }) {
  return (
    <div className="prob-bar">
      <span className="prob-home" style={{ flex: home }} />
      <span className="prob-draw" style={{ flex: draw }} />
      <span className="prob-away" style={{ flex: away }} />
    </div>
  );
}

function formatPct(v: number) {
  return `${Math.round(v * 100)}%`;
}

export default function EplPage() {
  const { predictions, table, matches, loading, historyLoading } = useEpl();

  // Group predictions by round
  const byRound: Record<number, typeof predictions> = {};
  predictions.forEach((p) => {
    const m = matches.find((m) => m.id === p.matchId);
    const r = m?.round ?? 0;
    if (!byRound[r]) byRound[r] = [];
    byRound[r].push(p);
  });
  const rounds = Object.keys(byRound)
    .map(Number)
    .sort((a, b) => a - b);
  const activeRound = rounds[0] ?? 0;
  const activeMatches = byRound[activeRound] ?? [];

  // Last played round
  const playedMatches = matches.filter((m) => m.season === "2627" && m.played);
  const playedRounds: Record<number, typeof playedMatches> = {};
  playedMatches.forEach((m) => {
    const r = m.round ?? 0;
    if (!playedRounds[r]) playedRounds[r] = [];
    playedRounds[r].push(m);
  });
  const lastRound = Math.max(...Object.keys(playedRounds).map(Number), 0);
  const lastRoundMatches = playedRounds[lastRound] ?? [];

  if (loading) return <div className="loading-state">正在載入數據，请稍候…</div>;

  return (
    <div>
      <h2 className="section-title">
        賽事預測
        <span className="badge">第 {activeRound} 輪</span>
      </h2>

      {/* Predictions */}
      <div className="pred-list">
        {activeMatches.length === 0 ? (
          <div className="empty-state">暫無第 {activeRound} 輪預測數據</div>
        ) : (
          activeMatches.map((p) => {
            const hName = TEAMS[p.home]?.short ?? p.home;
            const aName = TEAMS[p.away]?.short ?? p.away;
            const isFocus = p.matchId === "mw6-liv-mci";
            const stakeClass =
              p.suggestedStake === "high"
                ? "stake-high"
                : p.suggestedStake === "medium"
                ? "stake-medium"
                : p.suggestedStake === "low"
                ? "stake-low"
                : "";
            return (
              <div key={p.matchId} className={`pred-row${isFocus ? " focus" : ""}`}>
                <div className="pred-home">
                  <div className="team-name">{hName}</div>
                  <div className="pred-meta">
                    <ProbBar home={p.probHomeWin} draw={p.probDraw} away={p.probAwayWin} />
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      {formatPct(p.probHomeWin)} / {formatPct(p.probDraw)} / {formatPct(p.probAwayWin)}
                    </span>
                  </div>
                </div>
                <div className="pred-vs">
                  <div>λ {p.lambdaHome.toFixed(1)}:{p.lambdaAway.toFixed(1)}</div>
                  {p.suggestedStake && (
                    <span className={`stake-badge ${stakeClass}`}>{p.suggestedStake}</span>
                  )}
                  <div className="confidence-text">信心 {Math.round(p.confidence * 100)}%</div>
                </div>
                <div className="pred-away">
                  <div className="team-name">{aName}</div>
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 4 }}>
                    O2.5 {formatPct(p.probOver25)} · BTTS {formatPct(p.probBTTS)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {historyLoading && (
        <p style={{ fontSize: "0.78rem", color: "#475569", marginTop: 12 }}>
          歷史數據載入中，擬合結果將隨之更新…
        </p>
      )}

      {/* Last round results */}
      {lastRound > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 className="section-title" style={{ fontSize: "1.05rem" }}>
            上輪賽果 <span className="badge">第 {lastRound} 輪</span>
          </h3>
          <div className="card" style={{ padding: "12px 16px" }}>
            {lastRoundMatches
              .sort((a, b) => a.date.localeCompare(b.date) || (a.kickoff ?? "").localeCompare(b.kickoff ?? ""))
              .map((m) => {
                const hName = TEAMS[m.home]?.short ?? m.home;
                const aName = TEAMS[m.away]?.short ?? m.away;
                const homeWin = (m.homeGoals ?? 0) > (m.awayGoals ?? 0);
                const awayWin = (m.homeGoals ?? 0) < (m.awayGoals ?? 0);
                return (
                  <div key={m.id} className="result-row">
                    <div className={`result-home${homeWin ? " winner" : ""}`}>{hName}</div>
                    <div className="result-score">
                      {m.homeGoals ?? "-"} : {m.awayGoals ?? "-"}
                    </div>
                    <div className={`result-away${awayWin ? " winner" : ""}`}>{aName}</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* League average note */}
      <p style={{ fontSize: "0.78rem", color: "#475569", marginTop: 16 }}>
        聯賽均值：{table.avgGoals.toFixed(2)} 球/場（主 {table.avgHomeGoals.toFixed(2)} / 客 {table.avgAwayGoals.toFixed(2)}）
        · 基於 {matches.filter((m) => m.played).length} 場已賽數據
      </p>
    </div>
  );
}
