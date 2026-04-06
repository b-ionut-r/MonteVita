import { useSimulatorStore } from '@/store/useSimulatorStore'
import { CAREER_DEFINITIONS } from '@/constants/careers'
import type { CareerPath, RiskTolerance, EducationLevel, Lifestyle } from '@/types'

const RISK_OPTIONS: { id: RiskTolerance; label: string; icon: string }[] = [
  { id: 'low', label: 'Safe', icon: '🛡️' },
  { id: 'medium', label: 'Balanced', icon: '⚖️' },
  { id: 'high', label: 'Bold', icon: '⚡' },
  { id: 'reckless', label: 'Reckless', icon: '🎯' },
]

const EDUCATION_OPTIONS: { id: EducationLevel; label: string; icon: string }[] = [
  { id: 'dropout', label: 'Dropout', icon: '🚪' },
  { id: 'highschool', label: 'High School', icon: '🏫' },
  { id: 'bachelors', label: "Bachelor's", icon: '🎓' },
  { id: 'masters', label: "Master's", icon: '📜' },
  { id: 'phd', label: 'PhD', icon: '🔬' },
]

const LIFESTYLE_OPTIONS: { id: Lifestyle; label: string; icon: string }[] = [
  { id: 'frugal', label: 'Frugal', icon: '💰' },
  { id: 'balanced', label: 'Balanced', icon: '🏡' },
  { id: 'lavish', label: 'Lavish', icon: '💎' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
      {children}
    </p>
  )
}

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; icon: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            padding: '6px 12px',
            borderRadius: '999px',
            border: `1px solid ${value === opt.id ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)'}`,
            background: value === opt.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
            color: value === opt.id ? '#A5B4FC' : '#94A3B8',
            fontSize: '12px',
            fontWeight: value === opt.id ? 600 : 400,
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span>{opt.icon}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

const VOLATILITY_COLORS: Record<string, string> = {
  low: '#34D399',
  medium: '#FBBF24',
  high: '#FB923C',
  extreme: '#F87171',
}

export default function DecisionPanel() {
  const career = useSimulatorStore(s => s.decisions.career)
  const riskTolerance = useSimulatorStore(s => s.decisions.riskTolerance)
  const education = useSimulatorStore(s => s.decisions.education)
  const lifestyle = useSimulatorStore(s => s.decisions.lifestyle)
  const setDecision = useSimulatorStore(s => s.setDecision)

  return (
    <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Career */}
      <SectionLabel>Career Path</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        {CAREER_DEFINITIONS.map(c => (
          <button
            key={c.id}
            onClick={() => setDecision('career', c.id as CareerPath)}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              border: `1px solid ${career === c.id ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)'}`,
              background: career === c.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>{c.icon}</span>
              <span
                style={{
                  fontSize: '9px',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  background: `${VOLATILITY_COLORS[c.volatility]}20`,
                  color: VOLATILITY_COLORS[c.volatility],
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {c.volatility}
              </span>
            </div>
            <p style={{ fontSize: '12px', fontWeight: 600, color: career === c.id ? '#A5B4FC' : '#E2E8F0', margin: '6px 0 2px' }}>
              {c.label}
            </p>
            <p style={{ fontSize: '10px', color: '#64748B' }}>{c.salaryRange}</p>
          </button>
        ))}
      </div>

      {/* Risk */}
      <SectionLabel>Risk Tolerance</SectionLabel>
      <ChipGroup options={RISK_OPTIONS} value={riskTolerance} onChange={v => setDecision('riskTolerance', v)} />

      {/* Education */}
      <SectionLabel>Education Level</SectionLabel>
      <ChipGroup options={EDUCATION_OPTIONS} value={education} onChange={v => setDecision('education', v)} />

      {/* Lifestyle */}
      <SectionLabel>Lifestyle</SectionLabel>
      <ChipGroup options={LIFESTYLE_OPTIONS} value={lifestyle} onChange={v => setDecision('lifestyle', v)} />
    </div>
  )
}
