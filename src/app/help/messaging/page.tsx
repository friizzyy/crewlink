'use client'

import Link from 'next/link'
import { ArrowLeft, MessageCircle, Bell, Shield, Image, AlertCircle, HelpCircle } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// MESSAGING HELP PAGE
// Premium design, scroll reveals, consistent layout
// ============================================

const features = [
  {
    icon: Shield,
    title: 'Safe & Monitored',
    description: 'All messages are monitored for safety. Keep communication on-platform for your protection.',
  },
  {
    icon: Bell,
    title: 'Instant Notifications',
    description: 'Get push notifications for new messages so you never miss an important update.',
  },
  {
    icon: Image,
    title: 'Share Media',
    description: 'Send photos of the job, receipts, or any relevant information easily.',
  },
]

const faqs = [
  {
    question: 'Why should I keep messages on the platform?',
    answer: 'On-platform messaging is monitored for safety and provides a record in case of disputes. If you take communication off-platform and something goes wrong, we may not be able to help resolve the issue.',
  },
  {
    question: 'Can I block someone?',
    answer: 'Yes, you can block any user from your message thread. Blocked users cannot contact you or see your profile. To block someone, open the conversation and tap the menu icon.',
  },
  {
    question: 'How do I report inappropriate messages?',
    answer: 'Tap and hold on any message to report it. Select "Report" and choose the reason. Our trust team will review it within 24 hours.',
  },
  {
    question: 'Can I delete messages?',
    answer: 'You can delete messages from your view, but the other person will still see them. For safety reasons, we retain message records for dispute resolution.',
  },
  {
    question: 'Why am I not getting notifications?',
    answer: 'Check your notification settings in the app and your device settings. Make sure CrewLink has permission to send notifications. Also check that you are not in Do Not Disturb mode.',
  },
]

export default function HelpMessagingPage() {
  const heroRef = useScrollReveal<HTMLDivElement>()
  const featuresRef = useScrollReveal<HTMLDivElement>()
  const stepsRef = useScrollReveal<HTMLDivElement>()
  const faqsRef = useScrollReveal<HTMLDivElement>()
  const ctaRef = useScrollReveal<HTMLDivElement>()

  return (
    <MarketingLayout>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]"
        />
        <div
          className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[120px]"
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
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/20 flex items-center justify-center">
                <MessageCircle className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  Messaging
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Communicate safely and effectively</p>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed">
              Learn how to communicate effectively and safely with other users.
            </p>
          </div>

          {/* Features */}
          <section
            ref={featuresRef.ref}
            className={`mb-12 ${getRevealClasses(featuresRef.isVisible, 'up')}`}
          >
            <div className="grid sm:grid-cols-3 gap-4">
              {features.map((feature, i) => (
                <div
                  key={feature.title}
                  className="p-5 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 text-center"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="font-medium text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How to Message */}
          <section
            ref={stepsRef.ref}
            className={`mb-12 ${getRevealClasses(stepsRef.isVisible, 'up')}`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">How to send a message</h2>
            <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5">
              <ol className="space-y-4">
                {[
                  'Go to a job posting or worker profile',
                  'Tap the "Message" or "Contact" button',
                  'Type your message and hit send',
                  'You will be notified when they reply',
                ].map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-sm font-medium flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-slate-300">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Safety Notice */}
          <section className="mb-12">
            <div className="p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-2">Keep it on CrewLink</h3>
                  <p className="text-slate-300">
                    For your safety, always communicate through the CrewLink app. Be wary of users who ask to move conversations to other platforms, email, or phone. If someone pressures you to communicate off-platform, report them immediately.
                  </p>
                </div>
              </div>
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
                <h4 className="font-medium text-white mb-1">Message retention</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  For safety and dispute resolution purposes, we retain message records in accordance with our privacy policy. This helps protect all users and ensures we can assist if issues arise.
                </p>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div
            ref={ctaRef.ref}
            className={`p-8 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 rounded-3xl border border-purple-500/20 text-center ${getRevealClasses(ctaRef.isVisible, 'scale')}`}
          >
            <h3 className="text-xl font-semibold text-white mb-2">Need more help?</h3>
            <p className="text-slate-400 mb-6">Our support team is here to assist you.</p>
            <Link
              href="/help/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/20"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
