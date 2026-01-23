'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Shield, UserCheck, MessageCircle, AlertTriangle, Phone, Lock, Eye,
  BadgeCheck, CheckCircle, CreditCard, ArrowRight, ChevronDown, Flag,
  HelpCircle, Users, Briefcase, Clock, FileSearch, HeartHandshake, Scale
} from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// SAFETY PAGE - Premium Redesign v2
// Matching How It Works + Pricing quality bar
// Interactive, trustworthy, modern
// ============================================

// Trust pillars - the four main areas
const trustPillars = [
  {
    id: 'identity',
    title: 'Identity & Verification',
    subtitle: 'Know who you\'re working with',
    icon: UserCheck,
    color: 'emerald',
    features: [
      {
        title: 'Government ID check',
        description: 'Every user verifies their identity with a photo ID and facial match.',
      },
      {
        title: 'Profile review',
        description: 'Our team manually reviews profiles to catch fake or misleading accounts.',
      },
      {
        title: 'Background checks',
        description: 'Optional screening for criminal history and sex offender registries.',
      },
      {
        title: 'Verified badges',
        description: 'Workers who complete verification earn visible trust badges.',
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Protection',
    subtitle: 'Your money is always safe',
    icon: CreditCard,
    color: 'cyan',
    features: [
      {
        title: 'Funds held in escrow',
        description: 'Payment is secured until the job is complete and approved.',
      },
      {
        title: 'Bank-level encryption',
        description: 'Card details are encrypted and never stored on our servers.',
      },
      {
        title: 'Dispute resolution',
        description: 'Dedicated team to mediate issues and process fair refunds.',
      },
      {
        title: 'No-show protection',
        description: 'Automatic full refund if a worker cancels or fails to show.',
      },
    ],
  },
  {
    id: 'reviews',
    title: 'Reviews & Accountability',
    subtitle: 'Honest ratings you can trust',
    icon: BadgeCheck,
    color: 'emerald',
    features: [
      {
        title: 'Verified reviews only',
        description: 'Only users who completed a transaction can leave reviews.',
      },
      {
        title: 'Two-way ratings',
        description: 'Both hirers and workers rate each other after every job.',
      },
      {
        title: 'Pattern detection',
        description: 'We flag suspicious review patterns and remove fake ratings.',
      },
      {
        title: 'Response opportunity',
        description: 'Workers can respond publicly to reviews for full transparency.',
      },
    ],
  },
  {
    id: 'support',
    title: 'Support & Resolution',
    subtitle: 'Real help when you need it',
    icon: HeartHandshake,
    color: 'cyan',
    features: [
      {
        title: '24/7 safety line',
        description: 'Call us anytime for urgent safety concerns.',
      },
      {
        title: 'In-app reporting',
        description: 'Flag issues directly from any profile or job with one tap.',
      },
      {
        title: '24-hour response',
        description: 'Every report is reviewed by a human within one business day.',
      },
      {
        title: 'Law enforcement liaison',
        description: 'We cooperate with authorities when required for serious incidents.',
      },
    ],
  },
]

// Quick stats for social proof
const trustStats = [
  { value: '99.7%', label: 'Jobs completed safely' },
  { value: '<1%', label: 'Dispute rate' },
  { value: '24hrs', label: 'Report response time' },
  { value: '4.8', label: 'Average worker rating' },
]

// Safety tips by audience
const safetyTips = {
  workers: [
    { tip: 'Review job details and client ratings before accepting', icon: FileSearch },
    { tip: 'Keep all communication on-platform', icon: MessageCircle },
    { tip: 'Share your live location with a trusted contact', icon: Eye },
    { tip: 'Trust your instincts—decline jobs that feel off', icon: Shield },
  ],
  hirers: [
    { tip: 'Check worker ratings and reviews before booking', icon: BadgeCheck },
    { tip: 'Communicate job details clearly upfront', icon: MessageCircle },
    { tip: 'Only pay through the platform—never cash', icon: Lock },
    { tip: 'Leave honest reviews to help the community', icon: Scale },
  ],
}

// FAQs
const faqs = [
  {
    question: 'How does identity verification work?',
    answer: 'Users upload a government-issued ID and take a selfie. Our system matches the photo to confirm identity. This takes about 2 minutes and only needs to be done once.',
  },
  {
    question: 'Are background checks required?',
    answer: 'Background checks are optional but recommended for workers. They cost $25, are one-time, and check criminal history, sex offender registries, and verify SSN. Workers with background checks get a badge on their profile.',
  },
  {
    question: 'What happens if I have a problem?',
    answer: 'Report it immediately through the app. Our Trust & Safety team reviews every report within 24 hours. We can issue refunds, remove users, and in serious cases, share information with law enforcement.',
  },
  {
    question: 'Is my payment information safe?',
    answer: 'Yes. We use bank-level encryption and never store your full card number. Payments are processed by Stripe, a PCI-compliant processor used by millions of businesses.',
  },
  {
    question: 'What if a worker doesn\'t show up?',
    answer: 'If a worker cancels or no-shows, you receive a full refund automatically. Repeated no-shows result in account suspension.',
  },
]

// ============================================
// COMPONENTS
// ============================================

function AudienceToggle({
  mode,
  setMode,
}: {
  mode: 'workers' | 'hirers'
  setMode: (mode: 'workers' | 'hirers') => void
}) {
  return (
    <div
      className="inline-flex items-center bg-slate-900/80 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10"
      role="tablist"
      aria-label="Select safety tips view"
    >
      <button
        role="tab"
        aria-selected={mode === 'hirers'}
        onClick={() => setMode('hirers')}
        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
          mode === 'hirers'
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Briefcase className="w-4 h-4" />
        <span>For Hirers</span>
      </button>
      <button
        role="tab"
        aria-selected={mode === 'workers'}
        onClick={() => setMode('workers')}
        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
          mode === 'workers'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        <Users className="w-4 h-4" />
        <span>For Workers</span>
      </button>
    </div>
  )
}

function TrustPillarCard({
  pillar,
  isActive,
  onClick,
  index,
  isVisible,
}: {
  pillar: typeof trustPillars[0]
  isActive: boolean
  onClick: () => void
  index: number
  isVisible: boolean
}) {
  const isEmerald = pillar.color === 'emerald'
  const IconComponent = pillar.icon

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
        isActive
          ? isEmerald
            ? 'bg-emerald-500/10 border-emerald-500/40'
            : 'bg-cyan-500/10 border-cyan-500/40'
          : 'bg-slate-900/40 border-white/5 hover:border-white/20 hover:bg-slate-900/60'
      } ${getRevealClasses(isVisible, 'up')}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
          isActive
            ? isEmerald
              ? 'bg-emerald-500/20 border border-emerald-500/30'
              : 'bg-cyan-500/20 border border-cyan-500/30'
            : 'bg-slate-800 border border-white/10 group-hover:bg-slate-700'
        }`}>
          <IconComponent className={`w-6 h-6 ${
            isActive
              ? isEmerald ? 'text-emerald-400' : 'text-cyan-400'
              : 'text-slate-400 group-hover:text-white'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate ${
            isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
          }`}>
            {pillar.title}
          </h3>
          <p className="text-sm text-slate-500 truncate">{pillar.subtitle}</p>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform lg:hidden ${
          isActive ? 'rotate-180 text-white' : 'text-slate-500'
        }`} />
      </div>
    </button>
  )
}

function TrustPillarContent({
  pillar,
  isVisible,
}: {
  pillar: typeof trustPillars[0]
  isVisible: boolean
}) {
  const isEmerald = pillar.color === 'emerald'
  const IconComponent = pillar.icon

  return (
    <div className={`p-6 lg:p-8 bg-slate-900/40 backdrop-blur-sm rounded-3xl border ${
      isEmerald ? 'border-emerald-500/20' : 'border-cyan-500/20'
    } ${getRevealClasses(isVisible, 'up')}`}>
      {/* Header */}
      <div className="flex items-start gap-4 mb-8 pb-6 border-b border-white/5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          isEmerald
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : 'bg-gradient-to-br from-cyan-500 to-blue-600'
        }`}>
          <IconComponent className="w-7 h-7 text-white" />
        </div>
        <div>
          <h3 className="text-xl lg:text-2xl font-bold text-white">{pillar.title}</h3>
          <p className="text-slate-400 mt-1">{pillar.subtitle}</p>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {pillar.features.map((feature, i) => (
          <div
            key={feature.title}
            className="p-4 bg-slate-800/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
          >
            <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
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
          <div
            key={i}
            className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden"
          >
            <button
              id={headingId}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
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
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// SECTIONS
// ============================================

function HeroSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="pt-28 pb-10 sm:pt-36 sm:pb-14 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative">
        {/* Badge */}
        <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 bg-emerald-500/10 backdrop-blur-xl rounded-full border border-emerald-500/20 mb-8 ${getRevealClasses(isVisible, 'up')}`}>
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-emerald-400 tracking-wide">Trust & Safety</span>
        </div>

        {/* Headline */}
        <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
          Your safety is{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            built in
          </span>
        </h1>

        {/* Subheadline */}
        <p className={`mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '160ms' }}>
          Every feature starts with one question: does this make our community safer?
          Here&apos;s how we protect you.
        </p>

        {/* CTAs */}
        <div className={`mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '240ms' }}>
          <a
            href="tel:1-800-CREWLINK"
            className="group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Phone className="w-4 h-4" />
            24/7 Safety Line
          </a>
          <Link
            href="/help/trust"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 text-white font-medium rounded-xl hover:bg-white/5 transition-all"
          >
            <Flag className="w-4 h-4" />
            Report an Issue
          </Link>
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trustStats.map((stat, i) => (
            <div
              key={stat.label}
              className={`p-6 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 text-center ${getRevealClasses(isVisible, 'up')}`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="font-display text-3xl sm:text-4xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustPillarsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const [activePillar, setActivePillar] = useState(0)

  return (
    <section ref={ref} className="py-10 sm:py-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className={`font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight ${getRevealClasses(isVisible, 'up')}`}>
            How we protect you
          </h2>
          <p className={`mt-4 text-lg text-slate-400 max-w-2xl mx-auto ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
            Safety is built into every layer of the platform
          </p>
        </div>

        {/* Desktop: 2-column layout */}
        <div className="hidden lg:grid lg:grid-cols-[320px_1fr] gap-8">
          {/* Left: Pillar nav */}
          <div className="space-y-3">
            {trustPillars.map((pillar, i) => (
              <TrustPillarCard
                key={pillar.id}
                pillar={pillar}
                isActive={activePillar === i}
                onClick={() => setActivePillar(i)}
                index={i}
                isVisible={isVisible}
              />
            ))}
          </div>

          {/* Right: Content */}
          <div key={activePillar} className="animate-fadeIn">
            <TrustPillarContent
              pillar={trustPillars[activePillar]}
              isVisible={isVisible}
            />
          </div>
        </div>

        {/* Mobile: Accordion */}
        <div className="lg:hidden space-y-4">
          {trustPillars.map((pillar, i) => {
            const isActive = activePillar === i
            const isEmerald = pillar.color === 'emerald'
            const IconComponent = pillar.icon

            return (
              <div
                key={pillar.id}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  isActive
                    ? isEmerald
                      ? 'bg-slate-900/60 border-emerald-500/30'
                      : 'bg-slate-900/60 border-cyan-500/30'
                    : 'bg-slate-900/40 border-white/5'
                } ${getRevealClasses(isVisible, 'up')}`}
                style={{ transitionDelay: `${160 + i * 60}ms` }}
              >
                <button
                  onClick={() => setActivePillar(isActive ? -1 : i)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? isEmerald
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                        : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                      : 'bg-slate-800'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {pillar.title}
                    </h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${
                    isActive ? 'rotate-180 text-white' : 'text-slate-500'
                  }`} />
                </button>

                {isActive && (
                  <div className="px-5 pb-5 animate-fadeIn">
                    <p className="text-sm text-slate-400 mb-4">{pillar.subtitle}</p>
                    <div className="space-y-3">
                      {pillar.features.map((feature) => (
                        <div
                          key={feature.title}
                          className="p-3 bg-slate-800/50 rounded-xl"
                        >
                          <h4 className="font-medium text-white text-sm mb-0.5">{feature.title}</h4>
                          <p className="text-xs text-slate-400">{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function SafetyTipsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const [tipsMode, setTipsMode] = useState<'workers' | 'hirers'>('hirers')
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleModeChange = useCallback((newMode: 'workers' | 'hirers') => {
    if (newMode === tipsMode) return
    setIsTransitioning(true)
    setTimeout(() => {
      setTipsMode(newMode)
      setIsTransitioning(false)
    }, 150)
  }, [tipsMode])

  const currentTips = safetyTips[tipsMode]
  const isWorkers = tipsMode === 'workers'

  return (
    <section ref={ref} className="py-10 sm:py-16 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className={`font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight ${getRevealClasses(isVisible, 'up')}`}>
            Stay safe on CrewLink
          </h2>
          <p className={`mt-4 text-lg text-slate-400 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
            Simple practices to protect yourself
          </p>
        </div>

        {/* Toggle */}
        <div className={`flex justify-center mb-8 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '160ms' }}>
          <AudienceToggle mode={tipsMode} setMode={handleModeChange} />
        </div>

        {/* Tips grid with transition */}
        <div
          className={`transition-all duration-300 ease-out ${
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {currentTips.map((item, i) => {
              const TipIcon = item.icon
              return (
                <div
                  key={item.tip}
                  className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                    isWorkers
                      ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/30'
                      : 'bg-cyan-500/5 border-cyan-500/10 hover:border-cyan-500/30'
                  } ${getRevealClasses(isVisible, 'up')}`}
                  style={{ transitionDelay: `${240 + i * 60}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isWorkers
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-cyan-500/10 border border-cyan-500/20'
                  }`}>
                    <TipIcon className={`w-5 h-5 ${isWorkers ? 'text-emerald-400' : 'text-cyan-400'}`} />
                  </div>
                  <p className="text-slate-300 leading-relaxed">{item.tip}</p>
                </div>
              )
            })}
          </div>
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
          <h2 className={`font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight ${getRevealClasses(isVisible, 'up')}`}>
            Common questions
          </h2>
        </div>

        <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '80ms' }}>
          <Accordion items={faqs} />
        </div>

        <p
          className={`mt-8 text-center text-sm text-slate-500 ${getRevealClasses(isVisible, 'up')}`}
          style={{ transitionDelay: '160ms' }}
        >
          More questions?{' '}
          <Link
            href="/help"
            className="text-emerald-400 hover:text-emerald-300 underline-offset-4 hover:underline"
          >
            Visit our help center
          </Link>
        </p>
      </div>
    </section>
  )
}

function SupportCTASection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-10 sm:py-16 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Report card */}
          <div className={`relative overflow-hidden p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 rounded-3xl border border-amber-500/20 ${getRevealClasses(isVisible, 'up')}`}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px]" />
            </div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Need to report something?</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                If you&apos;ve experienced harassment, fraud, or any safety concern, let us know immediately.
              </p>
              <Link
                href="/help/trust"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-amber-500/10 text-amber-400 font-medium rounded-xl border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Report an issue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Help card */}
          <div className={`relative overflow-hidden p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 rounded-3xl border border-cyan-500/20 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px]" />
            </div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                <HelpCircle className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Have a question?</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Browse guides on payments, disputes, account security, and more.
              </p>
              <Link
                href="/help"
                className="group inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/10 text-cyan-400 font-medium rounded-xl border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Visit Help Center
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function EmergencyCTASection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className={`relative overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl border border-emerald-500/20 text-center ${getRevealClasses(isVisible, 'scale')}`}>
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
              24/7 Safety Support
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              If you&apos;re in an emergency or feel unsafe, call our safety line immediately. We&apos;re here around the clock.
            </p>
            <a
              href="tel:1-800-CREWLINK"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Phone className="w-5 h-5" />
              1-800-CREWLINK
            </a>
            <p className="mt-4 text-sm text-slate-500">
              For life-threatening emergencies, always call 911 first.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// MAIN PAGE
// ============================================

export default function SafetyPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <StatsSection />
      <TrustPillarsSection />
      <SafetyTipsSection />
      <FAQSection />
      <SupportCTASection />
      <EmergencyCTASection />

      {/* Animations + reduced motion support */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
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
