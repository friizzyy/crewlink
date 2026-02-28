'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Briefcase, Users, Sparkles, Camera, MapPin, MessageCircle, CreditCard, Star, Clock, Shield } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { GlassPanel, GlassCard, FeatureCard, Button, Badge } from '@/components/ui'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// Compact step data
const hireSteps = [
  {
    number: '1',
    title: 'Post your job',
    bullets: [
      'Describe what you need in plain language',
      'AI cleans up and structures your scope',
      'Add photos and pin your location',
    ],
    chips: ['AI Scope', 'Photo Upload', 'Location Pin'],
    icon: Camera,
    gradient: 'cyan' as const,
  },
  {
    number: '2',
    title: 'Get matched instantly',
    bullets: [
      'See qualified workers on the map',
      'Compare ratings, reviews, and prices',
      'Workers are background-checked',
    ],
    chips: ['Map View', 'Background Checks', 'Reviews'],
    icon: MapPin,
    gradient: 'purple' as const,
  },
  {
    number: '3',
    title: 'Message & hire',
    bullets: [
      'Chat directly to finalize details',
      'Coordinate schedule in real-time',
      'Book with confidence',
    ],
    chips: ['In-App Chat', 'Scheduling', 'Instant Book'],
    icon: MessageCircle,
    gradient: 'emerald' as const,
  },
  {
    number: '4',
    title: 'Pay securely',
    bullets: [
      'Track progress with live updates',
      'Pay only when work is complete',
      'Leave a review to help others',
    ],
    chips: ['Live Tracking', 'Secure Pay', 'Reviews'],
    icon: CreditCard,
    gradient: 'amber' as const,
  },
]

const workSteps = [
  {
    number: '1',
    title: 'Build your profile',
    bullets: [
      'Showcase your skills and experience',
      'Set your rate and service area',
      'Upload portfolio photos',
    ],
    chips: ['Skills', 'Pricing', 'Portfolio'],
    icon: Users,
    gradient: 'cyan' as const,
  },
  {
    number: '2',
    title: 'Find jobs on the map',
    bullets: [
      'Browse jobs near you in real-time',
      'Filter by category, pay, and timing',
      'Get alerts for matching jobs',
    ],
    chips: ['Map Discovery', 'Smart Filters', 'Alerts'],
    icon: MapPin,
    gradient: 'purple' as const,
  },
  {
    number: '3',
    title: 'Bid or accept',
    bullets: [
      'Send competitive bids with your terms',
      'Accept instant-book jobs immediately',
      'Negotiate directly with clients',
    ],
    chips: ['Bidding', 'Instant Accept', 'Messaging'],
    icon: MessageCircle,
    gradient: 'emerald' as const,
  },
  {
    number: '4',
    title: 'Get paid fast',
    bullets: [
      'Complete work and mark it done',
      'Receive payment within 24 hours',
      'Build your reputation with reviews',
    ],
    chips: ['Fast Payout', '24hr Transfer', 'Reviews'],
    icon: CreditCard,
    gradient: 'amber' as const,
  },
]

export default function HowItWorksPage() {
  const [activeMode, setActiveMode] = useState<'hire' | 'work'>('hire')
  const [activeStep, setActiveStep] = useState(0)
  const heroReveal = useScrollReveal<HTMLDivElement>()
  const contentReveal = useScrollReveal<HTMLDivElement>()
  const ctaReveal = useScrollReveal<HTMLDivElement>()

  const steps = activeMode === 'hire' ? hireSteps : workSteps
  const currentStep = steps[activeStep]

  return (
    <MarketingLayout>

      {/* Hero - Compact */}
      <section ref={heroReveal.ref} className="pt-28 pb-8 sm:pt-36 sm:pb-12 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className={getRevealClasses(heroReveal.isVisible, 'up')}>
            <Badge variant="brand" size="md" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Simple, secure, fast
            </Badge>
          </div>

          <h1 className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight ${getRevealClasses(heroReveal.isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
            <span className="text-white">How </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              CrewLink Works
            </span>
          </h1>
          <p className={`mt-4 text-base sm:text-lg text-slate-400 max-w-xl mx-auto ${getRevealClasses(heroReveal.isVisible, 'up')}`} style={{ transitionDelay: '160ms' }}>
            Whether you&apos;re hiring or working, get started in minutes with our streamlined process.
          </p>
        </div>
      </section>

      {/* Main Content - Two Column Desktop */}
      <section ref={contentReveal.ref} className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mode Toggle */}
          <div className={`flex justify-center mb-8 ${getRevealClasses(contentReveal.isVisible, 'up')}`}>
            <GlassPanel variant="elevated" padding="none" border="glow" rounded="2xl" className="inline-flex items-center p-1.5">
              <button
                onClick={() => { setActiveMode('hire'); setActiveStep(0) }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeMode === 'hire'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                For Hiring
              </button>
              <button
                onClick={() => { setActiveMode('work'); setActiveStep(0) }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeMode === 'work'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                For Working
              </button>
            </GlassPanel>
          </div>

          {/* Two Column Layout - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Left - Step Navigator (Sticky) */}
            <div className="sticky top-28 h-fit">
              <GlassPanel variant="elevated" padding="md" border="light" rounded="2xl">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
                  Steps
                </h3>
                <nav className="space-y-1">
                  {steps.map((step, index) => (
                    <button
                      key={step.number}
                      onClick={() => setActiveStep(index)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                        activeStep === index
                          ? activeMode === 'hire'
                            ? 'bg-cyan-500/10 border border-cyan-500/30'
                            : 'bg-emerald-500/10 border border-emerald-500/30'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        activeStep === index
                          ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {step.number}
                      </div>
                      <span className={`font-medium ${
                        activeStep === index
                          ? activeMode === 'hire' ? 'text-cyan-400' : 'text-emerald-400'
                          : 'text-slate-400'
                      }`}>
                        {step.title}
                      </span>
                    </button>
                  ))}
                </nav>
              </GlassPanel>

              {/* Trust badges */}
              <div className="mt-6 space-y-3">
                <GlassPanel variant="subtle" padding="sm" border="light" rounded="lg" className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-slate-400">Background-checked workers</span>
                </GlassPanel>
                <GlassPanel variant="subtle" padding="sm" border="light" rounded="lg" className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-slate-400">15 min avg response time</span>
                </GlassPanel>
                <GlassPanel variant="subtle" padding="sm" border="light" rounded="lg" className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-slate-400">4.8 average rating</span>
                </GlassPanel>
              </div>
            </div>

            {/* Right - Step Content */}
            <div className="min-h-[400px]">
              <div
                key={`${activeMode}-${activeStep}`}
                className="animate-fadeIn"
              >
                <FeatureCard gradient={currentStep.gradient} shine>
                  {/* Step header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      activeMode === 'hire'
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    }`}>
                      <currentStep.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className={`text-sm font-medium mb-1 ${
                        activeMode === 'hire' ? 'text-cyan-400' : 'text-emerald-400'
                      }`}>
                        Step {currentStep.number}
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        {currentStep.title}
                      </h2>
                    </div>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-4 mb-6">
                    {currentStep.bullets.map((bullet, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          activeMode === 'hire' ? 'bg-cyan-500/20' : 'bg-emerald-500/20'
                        }`}>
                          <Check className={`w-3 h-3 ${
                            activeMode === 'hire' ? 'text-cyan-400' : 'text-emerald-400'
                          }`} />
                        </div>
                        <span className="text-slate-300 text-base">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Feature chips */}
                  <div className="flex flex-wrap gap-2">
                    {currentStep.chips.map((chip) => (
                      <Badge
                        key={chip}
                        variant={activeMode === 'hire' ? 'brand' : 'success'}
                        size="sm"
                      >
                        {chip}
                      </Badge>
                    ))}
                  </div>
                </FeatureCard>

                {/* Navigation arrows */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveStep(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeStep === i
                            ? activeMode === 'hire' ? 'bg-cyan-400 w-6' : 'bg-emerald-400 w-6'
                            : 'bg-slate-600 hover:bg-slate-500'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                    disabled={activeStep === steps.length - 1}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Accordion Style */}
          <div className="lg:hidden space-y-3">
            {steps.map((step, index) => (
              <GlassPanel
                key={step.number}
                variant={activeStep === index ? 'elevated' : 'subtle'}
                padding="none"
                border={activeStep === index ? 'glow' : 'light'}
                rounded="xl"
                className={`overflow-hidden transition-all ${
                  activeStep === index
                    ? activeMode === 'hire'
                      ? 'border-cyan-500/30'
                      : 'border-emerald-500/30'
                    : ''
                }`}
              >
                <button
                  onClick={() => setActiveStep(activeStep === index ? -1 : index)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    activeStep === index
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`font-semibold ${
                    activeStep === index
                      ? 'text-white'
                      : 'text-slate-400'
                  }`}>
                    {step.title}
                  </span>
                </button>

                {activeStep === index && (
                  <div className="px-4 pb-4 animate-fadeIn">
                    <ul className="space-y-3 mb-4">
                      {step.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            activeMode === 'hire' ? 'text-cyan-400' : 'text-emerald-400'
                          }`} />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      {step.chips.map((chip) => (
                        <Badge
                          key={chip}
                          variant={activeMode === 'hire' ? 'brand' : 'success'}
                          size="sm"
                        >
                          {chip}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </GlassPanel>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Compact */}
      <section ref={ctaReveal.ref} className="py-12 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassPanel
            variant="elevated"
            padding="none"
            border="glow"
            rounded="2xl"
            className={`relative overflow-hidden p-6 sm:p-10 ${getRevealClasses(ctaReveal.isVisible, 'scale')}`}
          >
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px]" />
            </div>

            <div className="relative text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Ready to get started?
                </span>
              </h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Create your free account in under a minute. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/create-account?mode=hire">
                  <Button variant="primary" size="lg" glow leftIcon={<Briefcase className="w-4 h-4" />}>
                    Start Hiring
                  </Button>
                </Link>
                <Link href="/create-account?mode=work">
                  <Button variant="success" size="lg" leftIcon={<Users className="w-4 h-4" />}>
                    Start Working
                  </Button>
                </Link>
              </div>
            </div>
          </GlassPanel>
        </div>
      </section>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </MarketingLayout>
  )
}
