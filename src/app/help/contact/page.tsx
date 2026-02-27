'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MessageCircle, Clock, Send, Loader2, CheckCircle } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// CONTACT SUPPORT PAGE
// Premium design, scroll reveals, form validation
// ============================================

const contactOptions = [
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'For urgent issues, call our 24/7 hotline',
    action: '1-800-CREWLINK',
    href: 'tel:1-800-CREWLINK',
    available: '24/7',
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with a support agent in real-time',
    action: 'Start chat',
    href: '#chat',
    available: '24/7',
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Send us a detailed message',
    action: 'support@crewlink.com',
    href: 'mailto:support@crewlink.com',
    available: 'Response within 24h',
  },
]

const categories = [
  'General question',
  'Billing issue',
  'Report a problem',
  'Safety concern',
  'Feature request',
  'Other',
]

export default function HelpContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    message: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const heroRef = useScrollReveal<HTMLDivElement>()
  const optionsRef = useScrollReveal<HTMLDivElement>()
  const formRef = useScrollReveal<HTMLDivElement>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to send message')
        return
      }

      setIsSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Contact Support
            </h1>
            <p className="text-slate-400 text-lg">
              We are here to help. Choose how you would like to reach us.
            </p>
          </div>

          {/* Contact Options */}
          <div
            ref={optionsRef.ref}
            className={`grid sm:grid-cols-3 gap-4 mb-12 ${getRevealClasses(optionsRef.isVisible, 'up')}`}
          >
            {contactOptions.map((option, i) => (
              <a
                key={option.title}
                href={option.href}
                className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all text-center group"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <option.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">{option.title}</h3>
                <p className="text-sm text-slate-400 mb-3">{option.description}</p>
                <div className="text-cyan-400 font-medium group-hover:text-cyan-300 transition-colors">
                  {option.action}
                </div>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {option.available}
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <div
            ref={formRef.ref}
            className={`bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 p-8 ${getRevealClasses(formRef.isVisible, 'up')}`}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Send us a message</h2>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                    {error}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Your name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
                    placeholder="Describe your issue or question in detail..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send message
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Message sent!</h3>
                <p className="text-slate-400 mb-6">
                  We will get back to you within 24 hours. Check your email for updates.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormData({ name: '', email: '', category: '', message: '' })
                  }}
                  className="text-cyan-400 font-medium hover:text-cyan-300"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>

          {/* FAQ Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Looking for quick answers?{' '}
              <Link href="/help" className="text-cyan-400 font-medium hover:text-cyan-300">
                Check our FAQ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MarketingLayout>
  )
}
