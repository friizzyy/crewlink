'use client'

import Link from 'next/link'
import { ArrowLeft, User, Lock, Shield, ChevronRight, Settings, HelpCircle } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// ACCOUNT SETTINGS HELP PAGE
// Premium design, scroll reveals, consistent layout
// ============================================

const articles = [
  {
    title: 'Creating your account',
    description: 'Step-by-step guide to signing up for CrewLink.',
    href: '/help/articles/create-account',
  },
  {
    title: 'Completing your profile',
    description: 'Add a photo, bio, and skills to attract more opportunities.',
    href: '/help/articles/complete-profile',
  },
  {
    title: 'Verifying your identity',
    description: 'How to complete identity verification for the verified badge.',
    href: '/help/articles/verify-identity',
  },
  {
    title: 'Changing your password',
    description: 'Update your password or recover a forgotten one.',
    href: '/help/articles/change-password',
  },
  {
    title: 'Deleting your account',
    description: 'How to permanently delete your CrewLink account.',
    href: '/help/articles/delete-account',
  },
]

const faqs = [
  {
    question: 'How do I change my email address?',
    answer: 'Go to Settings, then Account, then Email Address. You will need to verify the new email before the change takes effect.',
  },
  {
    question: 'How do I change my phone number?',
    answer: 'Go to Settings, then Account, then Phone Number. We will send a verification code to your new number.',
  },
  {
    question: 'I forgot my password. What do I do?',
    answer: 'On the sign-in page, tap "Forgot password?" and enter your email. We will send you a link to create a new password. The link expires in 1 hour.',
  },
  {
    question: 'How do I get verified?',
    answer: 'Go to Settings, then Verification and follow the prompts. You will need to provide a government ID and take a selfie. Verification typically completes within 24 hours.',
  },
  {
    question: 'Can I have multiple accounts?',
    answer: 'No, each person can only have one CrewLink account. If you need to switch between hiring and working, you can do both from the same account.',
  },
  {
    question: 'How do I delete my account?',
    answer: 'Go to Settings, then Danger Zone, then Delete Account. You will need to confirm your password. Note that deletion is permanent and you will lose all your reviews, job history, and earnings.',
  },
]

export default function HelpAccountPage() {
  const heroRef = useScrollReveal<HTMLDivElement>()
  const articlesRef = useScrollReveal<HTMLDivElement>()
  const faqsRef = useScrollReveal<HTMLDivElement>()
  const ctaRef = useScrollReveal<HTMLDivElement>()

  return (
    <MarketingLayout>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]"
        />
        <div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px]"
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
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center">
                <User className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  Account Settings
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Manage your profile and security</p>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              Manage your account, profile, and security settings.
            </p>
          </div>

          {/* Quick Links */}
          <div
            className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 ${getRevealClasses(heroRef.isVisible, 'up')}`}
            style={{ transitionDelay: '100ms' }}
          >
            {[
              { icon: User, label: 'Edit profile', href: '/hiring/profile' },
              { icon: Settings, label: 'Settings', href: '/hiring/settings' },
              { icon: Shield, label: 'Security', href: '/hiring/settings' },
              { icon: Lock, label: 'Password', href: '/forgot-password' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/5 hover:border-blue-500/30 transition-all"
              >
                <link.icon className="w-5 h-5 text-blue-400" />
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
                  className="flex items-center justify-between p-5 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div>
                    <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{article.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
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
                <h4 className="font-medium text-white mb-1">Account security</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  We recommend using a strong, unique password and enabling two-factor authentication. Never share your login credentials with anyone.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div
            ref={ctaRef.ref}
            className={`p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 rounded-3xl border border-blue-500/20 text-center ${getRevealClasses(ctaRef.isVisible, 'scale')}`}
          >
            <h3 className="text-xl font-semibold text-white mb-2">Need more help?</h3>
            <p className="text-slate-400 mb-6">Our support team is here to assist you.</p>
            <Link
              href="/help/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
