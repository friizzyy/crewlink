'use client'

import Link from 'next/link'
import { ArrowLeft, CreditCard, DollarSign, Shield, Clock, ChevronRight, AlertCircle, HelpCircle } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// PAYMENTS & BILLING HELP PAGE
// Premium design, scroll reveals, consistent layout
// ============================================

const articles = [
  {
    title: 'How payments work',
    description: 'Understand the payment flow from booking to completion.',
    href: '/help/articles/payment-flow',
  },
  {
    title: 'Adding a payment method',
    description: 'Learn how to add credit cards, debit cards, or bank accounts.',
    href: '/help/articles/adding-payment',
  },
  {
    title: 'Setting up payouts (workers)',
    description: 'Connect your bank account to receive earnings.',
    href: '/help/articles/payout-setup',
  },
  {
    title: 'Refunds and disputes',
    description: 'How to request a refund or resolve payment disputes.',
    href: '/help/articles/refunds',
  },
]

const faqs = [
  {
    question: 'When am I charged for a job?',
    answer: 'A hold is placed on your payment method when you book a job. The actual charge occurs when you confirm the job is complete. If you cancel before the job starts, the hold is released.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover). Apple Pay and Google Pay are also supported on compatible devices.',
  },
  {
    question: 'How do I request a refund?',
    answer: 'If you have concerns about the work, first try to resolve it with the worker. If needed, contact our support team within 48 hours of job completion. We review each case individually.',
  },
  {
    question: 'Are there any hidden fees?',
    answer: 'No hidden fees. The price you see when booking includes the worker rate plus a service fee (typically 15%). Workers see their earnings clearly before accepting jobs.',
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes. We use industry-standard encryption and partner with Stripe for payment processing. Your card details are never stored on our servers.',
  },
]

export default function HelpPaymentsPage() {
  const heroRef = useScrollReveal<HTMLDivElement>()
  const flowRef = useScrollReveal<HTMLDivElement>()
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
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px]"
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
                <CreditCard className="w-7 h-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  Payments & Billing
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Manage payments, refunds, and billing</p>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              Everything about payments, refunds, and managing your billing information.
            </p>
          </div>

          {/* Quick Links */}
          <div
            className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 ${getRevealClasses(heroRef.isVisible, 'up')}`}
            style={{ transitionDelay: '100ms' }}
          >
            {[
              { icon: CreditCard, label: 'Payment methods', href: '/hiring/settings/payment' },
              { icon: DollarSign, label: 'Payout settings', href: '/work/settings/payout' },
              { icon: Clock, label: 'Transactions', href: '/work/transactions' },
              { icon: Shield, label: 'Security', href: '/help/trust' },
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

          {/* Payment Flow */}
          <section
            ref={flowRef.ref}
            className={`mb-12 ${getRevealClasses(flowRef.isVisible, 'up')}`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">How payments work</h2>
            <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { step: 1, title: 'Book', description: 'A hold is placed on your card when you book a job' },
                  { step: 2, title: 'Complete', description: 'Worker completes the task and you verify the work' },
                  { step: 3, title: 'Pay', description: 'Payment is released to the worker automatically' },
                ].map((item, i) => (
                  <div key={item.step} className="text-center" style={{ transitionDelay: `${i * 60}ms` }}>
                    <div className="w-10 h-10 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center mx-auto mb-3">
                      {item.step}
                    </div>
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

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
                <h4 className="font-medium text-white mb-1">Payment processing</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  All payments are processed securely through Stripe, a PCI-compliant payment processor. CrewLink does not store your full card details. Refunds are subject to review and our policies.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div
            ref={ctaRef.ref}
            className={`p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 rounded-3xl border border-cyan-500/20 ${getRevealClasses(ctaRef.isVisible, 'scale')}`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Have a billing issue?</h3>
                <p className="text-slate-400 mb-4">
                  If you see an unexpected charge or need help with a payment issue, our support team can help.
                </p>
                <Link
                  href="/help/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Contact billing support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
