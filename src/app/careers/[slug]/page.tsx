'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Briefcase, MapPin, Clock, ArrowLeft, ArrowRight, Check, Send, Building2 } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import { getRoleBySlug, JOB_ROLES } from '@/lib/careers'

// ============================================
// ROLE DETAIL PAGE - Individual job posting
// Renders from /lib/careers.ts data
// ============================================

function RoleHero({ role }: { role: ReturnType<typeof getRoleBySlug> }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  if (!role) return null

  return (
    <section ref={ref} className="pt-32 pb-12 sm:pt-40 sm:pb-16 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        {/* Back link */}
        <Link
          href="/careers"
          className={`inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8 group ${getRevealClasses(isVisible, 'up')}`}
          style={{ transitionDelay: '0ms' }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to all positions
        </Link>

        {/* Title and meta */}
        <h1 className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '60ms' }}>
          {role.title}
        </h1>

        <div className={`flex flex-wrap items-center gap-4 mt-6 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '120ms' }}>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-lg text-sm text-white">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            {role.department}
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-lg text-sm text-white">
            <MapPin className="w-4 h-4 text-emerald-400" />
            {role.location}
          </span>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-lg text-sm text-white">
            <Clock className="w-4 h-4 text-emerald-400" />
            {role.type}
          </span>
        </div>

        <p className={`mt-8 text-lg text-slate-400 leading-relaxed ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '180ms' }}>
          {role.summary}
        </p>

        {/* Primary CTA */}
        <div className={`mt-8 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '240ms' }}>
          <Link
            href={`/careers/apply?role=${role.slug}`}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <Send className="w-5 h-5" />
            Apply for this role
          </Link>
        </div>
      </div>
    </section>
  )
}

function RoleContent({ role }: { role: ReturnType<typeof getRoleBySlug> }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  if (!role) return null

  return (
    <section ref={ref} className="py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '0ms' }}>
              <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
              <ul className="space-y-3">
                {role.overview.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-400">
                    <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Responsibilities */}
            <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '60ms' }}>
              <h2 className="text-xl font-semibold text-white mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {role.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '120ms' }}>
              <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
              <ul className="space-y-3">
                {role.requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-2" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nice to have */}
            {role.niceToHave.length > 0 && (
              <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '180ms' }}>
                <h2 className="text-xl font-semibold text-white mb-4">Nice to have</h2>
                <ul className="space-y-3">
                  {role.niceToHave.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0 mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Hiring process */}
            <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '240ms' }}>
              <h2 className="text-xl font-semibold text-white mb-6">Hiring process</h2>
              <div className="space-y-4">
                {role.hiringProcess.map((step, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-900/40 rounded-xl border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-emerald-400">{step.step}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{step.title}</h3>
                      <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className={`sticky top-32 space-y-6 ${getRevealClasses(isVisible, 'right')}`} style={{ transitionDelay: '300ms' }}>
              {/* Compensation card */}
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-white/5">
                <h3 className="font-semibold text-white mb-4">Compensation</h3>
                {role.compensation.range && (
                  <p className="text-emerald-400 font-medium mb-4">{role.compensation.range}</p>
                )}
                <ul className="space-y-2">
                  {role.compensation.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Apply card */}
              <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20">
                <h3 className="font-semibold text-white mb-2">Ready to apply?</h3>
                <p className="text-sm text-slate-400 mb-4">
                  We&apos;d love to hear from you. Submit your application and we&apos;ll be in touch.
                </p>
                <Link
                  href={`/careers/apply?role=${role.slug}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  Apply now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Company info */}
              <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">CrewLink</h3>
                    <p className="text-xs text-slate-500">Local services marketplace</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  We&apos;re building the future of how people find and hire local help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MoreRoles({ currentSlug }: { currentSlug: string }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  const otherRoles = JOB_ROLES.filter(r => r.slug !== currentSlug).slice(0, 3)

  if (otherRoles.length === 0) return null

  return (
    <section ref={ref} className="py-16 sm:py-20 border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <h2 className={`text-2xl font-bold text-white mb-8 ${getRevealClasses(isVisible, 'up')}`}>
          Other open positions
        </h2>

        <div className="space-y-4">
          {otherRoles.map((job, i) => (
            <Link
              key={job.slug}
              href={`/careers/${job.slug}`}
              className={`group block p-5 bg-slate-900/40 rounded-xl border border-white/5 hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all duration-300 ${getRevealClasses(isVisible, 'up')}`}
              style={{ transitionDelay: `${60 + i * 60}ms` }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span>{job.department}</span>
                    <span className="text-slate-700">•</span>
                    <span>{job.location}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/careers"
          className={`inline-flex items-center gap-2 mt-8 text-sm text-slate-400 hover:text-white transition-colors ${getRevealClasses(isVisible, 'up')}`}
          style={{ transitionDelay: '240ms' }}
        >
          View all positions
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  )
}

export default function RoleDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const role = getRoleBySlug(slug)

  if (!role) {
    notFound()
  }

  return (
    <MarketingLayout>
      <RoleHero role={role} />
      <RoleContent role={role} />
      <MoreRoles currentSlug={slug} />
    </MarketingLayout>
  )
}
