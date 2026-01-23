'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Filter, Search, Calendar, Download } from 'lucide-react'

const mockTransactions = [
  {
    id: '1',
    type: 'earning',
    description: 'House Cleaning - Sarah M.',
    amount: 85.00,
    date: '2024-01-20',
    status: 'completed',
  },
  {
    id: '2',
    type: 'payout',
    description: 'Bank Transfer to Chase ****6789',
    amount: -250.00,
    date: '2024-01-19',
    status: 'completed',
  },
  {
    id: '3',
    type: 'earning',
    description: 'Furniture Assembly - Mike T.',
    amount: 120.00,
    date: '2024-01-18',
    status: 'completed',
  },
  {
    id: '4',
    type: 'earning',
    description: 'Moving Help - Lisa K.',
    amount: 200.00,
    date: '2024-01-17',
    status: 'completed',
  },
  {
    id: '5',
    type: 'refund',
    description: 'Refund - Cancelled Job',
    amount: -45.00,
    date: '2024-01-15',
    status: 'completed',
  },
  {
    id: '6',
    type: 'earning',
    description: 'Yard Work - Tom B.',
    amount: 150.00,
    date: '2024-01-14',
    status: 'pending',
  },
]

export default function TransactionsPage() {
  const [filter, setFilter] = useState<'all' | 'earnings' | 'payouts'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTransactions = mockTransactions.filter(t => {
    if (filter === 'earnings' && t.type !== 'earning') return false
    if (filter === 'payouts' && t.type !== 'payout') return false
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
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
        return null
    }
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
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900 border border-white/5 rounded-xl">
            <p className="text-sm text-slate-400 mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-white">$1,847.50</p>
          </div>
          <div className="p-4 bg-slate-900 border border-white/5 rounded-xl">
            <p className="text-sm text-slate-400 mb-1">Withdrawn</p>
            <p className="text-2xl font-bold text-white">$1,000.00</p>
          </div>
          <div className="p-4 bg-slate-900 border border-white/5 rounded-xl">
            <p className="text-sm text-slate-400 mb-1">Available</p>
            <p className="text-2xl font-bold text-emerald-400">$847.50</p>
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
                      <p className="font-medium text-white">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-500">{formatDate(transaction.date)}</span>
                        {transaction.status === 'pending' && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`text-lg font-semibold ${
                    transaction.amount > 0 ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
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
        {filteredTransactions.length > 0 && (
          <button className="w-full py-3 text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
            Load more transactions
          </button>
        )}
      </div>
    </div>
  )
}
