'use client'

import Link from 'next/link'
import { ArrowLeft, Briefcase, Search, MessageCircle, CreditCard, Shield, ChevronRight, HelpCircle } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// HIRING HELP PAGE
// Premium design, scroll reveals, consistent layout
// ============================================

const articles = [
  {
    title: 'How to post your first job',
    description: 'Learn the basics of creating a job listing that attracts qualified workers.',
    href: '/help/articles/posting-jobs',
  },
  {
    title: 'Finding the right worker',
    description: 'Tips for reviewing profiles, ratings, and choosing the best fit.',
    href: '/help/articles/finding-workers',
  },
  {
    title: 'Setting fair prices',
    description: 'Understand how pricing works and what to expect for different tasks.',
    href: '/help/articles/pricing-guide',
  },
  {
    title: 'Managing ongoing jobs',
    description: 'Track progress, communicate with workers, and handle changes.',
    href: '/help/articles/managing-jobs',
  },
  {
    title: 'Leaving reviews',
    description: 'Help the community by sharing your experience with workers.',
    href: '/help/articles/leaving-reviews',
  },
]

const faqs = [
  {
    question: 'How do I know if a worker is reliable?',
    answer: 'Check their profile for verified badges, star ratings, number of completed jobs, and reviews from other clients. Verified workers have completed our identity verification process.',
  },
  {
    question: 'Can I cancel a job after booking?',
    answer: 'Yes, you can cancel jobs. Free cancellation is available up to 24 hours before the scheduled start time. Late cancellations may incur a fee.',
  },
  {
    question: 'What if I have concerns about the work?',
    answer: 'Contact the worker first to address any issues. If you need additional help, our support team can assist with mediation and resolution.',
  },
  {
    question: 'How do payments work?',
    answer: 'Payment is held securely until the job is complete. Once you confirm the work is done, funds are released to the worker.',
  },
]

export default function HelpHiringPage() {
  const heroRef = useScrollReveal<HTMLDivElement>()
  const articlesRef = useScrollReveal<HTMLDivElement>()
  const faqsRef = useScrollReveal<HTMLDivElement>()
  const ctaRef = useScrollReveal<HTMLDivElement>()

  return (
    <MarketingLayout>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]"
        />
        <div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]"
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
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/20 flex items-center justify-center">
                <Briefcase className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  Hiring on CrewLink
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Find and hire local help</p>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              Everything you need to know about finding and hiring workers for your tasks.
            </p>
          </div>

          {/* Quick Links */}
          <div
            className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 ${getRevealClasses(heroRef.isVisible, 'up')}`}
            style={{ transitionDelay: '100ms' }}
          >
            {[
              { icon: Search, label: 'Find workers', href: '/hiring/map' },
              { icon: MessageCircle, label: 'Messages', href: '/hiring/messages' },
              { icon: CreditCard, label: 'Payments', href: '/help/payments' },
              { icon: Shield, label: 'Safety', href: '/safety' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all"
              >
                <link.icon className="w-5 h-5 text-cyan-400" />
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
                  className="flex items-center justify-between p-5 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div>
                    <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{article.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
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
                <h4 className="font-medium text-white mb-1">About hiring through CrewLink</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  CrewLink connects you with independent service providers. You select and hire workers based on their profiles and reviews. Workers are independent contractors, not CrewLink employees.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div
            ref={ctaRef.ref}
            className={`p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 rounded-3xl border border-cyan-500/20 text-center ${getRevealClasses(ctaRef.isVisible, 'scale')}`}
          >
            <h3 className="text-xl font-semibold text-white mb-2">Still need help?</h3>
            <p className="text-slate-400 mb-6">Our support team is here to assist you.</p>
            <Link
              href="/help/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
