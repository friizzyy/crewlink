'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

// ============================================
// BUTTON TYPES
// ============================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'outline' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon-sm' | 'icon-md' | 'icon-lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  glow?: boolean
}

// ============================================
// BUTTON STYLES - PREMIUM DARK THEME
// ============================================

const baseStyles = `
  inline-flex items-center justify-center font-semibold
  transition-all duration-200 ease-out
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950
  disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none
  active:scale-[0.98]
`

const variants = {
  primary: `
    bg-gradient-to-r from-cyan-500 to-blue-600 text-white
    hover:from-cyan-400 hover:to-blue-500
    shadow-[0_4px_14px_-2px_rgba(6,182,212,0.2)]
    hover:shadow-[0_6px_20px_-2px_rgba(6,182,212,0.25)]
    focus-visible:ring-cyan-500
  `,
  secondary: `
    bg-slate-800 text-white
    border border-white/10
    hover:bg-slate-700 hover:border-white/20
    focus-visible:ring-slate-500
  `,
  ghost: `
    text-slate-400 bg-transparent
    hover:text-white hover:bg-white/5
    active:bg-white/10
    focus-visible:ring-white/20
  `,
  accent: `
    bg-gradient-to-r from-purple-500 to-pink-600 text-white
    hover:from-purple-400 hover:to-pink-500
    shadow-[0_4px_14px_-2px_rgba(139,92,246,0.2)]
    hover:shadow-[0_6px_20px_-2px_rgba(139,92,246,0.25)]
    focus-visible:ring-purple-500
  `,
  danger: `
    bg-gradient-to-r from-red-600 to-rose-600 text-white
    hover:from-red-500 hover:to-rose-500
    shadow-[0_4px_14px_-2px_rgba(239,68,68,0.2)]
    hover:shadow-[0_6px_20px_-2px_rgba(239,68,68,0.25)]
    focus-visible:ring-red-500
  `,
  success: `
    bg-gradient-to-r from-emerald-500 to-teal-600 text-white
    hover:from-emerald-400 hover:to-teal-500
    shadow-[0_4px_14px_-2px_rgba(16,185,129,0.2)]
    hover:shadow-[0_6px_20px_-2px_rgba(16,185,129,0.25)]
    focus-visible:ring-emerald-500
  `,
  outline: `
    border border-cyan-500/30 text-cyan-400 bg-transparent
    hover:bg-cyan-500/10 hover:border-cyan-500/60
    focus-visible:ring-cyan-500
  `,
}

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
  xl: 'h-14 px-8 text-lg rounded-2xl gap-3',
  'icon-sm': 'h-8 w-8 p-0 rounded-lg',
  'icon-md': 'h-10 w-10 p-0 rounded-xl',
  'icon-lg': 'h-12 w-12 p-0 rounded-xl',
}

// Glow animation keyframes
const glowStyles = `
  relative overflow-hidden
  before:absolute before:inset-0 before:rounded-[inherit]
  before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
  before:translate-x-[-200%] hover:before:translate-x-[200%]
  before:transition-transform before:duration-700 before:ease-out
`

// ============================================
// BUTTON COMPONENT
// ============================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      glow = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isIconOnly = size.startsWith('icon-')

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          isLoading && 'cursor-wait',
          glow && variant === 'primary' && glowStyles,
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2
              className="animate-spin"
              size={size === 'sm' || size === 'icon-sm' ? 14 : size === 'lg' || size === 'xl' || size === 'icon-lg' ? 20 : 16}
            />
            {!isIconOnly && children && <span className="opacity-0">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// ============================================
// ICON BUTTON VARIANT
// ============================================

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon-md', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn('aspect-square p-0', className)}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

// ============================================
// LINK BUTTON (looks like a link)
// ============================================

export interface LinkButtonProps extends ButtonProps {}

export const LinkButton = forwardRef<HTMLButtonElement, LinkButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'text-cyan-400 hover:text-cyan-300 font-medium underline-offset-4 hover:underline',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          'disabled:opacity-50 disabled:pointer-events-none',
          'transition-colors duration-200',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

LinkButton.displayName = 'LinkButton'

// ============================================
// GLOW BUTTON (with animated glow effect)
// ============================================

export interface GlowButtonProps extends ButtonProps {}

export const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative group">
        {/* Animated glow background */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-15 group-hover:opacity-30 transition-opacity duration-500" />
        <Button
          ref={ref}
          variant="primary"
          className={cn('relative', className)}
          {...props}
        >
          {children}
        </Button>
      </div>
    )
  }
)

GlowButton.displayName = 'GlowButton'

export default Button
