export interface StatDefinition {
  key: 'iq' | 'eq' | 'resilience' | 'luck' | 'ambition' | 'social' | 'health'
  label: string
  description: string
  color: string
  icon: string
}

export const STAT_DEFINITIONS: StatDefinition[] = [
  {
    key: 'iq',
    label: 'Intelligence',
    description: 'Cognitive ability — drives career growth, financial decisions, and education returns',
    color: '#60A5FA',
    icon: '🧠',
  },
  {
    key: 'eq',
    label: 'Emotional IQ',
    description: 'Emotional intelligence — shapes relationships, happiness baseline, and leadership',
    color: '#FBBF24',
    icon: '💛',
  },
  {
    key: 'resilience',
    label: 'Resilience',
    description: 'Bounce-back ability — reduces impact of setbacks and enables recovery',
    color: '#34D399',
    icon: '🌱',
  },
  {
    key: 'luck',
    label: 'Luck',
    description: 'Pure randomness — unearned windfalls and avoided disasters',
    color: '#A78BFA',
    icon: '🎲',
  },
  {
    key: 'ambition',
    label: 'Ambition',
    description: 'Drive to achieve — accelerates career but risks burnout without balance',
    color: '#FB923C',
    icon: '🔥',
  },
  {
    key: 'social',
    label: 'Social Capital',
    description: 'Network and charisma — unlocks opportunities and enriches relationships',
    color: '#F472B6',
    icon: '🤝',
  },
  {
    key: 'health',
    label: 'Vitality',
    description: 'Physical health baseline — affects longevity, energy, and medical costs',
    color: '#2DD4BF',
    icon: '💪',
  },
]

export const DEFAULT_STATS = {
  iq: 50,
  eq: 50,
  resilience: 50,
  luck: 50,
  ambition: 50,
  social: 50,
  health: 50,
}
