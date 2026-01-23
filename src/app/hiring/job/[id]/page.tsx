'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Clock, DollarSign, Users, Eye,
  MessageCircle, Star, CheckCircle2, XCircle, AlertCircle,
  Edit, Trash2, Share2, MoreHorizontal, Calendar, BadgeCheck,
  Phone, Mail, ChevronDown, Award
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

// Mock job detail data
const mockJob = {
  id: '1',
  title: 'Deep House Cleaning',
  category: 'cleaning',
  categoryIcon: '🧹',
  status: 'active',
  description: `Looking for an experienced cleaner to do a thorough deep cleaning of my 2-bedroom apartment.

Tasks include:
- Kitchen deep clean (oven, fridge, cabinets)
- Bathroom sanitization (2 bathrooms)
- Floor mopping and vacuuming
- Window cleaning (interior)
- Dusting all surfaces

The apartment is approximately 1,100 sq ft. All cleaning supplies will be provided.`,
  budget: { min: 120, max: 180 },
  location: 'Mission District, San Francisco',
  address: '1234 Valencia St',
  postedAt: '2 hours ago',
  urgency: 'today',
  duration: '3-4 hours',
  bids: [
    {
      id: '1',
      worker: {
        id: 'w1',
        name: 'Maria Garcia',
        avatar: 'M',
        rating: 4.9,
        reviews: 127,
        verified: true,
        completedJobs: 215,
      },
      amount: 150,
      message: "Hi! I have 5+ years of experience in deep cleaning. I'm available today and can start at 2pm. I bring eco-friendly supplies if needed.",
      submittedAt: '1 hour ago',
    },
    {
      id: '2',
      worker: {
        id: 'w2',
        name: 'David Chen',
        avatar: 'D',
        rating: 4.7,
        reviews: 84,
        verified: true,
        completedJobs: 142,
      },
      amount: 165,
      message: "Available this afternoon. I specialize in move-out/move-in deep cleans. Very thorough and detail-oriented.",
      submittedAt: '45 min ago',
    },
    {
      id: '3',
      worker: {
        id: 'w3',
        name: 'Sarah Kim',
        avatar: 'S',
        rating: 5.0,
        reviews: 203,
        verified: true,
        completedJobs: 312,
      },
      amount: 175,
      message: "Professional cleaner with excellent reviews. I guarantee satisfaction or your money back. Can start within 2 hours.",
      submittedAt: '30 min ago',
    },
  ],
  views: 23,
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  completed: { label: 'Completed', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: CheckCircle2 },
  draft: { label: 'Draft', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Edit },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
}

export default function HiringJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedBid, setSelectedBid] = useState<string | null>(null)
  const [showActions, setShowActions] = useState(false)

  const StatusIcon = statusConfig[mockJob.status].icon
  const toast = useToast()

  const handleAcceptBid = (bidId: string) => {
    // In real app, accept bid via API
    toast.success('Bid accepted! The worker will be notified.')
  }

  const handleDeclineBid = (bidId: string) => {
    // In real app, decline bid via API
    toast.info('Bid declined')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  }

  const handleEditJob = () => {
    toast.info('Job editing coming soon')
    setShowActions(false)
  }

  const handleCancelJob = () => {
    toast.info('Job cancellation coming soon')
    setShowActions(false)
  }

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
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-400 hover:bg-white/5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Cancel Job
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
                  {mockJob.categoryIcon}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-2xl font-bold text-white">{mockJob.title}</h1>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border shrink-0',
                        statusConfig[mockJob.status].color
                      )}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig[mockJob.status].label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {mockJob.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {mockJob.postedAt}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {mockJob.views} views
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
                    ${mockJob.budget.min} - ${mockJob.budget.max}
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <div className="text-xl font-bold text-white">{mockJob.duration}</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Urgency</span>
                  </div>
                  <div className="text-xl font-bold text-white capitalize">{mockJob.urgency}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
              <div className="text-slate-300 whitespace-pre-line">{mockJob.description}</div>
            </div>

            {/* Bids Section */}
            <div id="bids" className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden scroll-mt-24">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    Bids ({mockJob.bids.length})
                  </h2>
                  <select className="px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50">
                    <option>Sort by: Best Match</option>
                    <option>Sort by: Lowest Price</option>
                    <option>Sort by: Highest Rated</option>
                    <option>Sort by: Most Recent</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {mockJob.bids.map((bid) => (
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
                          {bid.worker.avatar}
                        </div>
                        {bid.worker.verified && (
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
                              <span className="font-semibold text-white">{bid.worker.name}</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="text-sm text-white">{bid.worker.rating}</span>
                                <span className="text-sm text-slate-500">
                                  ({bid.worker.reviews} reviews)
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                {bid.worker.completedJobs} jobs
                              </span>
                              <span>•</span>
                              <span>{bid.submittedAt}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-2xl font-bold text-cyan-400">${bid.amount}</div>
                          </div>
                        </div>

                        <p className="text-slate-300 mt-3">{bid.message}</p>

                        {/* Actions */}
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <p className="text-white font-medium">{mockJob.location}</p>
              <p className="text-sm text-slate-400 mt-1">{mockJob.address}</p>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Job Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Views</span>
                  <span className="text-white font-medium">{mockJob.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total Bids</span>
                  <span className="text-white font-medium">{mockJob.bids.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Avg Bid Amount</span>
                  <span className="text-cyan-400 font-medium">
                    ${Math.round(mockJob.bids.reduce((sum, b) => sum + b.amount, 0) / mockJob.bids.length)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/hiring/post?edit=${mockJob.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Job
                </Link>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 text-sm font-medium rounded-xl hover:bg-red-500/20 transition-colors">
                  <XCircle className="w-4 h-4" />
                  Cancel Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
