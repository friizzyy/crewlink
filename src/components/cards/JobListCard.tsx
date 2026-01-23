'use client'

import { MapPin, Users, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// URGENCY CONFIG - Elevated visual language
// ============================================
export const urgencyConfig = {
  urgent: {
    label: 'Urgent',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
    dot: 'bg-red-500',
  },
  today: {
    label: 'Today',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
  },
  scheduled: {
    label: 'Scheduled',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    dot: 'bg-purple-500',
  },
  flexible: {
    label: 'Flexible',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-500',
  },
}

export type UrgencyType = keyof typeof urgencyConfig

// ============================================
// JOB TYPE
// ============================================
export interface JobItem {
  id: string
  title: string
  category: string
  description: string
  budget: { min: number; max: number }
  location: { area: string; lat: number; lng: number }
  postedBy: { name: string; rating: number; jobs: number; verified: boolean }
  postedAt: string
  urgency: UrgencyType
  bids: number
  status: string
}

// ============================================
// JOB LIST CARD PROPS
// ============================================
export interface JobListCardProps {
  job: JobItem
  onClick: () => void
  getCategoryIcon: (category: string) => string
  /** Color mode: 'work' uses emerald, 'hire' uses cyan */
  colorMode?: 'work' | 'hire'
  /** Whether this card is currently selected */
  isSelected?: boolean
}

// Mode-specific styling
const modeStyles = {
  work: {
    hoverTitle: 'group-hover:text-emerald-400',
    price: 'text-emerald-400',
    priceGlow: 'group-hover:shadow-emerald-500/10',
  },
  hire: {
    hoverTitle: 'group-hover:text-cyan-400',
    price: 'text-cyan-400',
    priceGlow: 'group-hover:shadow-cyan-500/10',
  },
}

// ============================================
// JOB LIST CARD COMPONENT
// Elevated with better hierarchy and spacing
// ============================================
export function JobListCard({
  job,
  onClick,
  getCategoryIcon,
  colorMode = 'work',
  isSelected = false,
}: JobListCardProps) {
  const styles = modeStyles[colorMode]
  const urgency = urgencyConfig[job.urgency]

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className={cn(
        'group relative px-5 py-4',
        'cursor-pointer transition-all duration-200',
        // Hover state
        'hover:bg-white/[0.02]',
        // Selected state
        isSelected && 'bg-white/[0.03]',
        // Focus state for accessibility
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
        colorMode === 'work'
          ? 'focus-visible:ring-emerald-500/50'
          : 'focus-visible:ring-cyan-500/50'
      )}
      data-qa="job-list-item"
    >
      <div className="flex items-start gap-3.5">
        {/* Category Icon - Elevated */}
        <div className={cn(
          'relative shrink-0 w-12 h-12 rounded-xl',
          'bg-slate-800/80 border border-white/[0.06]',
          'flex items-center justify-center text-2xl',
          'transition-all duration-200',
          'group-hover:scale-105 group-hover:border-white/10'
        )}>
          {getCategoryIcon(job.category)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Title + Urgency Badge */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className={cn(
              'font-semibold text-[15px] text-white leading-snug',
              'line-clamp-1 transition-colors duration-200',
              styles.hoverTitle
            )}>
              {job.title}
            </h3>

            {/* Urgency Badge - Refined */}
            {job.urgency && urgency && (
              <span className={cn(
                'shrink-0 inline-flex items-center gap-1.5',
                'px-2 py-0.5 rounded-full',
                'text-[11px] font-semibold uppercase tracking-wide',
                'border',
                urgency.bg,
                urgency.text,
                urgency.border
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', urgency.dot)} />
                {urgency.label}
              </span>
            )}
          </div>

          {/* Meta Row: Location + Time */}
          <div className="flex items-center gap-3 text-[13px] text-slate-400 mb-3">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-[140px]">{job.location.area}</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{job.postedAt}</span>
            </span>
          </div>

          {/* Bottom Row: Price (Primary) + Bids (Secondary) */}
          <div className="flex items-center justify-between">
            {/* Price - Primary visual weight */}
            <span className={cn(
              'font-semibold text-[15px] tabular-nums',
              'transition-all duration-200',
              styles.price
            )}>
              ${job.budget.min}
              {job.budget.max !== job.budget.min && (
                <span className="text-slate-500 font-normal"> – </span>
              )}
              {job.budget.max !== job.budget.min && (
                <span>${job.budget.max}</span>
              )}
            </span>

            {/* Bids Count - Secondary, receded */}
            <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span className="tabular-nums">{job.bids}</span>
              <span className="text-slate-600">bids</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default JobListCard
