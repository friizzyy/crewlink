'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, Code2, Database, Shield, Cpu, Sparkles } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// ZAHRAA ALKHALEEF - CTO & Co-Founder
// Premium profile with modern design
// ============================================

const focusAreas = [
  {
    icon: Cpu,
    title: 'Platform Architecture',
    description: 'Designing systems that scale gracefully as we grow, without accumulating technical debt.',
  },
  {
    icon: Database,
    title: 'Matching Algorithms',
    description: 'Building the models that connect the right worker to the right job in real time.',
  },
  {
    icon: Shield,
    title: 'Security & Trust',
    description: 'Making sure user data stays protected and verification systems work as intended.',
  },
]

const highlights = [
  { label: 'Role', value: 'CTO & Co-Founder' },
  { label: 'Focus', value: 'Engineering & Systems' },
  { label: 'Education', value: 'UC Berkeley' },
]

function HeroSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="pt-28 pb-12 sm:pt-36 sm:pb-16 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-[100px]" />
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
            <div className={`inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-500/10 backdrop-blur-xl rounded-full border border-emerald-500/20 mb-6 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '60ms' }}>
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Co-Founder</span>
            </div>

            {/* Name */}
            <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '120ms' }}>
              Zahraa Alkhaleef
            </h1>

            {/* Role */}
            <p className={`mt-4 text-xl sm:text-2xl text-slate-400 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '180ms' }}>
              Chief Technology Officer & Co-Founder
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
              <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-6xl lg:text-7xl font-bold text-white shadow-2xl shadow-emerald-500/25">
                ZA
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-3 rounded-[2rem] border border-emerald-500/20 pointer-events-none" />
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative">
            <h2 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-6">About</h2>
            <div className="space-y-5 text-slate-300 leading-relaxed text-lg">
              <p>
                Zahraa builds the technical systems that make CrewLink work. She studied computer science at UC Berkeley, where she got interested in how marketplaces fail when they treat participants as interchangeable units. Most platforms optimize for transaction volume. She wanted to build something that optimized for whether people actually had a good experience.
              </p>
              <p>
                At CrewLink, she leads engineering and owns the matching system. Her focus is on making technology invisible: when the platform works well, nobody notices it. They just notice that finding help is easy and work shows up when they need it.
              </p>
              <p>
                She is a collector of obscure programming languages and believes the best code is the code you delete. Her teams ship often and refactor constantly.
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
            Where Zahraa spends most of her time
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {focusAreas.map((area, i) => (
            <div
              key={area.title}
              className={`group p-6 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all duration-300 ${getRevealClasses(isVisible, 'up')}`}
              style={{ transitionDelay: `${120 + i * 60}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <area.icon className="w-6 h-6 text-emerald-400" />
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
        <div className={`relative overflow-hidden p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl border border-emerald-500/20 ${getRevealClasses(isVisible, 'scale')}`}>
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Want to build with Zahraa?</h3>
              <p className="text-slate-400">We are always looking for talented engineers to join the team.</p>
            </div>
            <Link
              href="/careers"
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
            >
              View Engineering Roles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ZahraaAlkhaleefPage() {
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
