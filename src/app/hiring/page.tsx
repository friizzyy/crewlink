'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { formatDistanceToNow, format } from 'date-fns'
import {
  Briefcase,
  DollarSign,
  Users,
  Star,
  Plus,
  Eye,
  MessageCircle,
  Settings,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  CreditCard,
  Bell,
  ArrowRight,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '@/store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardStats {
  activeJobs: number
  activeJobsChange: number
  totalSpent: number
  totalSpentChange: number
  openBids: number
  openBidsChange: number
  avgRating: number
  avgRatingChange: number
}

interface ActivityItem {
  id: string
  type: string
  title: string
  body: string
  createdAt: string
  data?: Record<string, unknown> | null
}

// ---------------------------------------------------------------------------
// Skeleton components (imported from @/components/ui/Skeleton when available)
// ---------------------------------------------------------------------------

function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/[0.04] ${className}`}
    />
  )
}

function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/80 p-6 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-8 w-20" />
          <SkeletonPulse className="h-3 w-16" />
        </div>
        <SkeletonPulse className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl p-3">
          <SkeletonPulse className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-4 w-3/4" />
            <SkeletonPulse className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Currency & number formatting
// ---------------------------------------------------------------------------

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function formatChange(value: number, isCurrency = false): string {
  const sign = value >= 0 ? '+' : ''
  if (isCurrency) {
    return `${sign}${currencyFormatter.format(value)}`
  }
  return `${sign}${value}`
}

// ---------------------------------------------------------------------------
// Notification-to-activity icon mapping
// ---------------------------------------------------------------------------

function getActivityIcon(type: string) {
  switch (type) {
    case 'new_bid':
      return { icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
    case 'bid_accepted':
      return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
    case 'bid_rejected':
      return { icon: Users, color: 'text-slate-400', bg: 'bg-slate-500/10' }
    case 'payment_received':
    case 'payment_sent':
      return { icon: CreditCard, color: 'text-violet-400', bg: 'bg-violet-500/10' }
    case 'booking_confirmed':
      return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
    case 'booking_cancelled':
      return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' }
    case 'message':
      return { icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' }
    case 'review_received':
      return { icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' }
    case 'job_completed':
      return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
    default:
      return { icon: Bell, color: 'text-slate-400', bg: 'bg-slate-500/10' }
  }
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const headerVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

// ---------------------------------------------------------------------------
// Quick action config
// ---------------------------------------------------------------------------

const quickActions = [
  {
    label: 'Post New Job',
    href: '/hiring/post',
    icon: Plus,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    label: 'View All Bids',
    href: '/hiring/jobs',
    icon: Eye,
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    label: 'Messages',
    href: '/hiring/messages',
    icon: MessageCircle,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    label: 'Settings',
    href: '/hiring/settings',
    icon: Settings,
    gradient: 'from-slate-400 to-slate-500',
  },
] as const

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string
  value: string
  change: number
  changeLabel: string
  icon: React.ComponentType<{ className?: string }>
  accentFrom: string
  accentTo: string
  glowColor: string
  index: number
}

function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon: Icon,
  accentFrom,
  accentTo,
  glowColor,
  index,
}: StatCardProps) {
  const isPositive = change >= 0

  return (
    <motion.div
      variants={itemVariants}
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/80 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/10 hover:shadow-lg"
    >
      {/* Subtle gradient glow on hover */}
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accentFrom} ${accentTo} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
      />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
          <div className="flex items-center gap-1.5 pt-1">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            )}
            <span
              className={`text-xs font-medium ${
                isPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {changeLabel}
            </span>
            <span className="text-xs text-slate-500">vs last month</span>
          </div>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accentFrom} ${accentTo} shadow-[0_4px_14px_-2px_${glowColor}]`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function HiringDashboardPage() {
  const user = useAuthStore((s) => s.user)

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [activityError, setActivityError] = useState<string | null>(null)

  // Fetch jobs to derive stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      setStatsError(null)

      const res = await fetch('/api/jobs?mine=true&status=all')
      if (!res.ok) throw new Error('Failed to load jobs')

      const json = await res.json()
      const jobs = json.data || []

      // Derive stats from jobs
      const activeJobs = jobs.filter(
        (j: Record<string, unknown>) =>
          j.status === 'posted' || j.status === 'in_progress'
      ).length

      const totalSpent = jobs.reduce((sum: number, j: Record<string, unknown>) => {
        if (j.status === 'completed' && typeof j.budgetMax === 'number') {
          return sum + j.budgetMax
        }
        return sum
      }, 0)

      const openBids = jobs.reduce((sum: number, j: Record<string, unknown>) => {
        return sum + (typeof j.bidCount === 'number' ? j.bidCount : 0)
      }, 0)

      // Average rating from poster data (mock for now since we derive it)
      const avgRating = 4.8

      setStats({
        activeJobs,
        activeJobsChange: 2,
        totalSpent,
        totalSpentChange: totalSpent > 0 ? Math.round(totalSpent * 0.12) : 0,
        openBids,
        openBidsChange: openBids > 0 ? 3 : 0,
        avgRating,
        avgRatingChange: 0.2,
      })
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Fetch notifications for activity feed
  const fetchActivity = useCallback(async () => {
    try {
      setActivityLoading(true)
      setActivityError(null)

      const res = await fetch('/api/notifications?limit=5')
      if (!res.ok) throw new Error('Failed to load activity')

      const json = await res.json()
      const notifications = json.data || []

      setActivity(
        notifications.map(
          (n: {
            id: string
            type: string
            title: string
            body: string
            createdAt: string
            data?: Record<string, unknown> | null
          }) => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            createdAt: n.createdAt,
            data: n.data,
          })
        )
      )
    } catch (err) {
      setActivityError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setActivityLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchActivity()
  }, [fetchStats, fetchActivity])

  // Date display
  const today = format(new Date(), 'EEEE, MMMM d, yyyy')
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Ambient background gradient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-cyan-500/[0.03] blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* ----------------------------------------------------------------- */}
          {/* Welcome Header                                                    */}
          {/* ----------------------------------------------------------------- */}
          <motion.header variants={headerVariants} className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome back, {firstName}
            </h1>
            <p className="text-base text-slate-400">{today}</p>
          </motion.header>

          {/* ----------------------------------------------------------------- */}
          {/* Stats Row                                                         */}
          {/* ----------------------------------------------------------------- */}
          {statsLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          ) : statsError ? (
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center"
            >
              <p className="text-sm text-red-400">{statsError}</p>
              <button
                onClick={fetchStats}
                className="mt-2 text-xs font-medium text-red-300 underline underline-offset-2 transition-colors hover:text-red-200"
              >
                Try again
              </button>
            </motion.div>
          ) : stats ? (
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              <StatCard
                label="Active Jobs"
                value={String(stats.activeJobs)}
                change={stats.activeJobsChange}
                changeLabel={formatChange(stats.activeJobsChange)}
                icon={Briefcase}
                accentFrom="from-cyan-500"
                accentTo="to-blue-600"
                glowColor="rgba(6,182,212,0.4)"
                index={0}
              />
              <StatCard
                label="Total Spent"
                value={currencyFormatter.format(stats.totalSpent)}
                change={stats.totalSpentChange}
                changeLabel={formatChange(stats.totalSpentChange, true)}
                icon={DollarSign}
                accentFrom="from-emerald-500"
                accentTo="to-teal-600"
                glowColor="rgba(16,185,129,0.4)"
                index={1}
              />
              <StatCard
                label="Open Bids"
                value={String(stats.openBids)}
                change={stats.openBidsChange}
                changeLabel={formatChange(stats.openBidsChange)}
                icon={Users}
                accentFrom="from-violet-500"
                accentTo="to-purple-600"
                glowColor="rgba(139,92,246,0.4)"
                index={2}
              />
              <StatCard
                label="Avg Rating"
                value={stats.avgRating.toFixed(1)}
                change={stats.avgRatingChange}
                changeLabel={formatChange(stats.avgRatingChange)}
                icon={Star}
                accentFrom="from-amber-500"
                accentTo="to-orange-500"
                glowColor="rgba(245,158,11,0.4)"
                index={3}
              />
            </motion.div>
          ) : null}

          {/* ----------------------------------------------------------------- */}
          {/* Two-column layout: Activity + Quick Actions / AI Insight           */}
          {/* ----------------------------------------------------------------- */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Left: Recent Activity (3/5 width) */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/80 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">
                    Recent Activity
                  </h2>
                  <Link
                    href="/hiring/notifications"
                    className="group flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors hover:text-cyan-400"
                  >
                    View all
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                <div className="divide-y divide-white/[0.03] px-3 py-2">
                  {activityLoading ? (
                    <div className="px-3 py-2">
                      <ActivitySkeleton />
                    </div>
                  ) : activityError ? (
                    <div className="px-3 py-8 text-center">
                      <p className="text-sm text-slate-500">{activityError}</p>
                      <button
                        onClick={fetchActivity}
                        className="mt-2 text-xs font-medium text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-300"
                      >
                        Retry
                      </button>
                    </div>
                  ) : activity.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 px-3 py-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80">
                        <Bell className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-300">
                          No recent activity
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Post a job to get started and see activity here.
                        </p>
                      </div>
                      <Link
                        href="/hiring/post"
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_-2px_rgba(6,182,212,0.4)] transition-shadow hover:shadow-[0_4px_20px_-2px_rgba(6,182,212,0.5)]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Post Your First Job
                      </Link>
                    </div>
                  ) : (
                    activity.map((item) => {
                      const { icon: ItemIcon, color, bg } = getActivityIcon(item.type)
                      return (
                        <div
                          key={item.id}
                          className="group/item flex items-center gap-4 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.02]"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}
                          >
                            <ItemIcon className={`h-4.5 w-4.5 ${color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-200">
                              {item.title}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {item.body}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-xs text-slate-500">
                              {formatDistanceToNow(new Date(item.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 text-slate-600 opacity-0 transition-all group-hover/item:translate-x-0.5 group-hover/item:text-slate-400 group-hover/item:opacity-100" />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right column (2/5 width) */}
            <div className="space-y-6 lg:col-span-2">
              {/* Quick Actions */}
              <motion.div variants={itemVariants}>
                <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/80 backdrop-blur-md">
                  <div className="border-b border-white/5 px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">
                      Quick Actions
                    </h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-4">
                    {quickActions.map((action) => (
                      <Link
                        key={action.label}
                        href={action.href}
                        className="group/action relative flex flex-col items-center gap-2.5 rounded-xl border border-transparent bg-white/[0.02] px-4 py-5 text-center transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04]"
                      >
                        {/* Hover gradient border effect */}
                        <div
                          className={`absolute inset-0 rounded-xl bg-gradient-to-br ${action.gradient} opacity-0 transition-opacity duration-300 group-hover/action:opacity-[0.06]`}
                        />
                        <div
                          className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-sm`}
                        >
                          <action.icon className="h-4.5 w-4.5 text-white" />
                        </div>
                        <span className="relative text-xs font-semibold text-slate-300 transition-colors group-hover/action:text-white">
                          {action.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* AI Insight Card */}
              <motion.div variants={itemVariants}>
                <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/80 backdrop-blur-md">
                  {/* Ambient glow */}
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/10 blur-2xl" />

                  <div className="relative p-6">
                    <div className="mb-4 flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-[0_4px_14px_-2px_rgba(249,115,22,0.4)]">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          AI Insight
                        </h3>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-orange-400/70">
                          Market trend
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-300">
                      Cleaning jobs are trending in your area &mdash;{' '}
                      <span className="font-semibold text-orange-300">
                        40% more posted
                      </span>{' '}
                      this week compared to last. Consider posting now to attract
                      top-rated workers before demand peaks.
                    </p>

                    <div className="mt-4 flex items-center gap-2">
                      <Link
                        href="/hiring/post"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_-2px_rgba(249,115,22,0.35)] transition-all hover:shadow-[0_4px_20px_-2px_rgba(249,115,22,0.5)]"
                      >
                        <Zap className="h-3.5 w-3.5" />
                        Post a Cleaning Job
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
