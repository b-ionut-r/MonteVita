import { useCallback } from 'react'
import type { StatDefinition } from '@/constants/stats'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import type { PersonStats } from '@/types'

interface StatSliderProps {
  stat: StatDefinition
}

export default function StatSlider({ stat }: StatSliderProps) {
  const value = useSimulatorStore(s => s.stats[stat.key])
  const setStat = useSimulatorStore(s => s.setStat)

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStat(stat.key as keyof PersonStats, Number(e.target.value))
  }, [stat.key, setStat])

  const pct = ((value - 1) / 99) * 100
  const dataAttr = `stat-${stat.key}`

  return (
    <div data-slider={dataAttr} style={{ padding: '10px 0' }}>
      <style>{`
        [data-slider="${dataAttr}"] input[type="range"] {
          background: linear-gradient(to right, ${stat.color} ${pct}%, rgba(255,255,255,0.1) ${pct}%);
        }
        [data-slider="${dataAttr}"] input[type="range"]::-webkit-slider-thumb {
          background: ${stat.color};
          box-shadow: 0 0 8px ${stat.color}80;
        }
        [data-slider="${dataAttr}"] input[type="range"]::-webkit-slider-runnable-track {
          background: linear-gradient(to right, ${stat.color} ${pct}%, rgba(255,255,255,0.1) ${pct}%);
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{stat.icon}</span>
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#E2E8F0' }}>{stat.label}</span>
        </div>
        <span
          className="font-mono"
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: stat.color,
            minWidth: '32px',
            textAlign: 'right',
          }}
        >
          {Math.round(value)}
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={100}
        value={value}
        onChange={onChange}
      />

      <p style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', lineHeight: '1.4' }}>
        {stat.description}
      </p>
    </div>
  )
}
