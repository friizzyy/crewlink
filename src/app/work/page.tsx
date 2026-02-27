'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Wallet,
  TrendingUp,
  Star,
  Briefcase,
  ArrowUpRight,
  MapPin,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  MessageSquare,
  DollarSign,
  UserCircle,
  Lightbulb,
  Flame,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { EarningsSparkline } from '@/components/charts/EarningsChart'
import { formatCurrency, formatDate, formatRating } from '@/lib/utils'

// ============================================
// TYPES
// ============================================

interface ProfileData {
  id: string
  headline: string | null
  bio: string | null
  hourlyRate: number | null
  skills: string[]
  isVerified: boolean
  completedJobs: number
  totalEarnings: number
  averageRating: number
  responseRate: number
  baseAddress: string | null
  baseLat: number | null
  baseLng: number | null
  user?: {
    name: string | null
  }
}

interface BidSummary {
  pending: number
  accepted: number
  rejected: number
  total: number
}

interface RecommendedJob {
  id: string
  title: string
  category: string
  budgetMin: number | null
  budgetMax: number | null
  budgetType: string
  address: string
  matchScore: number
  createdAt: string
}

interface DemandCategory {
  category: string
  demandLevel: 'high' | 'medium' | 'low'
  jobCount: number
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ============================================
// SKELETON COMPONENTS
// ============================================

function SkeletonPulse({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-800/60 ${className ?? ''}`}
    />
  )
}

function EarningsCardSkeleton() {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex-1 space-y-4">
          <SkeletonPulse className="h-4 w-32" />
          <SkeletonPulse className="h-10 w-48" />
          <div className="flex gap-8 pt-2">
            <SkeletonPulse className="h-12 w-28" />
            <SkeletonPulse className="h-12 w-28" />
            <SkeletonPulse className="h-12 w-28" />
          </div>
        </div>
        <SkeletonPulse className="h-12 w-48" />
      </div>
    </div>
  )
}

function JobCardSkeleton() {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-5">
      <SkeletonPulse className="h-5 w-3/4 mb-3" />
      <SkeletonPulse className="h-4 w-1/3 mb-4" />
      <SkeletonPulse className="h-4 w-1/2 mb-2" />
      <SkeletonPulse className="h-4 w-2/3" />
    </div>
  )
}

function BidsCardSkeleton() {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-6">
      <SkeletonPulse className="h-5 w-32 mb-5" />
      <div className="space-y-4">
        <SkeletonPulse className="h-10 w-full" />
        <SkeletonPulse className="h-10 w-full" />
        <SkeletonPulse className="h-10 w-full" />
      </div>
    </div>
  )
}

// ============================================
// SPARKLINE MOCK DATA
// ============================================

const sparklineData = [
  { date: 'Mon', amount: 120 },
  { date: 'Tue', amount: 180 },
  { date: 'Wed', amount: 90 },
  { date: 'Thu', amount: 240 },
  { date: 'Fri', amount: 310 },
  { date: 'Sat', amount: 280 },
  { date: 'Sun', amount: 350 },
]

// ============================================
// QUICK ACTION COMPONENT
// ============================================

interface QuickActionProps {
  href: string
  icon: React.ReactNode
  label: string
}

function QuickAction({ href, icon, label }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center gap-2.5 p-5 rounded-xl
        bg-slate-900/60 border border-white/5
        hover:border-emerald-500/30 hover:bg-slate-800/60
        transition-all duration-200"
    >
      <div
        className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center
          group-hover:bg-emerald-500/20 transition-colors duration-200"
      >
        {icon}
      </div>
      <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
        {label}
      </span>
    </Link>
  )
}

// ============================================
// DEMAND BADGE COMPONENT
// ============================================

function DemandBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'High Demand' },
    medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'Medium' },
    low: { bg: 'bg-slate-500/15', text: 'text-slate-400', label: 'Low' },
  }
  const { bg, text, label } = config[level]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {level === 'high' && <Flame className="w-3 h-3" />}
      {label}
    </span>
  )
}

// ============================================
// MAIN WORKER DASHBOARD
// ============================================

export default function WorkDashboardPage() {
  const { user } = useAuthStore()

  // Data states
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [bidSummary, setBidSummary] = useState<BidSummary | null>(null)
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([])
  const [demandCategories, setDemandCategories] = useState<DemandCategory[]>([])

  // Loading states
  const [profileLoading, setProfileLoading] = useState(true)
  const [bidsLoading, setBidsLoading] = useState(true)
  const [jobsLoading, setJobsLoading] = useState(true)
  const [demandLoading, setDemandLoading] = useState(true)

  // Error states
  const [profileError, setProfileError] = useState<string | null>(null)
  const [bidsError, setBidsError] = useState<string | null>(null)
  const [jobsError, setJobsError] = useState<string | null>(null)
  const [demandError, setDemandError] = useState<string | null>(null)

  // AI availability
  const [aiAvailable, setAiAvailable] = useState(true)

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchProfile = useCallback(async () => {
    setProfileLoading(true)
    setProfileError(null)
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to load profile')
      const data = await res.json()
      setProfile(data.data ?? data)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setProfileLoading(false)
    }
  }, [])

  const fetchBids = useCallback(async () => {
    setBidsLoading(true)
    setBidsError(null)
    try {
      const res = await fetch('/api/bids')
      if (!res.ok) throw new Error('Failed to load bids')
      const data = await res.json()
      const bids = data.data ?? data.items ?? data ?? []
      const bidsArray = Array.isArray(bids) ? bids : []
      setBidSummary({
        pending: bidsArray.filter((b: { status: string }) => b.status === 'pending').length,
        accepted: bidsArray.filter((b: { status: string }) => b.status === 'accepted').length,
        rejected: bidsArray.filter((b: { status: string }) => b.status === 'rejected').length,
        total: bidsArray.length,
      })
    } catch (err) {
      setBidsError(err instanceof Error ? err.message : 'Failed to load bids')
    } finally {
      setBidsLoading(false)
    }
  }, [])

  const fetchRecommendedJobs = useCallback(async () => {
    setJobsLoading(true)
    setJobsError(null)
    try {
      const res = await fetch('/api/ai/match-jobs')
      if (!res.ok) {
        setAiAvailable(false)
        throw new Error('AI recommendations unavailable')
      }
      const data = await res.json()
      setRecommendedJobs(data.data ?? data.jobs ?? data ?? [])
      setAiAvailable(true)
    } catch (err) {
      setAiAvailable(false)
      setJobsError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setJobsLoading(false)
    }
  }, [])

  const fetchDemandInsights = useCallback(async (address: string) => {
    setDemandLoading(true)
    setDemandError(null)
    try {
      const res = await fetch('/api/ai/demand-heatmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: address }),
      })
      if (!res.ok) throw new Error('Failed to load demand data')
      const data = await res.json()
      setDemandCategories(data.data ?? data.categories ?? data ?? [])
    } catch (err) {
      setDemandError(err instanceof Error ? err.message : 'Failed to load demand insights')
    } finally {
      setDemandLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
    fetchBids()
    fetchRecommendedJobs()
  }, [fetchProfile, fetchBids, fetchRecommendedJobs])

  // Fetch demand insights when profile loads with location
  useEffect(() => {
    if (profile?.baseAddress) {
      fetchDemandInsights(profile.baseAddress)
    } else if (!profileLoading) {
      setDemandLoading(false)
    }
  }, [profile, profileLoading, fetchDemandInsights])

  // ============================================
  // DERIVED VALUES
  // ============================================

  const userName = user?.name ?? profile?.user?.name ?? 'Worker'
  const firstName = userName.split(' ')[0]
  const today = formatDate(new Date(), 'EEEE, MMMM d')
  const completedJobs = profile?.completedJobs ?? 0
  const isNewUser = completedJobs < 3
  const availableBalance = profile?.totalEarnings ?? 0
  const avgRating = profile?.averageRating ?? 0
  const monthlyEarnings = Math.round(availableBalance * 0.32) // estimate this month

  // Profile completeness calculation
  const profileFields = [
    !!profile?.headline,
    !!profile?.bio,
    (profile?.skills?.length ?? 0) > 0,
    !!profile?.hourlyRate,
    !!profile?.baseAddress,
    profile?.isVerified ?? false,
  ]
  const profileCompleteness = Math.round(
    (profileFields.filter(Boolean).length / profileFields.length) * 100
  )

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* ============================================ */}
          {/* WELCOME HEADER */}
          {/* ============================================ */}
          <motion.div variants={itemVariants}>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome back, {firstName}
            </h1>
            <p className="text-slate-400 mt-1">{today}</p>
          </motion.div>

          {/* ============================================ */}
          {/* EARNINGS SUMMARY CARD */}
          {/* ============================================ */}
          <motion.div variants={itemVariants}>
            {profileLoading ? (
              <EarningsCardSkeleton />
            ) : profileError ? (
              <div className="bg-slate-900/80 backdrop-blur-md border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{profileError}</p>
                  <button
                    onClick={fetchProfile}
                    className="ml-auto flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 overflow-hidden relative">
                {/* Subtle gradient accent */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Left: Balance + Stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                        Available Balance
                      </span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {formatCurrency(availableBalance)}
                      </span>
                      <div className="w-24 h-12 flex-shrink-0">
                        <EarningsSparkline data={sparklineData} />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-6 md:gap-10 mt-5 pt-5 border-t border-white/5">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">This Month</p>
                        <p className="text-lg font-semibold text-white flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          {formatCurrency(monthlyEarnings)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Completed Jobs</p>
                        <p className="text-lg font-semibold text-white flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-emerald-400" />
                          {completedJobs}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Rating</p>
                        <p className="text-lg font-semibold text-white flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-400" />
                          {avgRating > 0 ? formatRating(avgRating) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action buttons */}
                  <div className="flex flex-row lg:flex-col gap-3 flex-shrink-0">
                    <Link
                      href="/work/earnings"
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                        bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm
                        hover:from-emerald-400 hover:to-teal-500 transition-all duration-200
                        shadow-lg shadow-emerald-500/20"
                    >
                      View Earnings
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/work/earnings?tab=withdraw"
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                        border border-emerald-500/30 text-emerald-400 font-semibold text-sm
                        hover:bg-emerald-500/10 transition-all duration-200"
                    >
                      <DollarSign className="w-4 h-4" />
                      Withdraw
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* ============================================ */}
          {/* AI ONBOARDING COACH (conditional) */}
          {/* ============================================ */}
          {!profileLoading && !profileError && isNewUser && (
            <motion.div variants={itemVariants}>
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-1">
                      Complete your profile to get 3x more job matches
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Workers with complete profiles earn more and get hired faster. You are {profileCompleteness}% there.
                    </p>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-800/80 rounded-full h-2 mb-3">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${profileCompleteness}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{profileCompleteness}% complete</span>
                      <Link
                        href="/work/profile"
                        className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Complete Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* RECOMMENDED FOR YOU */}
          {/* ============================================ */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">Recommended for You</h2>
                {aiAvailable && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-3 h-3" />
                    Powered by AI
                  </span>
                )}
              </div>
              <Link
                href="/work/jobs"
                className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
              >
                View All Jobs
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {jobsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </div>
            ) : jobsError || !aiAvailable ? (
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-8 text-center">
                <Search className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-300 font-medium mb-1">Browse Available Jobs</p>
                <p className="text-sm text-slate-500 mb-4">
                  AI recommendations are temporarily unavailable. Browse jobs manually.
                </p>
                <Link
                  href="/work/jobs"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                    bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium
                    hover:bg-emerald-500/20 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Browse Jobs
                </Link>
              </div>
            ) : recommendedJobs.length === 0 ? (
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-8 text-center">
                <Briefcase className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-300 font-medium mb-1">No recommendations yet</p>
                <p className="text-sm text-slate-500">Complete your profile to get personalized matches.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedJobs.slice(0, 3).map((job) => (
                  <Link
                    key={job.id}
                    href={`/work/jobs/${job.id}`}
                    className="group bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-5
                      hover:border-emerald-500/20 hover:bg-slate-800/60 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 pr-2">
                        {job.title}
                      </h3>
                      {job.matchScore > 0 && (
                        <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400">
                          {job.matchScore}% match
                        </span>
                      )}
                    </div>

                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 mb-3">
                      {job.category}
                    </span>

                    <div className="space-y-1.5">
                      <p className="text-sm text-emerald-400 font-semibold">
                        {job.budgetMin != null && job.budgetMax != null
                          ? `${formatCurrency(job.budgetMin)} - ${formatCurrency(job.budgetMax)}`
                          : job.budgetMin != null
                            ? `From ${formatCurrency(job.budgetMin)}`
                            : job.budgetMax != null
                              ? `Up to ${formatCurrency(job.budgetMax)}`
                              : 'Budget TBD'}
                        {job.budgetType === 'hourly' ? '/hr' : ''}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {job.address}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* ============================================ */}
          {/* TWO-COLUMN LAYOUT */}
          {/* ============================================ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Active Bids Tracker */}
            <motion.div variants={itemVariants}>
              {bidsLoading ? (
                <BidsCardSkeleton />
              ) : bidsError ? (
                <div className="bg-slate-900/80 backdrop-blur-md border border-red-500/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 text-red-400 mb-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{bidsError}</p>
                  </div>
                  <button
                    onClick={fetchBids}
                    className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-white">Active Bids</h2>
                    <Link
                      href="/work/bids"
                      className="text-sm text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                    >
                      View All
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {/* Pending */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/30" />
                        <span className="text-sm text-slate-300">Pending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-lg font-bold text-white">{bidSummary?.pending ?? 0}</span>
                      </div>
                    </div>

                    {/* Accepted */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />
                        <span className="text-sm text-slate-300">Accepted</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-lg font-bold text-white">{bidSummary?.accepted ?? 0}</span>
                      </div>
                    </div>

                    {/* Rejected */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-lg shadow-red-400/30" />
                        <span className="text-sm text-slate-300">Rejected</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-lg font-bold text-white">{bidSummary?.rejected ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Total Active</span>
                    <span className="text-sm font-semibold text-slate-300">{bidSummary?.total ?? 0} bids</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* RIGHT: Quick Actions + Demand Insights */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <QuickAction
                    href="/work/jobs"
                    icon={<Search className="w-5 h-5 text-emerald-400" />}
                    label="Browse Jobs"
                  />
                  <QuickAction
                    href="/work/messages"
                    icon={<MessageSquare className="w-5 h-5 text-emerald-400" />}
                    label="Messages"
                  />
                  <QuickAction
                    href="/work/earnings"
                    icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
                    label="Earnings"
                  />
                  <QuickAction
                    href="/work/profile"
                    icon={<UserCircle className="w-5 h-5 text-emerald-400" />}
                    label="Profile"
                  />
                </div>
              </div>

              {/* Demand Insights */}
              {profile?.baseAddress && (
                <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">Demand Insights</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Hot categories in your area</p>
                    </div>
                    <Flame className="w-5 h-5 text-amber-400" />
                  </div>

                  {demandLoading ? (
                    <div className="space-y-3">
                      <SkeletonPulse className="h-10 w-full" />
                      <SkeletonPulse className="h-10 w-full" />
                      <SkeletonPulse className="h-10 w-full" />
                    </div>
                  ) : demandError ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-500 mb-2">{demandError}</p>
                      <button
                        onClick={() => profile?.baseAddress && fetchDemandInsights(profile.baseAddress)}
                        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 mx-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retry
                      </button>
                    </div>
                  ) : demandCategories.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No demand data available for your area yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {demandCategories.slice(0, 3).map((cat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-200">{cat.category}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">{cat.jobCount} jobs</span>
                            <DemandBadge level={cat.demandLevel} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
