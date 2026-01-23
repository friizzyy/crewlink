'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// ABOUT PAGE - Editorial Redesign
// Matching Pricing/Safety quality bar
// Calm, confident, dense but readable
// ============================================

const team = [
  {
    name: 'Julius Williams',
    role: 'CEO',
    slug: 'julius-williams',
    bio: 'Runs the company with a focus on what actually helps users.',
  },
  {
    name: 'Zahraa Alkhaleef',
    role: 'CTO & Co-Founder',
    slug: 'zahraa-alkhaleef',
    bio: 'Leads engineering and owns the matching system.',
  },
  {
    name: 'Ares Williams',
    role: 'Head of Product',
    slug: 'ares-williams',
    bio: 'Figures out what to build and makes sure it works.',
  },
  {
    name: 'Ali Alkhaleef',
    role: 'Head of Operations',
    slug: 'ali-alkhaleef',
    bio: 'Keeps the platform running and launches new markets.',
  },
]

function HeroSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="pt-28 pb-12 sm:pt-36 sm:pb-16 relative">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <p className={`text-sm font-medium text-cyan-400 uppercase tracking-wider mb-4 ${getRevealClasses(isVisible, 'up')}`}>
          About CrewLink
        </p>
        <h1 className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '60ms' }}>
          A better way to connect people who need help with people who want to work.
        </h1>
      </div>
    </section>
  )
}

function PhilosophySection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-12 sm:py-16 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-[140px_1fr] gap-6 lg:gap-12">
          <h2 className={`text-sm font-medium text-slate-500 uppercase tracking-wider lg:pt-1 ${getRevealClasses(isVisible, 'up')}`}>
            Why we exist
          </h2>
          <div className={`space-y-5 text-slate-300 leading-relaxed ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '60ms' }}>
            <p>
              In 2023, we noticed something broken. Hiring someone for a simple task meant outdated listings, phone tag, and hoping for the best. For workers, finding gigs meant juggling apps and never knowing when work would come.
            </p>
            <p>
              CrewLink fixes that. Our platform connects the right worker to the right job, instantly. No waiting. No guessing. Just work getting done by real people in your area.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function PrinciplesSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-12 sm:py-16 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-[140px_1fr] gap-6 lg:gap-12">
          <h2 className={`text-sm font-medium text-slate-500 uppercase tracking-wider lg:pt-1 ${getRevealClasses(isVisible, 'up')}`}>
            How we build
          </h2>
          <div className={`space-y-8 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '60ms' }}>
            <div>
              <h3 className="text-white font-medium mb-2">People over metrics</h3>
              <p className="text-slate-400 leading-relaxed">
                Every feature starts with one question: does this help someone get work done or find work? If not, we do not build it.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Simple by default</h3>
              <p className="text-slate-400 leading-relaxed">
                We cut features more than we add them. The goal is an app so intuitive you never think about how it works.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Trust is earned</h3>
              <p className="text-slate-400 leading-relaxed">
                We verify identities, hold payments in escrow, and review every dispute. Trust is not a marketing claim; it is built into the product.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TeamSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-12 sm:py-16 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-[140px_1fr] gap-6 lg:gap-12">
          <h2 className={`text-sm font-medium text-slate-500 uppercase tracking-wider lg:pt-1 ${getRevealClasses(isVisible, 'up')}`}>
            Team
          </h2>
          <div className={`space-y-6 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '60ms' }}>
            {team.map((member, i) => (
              <Link
                key={member.slug}
                href={`/team/${member.slug}`}
                className="group block py-4 border-b border-white/5 last:border-0 hover:border-white/10 transition-colors"
                style={{ transitionDelay: `${80 + i * 40}ms` }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">{member.role}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </div>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{member.bio}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function NumbersSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-12 sm:py-16 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-[140px_1fr] gap-6 lg:gap-12">
          <h2 className={`text-sm font-medium text-slate-500 uppercase tracking-wider lg:pt-1 ${getRevealClasses(isVisible, 'up')}`}>
            By the numbers
          </h2>
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-8 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '60ms' }}>
            <div>
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-sm text-slate-500 mt-1">Users</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">120K+</div>
              <div className="text-sm text-slate-500 mt-1">Jobs done</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">35</div>
              <div className="text-sm text-slate-500 mt-1">Cities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">4.8</div>
              <div className="text-sm text-slate-500 mt-1">Avg rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ClosingSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-12 sm:py-16 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-[140px_1fr] gap-6 lg:gap-12">
          <div />
          <div className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 ${getRevealClasses(isVisible, 'up')}`}>
            <Link
              href="/cities"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              See where we operate
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              Join the team
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <MarketingLayout>
      <HeroSection />
      <PhilosophySection />
      <PrinciplesSection />
      <TeamSection />
      <NumbersSection />
      <ClosingSection />
    </MarketingLayout>
  )
}
