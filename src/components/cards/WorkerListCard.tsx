'use client'

import { Star, BadgeCheck, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// WORKER TYPE
// ============================================
export interface WorkerItem {
  id: string
  name: string
  title: string
  category: string
  bio: string
  rating: number
  reviews: number
  completedJobs: number
  location: { area: string; lat: number; lng: number }
  verified: boolean
  responseTime: string
  hourlyRate: { min: number; max: number }
  availability: string
  services: string[]
}

// ============================================
// WORKER LIST CARD PROPS
// ============================================
export interface WorkerListCardProps {
  worker: WorkerItem
  onClick: () => void
  /** Color mode: 'work' uses emerald, 'hire' uses cyan */
  colorMode?: 'work' | 'hire'
  /** Whether this card is currently selected */
  isSelected?: boolean
}

// Mode-specific styling
const modeStyles = {
  work: {
    hoverTitle: 'group-hover:text-emerald-400',
    rate: 'text-emerald-400',
    verified: 'text-emerald-400',
    avatarGradient: 'from-emerald-500 to-teal-600',
    avatarBorder: 'ring-emerald-500/20',
  },
  hire: {
    hoverTitle: 'group-hover:text-cyan-400',
    rate: 'text-cyan-400',
    verified: 'text-cyan-400',
    avatarGradient: 'from-cyan-500 to-blue-600',
    avatarBorder: 'ring-cyan-500/20',
  },
}

// ============================================
// WORKER LIST CARD COMPONENT
// Elevated with better hierarchy and spacing
// ============================================
export function WorkerListCard({
  worker,
  onClick,
  colorMode = 'hire',
  isSelected = false,
}: WorkerListCardProps) {
  const styles = modeStyles[colorMode]

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
      data-qa="worker-list-item"
    >
      <div className="flex items-start gap-3.5">
        {/* Avatar - Elevated with gradient */}
        <div className={cn(
          'relative shrink-0 w-12 h-12 rounded-xl',
          'bg-gradient-to-br flex items-center justify-center',
          'text-white font-bold text-lg',
          'transition-all duration-200',
          'group-hover:scale-105',
          'ring-2 ring-offset-2 ring-offset-slate-900',
          styles.avatarGradient,
          styles.avatarBorder
        )}>
          {worker.name.charAt(0).toUpperCase()}

          {/* Verified indicator overlay */}
          {worker.verified && (
            <div className={cn(
              'absolute -bottom-0.5 -right-0.5',
              'w-5 h-5 rounded-full',
              'bg-slate-900 flex items-center justify-center'
            )}>
              <BadgeCheck className={cn('w-3.5 h-3.5', styles.verified)} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Name + Verified Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              'font-semibold text-[15px] text-white leading-snug',
              'truncate transition-colors duration-200',
              styles.hoverTitle
            )}>
              {worker.name}
            </h3>
          </div>

          {/* Title / Role */}
          <p className="text-[13px] text-slate-500 mb-2.5 truncate">
            {worker.title}
          </p>

          {/* Stats Row: Rating + Jobs + Rate */}
          <div className="flex items-center gap-3 text-[13px]">
            {/* Rating */}
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-medium text-white tabular-nums">
                {worker.rating.toFixed(1)}
              </span>
              {worker.reviews > 0 && (
                <span className="text-slate-500">
                  ({worker.reviews})
                </span>
              )}
            </div>

            <span className="text-slate-700">·</span>

            {/* Completed Jobs */}
            <div className="flex items-center gap-1 text-slate-400">
              <Briefcase className="w-3.5 h-3.5 text-slate-500" />
              <span className="tabular-nums">{worker.completedJobs}</span>
              <span className="text-slate-500">jobs</span>
            </div>

            <span className="text-slate-700">·</span>

            {/* Hourly Rate - Primary metric */}
            <span className={cn(
              'font-semibold tabular-nums',
              styles.rate
            )}>
              ${worker.hourlyRate.min}/hr
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

export default WorkerListCard
