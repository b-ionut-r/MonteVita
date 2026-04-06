import { motion } from 'framer-motion'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import OutcomeCard from './OutcomeCard'
import type { OutcomeMetric } from '@/types'

const CARDS: {
  metric: OutcomeMetric
  label: string
  icon: string
  color: string
  format: (n: number) => string
}[] = [
  {
    metric: 'wealth',
    label: 'Net Worth',
    icon: '💰',
    color: '#34D399',
    format: (n) => {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`
      return `$${Math.round(n).toLocaleString()}`
    },
  },
  {
    metric: 'happiness',
    label: 'Happiness',
    icon: '😊',
    color: '#FBBF24',
    format: (n) => `${Math.round(n)}/100`,
  },
  {
    metric: 'health',
    label: 'Health',
    icon: '💪',
    color: '#60A5FA',
    format: (n) => `${Math.round(n)}/100`,
  },
  {
    metric: 'success',
    label: 'Success',
    icon: '⭐',
    color: '#A78BFA',
    format: (n) => `${Math.round(n)}/100`,
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const cardAnim = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export default function OutcomeCards() {
  const results = useSimulatorStore(s => s.results)
  const activeMetric = useSimulatorStore(s => s.activeMetric)
  const setActiveMetric = useSimulatorStore(s => s.setActiveMetric)

  if (!results) return null

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', padding: '20px 20px 0' }}
    >
      {CARDS.map(card => (
        <motion.div key={card.metric} variants={cardAnim}>
          <OutcomeCard
            label={card.label}
            distribution={results[card.metric]}
            color={card.color}
            icon={card.icon}
            format={card.format}
            active={activeMetric === card.metric}
            onClick={() => setActiveMetric(card.metric)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
