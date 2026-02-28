'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Check,
  Briefcase,
  Users,
  ArrowRight,
  ChevronDown,
  Shield,
  Zap,
  BadgeCheck,
  MessageCircle,
  Receipt
} from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import { GlassPanel, GlassCard, FeatureCard, Button, Badge } from '@/components/ui'

// ============================================
// PRICING PAGE - Premium Redesign
// Matches site design DNA: glassmorphism, scroll reveals,
// color-coded audiences, confident negative space
// ============================================

// Pricing tiers for Hirers
const hirerTiers = [
  {
    name: 'Standard',
    description: 'For occasional jobs',
    fee: '10%',
    feeLabel: 'per job',
    highlighted: false,
    features: [
      'Post unlimited jobs',
      'Browse verified workers',
      'In-app messaging',
      'Payment protection',
      'Standard support',
    ],
    cta: 'Start posting',
    href: '/create-account?mode=hire',
  },
  {
    name: 'Business',
    description: 'For teams with volume',
    fee: '8%',
    feeLabel: 'per job',
    highlighted: true,
    badge: 'Popular',
    features: [
      'Everything in Standard',
      'Reduced service fee',
      'Priority matching',
      'Dedicated account support',
      'Bulk job posting',
      'Analytics dashboard',
    ],
    cta: 'Contact sales',
    href: '/contact?subject=business',
  },
]

// Pricing tiers for Workers
const workerTiers = [
  {
    name: 'Free',
    description: 'Get started immediately',
    fee: '15%',
    feeLabel: 'from earnings',
    highlighted: false,
    features: [
      'Create your profile',
      'Bid on unlimited jobs',
      'Direct messaging',
      'Fast payouts (1-3 days)',
      'Keep 85% of earnings',
    ],
    cta: 'Create profile',
    href: '/create-account?mode=work',
  },
  {
    name: 'Pro',
    description: 'Stand out and earn more',
    fee: '12%',
    feeLabel: 'from earnings',
    highlighted: true,
    badge: 'Best value',
    features: [
      'Everything in Free',
      'Lower service fee',
      'Priority in search results',
      'Verified badge',
      'Background check included',
      'Same-day payouts',
    ],
    cta: 'Go Pro',
    href: '/create-account?mode=work&tier=pro',
  },
]

// Value propositions
const valueProps = [
  {
    icon: Shield,
    title: 'Payment protection',
    description: 'Funds held securely until work is complete and both parties are satisfied.',
    gradient: 'cyan' as const,
  },
  {
    icon: BadgeCheck,
    title: 'Verified workers',
    description: 'Background checks and identity verification give you confidence in who you hire.',
    gradient: 'purple' as const,
  },
  {
    icon: Zap,
    title: 'Fast payouts',
    description: 'Workers receive payment within 1-3 business days. Pro members get same-day.',
    gradient: 'emerald' as const,
  },
  {
    icon: MessageCircle,
    title: 'Real support',
    description: 'Dispute resolution and customer support from actual humans, not chatbots.',
    gradient: 'amber' as const,
  },
]

// FAQ data
const faqs = [
  {
    question: 'When do I pay as a hirer?',
    answer: 'You pay when you book a worker and the job is completed. The service fee is calculated on the job total and shown before you confirm. No upfront costs, no subscription.',
  },
  {
    question: 'How fast do workers get paid?',
    answer: 'Standard payouts arrive in 1-3 business days after job completion. Pro workers can access same-day payouts to their linked bank account.',
  },
  {
    question: 'What does the fee cover?',
    answer: 'Payment processing, platform operations, customer support, dispute resolution, and insurance protection. We only make money when you do.',
  },
  {
    question: 'Can I negotiate with workers?',
    answer: 'Yes. Workers set their own rates but you can discuss pricing through messaging. The service fee percentage stays the same regardless of the negotiated price.',
  },
  {
    question: 'What if there\'s a problem?',
    answer: 'Contact us through the app. We review every dispute and can issue partial or full refunds when appropriate. Our goal is a fair outcome for everyone.',
  },
]

// ============================================
// COMPONENTS
// ============================================

function AudienceToggle({
  mode,
  setMode,
}: {
  mode: 'hire' | 'work'
  setMode: (mode: 'hire' | 'work') => void
}) {
  return (
    <GlassPanel variant="elevated" padding="none" border="glow" rounded="2xl" className="inline-flex items-center p-1.5" role="tablist" aria-label="Select pricing view">
      <button
        role="tab"
        aria-selected={mode === 'hire'}
        aria-controls="hire-panel"
        id="hire-tab"
        onClick={() => setMode('hire')}
        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
          mode === 'hire'
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Briefcase className="w-4 h-4" />
        <span>Hiring help</span>
      </button>
      <button
        role="tab"
        aria-selected={mode === 'work'}
        aria-controls="work-panel"
        id="work-tab"
        onClick={() => setMode('work')}
        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
          mode === 'work'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>Finding work</span>
      </button>
    </GlassPanel>
  )
}

function TierCard({
  tier,
  mode,
  index,
  isVisible,
}: {
  tier: (typeof hirerTiers)[0]
  mode: 'hire' | 'work'
  index: number
  isVisible: boolean
}) {
  const isHire = mode === 'hire'

  // Feature check classes
  const checkBgClass = isHire ? 'bg-cyan-500/20' : 'bg-emerald-500/20'
  const checkIconClass = isHire ? 'text-cyan-400' : 'text-emerald-400'

  return (
    <GlassCard
      interactive={false}
      padding="none"
      border={tier.highlighted ? 'glow' : 'light'}
      rounded="2xl"
      className={`relative p-8 lg:p-10 flex flex-col h-full ${
        tier.highlighted
          ? isHire
            ? 'border-cyan-500/40 hover:border-cyan-500/60'
            : 'border-emerald-500/40 hover:border-emerald-500/60'
          : 'hover:border-white/20'
      } ${getRevealClasses(isVisible, 'up')}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Glow effect for highlighted */}
      {tier.highlighted && (
        <div className="absolute inset-0 pointer-events-none rounded-3xl">
          <div className={`absolute top-0 right-0 w-48 h-48 ${isHire ? 'bg-cyan-500/15' : 'bg-emerald-500/15'} rounded-full blur-[80px]`} />
          <div className={`absolute bottom-0 left-0 w-32 h-32 ${isHire ? 'bg-cyan-500/10' : 'bg-emerald-500/10'} rounded-full blur-[60px]`} />
        </div>
      )}

      {/* Badge */}
      {tier.badge && (
        <div className="absolute -top-3 left-8">
          <Badge variant={isHire ? 'brand' : 'success'} size="sm">
            {tier.badge}
          </Badge>
        </div>
      )}

      <div className="relative flex flex-col flex-1">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white">{tier.name}</h3>
          <p className="text-sm text-slate-500 mt-1">{tier.description}</p>
        </div>

        {/* Price */}
        <div className="py-6 border-y border-white/5">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-6xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent tracking-tight">
              {tier.fee}
            </span>
            <span className="text-lg text-slate-400">{tier.feeLabel}</span>
          </div>
        </div>

        {/* Features - grows to fill available space */}
        <ul className="py-8 space-y-4 flex-1">
          {tier.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tier.highlighted ? checkBgClass : 'bg-white/10'
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 ${tier.highlighted ? checkIconClass : 'text-slate-400'}`}
                />
              </div>
              <span className="text-slate-300">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA - always at bottom */}
        <Link href={tier.href} className="mt-auto">
          <Button
            variant={tier.highlighted ? (isHire ? 'primary' : 'success') : 'secondary'}
            size="lg"
            fullWidth
            glow={tier.highlighted}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            {tier.cta}
          </Button>
        </Link>
      </div>
    </GlassCard>
  )
}

function Accordion({ items }: { items: typeof faqs }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-3" role="region" aria-label="Frequently asked questions">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        const headingId = `faq-heading-${i}`
        const panelId = `faq-panel-${i}`

        return (
          <GlassPanel
            key={i}
            variant="subtle"
            padding="none"
            border="light"
            rounded="xl"
            className="overflow-hidden"
          >
            <button
              id={headingId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500"
            >
              <span className="font-medium text-white pr-4">{item.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              className={`overflow-hidden transition-all duration-300 ease-out ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-5 pb-5 text-slate-400 leading-relaxed">{item.answer}</div>
            </div>
          </GlassPanel>
        )
      })}
    </div>
  )
}

// ============================================
// SECTIONS
// ============================================

function HeroSection({ mode, setMode }: { mode: 'hire' | 'work'; setMode: (m: 'hire' | 'work') => void }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="pt-28 pb-8 sm:pt-36 sm:pb-12 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative">
        <h1
          className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] ${getRevealClasses(isVisible, 'up')}`}
        >
          <span className="text-white">Simple pricing. </span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Real value.
          </span>
        </h1>

        <p
          className={`mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed ${getRevealClasses(isVisible, 'up')}`}
          style={{ transitionDelay: '80ms' }}
        >
          No subscriptions. No hidden fees. You only pay when work gets done.
        </p>

        {/* Audience Toggle */}
        <div
          className={`mt-10 flex justify-center ${getRevealClasses(isVisible, 'up')}`}
          style={{ transitionDelay: '160ms' }}
        >
          <AudienceToggle mode={mode} setMode={setMode} />
        </div>
      </div>
    </section>
  )
}

function PricingSection({ mode }: { mode: 'hire' | 'work' }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const tiers = mode === 'hire' ? hirerTiers : workerTiers

  return (
    <section
      ref={ref}
      id={`${mode}-panel`}
      role="tabpanel"
      aria-labelledby={`${mode}-tab`}
      className="py-8 sm:py-12"
    >
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {tiers.map((tier, i) => (
            <TierCard key={tier.name} tier={tier} mode={mode} index={i} isVisible={isVisible} />
          ))}
        </div>

        {/* Subtle note */}
        <p
          className={`mt-8 text-center text-sm text-slate-500 ${getRevealClasses(isVisible, 'up')}`}
          style={{ transitionDelay: '200ms' }}
        >
          {mode === 'hire'
            ? 'Need more than 10 jobs per month? Contact us for custom pricing.'
            : 'Upgrade to Pro anytime from your dashboard. Cancel anytime.'}
        </p>
      </div>
    </section>
  )
}

function TransparencySection({ mode }: { mode: 'hire' | 'work' }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  const hirerExample = {
    jobRate: 150,
    serviceFee: 15,
    total: 165,
  }

  const workerExample = {
    earnings: 150,
    serviceFee: 22.5,
    payout: 127.5,
  }

  return (
    <section ref={ref} className="py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-8 sm:mb-12">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-900/60 rounded-full border border-white/10 mb-4 sm:mb-6 ${getRevealClasses(isVisible, 'up')}`}
          >
            <Receipt className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-400">Full transparency</span>
          </div>

          <h2
            className={`font-display text-2xl sm:text-3xl font-bold tracking-tight ${getRevealClasses(isVisible, 'up')}`}
            style={{ transitionDelay: '80ms' }}
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              See exactly what you{mode === 'hire' ? ' pay' : "'ll earn"}
            </span>
          </h2>
        </div>

        {/* Example breakdown */}
        <GlassPanel
          variant="elevated"
          padding="xl"
          border="light"
          rounded="2xl"
          className={getRevealClasses(isVisible, 'up')}
          style={{ transitionDelay: '160ms' }}
        >
          {mode === 'hire' ? (
            <div className="max-w-sm mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Example: $150 job</h4>
                  <p className="text-sm text-slate-500">Standard tier (10% fee)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-slate-400">Job total</span>
                  <span className="text-white font-medium">${hirerExample.jobRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-slate-400">Service fee (10%)</span>
                  <span className="text-white font-medium">${hirerExample.serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-white">You pay</span>
                  <span className="font-display text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    ${hirerExample.total}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-sm mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Example: $150 job</h4>
                  <p className="text-sm text-slate-500">Free tier (15% fee)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-slate-400">Job earnings</span>
                  <span className="text-white font-medium">${workerExample.earnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-slate-400">Service fee (15%)</span>
                  <span className="text-white font-medium">
                    -${workerExample.serviceFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-white">You receive</span>
                  <span className="font-display text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    ${workerExample.payout.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </GlassPanel>

        {/* Link to help */}
        <p
          className={`mt-6 text-center text-sm text-slate-500 ${getRevealClasses(isVisible, 'up')}`}
          style={{ transitionDelay: '240ms' }}
        >
          Questions about fees?{' '}
          <Link href="/help" className="text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline">
            Visit our help center
          </Link>
        </p>
      </div>
    </section>
  )
}

function ValueSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-10 sm:py-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-8 sm:mb-14">
          <h2
            className={`font-display text-2xl sm:text-3xl font-bold tracking-tight ${getRevealClasses(isVisible, 'up')}`}
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              What you get for the fee
            </span>
          </h2>
          <p
            className={`mt-3 text-slate-400 ${getRevealClasses(isVisible, 'up')}`}
            style={{ transitionDelay: '80ms' }}
          >
            More than a marketplace. A complete platform.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((prop, i) => (
            <FeatureCard
              key={prop.title}
              gradient={prop.gradient}
              shine
              className={getRevealClasses(isVisible, 'up')}
              style={{ transitionDelay: `${160 + i * 60}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <prop.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{prop.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{prop.description}</p>
            </FeatureCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-10 sm:py-16 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2
            className={`font-display text-2xl sm:text-3xl font-bold tracking-tight ${getRevealClasses(isVisible, 'up')}`}
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Common questions
            </span>
          </h2>
        </div>

        <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '80ms' }}>
          <Accordion items={faqs} />
        </div>

        <p
          className={`mt-8 text-center text-sm text-slate-500 ${getRevealClasses(isVisible, 'up')}`}
          style={{ transitionDelay: '160ms' }}
        >
          Still have questions?{' '}
          <Link
            href="/help"
            className="text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline"
          >
            Check our help center
          </Link>{' '}
          or{' '}
          <Link
            href="/contact"
            className="text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline"
          >
            contact us
          </Link>
          .
        </p>
      </div>
    </section>
  )
}

function CTASection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <GlassPanel
          variant="elevated"
          padding="none"
          border="glow"
          rounded="2xl"
          className={`relative overflow-hidden p-8 sm:p-12 text-center ${getRevealClasses(isVisible, 'scale')}`}
        >
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Ready to get started?
              </span>
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Create a free account in under a minute. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create-account">
                <Button variant="primary" size="lg" glow rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Create free account
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="secondary" size="lg">
                  See how it works
                </Button>
              </Link>
            </div>
          </div>
        </GlassPanel>
      </div>
    </section>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function PricingPage() {
  const [mode, setMode] = useState<'hire' | 'work'>('hire')
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Handle mode change with smooth transition
  const handleModeChange = useCallback((newMode: 'hire' | 'work') => {
    if (newMode === mode) return

    setIsTransitioning(true)
    setTimeout(() => {
      setMode(newMode)
      setIsTransitioning(false)
    }, 150)
  }, [mode])

  return (
    <MarketingLayout>
      <HeroSection mode={mode} setMode={handleModeChange} />

      {/* Animated transition wrapper */}
      <div
        className={`transition-all duration-300 ease-out ${
          isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        <PricingSection mode={mode} />
        <TransparencySection mode={mode} />
      </div>

      <ValueSection />
      <FAQSection />
      <CTASection />

      {/* Reduced motion styles */}
      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </MarketingLayout>
  )
}
