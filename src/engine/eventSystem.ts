import { EVENT_CATALOG, type EventDefinition } from '@/constants/events'
import type { CareerPath } from '@/types'
import type { RNG } from './rng'
import type { StatModifiers } from './statModifiers'

export interface AppliedEvent {
  id: string
  label: string
  category: 'positive' | 'negative' | 'neutral'
  wealthDelta: number
  happinessDelta: number
  healthDelta: number
  careerLevelDelta: number
  relationshipDelta: number
  wealthMultiplier: number
}

function lerp(rng: RNG, range: [number, number]): number {
  return rng.range(range[0], range[1])
}

export function rollEvents(
  rng: RNG,
  stageIndex: number,
  career: CareerPath,
  mods: StatModifiers,
  currentWealth: number,
): AppliedEvent[] {
  const results: AppliedEvent[] = []

  for (const def of EVENT_CATALOG) {
    // Stage filter
    if (!def.stages.includes(stageIndex)) continue

    // Career filter
    if (def.careers && !def.careers.includes(career)) continue

    // Compute adjusted probability
    let prob = def.baseRate

    // Positive events boosted by luck and network
    if (def.category === 'positive') {
      prob *= mods.luckBonus * mods.networkBonus
    }

    // Negative events reduced by resilience and luck
    if (def.category === 'negative') {
      prob *= (1 - mods.negativeEventReduction)
    }

    // Burnout-specific events use burnout risk modifier
    if (def.id === 'burnout') {
      prob += mods.burnoutRisk
    }

    // Medical events use medical risk reduction
    if (def.id === 'medical_emergency' || def.id === 'chronic_illness') {
      prob *= (1 - mods.medicalRiskReduction)
    }

    // Startup exit only if wealth is somewhat established
    if (def.id === 'startup_exit' && currentWealth < 10000) {
      prob *= 0.3
    }

    // Clamp probability
    prob = Math.max(0, Math.min(0.25, prob))

    if (!rng.chance(prob)) continue

    const wealthMultiplier = def.wealthMultiplier ? lerp(rng, def.wealthMultiplier) : 1
    const wealthDelta = def.wealthDelta ? lerp(rng, def.wealthDelta) : 0
    const happinessDelta = def.happinessDelta ? lerp(rng, def.happinessDelta) : 0
    const healthDelta = def.healthDelta ? lerp(rng, def.healthDelta) : 0
    const careerLevelDelta = def.careerLevelDelta
      ? Math.round(lerp(rng, def.careerLevelDelta))
      : 0
    const relationshipDelta = def.relationshipDelta ? lerp(rng, def.relationshipDelta) : 0

    results.push({
      id: def.id,
      label: def.label,
      category: def.category,
      wealthDelta,
      happinessDelta,
      healthDelta,
      careerLevelDelta,
      relationshipDelta,
      wealthMultiplier,
    })
  }

  return results
}

export function getEventDefinition(id: string): EventDefinition | undefined {
  return EVENT_CATALOG.find(e => e.id === id)
}
