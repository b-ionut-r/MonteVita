import { marketHistory } from '../data/research';
import type {
  MarketYear,
  PercentilePoint,
  SensitivityResult,
  SimulationResult,
  SimulatorInputs,
  WorstDecadeResult
} from '../types';
import { createRng } from '../utils/random';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const horizonAgeFor = (mode: SimulatorInputs['horizonMode']) => {
  if (mode === 'age-100') return 100;
  if (mode === 'age-105') return 105;
  return 95;
};

export const normalizedInputs = (inputs: SimulatorInputs): SimulatorInputs => {
  const stockAllocation = clamp(inputs.stockAllocation, 0, 100);
  const bondAllocation = clamp(inputs.bondAllocation, 0, 100);
  const cashAllocation = clamp(inputs.cashAllocation, 0, 100);
  const total = stockAllocation + bondAllocation + cashAllocation || 1;
  return {
    ...inputs,
    age: clamp(Math.round(inputs.age), 18, 85),
    retirementAge: clamp(Math.round(inputs.retirementAge), Math.round(inputs.age) + 1, 85),
    annualIncome: Math.max(0, inputs.annualIncome),
    annualSpending: Math.max(0, inputs.annualSpending),
    currentAssets: Math.max(0, inputs.currentAssets),
    monthlyContribution: Math.max(0, inputs.monthlyContribution),
    guaranteedIncome: Math.max(0, inputs.guaranteedIncome),
    withdrawalRate: clamp(inputs.withdrawalRate, 0.01, 0.08),
    simulations: clamp(Math.round(inputs.simulations), 1000, 10000),
    stockAllocation: stockAllocation / total,
    bondAllocation: bondAllocation / total,
    cashAllocation: cashAllocation / total
  };
};

export const percentile = (values: number[], target: number) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * target;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
};

const portfolioReturnFor = (inputs: SimulatorInputs, year: MarketYear) =>
  inputs.stockAllocation * year.stock + inputs.bondAllocation * year.bond + inputs.cashAllocation * year.cash;

const sampleYear = (rng: () => number) => marketHistory[Math.floor(rng() * marketHistory.length)];

type PathResult = {
  balances: number[];
  retirementBalance: number;
  endingBalance: number;
  failedAge: number | null;
};

const runOnePath = (inputs: SimulatorInputs, rng: () => number): PathResult => {
  const horizonAge = horizonAgeFor(inputs.horizonMode);
  const annualContribution = inputs.monthlyContribution * 12;
  const balances: number[] = [];
  let assets = inputs.currentAssets;
  let cumulativeInflation = 1;
  let failedAge: number | null = null;
  let retirementBalance = inputs.currentAssets;

  for (let age = inputs.age; age <= horizonAge; age += 1) {
    const marketYear = sampleYear(rng);
    const marketReturn = portfolioReturnFor(inputs, marketYear);

    if (age > inputs.age) {
      cumulativeInflation *= 1 + marketYear.inflation;
    }

    if (age < inputs.retirementAge) {
      assets = Math.max(0, assets * (1 + marketReturn) + annualContribution * cumulativeInflation);
    } else {
      if (age === inputs.retirementAge) {
        retirementBalance = assets / cumulativeInflation;
      }
      const retirementSpending = inputs.annualSpending * cumulativeInflation;
      const guaranteedIncome = inputs.guaranteedIncome * cumulativeInflation;
      const withdrawal = Math.max(0, retirementSpending - guaranteedIncome);
      assets = assets * (1 + marketReturn) - withdrawal;
      if (assets < 0 && failedAge === null) {
        failedAge = age;
      }
      assets = Math.max(0, assets);
    }

    balances.push(assets / cumulativeInflation);
  }

  return {
    balances,
    retirementBalance,
    endingBalance: balances[balances.length - 1],
    failedAge
  };
};

const summarizePaths = (inputs: SimulatorInputs, paths: PathResult[]) => {
  const horizonAge = horizonAgeFor(inputs.horizonMode);
  const percentileSeries: PercentilePoint[] = [];
  const ages = Array.from({ length: horizonAge - inputs.age + 1 }, (_, index) => inputs.age + index);

  ages.forEach((age, index) => {
    const values = paths.map((path) => path.balances[index]);
    percentileSeries.push({
      age,
      p10: percentile(values, 0.1),
      p25: percentile(values, 0.25),
      p50: percentile(values, 0.5),
      p75: percentile(values, 0.75),
      p90: percentile(values, 0.9)
    });
  });

  return percentileSeries;
};

const projectMedianToRetirement = (inputs: SimulatorInputs) => {
  let assets = inputs.currentAssets;
  const annualContribution = inputs.monthlyContribution * 12;
  const medianReturn = percentile(marketHistory.map((year) => portfolioReturnFor(inputs, year)), 0.5);
  const medianInflation = percentile(marketHistory.map((year) => year.inflation), 0.5);
  let inflationFactor = 1;
  for (let age = inputs.age; age < inputs.retirementAge; age += 1) {
    if (age > inputs.age) inflationFactor *= 1 + medianInflation;
    assets = assets * (1 + medianReturn) + annualContribution * inflationFactor;
  }
  return Math.max(0, assets / inflationFactor);
};

export const calculateWorstDecade = (inputs: SimulatorInputs, startingBalance: number): WorstDecadeResult => {
  let worst: WorstDecadeResult = {
    startYear: marketHistory[0].year,
    endYear: marketHistory[9].year,
    realReturn: Number.POSITIVE_INFINITY,
    endingBalance: startingBalance
  };

  for (let index = 0; index <= marketHistory.length - 10; index += 1) {
    const window = marketHistory.slice(index, index + 10);
    const realReturn = window.reduce((value, year) => {
      const nominal = portfolioReturnFor(inputs, year);
      return value * ((1 + nominal) / (1 + year.inflation));
    }, 1) - 1;

    if (realReturn < worst.realReturn) {
      let balance = startingBalance;
      const annualGap = Math.max(0, inputs.annualSpending - inputs.guaranteedIncome);
      for (const year of window) {
        const realPortfolioReturn = (1 + portfolioReturnFor(inputs, year)) / (1 + year.inflation) - 1;
        balance = Math.max(0, balance * (1 + realPortfolioReturn) - annualGap);
      }
      worst = {
        startYear: window[0].year,
        endYear: window[window.length - 1].year,
        realReturn,
        endingBalance: balance
      };
    }
  }

  return worst;
};

const runBaseSimulation = (rawInputs: SimulatorInputs, simulationCount?: number) => {
  const inputs = normalizedInputs({
    ...rawInputs,
    simulations: simulationCount ?? rawInputs.simulations
  });
  const rng = createRng(inputs.seed);
  const paths = Array.from({ length: inputs.simulations }, () => runOnePath(inputs, rng));
  const successes = paths.filter((path) => path.failedAge === null).length;
  const retirementBalances = paths.map((path) => path.retirementBalance);
  const endingBalances = paths.map((path) => path.endingBalance);
  const depletionAges = paths.flatMap((path) => (path.failedAge === null ? [] : [path.failedAge]));
  const annualGap = Math.max(0, inputs.annualSpending - inputs.guaranteedIncome);
  const requiredPortfolio = annualGap / inputs.withdrawalRate;

  return {
    inputs,
    paths,
    successProbability: successes / paths.length,
    portfolioAtRetirementMedian: percentile(retirementBalances, 0.5),
    requiredPortfolio,
    firstFailureAgeMedian: depletionAges.length ? percentile(depletionAges, 0.5) : null,
    percentileSeries: summarizePaths(inputs, paths),
    endingBalances,
    depletionAges
  };
};

export const runSimulation = (rawInputs: SimulatorInputs): SimulationResult => {
  const base = runBaseSimulation(rawInputs);
  const stressStartingBalance = rawInputs.age >= rawInputs.retirementAge
    ? normalizedInputs(rawInputs).currentAssets
    : projectMedianToRetirement(base.inputs);
  const variants: Array<{ label: string; inputs: SimulatorInputs }> = [
    {
      label: 'Retire 2 years later',
      inputs: { ...rawInputs, retirementAge: rawInputs.retirementAge + 2, seed: `${rawInputs.seed}-later` }
    },
    {
      label: 'Save $250 more/mo',
      inputs: { ...rawInputs, monthlyContribution: rawInputs.monthlyContribution + 250, seed: `${rawInputs.seed}-save` }
    },
    {
      label: 'Spend 5% less',
      inputs: { ...rawInputs, annualSpending: rawInputs.annualSpending * 0.95, seed: `${rawInputs.seed}-spend` }
    },
    {
      label: rawInputs.stockAllocation < 75 ? 'Add 10 pts stocks' : 'Shift to 60/35/5',
      inputs: rawInputs.stockAllocation < 75
        ? {
            ...rawInputs,
            stockAllocation: Math.min(95, rawInputs.stockAllocation + 10),
            bondAllocation: Math.max(0, rawInputs.bondAllocation - 10),
            seed: `${rawInputs.seed}-alloc`
          }
        : {
            ...rawInputs,
            stockAllocation: 60,
            bondAllocation: 35,
            cashAllocation: 5,
            seed: `${rawInputs.seed}-alloc`
          }
    }
  ];

  const sensitivity: SensitivityResult[] = variants
    .map((variant) => {
      const result = runBaseSimulation(variant.inputs, 1800);
      return {
        label: variant.label,
        probability: result.successProbability,
        delta: result.successProbability - base.successProbability
      };
    })
    .sort((a, b) => b.delta - a.delta);

  return {
    successProbability: base.successProbability,
    portfolioAtRetirementMedian: base.portfolioAtRetirementMedian,
    requiredPortfolio: base.requiredPortfolio,
    firstFailureAgeMedian: base.firstFailureAgeMedian,
    percentileSeries: base.percentileSeries,
    endingBalances: base.endingBalances,
    depletionAges: base.depletionAges,
    worstDecade: calculateWorstDecade(base.inputs, stressStartingBalance),
    sensitivity
  };
};
