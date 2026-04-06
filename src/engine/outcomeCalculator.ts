import * as d3Array from 'd3-array'
import type { SimRun, SimulationResults, OutcomeDistribution, TrajectorySample, HistogramBin } from '@/types'
import { HISTOGRAM_BINS, TRAJECTORY_SAMPLE_COUNT, SNAPSHOT_AGES } from '@/constants/simulation'

function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

function stddev(values: number[], avg: number): number {
  const variance = values.reduce((a, b) => a + (b - avg) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

function buildDistribution(values: number[]): OutcomeDistribution {
  const sorted = [...values].sort((a, b) => a - b)
  const avg = mean(values)

  // Histogram: cap domain at p97 to avoid extreme outliers stretching the x-axis
  // (right-skewed distributions like wealth look terrible with equal-width bins otherwise)
  const p97 = percentile(sorted, 97)
  const binner = d3Array.bin()
    .domain([sorted[0], p97])
    .thresholds(HISTOGRAM_BINS)
  const bins = binner(values.filter(v => v <= p97 * 1.1))
  const histogram: HistogramBin[] = bins.map(b => ({
    bin: ((b.x0 ?? 0) + (b.x1 ?? 0)) / 2,
    count: b.length,
    pct: (b.length / values.length) * 100,
  }))

  return {
    p5: percentile(sorted, 5),
    p10: percentile(sorted, 10),
    p25: percentile(sorted, 25),
    median: percentile(sorted, 50),
    p75: percentile(sorted, 75),
    p90: percentile(sorted, 90),
    p95: percentile(sorted, 95),
    mean: avg,
    stddev: stddev(values, avg),
    histogram,
  }
}

function buildTrajectorySample(
  runs: SimRun[],
  metric: 'wealth' | 'happiness' | 'healthScore',
): TrajectorySample {
  // Sort runs by final outcome of this metric to stratify by decile
  const sorted = [...runs].sort((a, b) => {
    const aVal = a.finalOutcome.finalWealth
    const bVal = b.finalOutcome.finalWealth
    if (metric === 'happiness') {
      return a.finalOutcome.avgHappiness - b.finalOutcome.avgHappiness
    }
    if (metric === 'healthScore') {
      return a.finalOutcome.avgHealth - b.finalOutcome.avgHealth
    }
    return aVal - bVal
  })

  const total = sorted.length
  const sampleIndices: number[] = []

  // Stratified sample: pick evenly from each decile
  const perDecile = Math.floor(TRAJECTORY_SAMPLE_COUNT / 10)
  for (let d = 0; d < 10; d++) {
    const start = Math.floor((d / 10) * total)
    const end = Math.floor(((d + 1) / 10) * total)
    const step = Math.max(1, Math.floor((end - start) / perDecile))
    for (let i = start; i < end && sampleIndices.length < TRAJECTORY_SAMPLE_COUNT; i += step) {
      sampleIndices.push(i)
    }
  }

  const paths = sampleIndices.map(idx => {
    const run = sorted[idx]
    const decile = Math.floor((idx / total) * 10)
    return {
      values: run.trajectory.map(snap => {
        if (metric === 'wealth') return snap.wealth
        if (metric === 'happiness') return snap.happiness
        return snap.healthScore
      }),
      decile: Math.min(9, decile),
    }
  })

  // Compute median path
  const medianPath = SNAPSHOT_AGES.map((_, ageIdx) => {
    const vals = runs.map(r => {
      if (metric === 'wealth') return r.trajectory[ageIdx]?.wealth ?? 0
      if (metric === 'happiness') return r.trajectory[ageIdx]?.happiness ?? 0
      return r.trajectory[ageIdx]?.healthScore ?? 0
    }).sort((a, b) => a - b)
    return vals[Math.floor(vals.length / 2)]
  })

  return {
    ages: SNAPSHOT_AGES,
    paths,
    medianPath,
  }
}

export function aggregateResults(runs: SimRun[]): SimulationResults {
  const finalWealths = runs.map(r => r.finalOutcome.finalWealth)
  const avgHappinesses = runs.map(r => r.finalOutcome.avgHappiness)
  const avgHealths = runs.map(r => r.finalOutcome.avgHealth)
  const successScores = runs.map(r => r.finalOutcome.successScore)

  // Compute success using wealth percentile rank
  const sortedWealth = [...finalWealths].sort((a, b) => a - b)
  const successScoresFinal = runs.map(r => {
    const wealthPct = sortedWealth.indexOf(r.finalOutcome.finalWealth) / runs.length
    return (
      0.30 * wealthPct +
      0.30 * (r.finalOutcome.avgHappiness / 100) +
      0.20 * (r.finalOutcome.avgHealth / 100) +
      0.20 * (r.finalOutcome.peakCareerLevel / 10)
    ) * 100
  })
  // Update success scores
  runs.forEach((r, i) => {
    r.finalOutcome.successScore = successScoresFinal[i]
  })

  // Event frequencies
  const eventFrequencies: Record<string, number> = {}
  for (const run of runs) {
    for (const ev of run.majorEvents) {
      eventFrequencies[ev.id] = (eventFrequencies[ev.id] ?? 0) + 1
    }
  }

  const millionaires = finalWealths.filter(w => w >= 1_000_000).length
  const peakHappiness = runs.filter(r => r.finalOutcome.avgHappiness >= 80).length
  const medianLE = percentile([...runs.map(r => r.finalOutcome.lifeExpectancy)].sort((a,b)=>a-b), 50)

  return {
    totalRuns: runs.length,
    wealth: buildDistribution(finalWealths),
    happiness: buildDistribution(avgHappinesses),
    health: buildDistribution(avgHealths),
    success: buildDistribution(successScoresFinal),
    eventFrequencies,
    wealthTrajectories: buildTrajectorySample(runs, 'wealth'),
    happinessTrajectories: buildTrajectorySample(runs, 'happiness'),
    healthTrajectories: buildTrajectorySample(runs, 'healthScore'),
    millionaires,
    peakHappiness,
    medianLifeExpectancy: medianLE,
  }
}
