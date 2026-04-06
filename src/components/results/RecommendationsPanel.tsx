import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSimulatorStore } from '@/store/useSimulatorStore'
import {
  generateRecommendations,
  topLeverageStat,
  type Recommendation,
  type RecommendationArea,
} from '@/engine/recommendations'
import type { PersonStats } from '@/types'

// ─── Colors ───────────────────────────────────────────────────────────────────

const AREA_COLORS: Record<RecommendationArea, string> = {
  iq:         '#60A5FA',
  eq:         '#FBBF24',
  resilience: '#34D399',
  ambition:   '#FB923C',
  social:     '#F472B6',
  health:     '#2DD4BF',
  decisions:  '#A78BFA',
}

const AREA_ICONS: Record<RecommendationArea, string> = {
  iq:         '🧠',
  eq:         '💛',
  resilience: '🌱',
  ambition:   '🔥',
  social:     '🤝',
  health:     '💪',
  decisions:  '🎯',
}

const PRIORITY_COLORS: Record<Recommendation['priority'], string> = {
  critical: '#EF4444',
  high:     '#F97316',
  medium:   '#EAB308',
  low:      '#64748B',
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function RecommendationCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const areaColor = AREA_COLORS[rec.area]
  const prioColor = PRIORITY_COLORS[rec.priority]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.08, duration: 0.35 }}
      style={{
        display: 'flex',
        gap: '0',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '14px',
      }}
    >
      {/* Accent bar */}
      <div style={{ width: '4px', background: areaColor, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: '16px 18px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: '5px',
            background: `${areaColor}18`,
            border: `1px solid ${areaColor}40`,
            color: areaColor,
            fontSize: '11px',
            fontWeight: 600,
          }}>
            {AREA_ICONS[rec.area]} {rec.area.toUpperCase()}
          </span>
          <span style={{
            padding: '2px 8px',
            borderRadius: '5px',
            background: `${prioColor}15`,
            border: `1px solid ${prioColor}35`,
            color: prioColor,
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.04em',
          }}>
            {rec.priority.toUpperCase()}
          </span>
          {rank === 0 && (
            <span style={{
              padding: '2px 8px',
              borderRadius: '5px',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)',
              color: '#A5B4FC',
              fontSize: '10px',
              fontWeight: 700,
            }}>
              #1 PRIORITY
            </span>
          )}
        </div>

        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F1F5F9', margin: '0 0 8px' }}>
          {rec.title}
        </h3>

        <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6, margin: '0 0 12px' }}>
          {rec.insight}
        </p>

        {/* Actions */}
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '6px' }}>
            WHAT TO DO
          </p>
          <ol style={{ margin: 0, paddingLeft: '18px' }}>
            {rec.actions.map((action, i) => (
              <li key={i} style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.6, marginBottom: '4px' }}>
                {action}
              </li>
            ))}
          </ol>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '10px', color: '#334155', margin: 0, flex: 1, lineHeight: 1.4 }}>
            📚 {rec.citation}
          </p>
          <span style={{
            padding: '3px 10px',
            borderRadius: '6px',
            background: `${areaColor}12`,
            border: `1px solid ${areaColor}30`,
            color: areaColor,
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {rec.estimatedImpact}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Profile summary ──────────────────────────────────────────────────────────

function ProfileSummary({ stats }: { stats: PersonStats }) {
  const STAT_LABELS: Record<keyof PersonStats, string> = {
    iq: 'IQ', eq: 'EQ', resilience: 'Resilience',
    ambition: 'Drive', social: 'Social', health: 'Health', luck: 'Luck',
  }

  const sorted = (Object.entries(stats) as [keyof PersonStats, number][])
    .filter(([k]) => k !== 'luck')
    .sort(([, a], [, b]) => b - a)

  const top2 = sorted.slice(0, 2)
  const bot2 = sorted.slice(-2)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        gap: '20px',
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '10px', color: '#34D399', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '6px' }}>
          STRONGEST
        </p>
        {top2.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>{STAT_LABELS[k]}</span>
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${v}%`, background: AREA_COLORS[k as RecommendationArea] ?? '#64748B', borderRadius: '2px' }} />
            </div>
            <span style={{ fontSize: '11px', color: AREA_COLORS[k as RecommendationArea] ?? '#64748B', fontFamily: 'monospace', fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '10px', color: '#EF4444', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '6px' }}>
          MOST ROOM TO GROW
        </p>
        {bot2.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>{STAT_LABELS[k]}</span>
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${v}%`, background: AREA_COLORS[k as RecommendationArea] ?? '#64748B', borderRadius: '2px', opacity: 0.5 }} />
            </div>
            <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace', fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Leverage callout ─────────────────────────────────────────────────────────

function LeverageCallout({ stats, topStat }: { stats: PersonStats; topStat: keyof PersonStats }) {
  const STAT_LABELS: Record<keyof PersonStats, string> = {
    iq: 'IQ', eq: 'EQ', resilience: 'Resilience',
    ambition: 'Drive', social: 'Social', health: 'Health', luck: 'Luck',
  }
  const LEVER_DESC: Record<string, string> = {
    iq:         'cognitive ability is the primary driver of income growth and career advancement',
    eq:         'emotional intelligence is the strongest determinant of happiness and life satisfaction',
    resilience: 'resilience reduces the impact of setbacks and protects long-term wellbeing',
    ambition:   'drive and persistence directly accelerate career progression and wealth accumulation',
    social:     'social capital unlocks opportunities and is the #2 predictor of late-life happiness',
    health:     'physical health is the foundation — it determines energy, longevity, and quality of life',
  }

  const currentVal = stats[topStat]
  const targetVal = Math.min(currentVal + 20, 90)
  const color = AREA_COLORS[topStat as RecommendationArea] ?? '#A78BFA'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      style={{
        background: `${color}0A`,
        border: `1px solid ${color}25`,
        borderRadius: '14px',
        padding: '16px 18px',
        marginBottom: '20px',
      }}
    >
      <p style={{ fontSize: '11px', color: color, fontWeight: 700, letterSpacing: '0.06em', marginBottom: '6px' }}>
        ⚡ BIGGEST SIMULATION LEVER
      </p>
      <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.6, margin: 0 }}>
        Your highest-impact opportunity is <strong style={{ color }}>{STAT_LABELS[topStat]}</strong>. In this simulation,{' '}
        {LEVER_DESC[topStat] ?? 'this stat has outsized impact'}. Improving from{' '}
        <strong style={{ color }}>{currentVal}</strong> to{' '}
        <strong style={{ color }}>{targetVal}</strong> would be the single change with the greatest downstream effect on your outcomes.
      </p>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RecommendationsPanel() {
  const stats    = useSimulatorStore(s => s.stats)
  const results  = useSimulatorStore(s => s.results)
  const decisions = useSimulatorStore(s => s.decisions)

  const recommendations = useMemo(
    () => results ? generateRecommendations(stats, results, decisions) : [],
    [stats, results, decisions],
  )

  const topStat = useMemo(() => topLeverageStat(stats), [stats])

  if (!results) return null

  return (
    <div style={{ paddingBottom: '8px' }}>
      <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
        Personalized recommendations based on your simulation profile · Evidence-based, ranked by impact
      </p>

      <ProfileSummary stats={stats} />
      <LeverageCallout stats={stats} topStat={topStat} />

      <p style={{ fontSize: '11px', color: '#475569', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '12px' }}>
        IMPROVEMENT RECOMMENDATIONS
      </p>

      {recommendations.map((rec, i) => (
        <RecommendationCard key={rec.id} rec={rec} rank={i} />
      ))}

      <p style={{ fontSize: '10px', color: '#334155', textAlign: 'center', marginTop: '16px', lineHeight: 1.5 }}>
        These recommendations are based on peer-reviewed psychological and health research.
        Individual results vary. Consult qualified professionals for personal guidance.
      </p>
    </div>
  )
}
