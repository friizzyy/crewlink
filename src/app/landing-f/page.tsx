'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MapPin, ArrowRight, Shield, Clock, Star, Briefcase, 
  Users, Menu, X, Zap, BadgeCheck, Sparkles, CheckCircle2,
  TrendingUp, DollarSign, Heart, Award, Flame, Rocket
} from 'lucide-react'

const navigation = [
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Safety', href: '/safety' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Cities', href: '/cities' },
]

// Floating notification cards
const notifications = [
  { id: 1, type: 'job', title: 'New Job Posted', subtitle: 'Deep Cleaning • $150', icon: Briefcase, color: 'from-cyan-500 to-blue-500', position: 'top-32 left-4 lg:left-[8%]' },
  { id: 2, type: 'match', title: 'Perfect Match!', subtitle: 'Sarah K. • 4.9★', icon: Sparkles, color: 'from-purple-500 to-pink-500', position: 'top-48 right-4 lg:right-[5%]' },
  { id: 3, type: 'complete', title: 'Job Completed', subtitle: '+$200 earned', icon: CheckCircle2, color: 'from-emerald-500 to-teal-500', position: 'bottom-48 left-4 lg:left-[3%]' },
  { id: 4, type: 'review', title: '5-Star Review!', subtitle: '"Absolutely amazing work!"', icon: Star, color: 'from-amber-500 to-orange-500', position: 'bottom-32 right-4 lg:right-[10%]' },
]

// Orbiting icons around the main content
const orbitIcons = [
  { icon: '🧹', size: 'w-12 h-12', delay: '0s', duration: '20s' },
  { icon: '📦', size: 'w-10 h-10', delay: '3s', duration: '25s' },
  { icon: '🔧', size: 'w-14 h-14', delay: '6s', duration: '22s' },
  { icon: '🌱', size: 'w-10 h-10', delay: '9s', duration: '28s' },
  { icon: '🎉', size: 'w-12 h-12', delay: '12s', duration: '24s' },
]

const categories = [
  { name: 'Cleaning', icon: '🧹', jobs: 1240, popular: true },
  { name: 'Moving', icon: '📦', jobs: 890 },
  { name: 'Handyman', icon: '🔧', jobs: 1560, popular: true },
  { name: 'Yard Work', icon: '🌱', jobs: 720 },
  { name: 'Assembly', icon: '🪑', jobs: 430 },
  { name: 'Events', icon: '🎉', jobs: 280 },
]

const benefits = [
  { 
    title: 'For People Who Need Help',
    items: [
      { icon: Zap, text: 'Get matched in minutes, not hours' },
      { icon: Shield, text: 'Every worker is verified & background-checked' },
      { icon: Heart, text: 'Satisfaction guaranteed or your money back' },
      { icon: Clock, text: 'Same-day service available' },
    ],
    cta: 'Post a Job',
    href: '/create-account?mode=hire',
    gradient: 'from-cyan-500 to-blue-600',
  },
  { 
    title: 'For People Who Want to Work',
    items: [
      { icon: DollarSign, text: 'Set your own rates and schedule' },
      { icon: TrendingUp, text: 'Build your reputation with reviews' },
      { icon: Award, text: 'Earn badges and level up' },
      { icon: Rocket, text: 'Instant payouts, no waiting' },
    ],
    cta: 'Start Working',
    href: '/create-account?mode=work',
    gradient: 'from-purple-500 to-pink-600',
  },
]

const testimonials = [
  { quote: 'Found a cleaner in 10 minutes. She was incredible!', author: 'Emily R.', role: 'Homeowner', rating: 5 },
  { quote: 'I made $3,200 my first month. Life-changing.', author: 'Marcus D.', role: 'Pro Worker', rating: 5 },
  { quote: 'The verification process gave me total peace of mind.', author: 'Sarah L.', role: 'Property Manager', rating: 5 },
]

const stats = [
  { value: '50K+', label: 'Jobs Completed', icon: CheckCircle2 },
  { value: '15K+', label: 'Pro Workers', icon: Users },
  { value: '4.8', label: 'Average Rating', icon: Star },
  { value: '$2.1M', label: 'Earned by Workers', icon: DollarSign },
]

export default function LandingPageF() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    setMounted(true)
    
    // Rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Aurora gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Animated aurora waves */}
        <div 
          className="absolute inset-0 opacity-30 animate-aurora"
          style={{
            background: 'linear-gradient(45deg, transparent 0%, rgba(6, 182, 212, 0.1) 25%, rgba(139, 92, 246, 0.15) 50%, rgba(6, 182, 212, 0.1) 75%, transparent 100%)',
            backgroundSize: '400% 400%',
          }}
        />
        <div 
          className="absolute inset-0 opacity-20 animate-aurora"
          style={{
            background: 'linear-gradient(-45deg, transparent 0%, rgba(139, 92, 246, 0.1) 25%, rgba(236, 72, 153, 0.1) 50%, rgba(6, 182, 212, 0.1) 75%, transparent 100%)',
            backgroundSize: '400% 400%',
            animationDelay: '2s',
          }}
        />
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-pink-500/5 rounded-full blur-[180px] animate-pulse-soft" style={{ animationDelay: '4s' }} />
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] opacity-50" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xl border-b border-white/5" />
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity animate-gradient-shift bg-[length:200%_auto]" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center animate-gradient-shift bg-[length:200%_auto]">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">CrewLink</span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/sign-in" className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/create-account" className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="relative block px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 transition-all">
                  Get Started
                </span>
              </Link>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden relative bg-slate-900/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="block px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
                <Link href="/sign-in" className="block px-4 py-3 text-base font-medium text-slate-300 hover:bg-white/5 rounded-xl">Sign In</Link>
                <Link href="/create-account" className="block w-full text-center px-4 py-3 text-base font-semibold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Floating notification cards */}
        {mounted && notifications.map((notif, i) => (
          <div
            key={notif.id}
            className={`absolute ${notif.position} hidden lg:block animate-float z-10`}
            style={{ animationDelay: `${i * 1.5}s`, animationDuration: `${5 + i}s` }}
          >
            <div className={`relative group bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all hover:scale-105 animate-bounce-gentle`} style={{ animationDelay: `${i * 0.5}s` }}>
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${notif.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`} />
              
              <div className="relative flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${notif.color} flex items-center justify-center`}>
                  <notif.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{notif.title}</div>
                  <div className="text-xs text-slate-400">{notif.subtitle}</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Animated badge */}
            <div className={`inline-flex items-center gap-3 px-5 py-2.5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full mb-8 ${mounted ? 'animate-bounce-in' : 'opacity-0'}`}>
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-400">Hot</span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <span className="text-sm text-slate-300">3,847 jobs posted today</span>
            </div>

            {/* Main headline with gradient animation */}
            <h1 className={`font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.95] ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
              <span className="text-white">Where help</span>
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
                  finds you
                </span>
                {/* Underline decoration */}
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path 
                    d="M2 10C50 2 100 2 150 6C200 10 250 10 298 4" 
                    stroke="url(#underline-gradient)" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    className="animate-draw"
                  />
                  <defs>
                    <linearGradient id="underline-gradient" x1="0" y1="0" x2="300" y2="0">
                      <stop stopColor="#22D3EE" />
                      <stop offset="0.5" stopColor="#A855F7" />
                      <stop offset="1" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`mt-10 text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              The magical marketplace connecting local workers with people who need help. Fast, trusted, and surprisingly delightful.
            </p>

            {/* CTA Buttons */}
            <div className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <Link href="/create-account?mode=hire" className="group relative w-full sm:w-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl group-hover:from-cyan-400 group-hover:via-purple-400 group-hover:to-pink-400 transition-all">
                  <Briefcase className="w-5 h-5" />
                  Post a Job
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/create-account?mode=work" className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all">
                <DollarSign className="w-5 h-5" />
                Start Earning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className={`mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span>100% verified workers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>4 minute avg. match time</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Heart className="w-5 h-5 text-pink-500" />
                <span>98% satisfaction rate</span>
              </div>
            </div>

            {/* Animated testimonial */}
            <div className={`mt-16 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
                <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl px-8 py-6">
                  <div className="flex items-center gap-1 justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-lg text-white font-medium mb-3 transition-all duration-500">
                    &quot;{testimonials[activeTestimonial].quote}&quot;
                  </p>
                  <p className="text-sm text-slate-400">
                    {testimonials[activeTestimonial].author} • {testimonials[activeTestimonial].role}
                  </p>
                  {/* Dots indicator */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveTestimonial(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === activeTestimonial ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/50'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div 
                key={stat.label} 
                className={`text-center ${mounted ? 'animate-pop-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 mb-4">
                  <stat.icon className="w-7 h-7 text-cyan-400" />
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`font-display text-4xl sm:text-5xl font-bold text-white mb-4 ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
              What do you need?
            </h2>
            <p className={`text-lg text-slate-400 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              Pick a category to get started
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, i) => (
              <Link
                key={category.name}
                href={`/app/search?category=${category.name.toLowerCase()}`}
                className={`group relative p-6 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/5 hover:border-white/20 transition-all duration-500 ${mounted ? 'animate-bounce-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                {/* Animated gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 rounded-3xl transition-all duration-500" />
                
                {/* Popular badge */}
                {category.popular && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-[10px] font-bold text-white animate-bounce-gentle">
                    Popular
                  </div>
                )}
                
                <div className="relative text-center">
                  <span className="text-5xl mb-4 block group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300">{category.icon}</span>
                  <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                  <p className="text-sm text-slate-500">{category.jobs.toLocaleString()} jobs</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Two Cards */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, i) => (
              <div
                key={benefit.title}
                className={`group relative bg-slate-900/50 backdrop-blur-sm rounded-4xl border border-white/5 p-8 lg:p-10 hover:border-white/10 transition-all ${mounted ? 'animate-card-enter' : 'opacity-0'}`}
                style={{ animationDelay: `${0.2 * i}s` }}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 rounded-4xl transition-opacity duration-500`} />
                
                <h3 className="text-2xl font-bold text-white mb-8">{benefit.title}</h3>
                
                <div className="space-y-5 mb-10">
                  {benefit.items.map((item, j) => (
                    <div 
                      key={item.text} 
                      className={`flex items-center gap-4 ${mounted ? 'animate-slide-in-left' : 'opacity-0'}`}
                      style={{ animationDelay: `${0.3 + 0.1 * j}s` }}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center shrink-0`}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-slate-300">{item.text}</span>
                    </div>
                  ))}
                </div>
                
                <Link href={benefit.href} className={`group/btn inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${benefit.gradient} rounded-2xl font-semibold text-white hover:opacity-90 transition-opacity`}>
                  {benefit.cta}
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-4xl">
            {/* Animated aurora background */}
            <div 
              className="absolute inset-0 animate-aurora"
              style={{
                background: 'linear-gradient(45deg, #0891B2 0%, #7C3AED 25%, #DB2777 50%, #7C3AED 75%, #0891B2 100%)',
                backgroundSize: '400% 400%',
              }}
            />
            <div className="absolute inset-0 bg-slate-950/50" />
            
            {/* Content */}
            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium text-white">Join 50,000+ happy users</span>
              </div>
              
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to experience magic?
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl mx-auto">
                Join the community where help is always just a tap away.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/create-account?mode=hire" className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-slate-900 bg-white rounded-2xl hover:bg-slate-100 transition-colors">
                  <Briefcase className="w-5 h-5" />
                  Hire Help
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/create-account?mode=work" className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/30 transition-colors">
                  <DollarSign className="w-5 h-5" />
                  Start Earning
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">CrewLink</span>
            </div>
            <div className="flex items-center gap-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="text-sm text-slate-500 hover:text-white transition-colors">
                  {item.name}
                </Link>
              ))}
            </div>
            <p className="text-sm text-slate-600">© 2026 CrewLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
