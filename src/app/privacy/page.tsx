'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Shield, ArrowLeft, FileText, ChevronRight, Lock, Eye, MapPin, Database, Cookie, Users, Bell, Mail } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// PRIVACY POLICY - Premium Legal Page
// Design: Scroll reveals, table of contents,
// section highlighting, ambient background
// ============================================

const sections = [
  { id: 'collect', title: 'Information We Collect', icon: Database },
  { id: 'use', title: 'How We Use Your Information', icon: Eye },
  { id: 'sharing', title: 'Information Sharing', icon: Users },
  { id: 'location', title: 'Location Data', icon: MapPin },
  { id: 'security', title: 'Data Security', icon: Lock },
  { id: 'rights', title: 'Your Rights', icon: Shield },
  { id: 'cookies', title: 'Cookies and Tracking', icon: Cookie },
  { id: 'children', title: "Children's Privacy", icon: Users },
  { id: 'changes', title: 'Changes to This Policy', icon: Bell },
  { id: 'contact', title: 'Contact Us', icon: Mail },
]

export default function PrivacyPage() {
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
          className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] animate-pulse"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse"
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
                <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-lg" />
                <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
                  Privacy Policy
                </h1>
                <p className="text-slate-400 mt-1">Last updated: January 2025</p>
              </div>
            </div>

            <p className="text-slate-400 text-lg max-w-2xl">
              Your privacy matters to us. This policy explains how we collect, use, and protect your personal information.
            </p>

            {/* Quick links */}
            <div className="flex items-center gap-4 mt-6">
              <Link
                href="/terms"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-slate-300 hover:text-white hover:border-white/20 transition-all text-sm"
              >
                <FileText className="w-4 h-4" />
                Terms of Service
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
                          ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500'
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
              <section id="collect" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Database className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
                </div>
                <p className="text-slate-400 mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="space-y-3">
                  {[
                    'Account information (name, email, phone number, password)',
                    'Profile information (photo, bio, skills, work history)',
                    'Payment information (processed securely by our payment partners)',
                    'Communications through our platform',
                    'Location data when using location-based features',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section id="use" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">2. How We Use Your Information</h2>
                </div>
                <p className="text-slate-400 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="space-y-3">
                  {[
                    'Provide, maintain, and improve our services',
                    'Match workers with relevant job opportunities',
                    'Process payments and prevent fraud',
                    'Send you notifications about jobs, messages, and updates',
                    'Provide customer support',
                    'Ensure safety and security on our platform',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section id="sharing" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">3. Information Sharing</h2>
                </div>
                <p className="text-slate-400 mb-4">
                  We may share your information with:
                </p>
                <ul className="space-y-3">
                  {[
                    'Other users as necessary to facilitate jobs (e.g., your profile to potential clients)',
                    'Service providers who help us operate our platform',
                    'Law enforcement when required by law',
                    'Other parties with your consent',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-emerald-400 text-sm font-medium">
                    We never sell your personal information to third parties.
                  </p>
                </div>
              </section>

              <section id="location" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">4. Location Data</h2>
                </div>
                <p className="text-slate-400">
                  With your permission, we collect location data to show you nearby jobs and help clients find workers in their area. You can disable location services at any time through your device settings or app preferences. Location data is only shared with other users when necessary for job coordination.
                </p>
              </section>

              <section id="security" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">5. Data Security</h2>
                </div>
                <p className="text-slate-400">
                  We implement industry-standard security measures to protect your information, including encryption of data in transit and at rest, secure payment processing, and regular security audits. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section id="rights" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">6. Your Rights</h2>
                </div>
                <p className="text-slate-400 mb-4">
                  You have the right to:
                </p>
                <ul className="space-y-3">
                  {[
                    'Access the personal information we hold about you',
                    'Request correction of inaccurate information',
                    'Request deletion of your account and data',
                    'Opt out of marketing communications',
                    'Export your data in a portable format',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section id="cookies" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Cookie className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">7. Cookies and Tracking</h2>
                </div>
                <p className="text-slate-400">
                  We use cookies and similar technologies to improve your experience, analyze usage patterns, and personalize content. You can control cookie preferences through your browser settings. Some features may not work properly if cookies are disabled.
                </p>
              </section>

              <section id="children" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">8. Children&apos;s Privacy</h2>
                </div>
                <p className="text-slate-400">
                  CrewLink is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </section>

              <section id="changes" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">9. Changes to This Policy</h2>
                </div>
                <p className="text-slate-400">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Continued use of the Service after changes constitutes acceptance.
                </p>
              </section>

              <section id="contact" className="group p-6 sm:p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">10. Contact Us</h2>
                </div>
                <p className="text-slate-400 mb-4">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <a
                  href="mailto:privacy@crewlink.com"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium hover:bg-emerald-500/20 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  privacy@crewlink.com
                </a>
              </section>
            </div>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
