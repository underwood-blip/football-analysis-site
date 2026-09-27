import { Layout } from '../ui/Layout'

export default function MethodPage() {
  return (
      <Layout active="method">
        <div className="view-header">
          <h2>方法论与 <em>来源说明</em></h2>
        </div>
        <div className="cards-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="card method">
            <div className="section-t">系统架构</div>
            <ul>
              <li><strong>数据管线</strong>：football-data.co.uk CSV → 解析 → 本季 / 历史赛季分组 → 强度拟合</li>
              <li><strong>强度拟合</strong>：对每支球队计算攻防指数，并以虚构场次 PRIOR_GAMES=6 向联赛均值收缩</li>
              <li><strong>泊松推论</strong>：期望进球 λ = 联赛均值 × 主客攻防 × 主场优势 × 近况调整</li>
              <li><strong>市场 EV</strong>：有市场赔率时计算期望值；无赔率时以展示赔率 1/p × 1.06 补充</li>
            </ul>
          </div>
          <div className="card method">
            <div className="section-t">核心常数</div>
            <table>
              <thead>
                <tr><th>常数</th><th className="num">值</th><th>说明</th></tr>
              </thead>
              <tbody>
                <tr><td><code>MAX_GOALS</code></td><td className="num">8</td><td>比分矩阵最大进球数</td></tr>
                <tr><td><code>HOME_ADVANTAGE</code></td><td className="num">1.12</td><td>固定主场优势系数</td></tr>
                <tr><td><code>DRAW_INFLATION</code></td><td className="num">1.08</td><td>平局膨胀修正</td></tr>
                <tr><td><code>PRIOR_GAMES</code></td><td className="num">6</td><td>收缩强度的虚构场次先验</td></tr>
                <tr><td><code>CONFIDENCE_CAP</code></td><td className="num">0.78</td><td>信心度上限</td></tr>
                <tr><td>展示赔率 margin</td><td className="num">1.06</td><td>无市场赔率时的边际加价</td></tr>
              </tbody>
            </table>
          </div>
          <div className="card method">
            <div className="section-t">数据来源</div>
            <ul>
              <li><strong>football-data.co.uk</strong>：提供 2017-2026 赛季英超完整赛果数据</li>
              <li>赛季代码格式：YYZZ（如 2627 表示 2026-27 赛季）</li>
              <li>本地快照存储于 public/data/ 目录，离线可用</li>
            </ul>
          </div>
          <div className="card method">
            <div className="section-t">免责声明</div>
            <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.8, margin: 0 }}>
              本站仅供数据研究与教学参考，不构成任何投注建议。足球比赛结果具有不确定性，请理性看待分析结果。
            </p>
          </div>
        </div>
      </Layout>
  )
}
