import { useMemo } from 'react'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import { EVENT_CATALOG } from '@/constants/events'

const CATEGORY_COLORS = {
  positive: '#4ADE80',
  negative: '#F87171',
  neutral: '#94A3B8',
}

export default function EventHeatmap() {
  const results = useSimulatorStore(s => s.results)
  if (!results) return null

  const { eventFrequencies, totalRuns } = results

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const sorted = useMemo(() => {
    return Object.entries(eventFrequencies)
      .map(([id, count]) => {
        const def = EVENT_CATALOG.find(e => e.id === id)
        return {
          id,
          label: def?.label ?? id,
          category: def?.category ?? 'neutral',
          count,
          pct: (count / totalRuns) * 100,
          oneIn: totalRuns / count,
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
  }, [eventFrequencies, totalRuns])

  const maxPct = sorted[0]?.pct ?? 1

  return (
    <div style={{ padding: '0 4px' }}>
      <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
        Frequency of life events across all simulations
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sorted.map(ev => {
          const color = CATEGORY_COLORS[ev.category as keyof typeof CATEGORY_COLORS]
          return (
            <div key={ev.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: '#CBD5E1' }}>{ev.label}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
                  1 in {Math.round(ev.oneIn)}
                </span>
              </div>
              <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(ev.pct / maxPct) * 100}%`,
                    borderRadius: '2px',
                    background: color,
                    opacity: 0.7,
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
