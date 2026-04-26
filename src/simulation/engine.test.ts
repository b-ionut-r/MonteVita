import { describe, expect, it } from 'vitest';
import { defaultInputs, rollProfile } from './profiles';
import { percentile, runSimulation } from './engine';

describe('percentile', () => {
  it('interpolates sorted values', () => {
    expect(percentile([10, 0, 20, 30], 0.5)).toBe(15);
    expect(percentile([0, 100], 0.25)).toBe(25);
  });
});

describe('rollProfile', () => {
  it('is deterministic for a given seed', () => {
    expect(rollProfile('TEST2026')).toEqual(rollProfile('TEST2026'));
  });

  it('changes profile values when the seed changes', () => {
    expect(rollProfile('TEST2026')).not.toEqual(rollProfile('TEST2027'));
  });
});

describe('runSimulation', () => {
  it('returns deterministic Monte Carlo summaries for a fixed seed', () => {
    const resultA = runSimulation({ ...defaultInputs, simulations: 1200, seed: 'stable' });
    const resultB = runSimulation({ ...defaultInputs, simulations: 1200, seed: 'stable' });
    expect(resultA.successProbability).toBe(resultB.successProbability);
    expect(resultA.portfolioAtRetirementMedian).toBe(resultB.portfolioAtRetirementMedian);
  });

  it('detects depletion under impossible spending', () => {
    const result = runSimulation({
      ...defaultInputs,
      age: 65,
      retirementAge: 66,
      currentAssets: 10000,
      annualSpending: 180000,
      guaranteedIncome: 0,
      monthlyContribution: 0,
      simulations: 1200,
      seed: 'deplete'
    });
    expect(result.successProbability).toBeLessThan(0.1);
    expect(result.firstFailureAgeMedian).not.toBeNull();
  });
});
