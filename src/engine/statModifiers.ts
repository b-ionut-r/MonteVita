import type { PersonStats } from '@/types'

// Normalize a stat (1–100) to a modifier around 0
// stat=50 → 0, stat=100 → +1, stat=1 → -1
function norm(stat: number): number {
  return (stat - 50) / 50
}

export interface StatModifiers {
  incomeGrowthBonus: number      // multiplier added to per-tick income growth
  promotionChanceBonus: number   // added to base promotion probability
  negativeEventReduction: number // 0-1, fraction by which negative events are reduced
  wealthVariance: number         // multiplier on random wealth noise
  happinessBaseline: number      // flat addition to per-tick happiness
  burnoutRisk: number            // added to burnout event probability
  networkBonus: number           // multiplier on social/career opportunity events
  medicalRiskReduction: number   // fraction by which medical events are reduced
  luckBonus: number              // flat luck modifier (0–2 range)
  lifeExpectancyBonus: number    // added years to base life expectancy
  recoveryBonus: number          // multiplier on positive event happiness impact
}

export function computeStatModifiers(stats: PersonStats): StatModifiers {
  const { iq, eq, resilience, luck, ambition, social, health } = stats

  // Income growth: IQ is the primary driver (research: IQ correlates strongly with earnings)
  // At IQ 90: +70% income boost; at IQ 10: -70% income cut → ~5.6x ratio
  // Ambition adds career drive, but secondary to IQ
  const incomeGrowthBonus = norm(iq) * 0.7 + norm(ambition) * 0.25

  // Promotion: IQ, ambition, and social capital all contribute
  const promotionChanceBonus = norm(iq) * 0.025 + norm(ambition) * 0.02 + norm(social) * 0.01

  // Negative event reduction: resilience + luck are the shield
  const negativeEventReduction = Math.max(0, Math.min(0.55,
    norm(resilience) * 0.25 + norm(luck) * 0.12
  ))

  // Wealth variance: luck adds noise to outcomes
  const wealthVariance = 1 + norm(luck) * 0.25

  // Happiness baseline: EQ is primary (emotional regulation → life satisfaction)
  // Social connection is the #2 predictor of happiness (Harvard Study of Adult Development)
  // Health also matters (chronic illness → reduced wellbeing)
  const happinessBaseline = norm(eq) * 0.62 + norm(social) * 0.25 + norm(health) * 0.12

  // Burnout risk: high ambition + low EQ = classic burnout profile
  // Resilience is the buffer
  const burnoutRisk = Math.max(0,
    norm(ambition) * 0.018 - norm(eq) * 0.008 - norm(resilience) * 0.008
  )

  // Network bonus: social capital unlocks career opportunities & positive life events
  // EQ/Social predict career advancement and opportunity access, NOT direct wealth
  // (Meta-analysis: Côté & Miners 2006 — EQ predicts task performance only when IQ is low)
  // Kept intentionally small so EQ doesn't inflate wealth — happiness is EQ's primary outcome
  const networkBonus = 1 + norm(social) * 0.09 + norm(eq) * 0.04

  // Medical risk reduction: high health directly reduces probability of health events
  const medicalRiskReduction = Math.max(0, Math.min(0.65,
    norm(health) * 0.38 + norm(resilience) * 0.12
  ))

  // Luck bonus: pure windfall factor — can't be skill-optimized
  const luckBonus = luck / 50 // 0–2 range

  // Life expectancy: health is primary, happiness matters (psychosomatic effects)
  // Research: each SD of health predicts ~5 years; happiness adds ~4 years
  const lifeExpectancyBonus = norm(health) * 7 + norm(avgOf(eq, social)) * 3.5 + norm(resilience) * 1.5

  // Recovery bonus: resilience + EQ → faster emotional recovery from setbacks
  const recoveryBonus = 1 + norm(resilience) * 0.45 + norm(eq) * 0.25

  return {
    incomeGrowthBonus,
    promotionChanceBonus,
    negativeEventReduction,
    wealthVariance,
    happinessBaseline,
    burnoutRisk,
    networkBonus,
    medicalRiskReduction,
    luckBonus,
    lifeExpectancyBonus,
    recoveryBonus,
  }
}

function avgOf(...vals: number[]): number {
  return vals.reduce((a, b) => a + b, 0) / vals.length
}
