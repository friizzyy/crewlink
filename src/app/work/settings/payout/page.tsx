'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building, Plus, Trash2, CheckCircle, DollarSign, Clock, AlertCircle } from 'lucide-react'

const mockPayoutMethods = [
  {
    id: '1',
    type: 'bank',
    bankName: 'Chase Bank',
    last4: '6789',
    isDefault: true,
  },
]

export default function PayoutSettingsPage() {
  const [payoutMethods, setPayoutMethods] = useState(mockPayoutMethods)
  const [showAddBank, setShowAddBank] = useState(false)
  const [instantPayout, setInstantPayout] = useState(false)

  const removeBank = (id: string) => {
    setPayoutMethods(prev => prev.filter(pm => pm.id !== id))
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            href="/work/settings"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-white">Payout Settings</h1>
          <p className="text-slate-400 mt-1">Manage how you receive your earnings</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Earnings Summary */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Available Balance</h2>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">
              Ready to withdraw
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">$847.50</span>
            <span className="text-slate-400">USD</span>
          </div>
          <button className="mt-4 w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
            <DollarSign className="w-5 h-5" />
            Withdraw funds
          </button>
        </div>

        {/* Payout Schedule */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Payout Schedule</h2>
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <span className="font-medium text-white">Automatic payouts</span>
                  <p className="text-sm text-slate-500">Every Monday for the previous week&apos;s earnings</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <span className="font-medium text-white">Instant payouts</span>
                <p className="text-sm text-slate-500">Get your money within minutes (1.5% fee)</p>
              </div>
              <button
                onClick={() => setInstantPayout(!instantPayout)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  instantPayout ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    instantPayout ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Bank Accounts</h2>
          </div>
          <div className="divide-y divide-white/5">
            {payoutMethods.length > 0 ? (
              payoutMethods.map((method) => (
                <div key={method.id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                      <Building className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{method.bankName}</span>
                        {method.isDefault && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-slate-500">Account ending in {method.last4}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeBank(method.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Building className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No bank accounts added yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Bank Button */}
        {!showAddBank ? (
          <button
            onClick={() => setShowAddBank(true)}
            className="w-full p-5 border-2 border-dashed border-white/10 rounded-2xl text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add bank account
          </button>
        ) : (
          /* Add Bank Form */
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add bank account</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Account holder name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Routing number
                </label>
                <input
                  type="text"
                  placeholder="123456789"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Account number
                </label>
                <input
                  type="text"
                  placeholder="0000000000"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Account type
                </label>
                <select className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all">
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBank(false)}
                  className="flex-1 py-3 border border-white/10 text-white font-medium rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all"
                >
                  Add account
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tax Info Notice */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-300 font-medium">Tax information required</p>
            <p className="text-xs text-slate-400 mt-1">
              You&apos;ll need to provide tax information (W-9) before your first payout if you earn over $600.
            </p>
            <button className="mt-2 text-sm text-amber-400 font-medium hover:text-amber-300">
              Add tax info →
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-emerald-300 font-medium">Bank-level security</p>
            <p className="text-xs text-slate-400 mt-1">
              Your banking information is encrypted and stored securely. We use the same security standards as major banks.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
