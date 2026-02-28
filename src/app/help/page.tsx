'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  Search, ChevronRight, Briefcase, Users, CreditCard, Shield,
  MessageCircle, Settings, FileText, Mail, X, Send, Sparkles,
  ArrowRight, HelpCircle, BookOpen
} from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import { GlassPanel, GlassCard, Button, Badge } from '@/components/ui'

// ============================================
// HELP CENTER - Premium Support Experience
// Design: Scroll reveals, focus glow states,
// animated search, enhanced chat modal
// ============================================

const categories = [
  {
    icon: Briefcase,
    title: 'Posting & Hiring',
    description: 'How to post jobs, find workers, and manage bookings',
    articles: 12,
    href: '/help/hiring',
    color: 'cyan',
  },
  {
    icon: Users,
    title: 'Finding Work',
    description: 'Set up your profile, find jobs, and build your reputation',
    articles: 15,
    href: '/help/workers',
    color: 'emerald',
  },
  {
    icon: CreditCard,
    title: 'Payments & Earnings',
    description: 'Understand fees, payouts, and payment processing',
    articles: 8,
    href: '/help/payments',
    color: 'purple',
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description: 'Verification, background checks, and staying safe',
    articles: 10,
    href: '/help/trust',
    color: 'amber',
  },
  {
    icon: MessageCircle,
    title: 'Messaging',
    description: 'Communicate with workers and clients',
    articles: 6,
    href: '/help/messaging',
    color: 'blue',
  },
  {
    icon: Settings,
    title: 'Account Settings',
    description: 'Manage your profile, notifications, and preferences',
    articles: 9,
    href: '/help/account',
    color: 'rose',
  },
]

const popularArticles = [
  { title: 'How to post your first job', href: '/help/articles/post-first-job', icon: Briefcase },
  { title: 'Setting your rates as a worker', href: '/help/articles/setting-rates', icon: CreditCard },
  { title: 'Understanding service fees', href: '/help/articles/service-fees', icon: FileText },
  { title: 'How payments work', href: '/help/articles/how-payments-work', icon: CreditCard },
  { title: 'Getting verified as a worker', href: '/help/articles/worker-verification', icon: Shield },
  { title: 'What to do if there\'s a dispute', href: '/help/articles/dispute-resolution', icon: HelpCircle },
  { title: 'Cancellation policies', href: '/help/articles/cancellation-policy', icon: FileText },
  { title: 'How to leave a review', href: '/help/articles/leaving-reviews', icon: MessageCircle },
]

// Color classes map (avoiding dynamic Tailwind)
const colorClasses: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  cyan: {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    border: 'group-hover:border-cyan-500/40',
    glow: 'group-hover:shadow-cyan-500/10',
  },
  emerald: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'group-hover:border-emerald-500/40',
    glow: 'group-hover:shadow-emerald-500/10',
  },
  purple: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'group-hover:border-purple-500/40',
    glow: 'group-hover:shadow-purple-500/10',
  },
  amber: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'group-hover:border-amber-500/40',
    glow: 'group-hover:shadow-amber-500/10',
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'group-hover:border-blue-500/40',
    glow: 'group-hover:shadow-blue-500/10',
  },
  rose: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-400',
    border: 'group-hover:border-rose-500/40',
    glow: 'group-hover:shadow-rose-500/10',
  },
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi there! Welcome to CrewLink support. How can I help you today?', time: 'Just now' }
  ])
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll reveal refs
  const heroRef = useScrollReveal<HTMLDivElement>()
  const categoriesRef = useScrollReveal<HTMLDivElement>()
  const articlesRef = useScrollReveal<HTMLDivElement>()
  const contactRef = useScrollReveal<HTMLDivElement>()

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulate bot response
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return

    setMessages(prev => [...prev, { from: 'user', text: chatMessage, time: 'Just now' }])
    setChatMessage('')
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      setMessages(prev => [...prev, {
        from: 'bot',
        text: 'Thanks for your message! A support agent will be with you shortly. In the meantime, you can browse our help articles above.',
        time: 'Just now'
      }])
    }, 2000)
  }

  // Filter articles based on search
  const filteredArticles = searchQuery
    ? popularArticles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : popularArticles

  return (
    <MarketingLayout>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '2s' }}
        />
      </div>

      {/* Hero */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 relative">
        <div
          ref={heroRef.ref}
          className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center ${getRevealClasses(heroRef.isVisible, 'up')}`}
        >
          {/* Icon Badge */}
          <Badge variant="brand" size="md" className="mb-8">
            <BookOpen className="w-4 h-4 mr-2" />
            Help Center
          </Badge>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            How can we{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              help you?
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
            Search our knowledge base or browse categories below
          </p>

          {/* Enhanced Search */}
          <div className="mt-10 max-w-xl mx-auto">
            <div className="relative group">
              {/* Focus glow */}
              <div
                className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 transition-opacity duration-500 ${
                  searchFocused ? 'opacity-30' : 'group-hover:opacity-10'
                }`}
              />
              <div className="relative">
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                  searchFocused ? 'text-cyan-400' : 'text-slate-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white text-lg placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Search results dropdown */}
            {searchQuery && filteredArticles.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 mx-auto max-w-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-20">
                {filteredArticles.slice(0, 5).map((article, index) => (
                  <Link
                    key={article.title}
                    href={article.href}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                  >
                    <article.icon className="w-5 h-5 text-cyan-400" />
                    <span className="text-white">{article.title}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-24 relative">
        <div
          ref={categoriesRef.ref}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${getRevealClasses(categoriesRef.isVisible, 'up')}`}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="font-display text-2xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Browse by category
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const colors = colorClasses[category.color]
              return (
                <Link
                  key={category.title}
                  href={category.href}
                  className={`group relative p-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:bg-slate-900/70 transition-all duration-300 hover:shadow-xl ${colors.border} ${colors.glow}`}
                  style={{
                    transitionDelay: categoriesRef.isVisible ? `${index * 75}ms` : '0ms',
                    opacity: categoriesRef.isVisible ? 1 : 0,
                    transform: categoriesRef.isVisible ? 'translateY(0)' : 'translateY(20px)',
                  }}
                >
                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <category.icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <h3 className="font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{category.articles} articles</span>
                      <div className="flex items-center gap-1 text-slate-500 group-hover:text-cyan-400 transition-colors">
                        <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">Browse</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-16 sm:py-24 relative">
        <div
          ref={articlesRef.ref}
          className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${getRevealClasses(articlesRef.isVisible, 'up')}`}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              Popular articles
            </h2>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden">
            {popularArticles.map((article, index) => (
              <Link
                key={article.title}
                href={article.href}
                className="group flex items-center justify-between p-5 hover:bg-white/5 transition-all duration-300 border-b border-white/5 last:border-0"
                style={{
                  transitionDelay: articlesRef.isVisible ? `${index * 50}ms` : '0ms',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <article.icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  </div>
                  <span className="text-white group-hover:text-cyan-400 transition-colors">{article.title}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-24 relative">
        <div
          ref={contactRef.ref}
          className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${getRevealClasses(contactRef.isVisible, 'up')}`}
        >
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
              Still need help?
            </h2>
            <p className="text-slate-400">
              Our support team is here for you
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Chat Card */}
            <GlassCard interactive={false} padding="xl" rounded="xl" className="text-center group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Chat with us</h3>
              <p className="text-slate-400 text-sm mb-6">
                Get instant answers from our support team
              </p>
              <Button variant="primary" size="lg" fullWidth glow onClick={() => setShowChatModal(true)}>
                Start chat
              </Button>
              <p className="text-xs text-slate-500 mt-4">Average response time: &lt;2 minutes</p>
            </GlassCard>

            {/* Email Card */}
            <GlassCard interactive={false} padding="xl" rounded="xl" className="text-center group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Email support</h3>
              <p className="text-slate-400 text-sm mb-6">
                We typically respond within 24 hours
              </p>
              <a href="mailto:support@crewlink.com">
                <Button variant="secondary" size="lg" fullWidth>
                  Send email
                </Button>
              </a>
              <p className="text-xs text-slate-500 mt-4">support@crewlink.com</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Enhanced Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md h-[550px] flex flex-col shadow-2xl shadow-cyan-500/10 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">CrewLink Support</h3>
                  <span className="text-xs text-emerald-400">Online now</span>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.from === 'bot' && (
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                      msg.from === 'user'
                        ? 'bg-cyan-500 text-white rounded-tr-md'
                        : 'bg-slate-800 rounded-tl-md'
                    }`}
                  >
                    <p className={`text-sm ${msg.from === 'user' ? 'text-white' : 'text-white'}`}>
                      {msg.text}
                    </p>
                    <span className={`text-xs mt-1 block ${msg.from === 'user' ? 'text-cyan-200' : 'text-slate-500'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/50 transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="p-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MarketingLayout>
  )
}
