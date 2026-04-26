export type HorizonMode = 'age-95' | 'age-100' | 'age-105';

export type SimulatorInputs = {
  age: number;
  retirementAge: number;
  horizonMode: HorizonMode;
  annualIncome: number;
  annualSpending: number;
  currentAssets: number;
  monthlyContribution: number;
  stockAllocation: number;
  bondAllocation: number;
  cashAllocation: number;
  guaranteedIncome: number;
  withdrawalRate: number;
  simulations: number;
  seed: string;
};

export type MarketYear = {
  year: number;
  stock: number;
  bond: number;
  cash: number;
  inflation: number;
};

export type PercentilePoint = {
  age: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
};

export type SensitivityResult = {
  label: string;
  probability: number;
  delta: number;
};

export type WorstDecadeResult = {
  startYear: number;
  endYear: number;
  realReturn: number;
  endingBalance: number;
};

export type SimulationResult = {
  successProbability: number;
  portfolioAtRetirementMedian: number;
  requiredPortfolio: number;
  firstFailureAgeMedian: number | null;
  percentileSeries: PercentilePoint[];
  endingBalances: number[];
  depletionAges: number[];
  worstDecade: WorstDecadeResult;
  sensitivity: SensitivityResult[];
};

export type ResearchSource = {
  name: string;
  date: string;
  url: string;
  note: string;
};
