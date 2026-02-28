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
import { AmbientBackground } from '@/components/AmbientBackground'
import { GlassPanel, GlassCard, FeatureCard, Button, LiveDot, Badge } from '@/components/ui'

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
    <GlassPanel variant="elevated" padding="lg" border="light" rounded="xl">
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
    </GlassPanel>
  )
}

function JobCardSkeleton() {
  return (
    <GlassPanel variant="default" padding="lg" border="light" rounded="xl">
      <SkeletonPulse className="h-5 w-3/4 mb-3" />
      <SkeletonPulse className="h-4 w-1/3 mb-4" />
      <SkeletonPulse className="h-4 w-1/2 mb-2" />
      <SkeletonPulse className="h-4 w-2/3" />
    </GlassPanel>
  )
}

function BidsCardSkeleton() {
  return (
    <GlassPanel variant="subtle" padding="lg" border="light" rounded="xl">
      <SkeletonPulse className="h-5 w-32 mb-5" />
      <div className="space-y-4">
        <SkeletonPulse className="h-10 w-full animate-shimmer" />
        <SkeletonPulse className="h-10 w-full animate-shimmer" />
        <SkeletonPulse className="h-10 w-full animate-shimmer" />
      </div>
    </GlassPanel>
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
// QUICK ACTION CONFIG
// ============================================

const workerQuickActions = [
  {
    href: '/work/jobs',
    icon: Search,
    label: 'Browse Jobs',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconGradient: 'from-emerald-500 to-teal-600',
  },
  {
    href: '/work/messages',
    icon: MessageSquare,
    label: 'Messages',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    iconGradient: 'from-blue-500 to-indigo-600',
  },
  {
    href: '/work/earnings',
    icon: DollarSign,
    label: 'Earnings',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconGradient: 'from-amber-500 to-orange-600',
  },
  {
    href: '/work/profile',
    icon: UserCircle,
    label: 'Profile',
    gradient: 'from-violet-500/20 to-purple-500/20',
    iconGradient: 'from-violet-500 to-purple-600',
  },
] as const

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
// DEMAND BAR COMPONENT (heat-map style)
// ============================================

function DemandBar({ level, jobCount, maxJobs }: { level: 'high' | 'medium' | 'low'; jobCount: number; maxJobs: number }) {
  const barColors = {
    high: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
    medium: 'bg-gradient-to-r from-amber-500 to-amber-400',
    low: 'bg-gradient-to-r from-slate-600 to-slate-500',
  }
  const percentage = maxJobs > 0 ? Math.max((jobCount / maxJobs) * 100, 8) : 8

  return (
    <div className="w-full bg-slate-800/60 rounded-full h-2 overflow-hidden shadow-[inset_0_0_8px_rgba(16,185,129,0.08)]">
      <div
        className={`${barColors[level]} h-2 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.25)]`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

// ============================================
// TIME-OF-DAY GREETING
// ============================================

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
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
  const greeting = getGreeting()

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

  // Max jobs for demand bars
  const maxDemandJobs = demandCategories.length > 0
    ? Math.max(...demandCategories.map((c) => c.jobCount))
    : 1

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-slate-950">
      <AmbientBackground intensity="low" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
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
              {greeting},{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {firstName}
              </span>
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
              <GlassPanel variant="elevated" padding="lg" border="glow" rounded="xl" className="border-red-500/20">
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
              </GlassPanel>
            ) : (
              <GlassPanel
                variant="elevated"
                padding="lg"
                border="light"
                rounded="xl"
                className="overflow-hidden relative md:p-8 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)] hover:border-emerald-500/20 transition-all duration-300"
              >
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
                      <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent animate-glow-pulse">
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
                    <Link href="/work/earnings">
                      <Button
                        variant="success"
                        size="md"
                        rightIcon={<ArrowUpRight className="w-4 h-4" />}
                      >
                        View Earnings
                      </Button>
                    </Link>
                    <Link href="/work/earnings?tab=withdraw">
                      <Button
                        variant="outline"
                        size="md"
                        leftIcon={<DollarSign className="w-4 h-4" />}
                        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500"
                      >
                        Withdraw
                      </Button>
                    </Link>
                  </div>
                </div>
              </GlassPanel>
            )}
          </motion.div>

          {/* ============================================ */}
          {/* AI ONBOARDING COACH (conditional) */}
          {/* ============================================ */}
          {!profileLoading && !profileError && isNewUser && (
            <motion.div variants={itemVariants}>
              <FeatureCard gradient="emerald" shine>
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
                    <div className="w-full bg-slate-800/80 rounded-full h-2 mb-3 shadow-[inset_0_0_8px_rgba(16,185,129,0.08)]">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.25)]"
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
              </FeatureCard>
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
              <GlassPanel variant="default" padding="xl" border="light" rounded="xl" className="text-center">
                <Search className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-300 font-medium mb-1">Browse Available Jobs</p>
                <p className="text-sm text-slate-500 mb-4">
                  AI recommendations are temporarily unavailable. Browse jobs manually.
                </p>
                <Link href="/work/jobs">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Search className="w-4 h-4" />}
                    className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                  >
                    Browse Jobs
                  </Button>
                </Link>
              </GlassPanel>
            ) : recommendedJobs.length === 0 ? (
              <GlassPanel variant="default" padding="xl" border="light" rounded="xl" className="text-center">
                <Briefcase className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-300 font-medium mb-1">No recommendations yet</p>
                <p className="text-sm text-slate-500">Complete your profile to get personalized matches.</p>
              </GlassPanel>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedJobs.slice(0, 3).map((job, idx) => (
                  <Link
                    key={job.id}
                    href={`/work/jobs/${job.id}`}
                  >
                    <GlassCard
                      interactive
                      padding="lg"
                      className="h-full group animate-card-enter"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 pr-2">
                          {job.title}
                        </h3>
                        {job.matchScore > 0 && (
                          <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/20">
                            {job.matchScore}%
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
                    </GlassCard>
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
                <GlassPanel variant="subtle" padding="lg" border="light" rounded="xl" className="border-red-500/20">
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
                </GlassPanel>
              ) : (
                <GlassPanel variant="subtle" padding="lg" border="light" rounded="xl" className="shadow-[0_4px_16px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)] hover:border-emerald-500/20 transition-all duration-300">
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
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 animate-stagger-fade" style={{ animationDelay: '0ms' }}>
                      <div className="flex items-center gap-3">
                        <LiveDot variant="amber" size="sm" pulse />
                        <span className="text-sm text-slate-300">Pending</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-lg font-bold text-white">{bidSummary?.pending ?? 0}</span>
                      </div>
                    </div>

                    {/* Accepted */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 animate-stagger-fade" style={{ animationDelay: '80ms' }}>
                      <div className="flex items-center gap-3">
                        <LiveDot variant="green" size="sm" pulse={false} />
                        <span className="text-sm text-slate-300">Accepted</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-lg font-bold text-white">{bidSummary?.accepted ?? 0}</span>
                      </div>
                    </div>

                    {/* Rejected */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 animate-stagger-fade" style={{ animationDelay: '160ms' }}>
                      <div className="flex items-center gap-3">
                        <LiveDot variant="red" size="sm" pulse={false} />
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
                </GlassPanel>
              )}
            </motion.div>

            {/* RIGHT: Quick Actions + Demand Insights */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Quick Actions */}
              <GlassPanel variant="default" padding="lg" border="light" rounded="xl" className="hover:border-emerald-500/20 transition-all duration-300">
                <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
                <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
                  {workerQuickActions.map((action, idx) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex-shrink-0"
                    >
                      <GlassCard
                        interactive
                        padding="md"
                        className="flex w-[110px] flex-col items-center gap-2.5 text-center animate-card-enter"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.iconGradient} flex items-center justify-center`}
                          >
                            <action.icon className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-300">
                          {action.label}
                        </span>
                      </GlassCard>
                    </Link>
                  ))}
                </div>
              </GlassPanel>

              {/* Demand Insights */}
              {profile?.baseAddress && (
                <GlassPanel variant="default" padding="lg" border="light" rounded="xl" className="border-emerald-500/[0.15] hover:shadow-[0_0_24px_rgba(16,185,129,0.1)] transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-white">Demand Insights</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Hot categories in your area</p>
                    </div>
                    <Flame className="w-5 h-5 text-amber-400" />
                  </div>

                  {demandLoading ? (
                    <div className="space-y-3">
                      <div className="animate-shimmer"><SkeletonPulse className="h-14 w-full" /></div>
                      <div className="animate-shimmer" style={{ animationDelay: '100ms' }}><SkeletonPulse className="h-14 w-full" /></div>
                      <div className="animate-shimmer" style={{ animationDelay: '200ms' }}><SkeletonPulse className="h-14 w-full" /></div>
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
                          className="p-3 rounded-xl bg-slate-800/40 animate-stagger-fade"
                          style={{ animationDelay: `${idx * 80}ms` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-200">{cat.category}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-500">{cat.jobCount} jobs</span>
                              <DemandBadge level={cat.demandLevel} />
                            </div>
                          </div>
                          <DemandBar level={cat.demandLevel} jobCount={cat.jobCount} maxJobs={maxDemandJobs} />
                        </div>
                      ))}
                    </div>
                  )}
                </GlassPanel>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
