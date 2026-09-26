import { Match, TeamStrength, FormRecord, Prediction } from '../data/types'
import { HOME_ADVANTAGE, DRAW_INFLATION, MAX_GOALS, CONFIDENCE_CAP } from '../data/teams'

function poissonProb(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0
  let p = Math.exp(-lambda)
  for (let i = 1; i <= k; i++) p *= lambda / i
  return p
}

export function predictMatch(
  match: Match,
  strengths: Record<string, TeamStrength>,
  form: Record<string, FormRecord>,
  avgHomeGoals: number,
  avgAwayGoals: number
): Prediction | null {
  const homeStr = strengths[match.home]
  const awayStr = strengths[match.away]
  if (!homeStr || !awayStr) return null
  const homeForm = form[match.home]?.score ?? 0.5
  const awayForm = form[match.away]?.score ?? 0.5
  const formFactor = (f: number) => 0.85 + f * 0.35
  let lambdaHome = avgHomeGoals * homeStr.homeAtt * awayStr.awayDef * HOME_ADVANTAGE * formFactor(homeForm)
  let lambdaAway = avgAwayGoals * awayStr.awayAtt * homeStr.homeDef * formFactor(awayForm)
  lambdaHome = Math.max(0.3, Math.min(4.0, lambdaHome))
  lambdaAway = Math.max(0.2, Math.min(3.5, lambdaAway))
  const matrix: number[][] = []
  let probHome = 0, probDraw = 0, probAway = 0
  let probOver25 = 0, probUnder25 = 0, probBTTS = 0
  for (let i = 0; i <= MAX_GOALS; i++) {
    matrix[i] = []
    for (let j = 0; j <= MAX_GOALS; j++) {
      let p = poissonProb(lambdaHome, i) * poissonProb(lambdaAway, j)
      if (i === j) p *= DRAW_INFLATION
      matrix[i][j] = p
      if (i > j) probHome += p
      else if (i === j) probDraw += p
      else probAway += p
      if (i + j > 2.5) probOver25 += p
      else probUnder25 += p
      if (i > 0 && j > 0) probBTTS += p
    }
  }
  const total = probHome + probDraw + probAway
  probHome /= total; probDraw /= total; probAway /= total
  const gameCount = Math.min(homeStr.games + awayStr.games, 40)
  const baseConfidence = 0.5 + (gameCount / 40) * 0.28
  const oddsBonus = match.odds ? 0.3 : 0.1
  const confidence = Math.min(CONFIDENCE_CAP, Math.round((baseConfidence + oddsBonus) * 100) / 100)
  const margin = 1.06
  const evHome = match.odds ? probHome * match.odds.home * margin - 1 : undefined
  const evDraw = match.odds ? probDraw * match.odds.draw * margin - 1 : undefined
  const evAway = match.odds ? probAway * match.odds.away * margin - 1 : undefined
  const maxEV = Math.max(evHome ?? -Infinity, evDraw ?? -Infinity, evAway ?? -Infinity)
  let stake: 'high' | 'medium' | 'low' | '' = ''
  if (maxEV > 0.08 && confidence > 0.55) stake = 'high'
  else if (maxEV > 0.05 && confidence > 0.5) stake = 'medium'
  else if (maxEV > 0.02) stake = 'low'
  const homeName = match.home
  const awayName = match.away
  const pred = probHome > 0.45 ? `${homeName} 勝` : probAway > 0.45 ? `${awayName} 勝` : '傾向和局'
  const narrative = `${homeName} vs ${awayName}：模型預測 ${pred}（主勝 ${Math.round(probHome * 100)}% 和 ${Math.round(probDraw * 100)}% 客 ${Math.round(probAway * 100)}%），預期進球 ${lambdaHome.toFixed(2)}:${lambdaAway.toFixed(2)}。`
  return {
    matchId: match.id, home: match.home, away: match.away,
    lambdaHome, lambdaAway,
    probHomeWin: probHome, probDraw, probAwayWin: probAway,
    probOver25, probUnder25, probBTTS,
    matrix, odds: match.odds, evHome, evDraw, evAway,
    confidence, suggestedStake: stake, narrative,
  }
}
