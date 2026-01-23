'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Target, Users, Briefcase, Building2, Sparkles } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// JULIUS WILLIAMS - CEO
// Premium profile with modern design
// ============================================

const focusAreas = [
  {
    icon: Target,
    title: 'Company Direction',
    description: 'Setting the long-term vision and making sure every team is aligned on where we are headed.',
  },
  {
    icon: Users,
    title: 'Culture & Hiring',
    description: 'Building a team that cares deeply about the people we serve and each other.',
  },
  {
    icon: Building2,
    title: 'Partnerships',
    description: 'Working with cities, businesses, and organizations to expand access to local work.',
  },
]

const highlights = [
  { label: 'Role', value: 'Chief Executive Officer' },
  { label: 'Focus', value: 'Vision & Strategy' },
  { label: 'Based in', value: 'San Francisco' },
]

function HeroSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="pt-28 pb-12 sm:pt-36 sm:pb-16 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        {/* Back navigation */}
        <Link
          href="/about"
          className={`group inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-10 transition-colors ${getRevealClasses(isVisible, 'up')}`}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to About
        </Link>

        <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-start">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <div className={`inline-flex items-center gap-2.5 px-4 py-2 bg-cyan-500/10 backdrop-blur-xl rounded-full border border-cyan-500/20 mb-6 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '60ms' }}>
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-cyan-400">Leadership</span>
            </div>

            {/* Name */}
            <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '120ms' }}>
              Julius Williams
            </h1>

            {/* Role */}
            <p className={`mt-4 text-xl sm:text-2xl text-slate-400 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '180ms' }}>
              Chief Executive Officer
            </p>

            {/* Quick stats */}
            <div className={`mt-8 flex flex-wrap gap-6 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '240ms' }}>
              {highlights.map((item) => (
                <div key={item.label} className="flex flex-col">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.label}</span>
                  <span className="text-white font-medium mt-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Avatar */}
          <div className={`${getRevealClasses(isVisible, 'scale')}`} style={{ transitionDelay: '200ms' }}>
            <div className="relative">
              <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center text-6xl lg:text-7xl font-bold text-white shadow-2xl shadow-cyan-500/25">
                JW
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-3 rounded-[2rem] border border-cyan-500/20 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BioSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className={`relative overflow-hidden p-8 lg:p-10 bg-slate-900/60 backdrop-blur-sm rounded-3xl border border-white/5 ${getRevealClasses(isVisible, 'up')}`}>
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative">
            <h2 className="text-sm font-medium text-cyan-400 uppercase tracking-wider mb-6">About</h2>
            <div className="space-y-5 text-slate-300 leading-relaxed text-lg">
              <p>
                Julius runs CrewLink with a simple belief: platforms should work for the people on them, not the other way around. Before starting the company, he spent years watching gig platforms optimize for investor metrics while workers and customers dealt with the fallout.
              </p>
              <p>
                He thinks most tech companies overcomplicate things. CrewLink exists to make local hiring feel as easy as texting a neighbor. He spends his time talking to users, cutting features that do not matter, and making sure the team stays focused on what actually helps people get work done.
              </p>
              <p>
                His approach to leadership is straightforward: hire people who care, give them context, and stay out of their way. He does not believe in process for its own sake or meetings that could be emails.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FocusAreasSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-12 sm:py-16 border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-10">
          <h2 className={`font-display text-2xl sm:text-3xl font-bold text-white tracking-tight ${getRevealClasses(isVisible, 'up')}`}>
            Focus Areas
          </h2>
          <p className={`mt-3 text-slate-400 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '60ms' }}>
            Where Julius spends most of his time
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {focusAreas.map((area, i) => (
            <div
              key={area.title}
              className={`group p-6 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900/60 transition-all duration-300 ${getRevealClasses(isVisible, 'up')}`}
              style={{ transitionDelay: `${120 + i * 60}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <area.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{area.title}</h3>
              <p className="text-slate-400 leading-relaxed">{area.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className={`relative overflow-hidden p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl border border-cyan-500/20 ${getRevealClasses(isVisible, 'scale')}`}>
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Want to work with Julius?</h3>
              <p className="text-slate-400">Check out our open positions and join the team.</p>
            </div>
            <Link
              href="/careers"
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
            >
              View Careers
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function JuliusWilliamsPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <BioSection />
      <FocusAreasSection />
      <CTASection />

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
