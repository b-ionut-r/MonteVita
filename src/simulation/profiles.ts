import { ageWealthBenchmarks, expenseQuintiles, researchStats } from '../data/research';
import type { SimulatorInputs } from '../types';
import { createRng, randomBetween, randomInt, weightedPick } from '../utils/random';

const roundTo = (value: number, increment: number) => Math.round(value / increment) * increment;

const normalizeAllocation = (stock: number, bond: number, cash: number) => {
  const total = stock + bond + cash;
  return {
    stockAllocation: Math.round((stock / total) * 100),
    bondAllocation: Math.round((bond / total) * 100),
    cashAllocation: Math.max(0, 100 - Math.round((stock / total) * 100) - Math.round((bond / total) * 100))
  };
};

export const defaultInputs: SimulatorInputs = {
  age: 34,
  retirementAge: 65,
  horizonMode: 'age-95',
  annualIncome: 104207,
  annualSpending: 78535,
  currentAssets: 135600,
  monthlyContribution: 1400,
  stockAllocation: 75,
  bondAllocation: 20,
  cashAllocation: 5,
  guaranteedIncome: 30000,
  withdrawalRate: researchStats.morningstarWithdrawalRate2026,
  simulations: researchStats.defaultSimulationCount,
  seed: 'lifepath-2026'
};

export const rollProfile = (seed: string): SimulatorInputs => {
  const rng = createRng(seed);
  const ageBand = ageWealthBenchmarks[randomInt(rng, 0, ageWealthBenchmarks.length - 1)];
  const age = randomInt(rng, ageBand.minAge, Math.min(ageBand.maxAge, 62));
  const spendingBand = weightedPick(rng, expenseQuintiles);
  const savingsRate = randomBetween(rng, 0.08, 0.28);
  const incomeMultiplier = randomBetween(rng, 1.04, 1.42);
  const annualSpending = roundTo(spendingBand.annualSpending * randomBetween(rng, 0.88, 1.12), 500);
  const annualIncome = Math.max(
    annualSpending + 6000,
    roundTo(annualSpending * (1 + savingsRate) * incomeMultiplier, 1000)
  );
  const wealthMix = randomBetween(rng, 0.45, 1.45);
  const currentAssets = Math.max(0, roundTo(ageBand.medianNetWorth * wealthMix, 1000));
  const monthlyContribution = Math.max(0, roundTo((annualIncome - annualSpending) / 12, 50));
  const retirementAge = Math.max(age + 5, randomInt(rng, 60, 70));
  const stockBase = age < 40 ? randomBetween(rng, 72, 88) : age < 55 ? randomBetween(rng, 58, 78) : randomBetween(rng, 42, 66);
  const cashBase = randomBetween(rng, 4, 12);
  const allocation = normalizeAllocation(stockBase, Math.max(5, 100 - stockBase - cashBase), cashBase);

  return {
    ...defaultInputs,
    age,
    retirementAge,
    annualIncome,
    annualSpending,
    currentAssets,
    monthlyContribution,
    guaranteedIncome: roundTo(randomBetween(rng, 18000, 42000), 1000),
    horizonMode: rng() > 0.72 ? 'age-100' : 'age-95',
    seed,
    ...allocation
  };
};

export const nextSeed = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rng = createRng(`${Date.now()}-${Math.random()}`);
  return Array.from({ length: 8 }, () => alphabet[Math.floor(rng() * alphabet.length)]).join('');
};
