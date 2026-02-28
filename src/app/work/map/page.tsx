'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { LeafletMapHandle, MapBounds } from '@/components/map/LeafletMap'
import {
  Search, MapPin, Star, Clock,
  MessageCircle, Heart, ArrowRight, BadgeCheck,
  Users, ChevronLeft, Navigation, Briefcase,
  SlidersHorizontal, Loader2, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassPanel, Button, GeolocationModal, LiveDot, CategoryDropdown, BudgetDropdown, parseBudgetFilter } from '@/components/ui'
import { MobileBottomSheet } from '@/components/sidebar'
import { JobListCard, urgencyConfig } from '@/components/cards'
import { MapLoadingState, SidebarEmptyState } from '@/components/map/MapStates'
import type { JobItem, UrgencyType } from '@/components/cards'
import type { MapMarker, UserLocation } from '@/components/map/LeafletMap'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Card'
import { getCityById } from '@/lib/cities-data'
import {
  normalizeCategorySlug,
  getSavedCategory,
  saveCategory,
  clearSavedCategory,
  getCategoryDropdownOptions,
  getCategoryLabel,
} from '@/lib/categories'

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading map...</p>
      </div>
    </div>
  ),
})

// ============================================
// API Response Types
// ============================================
interface ApiJobPoster {
  id: string
  name: string | null
  avatarUrl: string | null
  image: string | null
  hirerProfile: {
    companyName: string | null
    averageRating: number | null
    isVerified: boolean
  } | null
}

interface ApiJob {
  id: string
  title: string
  description: string
  category: string
  address: string | null
  city: string | null
  lat: number | null
  lng: number | null
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
  poster: ApiJobPoster | null
}

/** Map scheduleType from API to UrgencyType for the UI */
function mapScheduleToUrgency(scheduleType: string): UrgencyType {
  switch (scheduleType) {
    case 'asap': return 'urgent'
    case 'specific': return 'scheduled'
    case 'flexible':
    default: return 'flexible'
  }
}

/** Format a date string to relative time (e.g., "2 hrs ago") */
function formatRelativeTime(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  const diffWeeks = Math.floor(diffDays / 7)
  return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
}

/** Transform an API job into a JobItem for the UI */
function transformApiJobToJobItem(apiJob: ApiJob): JobItem {
  return {
    id: apiJob.id,
    title: apiJob.title,
    category: apiJob.category,
    description: apiJob.description,
    budget: {
      min: apiJob.budgetMin ?? 0,
      max: apiJob.budgetMax ?? apiJob.budgetMin ?? 0,
    },
    location: {
      area: apiJob.city || apiJob.address || 'Unknown',
      lat: apiJob.lat ?? 0,
      lng: apiJob.lng ?? 0,
    },
    postedBy: {
      name: apiJob.poster?.hirerProfile?.companyName || apiJob.poster?.name || 'Anonymous',
      rating: apiJob.poster?.hirerProfile?.averageRating ?? 0,
      jobs: 0,
      verified: apiJob.poster?.hirerProfile?.isVerified ?? false,
    },
    postedAt: formatRelativeTime(apiJob.createdAt),
    urgency: mapScheduleToUrgency(apiJob.scheduleType),
    bids: apiJob.bidCount,
    status: apiJob.status,
  }
}

// Application type extends JobItem with extra fields
interface ApplicationItem extends JobItem {
  appliedAt: string
}

// Use canonical categories from lib/categories.ts
const categories = getCategoryDropdownOptions()

// Helper to check if a point is within bounds
function isWithinBounds(lat: number, lng: number, bounds: MapBounds | null): boolean {
  if (!bounds) return true
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east
}

// ============================================
// WORKER MAP PAGE COMPONENT
// ============================================
function WorkerMapContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  // Sidebar view state: 'all_jobs' or 'my_applications'
  const [sidebarView, setSidebarView] = useState<'all_jobs' | 'my_applications'>('all_jobs')

  // API data state
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [applicationsError, setApplicationsError] = useState<string | null>(null)

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedJob, setSelectedJob] = useState<JobItem | ApplicationItem | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')
  const [mounted, setMounted] = useState(false)
  const [showGeolocationModal, setShowGeolocationModal] = useState(false)

  // City state
  const [citySlug, setCitySlug] = useState<string | null>(null)
  const [cityBounds, setCityBounds] = useState<MapBounds | null>(null)
  const [cityName, setCityName] = useState<string | null>(null)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)

  // Map ref
  const leafletMapRef = useRef<LeafletMapHandle | null>(null)

  const [filters, setFilters] = useState({
    budget: 'any',
    urgency: 'all',
  })
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())

  // Fetch available jobs from API
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/jobs')
      if (!res.ok) throw new Error('Failed to load jobs')
      const json: { success: boolean; data: ApiJob[]; error?: string } = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to load jobs')
      const transformed = (json.data || []).map(transformApiJobToJobItem)
      setJobs(transformed)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Fetch worker's own applications (bids) from API
  const fetchApplications = useCallback(async () => {
    try {
      setApplicationsLoading(true)
      setApplicationsError(null)
      const res = await fetch('/api/bids?mine=true')
      if (!res.ok) {
        // If endpoint doesn't exist yet, silently set empty
        setApplications([])
        return
      }
      const json = await res.json()
      // Transform bids into application items if the API returns job data with bids
      const bidsData = json.data || json.bids || json || []
      const transformed: ApplicationItem[] = Array.isArray(bidsData)
        ? bidsData.map((bid: Record<string, unknown>) => {
            const job = (bid.job || {}) as Record<string, unknown>
            const poster = (job.poster || {}) as Record<string, unknown>
            const hirerProfile = (poster.hirerProfile || {}) as Record<string, unknown>
            return {
              id: (bid.id as string) || '',
              title: (job.title as string) || 'Untitled Job',
              category: (job.category as string) || 'other',
              description: (job.description as string) || '',
              budget: {
                min: (job.budgetMin as number) ?? 0,
                max: (job.budgetMax as number) ?? (job.budgetMin as number) ?? 0,
              },
              location: {
                area: (job.city as string) || (job.address as string) || 'Unknown',
                lat: (job.lat as number) ?? 0,
                lng: (job.lng as number) ?? 0,
              },
              postedBy: {
                name: (hirerProfile.companyName as string) || (poster.name as string) || 'Anonymous',
                rating: (hirerProfile.averageRating as number) ?? 0,
                jobs: 0,
                verified: (hirerProfile.isVerified as boolean) ?? false,
              },
              postedAt: job.createdAt ? formatRelativeTime(job.createdAt as string) : 'Unknown',
              urgency: mapScheduleToUrgency((job.scheduleType as string) || 'flexible'),
              bids: (job.bidCount as number) ?? 0,
              status: (bid.status as string) || 'pending',
              appliedAt: bid.createdAt ? formatRelativeTime(bid.createdAt as string) : 'Unknown',
            }
          })
        : []
      setApplications(transformed)
    } catch {
      setApplicationsError('Failed to load applications')
      setApplications([])
    } finally {
      setApplicationsLoading(false)
    }
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])
  useEffect(() => { fetchApplications() }, [fetchApplications])

  // Initialize from URL params (category from URL > localStorage > 'all')
  useEffect(() => {
    const urlCity = searchParams.get('city')
    const urlCategory = searchParams.get('category')
    const urlView = searchParams.get('view')

    if (urlCity) {
      const city = getCityById(urlCity)
      if (city) {
        setCitySlug(city.id)
        setCityName(city.name)
        const radiusMiles = 15
        const latDelta = radiusMiles / 69.0
        const lngDelta = radiusMiles / (69.0 * Math.cos((city.lat * Math.PI) / 180))
        setCityBounds({
          north: city.lat + latDelta,
          south: city.lat - latDelta,
          east: city.lng + lngDelta,
          west: city.lng - lngDelta,
        })
      }
    }

    // Category: URL param first, then localStorage fallback
    if (urlCategory) {
      const normalized = normalizeCategorySlug(urlCategory)
      setSelectedCategory(normalized)
    } else {
      // Check localStorage fallback
      const savedCategory = getSavedCategory()
      if (savedCategory) {
        const normalized = normalizeCategorySlug(savedCategory)
        setSelectedCategory(normalized)
      }
    }

    if (urlView === 'applications') {
      setSidebarView('my_applications')
    }
  }, [searchParams])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle category change with shallow URL update
  const handleCategoryChange = useCallback((newCategory: string) => {
    setSelectedCategory(newCategory)

    // Update URL with shallow routing (no page reload)
    const params = new URLSearchParams(searchParams.toString())
    if (newCategory === 'all') {
      params.delete('category')
      clearSavedCategory() // Clear localStorage when selecting 'All'
    } else {
      params.set('category', newCategory)
      saveCategory(newCategory) // Save to localStorage for persistence
    }

    // Preserve city param if present
    const newUrl = params.toString() ? `/work/map?${params.toString()}` : '/work/map'
    router.replace(newUrl, { scroll: false })
  }, [searchParams, router])

  // Get data based on sidebar view
  const getListData = (): (JobItem | ApplicationItem)[] => {
    if (sidebarView === 'my_applications') {
      return applications
    }
    return jobs
  }

  const listData = getListData()

  // Loading/error state for current view
  const isCurrentViewLoading = sidebarView === 'my_applications' ? applicationsLoading : loading
  const currentViewError = sidebarView === 'my_applications' ? applicationsError : error
  const retryCurrentView = sidebarView === 'my_applications' ? fetchApplications : fetchJobs

  // Parse budget filter
  const budgetRange = parseBudgetFilter(filters.budget)

  // Filter data based on category, search, budget, urgency, and city bounds
  const filteredData = listData.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (item.budget && filters.budget !== 'any') {
      if (item.budget.min > budgetRange.max || item.budget.max < budgetRange.min) return false
    }
    if (filters.urgency !== 'all' && item.urgency && item.urgency !== filters.urgency) return false
    if (cityBounds && item.location?.lat && item.location?.lng) {
      if (!isWithinBounds(item.location.lat, item.location.lng, cityBounds)) return false
    }
    return true
  })

  // Convert jobs to map markers
  const mapMarkers: MapMarker[] = filteredData
    .filter((item) => item.location?.lat && item.location?.lng)
    .map((item) => ({
      id: item.id,
      latitude: item.location.lat,
      longitude: item.location.lng,
      type: 'job',
      category: item.category,
      title: item.title,
      price: `$${item.budget.min}+`,
      urgency: item.urgency,
    }))

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
        toast.info('Removed from saved')
      } else {
        newSet.add(jobId)
        toast.success('Saved!')
      }
      return newSet
    })
  }

  // Handlers
  const handleApplyForJob = useCallback(() => {
    if (!selectedJob) return
    toast.success(`Applied for "${selectedJob.title}"! The client will be notified.`)
  }, [selectedJob, toast])

  const handleMessageClient = useCallback(() => {
    if (!selectedJob) return
    router.push(`/work/messages?job=${selectedJob.id}`)
  }, [selectedJob, router])

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    const job = listData.find((j) => j.id === marker.id)
    if (job) setSelectedJob(job)
  }, [listData])

  // Focus on a job: select it AND fly map to its location
  const focusJob = useCallback((job: JobItem | ApplicationItem) => {
    setSelectedJob(job)
    if (leafletMapRef.current && job.location) {
      leafletMapRef.current.flyToWithAnimation(job.location.lat, job.location.lng)
    }
  }, [])

  const handleLocationChange = useCallback((location: UserLocation | null) => {
    if (location) {
      setUserCoords({ lat: location.latitude, lng: location.longitude })
    }
  }, [])

  const handleFindNearMe = useCallback(() => {
    setShowGeolocationModal(true)
  }, [])

  const handleLocationGranted = useCallback((coords: { lat: number; lng: number }) => {
    setShowGeolocationModal(false)
    setCitySlug(null)
    setCityName(null)
    setCityBounds(null)
    setUserCoords(coords)
    if (leafletMapRef.current) {
      leafletMapRef.current.flyToLocation(coords.lat, coords.lng, 12)
    }
    toast.success('Showing jobs near you!')
  }, [toast])

  const handleChooseCity = useCallback(() => {
    setShowGeolocationModal(false)
    router.push('/cities?mode=work')
  }, [router])

  const handleChangeCity = useCallback(() => {
    router.push('/cities?mode=work')
  }, [router])

  const handleClearFilters = useCallback(() => {
    handleCategoryChange('all')
    setFilters({ budget: 'any', urgency: 'all' })
    setSearchQuery('')
  }, [handleCategoryChange])

  // Check if filters are active
  const hasActiveFilters = selectedCategory !== 'all' || filters.budget !== 'any' || filters.urgency !== 'all' || searchQuery !== ''

  const getCategoryIcon = (category: string) => {
    return categories.find((c) => c.id === category)?.icon || '📋'
  }

  if (!mounted) {
    return <MapLoadingState mode="work" message="Loading..." />
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row relative overflow-hidden bg-slate-950">
      {/* ============ DESKTOP SIDEBAR ============ */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-full z-20',
          'bg-slate-900/95 backdrop-blur-xl',
          'border-r border-white/[0.06]',
          'transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
          selectedJob ? 'w-[480px]' : 'w-[420px]'
        )}
      >
        {/* Sidebar Header */}
        <header className="p-5 border-b border-white/[0.06] space-y-4">
          {/* Mode + City Row */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium bg-emerald-500/10 border-emerald-500/20 text-emerald-400 transition-colors duration-200">
              <Briefcase className="w-4 h-4" />
              Find Work
            </div>

            {cityName ? (
              <button
                onClick={handleChangeCity}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm bg-slate-800/60 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-medium">{cityName}</span>
                <span className="text-slate-600 group-hover:text-slate-400 text-xs">Change</span>
              </button>
            ) : (
              <button
                onClick={handleFindNearMe}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm bg-slate-800/60 border border-white/[0.06] text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-200"
              >
                <Navigation className="w-3.5 h-3.5" />
                Find near me
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-500 group-focus-within:text-slate-400 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/[0.08] rounded-xl text-white placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-slate-800/70 focus:ring-emerald-500/30 focus:border-emerald-500/50"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-800/40 rounded-xl p-1 border border-white/[0.04]">
            <button
              onClick={() => { setSidebarView('all_jobs'); setSelectedJob(null) }}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                sidebarView === 'all_jobs' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-300'
              )}
            >
              All Jobs
            </button>
            <button
              onClick={() => { setSidebarView('my_applications'); setSelectedJob(null) }}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                sidebarView === 'my_applications' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-slate-300'
              )}
            >
              My Applications
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2">
            <CategoryDropdown
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="flex-1"
              mode="work"
            />
            <BudgetDropdown
              value={filters.budget}
              onChange={(value) => setFilters({ ...filters, budget: value })}
              className="flex-1"
              mode="work"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'p-2.5 rounded-xl border transition-all duration-200',
                showFilters
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-800/60 border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
              )}
              title="More filters"
              aria-label="Toggle additional filters"
              aria-pressed={showFilters}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Results Bar */}
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              <span className="font-semibold text-white tabular-nums">{filteredData.length}</span>
              {' '}{sidebarView === 'all_jobs' ? 'jobs' : 'applications'}
            </span>
            {selectedCategory !== 'all' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                {getCategoryLabel(selectedCategory)}
              </span>
            )}
            <LiveDot variant="green" size="sm" />
          </div>
        </div>

        {/* Extended Filters Panel */}
        {showFilters && (
          <div className="px-5 py-4 border-b border-white/[0.06] bg-slate-800/30 space-y-4 animate-fadeInUp">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block uppercase tracking-wider">Urgency</label>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'urgent', 'today', 'scheduled', 'flexible'].map((u) => (
                  <button
                    key={u}
                    onClick={() => setFilters({ ...filters, urgency: u })}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200',
                      filters.urgency === u
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-800/60 text-slate-400 border-white/[0.06] hover:border-white/20 hover:text-slate-300'
                    )}
                  >
                    {u === 'all' ? 'All' : urgencyConfig[u as keyof typeof urgencyConfig]?.label || u}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleClearFilters}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {selectedJob ? (
            /* ============ DETAIL VIEW ============ */
            <div className="p-5 animate-fadeIn">
              <button
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 mb-5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to jobs
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  {selectedJob.urgency && urgencyConfig[selectedJob.urgency as keyof typeof urgencyConfig] && (
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border',
                      urgencyConfig[selectedJob.urgency as keyof typeof urgencyConfig].bg,
                      urgencyConfig[selectedJob.urgency as keyof typeof urgencyConfig].text,
                      urgencyConfig[selectedJob.urgency as keyof typeof urgencyConfig].border
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', urgencyConfig[selectedJob.urgency as keyof typeof urgencyConfig].dot)} />
                      {urgencyConfig[selectedJob.urgency as keyof typeof urgencyConfig].label}
                    </span>
                  )}
                  <button
                    onClick={() => toggleSaveJob(selectedJob.id)}
                    className={cn(
                      'p-2.5 rounded-xl transition-all duration-200 border',
                      savedJobs.has(selectedJob.id)
                        ? 'text-red-400 bg-red-500/10 border-red-500/20'
                        : 'text-slate-400 hover:text-red-400 bg-slate-800/60 border-white/[0.06] hover:border-red-500/20'
                    )}
                  >
                    <Heart className={cn('w-5 h-5', savedJobs.has(selectedJob.id) && 'fill-red-400')} />
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{selectedJob.title}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    {selectedJob.location.area}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {selectedJob.postedAt}
                  </span>
                </div>
              </div>

              {/* Pay - Primary Metric */}
              <GlassPanel padding="md" className="mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Pay</span>
                  <span className="text-2xl font-bold text-emerald-400 tabular-nums">
                    ${selectedJob.budget.min}
                    {selectedJob.budget.max !== selectedJob.budget.min && (
                      <>
                        <span className="text-slate-500 font-normal text-lg"> – </span>
                        ${selectedJob.budget.max}
                      </>
                    )}
                  </span>
                </div>
              </GlassPanel>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Posted By */}
              {selectedJob.postedBy && (
                <GlassPanel padding="md" className="mb-6">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                      {selectedJob.postedBy.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-white truncate">{selectedJob.postedBy.name}</span>
                        {selectedJob.postedBy.verified && <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-medium text-white">{selectedJob.postedBy.rating}</span>
                        <span className="text-slate-600">·</span>
                        <span>{selectedJob.postedBy.jobs} jobs posted</span>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              )}

              {/* Competition */}
              {selectedJob.bids !== undefined && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                  <Users className="w-4 h-4" />
                  <span>{selectedJob.bids} workers have already applied</span>
                </div>
              )}

              {/* Application Status */}
              {'appliedAt' in selectedJob && (selectedJob as ApplicationItem).appliedAt && (
                <div className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-xl mb-6 border',
                  selectedJob.status === 'accepted'
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-amber-500/10 border-amber-500/20'
                )}>
                  <span className={cn(
                    'text-sm font-medium',
                    selectedJob.status === 'accepted' ? 'text-emerald-400' : 'text-amber-400'
                  )}>
                    {selectedJob.status === 'accepted' ? 'Application Accepted' : 'Application Pending'}
                  </span>
                  <span className="text-slate-500 text-sm">· Applied {(selectedJob as ApplicationItem).appliedAt}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!('appliedAt' in selectedJob) && (
                  <Button
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    onClick={handleApplyForJob}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500"
                  >
                    Apply for this job
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  leftIcon={<MessageCircle className="w-5 h-5" />}
                  onClick={handleMessageClient}
                >
                  Message Client
                </Button>
              </div>
            </div>
          ) : isCurrentViewLoading ? (
            /* ============ LOADING STATE ============ */
            <div className="p-5 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Skeleton variant="rectangular" width="48px" height="48px" className="rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" width="70%" height="16px" />
                      <Skeleton variant="text" width="40%" height="12px" />
                    </div>
                  </div>
                  <Skeleton variant="text" width="100%" height="12px" />
                  <div className="flex gap-2">
                    <Skeleton variant="text" width="60px" height="20px" />
                    <Skeleton variant="text" width="80px" height="20px" />
                  </div>
                </div>
              ))}
            </div>
          ) : currentViewError ? (
            /* ============ ERROR STATE ============ */
            <div className="p-5 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Failed to load {sidebarView === 'all_jobs' ? 'jobs' : 'applications'}</p>
                <p className="text-sm text-slate-400">{currentViewError}</p>
              </div>
              <button
                onClick={retryCurrentView}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-200"
              >
                Try again
              </button>
            </div>
          ) : (
            /* ============ LIST VIEW ============ */
            <div className="divide-y divide-white/[0.04]">
              {filteredData.map((job) => (
                <JobListCard
                  key={job.id}
                  job={job}
                  onClick={() => focusJob(job)}
                  getCategoryIcon={getCategoryIcon}
                  colorMode="work"
                  isSelected={false}
                />
              ))}

              {filteredData.length === 0 && (
                <SidebarEmptyState
                  mode="work"
                  type={sidebarView === 'all_jobs' ? 'jobs' : 'applications'}
                  hasFilters={hasActiveFilters}
                  onClearFilters={handleClearFilters}
                />
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Map Area */}
      <div className="flex-1 relative h-full z-10">
        {/* Map - hidden on mobile when list view is active */}
        <div className={`h-full ${viewMode === 'list' ? 'hidden lg:block' : ''}`}>
          <LeafletMap
            markers={mapMarkers}
            onMarkerClick={handleMarkerClick}
            onLocationChange={handleLocationChange}
            showUserLocation={true}
            selectedMarkerId={selectedJob?.id || null}
            mapRef={leafletMapRef}
            initialBounds={cityBounds}
            initialCenter={!cityBounds ? {
              lat: userCoords?.lat || 37.7749,
              lng: userCoords?.lng || -122.4194,
            } : undefined}
            initialZoom={!cityBounds ? 12 : undefined}
          />
        </div>

        {/* Mobile List View - shown when list view is active */}
        {viewMode === 'list' && (
          <div className="lg:hidden absolute inset-0 bg-slate-950 overflow-y-auto pb-40">
            {isCurrentViewLoading ? (
              <div className="p-5 flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : currentViewError ? (
              <div className="p-5 flex flex-col items-center justify-center gap-4 text-center min-h-[200px]">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm text-slate-400">{currentViewError}</p>
                <button
                  onClick={retryCurrentView}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-200"
                >
                  Try again
                </button>
              </div>
            ) : (
            <div className="divide-y divide-white/[0.04]">
              {filteredData.map((job) => (
                <JobListCard
                  key={job.id}
                  job={job}
                  onClick={() => {
                    focusJob(job)
                    setViewMode('map')
                  }}
                  getCategoryIcon={getCategoryIcon}
                  colorMode="work"
                  isSelected={false}
                />
              ))}

              {filteredData.length === 0 && (
                <SidebarEmptyState
                  mode="work"
                  type={sidebarView === 'all_jobs' ? 'jobs' : 'applications'}
                  hasFilters={hasActiveFilters}
                  onClearFilters={handleClearFilters}
                />
              )}
            </div>
            )}
          </div>
        )}

        {/* Mobile Bottom Sheet */}
        <MobileBottomSheet
          mode="work"
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          resultsCount={filteredData.length}
          resultsLabel={sidebarView === 'all_jobs' ? 'jobs' : 'applications'}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
        />
      </div>

      {/* Geolocation Modal */}
      <GeolocationModal
        isOpen={showGeolocationModal}
        onClose={() => setShowGeolocationModal(false)}
        onLocationGranted={handleLocationGranted}
        onChooseCity={handleChooseCity}
        mode="work"
      />
    </div>
  )
}

// Wrap with Suspense for useSearchParams
export default function WorkerMapPage() {
  return (
    <Suspense fallback={<MapLoadingState mode="work" message="Loading..." />}>
      <WorkerMapContent />
    </Suspense>
  )
}
