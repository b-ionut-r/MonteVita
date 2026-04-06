import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { PersonStats, LifeDecisions, SimulationResults, SimulationStatus, OutcomeMetric, ResultsTab } from '@/types'
import { DEFAULT_STATS } from '@/constants/stats'

export type InputMode = 'manual' | 'quiz'

const DEFAULT_DECISIONS: LifeDecisions = {
  career: 'tech',
  riskTolerance: 'medium',
  education: 'bachelors',
  lifestyle: 'balanced',
}

interface SimulatorState {
  // Person
  stats: PersonStats
  decisions: LifeDecisions

  // Simulation
  status: SimulationStatus
  progress: number
  results: SimulationResults | null
  previousResults: SimulationResults | null
  error: string | null

  // UI
  activeMetric: OutcomeMetric
  activeTab: ResultsTab
  hasSimulated: boolean
  compareVisible: boolean
  inputMode: InputMode
  quizOpen: boolean

  // Actions — Person
  setStat: (key: keyof PersonStats, value: number) => void
  setDecision: <K extends keyof LifeDecisions>(key: K, value: LifeDecisions[K]) => void
  applyPreset: (stats: PersonStats, decisions: LifeDecisions) => void
  resetToDefaults: () => void
  setInputMode: (mode: InputMode) => void
  openQuiz: () => void
  closeQuiz: () => void
  applyQuizStats: (stats: PersonStats) => void

  // Actions — Simulation
  setStatus: (status: SimulationStatus) => void
  setProgress: (pct: number) => void
  setResults: (results: SimulationResults) => void
  setError: (error: string) => void

  // Actions — UI
  setActiveMetric: (metric: OutcomeMetric) => void
  setActiveTab: (tab: ResultsTab) => void
  setCompareVisible: (v: boolean) => void
}

export const useSimulatorStore = create<SimulatorState>()(
  immer((set) => ({
    stats: { ...DEFAULT_STATS },
    decisions: { ...DEFAULT_DECISIONS },

    status: 'idle',
    progress: 0,
    results: null,
    previousResults: null,
    error: null,

    activeMetric: 'wealth',
    activeTab: 'distribution',
    hasSimulated: false,
    compareVisible: false,
    inputMode: 'manual',
    quizOpen: false,

    setStat: (key, value) => set(s => { s.stats[key] = value }),
    setDecision: (key, value) => set(s => { (s.decisions as LifeDecisions)[key] = value }),
    applyPreset: (stats, decisions) => set(s => {
      s.stats = stats
      s.decisions = decisions
      s.inputMode = 'manual'
    }),
    resetToDefaults: () => set(s => {
      s.stats = { ...DEFAULT_STATS }
      s.decisions = { ...DEFAULT_DECISIONS }
      s.inputMode = 'manual'
    }),
    setInputMode: (mode) => set(s => { s.inputMode = mode }),
    openQuiz: () => set(s => { s.quizOpen = true }),
    closeQuiz: () => set(s => { s.quizOpen = false }),
    applyQuizStats: (stats) => set(s => {
      s.stats = stats
      s.inputMode = 'quiz'
      s.quizOpen = false
    }),

    setStatus: (status) => set(s => { s.status = status }),
    setProgress: (pct) => set(s => { s.progress = pct }),
    setResults: (results) => set(s => {
      s.previousResults = s.results
      s.results = results
      s.status = 'complete'
      s.progress = 100
      s.hasSimulated = true
      s.compareVisible = s.previousResults !== null
    }),
    setError: (error) => set(s => {
      s.error = error
      s.status = 'error'
    }),

    setActiveMetric: (metric) => set(s => { s.activeMetric = metric }),
    setActiveTab: (tab) => set(s => { s.activeTab = tab }),
    setCompareVisible: (v) => set(s => { s.compareVisible = v }),
  }))
)
