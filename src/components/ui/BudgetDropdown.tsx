'use client'

import { Dropdown, DropdownOption } from './Dropdown'

const budgetOptions: DropdownOption[] = [
  { id: 'any', label: 'Any', icon: '💰' },
  { id: '0-50', label: 'Under $50', icon: '$' },
  { id: '50-100', label: '$50 - $100', icon: '$$' },
  { id: '100-200', label: '$100 - $200', icon: '$$$' },
  { id: '200-500', label: '$200 - $500', icon: '$$$$' },
  { id: '500+', label: '$500+', icon: '$$$$$' },
]

interface BudgetDropdownProps {
  value: string
  onChange: (value: string) => void
  className?: string
  /** Color mode for dropdown styling */
  mode?: 'work' | 'hire'
}

// Helper to parse budget filter value to min/max
export function parseBudgetFilter(value: string): { min: number; max: number } {
  switch (value) {
    case '0-50':
      return { min: 0, max: 50 }
    case '50-100':
      return { min: 50, max: 100 }
    case '100-200':
      return { min: 100, max: 200 }
    case '200-500':
      return { min: 200, max: 500 }
    case '500+':
      return { min: 500, max: 999999 }
    case 'any':
    default:
      return { min: 0, max: 999999 }
  }
}

export function BudgetDropdown({ value, onChange, className, mode = 'hire' }: BudgetDropdownProps) {
  return (
    <Dropdown
      label="Budget"
      value={value}
      options={budgetOptions}
      onChange={onChange}
      className={className}
      menuAlign="right"
      mode={mode}
    />
  )
}

export default BudgetDropdown
