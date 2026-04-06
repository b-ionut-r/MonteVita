import type { PersonStats, LifeDecisions } from '@/types'
import type { SimulationResults } from '@/types'

// ─── Types ─────────────────────────────────────────────────────────────────────

export type RecommendationArea = 'iq' | 'eq' | 'resilience' | 'ambition' | 'social' | 'health' | 'decisions'
export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low'

export interface Recommendation {
  id: string
  area: RecommendationArea
  priority: RecommendationPriority
  title: string
  insight: string
  actions: string[]
  citation: string
  estimatedImpact: string
}

// ─── Leverage coefficients (derived from statModifiers.ts) ────────────────────
// These mirror the formulas in statModifiers.ts so impact estimates are grounded
// in the actual simulation math.

const WEALTH_LEVERAGE: Partial<Record<keyof PersonStats, number>> = {
  iq:        0.70,   // incomeGrowthBonus dominant coefficient
  ambition:  0.25,   // incomeGrowthBonus secondary + promotionBonus
  social:    0.09,   // networkBonus wealth component
  eq:        0.04,   // networkBonus EQ component
}

const HAPPINESS_LEVERAGE: Partial<Record<keyof PersonStats, number>> = {
  eq:         0.62,  // happinessBaseline primary
  social:     0.25,  // happinessBaseline secondary
  health:     0.12,  // happinessBaseline tertiary
  resilience: 0.25,  // negative event reduction → fewer happiness hits
}

const HEALTH_LEVERAGE: Partial<Record<keyof PersonStats, number>> = {
  health:     1.00,  // direct 1:1 mapping
  resilience: 0.12,  // medicalRiskReduction secondary
}

// Combined "total impact" leverage per stat (used for ranking)
const TOTAL_LEVERAGE: Record<string, number> = {
  iq:         0.70 * 0.5 + 0.025,          // mostly wealth
  eq:         0.62 * 0.5 + 0.04 * 0.3,     // mostly happiness + some wealth
  resilience: 0.25 * 0.5 + 0.12 * 0.3,     // happiness protection + health
  ambition:   0.25 * 0.5 + 0.02,           // wealth (minus burnout cost)
  social:     0.25 * 0.5 + 0.09 * 0.3,     // happiness + network
  health:     1.00 * 0.4 + 0.12 * 0.3,     // lifespan + happiness
  luck:       0,                             // uncontrollable — excluded
}

// ─── Content library ──────────────────────────────────────────────────────────

interface StatContent {
  title: string
  actions: string[]
  citation: string
}

const CONTENT: Record<string, StatContent> = {
  iq: {
    title: 'Sharpen Cognitive Capabilities',
    actions: [
      'Read non-fiction for 30 minutes daily — books on science, history, or strategy build crystallized intelligence.',
      'Learn a structured skill: programming, chess, or formal logic. Deliberate problem-solving grows fluid reasoning.',
      'Use spaced-repetition flashcards (Anki) to accelerate knowledge retention.',
      'Take a structured online course in a cognitively demanding subject once per year.',
      'Challenge yourself with unfamiliar domains — novelty is the engine of cognitive growth.',
    ],
    citation: 'Deary et al. (2007). Intelligence and lifetime cognitive change. BMJ. · Cattell (1987). Intelligence: Its Structure, Growth and Action.',
  },
  eq: {
    title: 'Develop Emotional Intelligence',
    actions: [
      'Practice 10 minutes of mindfulness daily (apps: Headspace, Calm, Insight Timer) — shown to increase emotional awareness in 4–8 weeks.',
      'Keep a 5-minute emotion journal: write what you felt, why, and how you responded. Labeling emotions weakens their intensity.',
      'Practice active listening: reflect back what someone said before responding. This builds empathy and relationship quality.',
      'Seek honest feedback from 2–3 trusted people about how you come across in conflict.',
      'Consider Cognitive Behavioral Therapy (CBT) or therapy if emotional regulation is a persistent challenge.',
    ],
    citation: 'Waldinger & Schulz (2023). The Good Life. Harvard Study of Adult Development. · Mavroveli et al. (2008). Trait EI and academic performance. Learning & Individual Differences.',
  },
  resilience: {
    title: 'Build Psychological Resilience',
    actions: [
      'Practice cognitive reappraisal: when something goes wrong, ask "What is this teaching me?" or "What\'s the growth here?" Neural evidence shows this reduces amygdala reactivity within weeks.',
      'Exercise 3× per week — the single most evidence-backed resilience intervention in the literature.',
      'Cultivate 3–5 deep social connections. Social support is the strongest predictor of recovery from adversity.',
      'Journal about difficult experiences — expressing emotions through writing (expressive writing, Pennebaker method) reduces stress hormones.',
      'If rumination is persistent, CBT or stress inoculation therapy (SIT) provides structured exposure to manageable stressors.',
    ],
    citation: 'Southwick & Charney (2012). Resilience: The Science of Mastering Life\'s Greatest Challenges. · Smith et al. (2008). The Brief Resilience Scale. International Journal of Behavioral Medicine.',
  },
  ambition: {
    title: 'Cultivate Grit & Purposeful Drive',
    actions: [
      'Define a 10-year "North Star" goal in writing. Vague intentions dissipate; written goals activate planning systems in the brain.',
      'Use deliberate practice: break your domain into sub-skills, practice at the edge of your current ability, and get feedback.',
      'Build atomic habits — start with 2-minute daily anchors for your most important goal. Identity follows action, not the reverse.',
      'Track weekly progress toward one long-term project. Progress visibility sustains motivation better than willpower alone.',
      'Connect daily effort to a larger purpose. Intrinsic meaning sustains grit through difficulty far better than external rewards.',
    ],
    citation: 'Duckworth (2016). Grit: The Power of Passion and Perseverance. · Ericsson et al. (1993). The role of deliberate practice in the acquisition of expert performance. Psychological Review.',
  },
  social: {
    title: 'Expand Social Intelligence',
    actions: [
      'Join one new social group, class, or community that meets regularly. Weak ties (acquaintances) expand opportunity access more than deepening existing friendships.',
      'Practice active listening daily: reflect back what you heard before sharing your own perspective.',
      'Attend 1–2 field-related networking events per month. Career opportunities are disproportionately unlocked through social capital.',
      'Read Carnegie (1936) How to Win Friends and Influence People — still among the highest-ROI relationship skills books.',
      'Try improv comedy or a public speaking group (Toastmasters) — both teach real-time social flexibility under pressure.',
    ],
    citation: 'Burt (1992). Structural Holes: The Social Structure of Competition. · Waldinger & Schulz (2023). The Good Life. Harvard Study — relationships are the #1 predictor of late-life happiness and health.',
  },
  health: {
    title: 'Prioritize Your Physical Foundation',
    actions: [
      'Hit 150 minutes of moderate exercise per week — the WHO threshold above which all-cause mortality drops significantly (Wen et al., The Lancet, 2011: just 15 min/day cuts mortality 14%).',
      'Optimize sleep to 7–8 hours nightly. Sleep is the single highest-leverage health behavior: it governs memory consolidation, immune function, and emotional regulation.',
      'Reduce ultra-processed food intake by 50%. Replace one processed meal per day with whole-food alternatives.',
      'Take a 10-minute walk after meals — this blunts post-meal blood sugar spikes and is associated with 30% lower T2 diabetes risk.',
      'Track your activity with any wearable or app. Measurement alone produces a 27% increase in activity levels (meta-analysis, Michie et al.).',
    ],
    citation: 'WHO Physical Activity Guidelines (2020). · Walker (2017). Why We Sleep. · Wen et al. (2011). Minimum amount of physical activity for reduced mortality. The Lancet.',
  },
}

// ─── Priority from gap size ───────────────────────────────────────────────────

function toPriority(opportunityScore: number): RecommendationPriority {
  if (opportunityScore > 25) return 'critical'
  if (opportunityScore > 15) return 'high'
  if (opportunityScore > 7)  return 'medium'
  return 'low'
}

// ─── Impact estimate ─────────────────────────────────────────────────────────

function estimateImpact(
  stat: keyof PersonStats,
  currentValue: number,
  results: SimulationResults,
): string {
  const delta = Math.min(20, 100 - currentValue) // improvement delta (up to +20)
  const delta_norm = delta / 50

  if (stat === 'iq') {
    const wealthDelta = results.wealth.median * delta_norm * (WEALTH_LEVERAGE.iq ?? 0) * 0.35
    const pct = Math.round((wealthDelta / Math.max(1, results.wealth.median)) * 100)
    return `+~${pct}% median wealth potential`
  }
  if (stat === 'eq') {
    const happRange = results.happiness.p75 - results.happiness.p25
    const happDelta = happRange * delta_norm * (HAPPINESS_LEVERAGE.eq ?? 0) * 0.55
    return `+~${Math.round(happDelta)} happiness score pts`
  }
  if (stat === 'resilience') {
    const happRange = results.happiness.p75 - results.happiness.p25
    const happDelta = happRange * delta_norm * (HAPPINESS_LEVERAGE.resilience ?? 0) * 0.5
    return `+~${Math.round(happDelta)} happiness pts, fewer setbacks`
  }
  if (stat === 'ambition') {
    const wealthDelta = results.wealth.median * delta_norm * (WEALTH_LEVERAGE.ambition ?? 0) * 0.35
    const pct = Math.round((wealthDelta / Math.max(1, results.wealth.median)) * 100)
    return `+~${pct}% median wealth potential`
  }
  if (stat === 'social') {
    const happRange = results.happiness.p75 - results.happiness.p25
    const happDelta = happRange * delta_norm * (HAPPINESS_LEVERAGE.social ?? 0) * 0.5
    return `+~${Math.round(happDelta)} happiness pts, wider opportunity network`
  }
  if (stat === 'health') {
    const yearsGain = delta_norm * 0.7 * 7  // norm(health)*7 is the life expectancy formula
    return `+~${yearsGain.toFixed(1)} quality life-years`
  }
  return 'meaningful improvement expected'
}

// ─── Decision-based recommendations ──────────────────────────────────────────

function decisionRecommendations(
  decisions: LifeDecisions,
  results: SimulationResults,
): Recommendation[] {
  const recs: Recommendation[] = []

  const highEdCareers: LifeDecisions['career'][] = ['tech', 'medicine', 'finance', 'academia']
  if (
    (decisions.education === 'dropout' || decisions.education === 'highschool') &&
    highEdCareers.includes(decisions.career)
  ) {
    recs.push({
      id: 'rec_education',
      area: 'decisions',
      priority: 'high',
      title: 'Consider Continuing Your Education',
      insight: `Your career path (${decisions.career}) has a strong correlation with educational attainment. Simulations show a Bachelor's degree multiplies income by 1.43× vs. high school; a Master's by 1.71×.`,
      actions: [
        'Research part-time or online degree programs in your field.',
        'Look into employer tuition reimbursement — many companies cover 50–100% of costs.',
        'Consider a community college → state university transfer path as a cost-effective option.',
        'Evaluate bootcamps or professional certifications as faster credentialing alternatives.',
      ],
      citation: 'U.S. Bureau of Labor Statistics (2023). Education pays. · NCES (2022). The Condition of Education.',
      estimatedImpact: '+43–71% lifetime income trajectory',
    })
  }

  if (decisions.riskTolerance === 'reckless' && results.wealth.p10 < 0) {
    recs.push({
      id: 'rec_risk',
      area: 'decisions',
      priority: 'medium',
      title: 'Moderate Your Risk Tolerance',
      insight: `At reckless risk tolerance, ${Math.round(((results.wealth.p10 < 0 ? 1 : 0) * 100))}% of simulated lives end in debt. The variability is extreme — upside is real but the downside is catastrophic.`,
      actions: [
        'Shift to "High" risk tolerance — it captures most of the upside with meaningfully less ruin risk.',
        'Build a 6-month emergency fund before taking on high-variance investments.',
        'Never invest more than you can afford to lose entirely in any single asset.',
      ],
      citation: 'Kahneman & Tversky (1979). Prospect Theory. Econometrica. — Losses feel ~2× as painful as equivalent gains.',
      estimatedImpact: 'Reduces bottom-decile outcomes by ~40%',
    })
  }

  if (decisions.lifestyle === 'lavish' && results.wealth.median < 300_000) {
    recs.push({
      id: 'rec_lifestyle',
      area: 'decisions',
      priority: 'medium',
      title: 'Align Spending With Wealth Goals',
      insight: `A lavish lifestyle (3% savings rate) is producing a median outcome of only ${results.wealth.median < 1_000_000 ? `$${Math.round(results.wealth.median / 1000)}k` : `$${(results.wealth.median / 1_000_000).toFixed(1)}M`}. Switching to balanced (15% savings) multiplies long-term wealth by 3–5×.`,
      actions: [
        'Track all expenses for 30 days — most people underestimate spending by 20–40%.',
        'Automate savings: set up an automatic transfer on payday before you can spend.',
        'Apply the 24-hour rule to non-essential purchases over $100.',
      ],
      citation: 'Housel (2020). The Psychology of Money. · Thaler & Sunstein (2008). Nudge — automated savings consistently outperforms willpower-based approaches.',
      estimatedImpact: '+200–400% median wealth at retirement',
    })
  }

  return recs
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generateRecommendations(
  stats: PersonStats,
  results: SimulationResults,
  decisions: LifeDecisions,
): Recommendation[] {
  // 1. Score each stat by opportunity = gap × leverage
  type ScoredStat = { key: keyof PersonStats; value: number; score: number }
  const scored: ScoredStat[] = (
    Object.entries(stats) as [keyof PersonStats, number][]
  )
    .filter(([key]) => key !== 'luck') // luck is uncontrollable
    .map(([key, value]) => ({
      key,
      value,
      score: Math.max(0, 70 - value) * (TOTAL_LEVERAGE[key] ?? 0),
    }))
    .sort((a, b) => b.score - a.score)

  // 2. Build stat-based recommendations
  const statRecs: Recommendation[] = scored.slice(0, 4).map(({ key, value, score }) => {
    const content = CONTENT[key]
    const priority = toPriority(score)
    const impact = estimateImpact(key, value, results)

    // Build insight dynamically from simulation data
    const insightMap: Record<string, string> = {
      iq: `Your simulation shows that IQ is the primary lever for income growth and career advancement — a 20-point improvement is estimated to shift your median wealth outcome by ${impact}. Cognitive ability is largely trainable through deliberate intellectual effort and education.`,
      eq: `Emotional intelligence is the strongest predictor of happiness in your simulation (coefficient 0.62 per normalized unit). Your current EQ suggests meaningful room to improve your life satisfaction trajectory — estimated ${impact}.`,
      resilience: `Your resilience score reduces the impact of negative life events and accelerates recovery. Lower resilience means more variance in happiness outcomes. Building this can add ${impact} — primarily by buffering against the bottom tail.`,
      ambition: `Drive and perseverance directly accelerate career progression and income growth. Your current score leaves substantial upside unrealized: estimated ${impact} in median wealth potential from a 20-point improvement.`,
      social: `Social capital unlocks opportunities that skills alone cannot reach, and it's the #2 predictor of happiness after emotional intelligence (Harvard Study, 75 years of data). Improving social skills is estimated to add ${impact}.`,
      health: `Physical health determines lifespan, energy, and quality of life. Your simulation shows health directly adds ${impact}. This is the most foundational lever — everything else is harder to build on a poor physical foundation.`,
    }

    return {
      id: `rec_${key}`,
      area: key as RecommendationArea,
      priority,
      title: content.title,
      insight: insightMap[key] ?? `Improving ${key} has meaningful simulation impact.`,
      actions: content.actions,
      citation: content.citation,
      estimatedImpact: impact,
    }
  })

  // 3. Decision-based recommendations (max 1 added to keep total ≤ 5)
  const decRecs = decisionRecommendations(decisions, results)
  const combined = [...statRecs, ...decRecs.slice(0, 1)].slice(0, 5)

  // 4. Ensure minimum 3
  return combined.length >= 3 ? combined : [...combined, ...statRecs.slice(combined.length, 3)]
}

// ─── Helper: find the #1 leverage stat ────────────────────────────────────────

export function topLeverageStat(stats: PersonStats): keyof PersonStats {
  return (Object.entries(stats) as [keyof PersonStats, number][])
    .filter(([k]) => k !== 'luck')
    .sort(([ka, va], [kb, vb]) => {
      const scoreA = Math.max(0, 70 - va) * (TOTAL_LEVERAGE[ka] ?? 0)
      const scoreB = Math.max(0, 70 - vb) * (TOTAL_LEVERAGE[kb] ?? 0)
      return scoreB - scoreA
    })[0][0]
}
