import type { MarketYear, ResearchSource } from '../types';

const pct = (value: number) => value / 100;

const MARKET_CSV = `
1928,43.81,3.08,0.84,-1.16
1929,-8.30,3.16,4.20,0.58
1930,-25.12,4.55,4.54,-6.40
1931,-43.84,2.31,-2.56,-9.32
1932,-8.64,1.07,8.79,-10.27
1933,49.98,0.96,1.86,0.76
1934,-1.19,0.28,7.96,1.52
1935,46.74,0.17,4.47,2.99
1936,31.94,0.17,5.02,1.45
1937,-35.34,0.28,1.38,2.86
1938,29.28,0.07,4.21,-2.78
1939,-1.10,0.05,4.41,0.00
1940,-10.67,0.04,5.40,0.71
1941,-12.77,0.13,-2.02,9.93
1942,19.17,0.34,2.29,9.03
1943,25.06,0.38,2.49,2.96
1944,19.03,0.38,2.58,2.30
1945,35.82,0.38,3.80,2.25
1946,-8.43,0.38,3.13,18.13
1947,5.20,0.60,0.92,8.84
1948,5.70,1.05,1.95,2.99
1949,18.30,1.12,4.66,-2.07
1950,30.81,1.20,0.43,5.93
1951,23.68,1.52,-0.30,6.00
1952,18.15,1.72,2.27,0.75
1953,-1.21,1.89,4.14,0.75
1954,52.56,0.94,3.29,-0.74
1955,32.60,1.72,-1.34,0.37
1956,7.44,2.62,-2.26,2.99
1957,-10.46,3.22,6.80,2.90
1958,43.72,1.77,-2.10,1.76
1959,12.06,3.39,-2.65,1.73
1960,0.34,2.87,11.64,1.36
1961,26.64,2.35,2.06,0.67
1962,-8.81,2.77,5.69,1.33
1963,22.61,3.16,1.68,1.64
1964,16.42,3.55,3.73,0.97
1965,12.40,3.95,0.72,1.92
1966,-9.97,4.86,2.91,3.46
1967,23.80,4.29,-1.58,3.04
1968,10.81,5.34,3.27,4.72
1969,-8.24,6.67,-5.01,6.20
1970,3.56,6.39,16.75,5.57
1971,14.22,4.33,9.79,3.27
1972,18.76,4.06,2.82,3.41
1973,-14.31,7.04,3.66,8.71
1974,-25.90,7.85,1.99,12.34
1975,37.00,5.79,3.61,6.94
1976,23.83,4.98,15.98,4.86
1977,-6.98,5.26,1.29,6.70
1978,6.51,7.18,-0.78,9.02
1979,18.52,10.05,0.67,13.29
1980,31.74,11.39,-2.99,12.52
1981,-4.70,14.04,8.20,8.92
1982,20.42,10.60,32.81,3.83
1983,22.34,8.62,3.20,3.79
1984,6.15,9.54,13.73,3.95
1985,31.24,7.47,25.71,3.80
1986,18.49,5.97,24.28,1.10
1987,5.81,5.78,-4.96,4.43
1988,16.54,6.67,8.22,4.42
1989,31.48,8.11,17.69,4.65
1990,-3.06,7.50,6.24,6.11
1991,30.23,5.38,15.00,3.06
1992,7.49,3.43,9.36,2.90
1993,9.97,3.00,14.21,2.75
1994,1.33,4.25,-8.04,2.67
1995,37.20,5.49,23.48,2.54
1996,22.68,5.01,1.43,3.32
1997,33.10,5.06,9.94,1.70
1998,28.34,4.78,14.92,1.61
1999,20.89,4.64,-8.25,2.68
2000,-9.03,5.82,16.66,3.39
2001,-11.85,3.40,5.57,1.55
2002,-21.97,1.61,15.12,2.38
2003,28.36,1.01,0.38,1.88
2004,10.74,1.37,4.49,3.26
2005,4.83,3.15,2.87,3.42
2006,15.61,4.73,1.96,2.54
2007,5.48,4.36,10.21,4.08
2008,-36.55,1.37,20.10,0.09
2009,25.94,0.15,-11.12,2.72
2010,14.82,0.14,8.46,1.50
2011,2.10,0.05,16.04,2.96
2012,15.89,0.09,2.97,1.74
2013,32.15,0.06,-9.10,1.50
2014,13.52,0.03,10.75,0.76
2015,1.38,0.05,1.28,0.73
2016,11.77,0.32,0.69,2.07
2017,21.61,0.93,2.80,2.11
2018,-4.23,1.94,-0.02,1.91
2019,31.21,2.06,9.64,2.29
2020,18.02,0.35,11.33,1.36
2021,28.47,0.05,-4.42,7.04
2022,-18.04,2.02,-17.83,6.45
2023,26.06,5.07,3.88,3.35
2024,24.88,4.97,-1.64,2.75
`;

export const marketHistory: MarketYear[] = MARKET_CSV.trim()
  .split('\n')
  .map((row) => {
    const [year, stock, cash, bond, inflation] = row.split(',').map(Number);
    return {
      year,
      stock: pct(stock),
      cash: pct(cash),
      bond: pct(bond),
      inflation: pct(inflation)
    };
  });

export const expenseQuintiles = [
  { label: 'Lowest quintile', annualSpending: 35046, weight: 0.18 },
  { label: 'Second quintile', annualSpending: 50054, weight: 0.2 },
  { label: 'Middle quintile', annualSpending: 66900, weight: 0.24 },
  { label: 'Fourth quintile', annualSpending: 89972, weight: 0.22 },
  { label: 'Highest quintile', annualSpending: 150342, weight: 0.16 }
];

export const ageWealthBenchmarks = [
  { minAge: 25, maxAge: 34, medianNetWorth: 39000, averageNetWorth: 183500 },
  { minAge: 35, maxAge: 44, medianNetWorth: 135600, averageNetWorth: 549600 },
  { minAge: 45, maxAge: 54, medianNetWorth: 247200, averageNetWorth: 975800 },
  { minAge: 55, maxAge: 64, medianNetWorth: 364500, averageNetWorth: 1566900 },
  { minAge: 65, maxAge: 74, medianNetWorth: 409900, averageNetWorth: 1794600 }
];

export const researchStats = {
  blsAverageIncomeBeforeTaxes2024: 104207,
  blsAverageAnnualExpenditures2024: 78535,
  fredCpiLatest: 'Mar 2026: 330.293',
  fredUnemploymentLatest: 'Mar 2026: 4.3%',
  fredHourlyEarningsLatest: 'Mar 2026: $37.38/hour',
  morningstarWithdrawalRate2026: 0.039,
  defaultSimulationCount: 6000
};

export const researchSources: ResearchSource[] = [
  {
    name: 'NYU Stern Damodaran historical returns',
    date: '1928-2024 data, January 2026 page',
    url: 'https://pages.stern.nyu.edu/adamodar/New_Home_Page/datafile/histretSP.htm',
    note: 'Annual U.S. stock, 10-year Treasury bond, 3-month T-bill, and inflation observations used for bootstrap sampling.'
  },
  {
    name: 'FRED CPIAUCSL from BLS',
    date: 'Latest checked: March 2026',
    url: 'https://fred.stlouisfed.org/series/CPIAUCSL',
    note: 'CPI context and inflation source metadata; historical annual inflation is embedded from the Damodaran table.'
  },
  {
    name: 'FRED UNRATE from BLS',
    date: 'Latest checked: March 2026',
    url: 'https://fred.stlouisfed.org/series/UNRATE',
    note: 'Labor-market context for profile generation and caveats.'
  },
  {
    name: 'FRED average hourly earnings from BLS',
    date: 'Latest checked: March 2026',
    url: 'https://fred.stlouisfed.org/series/CES0500000003',
    note: 'Wage context; the app does not forecast individual raises.'
  },
  {
    name: 'BLS Consumer Expenditure Survey',
    date: '2024 annual release, published Dec. 19, 2025',
    url: 'https://www.bls.gov/news.release/cesan.htm',
    note: 'Average income, average spending, and spending quintile values used for the dice generator.'
  },
  {
    name: 'Federal Reserve Survey of Consumer Finances',
    date: '2022 survey, most recent SCF',
    url: 'https://www.federalreserve.gov/econres/scfindex.htm',
    note: 'Household wealth context; dice uses public SCF age-band wealth benchmarks.'
  },
  {
    name: 'SSA death probabilities',
    date: '2024 Trustees Report tables',
    url: 'https://www.ssa.gov/OACT/HistEst/Death/2024/DeathProbabilities2024.html',
    note: 'Longevity context. V1 lets users choose a planning horizon rather than estimating personalized mortality.'
  },
  {
    name: 'Morningstar retirement withdrawal research',
    date: '2026 withdrawal-rate research',
    url: 'https://www.morningstar.com/retirement/whats-safe-retirement-withdrawal-rate-2026',
    note: 'Default 3.9% starting withdrawal-rate benchmark for a 30-year horizon at 90% success; editable in the app.'
  }
];
