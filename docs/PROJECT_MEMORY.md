# 足球预测站项目记忆

## 部署信息
- GitHub Pages: https://underwood-blip.github.io/football-analysis-site/
- 仓库: underwood-blip/football-analysis-site
- 部署方式: 手动 build → 推送 dist/assets/ 到仓库根目录的 assets/ 文件夹

## 技术栈
- Vite 5 + React 18 + TypeScript
- react-router-dom 6 (HashRouter)
- 泊松分布模型预测英超比赛

## 已修复问题

### 1. 轮次显示修复 (2026-09-27)
- fixture ID 格式：`mw{round}-{home}-{away}`（如 `mw13-ars-eve`）
- 原 bug：`split('-')[1]` 提取队名而非轮次
- 修复：`split('-')[0].replace('mw', '')` 提取轮次
- 主推场次：`mw19-liv-mci`（LIV vs MCI 在第19轮，不在第6轮）

### 2. 高信心徽章显示修复 (2026-09-27)
- 原 bug：`confBadge()` 返回 HTML 字符串，React 当文字渲染
- 修复：改为返回 JSX 元素 `<span className="conf-badge conf-高">高信心</span>`

### 3. 积分榜错误修复 (2026-09-27)
- 原 bug：`buildTable(allMatches)` 把历史赛季全部算入
- 修复：`buildTable(matches)` 只用当前赛季数据
- strength fitting 仍用 allMatches（多赛季训练更准）

### 4. 简体中文修复
- 所有页面统一为简体中文字符
- HTML lang 属性：`zh-CN`

### 5. TypeScript 编译修复
- Layout 改为 named export `import { Layout }`
- meta state 补充 historySeasons/historyMatches/played 字段

## 数据生成逻辑
- 使用 circle method 生成 38 轮 × 10 场 = 380 场完整 fixture
- 当前赛季 2627：120 场已赛（约12轮）
- 历史赛季：95% 已完成
- 球队：20 队（2026-27 赛季真实阵容）

## 注意事项
- GitHub Pages CDN 有缓存延迟，推送后需等待约1-2分钟
- 强制刷新：Ctrl+Shift+R
- 不要安装 puppeteer/playwright 到 node_modules（会搞乱 git 状态）
- dist 构建后需复制到仓库根目录的 assets/ 和 index.html
