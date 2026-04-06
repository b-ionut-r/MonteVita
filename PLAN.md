# Human Life Monte Carlo Simulator — Web App

## Context
Build a beautiful, useful web app where users design a person with personality/brain stats, run 10,000 Monte Carlo simulations of their life, and see animated visualizations of outcome distributions. The goal is to make Monte Carlo simulation approachable and visually stunning — a real thinking tool wrapped in a game-like UI.

---

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

---

## Project Structure

```
D:\MonteCarlo\
├── index.html
├── package.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts
└── src\
    ├── main.tsx / App.tsx / index.css
    ├── types\          index.ts, person.ts, simulation.ts, charts.ts
    ├── constants\      stats.ts, careers.ts, events.ts, simulation.ts
    ├── engine\
    │   ├── rng.ts              xoshiro128++ PRNG
    │   ├── statModifiers.ts    stats → probability adjustments
    │   ├── lifeStages.ts       6 stages, per-tick passive updates
    │   ├── eventSystem.ts      ~60 events, weighted selector
    │   ├── outcomeCalculator.ts percentiles, histograms, composite score
    │   ├── index.ts            runSimulation() public API
    │   └── worker.ts           Web Worker wrapper
    ├── store\
    │   ├── useSimulatorStore.ts  root store
    │   └── slices\  personSlice.ts, simulationSlice.ts, uiSlice.ts
    ├── hooks\
    │   ├── useSimulation.ts    worker lifecycle, progress dispatch
    │   ├── useAnimatedValue.ts spring-animated number
    │   └── useChartData.ts     derives chart-ready data from store
    └── components\
        ├── layout\     AppShell, Sidebar, MainPanel
        ├── person-builder\  PersonBuilder, StatSlider(Group), PersonAvatar,
        │                    DecisionPanel, CareerPicker, RiskPicker,
        │                    EducationPicker, LifestylePicker
        ├── simulation\  RunButton, SimProgress, SimSummary
        ├── results\     ResultsPanel, OutcomeTabs, DistributionChart,
        │                LifePathChart, EventHeatmap, OutcomeCard(s),
        │                PercentileBar, CompareOverlay
        ├── ui\          GlassCard, GlowSlider, AnimatedNumber, Badge,
        │                Tooltip, ProgressRing, ParticleField
        └── intro\       HeroSection, IntroAnimation
```

---

## Simulation Engine Design

### Person Input
```typescript
interface PersonStats {
  iq: number; eq: number; resilience: number; luck: number;
  ambition: number; social: number; health: number; // all 1–100
}
interface LifeDecisions {
  career: 'tech'|'medicine'|'arts'|'finance'|'trades'|'entrepreneurship'|'academia';
  riskTolerance: 'low'|'medium'|'high'|'reckless';
  education: 'dropout'|'highschool'|'bachelors'|'masters'|'phd';
  lifestyle: 'frugal'|'balanced'|'lavish';
}
```

### Life Stages (6 stages, each has N ticks = ~6 months)
- Stage 0: Early Career (ages 22–30, 16 ticks)
- Stage 1: Establishment (30–40, 20 ticks)
- Stage 2: Peak Years (40–55, 30 ticks)
- Stage 3: Pre-Retirement (55–65, 20 ticks)
- Stage 4: Retirement (65–80, 30 ticks)
- Stage 5: Late Life (80–90, 20 ticks)

Each tick: apply passive growth → roll for events → apply consequences → clamp values.

### Stat Modifiers (examples)
- IQ → income growth +0.3%/10pts, promotion chance +0.4%/10pts
- EQ → relationship +0.2/10pts, divorce chance -0.3%/10pts, happiness baseline +0.3/10pts
- Resilience → reduces negative event impact by 5%/10pts, lowers burnout chance
- Luck → flat random bonus (N(0, luck/10)) on all positive events, windfall chance +0.3%/10pts
- Ambition → career advancement +0.5 levels/stage/10pts; high Ambition + low EQ → burnout risk
- Social → network career boosts, isolation event -rate, happiness from relationships
- Health → health baseline, medical event -rate, wealth drain from illness

### Career Salary Curves (base → peak)
- tech: $70k → $250k (equity lottery events)
- medicine: $50k → $400k (long training, stable)
- arts: $25k → bimodal (high luck dependency)
- finance: $80k → $500k (volatile, crash events)
- trades: $55k → $120k (stable, great health outcomes)
- entrepreneurship: $20k or $2M exits (most bimodal)
- academia: $45k → $150k (high happiness if high IQ)

### Event System (~60 events)
Positive: windfall_inheritance, career_breakthrough, perfect_partnership, startup_exit, wise_investment, mentor_found, health_transformation

Negative: medical_emergency, divorce, layoff, market_crash, burnout, addiction_spiral, legal_trouble

Neutral/Life: marriage, child_born, relocation, career_pivot

Selection: `P(event) = base_rate × stat_modifier_product × stage_multiplier`

### Outcome Aggregation
```typescript
successScore = 0.30×(wealth_percentile) + 0.30×(avgHappiness/100)
             + 0.20×(avgHealth/100) + 0.20×(peakCareerLevel/10)
```
Distributions computed: p5, p10, p25, median, p75, p90, p95, mean, stddev + 50-bin histogram.

### Web Worker
- `useSimulation` hook creates worker: `new Worker(new URL('../engine/worker.ts', import.meta.url), { type: 'module' })`
- Worker posts `{ type: 'progress', pct }` every 500 runs
- Worker posts `{ type: 'result', data: SimulationResults }` when done
- Terminated in `useEffect` cleanup

---

## State Management (Zustand)

**personSlice:** `stats`, `decisions`, `setStats()`, `setDecisions()`, `resetToDefaults()`

**simulationSlice:** `status` (idle/running/complete/error), `progress`, `results`, `previousResults` (for compare), `startSimulation()`, `setResults()`, `updateProgress()`

**uiSlice:** `activeOutcomeTab`, `activeMetric`, `hasSimulated`, `compareVisible`

**Key rule:** Never subscribe to whole store. Use granular selectors: `useSimulatorStore(s => s.stats.iq)`.

---

## Visual Design

### Colors
```css
--bg-base: #050810;          /* near-black deep blue */
--bg-surface: #0D1117;

/* Stat colors */
--color-iq: #60A5FA;         /* electric blue */
--color-eq: #FBBF24;         /* warm gold */
--color-resilience: #34D399; /* emerald */
--color-luck: #A78BFA;       /* purple */
--color-ambition: #FB923C;   /* orange */
--color-social: #F472B6;     /* pink */
--color-health: #2DD4BF;     /* teal */

/* Outcome colors */
--color-wealth: #34D399;     /* green */
--color-happiness: #FBBF24;  /* gold */
--color-health-out: #60A5FA; /* blue */
--color-success: #A78BFA;    /* purple */
```

### Typography
- Body: Inter (300–700)
- Numbers: JetBrains Mono (monospaced stat readability)
- Load via Google Fonts in index.html

### Glassmorphism
```css
background: rgba(255,255,255,0.04);
backdrop-filter: blur(16px) saturate(180%);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 16px;
```

### Layout
```
┌─────────────────────────────────────────────────────┐
│                   ParticleField (bg)                │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │    SIDEBAR      │  │      MAIN PANEL           │  │
│  │   (420px fixed) │  │   (flex-1, scrollable)   │  │
│  │  PersonAvatar   │  │  HeroSection / Results   │  │
│  │  7x StatSlider  │  │  SimSummary              │  │
│  │  DecisionPanel  │  │  OutcomeCards (4-col)    │  │
│  │  [RunButton]    │  │  OutcomeTabs + Charts    │  │
│  └─────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Animation Patterns
- **Entrance:** `initial={{ opacity:0, y:20 }}` → `animate={{ opacity:1, y:0 }}`, staggerChildren: 0.08
- **Tab switch:** `layoutId="tab-indicator"` sliding underline + AnimatePresence mode="wait" crossfade
- **Charts:** DistributionChart bars: scaleY from 0 with transformOrigin:"bottom"; LifePathChart lines: stroke-dashoffset animation over 1.5s, staggered 20ms
- **Numbers:** useSpring (stiffness:80, damping:20), animate between old and new values
- **RunButton idle:** keyframe box-shadow pulse cycling gradient colors, 3s infinite
- **CompareOverlay:** slides in from bottom-right, shrinking timer bar, auto-dismiss 8s

### Preset Profiles
Add quick-fill buttons: "The Grinder", "The Lucky One", "The Sage", "The Artist"

---

## Implementation Order

### Phase 1: Foundation
1. `npm create vite@latest . -- --template react-ts`
2. Install all dependencies
3. Tailwind 4 config in vite.config.ts
4. Path aliases (`@/` → `src/`) in tsconfig
5. `src/index.css` with CSS variables, font imports, scrollbar styling
6. All `types/` files and `constants/` files
7. Zustand store skeleton (shapes, no logic yet)

### Phase 2: Simulation Engine
1. `engine/rng.ts` — xoshiro128++
2. `engine/statModifiers.ts` — pure stat → probability functions
3. `engine/lifeStages.ts` — stage definitions + per-tick logic
4. `engine/eventSystem.ts` — ~60 events + weighted selector
5. `engine/outcomeCalculator.ts` — percentiles + histograms
6. `engine/index.ts` — `runSimulation()` ties it together
7. `engine/worker.ts` — Web Worker message handler
8. **Verify in browser console before any UI work**

### Phase 3: UI Shell
1. GlassCard, GlowSlider, AnimatedNumber, ParticleField (canvas)
2. AppShell (layout) → Sidebar + MainPanel
3. App.tsx connects store

### Phase 4: Person Builder (sidebar)
1. StatSlider (with per-stat glow color)
2. StatSliderGroup (7 sliders + small radar preview)
3. PersonAvatar (SVG morphing with stats)
4. CareerPicker (7 cards grid), RiskPicker, EducationPicker, LifestylePicker
5. DecisionPanel + PersonBuilder orchestrator
6. RunButton (idle pulse / running spinner / re-run states)

### Phase 5: Simulation Integration
1. `useSimulation` hook — worker lifecycle + progress dispatch
2. SimProgress (animated bar), SimSummary (AnimatedNumber strip)
3. Wire RunButton → hook → store

### Phase 6: Results Visualizations (most time here)
1. OutcomeCard + OutcomeCards (4-col grid)
2. DistributionChart — Recharts histogram + ghost overlay for compare
3. PercentileBar — horizontal percentile band
4. OutcomeTabs — sliding tab indicator
5. **LifePathChart — D3 spaghetti (hardest; budget 4+ hours)**
   - D3 scales for x(age), y(metric)
   - d3.line() paths, colored by outcome decile
   - stroke-dasharray animation, 100 paths in single SVG
   - Bold white median path drawn last
6. EventHeatmap — frequency bars colored by event type
7. ResultsPanel — wires tabs + all charts
8. `useChartData` hook — derives render-ready data

### Phase 7: Polish
1. CompareOverlay (delta badges after re-run)
2. HeroSection + IntroAnimation (entrance before first run)
3. Remaining UI primitives: Tooltip, Badge, ProgressRing
4. Stagger all animation timings, tune springs
5. AnimatePresence wrappers on all transitions
6. Accessibility: aria-labels, keyboard nav
7. React.StrictMode performance check

### Phase 8: Tuning & Presets
1. Validate simulation feel with stat profiles:
   - High IQ + High Ambition + Low EQ → high wealth, lower happiness
   - High Luck → wide variance, high upside
   - Entrepreneurship + High Risk → extreme bimodal wealth
   - High Health → longevity and happiness advantage
2. Hover states, focus rings, micro-interactions
3. Preset buttons: "The Grinder", "The Lucky One", "The Sage", "The Artist"
4. Responsive check down to 1280px

---

## Critical Files
- `src/engine/index.ts` — all simulation realism flows from here
- `src/engine/eventSystem.ts` — what makes each life feel unique
- `src/store/useSimulatorStore.ts` — must be right before any component
- `src/components/results/LifePathChart.tsx` — crown jewel visualization
- `src/engine/worker.ts` — simulation perf and UI thread responsiveness

---

## Verification
1. Open browser console after Phase 2, run `runSimulation(defaultStats, defaultDecisions, 1000)` — verify distributions look realistic
2. After Phase 5, click Run → confirm progress bar fills → results appear in store
3. After Phase 6, verify all 4 outcome tabs render correct charts
4. After Phase 8, run "The Grinder" preset and "The Lucky One" preset — outcome distributions should feel meaningfully different
5. Check Network tab: Web Worker should be created once, not per re-run
6. Lighthouse performance score target: 90+ (the particle canvas and D3 chart are the main risks)
