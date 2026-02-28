'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CreditCard, CheckCircle, ExternalLink, Loader2, AlertCircle, Shield } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Card'
import { GlassPanel, FeatureCard } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'
import { AmbientBackground } from '@/components/AmbientBackground'

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
          <Link href="/sign-in">
            <Button variant="primary" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 pb-24 lg:pb-8 relative">
      <AmbientBackground intensity="low" />

      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50 backdrop-blur-sm relative z-10">
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

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Stripe Payment Management Card */}
        <FeatureCard gradient="cyan" shine>
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
            {[
              'PCI-compliant card storage',
              'Support for Visa, Mastercard, Amex, and more',
              'Automatic payment for accepted bids',
            ].map((feature) => (
              <GlassPanel
                key={feature}
                variant="subtle"
                padding="sm"
                border="none"
                rounded="lg"
                className="flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-300">{feature}</span>
              </GlassPanel>
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleManagePayments}
            isLoading={isRedirecting}
            leftIcon={!isRedirecting ? <ExternalLink className="w-5 h-5" /> : undefined}
            glow
          >
            {isRedirecting ? 'Connecting to Stripe...' : 'Manage Payment Methods'}
          </Button>
        </FeatureCard>

        {/* Security Notice */}
        <GlassPanel
          variant="default"
          padding="md"
          border="none"
          rounded="xl"
          className="border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-emerald-300 font-medium">Your payment info is secure</p>
              <p className="text-xs text-slate-400 mt-1">
                We never store your full card details. All payment processing is handled securely by Stripe
                using industry-standard encryption.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
