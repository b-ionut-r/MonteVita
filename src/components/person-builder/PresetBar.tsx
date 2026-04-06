import { useSimulatorStore } from '@/store/useSimulatorStore'
import { PRESET_PROFILES } from '@/constants/presets'

export default function PresetBar() {
  const applyPreset = useSimulatorStore(s => s.applyPreset)

  return (
    <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Quick Presets
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {PRESET_PROFILES.map(preset => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset.stats, preset.decisions)}
            title={preset.description}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)',
              color: '#CBD5E1',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
