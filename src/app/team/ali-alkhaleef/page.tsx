'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, MapPin, HeartHandshake, BarChart3, TrendingUp, Sparkles } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// ALI ALKHALEEF - Head of Operations
// Premium profile with modern design
// ============================================

const focusAreas = [
  {
    icon: MapPin,
    title: 'Market Expansion',
    description: 'Launching CrewLink in new cities and making sure supply and demand are balanced from day one.',
  },
  {
    icon: HeartHandshake,
    title: 'Worker Success',
    description: 'Building programs that help workers earn more and have a better experience on the platform.',
  },
  {
    icon: BarChart3,
    title: 'Operational Metrics',
    description: 'Tracking what matters and cutting through noise to focus on outcomes that help users.',
  },
]

const highlights = [
  { label: 'Role', value: 'Head of Operations' },
  { label: 'Focus', value: 'Growth & Ops' },
  { label: 'Education', value: 'UC Berkeley' },
]

function HeroSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="pt-28 pb-12 sm:pt-36 sm:pb-16 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-[100px]" />
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
            <div className={`inline-flex items-center gap-2.5 px-4 py-2 bg-amber-500/10 backdrop-blur-xl rounded-full border border-amber-500/20 mb-6 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '60ms' }}>
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Leadership</span>
            </div>

            {/* Name */}
            <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '120ms' }}>
              Ali Alkhaleef
            </h1>

            {/* Role */}
            <p className={`mt-4 text-xl sm:text-2xl text-slate-400 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '180ms' }}>
              Head of Operations
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
              <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-6xl lg:text-7xl font-bold text-white shadow-2xl shadow-amber-500/25">
                AA
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-3 rounded-[2rem] border border-amber-500/20 pointer-events-none" />
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative">
            <h2 className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-6">About</h2>
            <div className="space-y-5 text-slate-300 leading-relaxed text-lg">
              <p>
                Ali keeps CrewLink running. He studied economics at UC Berkeley and spent time afterward working in logistics, where he learned that most operational problems come down to incentives. When the incentives are right, things tend to work.
              </p>
              <p>
                At CrewLink, he handles everything from launching new markets to making sure workers get paid on time. He cares a lot about the details that most people do not notice but that make the difference between an app that feels reliable and one that does not.
              </p>
              <p>
                He is the person who asks uncomfortable questions in meetings and usually ends up being right. He tracks more metrics than anyone else on the team, but only because he knows which ones actually matter.
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
            Where Ali spends most of his time
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {focusAreas.map((area, i) => (
            <div
              key={area.title}
              className={`group p-6 bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-amber-500/30 hover:bg-slate-900/60 transition-all duration-300 ${getRevealClasses(isVisible, 'up')}`}
              style={{ transitionDelay: `${120 + i * 60}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <area.icon className="w-6 h-6 text-amber-400" />
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
        <div className={`relative overflow-hidden p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl border border-amber-500/20 ${getRevealClasses(isVisible, 'scale')}`}>
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Want to scale with Ali?</h3>
              <p className="text-slate-400">Join our operations team and help bring CrewLink to new markets.</p>
            </div>
            <Link
              href="/careers"
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all shadow-lg shadow-amber-500/20"
            >
              View Operations Roles
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AliAlkhaleefPage() {
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
