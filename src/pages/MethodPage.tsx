export default function MethodPage() {
  return (
    <div>
      <h2 className="section-title">方法論與來源說明</h2>

      <div className="card method-section">
        <h3>系統架構</h3>
        <p>
          本站以足球賽果 CSV 為資料來源，經多賽季強度擬合後，套用泊松分佈推論未來賽事的比分機率。
          核心流程：
        </p>
        <ul style={{ marginTop: 8 }}>
          <li><strong>資料管線</strong>： football-data.co.uk CSV → 解析 → 本季 / 歷史賽季分組 → 強度擬合</li>
          <li><strong>強度擬合</strong>： 對每支球隊計算攻守指數，並以虛構場次 PRIOR_GAMES=6 向聯賽均值收縮</li>
          <li><strong>泊松推論</strong>： 期望進球 λ = 聯賽均值 × 主客攻防 × 主場優勢 × 近況調整</li>
          <li><strong>市場 EV</strong>： 有市場賠率時計算期望值；無賠率時以展示賠率 1/p × 1.06 補充</li>
        </ul>
      </div>

      <div className="card method-section">
        <h3>核心常數</h3>
        <table className="const-table">
          <thead>
            <tr>
              <th>常數</th>
              <th>值</th>
              <th>說明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>MAX_GOALS</code></td>
              <td>8</td>
              <td>比分矩陣最大進球數</td>
            </tr>
            <tr>
              <td><code>HOME_ADVANTAGE</code></td>
              <td>1.12</td>
              <td>固定主場優勢係數</td>
            </tr>
            <tr>
              <td><code>DRAW_INFLATION</code></td>
              <td>1.08</td>
              <td>平局膨脹修正（足球低進球易出和局）</td>
            </tr>
            <tr>
              <td><code>PRIOR_GAMES</code></td>
              <td>6</td>
              <td>收縮強度的虛構場次先驗</td>
            </tr>
            <tr>
              <td><code>CONFIDENCE_CAP</code></td>
              <td>0.78</td>
              <td>信心度上限，避免小樣本過度自信</td>
            </tr>
            <tr>
              <td>展示賠率 juice</td>
              <td>1.06</td>
              <td>無市場賠率時的邊際加價</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card method-section">
        <h3>資料來源</h3>
        <ul>
          <li>
            <strong>football-data.co.uk</strong> — 主力來源，提供英超賽果、xG、多家莊家賠率與亞盤。
            URL 格式 &#123;SEASON&#125;/E0.csv ，賽季代碼 YYZZ（如 2627 = 2026/27）。
            載入順序：<code>Vite 代理 → 直連線上 → 本地快照 → 內建回退</code>。
          </li>
          <li>
            <strong>球探網 titan007</strong> — 實測遭 WAF 攔截（HTTP 442），無法自動化，仅作人工核對。
          </li>
          <li>
            <strong>香港馬會足智彩</strong> — 前端動態載入，無公開 API，仅作人工核對。
          </li>
        </ul>
      </div>

      <div className="card method-section">
        <h3>擴展到新聯賽</h3>
        <p>
          要新增德甲（<code>D1</code>）、西甲（<code>SP1</code>）等聯賽，參考下方步驟：
        </p>
        <ol style={{ paddingLeft: 20, marginTop: 8 }}>
          <li>更換 DIV 代碼，下載對應賽季 CSV 至 <code>public/data/history/</code></li>
          <li>重寫 <code>teams.ts</code> 的 TEAMS / NAME_TO_ID（含歷史合成 ID）</li>
          <li>更新 <code>HISTORY_SEASONS</code> 與 <code>SEASON_WEIGHTS</code></li>
          <li>按聯賽進球環境調整 <code>HOME_ADVANTAGE</code>、<code>DRAW_INFLATION</code></li>
          <li>執行 <code>npm run build</code> 並部署預覽驗證</li>
        </ol>
      </div>

      <div className="card method-section">
        <h3>已知限制</h3>
        <ul>
          <li>升班馬缺乏頂級聯賽歷史，強度主要靠收縮，誤差較大</li>
          <li>主場優勢固定 1.12，未按賽季或球隊動態調整</li>
          <li>未納入傷停、紅牌、天氣、賽程密度等場外因素</li>
          <li>賠率為開盤／收盤快照，非即時走地賠率</li>
          <li>兩回合淘汰賽與中立場賽制尚未支援</li>
        </ul>
      </div>
    </div>
  );
}
