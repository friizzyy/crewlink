'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { LeafletMapHandle, MapBounds } from '@/components/map/LeafletMap'
import {
  Search, MapPin, Star, Clock, Plus,
  MessageCircle, Heart, ArrowRight, BadgeCheck,
  Users, ChevronLeft, Navigation, Briefcase, Building2,
  SlidersHorizontal, Loader2, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassPanel, Button, GeolocationModal, LiveDot, CategoryDropdown, BudgetDropdown, parseBudgetFilter } from '@/components/ui'
import { MobileBottomSheet } from '@/components/sidebar'
import { JobPostListCard, WorkerListCard } from '@/components/cards'
import { MapLoadingState, SidebarEmptyState } from '@/components/map/MapStates'
import type { JobPostItem, WorkerItem } from '@/components/cards'
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
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
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

/** Format a date string to relative time (e.g., "2 days ago") */
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

/** Map API job status to JobPostItem status */
function mapApiStatus(status: string): JobPostItem['status'] {
  switch (status) {
    case 'posted': return 'active'
    case 'in_progress': return 'active'
    case 'completed': return 'completed'
    case 'cancelled': return 'cancelled'
    default: return 'pending'
  }
}

/** Transform an API job into a JobPostItem for the hirer UI */
function transformApiJobToJobPostItem(apiJob: ApiJob): JobPostItem {
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
    applicants: apiJob.bidCount,
    status: mapApiStatus(apiJob.status),
    postedAt: formatRelativeTime(apiJob.createdAt),
  }
}

// Company type for sidebar company listings (kept for companies tab)
interface CompanyItem {
  id: string
  name: string
  category: string
  description: string
  rating: number
  reviews: number
  workers: number
  location: { area: string; lat: number; lng: number }
  verified: boolean
  responseTime: string
  priceRange: string
  type: 'company'
}

// Use canonical categories from lib/categories.ts
const categories = getCategoryDropdownOptions()

// Helper to check if a point is within bounds
function isWithinBounds(lat: number, lng: number, bounds: MapBounds | null): boolean {
  if (!bounds) return true
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east
}

// ============================================
// HIRING MAP PAGE COMPONENT
// ============================================
function HiringMapContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  // Sidebar view state: 'job_posts' or 'companies'
  const [sidebarView, setSidebarView] = useState<'job_posts' | 'companies'>('job_posts')

  // API data state
  const [jobPosts, setJobPosts] = useState<JobPostItem[]>([])
  const [companies] = useState<CompanyItem[]>([]) // Companies will be fetched when API exists
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<JobPostItem | CompanyItem | null>(null)
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
  })

  // Fetch hirer's own job posts from API
  const fetchJobPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/jobs?mine=true')
      if (!res.ok) throw new Error('Failed to load your job posts')
      const json: { success: boolean; data: ApiJob[]; error?: string } = await res.json()
      if (!json.success) throw new Error(json.error || 'Failed to load your job posts')
      const transformed = (json.data || []).map(transformApiJobToJobPostItem)
      setJobPosts(transformed)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchJobPosts() }, [fetchJobPosts])

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

    if (urlView === 'companies') {
      setSidebarView('companies')
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
    const newUrl = params.toString() ? `/hiring/map?${params.toString()}` : '/hiring/map'
    router.replace(newUrl, { scroll: false })
  }, [searchParams, router])

  // Get data based on sidebar view
  const getListData = (): (JobPostItem | CompanyItem)[] => {
    if (sidebarView === 'companies') {
      return companies
    }
    return jobPosts
  }

  const listData = getListData()

  // Parse budget filter
  const budgetRange = parseBudgetFilter(filters.budget)

  // Filter data based on category, search, budget, and city bounds
  const filteredData = listData.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false
    const searchTarget = 'name' in item ? item.name : item.title
    if (searchQuery && !('title' in item && item.title?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !searchTarget?.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if ('budget' in item && item.budget && filters.budget !== 'any') {
      if (item.budget.min > budgetRange.max || item.budget.max < budgetRange.min) return false
    }
    if (cityBounds && item.location?.lat && item.location?.lng) {
      if (!isWithinBounds(item.location.lat, item.location.lng, cityBounds)) return false
    }
    return true
  })

  // Convert data to map markers
  const mapMarkers: MapMarker[] = filteredData
    .filter((item) => item.location?.lat && item.location?.lng)
    .map((item) => {
      const isCompany = 'type' in item && item.type === 'company'
      return {
        id: item.id,
        latitude: item.location.lat,
        longitude: item.location.lng,
        type: isCompany ? 'worker' : 'job',
        category: item.category,
        title: 'name' in item ? item.name : item.title,
        price: 'budget' in item && item.budget ? `$${item.budget.min}+` : ('priceRange' in item ? item.priceRange : ''),
      }
    })

  // Handlers
  const handlePostJob = useCallback(() => {
    router.push('/hiring/post')
  }, [router])

  const handleViewApplicants = useCallback(() => {
    if (!selectedItem) return
    router.push(`/hiring/job/${selectedItem.id}#applicants`)
  }, [selectedItem, router])

  const handleContactCompany = useCallback(() => {
    if (!selectedItem) return
    router.push(`/hiring/messages?company=${selectedItem.id}`)
  }, [selectedItem, router])

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    const item = listData.find((j) => j.id === marker.id)
    if (item) setSelectedItem(item)
  }, [listData])

  // Focus on an item: select it AND fly map to its location
  const focusItem = useCallback((item: JobPostItem | CompanyItem) => {
    setSelectedItem(item)
    if (leafletMapRef.current && item.location) {
      leafletMapRef.current.flyToWithAnimation(item.location.lat, item.location.lng)
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
    toast.success('Showing results near you!')
  }, [toast])

  const handleChooseCity = useCallback(() => {
    setShowGeolocationModal(false)
    router.push('/cities?mode=hiring')
  }, [router])

  const handleChangeCity = useCallback(() => {
    router.push('/cities?mode=hiring')
  }, [router])

  const handleClearFilters = useCallback(() => {
    handleCategoryChange('all')
    setFilters({ budget: 'any' })
    setSearchQuery('')
  }, [handleCategoryChange])

  // Check if filters are active
  const hasActiveFilters = selectedCategory !== 'all' || filters.budget !== 'any' || searchQuery !== ''

  const getCategoryIcon = (category: string) => {
    return categories.find((c) => c.id === category)?.icon || '📋'
  }

  if (!mounted) {
    return <MapLoadingState mode="hire" message="Loading..." />
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
          selectedItem ? 'w-[480px]' : 'w-[420px]'
        )}
      >
        {/* Sidebar Header */}
        <header className="p-5 border-b border-white/[0.06] space-y-4">
          {/* Mode + City Row */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium bg-cyan-500/10 border-cyan-500/20 text-cyan-400 transition-colors duration-200">
              <Users className="w-4 h-4" />
              Hiring Help
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
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-white/[0.08] rounded-xl text-white placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:bg-slate-800/70 focus:ring-cyan-500/30 focus:border-cyan-500/50"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-slate-800/40 rounded-xl p-1 border border-white/[0.04]">
            <button
              onClick={() => { setSidebarView('job_posts'); setSelectedItem(null) }}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                sidebarView === 'job_posts' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-300'
              )}
            >
              My Job Posts
            </button>
            <button
              onClick={() => { setSidebarView('companies'); setSelectedItem(null) }}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                sidebarView === 'companies' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-300'
              )}
            >
              Companies
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2">
            <CategoryDropdown
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="flex-1"
              mode="hire"
            />
            <BudgetDropdown
              value={filters.budget}
              onChange={(value) => setFilters({ ...filters, budget: value })}
              className="flex-1"
              mode="hire"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'p-2.5 rounded-xl border transition-all duration-200',
                showFilters
                  ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
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
              {' '}{sidebarView === 'job_posts' ? 'job posts' : 'companies'}
            </span>
            {selectedCategory !== 'all' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                {getCategoryLabel(selectedCategory)}
              </span>
            )}
            <LiveDot variant="cyan" size="sm" />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {selectedItem ? (
            /* ============ DETAIL VIEW ============ */
            <div className="p-5 animate-fadeIn">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 mb-5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to list
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  {'verified' in selectedItem && selectedItem.verified && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                  {'status' in selectedItem && selectedItem.status && (
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border',
                      selectedItem.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    )}>
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        selectedItem.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'
                      )} />
                      {selectedItem.status}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-3 leading-tight">{'name' in selectedItem ? selectedItem.name : selectedItem.title}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    {selectedItem.location?.area}
                  </span>
                  {'postedAt' in selectedItem && selectedItem.postedAt && (
                    <>
                      <span className="text-slate-600">·</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {selectedItem.postedAt}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Budget / Price */}
              {('budget' in selectedItem || 'priceRange' in selectedItem) && (
                <GlassPanel padding="md" className="mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{'budget' in selectedItem ? 'Budget' : 'Price Range'}</span>
                    <span className="text-2xl font-bold text-cyan-400 tabular-nums">
                      {'budget' in selectedItem && selectedItem.budget
                        ? <>
                            ${selectedItem.budget.min}
                            {selectedItem.budget.max !== selectedItem.budget.min && (
                              <>
                                <span className="text-slate-500 font-normal text-lg"> -- </span>
                                ${selectedItem.budget.max}
                              </>
                            )}
                          </>
                        : 'priceRange' in selectedItem ? selectedItem.priceRange : ''}
                    </span>
                  </div>
                </GlassPanel>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{selectedItem.description}</p>
              </div>

              {/* Stats Grid (for companies) */}
              {'type' in selectedItem && selectedItem.type === 'company' && (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <GlassPanel padding="sm" className="text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-semibold tabular-nums">{selectedItem.rating}</span>
                    </div>
                    <p className="text-xs text-slate-500">{selectedItem.reviews} reviews</p>
                  </GlassPanel>
                  <GlassPanel padding="sm" className="text-center">
                    <div className="font-semibold text-white mb-1 tabular-nums">{selectedItem.workers}</div>
                    <p className="text-xs text-slate-500">Workers</p>
                  </GlassPanel>
                  <GlassPanel padding="sm" className="text-center">
                    <div className="font-semibold text-white mb-1">{selectedItem.responseTime}</div>
                    <p className="text-xs text-slate-500">Response</p>
                  </GlassPanel>
                </div>
              )}

              {/* Applicants Count */}
              {'applicants' in selectedItem && selectedItem.applicants !== undefined && (
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                  <Users className="w-4 h-4" />
                  <span>{selectedItem.applicants} applicants have applied</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {'type' in selectedItem && selectedItem.type === 'company' && (
                  <Button
                    size="lg"
                    fullWidth
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                    onClick={handleContactCompany}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                  >
                    Contact Company
                  </Button>
                )}

                {'applicants' in selectedItem && selectedItem.applicants !== undefined && (
                  <>
                    <Button
                      size="lg"
                      fullWidth
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      onClick={handleViewApplicants}
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500"
                    >
                      View {selectedItem.applicants} Applicants
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      fullWidth
                      leftIcon={<MessageCircle className="w-5 h-5" />}
                      onClick={() => router.push(`/hiring/messages?job=${selectedItem.id}`)}
                    >
                      View Messages
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : loading && sidebarView === 'job_posts' ? (
            /* ============ LOADING STATE ============ */
            <div className="p-5 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
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
          ) : error && sidebarView === 'job_posts' ? (
            /* ============ ERROR STATE ============ */
            <div className="p-5 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Failed to load your job posts</p>
                <p className="text-sm text-slate-400">{error}</p>
              </div>
              <button
                onClick={fetchJobPosts}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all duration-200"
              >
                Try again
              </button>
            </div>
          ) : (
            /* ============ LIST VIEW ============ */
            <div className="divide-y divide-white/[0.04]">
              {/* Post Job CTA - Only show in job_posts view */}
              {sidebarView === 'job_posts' && (
                <div className="p-5">
                  <button
                    onClick={handlePostJob}
                    className={cn(
                      'w-full py-4 rounded-xl font-semibold text-white',
                      'flex items-center justify-center gap-2',
                      'bg-gradient-to-r from-cyan-500 to-blue-600',
                      'hover:from-cyan-400 hover:to-blue-500',
                      'shadow-lg shadow-cyan-500/20',
                      'transition-all duration-200'
                    )}
                  >
                    <Plus className="w-5 h-5" />
                    Post Job
                  </button>
                </div>
              )}

              {filteredData.map((item) => (
                sidebarView === 'job_posts' ? (
                  <JobPostListCard
                    key={item.id}
                    jobPost={item as JobPostItem}
                    onClick={() => focusItem(item)}
                    getCategoryIcon={getCategoryIcon}
                    isSelected={false}
                  />
                ) : (
                  /* Company Card - Elevated */
                  <article
                    key={item.id}
                    onClick={() => focusItem(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && focusItem(item)}
                    className={cn(
                      'group relative px-5 py-4',
                      'cursor-pointer transition-all duration-200',
                      'hover:bg-white/[0.02]',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500/50'
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={cn(
                        'relative shrink-0 w-12 h-12 rounded-xl',
                        'bg-gradient-to-br from-cyan-500 to-blue-600',
                        'flex items-center justify-center text-white font-bold text-lg',
                        'transition-all duration-200',
                        'group-hover:scale-105',
                        'ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-500/20'
                      )}>
                        <Building2 className="w-5 h-5" />
                        {'verified' in item && item.verified && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                            <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[15px] text-white leading-snug truncate transition-colors duration-200 group-hover:text-cyan-400">
                            {'name' in item ? item.name : item.title}
                          </h3>
                        </div>

                        <p className="text-[13px] text-slate-500 mb-2.5 truncate">
                          {item.location?.area}
                        </p>

                        {'rating' in item && (
                        <div className="flex items-center gap-3 text-[13px]">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-medium text-white tabular-nums">{item.rating}</span>
                            {'reviews' in item && item.reviews > 0 && (
                              <span className="text-slate-500">({item.reviews})</span>
                            )}
                          </div>
                          <span className="text-slate-700">·</span>
                          {'priceRange' in item && <span className="font-semibold text-cyan-400">{item.priceRange}</span>}
                        </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              ))}

              {filteredData.length === 0 && (
                <SidebarEmptyState
                  mode="hire"
                  type={sidebarView === 'job_posts' ? 'jobs' : 'companies'}
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
            selectedMarkerId={selectedItem?.id || null}
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
            {loading && sidebarView === 'job_posts' ? (
              <div className="p-5 flex items-center justify-center min-h-[200px]">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : error && sidebarView === 'job_posts' ? (
              <div className="p-5 flex flex-col items-center justify-center gap-4 text-center min-h-[200px]">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-sm text-slate-400">{error}</p>
                <button
                  onClick={fetchJobPosts}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all duration-200"
                >
                  Try again
                </button>
              </div>
            ) : (
            <div className="divide-y divide-white/[0.04]">
              {filteredData.map((item) => (
                sidebarView === 'job_posts' ? (
                  <JobPostListCard
                    key={item.id}
                    jobPost={item as JobPostItem}
                    onClick={() => {
                      focusItem(item)
                      setViewMode('map')
                    }}
                    getCategoryIcon={getCategoryIcon}
                    isSelected={false}
                  />
                ) : (
                  /* Company Card */
                  <article
                    key={item.id}
                    onClick={() => {
                      focusItem(item)
                      setViewMode('map')
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && focusItem(item)}
                    className={cn(
                      'group relative px-5 py-4',
                      'cursor-pointer transition-all duration-200',
                      'hover:bg-white/[0.02]',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500/50'
                    )}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={cn(
                        'relative shrink-0 w-12 h-12 rounded-xl',
                        'bg-gradient-to-br from-cyan-500 to-blue-600',
                        'flex items-center justify-center text-white font-bold text-lg',
                        'transition-all duration-200',
                        'group-hover:scale-105',
                        'ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-500/20'
                      )}>
                        <Building2 className="w-5 h-5" />
                        {'verified' in item && item.verified && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                            <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[15px] text-white leading-snug truncate transition-colors duration-200 group-hover:text-cyan-400">
                            {'name' in item ? item.name : item.title}
                          </h3>
                        </div>

                        <p className="text-[13px] text-slate-500 mb-2.5 truncate">
                          {item.location?.area}
                        </p>

                        {'rating' in item && (
                        <div className="flex items-center gap-3 text-[13px]">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-medium text-white tabular-nums">{item.rating}</span>
                            {'reviews' in item && item.reviews > 0 && (
                              <span className="text-slate-500">({item.reviews})</span>
                            )}
                          </div>
                          <span className="text-slate-700">·</span>
                          {'priceRange' in item && <span className="font-semibold text-cyan-400">{item.priceRange}</span>}
                        </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              ))}

              {filteredData.length === 0 && (
                <SidebarEmptyState
                  mode="hire"
                  type={sidebarView === 'job_posts' ? 'jobs' : 'companies'}
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
          mode="hire"
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          resultsCount={filteredData.length}
          resultsLabel={sidebarView === 'job_posts' ? 'job posts' : 'companies'}
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
        mode="hiring"
      />
    </div>
  )
}

// Wrap with Suspense for useSearchParams
export default function HiringMapPage() {
  return (
    <Suspense fallback={<MapLoadingState mode="hire" message="Loading..." />}>
      <HiringMapContent />
    </Suspense>
  )
}
