'use client'

import { MapPin, Users, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// JOB POST TYPE (User's own job listings)
// ============================================
export interface JobPostItem {
  id: string
  title: string
  category: string
  description: string
  budget: { min: number; max: number }
  location: { area: string; lat: number; lng: number }
  applicants: number
  status: 'active' | 'pending' | 'completed' | 'cancelled'
  postedAt: string
}

// ============================================
// JOB POST LIST CARD PROPS
// ============================================
export interface JobPostListCardProps {
  jobPost: JobPostItem
  onClick: () => void
  getCategoryIcon: (category: string) => string
  /** Whether this card is currently selected */
  isSelected?: boolean
}

// Status configuration
const statusConfig = {
  active: {
    label: 'Active',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-500',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
    dot: 'bg-red-500',
  },
}

// ============================================
// JOB POST LIST CARD COMPONENT
// Elevated with better hierarchy and spacing
// Cyan theme for hiring mode
// ============================================
export function JobPostListCard({
  jobPost,
  onClick,
  getCategoryIcon,
  isSelected = false,
}: JobPostListCardProps) {
  const status = statusConfig[jobPost.status]

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
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500/50'
      )}
      data-qa="job-post-list-item"
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
          {getCategoryIcon(jobPost.category)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Title + Status Badge */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className={cn(
              'font-semibold text-[15px] text-white leading-snug',
              'line-clamp-1 transition-colors duration-200',
              'group-hover:text-cyan-400'
            )}>
              {jobPost.title}
            </h3>

            {/* Status Badge */}
            {status && (
              <span className={cn(
                'shrink-0 inline-flex items-center gap-1.5',
                'px-2 py-0.5 rounded-full',
                'text-[11px] font-semibold uppercase tracking-wide',
                'border',
                status.bg,
                status.text,
                status.border
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                {status.label}
              </span>
            )}
          </div>

          {/* Meta Row: Location + Time */}
          <div className="flex items-center gap-3 text-[13px] text-slate-400 mb-3">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-[140px]">{jobPost.location.area}</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{jobPost.postedAt}</span>
            </span>
          </div>

          {/* Bottom Row: Price (Primary) + Applicants (Secondary) */}
          <div className="flex items-center justify-between">
            {/* Price - Primary visual weight */}
            <span className="font-semibold text-[15px] tabular-nums text-cyan-400">
              ${jobPost.budget.min}
              {jobPost.budget.max !== jobPost.budget.min && (
                <span className="text-slate-500 font-normal"> – </span>
              )}
              {jobPost.budget.max !== jobPost.budget.min && (
                <span>${jobPost.budget.max}</span>
              )}
            </span>

            {/* Applicants Count - Secondary, receded */}
            <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span className="tabular-nums">{jobPost.applicants}</span>
              <span className="text-slate-600">applicants</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default JobPostListCard
