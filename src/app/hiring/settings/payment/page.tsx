'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, CheckCircle, ExternalLink, Loader2, AlertCircle, Shield } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Card'

export default function PaymentMethodsPage() {
  const { data: session, status } = useSession()
  const toast = useToast()
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleManagePayments = () => {
    setIsRedirecting(true)
    // Stripe Customer Portal integration placeholder
    setTimeout(() => {
      setIsRedirecting(false)
      toast.info('Stripe Customer Portal integration coming soon')
    }, 500)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-950 pb-24 lg:pb-8">
        <div className="border-b border-white/5 bg-slate-900/50">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <Skeleton variant="text" width={140} height={16} className="mb-4" />
            <Skeleton variant="text" width={220} height={28} className="mb-2" />
            <Skeleton variant="text" width={280} height={16} />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <Skeleton variant="rectangular" width="100%" height={240} />
          <Skeleton variant="rectangular" width="100%" height={80} />
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-950 pb-24 lg:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-slate-400 mb-6">Please sign in to manage payment methods.</p>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
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
        {/* Stripe Payment Management Card */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Payment via Stripe</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Your payment methods are securely managed through Stripe. Add, remove, or update your
                  cards directly through the Stripe Customer Portal.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-300">PCI-compliant card storage</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-300">Support for Visa, Mastercard, Amex, and more</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-300">Automatic payment for accepted bids</span>
              </div>
            </div>

            <button
              onClick={handleManagePayments}
              disabled={isRedirecting}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting to Stripe...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Manage Payment Methods
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-emerald-300 font-medium">Your payment info is secure</p>
            <p className="text-xs text-slate-400 mt-1">
              We never store your full card details. All payment processing is handled securely by Stripe
              using industry-standard encryption.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
