'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { FileText, ArrowLeft, Shield, ChevronRight, Check, Users, CreditCard, XCircle, AlertTriangle, Bell, Mail, Scale } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// TERMS OF SERVICE - Premium Legal Page
// Design: Scroll reveals, table of contents,
// section highlighting, ambient background
// ============================================

const sections = [
  { id: 'acceptance', title: 'Acceptance of Terms', icon: Check },
  { id: 'use', title: 'Use of Service', icon: Users },
  { id: 'registration', title: 'Account Registration', icon: Users },
  { id: 'payment', title: 'Payment Terms', icon: CreditCard },
  { id: 'cancellation', title: 'Cancellation Policy', icon: XCircle },
  { id: 'prohibited', title: 'Prohibited Activities', icon: AlertTriangle },
  { id: 'liability', title: 'Limitation of Liability', icon: Scale },
  { id: 'changes', title: 'Changes to Terms', icon: Bell },
  { id: 'contact', title: 'Contact Us', icon: Mail },
]

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('')
  const heroRef = useScrollReveal<HTMLDivElement>()
  const tocRef = useScrollReveal<HTMLDivElement>()
  const contentRef = useScrollReveal<HTMLDivElement>()

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    sections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <MarketingLayout>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '3s' }}
        />
      </div>

      <div className="pt-32 pb-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div
            ref={heroRef.ref}
            className={`mb-12 ${getRevealClasses(heroRef.isVisible, 'up')}`}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to home
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-lg" />
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  Terms of Service
                </h1>
                <p className="text-slate-400 mt-1">Last updated: January 2025</p>
              </div>
            </div>

            <p className="text-slate-400 text-lg max-w-2xl">
              Please read these terms carefully before using CrewLink. By using our service, you agree to be bound by these terms.
            </p>

            {/* Quick links */}
            <div className="flex items-center gap-4 mt-6">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:border-white/20 transition-all text-sm"
              >
                <Shield className="w-4 h-4" />
                Privacy Policy
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Table of Contents - Sticky */}
            <div
              ref={tocRef.ref}
              className={`hidden lg:block ${getRevealClasses(tocRef.isVisible, 'left')}`}
            >
              <div className="sticky top-32">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
                  On this page
                </h3>
                <nav className="space-y-1">
                  {sections.map(({ id, title, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                        activeSection === id
                          ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div
              ref={contentRef.ref}
              className={`space-y-6 ${getRevealClasses(contentRef.isVisible, 'up')}`}
            >
              <section id="acceptance" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
                </div>
                <p className="text-slate-400">
                  By accessing or using CrewLink&apos;s services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                </p>
              </section>

              <section id="use" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">2. Use of Service</h2>
                </div>
                <p className="text-slate-400 mb-4">
                  CrewLink provides a platform connecting people who need help with tasks (&quot;Clients&quot;) and people who can provide services (&quot;Workers&quot;). By using our platform, you agree to:
                </p>
                <ul className="space-y-3">
                  {[
                    'Provide accurate and complete information when creating an account',
                    'Maintain the security of your account credentials',
                    'Use the platform only for lawful purposes',
                    'Treat other users with respect and professionalism',
                    'Complete jobs and payments as agreed upon',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section id="registration" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">3. Account Registration</h2>
                </div>
                <p className="text-slate-400">
                  To access certain features of the Service, you must register for an account. You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
                </p>
              </section>

              <section id="payment" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">4. Payment Terms</h2>
                </div>
                <p className="text-slate-400 mb-4">
                  All payments are processed securely through our platform. By using CrewLink:
                </p>
                <ul className="space-y-3">
                  {[
                    'Clients agree to pay for services as quoted and accepted',
                    'Workers agree to complete jobs as described and accept platform fees',
                    'Payments are held in escrow until job completion',
                    'Disputes will be handled according to our dispute resolution process',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                  <p className="text-cyan-400 text-sm font-medium">
                    All transactions are protected by our secure payment system and dispute resolution process.
                  </p>
                </div>
              </section>

              <section id="cancellation" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">5. Cancellation Policy</h2>
                </div>
                <p className="text-slate-400">
                  Jobs may be cancelled according to our cancellation policy. Cancellations made less than 24 hours before the scheduled start time may incur a cancellation fee. Repeated cancellations may result in account restrictions.
                </p>
              </section>

              <section id="prohibited" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">6. Prohibited Activities</h2>
                </div>
                <p className="text-slate-400 mb-4">
                  You may not use CrewLink for:
                </p>
                <ul className="space-y-3">
                  {[
                    'Any illegal or unauthorized purpose',
                    'Harassment, abuse, or harm to others',
                    'Posting false or misleading information',
                    'Circumventing our payment system',
                    'Scraping or collecting user data without permission',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-400">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section id="liability" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">7. Limitation of Liability</h2>
                </div>
                <p className="text-slate-400">
                  CrewLink is a platform that connects users but is not responsible for the quality, safety, or legality of the services provided by Workers. We are not liable for any damages arising from the use of our platform or services arranged through it.
                </p>
              </section>

              <section id="changes" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">8. Changes to Terms</h2>
                </div>
                <p className="text-slate-400">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the platform. Continued use of the Service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section id="contact" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">9. Contact Us</h2>
                </div>
                <p className="text-slate-400 mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <a
                  href="mailto:legal@crewlink.com"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 font-medium hover:bg-cyan-500/20 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  legal@crewlink.com
                </a>
              </section>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
