export default function MethodPage() {
  return (
    <div>
      <h2 className="section-title">方法論與來源說明</h2>

      <div className="card method-section">
        <h3>系統架構</h3>
        <p>本站以足球賽果 CSV 為資料來源，經多賽季強度擬合後，套用泊松分佈推論未來賽事的比分機率。</p>
        <ul style={{ marginTop: 8 }}>
          <li>
            <strong>資料管線</strong>：football-data.co.uk CSV → 解析 → 本季 / 歷史賽季分組 → 強度擬合
          </li>
          <li>
            <strong>強度擬合</strong>：對每支球隊計算攻守指數，並以虛構場次 PRIOR_GAMES=6 向聯賽均值收縮
          </li>
          <li>
            <strong>泊松推論</strong>：期望進球 λ = 聯賽均值 × 主客攻防 × 主場優勢 × 近況調整
          </li>
          <li>
            <strong>市場 EV</strong>：有市場賠率時計算期望值；無賠率時以展示賠率 1/p × 1.06 補充
          </li>
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
              <td>平局膨脹修正</td>
            </tr>
            <tr>
              <td><code>PRIOR_GAMES</code></td>
              <td>6</td>
              <td>收縮強度的虛構場次先驗</td>
            </tr>
            <tr>
              <td><code>CONFIDENCE_CAP</code></td>
              <td>0.78</td>
              <td>信心度上限</td>
            </tr>
            <tr>
              <td>展示賠率 margin</td>
              <td>1.06</td>
              <td>無市場賠率時的邊際加價</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card method-section">
        <h3>資料來源</h3>
        <ul>
          <li><strong>football-data.co.uk</strong>：提供 2017-2026 賽季英超完整賽果數據</li>
          <li>賽季代碼格式：YYZZ（如 2627 表示 2026-27 賽季）</li>
          <li>本地快照存儲於 public/data/ 目錄，離線可用</li>
        </ul>
      </div>

      <div className="card method-section">
        <h3>免責聲明</h3>
        <p>本站僅供數據研究與教學參考，不構成任何投注建議。足球比賽結果具有不確定性，請理性看待分析結果。</p>
      </div>
    </div>
  )
}
