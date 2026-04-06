import { motion } from 'framer-motion'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import { useSimulation } from '@/hooks/useSimulation'

export default function RunButton() {
  const status = useSimulatorStore(s => s.status)
  const hasSimulated = useSimulatorStore(s => s.hasSimulated)
  const { run } = useSimulation()

  const isRunning = status === 'running'

  const label = isRunning
    ? 'Simulating...'
    : hasSimulated
    ? 'Re-run Simulation'
    : 'Run Simulation'

  return (
    <motion.button
      onClick={isRunning ? undefined : run}
      whileTap={isRunning ? {} : { scale: 0.97 }}
      className={isRunning ? '' : 'run-button-idle'}
      style={{
        width: '100%',
        padding: '14px',
        borderRadius: '12px',
        border: 'none',
        background: isRunning
          ? 'rgba(99,102,241,0.3)'
          : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
        color: 'white',
        fontSize: '15px',
        fontWeight: 700,
        cursor: isRunning ? 'not-allowed' : 'pointer',
        letterSpacing: '0.01em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'background 0.3s',
      }}
    >
      {isRunning ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
        </svg>
      )}
      {isRunning ? (
        <span style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
          {label}
          <DotEllipsis />
        </span>
      ) : label}
    </motion.button>
  )
}

function DotEllipsis() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.3, 1] }}
      transition={{ duration: 1.2, repeat: Infinity }}
    >
      ...
    </motion.span>
  )
}
