'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, Filter, MapPin, Clock, DollarSign, Users,
  ChevronDown, Star, Bookmark, BookmarkCheck, AlertCircle,
  Zap, Calendar, CheckCircle2, Briefcase, Loader2, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatRelativeTime } from '@/lib/utils'
import { Skeleton, SkeletonJobCard } from '@/components/ui/Skeleton'
import { CATEGORIES, ALL_CATEGORY, getCategoryIcon } from '@/lib/categories'
import { AmbientBackground } from '@/components/AmbientBackground'
import { GlassPanel, GlassCard, FeatureCard, Button } from '@/components/ui'

// ============================================
// TYPES
// ============================================

interface JobPoster {
  id: string
  name: string | null
  avatarUrl: string | null
  image: string | null
  hirerProfile: {
    companyName: string | null
    averageRating: number
    isVerified: boolean
  } | null
}

interface JobItem {
  id: string
  title: string
  description: string
  category: string
  address: string
  city: string | null
  lat: number
  lng: number
  isRemote: boolean
  scheduleType: string
  startDate: string | null
  endDate: string | null
  estimatedHours: number | null
  budgetType: string
  budgetMin: number | null
  budgetMax: number | null
  status: string
  viewCount: number
  bidCount: number
  createdAt: string
  updatedAt: string
  poster: JobPoster
}

interface PaginationInfo {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

interface JobsApiResponse {
  success: boolean
  data: JobItem[]
  pagination: PaginationInfo
  error?: string
}

interface AISearchFilters {
  category: string | null
  location: string | null
  budgetMin: number | null
  budgetMax: number | null
  scheduleType: string | null
  skills: string[]
  searchTerms: string[]
}

interface AISearchResponse {
  success: boolean
  data: AISearchFilters
  cached: boolean
}

// ============================================
// CONSTANTS
// ============================================

const JOBS_PER_PAGE = 20

const categories = [
  { id: ALL_CATEGORY.slug, label: 'All Jobs', icon: ALL_CATEGORY.icon },
  ...CATEGORIES.map((cat) => ({
    id: cat.slug,
    label: cat.label,
    icon: cat.icon,
  })),
]

type UrgencyKey = 'asap' | 'specific' | 'flexible'

interface UrgencyConfigItem {
  label: string
  color: string
  icon: React.ComponentType<{ className?: string }>
}

const urgencyConfig: Record<UrgencyKey, UrgencyConfigItem> = {
  asap: { label: 'ASAP', color: 'bg-red-500/20 text-red-400', icon: Zap },
  specific: { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-400', icon: Calendar },
  flexible: { label: 'Flexible', color: 'bg-slate-500/20 text-slate-400', icon: Calendar },
}

// ============================================
// HELPERS
// ============================================

function deriveUrgency(job: JobItem): UrgencyKey {
  const schedule = job.scheduleType as string
  if (schedule === 'asap') return 'asap'
  if (schedule === 'specific') return 'specific'

  // If there's a startDate that's today or in the past, treat as urgent
  if (job.startDate) {
    const start = new Date(job.startDate)
    const now = new Date()
    const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (diffHours <= 24) return 'asap'
    if (diffHours <= 168) return 'specific' // within a week
  }

  return 'flexible'
}

function getPosterDisplayName(poster: JobPoster): string {
  if (poster.hirerProfile?.companyName) return poster.hirerProfile.companyName
  if (poster.name) return poster.name
  return 'Anonymous'
}

function getPosterInitial(poster: JobPoster): string {
  const name = getPosterDisplayName(poster)
  return name.charAt(0).toUpperCase()
}

function getPosterAvatar(poster: JobPoster): string | null {
  return poster.avatarUrl || poster.image || null
}

function formatBudgetRange(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `$${min} - $${max}`
  if (min !== null) return `$${min}+`
  if (max !== null) return `Up to $${max}`
  return 'Open budget'
}

// ============================================
// SKELETON LOADING COMPONENT
// ============================================

function JobListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-5"
        >
          <div className="flex gap-4">
            {/* Category icon skeleton */}
            <Skeleton variant="rectangular" className="w-14 h-14 rounded-xl shrink-0" />

            <div className="flex-1 min-w-0 space-y-4">
              {/* Title + badge row */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/5" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                </div>
                <Skeleton variant="rectangular" className="h-6 w-16 rounded-full shrink-0" />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-6">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton variant="circular" className="h-6 w-6" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <Skeleton variant="rectangular" className="h-9 w-28 rounded-xl" />
                <Skeleton variant="rectangular" className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function WorkJobsPage() {
  // State
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isAISearching, setIsAISearching] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState('relevance')
  const [aiFilters, setAiFilters] = useState<AISearchFilters | null>(null)
  const [error, setError] = useState<string | null>(null)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchInput])

  // Build query params from current state
  const buildQueryParams = useCallback(
    (offset: number): URLSearchParams => {
      const params = new URLSearchParams()
      params.set('limit', String(JOBS_PER_PAGE))
      params.set('offset', String(offset))
      params.set('status', 'posted')

      // Category from direct selection or AI filter
      const effectiveCategory = selectedCategory !== 'all'
        ? selectedCategory
        : aiFilters?.category || null

      if (effectiveCategory) {
        params.set('category', effectiveCategory)
      }

      // Search terms
      if (debouncedSearch && (!aiFilters || !aiFilters.searchTerms.length)) {
        params.set('search', debouncedSearch)
      } else if (aiFilters?.searchTerms.length) {
        params.set('search', aiFilters.searchTerms.join(' '))
      }

      // City from AI filter
      if (aiFilters?.location) {
        params.set('city', aiFilters.location)
      }

      // Budget filters from AI
      if (aiFilters?.budgetMin !== null && aiFilters?.budgetMin !== undefined) {
        params.set('budgetMin', String(aiFilters.budgetMin))
      }
      if (aiFilters?.budgetMax !== null && aiFilters?.budgetMax !== undefined) {
        params.set('budgetMax', String(aiFilters.budgetMax))
      }

      return params
    },
    [selectedCategory, debouncedSearch, aiFilters]
  )

  // Fetch jobs from API
  const fetchJobs = useCallback(
    async (offset: number, append: boolean = false) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      if (append) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
        setError(null)
      }

      try {
        const params = buildQueryParams(offset)
        const response = await fetch(`/api/jobs?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch jobs (${response.status})`)
        }

        const result: JobsApiResponse = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch jobs')
        }

        if (append) {
          setJobs((prev) => [...prev, ...result.data])
        } else {
          setJobs(result.data)
        }

        setPagination(result.pagination)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return // Silently ignore aborted requests
        }
        const message =
          err instanceof Error ? err.message : 'Something went wrong'
        setError(message)
        if (!append) {
          setJobs([])
          setPagination(null)
        }
        toast.error(message)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [buildQueryParams]
  )

  // AI-powered search
  const performAISearch = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setAiFilters(null)
        return
      }

      setIsAISearching(true)

      try {
        const response = await fetch('/api/ai/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })

        if (!response.ok) {
          // AI search is optional; fall back to basic search silently
          setAiFilters(null)
          return
        }

        const result: AISearchResponse = await response.json()

        if (result.success && result.data) {
          setAiFilters(result.data)

          // If AI detected a specific category, auto-select it
          if (result.data.category && selectedCategory === 'all') {
            // Don't overwrite manual category selection
          }
        } else {
          setAiFilters(null)
        }
      } catch {
        // AI search failure is non-critical
        setAiFilters(null)
      } finally {
        setIsAISearching(false)
      }
    },
    [selectedCategory]
  )

  // Trigger AI search when debounced search changes
  useEffect(() => {
    if (debouncedSearch.trim().length >= 3) {
      performAISearch(debouncedSearch.trim())
    } else {
      setAiFilters(null)
    }
  }, [debouncedSearch, performAISearch])

  // Fetch jobs when filters change
  useEffect(() => {
    fetchJobs(0)
  }, [fetchJobs])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Load more
  const handleLoadMore = useCallback(() => {
    if (!pagination || !pagination.hasMore || isLoadingMore) return
    const nextOffset = pagination.offset + pagination.limit
    fetchJobs(nextOffset, true)
  }, [pagination, isLoadingMore, fetchJobs])

  // Category change resets offset
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    // If the user manually picks a category, clear AI category filter
    if (categoryId !== 'all') {
      setAiFilters((prev) =>
        prev ? { ...prev, category: null } : null
      )
    }
  }, [])

  // Toggle saved/bookmarked job (local state only)
  const toggleSaved = useCallback((jobId: string) => {
    setSavedJobs((prev) => {
      const next = new Set(prev)
      if (next.has(jobId)) {
        next.delete(jobId)
      } else {
        next.add(jobId)
      }
      return next
    })
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchInput('')
    setDebouncedSearch('')
    setSelectedCategory('all')
    setAiFilters(null)
    setSortBy('relevance')
  }, [])

  // Sort jobs client-side for relevance/pay/newest options
  const sortedJobs = useMemo(() => {
    const sorted = [...jobs]
    switch (sortBy) {
      case 'newest':
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'highest-pay':
        sorted.sort((a, b) => {
          const aMax = a.budgetMax ?? a.budgetMin ?? 0
          const bMax = b.budgetMax ?? b.budgetMin ?? 0
          return bMax - aMax
        })
        break
      case 'closest':
        // Without user location, sort by city alphabetically as a fallback
        sorted.sort((a, b) => (a.city || '').localeCompare(b.city || ''))
        break
      default:
        // "relevance" - keep API order
        break
    }
    return sorted
  }, [jobs, sortBy])

  // Computed totals
  const totalCount = pagination?.total ?? 0
  const showingCount = jobs.length

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8 relative">
      <AmbientBackground />

      {/* Header */}
      <div className="border-b border-emerald-500/20 shadow-[0_1px_12px_-2px_rgba(16,185,129,0.06)] bg-slate-900/50 relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Find Jobs</h1>
              <p className="text-slate-400 mt-1">
                {isLoading
                  ? 'Loading jobs...'
                  : `${totalCount} job${totalCount !== 1 ? 's' : ''} available near you`}
              </p>
            </div>
            <Link
              href="/work/map"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-xl hover:bg-emerald-500/20 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Map View
            </Link>
          </div>

          {/* Search */}
          <GlassPanel variant="default" padding="none" border="glow" rounded="xl" className="border-emerald-500/20 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)] transition-shadow duration-300">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search for jobs... (try 'cleaning in San Francisco under $200')"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-transparent text-white placeholder-slate-500 focus:outline-none"
                aria-label="Search for jobs"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isAISearching ? (
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-medium">AI</span>
                  </div>
                ) : (
                  <Sparkles className="w-4 h-4 text-emerald-400/40 animate-pulse" />
                )}
              </div>
            </div>
          </GlassPanel>

          {/* AI filter indicator */}
          {aiFilters && (
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-xs text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-powered search active</span>
              {aiFilters.category && (
                <span className="px-2 py-0.5 bg-emerald-500/10 rounded-full">
                  {aiFilters.category}
                </span>
              )}
              {aiFilters.location && (
                <span className="px-2 py-0.5 bg-emerald-500/10 rounded-full">
                  {aiFilters.location}
                </span>
              )}
              {aiFilters.budgetMin !== null && aiFilters.budgetMax !== null && (
                <span className="px-2 py-0.5 bg-emerald-500/10 rounded-full">
                  ${aiFilters.budgetMin} - ${aiFilters.budgetMax}
                </span>
              )}
              <button
                onClick={() => setAiFilters(null)}
                className="ml-1 text-slate-500 hover:text-white transition-colors underline"
              >
                Clear AI filters
              </button>
            </div>
          )}

          {/* Categories */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white border border-transparent'
                )}
                aria-pressed={selectedCategory === cat.id}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="max-w-5xl mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-xl text-sm text-slate-400 focus:outline-none cursor-pointer"
              aria-label="Sort jobs"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="newest">Sort: Newest</option>
              <option value="highest-pay">Sort: Highest Pay</option>
              <option value="closest">Sort: Closest</option>
            </select>
          </div>
          <div className="text-sm text-slate-500">
            {isLoading ? (
              <Skeleton className="h-4 w-32 inline-block" />
            ) : (
              `Showing ${showingCount} of ${totalCount} jobs`
            )}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Loading State */}
        {isLoading && <JobListSkeleton count={5} />}

        {/* Error State */}
        {!isLoading && error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Failed to load jobs
            </h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Button variant="success" onClick={() => fetchJobs(0)}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && sortedJobs.length === 0 && (
          <FeatureCard gradient="emerald" shine className="mt-8">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                No jobs found
              </h2>
              <p className="text-slate-400 mb-6">
                Try adjusting your filters or search query
              </p>
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </FeatureCard>
        )}

        {/* Job Cards */}
        {!isLoading && !error && sortedJobs.length > 0 && (
          <div className="space-y-4">
            {sortedJobs.map((job, index) => {
              const urgency = deriveUrgency(job)
              const urgencyInfo = urgencyConfig[urgency]
              const UrgencyIcon = urgencyInfo.icon
              const isSaved = savedJobs.has(job.id)
              const posterName = getPosterDisplayName(job.poster)
              const posterInitial = getPosterInitial(job.poster)
              const posterAvatar = getPosterAvatar(job.poster)
              const categoryIcon = getCategoryIcon(job.category)
              const hirerRating = job.poster.hirerProfile?.averageRating ?? 0

              return (
                <GlassCard
                  key={job.id}
                  interactive={false}
                  padding="lg"
                  className="animate-card-enter hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-300"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex gap-4">
                    {/* Category Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-3xl shrink-0 shadow-[0_4px_12px_-2px_rgba(16,185,129,0.1)]">
                      {categoryIcon}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/work/job/${job.id}`}
                            className="text-lg font-semibold text-white hover:text-emerald-400 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.city || job.address}
                            </div>
                            <span>•</span>
                            <span>{formatRelativeTime(job.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full',
                              urgencyInfo.color
                            )}
                          >
                            <UrgencyIcon className="w-3.5 h-3.5" />
                            {urgencyInfo.label}
                          </span>
                          <button
                            onClick={() => toggleSaved(job.id)}
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              isSaved
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                            aria-label={
                              isSaved ? 'Remove bookmark' : 'Bookmark job'
                            }
                          >
                            {isSaved ? (
                              <BookmarkCheck className="w-5 h-5" />
                            ) : (
                              <Bookmark className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-400 mt-3 line-clamp-2">
                        {job.description}
                      </p>

                      {/* Stats & Hirer Info */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">
                              {formatBudgetRange(job.budgetMin, job.budgetMax)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Users className="w-4 h-4" />
                            <span>
                              {job.bidCount} bid{job.bidCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          {posterAvatar ? (
                            <img
                              src={posterAvatar}
                              alt={posterName}
                              className="w-6 h-6 rounded-full object-cover ring-2 ring-emerald-500/20"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-emerald-500/20">
                              {posterInitial}
                            </div>
                          )}
                          <span className="text-white">{posterName}</span>
                          {hirerRating > 0 && (
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="text-slate-400">
                                {hirerRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {job.poster.hirerProfile?.isVerified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4">
                        <Link href={`/work/job/${job.id}`}>
                          <Button variant="success" size="sm" leftIcon={<Briefcase className="w-4 h-4" />}>
                            Apply Now
                          </Button>
                        </Link>
                        <Link href={`/work/job/${job.id}`}>
                          <Button variant="secondary" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )
            })}

            {/* Load More Button */}
            {pagination?.hasMore && (
              <div className="flex justify-center pt-6 pb-4">
                <Button
                  variant="secondary"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  isLoading={isLoadingMore}
                  leftIcon={!isLoadingMore ? <ChevronDown className="w-4 h-4" /> : undefined}
                >
                  {isLoadingMore ? 'Loading more...' : (
                    <>
                      Load More Jobs
                      <span className="text-slate-500 text-sm ml-1">
                        ({totalCount - showingCount} remaining)
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
