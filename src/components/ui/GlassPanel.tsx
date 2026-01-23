'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// GLASS PANEL COMPONENT
// Premium glassmorphism container
// ============================================

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle' | 'solid'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  border?: 'none' | 'light' | 'glow'
  rounded?: 'none' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  blur?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  glowOnHover?: boolean
}

const variants = {
  default: 'bg-slate-900/80 backdrop-blur-md',
  elevated: 'bg-slate-900/90 backdrop-blur-lg shadow-xl',
  subtle: 'bg-slate-900/60 backdrop-blur-sm',
  solid: 'bg-slate-900',
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
}

const borders = {
  none: '',
  light: 'border border-white/5',
  glow: 'border border-cyan-500/20',
}

const roundedSizes = {
  none: '',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  '2xl': 'rounded-3xl',
  '3xl': 'rounded-[2rem]',
}

const blurLevels = {
  none: 'backdrop-blur-none',
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      border = 'light',
      rounded = 'xl',
      blur = 'md',
      hoverable = false,
      glowOnHover = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          paddings[padding],
          borders[border],
          roundedSizes[rounded],
          blur !== 'none' && blurLevels[blur],
          hoverable && 'transition-all duration-200 hover:bg-slate-900/90 cursor-pointer',
          glowOnHover && 'hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassPanel.displayName = 'GlassPanel'

// ============================================
// GLASS CARD COMPONENT
// Interactive card with glass effect
// ============================================

export interface GlassCardProps extends GlassPanelProps {
  interactive?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, interactive = true, children, ...props }, ref) => {
    return (
      <GlassPanel
        ref={ref}
        variant="default"
        border="light"
        rounded="xl"
        padding="lg"
        hoverable={interactive}
        glowOnHover={interactive}
        className={cn(
          interactive && 'active:scale-[0.99]',
          className
        )}
        {...props}
      >
        {children}
      </GlassPanel>
    )
  }
)

GlassCard.displayName = 'GlassCard'

// ============================================
// FEATURE CARD COMPONENT
// Card with gradient border and shine effect
// ============================================

export interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: 'cyan' | 'purple' | 'emerald' | 'amber'
  shine?: boolean
}

const gradients = {
  cyan: 'from-cyan-500/20 via-blue-500/20 to-cyan-500/20',
  purple: 'from-purple-500/20 via-pink-500/20 to-purple-500/20',
  emerald: 'from-emerald-500/20 via-teal-500/20 to-emerald-500/20',
  amber: 'from-amber-500/20 via-orange-500/20 to-amber-500/20',
}

const borderGradients = {
  cyan: 'from-cyan-500/50 via-blue-500/50 to-cyan-500/50',
  purple: 'from-purple-500/50 via-pink-500/50 to-purple-500/50',
  emerald: 'from-emerald-500/50 via-teal-500/50 to-emerald-500/50',
  amber: 'from-amber-500/50 via-orange-500/50 to-amber-500/50',
}

export const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, gradient = 'cyan', shine = false, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative group', className)} {...props}>
        {/* Gradient border */}
        <div
          className={cn(
            'absolute -inset-px rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500',
            borderGradients[gradient]
          )}
        />
        {/* Card content */}
        <div
          className={cn(
            'relative bg-slate-900/90 backdrop-blur-sm rounded-2xl p-6 border border-white/5',
            'transition-all duration-300 group-hover:border-transparent',
            shine && 'overflow-hidden'
          )}
        >
          {/* Shine effect */}
          {shine && (
            <div
              className={cn(
                'absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000',
                'bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12'
              )}
            />
          )}
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    )
  }
)

FeatureCard.displayName = 'FeatureCard'

export default GlassPanel
