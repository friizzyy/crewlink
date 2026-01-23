'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Mail, Clock, Home, Briefcase } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import { getRoleBySlug, JOB_ROLES, type JobRole } from '@/lib/careers'

// ============================================
// APPLICATION SUCCESS PAGE
// Shown after successful form submission
// ============================================

function SuccessContent() {
  const searchParams = useSearchParams()
  const roleSlug = searchParams.get('role')
  const applicantName = searchParams.get('name')
  const [role, setRole] = useState<JobRole | null>(null)

  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  useEffect(() => {
    if (roleSlug && roleSlug !== 'general') {
      const foundRole = getRoleBySlug(roleSlug)
      setRole(foundRole || null)
    }
  }, [roleSlug])

  // Get first name for personalization
  const firstName = applicantName?.split(' ')[0] || 'there'

  return (
    <div ref={ref} className="pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative">
        {/* Success icon */}
        <div className={`mb-8 ${getRevealClasses(isVisible, 'scale')}`} style={{ transitionDelay: '0ms' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
          Thanks, {firstName}!
        </h1>

        <p className={`mt-6 text-lg text-slate-400 leading-relaxed ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '160ms' }}>
          Your application for {role ? <span className="text-white font-medium">{role.title}</span> : 'this position'} has been received. We&apos;ll review it and get back to you soon.
        </p>

        {/* Next steps */}
        <div className={`mt-12 p-6 bg-slate-900/60 rounded-2xl border border-white/5 text-left ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '240ms' }}>
          <h2 className="font-semibold text-white mb-4">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Check your inbox</h3>
                <p className="text-sm text-slate-400 mt-1">
                  You&apos;ll receive a confirmation email shortly.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">We&apos;ll review your application</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Our team will look at your background within 5-7 business days.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">If there&apos;s a fit</h3>
                <p className="text-sm text-slate-400 mt-1">
                  We&apos;ll reach out to schedule the next step in our process.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`mt-10 flex flex-col sm:flex-row gap-4 justify-center ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '320ms' }}>
          <Link
            href="/careers"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-slate-800/60 text-white font-semibold rounded-2xl border border-white/10 hover:bg-slate-800 hover:border-white/20 transition-all"
          >
            <Briefcase className="w-5 h-5" />
            View other roles
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Home className="w-5 h-5" />
            Back to home
          </Link>
        </div>

        {/* Other roles */}
        {role && (
          <div className={`mt-16 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '400ms' }}>
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-6">
              Other positions you might like
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {JOB_ROLES.filter(r => r.slug !== role.slug && r.department === role.department)
                .slice(0, 2)
                .map(otherRole => (
                  <Link
                    key={otherRole.slug}
                    href={`/careers/${otherRole.slug}`}
                    className="group p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all text-left"
                  >
                    <h4 className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                      {otherRole.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">{otherRole.location}</p>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ApplicationSuccessPage() {
  return (
    <MarketingLayout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </MarketingLayout>
  )
}
