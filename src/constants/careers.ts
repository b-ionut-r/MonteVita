import type { CareerPath } from '@/types'

export interface CareerDefinition {
  id: CareerPath
  label: string
  icon: string
  baseSalary: number // annual USD at career level 1
  peakSalary: number // annual USD at career level 10
  volatility: 'low' | 'medium' | 'high' | 'extreme'
  description: string
  salaryRange: string
  growthSpeed: number // 1-10, how fast career levels up
}

export const CAREER_DEFINITIONS: CareerDefinition[] = [
  {
    id: 'tech',
    label: 'Technology',
    icon: '💻',
    baseSalary: 70000,
    peakSalary: 250000,
    volatility: 'medium',
    description: 'Software, engineering, product. Equity events possible.',
    salaryRange: '$70k–$250k+',
    growthSpeed: 7,
  },
  {
    id: 'medicine',
    label: 'Medicine',
    icon: '⚕️',
    baseSalary: 50000,
    peakSalary: 400000,
    volatility: 'low',
    description: 'Long training, then very stable high earnings.',
    salaryRange: '$50k–$400k',
    growthSpeed: 5,
  },
  {
    id: 'arts',
    label: 'Creative Arts',
    icon: '🎨',
    baseSalary: 25000,
    peakSalary: 300000,
    volatility: 'high',
    description: 'High variance. Luck-dependent. Big hits possible.',
    salaryRange: '$25k–$300k',
    growthSpeed: 4,
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: '📈',
    baseSalary: 80000,
    peakSalary: 500000,
    volatility: 'high',
    description: 'High ceiling but exposed to market crashes.',
    salaryRange: '$80k–$500k',
    growthSpeed: 7,
  },
  {
    id: 'trades',
    label: 'Skilled Trades',
    icon: '🔧',
    baseSalary: 55000,
    peakSalary: 120000,
    volatility: 'low',
    description: 'Steady, honest work. Great health outcomes.',
    salaryRange: '$55k–$120k',
    growthSpeed: 6,
  },
  {
    id: 'entrepreneurship',
    label: 'Entrepreneur',
    icon: '🚀',
    baseSalary: 20000,
    peakSalary: 2000000,
    volatility: 'extreme',
    description: 'Feast or famine. Startup exits change everything.',
    salaryRange: '$20k or $2M+',
    growthSpeed: 3,
  },
  {
    id: 'academia',
    label: 'Academia',
    icon: '📚',
    baseSalary: 45000,
    peakSalary: 150000,
    volatility: 'low',
    description: 'Moderate pay, high intellectual fulfillment.',
    salaryRange: '$45k–$150k',
    growthSpeed: 5,
  },
]

export const EDUCATION_MULTIPLIERS: Record<string, number> = {
  dropout: 0.7,
  highschool: 0.85,
  bachelors: 1.0,
  masters: 1.2,
  phd: 1.35,
}

export const RISK_VARIANCE_MULTIPLIERS: Record<string, number> = {
  low: 0.5,
  medium: 1.0,
  high: 1.8,
  reckless: 3.0,
}

export const LIFESTYLE_SAVINGS_RATES: Record<string, number> = {
  frugal: 0.30,
  balanced: 0.15,
  lavish: 0.03,
}
