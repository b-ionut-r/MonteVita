import { motion } from 'framer-motion'
import { useSimulation } from '@/hooks/useSimulation'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function HeroSection() {
  const { run } = useSimulation()

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ textAlign: 'center', maxWidth: '560px', padding: '40px 24px' }}
    >
      <motion.div variants={item} style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '48px' }}>🧬</span>
      </motion.div>

      <motion.h1
        variants={item}
        style={{
          fontSize: '42px',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          color: '#F1F5F9',
          marginBottom: '16px',
        }}
      >
        Simulate{' '}
        <span
          style={{
            background: 'linear-gradient(135deg, #6366F1, #A855F7, #EC4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          10,000 lives
        </span>{' '}
        in seconds
      </motion.h1>

      <motion.p
        variants={item}
        style={{ fontSize: '16px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '32px' }}
      >
        Design a person with unique personality traits. Run thousands of Monte Carlo
        simulations and see the full probability distribution of their possible futures —
        wealth, happiness, health, and success.
      </motion.p>

      <motion.div variants={item} style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { icon: '📊', text: '10,000 simulated lives' },
          { icon: '🎲', text: 'Monte Carlo randomness' },
          { icon: '✨', text: '~60 life events' },
        ].map(badge => (
          <div
            key={badge.text}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              fontSize: '13px',
              color: '#94A3B8',
            }}
          >
            <span>{badge.icon}</span>
            <span>{badge.text}</span>
          </div>
        ))}
      </motion.div>

      <motion.div variants={item} style={{ marginTop: '32px' }}>
        <button
          onClick={run}
          style={{
            padding: '14px 32px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
            color: 'white',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(99,102,241,0.4)',
          }}
        >
          Start Simulation →
        </button>
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '10px' }}>
          Adjust traits in the panel on the left first
        </p>
      </motion.div>
    </motion.div>
  )
}
