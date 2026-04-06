import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import type { SimulationResults, OutcomeMetric } from '@/types'

const AUTO_DISMISS_MS = 8000

function delta(next: number, prev: number): { sign: '+' | '-' | ''; value: number } {
  const d = next - prev
  return { sign: d > 0 ? '+' : d < 0 ? '-' : '', value: Math.abs(d) }
}

function formatDelta(metric: OutcomeMetric, value: number): string {
  if (metric === 'wealth') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
    return `$${Math.round(value).toLocaleString()}`
  }
  return Math.round(value).toString()
}

const METRIC_META: { metric: OutcomeMetric; label: string; color: string; prefix?: string }[] = [
  { metric: 'wealth',    label: 'Wealth',    color: '#34D399', prefix: '$' },
  { metric: 'happiness', label: 'Happiness', color: '#FBBF24' },
  { metric: 'health',    label: 'Health',    color: '#60A5FA' },
  { metric: 'success',   label: 'Success',   color: '#A78BFA' },
]

interface DeltaBadgeProps {
  metric: OutcomeMetric
  label: string
  color: string
  current: SimulationResults
  previous: SimulationResults
}

function DeltaBadge({ metric, label, color, current, previous }: DeltaBadgeProps) {
  const { sign, value } = delta(current[metric].median, previous[metric].median)
  const isPositive = sign === '+'
  const isNeutral = sign === ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <span style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          padding: '4px 8px',
          borderRadius: '6px',
          background: isNeutral
            ? 'rgba(255,255,255,0.06)'
            : isPositive
            ? 'rgba(74,222,128,0.12)'
            : 'rgba(248,113,113,0.12)',
          border: `1px solid ${isNeutral ? 'rgba(255,255,255,0.1)' : isPositive ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
        }}
      >
        <span style={{ fontSize: '11px', color: isNeutral ? '#94A3B8' : isPositive ? '#4ADE80' : '#F87171', fontWeight: 700 }}>
          {isNeutral ? '=' : isPositive ? '▲' : '▼'}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: isNeutral ? '#94A3B8' : isPositive ? '#4ADE80' : '#F87171',
          }}
        >
          {sign}{formatDelta(metric, value)}
        </span>
      </div>
    </div>
  )
}

export default function CompareOverlay() {
  const results = useSimulatorStore(s => s.results)
  const previousResults = useSimulatorStore(s => s.previousResults)
  const compareVisible = useSimulatorStore(s => s.compareVisible)
  const setCompareVisible = useSimulatorStore(s => s.setCompareVisible)

  const [timerPct, setTimerPct] = useState(100)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!compareVisible) {
      setTimerPct(100)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    startRef.current = null
    setTimerPct(100)

    function tick(now: number) {
      if (!startRef.current) startRef.current = now
      const elapsed = now - startRef.current
      const pct = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100)
      setTimerPct(pct)
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setCompareVisible(false)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [compareVisible, setCompareVisible])

  if (!results || !previousResults) return null

  return (
    <AnimatePresence>
      {compareVisible && (
        <motion.div
          initial={{ opacity: 0, x: 40, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 40, y: 10 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 50,
            background: 'rgba(13,17,23,0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '16px',
            minWidth: '280px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #A855F7)' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#E2E8F0' }}>vs Previous Run</span>
            </div>
            <button
              onClick={() => setCompareVisible(false)}
              style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: '#64748B', fontSize: '12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>

          {/* Delta badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {METRIC_META.map(m => (
              <DeltaBadge
                key={m.metric}
                metric={m.metric}
                label={m.label}
                color={m.color}
                current={results}
                previous={previousResults}
              />
            ))}
          </div>

          {/* Timer bar */}
          <div
            style={{
              marginTop: '12px',
              height: '2px',
              borderRadius: '1px',
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${timerPct}%`,
                background: 'linear-gradient(90deg, #6366F1, #A855F7)',
                borderRadius: '1px',
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
