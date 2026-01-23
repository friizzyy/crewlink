'use client'

import { forwardRef } from 'react'
import { cn, getInitials } from '@/lib/utils'
import { Star, MapPin, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react'

// ============================================
// CARD COMPONENT
// ============================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'card',
      elevated: 'card-elevated',
      interactive: 'card-interactive',
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// ============================================
// BADGE COMPONENT
// ============================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'accent' | 'success' | 'warning' | 'error' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'md', dot, children, ...props }, ref) => {
    const variants = {
      brand: 'badge-brand',
      accent: 'badge-accent',
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error',
      neutral: 'badge-neutral',
    }

    const sizes = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-xs px-2.5 py-0.5',
      lg: 'text-sm px-3 py-1',
    }

    return (
      <span
        ref={ref}
        className={cn('badge', variants[variant], sizes[size], className)}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full mr-1.5',
              variant === 'brand' && 'bg-brand-600',
              variant === 'accent' && 'bg-accent-600',
              variant === 'success' && 'bg-success-600',
              variant === 'warning' && 'bg-amber-600',
              variant === 'error' && 'bg-red-600',
              variant === 'neutral' && 'bg-slate-600'
            )}
          />
        )}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

// ============================================
// AVATAR COMPONENT
// ============================================

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'busy' | 'away'
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name, size = 'md', status, ...props }, ref) => {
    const sizes = {
      sm: 'avatar-sm',
      md: 'avatar-md',
      lg: 'avatar-lg',
      xl: 'avatar-xl',
    }

    const statusColors = {
      online: 'bg-success-500',
      offline: 'bg-slate-400',
      busy: 'bg-red-500',
      away: 'bg-amber-500',
    }

    const statusSizes = {
      sm: 'w-2 h-2 bottom-0 right-0',
      md: 'w-2.5 h-2.5 bottom-0 right-0',
      lg: 'w-3 h-3 bottom-0.5 right-0.5',
      xl: 'w-4 h-4 bottom-0.5 right-0.5',
    }

    return (
      <div ref={ref} className={cn('avatar', sizes[size], className)} {...props}>
        {src ? (
          <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
        ) : (
          <span className="font-medium text-slate-600">{name ? getInitials(name) : '?'}</span>
        )}
        {status && (
          <span
            className={cn(
              'absolute rounded-full border-2 border-white',
              statusColors[status],
              statusSizes[size]
            )}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

// ============================================
// RATING COMPONENT
// ============================================

export interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function Rating({ value, max = 5, size = 'md', showValue = true, className }: RatingProps) {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizes[size],
              i < Math.floor(value)
                ? 'text-amber-400 fill-amber-400'
                : i < value
                  ? 'text-amber-400 fill-amber-400/50'
                  : 'text-slate-300'
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className={cn('font-medium text-slate-700', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}

// ============================================
// SKELETON COMPONENT
// ============================================

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, variant = 'text', width, height, ...props }: SkeletonProps) {
  const variants = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }

  return (
    <div
      className={cn('skeleton', variants[variant], className)}
      style={{ width, height }}
      {...props}
    />
  )
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      {icon && <div className="text-slate-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-slate-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}

// ============================================
// LOADING SPINNER COMPONENT
// ============================================

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <svg
      className={cn('animate-spin text-brand-600', sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// ============================================
// DIVIDER COMPONENT
// ============================================

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  label?: string
  className?: string
}

export function Divider({ orientation = 'horizontal', label, className }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={cn('w-px bg-slate-200 h-full', className)} />
  }

  if (label) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-sm text-slate-500">{label}</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
    )
  }

  return <div className={cn('h-px bg-slate-200 w-full', className)} />
}

// ============================================
// STATUS INDICATOR
// ============================================

export interface StatusIndicatorProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'pending'
  label: string
  className?: string
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusConfig = {
    success: { icon: CheckCircle, color: 'text-success-600', bg: 'bg-success-50' },
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    warning: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    info: { icon: CheckCircle, color: 'text-brand-600', bg: 'bg-brand-50' },
    pending: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
        config.color,
        config.bg,
        className
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </span>
  )
}

// ============================================
// STAT CARD
// ============================================

export interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  className?: string
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          {trend && (
            <p
              className={cn(
                'text-sm mt-1',
                trend.isPositive ? 'text-success-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '+' : '-'}
              {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
    </Card>
  )
}

// ============================================
// LOCATION DISPLAY
// ============================================

export interface LocationDisplayProps {
  address: string
  distance?: number
  className?: string
}

export function LocationDisplay({ address, distance, className }: LocationDisplayProps) {
  return (
    <div className={cn('flex items-center gap-1.5 text-sm text-slate-600', className)}>
      <MapPin className="w-4 h-4 shrink-0" />
      <span className="truncate">{address}</span>
      {distance !== undefined && (
        <span className="text-slate-400 shrink-0">
          · {distance < 1 ? `${(distance * 5280).toFixed(0)} ft` : `${distance.toFixed(1)} mi`}
        </span>
      )}
    </div>
  )
}

// ============================================
// PRICE DISPLAY
// ============================================

export interface PriceDisplayProps {
  amount?: number | null
  min?: number | null
  max?: number | null
  type: 'hourly' | 'fixed' | 'bidding'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceDisplay({ amount, min, max, type, size = 'md', className }: PriceDisplayProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val)

  let display: string
  let suffix: string = ''

  if (type === 'bidding') {
    display = 'Open to bids'
  } else if (amount) {
    display = formatPrice(amount)
    suffix = type === 'hourly' ? '/hr' : ''
  } else if (min && max) {
    display = `${formatPrice(min)} - ${formatPrice(max)}`
    suffix = type === 'hourly' ? '/hr' : ''
  } else if (min) {
    display = `${formatPrice(min)}+`
    suffix = type === 'hourly' ? '/hr' : ''
  } else {
    display = 'Quote on request'
  }

  return (
    <div className={cn('flex items-center gap-1', sizes[size], className)}>
      <DollarSign className="w-4 h-4 text-slate-400" />
      <span className="font-semibold text-slate-900">{display}</span>
      {suffix && <span className="text-slate-500">{suffix}</span>}
    </div>
  )
}

export default Card
