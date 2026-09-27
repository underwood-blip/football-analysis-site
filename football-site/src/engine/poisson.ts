import { Prediction } from '../data/types'

export function poissonPMF(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0
  let result = Math.exp(-lambda)
  for (let i = 1; i <= k; i++) {
    result *= lambda / i
  }
  return result
}

export function predictMatch(
  match: import('../data/types').Match,
  strengths: Record<string, import('../data/types').TeamStrength>,
  form: Record<string, import('../data/types').FormRecord>,
  avgHomeGoals: number,
  avgAwayGoals: number
): Prediction | null {
  const home = strengths[match.home]
  const away = strengths[match.away]
  if (!home || !away) return null

  const HOME_ADVANTAGE = 1.12
  const DRAW_INFLATION = 1.08
  const MAX_GOALS = 8
  const CONFIDENCE_CAP = 0.78

  const homeForm = form[match.home]?.score ?? 0.5
  const awayForm = form[match.away]?.score ?? 0.5

  let lambdaHome = avgHomeGoals * home.att * away.def * HOME_ADVANTAGE * (0.85 + homeForm * 0.35)
  let lambdaAway = avgAwayGoals * away.att * home.def * (0.85 + awayForm * 0.35)

  lambdaHome = Math.max(0.3, Math.min(4, lambdaHome))
  lambdaAway = Math.max(0.2, Math.min(3.5, lambdaAway))

  const matrix: number[][] = []
  let probHomeWin = 0, probDraw = 0, probAwayWin = 0
  let probOver25 = 0, probUnder25 = 0, probBTTS = 0

  for (let i = 0; i <= MAX_GOALS; i++) {
    matrix[i] = []
    for (let j = 0; j <= MAX_GOALS; j++) {
      let p = poissonPMF(lambdaHome, i) * poissonPMF(lambdaAway, j)
      if (i === j) p *= DRAW_INFLATION
      matrix[i][j] = p
      if (i > j) probHomeWin += p
      else if (i === j) probDraw += p
      else probAwayWin += p
      if (i + j > 2.5) probOver25 += p
      else probUnder25 += p
      if (i > 0 && j > 0) probBTTS += p
    }
  }

  const total = probHomeWin + probDraw + probAwayWin
  probHomeWin /= total
  probDraw /= total
  probAwayWin /= total

  const games = home.games + away.games
  const confidence = Math.min(CONFIDENCE_CAP, 0.5 + Math.min(games, 40) / 40 * 0.28)

  return {
    matchId: match.id,
    home: match.home,
    away: match.away,
    lambdaHome: Math.round(lambdaHome * 100) / 100,
    lambdaAway: Math.round(lambdaAway * 100) / 100,
    probHomeWin,
    probDraw,
    probAwayWin,
    probOver25,
    probUnder25,
    probBTTS,
    matrix,
    confidence,
    suggestedStake: '',
    narrative: `${match.home} vs ${match.away}`,
  }
}
