import { motion } from 'framer-motion'
import AnimatedNumber from '@/components/ui/AnimatedNumber'
import type { OutcomeDistribution } from '@/types'

interface OutcomeCardProps {
  label: string
  distribution: OutcomeDistribution
  color: string
  icon: string
  format: (n: number) => string
  active: boolean
  onClick: () => void
}

export default function OutcomeCard({ label, distribution, color, icon, format, active, onClick }: OutcomeCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        padding: '16px',
        borderRadius: '14px',
        border: `1px solid ${active ? color + '50' : 'rgba(255,255,255,0.08)'}`,
        background: active ? `${color}12` : 'rgba(255,255,255,0.04)',
        cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top color bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: color, opacity: active ? 1 : 0.3 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '18px' }}>{icon}</span>
      </div>

      <div
        className="font-mono"
        style={{ fontSize: '20px', fontWeight: 700, color: active ? color : '#E2E8F0', marginBottom: '6px' }}
      >
        <AnimatedNumber value={distribution.median} format={format} />
      </div>

      <div style={{ fontSize: '11px', color: '#475569' }}>
        p10:{' '}
        <span style={{ color: '#64748B' }}>{format(distribution.p10)}</span>
        {' · '}
        p90:{' '}
        <span style={{ color: '#64748B' }}>{format(distribution.p90)}</span>
      </div>
    </motion.div>
  )
}
