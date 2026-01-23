'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Clock, DollarSign, Users, Star,
  MessageCircle, Bookmark, BookmarkCheck, Share2, Calendar,
  CheckCircle2, AlertCircle, Send, Zap, Award, BadgeCheck,
  Briefcase, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

// Mock job detail data
const mockJob = {
  id: '1',
  title: 'Deep House Cleaning',
  category: 'cleaning',
  categoryIcon: '🧹',
  description: `Looking for an experienced cleaner to do a thorough deep cleaning of my 2-bedroom apartment.

Tasks include:
- Kitchen deep clean (oven, fridge, cabinets)
- Bathroom sanitization (2 bathrooms)
- Floor mopping and vacuuming
- Window cleaning (interior)
- Dusting all surfaces

The apartment is approximately 1,100 sq ft. All cleaning supplies will be provided.

Requirements:
- Previous cleaning experience
- Attention to detail
- Reliable and punctual`,
  budget: { min: 120, max: 180 },
  location: 'Mission District, San Francisco',
  address: '1234 Valencia St (exact address shared after booking)',
  distance: '0.8 mi',
  postedAt: '2 hours ago',
  urgency: 'today',
  duration: '3-4 hours',
  bids: 5,
  views: 23,
  hirer: {
    id: 'h1',
    name: 'Alex Johnson',
    avatar: 'A',
    rating: 4.9,
    reviews: 12,
    jobsPosted: 15,
    memberSince: 'Jan 2024',
    verified: true,
    responseRate: '95%',
    avgResponseTime: '< 1 hour',
  },
}

const urgencyConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  urgent: { label: 'Urgent', color: 'text-red-400', bgColor: 'bg-red-500/20' },
  today: { label: 'Today', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  'this-week': { label: 'This Week', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  flexible: { label: 'Flexible', color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
}

export default function WorkJobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)
  const [bidAmount, setBidAmount] = useState('')
  const [bidMessage, setBidMessage] = useState('')
  const [showBidForm, setShowBidForm] = useState(false)
  const [bidSubmitted, setBidSubmitted] = useState(false)
  const toast = useToast()

  const handleSubmitBid = () => {
    if (!bidAmount || !bidMessage) {
      toast.error('Please enter your bid amount and message')
      return
    }
    // In real app, submit bid via API
    toast.success('Bid submitted successfully!')
    setBidSubmitted(true)
    setShowBidForm(false)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied to clipboard')
  }

  const handleToggleSave = () => {
    setIsSaved(!isSaved)
    toast.success(isSaved ? 'Job removed from saved' : 'Job saved')
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
                onClick={handleToggleSave}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isSaved
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
                title={isSaved ? 'Remove from saved' : 'Save job'}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Share job"
              >
                <Share2 className="w-5 h-5" />
              </button>
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
                        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full shrink-0',
                        urgencyConfig[mockJob.urgency].bgColor,
                        urgencyConfig[mockJob.urgency].color
                      )}
                    >
                      {mockJob.urgency === 'urgent' && <Zap className="w-3.5 h-3.5" />}
                      {urgencyConfig[mockJob.urgency].label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {mockJob.location}
                      <span className="text-emerald-400">({mockJob.distance})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {mockJob.postedAt}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Details */}
              <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Budget</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${mockJob.budget.min} - ${mockJob.budget.max}
                  </div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Duration</span>
                  </div>
                  <div className="text-xl font-bold text-white">{mockJob.duration}</div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Bids</span>
                  </div>
                  <div className="text-xl font-bold text-white">{mockJob.bids} bids</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Job Description</h2>
              <div className="text-slate-300 whitespace-pre-line">{mockJob.description}</div>
            </div>

            {/* Location */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                Location
              </h2>
              <div className="aspect-video bg-slate-800 rounded-xl mb-4 flex items-center justify-center">
                <MapPin className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-white font-medium">{mockJob.location}</p>
              <p className="text-sm text-slate-400 mt-1">{mockJob.address}</p>
            </div>

            {/* Bid Form */}
            {showBidForm && !bidSubmitted && (
              <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Submit Your Bid</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Your Bid Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder="Enter your price"
                        className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Budget range: ${mockJob.budget.min} - ${mockJob.budget.max}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Cover Letter
                    </label>
                    <textarea
                      value={bidMessage}
                      onChange={(e) => setBidMessage(e.target.value)}
                      placeholder="Introduce yourself and explain why you're the best fit for this job..."
                      rows={5}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleSubmitBid}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                      Submit Bid
                    </button>
                    <button
                      onClick={() => setShowBidForm(false)}
                      className="px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bid Submitted Confirmation */}
            {bidSubmitted && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Bid Submitted!</h2>
                <p className="text-slate-400 mb-4">
                  Your bid of ${bidAmount} has been submitted. The hirer will review your application and get back to you soon.
                </p>
                <Link
                  href="/work/messages"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Go to Messages
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            {!bidSubmitted && (
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-emerald-400">
                    ${mockJob.budget.min} - ${mockJob.budget.max}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">Budget Range</p>
                </div>

                {!showBidForm ? (
                  <button
                    onClick={() => setShowBidForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-colors"
                  >
                    <Briefcase className="w-5 h-5" />
                    Apply for this Job
                  </button>
                ) : (
                  <p className="text-sm text-slate-400 text-center">
                    Complete the form below to submit your bid
                  </p>
                )}

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
                  <AlertCircle className="w-4 h-4 text-slate-500" />
                  <span className="text-xs text-slate-500">
                    {mockJob.bids} people have already applied
                  </span>
                </div>
              </div>
            )}

            {/* Hirer Info */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">About the Hirer</h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xl font-semibold">
                    {mockJob.hirer.avatar}
                  </div>
                  {mockJob.hirer.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                      <BadgeCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{mockJob.hirer.name}</span>
                    {mockJob.hirer.verified && (
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-white">{mockJob.hirer.rating}</span>
                    <span className="text-slate-500">({mockJob.hirer.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jobs Posted</span>
                  <span className="text-white">{mockJob.hirer.jobsPosted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Member Since</span>
                  <span className="text-white">{mockJob.hirer.memberSince}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Response Rate</span>
                  <span className="text-emerald-400">{mockJob.hirer.responseRate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Avg Response</span>
                  <span className="text-white">{mockJob.hirer.avgResponseTime}</span>
                </div>
              </div>

              <Link
                href={`/work/hirer/${mockJob.hirer.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors mt-4"
              >
                View Full Profile
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Similar Jobs */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4">Similar Jobs</h3>
              <div className="space-y-3">
                {[
                  { id: '2', title: 'Apartment Cleaning', budget: '$80-100', location: 'Castro' },
                  { id: '3', title: 'Move-out Cleaning', budget: '$150-200', location: 'SOMA' },
                  { id: '4', title: 'Office Cleaning', budget: '$200-300', location: 'FiDi' },
                ].map((job) => (
                  <Link
                    key={job.id}
                    href={`/work/job/${job.id}`}
                    className="block p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <div className="font-medium text-white text-sm">{job.title}</div>
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-emerald-400">{job.budget}</span>
                      <span className="text-slate-500">{job.location}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
