'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { LeafletMapHandle, MapBounds } from '@/components/map/LeafletMap'
import {
  Search, MapPin, Star, Clock,
  MessageCircle, Heart, ArrowRight, BadgeCheck,
  Users, ChevronLeft, Navigation, Briefcase,
  SlidersHorizontal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassPanel, Button, GeolocationModal, LiveDot, CategoryDropdown, BudgetDropdown, parseBudgetFilter } from '@/components/ui'
import { MobileBottomSheet } from '@/components/sidebar'
import { JobListCard, urgencyConfig } from '@/components/cards'
import { MapLoadingState, SidebarEmptyState } from '@/components/map/MapStates'
import type { JobItem } from '@/components/cards'
import type { MapMarker, UserLocation } from '@/components/map/LeafletMap'
import { useToast } from '@/components/ui/Toast'
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
// MOCK DATA - Available Jobs (Worker sees jobs to apply for)
// ============================================
const mockJobs: JobItem[] = [
  {
    id: '1',
    title: 'Deep House Cleaning',
    category: 'cleaning',
    description: 'Need thorough cleaning of 3BR apartment including kitchen and bathrooms. Looking for someone detail-oriented who can make the space spotless.',
    budget: { min: 120, max: 180 },
    location: { area: 'Mission District', lat: 37.7599, lng: -122.4148 },
    postedBy: { name: 'Sarah M.', rating: 4.8, jobs: 12, verified: true },
    postedAt: '15 min ago',
    urgency: 'today',
    bids: 3,
    status: 'open',
  },
  {
    id: '2',
    title: 'Help Moving Furniture',
    category: 'moving',
    description: 'Moving from 2nd floor apartment to ground floor. Need 2 people. Have a few heavy items including a couch and dresser.',
    budget: { min: 150, max: 250 },
    location: { area: 'SOMA', lat: 37.7785, lng: -122.4056 },
    postedBy: { name: 'Mike T.', rating: 4.9, jobs: 8, verified: true },
    postedAt: '32 min ago',
    urgency: 'urgent',
    bids: 5,
    status: 'open',
  },
  {
    id: '3',
    title: 'IKEA Furniture Assembly',
    category: 'assembly',
    description: 'Need help assembling KALLAX shelf unit and PAX wardrobe. Tools provided.',
    budget: { min: 80, max: 120 },
    location: { area: 'Hayes Valley', lat: 37.7759, lng: -122.4245 },
    postedBy: { name: 'Lisa K.', rating: 5.0, jobs: 3, verified: false },
    postedAt: '1 hr ago',
    urgency: 'flexible',
    bids: 2,
    status: 'open',
  },
  {
    id: '4',
    title: 'Yard Work & Landscaping',
    category: 'yard-work',
    description: 'Lawn mowing, hedge trimming, and general yard cleanup. About 2-3 hours of work.',
    budget: { min: 100, max: 150 },
    location: { area: 'Noe Valley', lat: 37.7502, lng: -122.4337 },
    postedBy: { name: 'David R.', rating: 4.7, jobs: 15, verified: true },
    postedAt: '2 hrs ago',
    urgency: 'scheduled',
    bids: 4,
    status: 'open',
  },
  {
    id: '5',
    title: 'Fix Leaky Faucet',
    category: 'handyman',
    description: 'Kitchen faucet is dripping constantly. Need someone experienced with basic plumbing.',
    budget: { min: 60, max: 100 },
    location: { area: 'Castro', lat: 37.7609, lng: -122.4350 },
    postedBy: { name: 'Emma W.', rating: 4.6, jobs: 7, verified: true },
    postedAt: '3 hrs ago',
    urgency: 'today',
    bids: 1,
    status: 'open',
  },
  {
    id: '6',
    title: 'Event Setup Help',
    category: 'events',
    description: 'Birthday party setup - tables, chairs, decorations. Event starts at 4pm.',
    budget: { min: 80, max: 120 },
    location: { area: 'Marina', lat: 37.8024, lng: -122.4382 },
    postedBy: { name: 'Anna L.', rating: 4.9, jobs: 5, verified: true },
    postedAt: '4 hrs ago',
    urgency: 'scheduled',
    bids: 6,
    status: 'open',
  },
]

// ============================================
// MOCK DATA - Worker's Applications
// ============================================
const mockApplications = [
  {
    id: 'app1',
    title: 'Office Deep Clean',
    category: 'cleaning',
    description: 'Weekly office cleaning for startup.',
    budget: { min: 150, max: 200 },
    location: { area: 'SOMA', lat: 37.7785, lng: -122.4056 },
    postedBy: { name: 'TechStart Inc.', rating: 4.8, jobs: 20, verified: true },
    postedAt: '3 days ago',
    appliedAt: '2 days ago',
    status: 'pending',
    urgency: 'scheduled' as const,
    bids: 8,
  },
  {
    id: 'app2',
    title: 'Furniture Assembly',
    category: 'assembly',
    description: 'Assemble new office furniture.',
    budget: { min: 100, max: 150 },
    location: { area: 'Financial District', lat: 37.7946, lng: -122.3999 },
    postedBy: { name: 'James P.', rating: 4.9, jobs: 5, verified: true },
    postedAt: '1 week ago',
    appliedAt: '5 days ago',
    status: 'accepted',
    urgency: 'flexible' as const,
    bids: 4,
  },
]

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

  // Local state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedJob, setSelectedJob] = useState<any>(null)
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
  const getListData = () => {
    if (sidebarView === 'my_applications') {
      return mockApplications
    }
    return mockJobs
  }

  const listData = getListData()

  // Parse budget filter
  const budgetRange = parseBudgetFilter(filters.budget)

  // Filter data based on category, search, budget, urgency, and city bounds
  const filteredData = listData.filter((item: any) => {
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
    .filter((item: any) => item.location?.lat && item.location?.lng)
    .map((item: any) => ({
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
    const job = listData.find((j: any) => j.id === marker.id)
    if (job) setSelectedJob(job)
  }, [listData])

  // Focus on a job: select it AND fly map to its location
  const focusJob = useCallback((job: any) => {
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
    <div className="h-[calc(100dvh-64px)] lg:h-[calc(100vh-64px)] flex flex-col lg:flex-row relative overflow-hidden bg-slate-950">
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
              {selectedJob.appliedAt && (
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
                  <span className="text-slate-500 text-sm">· Applied {selectedJob.appliedAt}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!selectedJob.appliedAt && (
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
          ) : (
            /* ============ LIST VIEW ============ */
            <div className="divide-y divide-white/[0.04]">
              {filteredData.map((job: any) => (
                <JobListCard
                  key={job.id}
                  job={job}
                  onClick={() => focusJob(job)}
                  getCategoryIcon={getCategoryIcon}
                  colorMode="work"
                  isSelected={selectedJob?.id === job.id}
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
            <div className="divide-y divide-white/[0.04]">
              {filteredData.map((job: any) => (
                <JobListCard
                  key={job.id}
                  job={job}
                  onClick={() => {
                    focusJob(job)
                    setViewMode('map')
                  }}
                  getCategoryIcon={getCategoryIcon}
                  colorMode="work"
                  isSelected={selectedJob?.id === job.id}
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
