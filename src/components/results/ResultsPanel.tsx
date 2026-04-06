import { motion, AnimatePresence } from 'framer-motion'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import OutcomeCards from './OutcomeCards'
import DistributionChart from './DistributionChart'
import LifePathChart from './LifePathChart'
import EventHeatmap from './EventHeatmap'
import RecommendationsPanel from './RecommendationsPanel'
import SimSummary from '@/components/simulation/SimSummary'
import type { OutcomeMetric, ResultsTab } from '@/types'

const METRIC_META: Record<OutcomeMetric, { label: string; format: (n: number) => string; trajectoryKey: 'wealthTrajectories' | 'happinessTrajectories' | 'healthTrajectories' }> = {
  wealth: {
    label: 'Net Worth ($)',
    format: (n) => {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`
      return `$${Math.round(n)}`
    },
    trajectoryKey: 'wealthTrajectories',
  },
  happiness: {
    label: 'Happiness Score',
    format: (n) => `${Math.round(n)}`,
    trajectoryKey: 'happinessTrajectories',
  },
  health: {
    label: 'Health Score',
    format: (n) => `${Math.round(n)}`,
    trajectoryKey: 'healthTrajectories',
  },
  success: {
    label: 'Success Score',
    format: (n) => `${Math.round(n)}`,
    trajectoryKey: 'wealthTrajectories', // success uses wealth trajectories as proxy
  },
}

const TABS: { id: ResultsTab; label: string }[] = [
  { id: 'distribution', label: 'Distribution' },
  { id: 'lifePaths', label: 'Life Paths' },
  { id: 'events', label: 'Event Analysis' },
  { id: 'recommendations', label: '💡 Insights' },
]

export default function ResultsPanel() {
  const results = useSimulatorStore(s => s.results)
  const activeMetric = useSimulatorStore(s => s.activeMetric)
  const activeTab = useSimulatorStore(s => s.activeTab)
  const setActiveTab = useSimulatorStore(s => s.setActiveTab)

  if (!results) return null

  const meta = METRIC_META[activeMetric]
  const distribution = results[activeMetric]

  return (
    <div style={{ paddingBottom: '40px' }}>
      <SimSummary />
      <OutcomeCards />

      {/* Tab bar */}
      <div style={{ padding: '16px 20px 0', display: 'flex', gap: '4px', position: 'relative' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              background: activeTab === tab.id ? 'rgba(255,255,255,0.06)' : 'transparent',
              color: activeTab === tab.id ? '#F1F5F9' : '#64748B',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              position: 'relative',
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-underline"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, #6366F1, #A855F7)',
                  borderRadius: '1px 1px 0 0',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div
        style={{
          margin: '0 20px',
          padding: '20px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0 12px 12px 12px',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + activeMetric}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'distribution' && (
              <div>
                <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>
                  Outcome distribution across {results.totalRuns.toLocaleString()} simulations · Metric: {meta.label}
                </p>
                <DistributionChart
                  distribution={distribution}
                  metric={activeMetric}
                  formatValue={meta.format}
                />
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '20px' }}>
                  {[
                    { label: 'p10', value: distribution.p10 },
                    { label: 'p25', value: distribution.p25 },
                    { label: 'Median', value: distribution.median },
                    { label: 'p75', value: distribution.p75 },
                    { label: 'p90', value: distribution.p90 },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '11px', color: '#475569', marginBottom: '2px' }}>{s.label}</p>
                      <p className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1' }}>
                        {meta.format(s.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'lifePaths' && (
              <div>
                <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>
                  Sampled life trajectories (100 of {results.totalRuns.toLocaleString()}) · colored by outcome decile
                </p>
                <LifePathChart
                  trajectories={activeMetric !== 'success' ? results[meta.trajectoryKey] : results.wealthTrajectories}
                  metric={activeMetric}
                  formatValue={meta.format}
                />
              </div>
            )}

            {activeTab === 'events' && <EventHeatmap />}

            {activeTab === 'recommendations' && <RecommendationsPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
