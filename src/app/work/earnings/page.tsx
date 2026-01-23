'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DollarSign, TrendingUp, Download, Calendar, ChevronRight,
  CreditCard, Building2, ArrowUpRight, ArrowDownRight,
  Clock, CheckCircle2, AlertCircle, Filter, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock earnings data
const mockEarnings = {
  available: 1245.50,
  pending: 350.00,
  totalEarned: 8450.00,
  thisMonth: 1595.50,
  lastMonth: 2100.00,
  monthlyChange: -24,
}

const mockTransactions = [
  {
    id: '1',
    type: 'earning',
    title: 'Deep House Cleaning',
    hirer: 'Alex J.',
    amount: 175,
    status: 'completed',
    date: 'Today, 4:30 PM',
  },
  {
    id: '2',
    type: 'withdrawal',
    title: 'Bank Transfer to ****4523',
    hirer: null,
    amount: -500,
    status: 'processing',
    date: 'Today, 12:00 PM',
  },
  {
    id: '3',
    type: 'earning',
    title: 'IKEA Furniture Assembly',
    hirer: 'Jordan K.',
    amount: 95,
    status: 'completed',
    date: 'Yesterday, 2:15 PM',
  },
  {
    id: '4',
    type: 'earning',
    title: 'Help Moving Furniture',
    hirer: 'Sam W.',
    amount: 225,
    status: 'completed',
    date: 'Jan 18, 2024',
  },
  {
    id: '5',
    type: 'earning',
    title: 'Yard Work & Landscaping',
    hirer: 'Chris M.',
    amount: 150,
    status: 'pending',
    date: 'Jan 17, 2024',
  },
  {
    id: '6',
    type: 'withdrawal',
    title: 'Bank Transfer to ****4523',
    hirer: null,
    amount: -1000,
    status: 'completed',
    date: 'Jan 15, 2024',
  },
]

const mockPayoutMethods = [
  {
    id: '1',
    type: 'bank',
    name: 'Chase Bank',
    last4: '4523',
    isDefault: true,
  },
  {
    id: '2',
    type: 'card',
    name: 'Visa Debit',
    last4: '8891',
    isDefault: false,
  },
]

export default function WorkEarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('this-month')
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

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
              onClick={() => setShowWithdrawModal(true)}
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
                ${mockEarnings.available.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">Ready to withdraw</p>
            </div>

            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <div className="text-3xl font-bold text-white">
                ${mockEarnings.pending.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">Being processed</p>
            </div>

            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">This Month</span>
              </div>
              <div className="text-3xl font-bold text-white">
                ${mockEarnings.thisMonth.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {mockEarnings.monthlyChange >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                )}
                <span
                  className={cn(
                    'text-xs',
                    mockEarnings.monthlyChange >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {Math.abs(mockEarnings.monthlyChange)}% vs last month
                </span>
              </div>
            </div>

            <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Total Earned</span>
              </div>
              <div className="text-3xl font-bold text-white">
                ${mockEarnings.totalEarned.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Payout Methods */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-white">Payout Methods</h2>
            <button className="text-sm text-emerald-400 hover:underline">+ Add New</button>
          </div>
          <div className="divide-y divide-white/5">
            {mockPayoutMethods.map((method) => (
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

          <div className="divide-y divide-white/5">
            {mockTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    tx.type === 'earning' ? 'bg-emerald-500/20' : 'bg-slate-800'
                  )}
                >
                  {tx.type === 'earning' ? (
                    <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{tx.title}</div>
                  <div className="text-sm text-slate-400">
                    {tx.hirer ? `From ${tx.hirer}` : tx.date}
                  </div>
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
                      'text-xs',
                      tx.status === 'completed'
                        ? 'text-slate-500'
                        : tx.status === 'pending'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                    )}
                  >
                    {tx.status === 'completed'
                      ? 'Completed'
                      : tx.status === 'pending'
                      ? 'Pending'
                      : 'Processing'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5 text-center">
            <button className="text-sm text-emerald-400 hover:underline">
              View All Transactions
            </button>
          </div>
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
            onClick={() => setShowWithdrawModal(false)}
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Withdraw Funds</h2>

            <div className="p-4 bg-slate-800/50 rounded-xl mb-4">
              <div className="text-sm text-slate-400 mb-1">Available Balance</div>
              <div className="text-3xl font-bold text-emerald-400">
                ${mockEarnings.available.toLocaleString()}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="number"
                  placeholder="0.00"
                  defaultValue={mockEarnings.available}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Payout To</label>
              <select className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                {mockPayoutMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name} (****{method.last4})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Withdrawal initiated!')
                  setShowWithdrawModal(false)
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
