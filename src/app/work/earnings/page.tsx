'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  DollarSign, TrendingUp, Download, ChevronRight,
  CreditCard, Building2, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, AlertCircle, Star, Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton, SkeletonStatCard } from '@/components/ui/Skeleton'
import { EarningsChart } from '@/components/charts/EarningsChart'
import toast from 'react-hot-toast'

// ============================================
// TYPES
// ============================================

interface DailyEarning {
  date: string
  amount: number
}

interface Transaction {
  id: string
  amount: number
  type: string
  status: string
  description: string
  date: string
}

interface EarningsData {
  availableBalance: number
  totalEarned: number
  totalWithdrawn: number
  thisMonthEarnings: number
  lastMonthEarnings: number
  monthlyChange: number
  completedJobs: number
  averageRating: number
  dailyEarnings: DailyEarning[]
  transactions: Transaction[]
}

interface EarningsApiResponse {
  success: boolean
  data: EarningsData
}

// ============================================
// STATIC PAYOUT METHODS (no API yet)
// ============================================

const payoutMethods = [
  {
    id: '1',
    type: 'bank' as const,
    name: 'Chase Bank',
    last4: '4523',
    isDefault: true,
  },
  {
    id: '2',
    type: 'card' as const,
    name: 'Visa Debit',
    last4: '8891',
    isDefault: false,
  },
]

// ============================================
// LOADING SKELETON
// ============================================

function EarningsLoadingSkeleton() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header skeleton */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton variant="rectangular" className="h-10 w-28" />
          </div>

          {/* Stats Cards skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonStatCard className="bg-slate-900/50 border-emerald-500/10" />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Chart skeleton */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <Skeleton className="h-5 w-36 mb-4" />
          <Skeleton variant="rectangular" className="h-[200px] w-full" />
        </div>

        {/* Payout methods skeleton */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton variant="rectangular" className="h-12 w-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton variant="rectangular" className="h-12 w-12" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Transaction history skeleton */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <Skeleton className="h-5 w-40" />
            <Skeleton variant="rectangular" className="h-8 w-32" />
          </div>
          <div className="divide-y divide-white/5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton variant="rectangular" className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// ERROR STATE
// ============================================

function EarningsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center pb-24 lg:pb-8">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Failed to load earnings</h2>
        <p className="text-slate-400 mb-6">
          We could not retrieve your earnings data. Please check your connection and try again.
        </p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function WorkEarningsPage() {
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const fetchEarnings = useCallback(async () => {
    setIsLoading(true)
    setHasError(false)

    try {
      const response = await fetch('/api/earnings')

      if (!response.ok) {
        throw new Error(`Failed to fetch earnings: ${response.status}`)
      }

      const result: EarningsApiResponse = await response.json()

      if (!result.success) {
        throw new Error('Earnings API returned unsuccessful response')
      }

      setEarnings(result.data)
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEarnings()
  }, [fetchEarnings])

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)

    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (earnings && amount > earnings.availableBalance) {
      toast.error('Amount exceeds available balance')
      return
    }

    setIsWithdrawing(true)

    try {
      const response = await fetch('/api/payments/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      if (!response.ok) {
        const errorData: { error?: string } = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Withdrawal failed')
      }

      toast.success(`Withdrawal of $${amount.toLocaleString()} initiated successfully`)
      setShowWithdrawModal(false)
      setWithdrawAmount('')

      // Refresh earnings to reflect the new balance
      fetchEarnings()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Withdrawal failed. Please try again.'
      toast.error(message)
    } finally {
      setIsWithdrawing(false)
    }
  }

  // Show loading skeleton
  if (isLoading) {
    return <EarningsLoadingSkeleton />
  }

  // Show error state
  if (hasError || !earnings) {
    return <EarningsErrorState onRetry={fetchEarnings} />
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Earnings</h1>
              <p className="text-slate-400 mt-1">Track your income and payouts</p>
            </div>
            <button
              onClick={() => {
                setWithdrawAmount(earnings.availableBalance.toString())
                setShowWithdrawModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25"
            >
              <Download className="w-4 h-4" />
              Withdraw
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Available</span>
              </div>
              <div className="text-3xl font-bold text-white">
                ${earnings.availableBalance.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">Ready to withdraw</p>
            </div>

            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Withdrawn</span>
              </div>
              <div className="text-3xl font-bold text-white">
                ${earnings.totalWithdrawn.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">Total payouts</p>
            </div>

            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">This Month</span>
              </div>
              <div className="text-3xl font-bold text-white">
                ${earnings.thisMonthEarnings.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {earnings.monthlyChange >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                )}
                <span
                  className={cn(
                    'text-xs',
                    earnings.monthlyChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {Math.abs(earnings.monthlyChange)}% vs last month
                </span>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Total Earned</span>
              </div>
              <div className="text-3xl font-bold text-white">
                ${earnings.totalEarned.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">{earnings.completedJobs}</div>
                <div className="text-xs text-slate-400">Completed Jobs</div>
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {earnings.averageRating > 0 ? earnings.averageRating.toFixed(1) : 'N/A'}
                </div>
                <div className="text-xs text-slate-400">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Earnings Chart */}
        {earnings.dailyEarnings.length > 0 && (
          <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="font-semibold text-white">Earnings Over Time</h2>
            </div>
            <div className="p-5">
              <EarningsChart data={earnings.dailyEarnings} />
            </div>
          </div>
        )}

        {/* Payout Methods */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-white">Payout Methods</h2>
            <button className="text-sm text-emerald-400 hover:underline">+ Add New</button>
          </div>
          <div className="divide-y divide-white/5">
            {payoutMethods.map((method) => (
              <div key={method.id} className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                  {method.type === 'bank' ? (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  ) : (
                    <CreditCard className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{method.name}</span>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-slate-400">****{method.last4}</span>
                </div>
                <button className="text-sm text-slate-400 hover:text-white">Edit</button>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-white">Transaction History</h2>
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="all-time">All Time</option>
              </select>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {earnings.transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-400 text-sm">No transactions yet</p>
              <p className="text-slate-500 text-xs mt-1">
                Complete jobs to start earning
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {earnings.transactions.map((tx) => {
                const isEarning = tx.type === 'earning' || tx.amount > 0
                return (
                  <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        isEarning ? 'bg-emerald-500/20' : 'bg-slate-800'
                      )}
                    >
                      {isEarning ? (
                        <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{tx.description}</div>
                      <div className="text-sm text-slate-400">{tx.date}</div>
                    </div>

                    <div className="text-right">
                      <div
                        className={cn(
                          'font-semibold',
                          tx.amount > 0 ? 'text-emerald-400' : 'text-white'
                        )}
                      >
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                      </div>
                      <div
                        className={cn(
                          'text-xs capitalize',
                          tx.status === 'completed'
                            ? 'text-slate-500'
                            : tx.status === 'pending'
                            ? 'text-amber-400'
                            : 'text-blue-400'
                        )}
                      >
                        {tx.status}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {earnings.transactions.length > 0 && (
            <div className="p-4 border-t border-white/5 text-center">
              <button className="text-sm text-emerald-400 hover:underline">
                View All Transactions
              </button>
            </div>
          )}
        </div>

        {/* Tax Info */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Tax Documents</h3>
              <p className="text-sm text-slate-400 mb-3">
                If you earn more than $600 in a calendar year, you&apos;ll receive a 1099 form for tax
                purposes. Make sure your tax information is up to date.
              </p>
              <Link
                href="/work/settings#tax"
                className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:underline"
              >
                Update Tax Info
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!isWithdrawing) setShowWithdrawModal(false)
            }}
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Withdraw Funds</h2>

            <div className="p-4 bg-slate-800/50 rounded-xl mb-4">
              <div className="text-sm text-slate-400 mb-1">Available Balance</div>
              <div className="text-3xl font-bold text-emerald-400">
                ${earnings.availableBalance.toLocaleString()}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min={0}
                  max={earnings.availableBalance}
                  step={0.01}
                  disabled={isWithdrawing}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Payout To</label>
              <select
                disabled={isWithdrawing}
                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
              >
                {payoutMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name} (****{method.last4})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                disabled={isWithdrawing}
                className="flex-1 px-4 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isWithdrawing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Withdraw'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
