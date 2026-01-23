'use client'

import { cn } from '@/lib/utils'

// ============================================
// LIVE DOT COMPONENT
// Pulsing indicator for live/active states
// ============================================

export interface LiveDotProps {
  variant?: 'cyan' | 'green' | 'red' | 'amber' | 'purple' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  className?: string
}

const colors = {
  cyan: {
    outer: 'bg-cyan-400',
    inner: 'bg-cyan-500',
  },
  green: {
    outer: 'bg-emerald-400',
    inner: 'bg-emerald-500',
  },
  red: {
    outer: 'bg-red-400',
    inner: 'bg-red-500',
  },
  amber: {
    outer: 'bg-amber-400',
    inner: 'bg-amber-500',
  },
  purple: {
    outer: 'bg-purple-400',
    inner: 'bg-purple-500',
  },
  blue: {
    outer: 'bg-blue-400',
    inner: 'bg-blue-500',
  },
}

const sizes = {
  sm: {
    outer: 'h-2 w-2',
    inner: 'h-2 w-2',
  },
  md: {
    outer: 'h-3 w-3',
    inner: 'h-3 w-3',
  },
  lg: {
    outer: 'h-4 w-4',
    inner: 'h-4 w-4',
  },
}

export function LiveDot({
  variant = 'cyan',
  size = 'md',
  pulse = true,
  className,
}: LiveDotProps) {
  const colorScheme = colors[variant]
  const sizeScheme = sizes[size]

  return (
    <span className={cn('relative inline-flex', sizeScheme.outer, className)}>
      {pulse && (
        <span
          className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            colorScheme.outer
          )}
        />
      )}
      <span
        className={cn(
          'relative inline-flex rounded-full',
          sizeScheme.inner,
          colorScheme.inner
        )}
      />
    </span>
  )
}

// ============================================
// STATUS DOT COMPONENT
// Non-pulsing status indicator
// ============================================

export interface StatusDotProps {
  status: 'online' | 'offline' | 'busy' | 'away' | 'invisible'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-500',
  busy: 'bg-red-500',
  away: 'bg-amber-500',
  invisible: 'bg-slate-600',
}

const statusSizes = {
  sm: 'h-2 w-2',
  md: 'h-2.5 w-2.5',
  lg: 'h-3 w-3',
}

export function StatusDot({
  status,
  size = 'md',
  className,
}: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full border-2 border-slate-900',
        statusColors[status],
        statusSizes[size],
        className
      )}
    />
  )
}

// ============================================
// LIVE INDICATOR WITH LABEL
// ============================================

export interface LiveIndicatorProps {
  label?: string
  variant?: 'cyan' | 'green' | 'red' | 'amber'
  className?: string
}

export function LiveIndicator({
  label = 'LIVE',
  variant = 'green',
  className,
}: LiveIndicatorProps) {
  const bgColors = {
    cyan: 'bg-cyan-500/20',
    green: 'bg-emerald-500/20',
    red: 'bg-red-500/20',
    amber: 'bg-amber-500/20',
  }

  const textColors = {
    cyan: 'text-cyan-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        bgColors[variant],
        className
      )}
    >
      <LiveDot variant={variant} size="sm" />
      <span className={cn('text-xs font-semibold tracking-wide', textColors[variant])}>
        {label}
      </span>
    </div>
  )
}

// ============================================
// ACTIVITY INDICATOR
// Shows activity count with pulsing dot
// ============================================

export interface ActivityIndicatorProps {
  count: number
  label?: string
  className?: string
}

export function ActivityIndicator({
  count,
  label = 'active',
  className,
}: ActivityIndicatorProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10',
        className
      )}
    >
      <LiveDot variant="cyan" size="sm" />
      <span className="text-sm font-medium text-white">
        {count.toLocaleString()} <span className="text-slate-400">{label}</span>
      </span>
    </div>
  )
}

export default LiveDot
