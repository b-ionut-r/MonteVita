import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { TrajectorySample, OutcomeMetric } from '@/types'

// Decile color ramp: red (bad) → yellow → green (good) → teal (best)
const DECILE_COLORS = [
  '#F87171', '#FB923C', '#FBBF24', '#A3E635', '#4ADE80',
  '#34D399', '#2DD4BF', '#38BDF8', '#818CF8', '#A78BFA',
]

interface LifePathChartProps {
  trajectories: TrajectorySample
  metric: OutcomeMetric
  formatValue: (n: number) => string
}

export default function LifePathChart({ trajectories, metric, formatValue }: LifePathChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    const container = containerRef.current
    if (!svg || !container) return

    const draw = (width: number) => {
      if (width < 10) return

      const height = 280
      const margin = { top: 20, right: 20, bottom: 30, left: 55 }
      const innerW = width - margin.left - margin.right
      const innerH = height - margin.top - margin.bottom

      d3.select(svg).selectAll('*').remove()
      d3.select(svg).attr('width', width).attr('height', height)

      const g = d3.select(svg).append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      const { ages, paths, medianPath } = trajectories

      const allVals = paths.flatMap(p => p.values).concat(medianPath)
      const yMin = Math.min(...allVals) * 0.95
      const yMax = Math.max(...allVals) * 1.05

      const xScale = d3.scaleLinear().domain([ages[0], ages[ages.length - 1]]).range([0, innerW])
      const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0])

      const lineGen = d3.line<number>()
        .x((_, i) => xScale(ages[i]))
        .y(d => yScale(d))
        .curve(d3.curveCatmullRom.alpha(0.5))

      // X axis
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(xScale).ticks(5).tickFormat(d => `Age ${d}`))
        .call(ax => {
          ax.select('.domain').attr('stroke', 'rgba(255,255,255,0.08)')
          ax.selectAll('text').attr('fill', '#475569').attr('font-size', '11px')
          ax.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.05)')
        })

      // Y axis
      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => formatValue(d as number)))
        .call(ax => {
          ax.select('.domain').remove()
          ax.selectAll('text').attr('fill', '#475569').attr('font-size', '11px')
          ax.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.05)').attr('x2', innerW)
        })

      // Spaghetti paths
      paths.forEach(path => {
        const d = lineGen(path.values)
        if (!d) return
        const pathEl = g.append('path')
          .attr('d', d)
          .attr('fill', 'none')
          .attr('stroke', DECILE_COLORS[Math.min(9, path.decile)])
          .attr('stroke-width', 1)
          .attr('stroke-opacity', 0.25)

        const totalLength = (pathEl.node() as SVGPathElement)?.getTotalLength() ?? 0
        pathEl
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(1500)
          .delay(path.decile * 20)
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0)
      })

      // Median path on top
      const medD = lineGen(medianPath)
      if (medD) {
        const medEl = g.append('path')
          .attr('d', medD)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(255,255,255,0.9)')
          .attr('stroke-width', 2.5)
          .attr('stroke-linecap', 'round')

        const totalLength = (medEl.node() as SVGPathElement)?.getTotalLength() ?? 0
        medEl
          .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
          .attr('stroke-dashoffset', totalLength)
          .transition().duration(1800).ease(d3.easeQuadInOut)
          .attr('stroke-dashoffset', 0)

        g.append('text')
          .attr('x', innerW - 4)
          .attr('y', yScale(medianPath[medianPath.length - 1]) - 6)
          .attr('text-anchor', 'end')
          .attr('fill', 'rgba(255,255,255,0.7)')
          .attr('font-size', '10px')
          .text('median')
      }
    }

    // Use ResizeObserver so the chart renders with correct width after layout settles
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0
      draw(w)
    })
    ro.observe(container)

    // Also fire immediately in case it's already sized (e.g. switching back to this tab)
    const immediate = container.clientWidth
    if (immediate > 10) draw(immediate)

    return () => ro.disconnect()
  }, [trajectories, metric, formatValue])

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={svgRef} style={{ overflow: 'visible', display: 'block' }} />

      {/* Legend */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap', paddingLeft: '55px' }}>
        {[
          { label: 'Worst outcomes', color: DECILE_COLORS[0] },
          { label: 'Median', color: 'rgba(255,255,255,0.8)' },
          { label: 'Best outcomes', color: DECILE_COLORS[9] },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#475569' }}>
            <div style={{ width: '20px', height: '2px', background: l.color, borderRadius: '1px' }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
