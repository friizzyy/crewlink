'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, Plus, Trash2, CheckCircle, AlertCircle } from 'lucide-react'

const mockPaymentMethods = [
  {
    id: '1',
    type: 'visa',
    last4: '4242',
    expiry: '12/26',
    isDefault: true,
  },
  {
    id: '2',
    type: 'mastercard',
    last4: '8888',
    expiry: '03/25',
    isDefault: false,
  },
]

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods)
  const [showAddCard, setShowAddCard] = useState(false)

  const setDefaultCard = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(pm => ({ ...pm, isDefault: pm.id === id }))
    )
  }

  const removeCard = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id))
  }

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return '💳 Visa'
      case 'mastercard':
        return '💳 Mastercard'
      case 'amex':
        return '💳 Amex'
      default:
        return '💳 Card'
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link
            href="/hiring/settings"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-white">Payment Methods</h1>
          <p className="text-slate-400 mt-1">Manage your cards and payment options</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Payment Methods List */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Your Cards</h2>
          </div>
          <div className="divide-y divide-white/5">
            {paymentMethods.map((method) => (
              <div key={method.id} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded bg-slate-800 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {getCardIcon(method.type)} •••• {method.last4}
                      </span>
                      {method.isDefault && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">Expires {method.expiry}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => setDefaultCard(method.id)}
                      className="px-3 py-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => removeCard(method.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Card Button */}
        {!showAddCard ? (
          <button
            onClick={() => setShowAddCard(true)}
            className="w-full p-5 border-2 border-dashed border-white/10 rounded-2xl text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add a new card
          </button>
        ) : (
          /* Add Card Form */
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Add a new card</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Card number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Expiry date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Name on card
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="flex-1 py-3 border border-white/10 text-white font-medium rounded-xl hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all"
                >
                  Add card
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Notice */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-emerald-300 font-medium">Your payment info is secure</p>
            <p className="text-xs text-slate-400 mt-1">
              We use industry-standard encryption and never store your full card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
