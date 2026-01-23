'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, CheckCircle, RefreshCw, DollarSign, Clock, AlertCircle, HelpCircle } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// CREWLINK GUARANTEE PAGE - Premium Help Article
// Legally-safe copy, professional tone,
// clear structure, proper disclaimers
// ============================================

const guaranteeFeatures = [
  {
    icon: Shield,
    title: 'Quality Support',
    description: 'If work does not meet agreed-upon standards, our team will work with you to find a resolution, which may include finding a replacement worker or processing a refund.',
  },
  {
    icon: RefreshCw,
    title: 'Rebooking Assistance',
    description: 'If you experience an issue with a job, we can help coordinate with the original worker to address it or assist you in finding another qualified worker.',
  },
  {
    icon: DollarSign,
    title: 'Refund Process',
    description: 'Eligible refund requests are reviewed by our support team. Refunds are processed according to our policies and the specific circumstances of each case.',
  },
  {
    icon: Clock,
    title: 'Reporting Window',
    description: 'Issues should be reported within 48 hours of job completion to be eligible for review under this policy.',
  },
]

const coveredItems = [
  'Work not completed as described in the job posting',
  'Worker no-show without advance notice',
  'Significant quality concerns documented with evidence',
  'Verified damage caused during the job',
  'Safety issues reported during the engagement',
]

const notCoveredItems = [
  'Issues reported after the 48-hour window',
  'Changes to job scope made after booking',
  'Personal preference disputes unrelated to work quality',
  'Normal wear and usage',
  'Pre-existing conditions not disclosed before the job',
  'Issues arising from client-provided materials or instructions',
]

export default function HelpGuaranteePage() {
  const heroRef = useScrollReveal<HTMLDivElement>()
  const featuresRef = useScrollReveal<HTMLDivElement>()
  const coverageRef = useScrollReveal<HTMLDivElement>()
  const processRef = useScrollReveal<HTMLDivElement>()
  const ctaRef = useScrollReveal<HTMLDivElement>()

  return (
    <MarketingLayout>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]"
        />
        <div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px]"
        />
      </div>

      <div className="pt-28 pb-20 sm:pt-32 relative">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <div
            ref={heroRef.ref}
            className={`mb-12 ${getRevealClasses(heroRef.isVisible, 'up')}`}
          >
            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Help Center
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  CrewLink Guarantee
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Support policy for hirers</p>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              We&apos;re committed to helping you have a positive experience. If something doesn&apos;t go as planned, our support team is here to help find a resolution.
            </p>
          </div>

          {/* Hero Banner */}
          <div
            className={`mb-12 p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 rounded-3xl border border-emerald-500/20 ${getRevealClasses(heroRef.isVisible, 'up')}`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  How our support works
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  When you book through CrewLink, our support team is available to help resolve issues that may arise. We review each situation individually and work toward a fair outcome for everyone involved.
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <section
            ref={featuresRef.ref}
            className={`mb-12 ${getRevealClasses(featuresRef.isVisible, 'up')}`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">What we offer</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {guaranteeFeatures.map((feature, i) => (
                <div
                  key={feature.title}
                  className="p-5 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-colors"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Covered vs Not Covered */}
          <section
            ref={coverageRef.ref}
            className={`mb-12 ${getRevealClasses(coverageRef.isVisible, 'up')}`}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Covered */}
              <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-emerald-500/20">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  Generally eligible for review
                </h3>
                <ul className="space-y-3">
                  {coveredItems.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-300 text-sm">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not Covered */}
              <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                  <span className="w-5 h-5 rounded-full border-2 border-slate-500 flex items-center justify-center text-slate-500 text-xs">✕</span>
                  Generally not eligible
                </h3>
                <ul className="space-y-3">
                  {notCoveredItems.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-slate-400 text-sm">
                      <span className="text-slate-500 mt-0.5">✕</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* How to Request Support */}
          <section
            ref={processRef.ref}
            className={`mb-12 ${getRevealClasses(processRef.isVisible, 'up')}`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">How to request support</h2>
            <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5">
              <ol className="space-y-6">
                {[
                  { title: 'Document the issue', description: 'Take photos or screenshots that clearly show the problem. This helps our team understand the situation.' },
                  { title: 'Contact support promptly', description: 'Use the in-app help or email support@crewlink.com within 48 hours of job completion.' },
                  { title: 'Provide details', description: 'Include your job ID, a description of the issue, and what resolution you are seeking.' },
                  { title: 'Allow time for review', description: 'Our team will review your case and respond, typically within one to two business days.' },
                  { title: 'Work toward resolution', description: 'Based on our review, we will discuss options which may include rebooking, credits, or refunds.' },
                ].map((step, index) => (
                  <li key={index} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-white">{step.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Important Note */}
          <div className="mb-12 p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-400 mb-1">Important information</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  CrewLink facilitates connections between hirers and independent workers. Each resolution request is reviewed individually based on the specific circumstances, documentation provided, and our policies. Outcomes may vary. This policy does not create any guarantee of specific outcomes and is subject to change.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div
            ref={ctaRef.ref}
            className={`p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 rounded-3xl border border-emerald-500/20 text-center ${getRevealClasses(ctaRef.isVisible, 'scale')}`}
          >
            <h3 className="text-xl font-semibold text-white mb-2">Need help with an issue?</h3>
            <p className="text-slate-400 mb-6">
              Our support team is ready to assist you.
            </p>
            <Link
              href="/help/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
            >
              Contact support
            </Link>
            <p className="text-xs text-slate-500 mt-4">
              Available Monday through Friday, 9am to 6pm PT
            </p>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
