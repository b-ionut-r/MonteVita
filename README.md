# Life Simulator — Monte Carlo

A beautiful, scientifically-calibrated web app that runs 10,000 Monte Carlo simulations of a human life. Design a person with unique personality traits and decisions, then see the full probability distribution of their possible futures.

![Life Simulator](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript) ![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite)

## Features

- **10,000 simulated lives** per run, powered by a Web Worker (non-blocking UI)
- **7 personality stats**: Intelligence, Emotional IQ, Resilience, Luck, Ambition, Social, Health
- **7 career paths** with realistic salary curves (tech, medicine, arts, finance, trades, entrepreneurship, academia)
- **~40 life events** across 6 life stages (ages 22–90)
- **3 result views**: wealth/happiness/health/success distribution histograms, D3 spaghetti life-path chart, event frequency heatmap
- **Compare overlay**: re-run after changing traits to see delta badges
- **4 preset profiles**: The Grinder, The Lucky One, The Sage, The Artist
- Scientifically calibrated against: Zagorsky (2007) IQ-earnings, Harvard Study of Adult Development (EQ-happiness), Côté & Miners (2006), CDC life expectancy data

## Tech Stack

| Layer | Choice |
|---|---|
| UI Framework | React 19 + TypeScript + Vite 6 |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Animation | Framer Motion 12 |
| Charts | Recharts 2 (histograms) + D3 v7 (spaghetti paths) |
| State | Zustand 5 + Immer 10 |
| Perf | Web Worker (simulation off main thread) |
| PRNG | xoshiro128++ (fast, quality 32-bit) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Simulation Design

Each run simulates a life across 6 stages (~136 ticks of ~6 months each):

1. **Early Career** (22–30)
2. **Establishment** (30–40)
3. **Peak Years** (40–55)
4. **Pre-Retirement** (55–65)
5. **Retirement** (65–80)
6. **Late Life** (80–90)

Per tick: passive income + investment compounding → health decay → happiness update → career progression → random life event roll.

### Scientific Calibration

Key stat→outcome mappings validated against research:

| Stat | Primary Outcome | Research Basis |
|------|----------------|----------------|
| IQ | Wealth (2.5–4× ratio IQ90 vs IQ10) | Zagorsky 2007 |
| EQ | Happiness (1.3–1.8× ratio) | Harvard Study of Adult Development |
| EQ | Minimal wealth effect | Côté & Miners 2006 |
| Health | Life expectancy (+7 years per SD) | CDC NHIS data |
| Social | Happiness + career networks | Multiple meta-analyses |

## Build

```bash
npm run build
```

Output in `dist/`.
