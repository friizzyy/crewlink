'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Clock, DollarSign, Users, Eye,
  MessageCircle, Star, CheckCircle2, XCircle, AlertCircle,
  Edit, Trash2, Share2, MoreHorizontal, Calendar, BadgeCheck,
  Phone, Mail, ChevronDown, Award, Loader2
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Card'
import type { Job, JobStatus } from '@/types'

// Shape returned by GET /api/jobs/[id]
interface JobBidData {
  id: string
  amount: number
  status: string
  createdAt: string
  worker: {
    id: string
    name: string | null
    avatarUrl: string | null
    workerProfile: {
      headline: string | null
      averageRating: number
      completedJobs: number
      isVerified: boolean
    } | null
  }
}

interface JobDetailData {
  id: string
  title: string
  description: string
  category: string
  skills: string[]
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
  poster: {
    id: string
    name: string | null
    avatarUrl: string | null
    image: string | null
    hirerProfile: {
      companyName: string | null
      totalJobsPosted: number
      averageRating: number
      isVerified: boolean
    } | null
  }
  bids: JobBidData[]
  _count?: { bids: number }
}

const categoryIcons: Record<string, string> = {
  cleaning: '🧹',
  moving: '📦',
  handyman: '🔧',
  yard_work: '🌿',
  painting: '🎨',
  plumbing: '🔩',
  electrical: '⚡',
  delivery: '🚚',
  assembly: '🪑',
  general: '💼',
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: 'Draft', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Edit },
  posted: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  in_review: { label: 'In Review', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  assigned: { label: 'Assigned', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  completed: { label: 'Completed', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
}

function JobDetailSkeleton() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Skeleton variant="text" width="80px" height="20px" />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Skeleton variant="rectangular" width="64px" height="64px" className="rounded-xl" />
                <div className="flex-1 space-y-3">
                  <Skeleton variant="text" width="60%" height="28px" />
                  <Skeleton variant="text" width="40%" height="16px" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-slate-800/50 rounded-xl">
                    <Skeleton variant="text" width="60%" height="14px" />
                    <Skeleton variant="text" width="80%" height="24px" className="mt-2" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 space-y-3">
              <Skeleton variant="text" width="140px" height="22px" />
              <Skeleton variant="text" width="100%" height="14px" />
              <Skeleton variant="text" width="100%" height="14px" />
              <Skeleton variant="text" width="70%" height="14px" />
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <Skeleton variant="text" width="120px" height="22px" />
              </div>
              <div className="divide-y divide-white/5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6">
                    <div className="flex gap-4">
                      <Skeleton variant="circular" width="56px" height="56px" />
                      <div className="flex-1 space-y-3">
                        <Skeleton variant="text" width="40%" height="18px" />
                        <Skeleton variant="text" width="100%" height="14px" />
                        <Skeleton variant="text" width="60%" height="14px" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 space-y-3">
              <Skeleton variant="rectangular" width="100%" height="120px" className="rounded-xl" />
              <Skeleton variant="text" width="100%" height="16px" />
            </div>
            <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-5 space-y-3">
              <Skeleton variant="text" width="80px" height="18px" />
              <Skeleton variant="text" width="100%" height="14px" />
              <Skeleton variant="text" width="100%" height="14px" />
              <Skeleton variant="text" width="100%" height="14px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HiringJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const { data: session } = useSession()

  const [job, setJob] = useState<JobDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBid, setSelectedBid] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [updatingJob, setUpdatingJob] = useState(false)

  const toast = useToast()

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || 'Job not found')
      }
      const json = await res.json()
      setJob(json.data || json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => { fetchJob() }, [fetchJob])

  const cancelJob = async () => {
    try {
      setCancelling(true)
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to cancel job')
      }
      toast.success('Job cancelled')
      router.push('/hiring/jobs')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel job')
    } finally {
      setCancelling(false)
    }
  }

  const updateJob = async (updates: Record<string, unknown>) => {
    try {
      setUpdatingJob(true)
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to update job')
      }
      const json = await res.json()
      // Re-fetch to get full job detail since PATCH returns partial data
      await fetchJob()
      toast.success('Job updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update job')
    } finally {
      setUpdatingJob(false)
    }
  }

  const handleAcceptBid = async (bidId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/bids`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId, status: 'accepted' }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to accept bid')
      }
      toast.success('Bid accepted! The worker will be notified.')
      await fetchJob()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept bid')
    }
  }

  const handleDeclineBid = async (bidId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/bids`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidId, status: 'rejected' }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to decline bid')
      }
      toast.info('Bid declined')
      await fetchJob()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to decline bid')
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  }

  const handleEditJob = () => {
    setShowActions(false)
    router.push(`/hiring/post?edit=${jobId}`)
  }

  const handleCancelJob = () => {
    setShowActions(false)
    cancelJob()
  }

  if (loading) {
    return <JobDetailSkeleton />
  }

  if (error || !job) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center pb-24 lg:pb-8">
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Job</h2>
          <p className="text-slate-400 mb-6">{error || 'Job not found'}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={fetchJob}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.back()}
              className="px-5 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const jobStatus = job.status as string
  const statusInfo = statusConfig[jobStatus] || statusConfig.draft
  const StatusIcon = statusInfo.icon
  const categoryIcon = categoryIcons[job.category] || categoryIcons.general
  const location = job.city || job.address
  const postedAt = formatRelativeTime(job.createdAt)
  const duration = job.estimatedHours ? `${job.estimatedHours} hours` : 'Flexible'
  const budgetMin = job.budgetMin ?? 0
  const budgetMax = job.budgetMax ?? 0
  const bids = job.bids || []
  const avgBid = bids.length > 0
    ? Math.round(bids.reduce((sum, b) => sum + b.amount, 0) / bids.length)
    : 0

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Share job"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                {showActions && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-white/10 rounded-xl shadow-xl z-10 overflow-hidden">
                    <button
                      onClick={handleEditJob}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-white/5 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Job
                    </button>
                    <button
                      onClick={handleCancelJob}
                      disabled={cancelling}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-400 hover:bg-white/5 transition-colors disabled:opacity-50"
                    >
                      {cancelling ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {cancelling ? 'Cancelling...' : 'Cancel Job'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-4xl shrink-0">
                  {categoryIcon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border shrink-0',
                        statusInfo.color
                      )}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {postedAt}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {job.viewCount} views
                    </div>
                  </div>
                </div>
              </div>

              {/* Budget & Details */}
              <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Budget</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${budgetMin} - ${budgetMax}
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <div className="text-xl font-bold text-white">{duration}</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Urgency</span>
                  </div>
                  <div className="text-xl font-bold text-white capitalize">{job.scheduleType}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
              <div className="text-slate-300 whitespace-pre-line">{job.description}</div>
            </div>

            {/* Bids Section */}
            <div id="bids" className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden scroll-mt-24">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Bids ({bids.length})
                  </h2>
                  <select className="px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                    <option>Sort by: Best Match</option>
                    <option>Sort by: Lowest Price</option>
                    <option>Sort by: Highest Rated</option>
                    <option>Sort by: Most Recent</option>
                  </select>
                </div>
              </div>

              {bids.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No bids yet</p>
                  <p className="text-sm text-slate-500 mt-1">Workers will start bidding on your job soon.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {bids.map((bid) => {
                    const workerName = bid.worker.name || 'Anonymous'
                    const workerAvatar = workerName.charAt(0).toUpperCase()
                    const workerProfile = bid.worker.workerProfile
                    const workerRating = workerProfile?.averageRating ?? 0
                    const workerCompletedJobs = workerProfile?.completedJobs ?? 0
                    const workerVerified = workerProfile?.isVerified ?? false
                    const bidTime = formatRelativeTime(bid.createdAt)

                    return (
                      <div
                        key={bid.id}
                        className={cn(
                          'p-6 transition-colors',
                          selectedBid === bid.id ? 'bg-cyan-500/5' : 'hover:bg-white/5'
                        )}
                      >
                        <div className="flex gap-4">
                          {/* Worker Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xl font-semibold">
                              {workerAvatar}
                            </div>
                            {workerVerified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                                <BadgeCheck className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Bid Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white">{workerName}</span>
                                  {workerRating > 0 && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                      <span className="text-sm text-white">{workerRating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5" />
                                    {workerCompletedJobs} jobs
                                  </span>
                                  <span>-</span>
                                  <span>{bidTime}</span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-2xl font-bold text-cyan-400">${bid.amount}</div>
                              </div>
                            </div>

                            {workerProfile?.headline && (
                              <p className="text-slate-300 mt-3">{workerProfile.headline}</p>
                            )}

                            {/* Actions */}
                            {bid.status === 'pending' && (
                              <div className="flex items-center gap-3 mt-4">
                                <button
                                  onClick={() => handleAcceptBid(bid.id)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Accept Bid
                                </button>
                                <Link
                                  href="/hiring/messages"
                                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Message
                                </Link>
                                <Link
                                  href={`/hiring/worker/${bid.worker.id}`}
                                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Profile
                                </Link>
                                <button
                                  onClick={() => handleDeclineBid(bid.id)}
                                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors ml-auto"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                            {bid.status === 'accepted' && (
                              <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Bid Accepted
                              </div>
                            )}
                            {bid.status === 'rejected' && (
                              <div className="mt-4 flex items-center gap-2 text-red-400 text-sm font-medium">
                                <XCircle className="w-4 h-4" />
                                Bid Declined
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Card */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                Location
              </h3>
              <div className="aspect-video bg-slate-800 rounded-xl mb-3 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-white font-medium">{location}</p>
              <p className="text-sm text-slate-400 mt-1">{job.address}</p>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Job Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Views</span>
                  <span className="text-white font-medium">{job.viewCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Bids</span>
                  <span className="text-white font-medium">{bids.length}</span>
                </div>
                {avgBid > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Avg Bid Amount</span>
                    <span className="text-cyan-400 font-medium">${avgBid}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleEditJob}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Job
                </button>
                <button
                  onClick={handleCancelJob}
                  disabled={cancelling}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {cancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  {cancelling ? 'Cancelling...' : 'Cancel Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
