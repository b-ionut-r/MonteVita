# LifePath Monte Carlo

A U.S.-focused personal finance Monte Carlo simulator for retirement readiness.

LifePath models thousands of possible portfolio paths using sourced historical market, inflation, spending, income, wealth, and retirement-planning benchmarks. The goal is not to produce a single fake forecast. The app shows probability ranges, failure ages, stress decades, and practical levers so a user can understand how fragile or resilient a plan looks.

> Planning simulation only. This is not financial advice.

## Features

- Monte Carlo retirement simulator with 1,000 to 10,000 in-browser paths.
- Fan chart of projected portfolio value in today's dollars.
- Success probability based on whether the portfolio stays above $0 through the selected planning horizon.
- Median projected portfolio at retirement.
- Required portfolio estimate from the editable withdrawal-rate assumption.
- Ending-balance histogram.
- First-failure age for failed paths.
- Worst historical 10-year real-return stress window.
- Sensitivity levers for retiring later, saving more, spending less, and changing allocation.
- Seeded dice generator for plausible U.S. input profiles.
- Embedded source panel with dates, links, and caveats.
- Frontend-only, offline-capable data snapshot.

## Research Backbone

The app deliberately avoids invented normal-distribution assumptions. Annual market and inflation outcomes are sampled from historical year blocks.

Embedded sources:

- NYU Stern / Aswath Damodaran, historical U.S. returns on stocks, 10-year Treasury bonds, 3-month T-bills, and inflation, 1928-2024.
- FRED CPIAUCSL from the U.S. Bureau of Labor Statistics, latest checked March 2026.
- FRED UNRATE from BLS, latest checked March 2026.
- FRED average hourly earnings from BLS, latest checked March 2026.
- BLS Consumer Expenditure Survey 2024 annual release.
- Federal Reserve 2022 Survey of Consumer Finances.
- SSA 2024 Trustees Report death-probability tables.
- Morningstar 2026 retirement withdrawal-rate research.

Default withdrawal-rate assumption:

- 3.9%, based on Morningstar's 2026 research for a 30-year retirement horizon at a 90% success target.
- The value is editable because safe withdrawal rates are not universal.

## Model Summary

Inputs:

- Current age
- Retirement age
- Planning horizon
- Annual income
- Annual spending
- Invested assets
- Monthly contribution
- Stock, bond, and cash allocation
- Guaranteed retirement income
- Withdrawal-rate target
- Simulation count
- Seed

Accumulation phase:

- The app grows the portfolio using sampled historical stock, bond, and cash returns.
- Contributions are inflation-adjusted so projected values remain internally consistent.

Retirement phase:

- Spending and guaranteed income are inflation-adjusted each simulated year.
- Withdrawals equal retirement spending minus guaranteed income, floored at $0.
- A path fails when the portfolio falls below $0 before the selected horizon.

Reporting:

- Chart values are shown in today's purchasing-power dollars.
- Percentile bands show 10th, 25th, 50th, 75th, and 90th percentiles.
- Required portfolio is calculated as:

```text
max(0, annual spending - guaranteed income) / withdrawal rate
```

## Seeded Dice Generator

The dice generator creates plausible editable profiles from public benchmark ranges:

- Spending levels from BLS Consumer Expenditure Survey quintiles.
- Wealth levels from Federal Reserve SCF age-band net-worth benchmarks.
- Age, retirement age, allocation, guaranteed income, and savings rate from transparent bounded ranges.

The seed is visible and editable. Reusing the same seed reproduces the same generated input profile.

## Limitations

- U.S.-specific v1.
- Taxes are not modeled automatically.
- Social Security is not estimated automatically; enter guaranteed retirement income manually.
- Home equity, children, health events, and long-term care are not modeled in v1.
- Historical returns are not a promise of future returns.
- Mortality tables are included as source context, but v1 uses user-selected planning horizons instead of personal longevity modeling.

## Tech Stack

- React
- TypeScript
- Vite
- Vitest
- Custom SVG charts
- `lucide-react` icons

## Local Development

Install dependencies:

```bash
npm.cmd install
```

Run the app:

```bash
npm.cmd run dev -- --port 5173
```

Open:

```text
http://127.0.0.1:5173/
```

Run tests:

```bash
npm.cmd run test
```

Build for production:

```bash
npm.cmd run build
```

## Validation

Current verification:

- Unit tests for percentile interpolation.
- Unit tests for deterministic seeded profile generation.
- Unit tests for deterministic Monte Carlo output with a fixed seed.
- Unit tests for portfolio depletion detection under impossible spending.
- Production build with TypeScript checking.
- Browser QA at desktop and mobile widths.
- Runtime dependency audit.

## Credit

Vibe coded with Codex.
