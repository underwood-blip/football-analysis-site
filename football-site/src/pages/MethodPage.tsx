import { Layout } from '../ui/Layout'

export default function MethodPage() {
  return (
    <Layout active="method">
      <div className="view-header">
        <h2>方法論與 <em>來源說明</em></h2>
      </div>
      <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card method">
          <div className="section-t">系統架構</div>
          <ul>
            <li><strong>資料管線</strong>：football-data.co.uk CSV → 解析 → 本季 / 歷史賽季分組 → 強度擬合</li>
            <li><strong>強度擬合</strong>：對每支球隊計算攻守指數，並以虛構場次 PRIOR_GAMES=6 向聯賽均值收縮</li>
            <li><strong>泊松推論</strong>：期望進球 λ = 聯賽均值 × 主客攻防 × 主場優勢 × 近況調整</li>
            <li><strong>市場 EV</strong>：有市場賠率時計算期望值；無賠率時以展示賠率 1/p × 1.06 補充</li>
          </ul>
        </div>
        <div className="card method">
          <div className="section-t">核心常數</div>
          <table>
            <thead>
              <tr><th>常數</th><th className="num">值</th><th>說明</th></tr>
            </thead>
            <tbody>
              <tr><td><code>MAX_GOALS</code></td><td className="num">8</td><td>比分矩陣最大進球數</td></tr>
              <tr><td><code>HOME_ADVANTAGE</code></td><td className="num">1.12</td><td>固定主場優勢係數</td></tr>
              <tr><td><code>DRAW_INFLATION</code></td><td className="num">1.08</td><td>平局膨脹修正</td></tr>
              <tr><td><code>PRIOR_GAMES</code></td><td className="num">6</td><td>收縮強度的虛構場次先驗</td></tr>
              <tr><td><code>CONFIDENCE_CAP</code></td><td className="num">0.78</td><td>信心度上限</td></tr>
              <tr><td>展示賠率 margin</td><td className="num">1.06</td><td>無市場賠率時的邊際加價</td></tr>
            </tbody>
          </table>
        </div>
        <div className="card method">
          <div className="section-t">資料來源</div>
          <ul>
            <li><strong>football-data.co.uk</strong>：提供 2017-2026 賽季英超完整賽果數據</li>
            <li>賽季代碼格式：YYZZ（如 2627 表示 2026-27 賽季）</li>
            <li>本地快照存儲於 public/data/ 目錄，離線可用</li>
          </ul>
        </div>
        <div className="card method">
          <div className="section-t">免責聲明</div>
          <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
            本站僅供數據研究與教學參考，不構成任何投注建議。足球比賽結果具有不確定性，請理性看待分析結果。
          </p>
        </div>
      </div>
    </Layout>
  )
}
