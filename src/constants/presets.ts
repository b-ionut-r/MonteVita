import type { PresetProfile } from '@/types'

export const PRESET_PROFILES: PresetProfile[] = [
  {
    id: 'grinder',
    label: 'The Grinder',
    description: 'High IQ & ambition, low EQ. Rich but maybe not happy.',
    stats: { iq: 85, eq: 25, resilience: 70, luck: 40, ambition: 90, social: 30, health: 50 },
    decisions: { career: 'finance', riskTolerance: 'high', education: 'masters', lifestyle: 'frugal' },
  },
  {
    id: 'lucky_one',
    label: 'The Lucky One',
    description: 'Average stats, but fortune favors them.',
    stats: { iq: 50, eq: 55, resilience: 45, luck: 95, ambition: 50, social: 60, health: 55 },
    decisions: { career: 'entrepreneurship', riskTolerance: 'reckless', education: 'bachelors', lifestyle: 'balanced' },
  },
  {
    id: 'sage',
    label: 'The Sage',
    description: 'Balanced and wise. High EQ, resilience, and IQ.',
    stats: { iq: 80, eq: 85, resilience: 80, luck: 55, ambition: 60, social: 75, health: 70 },
    decisions: { career: 'academia', riskTolerance: 'medium', education: 'phd', lifestyle: 'balanced' },
  },
  {
    id: 'artist',
    label: 'The Artist',
    description: 'Creative soul. High EQ and social, riding on talent and luck.',
    stats: { iq: 55, eq: 80, resilience: 50, luck: 65, ambition: 70, social: 80, health: 60 },
    decisions: { career: 'arts', riskTolerance: 'high', education: 'highschool', lifestyle: 'lavish' },
  },
]
