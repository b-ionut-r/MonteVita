import type { PersonStats, LifeDecisions } from '@/types'
import { runSimulation } from './index'
import { NUM_RUNS, PROGRESS_INTERVAL } from '@/constants/simulation'

interface WorkerInput {
  stats: PersonStats
  decisions: LifeDecisions
  numRuns?: number
}

self.addEventListener('message', (e: MessageEvent<WorkerInput>) => {
  const { stats, decisions, numRuns = NUM_RUNS } = e.data

  const results = runSimulation(stats, decisions, numRuns, (pct) => {
    self.postMessage({ type: 'progress', pct })
  })

  self.postMessage({ type: 'result', data: results })
})

export {}
