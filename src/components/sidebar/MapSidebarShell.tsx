'use client'

import { useState, useEffect, ReactNode, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, MapPin, Navigation, ChevronDown, ChevronLeft,
  Briefcase, Users, SlidersHorizontal, Filter, List, Map as MapIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LiveDot, CategoryDropdown, BudgetDropdown } from '@/components/ui'

// ============================================
// TYPES
// ============================================

export type SidebarMode = 'work' | 'hire'

export interface CategoryConfig {
  id: string
  label: string
  icon: string
}

export interface MapSidebarShellProps {
  /** Mode determines color scheme: 'work' = emerald, 'hire' = cyan */
  mode: SidebarMode
  /** Categories for the chip row */
  categories: CategoryConfig[]
  /** Currently selected category */
  selectedCategory: string
  /** Callback when category changes */
  onCategoryChange: (category: string) => void
  /** Search query value */
  searchQuery: string
  /** Callback when search query changes */
  onSearchChange: (query: string) => void
  /** Placeholder text for search input */
  searchPlaceholder: string
  /** Results count to display */
  resultsCount: number
  /** Label for results (e.g., "jobs found", "workers available") */
  resultsLabel: string
  /** City name if selected */
  cityName?: string | null
  /** Callback when city change button is clicked */
  onChangeCity: () => void
  /** Callback when "Find near me" is clicked */
  onFindNearMe: () => void
  /** Whether an item is selected (for width expansion) */
  hasSelectedItem: boolean
  /** Render the list items */
  children: ReactNode
  /** Optional view toggle for hiring mode (My Job Posts / Companies) */
  viewToggle?: {
    options: { id: string; label: string }[]
    selected: string
    onChange: (id: string) => void
  }
  /** Optional extended filters panel content */
  filtersPanel?: ReactNode
  /** Optional control bar with dropdown filters (category, budget) */
  showDropdownFilters?: boolean
  /** Budget filter value */
  budgetFilter?: string
  /** Callback when budget filter changes */
  onBudgetChange?: (value: string) => void
  /** Whether extended filters are visible */
  showFilters?: boolean
  /** Callback to toggle extended filters */
  onToggleFilters?: () => void
  /** Role indicator label */
  roleLabel: string
}

// ============================================
// MODE-SPECIFIC STYLING
// ============================================
const modeStyles = {
  work: {
    indicator: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    inputFocus: 'focus:ring-emerald-500/30 focus:border-emerald-500/50',
    toggle: 'bg-emerald-500/20 text-emerald-400',
    pill: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20',
    pillInactive: 'bg-slate-800/80 text-slate-400 hover:bg-slate-700/80 hover:text-slate-300 border border-white/[0.06]',
    filterActive: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400',
    chip: 'bg-emerald-500/10 text-emerald-400',
    liveDot: 'green' as const,
  },
  hire: {
    indicator: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    inputFocus: 'focus:ring-cyan-500/30 focus:border-cyan-500/50',
    toggle: 'bg-cyan-500/20 text-cyan-400',
    pill: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20',
    pillInactive: 'bg-slate-800/80 text-slate-400 hover:bg-slate-700/80 hover:text-slate-300 border border-white/[0.06]',
    filterActive: 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400',
    chip: 'bg-cyan-500/10 text-cyan-400',
    liveDot: 'cyan' as const,
  },
}

// ============================================
// MAP SIDEBAR SHELL COMPONENT
// ============================================
export function MapSidebarShell({
  mode,
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  resultsCount,
  resultsLabel,
  cityName,
  onChangeCity,
  onFindNearMe,
  hasSelectedItem,
  children,
  viewToggle,
  filtersPanel,
  showDropdownFilters = false,
  budgetFilter = 'any',
  onBudgetChange,
  showFilters = false,
  onToggleFilters,
  roleLabel,
}: MapSidebarShellProps) {
  const styles = modeStyles[mode]
  const ModeIcon = mode === 'work' ? Briefcase : Users

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-full z-20',
        // Premium glassmorphism
        'bg-slate-900/95 backdrop-blur-xl',
        'border-r border-white/[0.06]',
        // Smooth width transition
        'transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        hasSelectedItem ? 'w-[480px]' : 'w-[420px]'
      )}
    >
      {/* ============ SIDEBAR HEADER ============ */}
      <header className="p-5 border-b border-white/[0.06] space-y-4">
        {/* Top Row: Mode + City */}
        <div className="flex items-center justify-between">
          {/* Mode Indicator - Refined */}
          <div className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium',
            'transition-colors duration-200',
            styles.indicator
          )}>
            <ModeIcon className="w-4 h-4" />
            <span>{roleLabel}</span>
          </div>

          {/* City / Location Button */}
          {cityName ? (
            <button
              onClick={onChangeCity}
              className={cn(
                'group flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm',
                'bg-slate-800/60 border border-white/[0.06]',
                'text-slate-400 hover:text-white hover:bg-slate-800/80',
                'transition-all duration-200'
              )}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-medium">{cityName}</span>
              <span className="text-slate-600 group-hover:text-slate-400 text-xs">Change</span>
            </button>
          ) : (
            <button
              onClick={onFindNearMe}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm',
                'bg-slate-800/60 border border-white/[0.06]',
                'text-slate-400 hover:text-white hover:bg-slate-800/80',
                'transition-all duration-200'
              )}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Find near me</span>
            </button>
          )}
        </div>

        {/* Search Input - Elevated */}
        <div className="relative group">
          <Search className={cn(
            'absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]',
            'text-slate-500 group-focus-within:text-slate-400',
            'transition-colors duration-200'
          )} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              'w-full pl-11 pr-4 py-3',
              'bg-slate-800/50 border border-white/[0.08] rounded-xl',
              'text-white placeholder-slate-500 text-sm',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:bg-slate-800/70',
              styles.inputFocus
            )}
          />
        </div>

        {/* View Toggle (if provided) */}
        {viewToggle && (
          <div className="flex bg-slate-800/40 rounded-xl p-1 border border-white/[0.04]">
            {viewToggle.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => viewToggle.onChange(opt.id)}
                className={cn(
                  'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium',
                  'transition-all duration-200',
                  viewToggle.selected === opt.id
                    ? styles.toggle
                    : 'text-slate-400 hover:text-slate-300'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Filter Controls */}
        {showDropdownFilters ? (
          <div className="flex gap-2">
            <CategoryDropdown
              value={selectedCategory}
              onChange={onCategoryChange}
              className="flex-1"
            />
            {onBudgetChange && (
              <BudgetDropdown
                value={budgetFilter}
                onChange={onBudgetChange}
                className="flex-1"
              />
            )}
            {onToggleFilters && (
              <button
                onClick={onToggleFilters}
                className={cn(
                  'p-2.5 rounded-xl border',
                  'transition-all duration-200',
                  showFilters
                    ? styles.filterActive
                    : 'bg-slate-800/60 border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
                )}
                title="More filters"
                aria-label="Toggle additional filters"
                aria-pressed={showFilters}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          /* Category Pills - Scrollable with fade edges */
          <div className="relative -mx-5">
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-1 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

            <div className="flex gap-2 overflow-x-auto pb-1 px-5 scrollbar-hide scroll-smooth">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap shrink-0',
                    'transition-all duration-200',
                    selectedCategory === cat.id
                      ? styles.pill
                      : styles.pillInactive
                  )}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ============ RESULTS BAR ============ */}
      <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            <span className="font-semibold text-white tabular-nums">{resultsCount}</span>
            {' '}{resultsLabel}
          </span>
          {selectedCategory !== 'all' && !showDropdownFilters && (
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              styles.chip
            )}>
              {categories.find(c => c.id === selectedCategory)?.label}
            </span>
          )}
          <LiveDot variant={styles.liveDot} size="sm" />
        </div>

        {!showDropdownFilters && onToggleFilters && (
          <button
            onClick={onToggleFilters}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
              'bg-slate-800/60 border border-white/[0.06]',
              'text-slate-400 hover:text-white hover:bg-slate-800/80',
              'transition-all duration-200'
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform duration-200',
              showFilters && 'rotate-180'
            )} />
          </button>
        )}
      </div>

      {/* ============ EXTENDED FILTERS PANEL ============ */}
      {showFilters && filtersPanel && (
        <div className={cn(
          'px-5 py-4 border-b border-white/[0.06]',
          'bg-slate-800/30 space-y-4',
          'animate-fadeInUp'
        )}>
          {filtersPanel}
        </div>
      )}

      {/* ============ LIST CONTENT ============ */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {children}
      </div>
    </aside>
  )
}

// ============================================
// MOBILE BOTTOM SHEET COMPONENT
// Elevated with better spacing and polish
// ============================================
export interface MobileBottomSheetProps {
  mode: SidebarMode
  categories: CategoryConfig[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  resultsCount: number
  resultsLabel: string
  viewMode: 'map' | 'list'
  onToggleViewMode: () => void
}

export function MobileBottomSheet({
  mode,
  categories,
  selectedCategory,
  onCategoryChange,
  resultsCount,
  resultsLabel,
  viewMode,
  onToggleViewMode,
}: MobileBottomSheetProps) {
  const ViewIcon = viewMode === 'map' ? List : MapIcon
  const styles = modeStyles[mode]

  return (
    <div className="lg:hidden fixed bottom-16 left-0 right-0 z-[35]" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className={cn(
        'bg-slate-900/95 backdrop-blur-xl',
        'border-t border-white/[0.08]',
        'px-4 pt-3 pb-4',
        'animate-slideUp'
      )}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {/* Live indicator */}
            <span className="relative flex h-2.5 w-2.5">
              <span className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                mode === 'work' ? 'bg-emerald-400' : 'bg-cyan-400'
              )} />
              <span className={cn(
                'relative inline-flex rounded-full h-2.5 w-2.5',
                mode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
              )} />
            </span>
            <span className="text-sm font-medium text-white">
              <span className="tabular-nums">{resultsCount}</span>
              {' '}{resultsLabel}
            </span>
          </div>

          {/* View toggle button */}
          <button
            onClick={onToggleViewMode}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm',
              'bg-slate-800/60 border border-white/[0.06]',
              'text-slate-400 hover:text-white',
              'transition-all duration-200'
            )}
          >
            <ViewIcon className="w-4 h-4" />
            <span>{viewMode === 'map' ? 'List' : 'Map'}</span>
          </button>
        </div>

        {/* Category chips - sized for 44px touch targets */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide scroll-momentum">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 min-h-[36px]',
                'border transition-all duration-200',
                selectedCategory === cat.id
                  ? cn(
                      mode === 'work'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                    )
                  : 'bg-slate-800/60 text-slate-400 border-white/[0.06] hover:text-slate-300'
              )}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MapSidebarShell
