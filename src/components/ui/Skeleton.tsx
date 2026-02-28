import { cn } from '@/lib/utils'

// ============================================
// BASE SKELETON
// ============================================

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-800/60 rounded'
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'h-48 w-full rounded-2xl',
  }
  return <div className={cn(baseClasses, variants[variant], className)} />
}

// ============================================
// SKELETON CARD - Generic card with avatar + text lines + action buttons
// ============================================

interface SkeletonCardProps {
  className?: string
  lines?: number
  showAvatar?: boolean
  showActions?: boolean
}

export function SkeletonCard({
  className,
  lines = 3,
  showAvatar = true,
  showActions = true,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5 space-y-4',
        className
      )}
    >
      {/* Header with avatar */}
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      )}

      {/* Text lines */}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-3.5', i === lines - 1 ? 'w-3/4' : 'w-full')}
          />
        ))}
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="flex items-center gap-2 pt-1">
          <Skeleton variant="rectangular" className="h-9 w-24" />
          <Skeleton variant="rectangular" className="h-9 w-20" />
        </div>
      )}
    </div>
  )
}

// ============================================
// SKELETON JOB CARD - Job-specific loading state
// ============================================

interface SkeletonJobCardProps {
  className?: string
}

export function SkeletonJobCard({ className }: SkeletonJobCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5 space-y-4',
        className
      )}
    >
      {/* Title + status badge */}
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-48" />
        <Skeleton variant="rectangular" className="h-6 w-16 shrink-0" />
      </div>

      {/* Location row */}
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" className="h-4 w-4 shrink-0" />
        <Skeleton className="h-3.5 w-36" />
      </div>

      {/* Description lines */}
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>

      {/* Budget + schedule row */}
      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-1.5">
          <Skeleton variant="circular" className="h-4 w-4 shrink-0" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-1.5">
          <Skeleton variant="circular" className="h-4 w-4 shrink-0" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Apply button */}
      <div className="pt-2">
        <Skeleton variant="rectangular" className="h-10 w-full" />
      </div>
    </div>
  )
}

// ============================================
// SKELETON STAT CARD - Stat card with label + large number + subtitle
// ============================================

interface SkeletonStatCardProps {
  className?: string
}

export function SkeletonStatCard({ className }: SkeletonStatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-slate-900/60 border border-white/[0.06] p-5 space-y-3',
        className
      )}
    >
      {/* Label */}
      <Skeleton className="h-3.5 w-24" />

      {/* Large number */}
      <Skeleton className="h-8 w-32" />

      {/* Subtitle / trend */}
      <div className="flex items-center gap-2">
        <Skeleton variant="rectangular" className="h-5 w-14" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}
