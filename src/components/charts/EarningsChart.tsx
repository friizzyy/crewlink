'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ============================================
// TYPES
// ============================================

interface EarningsDataPoint {
  date: string
  amount: number
}

// ============================================
// CUSTOM TOOLTIP
// ============================================

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '10px 14px',
      }}
    >
      <p style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>
        {label}
      </p>
      <p style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  )
}

// ============================================
// EARNINGS CHART - Full chart with axes, tooltip, gradient fill
// ============================================

interface EarningsChartProps {
  data: EarningsDataPoint[]
  height?: number
  showAxis?: boolean
}

export function EarningsChart({
  data,
  height = 200,
  showAxis = true,
}: EarningsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>

        {showAxis && (
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
        )}

        {showAxis && (
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => `$${value}`}
            dx={-4}
          />
        )}

        <Tooltip content={<CustomTooltip />} cursor={false} />

        <Area
          type="monotone"
          dataKey="amount"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#earningsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ============================================
// EARNINGS SPARKLINE - Mini chart, no axes
// ============================================

interface EarningsSparklineProps {
  data: EarningsDataPoint[]
}

export function EarningsSparkline({ data }: EarningsSparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>

        <Area
          type="monotone"
          dataKey="amount"
          stroke="#10b981"
          strokeWidth={1.5}
          fill="url(#sparklineGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
