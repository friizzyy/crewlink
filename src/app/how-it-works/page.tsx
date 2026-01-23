'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, Briefcase, Users, Sparkles, Camera, MapPin, MessageCircle, CreditCard, Star, Clock, Shield } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'

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
  },
]

export default function HowItWorksPage() {
  const [activeMode, setActiveMode] = useState<'hire' | 'work'>('hire')
  const [activeStep, setActiveStep] = useState(0)

  const steps = activeMode === 'hire' ? hireSteps : workSteps
  const currentStep = steps[activeStep]

  return (
    <MarketingLayout>

      {/* Hero - Compact */}
      <section className="pt-28 pb-8 sm:pt-36 sm:pb-12 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/20 mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400">Simple, secure, fast</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            How CrewLink Works
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-xl mx-auto">
            Whether you&apos;re hiring or working, get started in minutes with our streamlined process.
          </p>
        </div>
      </section>

      {/* Main Content - Two Column Desktop */}
      <section className="py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-slate-900/80 backdrop-blur-xl rounded-2xl p-1.5 border border-cyan-500/10">
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
            </div>
          </div>

          {/* Two Column Layout - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Left - Step Navigator (Sticky) */}
            <div className="sticky top-28 h-fit">
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
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
                          ? activeMode === 'hire'
                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                            : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
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
              </div>

              {/* Trust badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl border border-white/5">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-slate-400">Background-checked workers</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl border border-white/5">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-slate-400">15 min avg response time</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-900/30 rounded-xl border border-white/5">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-slate-400">4.8 average rating</span>
                </div>
              </div>
            </div>

            {/* Right - Step Content */}
            <div className="min-h-[400px]">
              <div
                key={`${activeMode}-${activeStep}`}
                className="animate-fadeIn"
              >
                <div className={`p-8 rounded-3xl border ${
                  activeMode === 'hire'
                    ? 'bg-gradient-to-br from-slate-900/80 to-slate-900/40 border-cyan-500/20'
                    : 'bg-gradient-to-br from-slate-900/80 to-slate-900/40 border-emerald-500/20'
                }`}>
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
                      <span
                        key={chip}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${
                          activeMode === 'hire'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

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
              <div
                key={step.number}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  activeStep === index
                    ? activeMode === 'hire'
                      ? 'bg-slate-900/80 border-cyan-500/30'
                      : 'bg-slate-900/80 border-emerald-500/30'
                    : 'bg-slate-900/50 border-white/10'
                }`}
              >
                <button
                  onClick={() => setActiveStep(activeStep === index ? -1 : index)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    activeStep === index
                      ? activeMode === 'hire'
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                        : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
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
                        <span
                          key={chip}
                          className={`text-xs px-2.5 py-1 rounded-full border ${
                            activeMode === 'hire'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Compact */}
      <section className="py-12 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/20 p-6 sm:p-10">
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px]" />
            </div>

            <div className="relative text-center">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to get started?
              </h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Create your free account in under a minute. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/create-account?mode=hire"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25"
                >
                  <Briefcase className="w-4 h-4" />
                  Start Hiring
                </Link>
                <Link
                  href="/create-account?mode=work"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25"
                >
                  <Users className="w-4 h-4" />
                  Start Working
                </Link>
              </div>
            </div>
          </div>
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
