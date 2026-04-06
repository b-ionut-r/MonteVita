import { AnimatePresence, motion } from 'framer-motion'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import HeroSection from '@/components/intro/HeroSection'
import ResultsPanel from '@/components/results/ResultsPanel'
import SimProgress from '@/components/simulation/SimProgress'

export default function MainPanel() {
  const hasSimulated = useSimulatorStore(s => s.hasSimulated)
  const status = useSimulatorStore(s => s.status)

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {status === 'running' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
          <SimProgress />
        </div>
      )}

      <AnimatePresence mode="wait">
        {!hasSimulated ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <HeroSection />
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
          >
            <ResultsPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
