export interface PersonStats {
  iq: number
  eq: number
  resilience: number
  luck: number
  ambition: number
  social: number
  health: number
}

export type CareerPath =
  | 'tech'
  | 'medicine'
  | 'arts'
  | 'finance'
  | 'trades'
  | 'entrepreneurship'
  | 'academia'

export type RiskTolerance = 'low' | 'medium' | 'high' | 'reckless'
export type EducationLevel = 'dropout' | 'highschool' | 'bachelors' | 'masters' | 'phd'
export type Lifestyle = 'frugal' | 'balanced' | 'lavish'

export interface LifeDecisions {
  career: CareerPath
  riskTolerance: RiskTolerance
  education: EducationLevel
  lifestyle: Lifestyle
}

export interface PresetProfile {
  id: string
  label: string
  description: string
  stats: PersonStats
  decisions: LifeDecisions
}
