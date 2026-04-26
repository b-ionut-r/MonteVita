import { useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarClock,
  Dice5,
  Landmark,
  LineChart,
  RefreshCcw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { researchSources, researchStats } from './data/research';
import { horizonAgeFor, percentile, runSimulation } from './simulation/engine';
import { defaultInputs, nextSeed, rollProfile } from './simulation/profiles';
import type { PercentilePoint, SimulationResult, SimulatorInputs } from './types';
import { currency, percent } from './utils/format';

const updateNumber = (
  setter: (next: SimulatorInputs) => void,
  inputs: SimulatorInputs,
  key: keyof SimulatorInputs,
  value: string
) => {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    setter({ ...inputs, [key]: parsed });
  }
};

const Control = ({
  label,
  value,
  min,
  max,
  step,
  prefix,
  suffix,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: string) => void;
}) => (
  <label className="control">
    <span className="control-label">{label}</span>
    <div className="control-row">
      <span className="affix">{prefix}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isInteger(value) ? value : Number(value.toFixed(3))}
        onChange={(event) => onChange(event.target.value)}
      />
      <span className="affix">{suffix}</span>
    </div>
    <input
      className="range"
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);

const ProbabilityGauge = ({ probability }: { probability: number }) => {
  const color = probability >= 0.8 ? '#177e5d' : probability >= 0.6 ? '#b97900' : '#b3342f';
  return (
    <div className="gauge-card">
      <div
        className="gauge"
        style={{ background: `conic-gradient(${color} ${probability * 360}deg, #dfe6e4 0deg)` }}
      >
        <div className="gauge-core">
          <span>{percent(probability)}</span>
          <small>success odds</small>
        </div>
      </div>
    </div>
  );
};

const makeLinePath = (
  points: PercentilePoint[],
  pick: keyof Omit<PercentilePoint, 'age'>,
  xFor: (age: number) => number,
  yFor: (value: number) => number
) => points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(point.age)} ${yFor(point[pick])}`).join(' ');

const makeBandPath = (
  points: PercentilePoint[],
  top: keyof Omit<PercentilePoint, 'age'>,
  bottom: keyof Omit<PercentilePoint, 'age'>,
  xFor: (age: number) => number,
  yFor: (value: number) => number
) => {
  const upper = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(point.age)} ${yFor(point[top])}`).join(' ');
  const lower = [...points]
    .reverse()
    .map((point) => `L ${xFor(point.age)} ${yFor(point[bottom])}`)
    .join(' ');
  return `${upper} ${lower} Z`;
};

const FanChart = ({
  data,
  retirementAge,
  requiredPortfolio
}: {
  data: PercentilePoint[];
  retirementAge: number;
  requiredPortfolio: number;
}) => {
  const width = 820;
  const height = 390;
  const pad = { top: 24, right: 30, bottom: 44, left: 68 };
  const maxValue = Math.max(requiredPortfolio, ...data.map((point) => point.p90), 100000);
  const minAge = data[0]?.age ?? 0;
  const maxAge = data[data.length - 1]?.age ?? 1;
  const xFor = (age: number) => pad.left + ((age - minAge) / (maxAge - minAge || 1)) * (width - pad.left - pad.right);
  const yFor = (value: number) => height - pad.bottom - (Math.max(0, value) / maxValue) * (height - pad.top - pad.bottom);
  const yRequired = yFor(requiredPortfolio);

  return (
    <svg className="fan-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Net worth fan chart">
      <defs>
        <linearGradient id="fanOuter" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#5e7c80" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#177e5d" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="fanInner" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#31525b" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#2a9d72" stopOpacity="0.34" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
        const value = maxValue * tick;
        return (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={yFor(value)} y2={yFor(value)} className="grid-line" />
            <text x={pad.left - 10} y={yFor(value) + 4} textAnchor="end" className="axis-label">
              {currency(value)}
            </text>
          </g>
        );
      })}
      {[minAge, retirementAge, maxAge].map((age) => (
        <g key={age}>
          <line x1={xFor(age)} x2={xFor(age)} y1={pad.top} y2={height - pad.bottom} className="vertical-grid" />
          <text x={xFor(age)} y={height - 15} textAnchor="middle" className="axis-label">
            {age}
          </text>
        </g>
      ))}
      <line x1={pad.left} x2={width - pad.right} y1={yRequired} y2={yRequired} className="required-line" />
      <text x={width - pad.right} y={yRequired - 8} textAnchor="end" className="required-label">
        required portfolio
      </text>
      <path d={makeBandPath(data, 'p90', 'p10', xFor, yFor)} fill="url(#fanOuter)" />
      <path d={makeBandPath(data, 'p75', 'p25', xFor, yFor)} fill="url(#fanInner)" />
      <path d={makeLinePath(data, 'p50', xFor, yFor)} className="median-line" />
      <path d={makeLinePath(data, 'p10', xFor, yFor)} className="thin-line" />
      <path d={makeLinePath(data, 'p90', xFor, yFor)} className="thin-line" />
    </svg>
  );
};

const Histogram = ({ values }: { values: number[] }) => {
  const cap = percentile(values, 0.95) || 1;
  const buckets = Array.from({ length: 12 }, (_, index) => ({
    start: (cap / 12) * index,
    end: (cap / 12) * (index + 1),
    count: 0
  }));
  values.forEach((value) => {
    const index = Math.min(11, Math.max(0, Math.floor((Math.min(value, cap) / cap) * 12)));
    buckets[index].count += 1;
  });
  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);
  return (
    <div className="histogram" aria-label="Ending balance histogram">
      {buckets.map((bucket) => (
        <div className="histogram-bar-wrap" key={bucket.start}>
          <div className="histogram-bar" style={{ height: `${Math.max(4, (bucket.count / maxCount) * 100)}%` }} />
          <span>{currency(bucket.end)}</span>
        </div>
      ))}
    </div>
  );
};

const Metric = ({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'warn' | 'bad' }) => (
  <div className={`metric ${tone ?? ''}`}>
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

const getMilestones = (inputs: SimulatorInputs, result: SimulationResult) => {
  const findAge = (value: number) => result.percentileSeries.find((point) => point.p50 >= value)?.age;
  return [
    { label: 'Retirement', value: inputs.retirementAge },
    { label: '$500k median', value: findAge(500000) },
    { label: '$1M median', value: findAge(1000000) },
    { label: 'Required portfolio', value: findAge(result.requiredPortfolio) }
  ].filter((item): item is { label: string; value: number } => typeof item.value === 'number');
};

export const App = () => {
  const [inputs, setInputs] = useState<SimulatorInputs>(defaultInputs);
  const result = useMemo(() => runSimulation(inputs), [inputs]);
  const horizonAge = horizonAgeFor(inputs.horizonMode);
  const allocationTotal = inputs.stockAllocation + inputs.bondAllocation + inputs.cashAllocation;
  const failureLabel = result.firstFailureAgeMedian === null ? 'No median failure' : `Age ${Math.round(result.firstFailureAgeMedian)}`;
  const retirementGap = Math.max(0, inputs.annualSpending - inputs.guaranteedIncome);
  const endingP10 = percentile(result.endingBalances, 0.1);
  const endingP50 = percentile(result.endingBalances, 0.5);
  const endingP90 = percentile(result.endingBalances, 0.9);

  const rollInputs = () => {
    const seed = nextSeed();
    setInputs(rollProfile(seed));
  };

  const rollCurrentSeed = () => {
    setInputs(rollProfile(inputs.seed || 'lifepath-2026'));
  };

  return (
    <main className="app-shell">
      <aside className="input-rail">
        <div className="brand-block">
          <div className="brand-mark">
            <LineChart size={24} />
          </div>
          <div>
            <h1>LifePath Monte Carlo</h1>
            <p>U.S. retirement simulation using sourced historical data.</p>
          </div>
        </div>

        <div className="dice-panel">
          <div>
            <span className="eyebrow">Seeded profile</span>
            <input
              className="seed-input"
              aria-label="Profile seed"
              value={inputs.seed}
              onChange={(event) => setInputs({ ...inputs, seed: event.target.value })}
            />
          </div>
          <div className="dice-actions">
            <button className="primary-button" onClick={rollInputs}>
              <Dice5 size={18} />
              Roll inputs
            </button>
            <button className="icon-button" aria-label="Rebuild from current seed" onClick={rollCurrentSeed}>
              <RefreshCcw size={18} />
            </button>
          </div>
          <p className="source-note">Generated from public benchmark ranges. Every field remains editable.</p>
        </div>

        <section className="control-section">
          <h2>
            <SlidersHorizontal size={17} />
            Core inputs
          </h2>
          <Control label="Current age" value={inputs.age} min={18} max={80} step={1} onChange={(value) => updateNumber(setInputs, inputs, 'age', value)} />
          <Control label="Retirement age" value={inputs.retirementAge} min={30} max={85} step={1} onChange={(value) => updateNumber(setInputs, inputs, 'retirementAge', value)} />
          <label className="control">
            <span className="control-label">Life horizon</span>
            <select
              value={inputs.horizonMode}
              onChange={(event) => setInputs({ ...inputs, horizonMode: event.target.value as SimulatorInputs['horizonMode'] })}
            >
              <option value="age-95">Plan to age 95</option>
              <option value="age-100">Plan to age 100</option>
              <option value="age-105">Plan to age 105</option>
            </select>
          </label>
          <Control label="Annual income" value={inputs.annualIncome} min={0} max={500000} step={1000} prefix="$" onChange={(value) => updateNumber(setInputs, inputs, 'annualIncome', value)} />
          <Control label="Annual spending" value={inputs.annualSpending} min={0} max={300000} step={500} prefix="$" onChange={(value) => updateNumber(setInputs, inputs, 'annualSpending', value)} />
          <Control label="Invested assets" value={inputs.currentAssets} min={0} max={3000000} step={1000} prefix="$" onChange={(value) => updateNumber(setInputs, inputs, 'currentAssets', value)} />
          <Control label="Monthly contribution" value={inputs.monthlyContribution} min={0} max={12000} step={50} prefix="$" onChange={(value) => updateNumber(setInputs, inputs, 'monthlyContribution', value)} />
          <Control label="Guaranteed income" value={inputs.guaranteedIncome} min={0} max={120000} step={1000} prefix="$" onChange={(value) => updateNumber(setInputs, inputs, 'guaranteedIncome', value)} />
          <Control
            label="Withdrawal rate"
            value={inputs.withdrawalRate * 100}
            min={1}
            max={8}
            step={0.1}
            suffix="%"
            onChange={(value) => {
              const parsed = Number(value);
              if (Number.isFinite(parsed)) {
                setInputs({ ...inputs, withdrawalRate: parsed / 100 });
              }
            }}
          />
          <Control label="Simulation paths" value={inputs.simulations} min={1000} max={10000} step={500} onChange={(value) => updateNumber(setInputs, inputs, 'simulations', value)} />
        </section>

        <section className="control-section">
          <h2>
            <Landmark size={17} />
            Allocation
          </h2>
          <Control label="Stocks" value={inputs.stockAllocation} min={0} max={100} step={1} suffix="%" onChange={(value) => updateNumber(setInputs, inputs, 'stockAllocation', value)} />
          <Control label="Bonds" value={inputs.bondAllocation} min={0} max={100} step={1} suffix="%" onChange={(value) => updateNumber(setInputs, inputs, 'bondAllocation', value)} />
          <Control label="Cash" value={inputs.cashAllocation} min={0} max={100} step={1} suffix="%" onChange={(value) => updateNumber(setInputs, inputs, 'cashAllocation', value)} />
          <div className={allocationTotal === 100 ? 'allocation-ok' : 'allocation-warn'}>
            Allocation total: {allocationTotal}%
          </div>
        </section>
      </aside>

      <section className="main-panel">
        <div className="hero-grid">
          <div className="chart-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Monte Carlo fan chart</span>
                <h2>Possible portfolio paths in today's dollars through age {horizonAge}</h2>
              </div>
              <div className="chart-legend">
                <span><i className="legend-dot dark" /> Median</span>
                <span><i className="legend-dot mid" /> 25-75%</span>
                <span><i className="legend-dot light" /> 10-90%</span>
              </div>
            </div>
            <FanChart data={result.percentileSeries} retirementAge={inputs.retirementAge} requiredPortfolio={result.requiredPortfolio} />
          </div>

          <aside className="insight-rail">
            <ProbabilityGauge probability={result.successProbability} />
            <Metric label="Median at retirement" value={currency(result.portfolioAtRetirementMedian)} tone="good" />
            <Metric label="Required portfolio" value={currency(result.requiredPortfolio)} />
            <Metric label="Annual retirement gap" value={currency(retirementGap)} />
            <Metric label="Typical failed path depletes" value={failureLabel} tone={result.firstFailureAgeMedian ? 'bad' : 'good'} />
          </aside>
        </div>

        <div className="card-grid">
          <section className="panel-card">
            <div className="section-heading tight">
              <h2>
                <BarChart3 size={18} />
                Ending balance distribution
              </h2>
            </div>
            <Histogram values={result.endingBalances} />
            <div className="stat-row">
              <Metric label="10th percentile" value={currency(endingP10)} />
              <Metric label="Median" value={currency(endingP50)} />
              <Metric label="90th percentile" value={currency(endingP90)} />
            </div>
          </section>

          <section className="panel-card">
            <div className="section-heading tight">
              <h2>
                <CalendarClock size={18} />
                Milestones
              </h2>
            </div>
            <div className="timeline">
              {getMilestones(inputs, result).map((milestone) => (
                <div className="timeline-item" key={milestone.label}>
                  <span>{milestone.label}</span>
                  <strong>Age {milestone.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="scenario-grid">
          <section className="scenario-card">
            <ShieldCheck size={22} />
            <span>Base case</span>
            <strong>{percent(result.successProbability)} success</strong>
          </section>
          <section className="scenario-card">
            <TrendingDown size={22} />
            <span>Worst first decade</span>
            <strong>
              {result.worstDecade.startYear}-{result.worstDecade.endYear}: {percent(result.worstDecade.realReturn, 1)} real
            </strong>
            <small>Decade-end balance: {currency(result.worstDecade.endingBalance)}</small>
          </section>
          <section className="scenario-card">
            <Sparkles size={22} />
            <span>High-inflation echo</span>
            <strong>1973-1982 years included</strong>
            <small>Bootstrap sampling can draw stagflation years directly.</small>
          </section>
        </div>

        <section className="panel-card">
          <div className="section-heading tight">
            <h2>Top levers</h2>
            <span className="source-note">Compared with smaller seeded simulation runs.</span>
          </div>
          <div className="lever-grid">
            {result.sensitivity.map((lever) => (
              <div className="lever" key={lever.label}>
                <span>{lever.label}</span>
                <strong>{lever.delta >= 0 ? '+' : ''}{percent(lever.delta, 1)}</strong>
                <small>{percent(lever.probability)} success</small>
              </div>
            ))}
          </div>
        </section>

        <section className="sources-panel">
          <div className="section-heading tight">
            <h2>Research snapshot</h2>
            <span className="disclaimer">Planning simulation only. Not financial advice.</span>
          </div>
          <div className="snapshot-strip">
            <span>BLS avg income: {currency(researchStats.blsAverageIncomeBeforeTaxes2024, false)}</span>
            <span>BLS avg spending: {currency(researchStats.blsAverageAnnualExpenditures2024, false)}</span>
            <span>FRED CPI: {researchStats.fredCpiLatest}</span>
            <span>UNRATE: {researchStats.fredUnemploymentLatest}</span>
            <span>Default withdrawal: {percent(researchStats.morningstarWithdrawalRate2026, 1)}</span>
          </div>
          <div className="source-list">
            {researchSources.map((source) => (
              <a href={source.url} target="_blank" rel="noreferrer" className="source-item" key={source.name}>
                <strong>{source.name}</strong>
                <span>{source.date}</span>
                <p>{source.note}</p>
              </a>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
};
