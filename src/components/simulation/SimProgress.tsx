import { motion } from 'framer-motion'
import { useSimulatorStore } from '@/store/useSimulatorStore'

export default function SimProgress() {
  const progress = useSimulatorStore(s => s.progress)

  return (
    <div style={{ width: '100%', background: 'rgba(0,0,0,0.3)' }}>
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ ease: 'linear', duration: 0.3 }}
        style={{
          height: '3px',
          background: 'linear-gradient(90deg, #6366F1, #A855F7, #EC4899)',
          boxShadow: '0 0 10px rgba(168,85,247,0.6)',
        }}
      />
    </div>
  )
}
