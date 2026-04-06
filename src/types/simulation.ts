export type EventCategory = 'positive' | 'negative' | 'neutral'

export interface LifeEvent {
  id: string
  label: string
  category: EventCategory
}

export interface AgeSnapshot {
  age: number
  wealth: number
  happiness: number
  healthScore: number
  careerLevel: number
  relationshipScore: number
}

export interface FinalOutcome {
  peakWealth: number
  finalWealth: number
  avgHappiness: number
  avgHealth: number
  peakCareerLevel: number
  lifeExpectancy: number
  successScore: number
}

export interface SimRun {
  runId: number
  trajectory: AgeSnapshot[]
  finalOutcome: FinalOutcome
  majorEvents: LifeEvent[]
}

export interface HistogramBin {
  bin: number
  count: number
  pct: number
}

export interface OutcomeDistribution {
  p5: number
  p10: number
  p25: number
  median: number
  p75: number
  p90: number
  p95: number
  mean: number
  stddev: number
  histogram: HistogramBin[]
}

export interface TrajectorySample {
  ages: number[]
  paths: {
    values: number[]
    decile: number // 0-9
  }[]
  medianPath: number[]
}

export interface SimulationResults {
  totalRuns: number
  wealth: OutcomeDistribution
  happiness: OutcomeDistribution
  health: OutcomeDistribution
  success: OutcomeDistribution
  eventFrequencies: Record<string, number>
  wealthTrajectories: TrajectorySample
  happinessTrajectories: TrajectorySample
  healthTrajectories: TrajectorySample
  millionaires: number
  peakHappiness: number
  medianLifeExpectancy: number
}

export type SimulationStatus = 'idle' | 'running' | 'complete' | 'error'

export type OutcomeMetric = 'wealth' | 'happiness' | 'health' | 'success'
export type ResultsTab = 'distribution' | 'lifePaths' | 'events'
