'use client'

import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, AlertCircle, CheckCircle, Search } from 'lucide-react'

// ============================================
// INPUT TYPES
// ============================================

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helper?: string
  error?: string
  success?: string
  size?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onRightIconClick?: () => void
  glowOnFocus?: boolean
}

// ============================================
// INPUT STYLES - DARK THEME
// ============================================

const baseStyles = `
  w-full bg-slate-800/50 text-white placeholder-slate-500
  transition-all duration-200 ease-out
  disabled:opacity-50 disabled:cursor-not-allowed
`

const sizeStyles = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-11 px-4 text-base rounded-xl',
  lg: 'h-13 px-5 text-lg rounded-xl',
}

const borderStyles = {
  default: 'border border-white/10 focus:border-cyan-500/50',
  error: 'border border-red-500/50 focus:border-red-500',
  success: 'border border-emerald-500/50 focus:border-emerald-500',
}

const focusStyles = {
  default: 'focus:outline-none focus:ring-2 focus:ring-cyan-500/20',
  error: 'focus:outline-none focus:ring-2 focus:ring-red-500/20',
  success: 'focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
}

const glowFocusStyles = 'focus:shadow-[0_0_20px_rgba(6,182,212,0.15)]'

// ============================================
// INPUT COMPONENT
// ============================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      helper,
      error,
      success,
      size = 'md',
      leftIcon,
      rightIcon,
      onRightIconClick,
      disabled,
      id,
      glowOnFocus = true,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || props.name || Math.random().toString(36).slice(2)
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    const state = error ? 'error' : success ? 'success' : 'default'

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-white mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            className={cn(
              baseStyles,
              sizeStyles[size],
              borderStyles[state],
              focusStyles[state],
              glowOnFocus && state === 'default' && glowFocusStyles,
              leftIcon && 'pl-10',
              (rightIcon || isPassword || error || success) && 'pr-10',
              className
            )}
            {...props}
          />
          {(rightIcon || isPassword || error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {error && !rightIcon && !isPassword && (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              {success && !error && !rightIcon && !isPassword && (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              )}
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white active:text-white focus:outline-none transition-colors p-1 touch-target"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              )}
              {rightIcon && !isPassword && (
                <button
                  type="button"
                  onClick={onRightIconClick}
                  className="text-slate-400 hover:text-white active:text-white focus:outline-none transition-colors p-1 touch-target"
                  tabIndex={-1}
                >
                  {rightIcon}
                </button>
              )}
            </div>
          )}
        </div>
        {(helper || error || success) && (
          <p
            className={cn(
              'mt-2 text-sm',
              error ? 'text-red-400' : success ? 'text-emerald-400' : 'text-slate-500'
            )}
          >
            {error || success || helper}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// ============================================
// SEARCH INPUT COMPONENT
// ============================================

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void
  isLoading?: boolean
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, isLoading, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch((e.target as HTMLInputElement).value)
      }
    }

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<Search className={cn('w-5 h-5', isLoading && 'animate-pulse')} />}
        onKeyDown={handleKeyDown}
        className={cn('pr-4', className)}
        {...props}
      />
    )
  }
)

SearchInput.displayName = 'SearchInput'

// ============================================
// TEXTAREA COMPONENT
// ============================================

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  helper?: string
  error?: string
  success?: string
  size?: 'sm' | 'md' | 'lg'
  glowOnFocus?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helper, error, success, size = 'md', id, glowOnFocus = true, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).slice(2)
    const state = error ? 'error' : success ? 'success' : 'default'

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-white mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            baseStyles,
            'min-h-[100px] py-3 resize-y',
            sizeStyles[size],
            borderStyles[state],
            focusStyles[state],
            glowOnFocus && state === 'default' && glowFocusStyles,
            className
          )}
          {...props}
        />
        {(helper || error || success) && (
          <p
            className={cn(
              'mt-2 text-sm',
              error ? 'text-red-400' : success ? 'text-emerald-400' : 'text-slate-500'
            )}
          >
            {error || success || helper}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// ============================================
// SELECT COMPONENT
// ============================================

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  helper?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  glowOnFocus?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, helper, error, options, placeholder, size = 'md', id, glowOnFocus = true, ...props },
    ref
  ) => {
    const inputId = id || props.name || Math.random().toString(36).slice(2)
    const state = error ? 'error' : 'default'

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-white mb-2"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            baseStyles,
            sizeStyles[size],
            borderStyles[state],
            focusStyles[state],
            glowOnFocus && state === 'default' && glowFocusStyles,
            'appearance-none bg-no-repeat bg-right pr-10 cursor-pointer',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 12px center',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {(helper || error) && (
          <p className={cn('mt-2 text-sm', error ? 'text-red-400' : 'text-slate-500')}>
            {error || helper}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

// ============================================
// TOGGLE COMPONENT
// ============================================

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, description, size = 'md', id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).slice(2)

    const sizeClasses = {
      sm: 'w-8 h-5',
      md: 'w-11 h-6',
      lg: 'w-14 h-7',
    }

    const dotSizes = {
      sm: 'w-3.5 h-3.5 peer-checked:translate-x-3',
      md: 'w-5 h-5 peer-checked:translate-x-5',
      lg: 'w-6 h-6 peer-checked:translate-x-7',
    }

    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'rounded-full bg-slate-700 transition-colors',
              'peer-checked:bg-cyan-500',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-950',
              'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
              sizeClasses[size],
              className
            )}
          />
          <div
            className={cn(
              'absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform',
              dotSizes[size]
            )}
          />
        </div>
        {(label || description) && (
          <div>
            {label && <span className="text-sm font-medium text-white">{label}</span>}
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
        )}
      </label>
    )
  }
)

Toggle.displayName = 'Toggle'

// ============================================
// CHECKBOX COMPONENT
// ============================================

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).slice(2)

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={cn(
            'mt-0.5 h-5 w-5 rounded border-slate-600 bg-slate-800 text-cyan-500',
            'focus:ring-cyan-500 focus:ring-offset-slate-950',
            'checked:bg-cyan-500 checked:border-cyan-500',
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div>
            {label && (
              <label htmlFor={inputId} className="text-sm font-medium text-white cursor-pointer">
                {label}
              </label>
            )}
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

// ============================================
// RADIO GROUP COMPONENT
// ============================================

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  label?: string
  error?: string
  className?: string
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
  className,
}: RadioGroupProps) {
  return (
    <div className={className}>
      {label && <p className="text-sm font-medium text-white mb-3">{label}</p>}
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start gap-3 cursor-pointer',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={option.disabled}
              className={cn(
                'mt-0.5 h-5 w-5 border-slate-600 bg-slate-800 text-cyan-500',
                'focus:ring-cyan-500 focus:ring-offset-slate-950'
              )}
            />
            <div>
              <span className="text-sm font-medium text-white">{option.label}</span>
              {option.description && (
                <p className="text-sm text-slate-500 mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  )
}

export default Input
