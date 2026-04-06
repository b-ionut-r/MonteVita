import { motion } from 'framer-motion'
import AnimatedNumber from '@/components/ui/AnimatedNumber'
import { useSimulatorStore } from '@/store/useSimulatorStore'

export default function SimSummary() {
  const results = useSimulatorStore(s => s.results)
  if (!results) return null

  const stats = [
    {
      label: 'lives simulated',
      value: results.totalRuns,
      format: (n: number) => Math.round(n).toLocaleString(),
      color: '#A78BFA',
    },
    {
      label: 'became millionaires',
      value: results.millionaires,
      format: (n: number) => Math.round(n).toLocaleString(),
      color: '#34D399',
    },
    {
      label: 'reached peak happiness',
      value: results.peakHappiness,
      format: (n: number) => Math.round(n).toLocaleString(),
      color: '#FBBF24',
    },
    {
      label: 'median life (years)',
      value: results.medianLifeExpectancy,
      format: (n: number) => Math.round(n).toString(),
      color: '#60A5FA',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        padding: '10px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.2)',
        flexWrap: 'wrap',
      }}
    >
      {stats.map((s, i) => (
        <span key={s.label} style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#64748B' }}>
          {i > 0 && <span style={{ margin: '0 10px', opacity: 0.3 }}>·</span>}
          <AnimatedNumber
            value={s.value}
            format={s.format}
            className="font-mono"
            duration={1200}
          />
          <span style={{ marginLeft: '5px', color: s.color }}>{s.label}</span>
        </span>
      ))}
    </motion.div>
  )
}
