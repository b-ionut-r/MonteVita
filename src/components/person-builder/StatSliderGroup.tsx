import { motion } from 'framer-motion'
import { STAT_DEFINITIONS } from '@/constants/stats'
import StatSlider from './StatSlider'
import PresetBar from './PresetBar'

export default function StatSliderGroup() {
  return (
    <div>
      <PresetBar />
      <div style={{ padding: '0 16px' }}>
        {STAT_DEFINITIONS.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <StatSlider stat={stat} />
            {i < STAT_DEFINITIONS.length - 1 && (
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '2px 0' }} />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
