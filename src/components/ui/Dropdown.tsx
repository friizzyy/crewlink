'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DropdownOption {
  id: string
  label: string
  icon?: string | ReactNode
  description?: string
}

interface DropdownProps {
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  className?: string
  menuAlign?: 'left' | 'right'
  /** Color mode for selected state accent */
  mode?: 'work' | 'hire'
}

// Mode-specific styling
const modeStyles = {
  work: {
    focusBorder: 'border-emerald-500/50',
    focusBg: 'bg-emerald-500/5',
    selected: 'bg-emerald-500/10 text-emerald-400',
    check: 'text-emerald-400',
  },
  hire: {
    focusBorder: 'border-cyan-500/50',
    focusBg: 'bg-cyan-500/5',
    selected: 'bg-cyan-500/10 text-cyan-400',
    check: 'text-cyan-400',
  },
}

export function Dropdown({
  label,
  value,
  options,
  onChange,
  className,
  menuAlign = 'left',
  mode = 'hire',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const styles = modeStyles[mode]

  const selectedOption = options.find((opt) => opt.id === value)
  const displayValue = selectedOption?.label || 'All'

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleSelect = (optionId: string) => {
    onChange(optionId)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button - Elevated */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'flex items-center justify-between gap-2 px-3 py-2.5 w-full',
          'bg-slate-800/60 border rounded-xl text-sm',
          'transition-all duration-200',
          isOpen
            ? cn(styles.focusBorder, styles.focusBg)
            : 'border-white/[0.08] hover:border-white/20 hover:bg-slate-800/80'
        )}
      >
        <span className="text-slate-400 truncate text-[13px]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-medium truncate max-w-[100px]">
            {displayValue}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-slate-500 shrink-0',
              'transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu - Elevated */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={label}
          className={cn(
            'absolute top-full mt-2 z-50',
            'min-w-full w-max max-w-[320px]',
            // Premium glassmorphism
            'bg-slate-800/95 backdrop-blur-xl',
            'border border-white/[0.08] rounded-xl',
            'shadow-xl shadow-black/30',
            'py-1.5 overflow-hidden',
            // Animation
            'animate-fadeInScale',
            menuAlign === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
            {options.map((option) => {
              const isSelected = value === option.id

              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5',
                    'text-left transition-all duration-150',
                    isSelected
                      ? styles.selected
                      : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                  )}
                >
                  {/* Icon */}
                  {option.icon && (
                    <span className="text-base shrink-0 w-6 text-center">
                      {typeof option.icon === 'string' ? option.icon : option.icon}
                    </span>
                  )}

                  {/* Label & Description */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm block truncate">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-slate-500 block truncate mt-0.5">
                        {option.description}
                      </span>
                    )}
                  </div>

                  {/* Check mark */}
                  {isSelected && (
                    <Check className={cn('w-4 h-4 shrink-0', styles.check)} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dropdown
