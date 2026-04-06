export const NUM_RUNS = 10000
export const PROGRESS_INTERVAL = 500 // post progress every N runs

export interface LifeStageDefinition {
  name: string
  startAge: number
  endAge: number
  ticks: number
}

export const LIFE_STAGES: LifeStageDefinition[] = [
  { name: 'Early Career', startAge: 22, endAge: 30, ticks: 16 },
  { name: 'Establishment', startAge: 30, endAge: 40, ticks: 20 },
  { name: 'Peak Years', startAge: 40, endAge: 55, ticks: 30 },
  { name: 'Pre-Retirement', startAge: 55, endAge: 65, ticks: 20 },
  { name: 'Retirement', startAge: 65, endAge: 80, ticks: 30 },
  { name: 'Late Life', startAge: 80, endAge: 90, ticks: 20 },
]

export const SNAPSHOT_AGES = [25, 35, 45, 55, 65, 75]
export const TRAJECTORY_SAMPLE_COUNT = 100
export const HISTOGRAM_BINS = 40
