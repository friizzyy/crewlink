'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Plus, Search, MapPin, Clock, DollarSign, Users,
  MoreHorizontal, CheckCircle2, XCircle, Eye,
  MessageCircle, Edit, Star, Loader2, RefreshCw,
  Sparkles, Package, Wrench, Leaf, Armchair, Truck, PartyPopper, ClipboardList,
  Briefcase
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AmbientBackground } from '@/components/AmbientBackground'
import { GlassPanel, GlassCard, FeatureCard, Button, Badge, EmptyState } from '@/components/ui'

// Category icons mapping
const categoryIcons: Record<string, LucideIcon> = {
  cleaning: Sparkles,
  moving: Package,
  handyman: Wrench,
  yard: Leaf,
  assembly: Armchair,
  delivery: Truck,
  events: PartyPopper,
  other: ClipboardList,
}

// Job type from API
interface Job {
  id: string
  title: string
  description: string
  category: string
  address: string
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
  poster: {
    id: string
    name: string | null
    avatarUrl: string | null
  }
}

interface ApiResponse {
  success: boolean
  data: Job[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

const statusConfig: Record<string, { label: string; color: string; borderColor: string; badgeVariant: 'brand' | 'success' | 'warning' | 'error' | 'neutral'; icon: React.ComponentType<{ className?: string }> }> = {
  posted: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', borderColor: 'border-l-cyan-400', badgeVariant: 'brand', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', borderColor: 'border-l-blue-400', badgeVariant: 'brand', icon: Clock },
  completed: { label: 'Completed', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', borderColor: 'border-l-emerald-400', badgeVariant: 'success', icon: CheckCircle2 },
  draft: { label: 'Draft', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', borderColor: 'border-l-amber-400', badgeVariant: 'warning', icon: Edit },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', borderColor: 'border-l-red-400', badgeVariant: 'error', icon: XCircle },
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

// Extract neighborhood/city from full address
function formatLocation(address: string): string {
  const parts = address.split(',')
  if (parts.length >= 2) {
    // Return city or neighborhood (usually second or second-to-last part)
    return parts[parts.length >= 3 ? parts.length - 3 : 0].trim()
  }
  return address
}

export default function HiringJobsPage() {
  const searchParams = useSearchParams()
  const isNewJob = searchParams.get('new') === 'true'

  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewJobBanner, setShowNewJobBanner] = useState(isNewJob)

  // Fetch jobs from API
  const fetchJobs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        // Map UI filter to API status
        const statusMap: Record<string, string> = {
          active: 'posted',
          'in-progress': 'in_progress',
          completed: 'completed',
          draft: 'draft',
        }
        params.set('status', statusMap[filter] || filter)
      } else {
        params.set('status', 'all')
      }

      const response = await fetch(`/api/jobs?${params}`)
      const data: ApiResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error('Failed to fetch jobs')
      }

      setJobs(data.data)
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Failed to load jobs. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  // Hide new job banner after a few seconds
  useEffect(() => {
    if (showNewJobBanner) {
      const timer = setTimeout(() => setShowNewJobBanner(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [showNewJobBanner])

  // Filter by search query (client-side)
  const filteredJobs = jobs.filter((job) => {
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  })

  // Calculate stats
  const stats = {
    active: jobs.filter((j) => j.status === 'posted').length,
    inProgress: jobs.filter((j) => j.status === 'in_progress').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    total: jobs.length,
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8 relative">
      <AmbientBackground />

      {/* Success Banner */}
      {showNewJobBanner && (
        <div className="bg-emerald-500/20 border-b border-emerald-500/30 relative z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Job posted successfully!</span>
            </div>
            <button
              onClick={() => setShowNewJobBanner(false)}
              className="text-emerald-400 hover:text-emerald-300"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50 relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">My Jobs</h1>
              <p className="text-slate-400 mt-1">Manage your job postings</p>
            </div>
            <Link href="/hiring/new">
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} glow>
                Post Job
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Active', value: stats.active },
              { label: 'In Progress', value: stats.inProgress },
              { label: 'Completed', value: stats.completed },
              { label: 'Total', value: stats.total },
            ].map((stat, index) => (
              <GlassPanel
                key={stat.label}
                variant="subtle"
                padding="md"
                border="light"
                rounded="xl"
                className="animate-card-enter"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </GlassPanel>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 py-4 relative z-10">
        <GlassPanel variant="default" padding="md" border="glow" rounded="xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'active', 'in-progress', 'completed', 'draft'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={cn(
                    'px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                    filter === status
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-800/50 text-slate-400 border border-white/5 hover:text-white hover:border-white/10'
                  )}
                >
                  {status === 'all'
                    ? 'All'
                    : status === 'in-progress'
                    ? 'In Progress'
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Jobs List */}
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Button
              variant="secondary"
              onClick={fetchJobs}
              leftIcon={<RefreshCw className="w-5 h-5" />}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Jobs */}
        {!isLoading && !error && filteredJobs.length > 0 && (
          <div className="space-y-4">
            {filteredJobs.map((job, index) => {
              const statusInfo = statusConfig[job.status] || statusConfig.posted
              const StatusIcon = statusInfo.icon
              return (
                <GlassCard
                  key={job.id}
                  interactive={false}
                  padding="lg"
                  className={cn(
                    'border-l-4 animate-card-enter',
                    statusInfo.borderColor
                  )}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex gap-4">
                    {/* Category Icon */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0">
                      {(() => {
                        const CategoryIcon = categoryIcons[job.category] || ClipboardList
                        return <CategoryIcon className="w-7 h-7 text-cyan-400" />
                      })()}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/hiring/job/${job.id}`}
                            className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {formatLocation(job.address)}
                            </div>
                            <span>•</span>
                            <span>{formatRelativeTime(job.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusInfo.badgeVariant} size="md" dot>
                            {statusInfo.label}
                          </Badge>
                          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-400 font-semibold">
                            {job.budgetMin && job.budgetMax
                              ? `$${job.budgetMin} - $${job.budgetMax}`
                              : job.budgetMin
                              ? `$${job.budgetMin}+`
                              : job.budgetMax
                              ? `Up to $${job.budgetMax}`
                              : 'Open budget'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Users className="w-4 h-4" />
                          <span>{job.bidCount} bids</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Eye className="w-4 h-4" />
                          <span>{job.viewCount} views</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4">
                        <Link href={`/hiring/job/${job.id}`}>
                          <Button variant="secondary" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                            View Details
                          </Button>
                        </Link>
                        {job.status === 'posted' && (
                          <Link href={`/hiring/job/${job.id}#bids`}>
                            <Button variant="outline" size="sm" leftIcon={<Users className="w-4 h-4" />}>
                              Review Bids ({job.bidCount})
                            </Button>
                          </Link>
                        )}
                        {job.status === 'in_progress' && (
                          <Link href="/hiring/messages">
                            <Button variant="outline" size="sm" leftIcon={<MessageCircle className="w-4 h-4" />}>
                              Message Worker
                            </Button>
                          </Link>
                        )}
                        {job.status === 'draft' && (
                          <Link href="/hiring/new">
                            <Button variant="ghost" size="sm" leftIcon={<Edit className="w-4 h-4" />} className="text-amber-400 hover:text-amber-300">
                              Continue Editing
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredJobs.length === 0 && (
          <FeatureCard gradient="cyan" shine className="mt-8">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-10 h-10 text-cyan-400" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No jobs found</h2>
              <p className="text-slate-400 mb-6">
                {filter === 'all' ? "You haven't posted any jobs yet. Create your first job to find great workers." : `No ${filter} jobs`}
              </p>
              <Link href="/hiring/new">
                <Button variant="primary" leftIcon={<Plus className="w-5 h-5" />} glow>
                  Post Your First Job
                </Button>
              </Link>
            </div>
          </FeatureCard>
        )}
      </div>
    </div>
  )
}
