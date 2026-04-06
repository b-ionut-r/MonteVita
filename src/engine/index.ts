import type { PersonStats, LifeDecisions, SimRun, SimulationResults, AgeSnapshot, FinalOutcome } from '@/types'
import { RNG } from './rng'
import { computeStatModifiers } from './statModifiers'
import { rollEvents } from './eventSystem'
import { aggregateResults } from './outcomeCalculator'
import {
  LIFE_STAGES,
  SNAPSHOT_AGES,
} from '@/constants/simulation'
import {
  CAREER_DEFINITIONS,
  EDUCATION_MULTIPLIERS,
  RISK_VARIANCE_MULTIPLIERS,
  LIFESTYLE_SAVINGS_RATES,
} from '@/constants/careers'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function getCareerDef(career: string) {
  return CAREER_DEFINITIONS.find(c => c.id === career)!
}

// Wealth scale factor: salaries in constants represent gross income.
// We convert to realistic net-savings capacity after tax + living expenses.
// 0.052 ≈ ~5% of gross ends up as investable surplus (conservative realistic estimate)
const WEALTH_SCALE = 0.052

function simulateOneLive(runId: number, stats: PersonStats, decisions: LifeDecisions): SimRun {
  const rng = new RNG(runId * 0x9e3779b9 + 0x6c62272e)
  const mods = computeStatModifiers(stats)

  const careerDef = getCareerDef(decisions.career)
  const educationMult = EDUCATION_MULTIPLIERS[decisions.education]
  const riskVariance = RISK_VARIANCE_MULTIPLIERS[decisions.riskTolerance]
  const savingsRate = LIFESTYLE_SAVINGS_RATES[decisions.lifestyle]

  // Starting values
  // Health starts high (young adult) and degrades naturally — stats.health shifts the curve
  const startingHealth = clamp(55 + stats.health * 0.35 + rng.gaussian(0, 4), 30, 100)
  let wealth = rng.gaussian(3000, 1500) * educationMult
  let happiness = clamp(45 + mods.happinessBaseline * 25 + rng.gaussian(0, 5), 10, 95)
  let healthScore = startingHealth
  let careerLevel = 1
  let relationshipScore = clamp(40 + stats.social * 0.3 + rng.gaussian(0, 8), 0, 100)

  const trajectory: AgeSnapshot[] = []
  const majorEvents: string[] = []
  const seenEvents = new Set<string>()

  let lifeExpectancy = 78 + mods.lifeExpectancyBonus + rng.gaussian(0, 3)
  lifeExpectancy = clamp(lifeExpectancy, 55, 100)

  // Run through life stages
  for (let stageIdx = 0; stageIdx < LIFE_STAGES.length; stageIdx++) {
    const stage = LIFE_STAGES[stageIdx]
    const { ticks } = stage
    const agePerTick = (stage.endAge - stage.startAge) / ticks

    for (let tick = 0; tick < ticks; tick++) {
      const currentAge = stage.startAge + tick * agePerTick

      // Stop if life ended
      if (currentAge >= lifeExpectancy) break

      // ── Passive income & wealth ────────────────────────────
      const incomeFraction = careerLevel / 10
      const rawIncome = careerDef.baseSalary + incomeFraction * (careerDef.peakSalary - careerDef.baseSalary)
      // IQ boosts effective income through smarter work & decisions
      const iqBoost = 1 + mods.incomeGrowthBonus
      const adjustedIncome = rawIncome * educationMult * iqBoost

      // Per-tick income (half year), converted to realistic net savings
      const tickIncome = (adjustedIncome / 2) * (1 + rng.gaussian(0, 0.04 * riskVariance))
      const saved = tickIncome * savingsRate * WEALTH_SCALE

      // Investment return: ~5.5% annual baseline (US equity historical real return ~7%, minus 1.5% inflation friction)
      // IQ predicts better financial decision-making (Grinblatt et al. 2011 — IQ and stock market participation)
      // High IQ → better asset allocation → modestly higher compounding returns
      const iqInvestMult = 1 + mods.incomeGrowthBonus * 0.1  // IQ 90 → +5.6% better return quality
      const annualReturn = rng.gaussian(0.055 * iqInvestMult, 0.06 * riskVariance)
      const investReturn = wealth > 0 ? wealth * (annualReturn / 2) : 0
      wealth += saved + investReturn
      wealth = Math.max(wealth, -50000) // debt capped

      // ── Health decay (natural aging) ────────────────────────
      // Young adults: very slow decay; retirement: moderate; late life: steeper
      const baseDecay = stageIdx < 2 ? 0.015 : stageIdx < 4 ? 0.05 : 0.10
      // High health stat slows decay
      const statBonus = (stats.health - 50) / 50 * 0.02 // +/- 0.02 per extreme stat
      healthScore -= rng.gaussian(Math.max(0.005, baseDecay - statBonus), 0.012)
      healthScore = clamp(healthScore, 0, 100)

      // ── Happiness per tick ─────────────────────────────────
      const healthBonus = healthScore > 75 ? 0.12 : healthScore < 35 ? -0.18 : 0
      // Wealth effect plateaus (diminishing returns above comfortable threshold)
      const wealthComfort = 200000
      const wealthBonus = wealth > wealthComfort * 5 ? 0.08
        : wealth > wealthComfort ? 0.04
        : wealth < 0 ? -0.18 : 0
      const relationshipBonus = (relationshipScore - 50) / 220
      happiness += rng.gaussian(
        mods.happinessBaseline * 0.28 + healthBonus + wealthBonus + relationshipBonus,
        0.7
      )
      happiness = clamp(happiness, 5, 98)

      // ── Career level progression ───────────────────────────
      const promotionP = 0.035 + mods.promotionChanceBonus + (careerLevel < 5 ? 0.02 : -0.01)
      if (careerLevel < 10 && rng.chance(promotionP)) {
        careerLevel = Math.min(10, careerLevel + 1)
      }

      // ── Relationship drift ─────────────────────────────────
      const relDrift = rng.gaussian(mods.happinessBaseline * 0.4, 1.4)
      relationshipScore = clamp(relationshipScore + relDrift, 0, 100)

      // ── Roll events ────────────────────────────────────────
      const events = rollEvents(rng, stageIdx, decisions.career, mods, wealth)
      for (const ev of events) {
        // Wealth events: scale dollar amounts by WEALTH_SCALE for consistency
        if (ev.wealthMultiplier !== 1) {
          // Multipliers cap at 50% loss to prevent single-event wipeouts
          const cappedMult = ev.wealthMultiplier < 1
            ? Math.max(ev.wealthMultiplier, 0.5)
            : ev.wealthMultiplier
          wealth *= cappedMult
        }
        wealth += ev.wealthDelta * WEALTH_SCALE
        wealth = Math.max(wealth, -50000)

        happiness = clamp(happiness + ev.happinessDelta * (ev.happinessDelta > 0 ? mods.recoveryBonus : 1), 5, 98)
        healthScore = clamp(healthScore + ev.healthDelta, 0, 100)
        careerLevel = clamp(careerLevel + ev.careerLevelDelta, 1, 10)
        relationshipScore = clamp(relationshipScore + ev.relationshipDelta, 0, 100)

        if (!seenEvents.has(ev.id)) {
          seenEvents.add(ev.id)
          majorEvents.push(ev.id)
        }
      }

      // ── Snapshot at designated ages ────────────────────────
      const snapshotAge = SNAPSHOT_AGES.find(a => Math.abs(currentAge - a) < agePerTick * 0.6)
      if (snapshotAge && !trajectory.find(t => t.age === snapshotAge)) {
        trajectory.push({ age: snapshotAge, wealth, happiness, healthScore, careerLevel, relationshipScore })
      }
    }
  }

  // Fill any missing snapshot ages
  const filledTrajectory: AgeSnapshot[] = SNAPSHOT_AGES.map(age => {
    const found = trajectory.find(t => t.age === age)
    if (found) return found
    const last = trajectory[trajectory.length - 1]
    return last
      ? { ...last, age, happiness: Math.max(5, last.happiness - 5) }
      : { age, wealth: 0, happiness: 30, healthScore: 20, careerLevel: 1, relationshipScore: 20 }
  })

  const avgHappiness = filledTrajectory.reduce((a, s) => a + s.happiness, 0) / filledTrajectory.length
  const avgHealth = filledTrajectory.reduce((a, s) => a + s.healthScore, 0) / filledTrajectory.length
  const peakWealth = Math.max(...filledTrajectory.map(s => s.wealth))
  const peakCareerLevel = Math.max(...filledTrajectory.map(s => s.careerLevel))

  const finalOutcome: FinalOutcome = {
    peakWealth,
    finalWealth: wealth,
    avgHappiness,
    avgHealth,
    peakCareerLevel,
    lifeExpectancy,
    successScore: 0,
  }

  return {
    runId,
    trajectory: filledTrajectory,
    finalOutcome,
    majorEvents: majorEvents.map(id => ({ id, label: id, category: 'neutral' as const })),
  }
}

export function runSimulation(
  stats: PersonStats,
  decisions: LifeDecisions,
  numRuns: number,
  onProgress?: (pct: number) => void,
): SimulationResults {
  const runs: SimRun[] = []
  for (let i = 0; i < numRuns; i++) {
    runs.push(simulateOneLive(i, stats, decisions))
    if (onProgress && i > 0 && i % 500 === 0) {
      onProgress(Math.round((i / numRuns) * 100))
    }
  }
  return aggregateResults(runs)
}
