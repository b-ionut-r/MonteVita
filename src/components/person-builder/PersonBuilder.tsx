import { motion } from 'framer-motion'
import StatSliderGroup from './StatSliderGroup'
import DecisionPanel from './DecisionPanel'

export default function PersonBuilder() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#F1F5F9', margin: 0, letterSpacing: '-0.02em' }}>
          Design Your Person
        </h1>
        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
          Set their traits, then run 10,000 simulated lives
        </p>
      </div>

      <StatSliderGroup />
      <DecisionPanel />
    </motion.div>
  )
}
