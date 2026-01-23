'use client'

import { Search, MapPin, AlertCircle, Wifi, RefreshCw, Briefcase, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// SHARED TYPES
// ============================================
export type MapMode = 'work' | 'hire'

// Mode-specific styling
const modeStyles = {
  work: {
    spinner: 'border-emerald-500/30 border-t-emerald-500',
    icon: 'text-emerald-500/60',
    button: 'bg-emerald-500 hover:bg-emerald-400 text-white',
    accent: 'text-emerald-400',
  },
  hire: {
    spinner: 'border-cyan-500/30 border-t-cyan-500',
    icon: 'text-cyan-500/60',
    button: 'bg-cyan-500 hover:bg-cyan-400 text-white',
    accent: 'text-cyan-400',
  },
}

// ============================================
// LOADING STATE
// Premium loading spinner with calm animation
// ============================================
export interface MapLoadingStateProps {
  mode?: MapMode
  message?: string
}

export function MapLoadingState({
  mode = 'work',
  message = 'Loading...',
}: MapLoadingStateProps) {
  const styles = modeStyles[mode]

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        {/* Spinner */}
        <div className="relative">
          <div className={cn(
            'w-12 h-12 rounded-full border-4',
            'animate-spin',
            styles.spinner
          )} />
          {/* Inner glow */}
          <div className={cn(
            'absolute inset-0 rounded-full blur-xl opacity-30',
            mode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
          )} />
        </div>

        {/* Message */}
        <p className="text-slate-400 text-sm font-medium animate-pulse">
          {message}
        </p>
      </div>
    </div>
  )
}

// ============================================
// MAP LOADING STATE (for inside map container)
// ============================================
export interface MapContainerLoadingProps {
  mode?: MapMode
  message?: string
}

export function MapContainerLoading({
  mode = 'work',
  message = 'Loading map...',
}: MapContainerLoadingProps) {
  const styles = modeStyles[mode]

  return (
    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          'w-12 h-12 rounded-full border-4 animate-spin',
          styles.spinner
        )} />
        <p className="text-slate-400 text-sm">{message}</p>
      </div>
    </div>
  )
}

// ============================================
// EMPTY STATE
// Calm, helpful empty state for no results
// ============================================
export interface MapEmptyStateProps {
  mode?: MapMode
  title?: string
  message?: string
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
  }
  /** Type of empty state for appropriate icon */
  variant?: 'no-results' | 'no-location' | 'error' | 'offline'
}

export function MapEmptyState({
  mode = 'work',
  title = 'No results found',
  message = 'Try adjusting your filters or search area',
  action,
  variant = 'no-results',
}: MapEmptyStateProps) {
  const styles = modeStyles[mode]

  // Icon based on variant
  const icons = {
    'no-results': Search,
    'no-location': MapPin,
    'error': AlertCircle,
    'offline': Wifi,
  }
  const Icon = icons[variant]

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fadeIn">
      {/* Icon container */}
      <div className={cn(
        'w-16 h-16 rounded-2xl',
        'bg-slate-800/60 border border-white/[0.06]',
        'flex items-center justify-center mb-5',
        'transition-colors'
      )}>
        <Icon className={cn('w-7 h-7', styles.icon)} />
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-base mb-2">
        {title}
      </h3>

      {/* Message */}
      <p className="text-slate-500 text-sm max-w-[240px] leading-relaxed">
        {message}
      </p>

      {/* Optional action */}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'mt-6 px-5 py-2.5 rounded-xl',
            'text-sm font-medium',
            'transition-all duration-200',
            styles.button
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// ============================================
// SIDEBAR EMPTY STATE
// For when list has no items
// ============================================
export interface SidebarEmptyStateProps {
  mode?: MapMode
  type: 'jobs' | 'applications' | 'companies' | 'workers'
  hasFilters?: boolean
  onClearFilters?: () => void
}

const emptyMessages = {
  jobs: {
    title: 'No jobs found',
    message: 'There are no jobs matching your criteria in this area',
    filterMessage: 'Try adjusting your filters or expanding your search area',
  },
  applications: {
    title: 'No applications yet',
    message: "You haven't applied to any jobs yet. Browse available jobs to get started.",
    filterMessage: 'No applications match your current filters',
  },
  companies: {
    title: 'No companies found',
    message: 'There are no companies matching your criteria in this area',
    filterMessage: 'Try adjusting your filters or expanding your search area',
  },
  workers: {
    title: 'No workers found',
    message: 'There are no workers matching your criteria in this area',
    filterMessage: 'Try adjusting your filters or expanding your search area',
  },
}

export function SidebarEmptyState({
  mode = 'work',
  type,
  hasFilters = false,
  onClearFilters,
}: SidebarEmptyStateProps) {
  const content = emptyMessages[type]
  const styles = modeStyles[mode]
  const Icon = type === 'jobs' || type === 'applications' ? Briefcase : Users

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fadeIn">
      {/* Icon container */}
      <div className={cn(
        'w-14 h-14 rounded-xl',
        'bg-slate-800/60 border border-white/[0.06]',
        'flex items-center justify-center mb-4'
      )}>
        <Icon className={cn('w-6 h-6', styles.icon)} />
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-[15px] mb-1.5">
        {content.title}
      </h3>

      {/* Message */}
      <p className="text-slate-500 text-sm max-w-[220px] leading-relaxed mb-4">
        {hasFilters ? content.filterMessage : content.message}
      </p>

      {/* Clear filters button */}
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            'text-sm font-medium',
            'bg-slate-800/60 border border-white/[0.06]',
            'text-slate-400 hover:text-white hover:bg-slate-800/80',
            'transition-all duration-200'
          )}
        >
          <RefreshCw className="w-4 h-4" />
          Clear filters
        </button>
      )}
    </div>
  )
}

// ============================================
// SKELETON LOADER
// Calm loading placeholders for cards
// ============================================
export function CardSkeleton() {
  return (
    <div className="px-5 py-4 animate-pulse">
      <div className="flex items-start gap-3.5">
        {/* Icon skeleton */}
        <div className="w-12 h-12 rounded-xl bg-slate-800/60" />

        {/* Content skeleton */}
        <div className="flex-1 space-y-3">
          {/* Title */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-2/3 bg-slate-800/60 rounded" />
            <div className="h-5 w-16 bg-slate-800/60 rounded-full" />
          </div>

          {/* Meta */}
          <div className="h-3 w-1/2 bg-slate-800/40 rounded" />

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 bg-slate-800/60 rounded" />
            <div className="h-3 w-16 bg-slate-800/40 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="divide-y divide-white/[0.04]">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export default MapEmptyState
