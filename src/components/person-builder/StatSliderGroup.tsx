import { motion } from 'framer-motion'
import { STAT_DEFINITIONS } from '@/constants/stats'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import StatSlider from './StatSlider'
import PresetBar from './PresetBar'

export default function StatSliderGroup() {
  const inputMode = useSimulatorStore(s => s.inputMode)
  const openQuiz  = useSimulatorStore(s => s.openQuiz)
  const setInputMode = useSimulatorStore(s => s.setInputMode)

  return (
    <div>
      <PresetBar />

      {/* ── Mode toggle ──────────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{
          display: 'flex',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '3px',
          gap: '2px',
        }}>
          <button
            onClick={() => setInputMode('manual')}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: '7px',
              border: 'none',
              background: inputMode === 'manual'
                ? 'rgba(255,255,255,0.09)'
                : 'transparent',
              color: inputMode === 'manual' ? '#E2E8F0' : '#475569',
              fontSize: '12px',
              fontWeight: inputMode === 'manual' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Manual Setup
          </button>
          <button
            onClick={openQuiz}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: '7px',
              border: 'none',
              background: inputMode === 'quiz'
                ? 'rgba(99,102,241,0.2)'
                : 'transparent',
              color: inputMode === 'quiz' ? '#A5B4FC' : '#475569',
              fontSize: '12px',
              fontWeight: inputMode === 'quiz' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {inputMode === 'quiz' ? '✓ Quiz Applied' : '🧪 Take the Quiz'}
          </button>
        </div>

        {inputMode === 'quiz' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: '8px', textAlign: 'center' }}
          >
            <button
              onClick={openQuiz}
              style={{
                background: 'none',
                border: 'none',
                color: '#6366F1',
                fontSize: '11px',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Retake quiz
            </button>
            <span style={{ fontSize: '11px', color: '#334155', marginLeft: '4px' }}>
              · Sliders are still adjustable
            </span>
          </motion.div>
        )}
      </div>

      {/* ── Sliders ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px' }}>
        {STAT_DEFINITIONS.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            {/* Quiz-inferred badge on label */}
            {inputMode === 'quiz' && stat.key !== 'luck' && (
              <div style={{ paddingTop: '8px', paddingBottom: '0' }}>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  color: '#6366F1',
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: '4px',
                  padding: '1px 5px',
                }}>
                  QUIZ
                </span>
              </div>
            )}
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
