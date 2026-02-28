'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  ArrowLeft, ArrowUpRight, ArrowDownLeft, Search, Download,
  AlertCircle, Loader2, RefreshCw
} from 'lucide-react'
import { formatRelativeTime, formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Card'

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  description: string | null
  createdAt: string
  processedAt: string | null
  booking: {
    id: string
    job: {
      id: string
      title: string
      category: string
    }
    hirer: {
      id: string
      name: string | null
    }
    worker: {
      id: string
      name: string | null
    }
  } | null
}

interface TransactionSummary {
  totalEarnings: number
  totalWithdrawn: number
  available: number
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-slate-900 border border-white/5 rounded-xl">
            <Skeleton variant="text" width="60%" height={14} className="mb-2" />
            <Skeleton variant="text" width="80%" height={28} />
          </div>
        ))}
      </div>
      {/* List skeleton */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton variant="rectangular" width={40} height={40} className="!rounded-xl" />
              <div className="space-y-2">
                <Skeleton variant="text" width={180} height={16} />
                <Skeleton variant="text" width={120} height={12} />
              </div>
            </div>
            <Skeleton variant="text" width={60} height={20} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TransactionsPage() {
  const { data: session } = useSession()
  const toast = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<TransactionSummary>({
    totalEarnings: 0,
    totalWithdrawn: 0,
    available: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'earnings' | 'payouts'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchTransactions = useCallback(async (append = false) => {
    try {
      if (!append) {
        setLoading(true)
        setOffset(0)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      const currentOffset = append ? offset : 0
      const typeParam = filter === 'earnings' ? '&type=earning' : filter === 'payouts' ? '&type=payout' : ''
      const res = await fetch(`/api/transactions?limit=20&offset=${currentOffset}${typeParam}`)
      if (!res.ok) throw new Error('Failed to load transactions')
      const json = await res.json()

      if (append) {
        setTransactions((prev) => [...prev, ...(json.data || [])])
      } else {
        setTransactions(json.data || [])
      }

      if (json.summary) {
        setSummary(json.summary)
      }

      setHasMore(json.pagination?.hasMore || false)
      setOffset(currentOffset + (json.data?.length || 0))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filter, offset])

  useEffect(() => {
    fetchTransactions(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const filteredTransactions = transactions.filter((t) => {
    if (searchQuery) {
      const desc = t.description || t.booking?.job?.title || ''
      if (!desc.toLowerCase().includes(searchQuery.toLowerCase())) return false
    }
    return true
  })

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
      case 'payout':
        return <ArrowUpRight className="w-5 h-5 text-cyan-400" />
      case 'refund':
        return <ArrowUpRight className="w-5 h-5 text-amber-400" />
      default:
        return <ArrowDownLeft className="w-5 h-5 text-slate-400" />
    }
  }

  const getTransactionDescription = (t: Transaction): string => {
    if (t.description) return t.description
    if (t.booking?.job?.title) {
      const otherParty = t.booking.hirer?.name || 'Unknown'
      return `${t.booking.job.title} - ${otherParty}`
    }
    return t.type.charAt(0).toUpperCase() + t.type.slice(1)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/work/settings"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Transactions</h1>
              <p className="text-slate-400 mt-1">View your earnings and payment history</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <TransactionsSkeleton />
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Failed to load transactions</h2>
            <p className="text-slate-400 max-w-sm mx-auto mb-6">{error}</p>
            <button
              onClick={() => fetchTransactions(false)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 border border-white/5 rounded-xl">
                <p className="text-sm text-slate-400 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalEarnings)}</p>
              </div>
              <div className="p-4 bg-slate-900 border border-white/5 rounded-xl">
                <p className="text-sm text-slate-400 mb-1">Withdrawn</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalWithdrawn)}</p>
              </div>
              <div className="p-4 bg-slate-900 border border-white/5 rounded-xl">
                <p className="text-sm text-slate-400 mb-1">Available</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(summary.available)}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'earnings', 'payouts'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-3 rounded-xl font-medium transition-all ${
                      filter === f
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/5">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          transaction.type === 'earning' ? 'bg-emerald-500/20' :
                          transaction.type === 'payout' ? 'bg-cyan-500/20' :
                          'bg-amber-500/20'
                        }`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{getTransactionDescription(transaction)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-slate-500">{formatDate(transaction.createdAt)}</span>
                            {transaction.status === 'pending' && (
                              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`text-lg font-semibold ${
                        transaction.type === 'earning' ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {transaction.type === 'earning' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-slate-400">No transactions found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Load More */}
            {hasMore && (
              <button
                onClick={() => fetchTransactions(true)}
                disabled={loadingMore}
                className="w-full py-3 text-emerald-400 font-medium hover:text-emerald-300 transition-colors flex items-center justify-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load more transactions'
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
