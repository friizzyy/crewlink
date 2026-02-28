'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, AlertCircle, ExternalLink, Loader2, Shield, Zap } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Card'
import { GlassPanel, FeatureCard } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'
import { AmbientBackground } from '@/components/AmbientBackground'

type ConnectStatus = 'not_connected' | 'pending' | 'connected'

export default function PayoutSettingsPage() {
  const { data: session, status } = useSession()
  const toast = useToast()
  const [isConnecting, setIsConnecting] = useState(false)
  // Since there's no Stripe Connect integration yet, default to not_connected
  const [connectStatus] = useState<ConnectStatus>('not_connected')

  const handleConnectStripe = async () => {
    setIsConnecting(true)
    // Stripe Connect onboarding placeholder
    setTimeout(() => {
      setIsConnecting(false)
      toast.info('Stripe Connect onboarding coming soon')
    }, 500)
  }

  const handleManageAccount = () => {
    toast.info('Stripe Connect dashboard coming soon')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-950 pb-24 lg:pb-8">
        <div className="border-b border-white/5 bg-slate-900/50">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <Skeleton variant="text" width={140} height={16} className="mb-4" />
            <Skeleton variant="text" width={200} height={28} className="mb-2" />
            <Skeleton variant="text" width={300} height={16} />
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          <Skeleton variant="rectangular" width="100%" height={200} />
          <Skeleton variant="rectangular" width="100%" height={160} />
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
          <p className="text-slate-400 mb-6">Please sign in to manage payout settings.</p>
          <Link href="/sign-in">
            <Button variant="success" size="lg">
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

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Stripe Connect Status Card */}
        <FeatureCard gradient="emerald" shine>
          {connectStatus === 'connected' ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Stripe Connected</h2>
                  <p className="text-sm text-emerald-400">Your payout account is active</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Your Stripe Connect account is set up and ready to receive payouts. You can manage your
                banking details and payout preferences through Stripe.
              </p>
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleManageAccount}
                leftIcon={<ExternalLink className="w-5 h-5" />}
              >
                Manage Stripe Account
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">Set Up Payouts with Stripe</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Connect your bank account through Stripe to receive earnings from completed jobs.
                    Stripe handles all payment processing securely.
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  'Direct deposit to your bank account',
                  'Automatic weekly payouts',
                  'Instant payout option available (1.5% fee)',
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
                variant="success"
                size="lg"
                fullWidth
                onClick={handleConnectStripe}
                isLoading={isConnecting}
                leftIcon={!isConnecting ? <ExternalLink className="w-5 h-5" /> : undefined}
                glow
              >
                {isConnecting ? 'Connecting to Stripe...' : 'Connect with Stripe'}
              </Button>
            </>
          )}
        </FeatureCard>

        {/* Tax Info Notice */}
        <GlassPanel
          variant="default"
          padding="md"
          border="none"
          rounded="xl"
          className="border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)]"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-300 font-medium">Tax information required</p>
              <p className="text-xs text-slate-400 mt-1">
                You&apos;ll need to provide tax information (W-9) before your first payout if you earn over $600.
                This will be collected during Stripe Connect onboarding.
              </p>
            </div>
          </div>
        </GlassPanel>

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
              <p className="text-sm text-emerald-300 font-medium">Bank-level security</p>
              <p className="text-xs text-slate-400 mt-1">
                Your banking information is encrypted and stored securely by Stripe. CrewLink never has
                direct access to your bank account details.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
