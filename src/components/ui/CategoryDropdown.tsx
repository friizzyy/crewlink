'use client'

import { Dropdown, DropdownOption } from './Dropdown'
import { getCategoryDropdownOptions } from '@/lib/categories'

// Use canonical categories from lib/categories.ts
const categoryOptions: DropdownOption[] = getCategoryDropdownOptions()

interface CategoryDropdownProps {
  value: string
  onChange: (value: string) => void
  className?: string
  /** Color mode for dropdown styling */
  mode?: 'work' | 'hire'
}

export function CategoryDropdown({ value, onChange, className, mode = 'hire' }: CategoryDropdownProps) {
  return (
    <Dropdown
      label="Category"
      value={value}
      options={categoryOptions}
      onChange={onChange}
      className={className}
      mode={mode}
    />
  )
}

export default CategoryDropdown
