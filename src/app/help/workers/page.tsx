'use client'

import Link from 'next/link'
import { ArrowLeft, Users, DollarSign, Star, Clock, Shield, ChevronRight, MapPin, HelpCircle } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// WORKERS HELP PAGE
// Premium design, scroll reveals, consistent layout
// ============================================

const articles = [
  {
    title: 'Getting started as a worker',
    description: 'Complete your profile, set your skills, and start finding jobs.',
    href: '/help/articles/getting-started-worker',
  },
  {
    title: 'Building your profile',
    description: 'Tips for creating a profile that attracts clients and builds trust.',
    href: '/help/articles/building-profile',
  },
  {
    title: 'Finding and accepting jobs',
    description: 'Learn how to search for jobs, filter by type, and accept offers.',
    href: '/help/articles/finding-jobs',
  },
  {
    title: 'Getting paid',
    description: 'Understand payment timing, fees, and how to set up payouts.',
    href: '/help/articles/getting-paid',
  },
  {
    title: 'Earning great reviews',
    description: 'Tips for providing excellent service and building your reputation.',
    href: '/help/articles/earning-reviews',
  },
]

const faqs = [
  {
    question: 'How do I get more job offers?',
    answer: 'Complete your profile with a photo and bio, add all your skills, maintain a high response rate, and earn positive reviews. Workers with verified badges tend to appear higher in search results.',
  },
  {
    question: 'What are the platform fees?',
    answer: 'CrewLink charges a 15% service fee on completed jobs. This covers payment processing, platform maintenance, and support. You see your earnings clearly before accepting any job.',
  },
  {
    question: 'How quickly do I get paid?',
    answer: 'Payments are released when the client confirms job completion. Funds typically arrive in your bank account within 1 to 3 business days. Instant payouts are available for a small fee.',
  },
  {
    question: 'What if a client cancels?',
    answer: 'If a client cancels less than 24 hours before the job, you may receive a cancellation fee. If they cancel during the job or you have already arrived, you may be eligible for partial or full payment.',
  },
]

export default function HelpWorkersPage() {
  const heroRef = useScrollReveal<HTMLDivElement>()
  const articlesRef = useScrollReveal<HTMLDivElement>()
  const faqsRef = useScrollReveal<HTMLDivElement>()
  const ctaRef = useScrollReveal<HTMLDivElement>()

  return (
    <MarketingLayout>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]"
        />
        <div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]"
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
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  Working on CrewLink
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Find jobs and earn money</p>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              Everything you need to know about finding jobs and earning money on CrewLink.
            </p>
          </div>

          {/* Quick Links */}
          <div
            className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 ${getRevealClasses(heroRef.isVisible, 'up')}`}
            style={{ transitionDelay: '100ms' }}
          >
            {[
              { icon: MapPin, label: 'Find jobs', href: '/work/map' },
              { icon: DollarSign, label: 'Payouts', href: '/work/settings/payout' },
              { icon: Star, label: 'Your profile', href: '/work/profile' },
              { icon: Shield, label: 'Safety', href: '/safety' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all"
              >
                <link.icon className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-white">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Articles */}
          <section
            ref={articlesRef.ref}
            className={`mb-12 ${getRevealClasses(articlesRef.isVisible, 'up')}`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Popular articles</h2>
            <div className="space-y-3">
              {articles.map((article, i) => (
                <Link
                  key={article.title}
                  href={article.href}
                  className="flex items-center justify-between p-5 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all group"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div>
                    <h3 className="font-medium text-white group-hover:text-emerald-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{article.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </Link>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section
            ref={faqsRef.ref}
            className={`mb-12 ${getRevealClasses(faqsRef.isVisible, 'up')}`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={faq.question}
                  className="p-5 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <h3 className="font-medium text-white mb-2">{faq.question}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Platform Note */}
          <div className="mb-12 p-5 bg-slate-900/50 border border-white/5 rounded-2xl">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-white mb-1">About working on CrewLink</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  As a CrewLink worker, you are an independent contractor. You set your own rates, schedule, and choose which jobs to accept. CrewLink provides the platform to connect you with clients.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div
            ref={ctaRef.ref}
            className={`p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 rounded-3xl border border-emerald-500/20 text-center ${getRevealClasses(ctaRef.isVisible, 'scale')}`}
          >
            <h3 className="text-xl font-semibold text-white mb-2">Still need help?</h3>
            <p className="text-slate-400 mb-6">Our support team is here to assist you.</p>
            <Link
              href="/help/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
