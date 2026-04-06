import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts'
import type { OutcomeDistribution, OutcomeMetric } from '@/types'

const METRIC_COLORS: Record<OutcomeMetric, string> = {
  wealth: '#34D399',
  happiness: '#FBBF24',
  health: '#60A5FA',
  success: '#A78BFA',
}

interface DistributionChartProps {
  distribution: OutcomeDistribution
  metric: OutcomeMetric
  formatValue: (n: number) => string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, formatValue }: any) {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: 'rgba(13,17,23,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '12px',
    }}>
      <p style={{ color: '#94A3B8', marginBottom: '4px' }}>
        ~{formatValue(d.bin)}
      </p>
      <p style={{ color: '#F1F5F9', fontWeight: 600 }}>
        {d.pct.toFixed(1)}% of lives
      </p>
    </div>
  )
}

export default function DistributionChart({ distribution, metric, formatValue }: DistributionChartProps) {
  const color = METRIC_COLORS[metric]

  const data = useMemo(() => distribution.histogram, [distribution])

  const median = distribution.median
  const p10 = distribution.p10
  const p90 = distribution.p90

  // Find bin indices for coloring
  const medianBin = data.reduce((closest, d, i) =>
    Math.abs(d.bin - median) < Math.abs(data[closest].bin - median) ? i : closest, 0)

  return (
    <div style={{ width: '100%', height: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
          <XAxis
            dataKey="bin"
            tickFormatter={formatValue}
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
            interval={Math.floor(data.length / 5)}
          />
          <YAxis
            dataKey="pct"
            tickFormatter={(v) => `${v.toFixed(1)}%`}
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip formatValue={formatValue} />} />

          <ReferenceLine
            x={p10}
            stroke="rgba(255,255,255,0.2)"
            strokeDasharray="4 4"
            label={{ value: 'p10', fill: '#475569', fontSize: 10, position: 'top' }}
          />
          <ReferenceLine
            x={median}
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            label={{ value: 'median', fill: color, fontSize: 10, position: 'top' }}
          />
          <ReferenceLine
            x={p90}
            stroke="rgba(255,255,255,0.2)"
            strokeDasharray="4 4"
            label={{ value: 'p90', fill: '#475569', fontSize: 10, position: 'top' }}
          />

          <Bar dataKey="pct" radius={[3, 3, 0, 0]}>
            {data.map((_, index) => {
              const distFromMedian = Math.abs(index - medianBin) / data.length
              const opacity = Math.max(0.25, 1 - distFromMedian * 2.5)
              return <Cell key={index} fill={color} fillOpacity={opacity} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
