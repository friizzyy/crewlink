'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, UserCheck, AlertTriangle, Phone, Eye, BadgeCheck, ChevronRight, MessageCircle, Flag, HelpCircle } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// TRUST & SAFETY HELP PAGE - Premium Design
// Matches Safety page quality bar
// Uses MarketingLayout, scroll reveals
// ============================================

const safetyFeatures = [
  {
    icon: UserCheck,
    title: 'Identity Verification',
    description: 'Users verify their identity through government ID and photo matching.',
  },
  {
    icon: Shield,
    title: 'Background Screening',
    description: 'Optional background checks are available for workers who choose to complete them.',
  },
  {
    icon: Eye,
    title: 'Activity Monitoring',
    description: 'Our trust team monitors the platform for suspicious activity.',
  },
  {
    icon: BadgeCheck,
    title: 'Review System',
    description: 'Ratings and reviews help users make informed decisions.',
  },
]

const reportingOptions = [
  {
    title: 'Safety concern',
    description: 'Report harassment, threats, or unsafe behavior',
    urgent: true,
  },
  {
    title: 'Fraud or scam',
    description: 'Report suspicious payments or fake profiles',
    urgent: true,
  },
  {
    title: 'Policy violation',
    description: 'Report users violating community guidelines',
    urgent: false,
  },
  {
    title: 'Other issue',
    description: 'General trust-related concerns',
    urgent: false,
  },
]

export default function HelpTrustPage() {
  const heroRef = useScrollReveal<HTMLDivElement>()
  const featuresRef = useScrollReveal<HTMLDivElement>()
  const reportRef = useScrollReveal<HTMLDivElement>()
  const tipsRef = useScrollReveal<HTMLDivElement>()
  const ctaRef = useScrollReveal<HTMLDivElement>()

  return (
    <MarketingLayout>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]"
        />
        <div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px]"
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
                  Trust & Safety
                </h1>
                <p className="text-slate-500 mt-1 text-sm">How we help protect our community</p>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              Learn about the tools and policies we use to help keep our community safe, and how to report concerns.
            </p>
          </div>

          {/* Emergency Banner */}
          <div
            className={`mb-12 p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl border border-red-500/20 ${getRevealClasses(heroRef.isVisible, 'up')}`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white mb-2">In an emergency?</h3>
                <p className="text-slate-300 mb-4">
                  If you are in immediate danger, call 911 first. Then contact our 24/7 safety line.
                </p>
                <a
                  href="tel:1-800-CREWLINK"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-400 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  1-800-CREWLINK
                </a>
              </div>
            </div>
          </div>

          {/* Safety Features */}
          <section
            ref={featuresRef.ref}
            className={`mb-12 ${getRevealClasses(featuresRef.isVisible, 'up')}`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Safety tools and features</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {safetyFeatures.map((feature, i) => (
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
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Report an Issue */}
          <section
            ref={reportRef.ref}
            className={`mb-12 ${getRevealClasses(reportRef.isVisible, 'up')}`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Report an issue</h2>
            <div className="space-y-3">
              {reportingOptions.map((option, i) => (
                <Link
                  key={option.title}
                  href="/help/contact"
                  className="flex items-center justify-between p-5 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-center gap-4">
                    {option.urgent && (
                      <span className="px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                        Urgent
                      </span>
                    )}
                    <div>
                      <h3 className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                        {option.title}
                      </h3>
                      <p className="text-sm text-slate-400">{option.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </Link>
              ))}
            </div>
          </section>

          {/* Safety Tips */}
          <section
            ref={tipsRef.ref}
            className={`mb-12 ${getRevealClasses(tipsRef.isVisible, 'up')}`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Safety tips</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-cyan-500/20">
                <h3 className="font-semibold text-white mb-4">For hirers</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    Review profiles and ratings before booking
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    Keep all payments through the platform
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    Use in-app messaging for communication
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    Trust your instincts and cancel if something feels off
                  </li>
                </ul>
              </div>
              <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-emerald-500/20">
                <h3 className="font-semibold text-white mb-4">For workers</h3>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    Review job details before accepting
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    Share your location with trusted contacts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    Use the app&apos;s check-in features
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">•</span>
                    Report any concerns immediately
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Platform Role Notice */}
          <div className="mb-12 p-5 bg-slate-900/50 border border-white/5 rounded-2xl">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-white mb-1">About our role</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  CrewLink provides a platform that connects hirers with independent service providers. While we offer tools and support to help facilitate safe interactions, users are responsible for their own decisions and interactions. We encourage all users to exercise good judgment and report any concerns.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div
            ref={ctaRef.ref}
            className={`p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 rounded-3xl border border-emerald-500/20 text-center ${getRevealClasses(ctaRef.isVisible, 'scale')}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">24/7 Trust & Safety Support</h3>
            <p className="text-slate-400 mb-6">
              Our team is available around the clock for safety concerns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="tel:1-800-CREWLINK"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Phone className="w-4 h-4" />
                Call us
              </a>
              <Link
                href="/help/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/20 text-white font-medium rounded-xl hover:bg-white/5 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Send a report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
