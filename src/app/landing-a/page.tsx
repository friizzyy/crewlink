'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  MapPin, ArrowRight, Shield, Clock, Star, Briefcase,
  Users, ChevronRight, Menu, X, Zap, Check, Sparkles,
  TrendingUp, BadgeCheck, Search, Wrench, Package, Leaf,
  Armchair, PartyPopper
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const navigation = [
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Safety', href: '/safety' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Cities', href: '/cities' },
]

const stats = [
  { value: '50K+', label: 'Jobs Completed', icon: Briefcase },
  { value: '15K+', label: 'Verified Workers', icon: BadgeCheck },
  { value: '4.8', label: 'Average Rating', icon: Star },
  { value: '98%', label: 'Satisfaction', icon: TrendingUp },
]

const categories: { name: string; Icon: LucideIcon; jobs: number; color: string }[] = [
  { name: 'Cleaning', Icon: Sparkles, jobs: 1240, color: 'from-blue-500 to-cyan-400' },
  { name: 'Moving', Icon: Package, jobs: 890, color: 'from-orange-500 to-amber-400' },
  { name: 'Handyman', Icon: Wrench, jobs: 1560, color: 'from-violet-500 to-purple-400' },
  { name: 'Yard Work', Icon: Leaf, jobs: 720, color: 'from-green-500 to-emerald-400' },
  { name: 'Assembly', Icon: Armchair, jobs: 430, color: 'from-rose-500 to-pink-400' },
  { name: 'Event Help', Icon: PartyPopper, jobs: 280, color: 'from-yellow-500 to-orange-400' },
]

const features = [
  {
    icon: Shield,
    title: 'Verified & Trusted',
    description: 'Every worker is background-checked and identity verified. Complete peace of mind.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Zap,
    title: 'Instant Matching',
    description: 'AI-powered matching connects you with the right people in minutes, not hours.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Book help on your timeline. Need someone today? We\'ve got you covered.',
    gradient: 'from-violet-500 to-purple-600',
  },
]

const testimonials = [
  {
    quote: 'Found an amazing cleaner within 20 minutes. The whole process was seamless and the quality was exceptional.',
    author: 'Sarah K.',
    role: 'Homeowner',
    rating: 5,
    avatar: 'S',
  },
  {
    quote: 'As a handyman, CrewLink helped me build a steady stream of local clients and grow my business 3x.',
    author: 'Marcus J.',
    role: 'Independent Contractor',
    rating: 5,
    avatar: 'M',
  },
  {
    quote: 'The trust and safety features give me peace of mind every time I hire. Best platform I\'ve used.',
    author: 'David L.',
    role: 'Property Manager',
    rating: 5,
    avatar: 'D',
  },
]

const floatingJobs = [
  { title: 'Deep Clean', price: '$150', distance: '0.8 mi', delay: '0s' },
  { title: 'Move Help', price: '$200', distance: '1.2 mi', delay: '2s' },
  { title: 'Yard Work', price: '$80', distance: '0.5 mi', delay: '4s' },
]

export default function LandingPageA() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeWorkers, setActiveWorkers] = useState(2847)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWorkers(prev => prev + Math.floor(Math.random() * 3) - 1)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">CrewLink</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-500 group-hover:w-full transition-all" />
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/create-account"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl hover:from-brand-500 hover:to-brand-600 transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-xl">
            <div className="px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                <Link href="/sign-in" className="block px-4 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-xl">
                  Sign In
                </Link>
                <Link href="/create-account" className="block w-full text-center px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-32 lg:pt-40 lg:pb-40">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand-100/30 to-accent-100/30 rounded-full blur-3xl" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg border border-slate-100 mb-8 animate-fade-in">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-slate-700">
                  <span className="text-emerald-600 font-semibold">{activeWorkers.toLocaleString()}</span> workers available now
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight animate-fade-up">
                <span className="text-slate-900">Find work.</span>
                <br />
                <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-accent-500 bg-clip-text text-transparent">Hire help.</span>
                <br />
                <span className="text-slate-900">Get it done.</span>
              </h1>

              {/* Subheadline */}
              <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                The trusted marketplace connecting local workers with people who need help. From cleaning to moving, handyman work to events.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <Link
                  href="/create-account?mode=hire"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl hover:from-brand-500 hover:to-brand-600 transition-all shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-1"
                >
                  <Briefcase className="w-5 h-5" />
                  Post a Job
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/create-account?mode=work"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:border-accent-300 hover:bg-accent-50 transition-all"
                >
                  <Users className="w-5 h-5" />
                  Find Work
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Verified workers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BadgeCheck className="w-4 h-4 text-brand-500" />
                  <span>Secure payments</span>
                </div>
              </div>
            </div>

            {/* Right - Interactive Card Stack */}
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {/* Map Preview Card */}
              <div className="absolute top-0 right-0 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="h-64 bg-gradient-to-br from-slate-100 to-slate-200 relative">
                  {/* Fake map with dots */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-brand-500 rounded-full animate-ping" />
                    <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-accent-500 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                    <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-emerald-500 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-5 h-5 text-brand-600" />
                      <span className="font-medium">San Francisco, CA</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Search className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-400">What do you need help with?</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Cleaning', 'Moving', 'Handyman'].map((cat) => (
                      <span key={cat} className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-600">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Job Cards */}
              {floatingJobs.map((job, i) => (
                <div
                  key={job.title}
                  className="absolute bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-48 animate-float"
                  style={{
                    top: `${60 + i * 80}px`,
                    left: `${-20 + i * 30}px`,
                    animationDelay: job.delay,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">{job.title}</span>
                    <span className="text-emerald-600 font-bold">{job.price}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    <span>{job.distance} away</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative py-8 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-3">
                  <stat.icon className="w-6 h-6 text-brand-400" />
                </div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
              Popular categories
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Find help for any task, big or small
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/app/search?category=${category.name.toLowerCase()}`}
                className="group relative p-6 bg-white rounded-2xl border border-slate-200 hover:border-transparent hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                    <category.Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-white transition-colors">{category.name}</h3>
                  <p className="text-sm text-slate-500 group-hover:text-white/80 transition-colors">{category.jobs.toLocaleString()} jobs</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-semibold text-brand-700">Why CrewLink</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
              Built for trust and speed
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative p-8 bg-white rounded-3xl border border-slate-200 hover:border-transparent hover:shadow-2xl transition-all duration-500"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
              How it works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            {/* For Hirers */}
            <div className="relative">
              <div className="absolute top-0 left-8 bottom-0 w-px bg-gradient-to-b from-brand-500 to-brand-100 hidden md:block" />
              
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Need to hire?</h3>
                  <p className="text-slate-500">Get help in 3 easy steps</p>
                </div>
              </div>

              <div className="space-y-8 md:pl-20">
                {[
                  { step: '1', title: 'Post your job', desc: 'Describe what you need, when, and where. Our AI helps clarify scope and suggests fair pricing.' },
                  { step: '2', title: 'Review matches', desc: 'See qualified, verified workers near you. Compare ratings, reviews, experience, and bids.' },
                  { step: '3', title: 'Book & track', desc: 'Message directly, confirm details, and book instantly. Track progress in real-time.' },
                ].map((item) => (
                  <div key={item.step} className="relative flex gap-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-lg shadow-brand-500/30">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-lg text-slate-900 mb-1">{item.title}</div>
                      <div className="text-slate-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For Workers */}
            <div className="relative">
              <div className="absolute top-0 left-8 bottom-0 w-px bg-gradient-to-b from-accent-500 to-accent-100 hidden md:block" />
              
              <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 rounded-2xl bg-accent-100 flex items-center justify-center">
                  <Users className="w-8 h-8 text-accent-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Looking for work?</h3>
                  <p className="text-slate-500">Start earning in 3 easy steps</p>
                </div>
              </div>

              <div className="space-y-8 md:pl-20">
                {[
                  { step: '1', title: 'Create your profile', desc: 'Add your skills, certifications, and experience. Set your rates and service area.' },
                  { step: '2', title: 'Discover jobs', desc: 'Browse the map, filter by category and pay. Get instant notifications for new matches.' },
                  { step: '3', title: 'Work & earn', desc: 'Accept jobs or submit bids. Complete work, get reviewed, and receive secure payments.' },
                ].map((item) => (
                  <div key={item.step} className="relative flex gap-6">
                    <div className="w-10 h-10 rounded-xl bg-accent-500 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-lg shadow-accent-500/30">
                      {item.step}
                    </div>
                    <div>
                      <div className="font-semibold text-lg text-slate-900 mb-1">{item.title}</div>
                      <div className="text-slate-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Loved by thousands
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              See what our community has to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-white/90 text-lg mb-8 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-700" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Ready to get started?
          </h2>
          <p className="mt-6 text-xl text-brand-100">
            Join 50,000+ people finding work and getting help on CrewLink
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/create-account" 
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-brand-700 bg-white rounded-2xl hover:bg-brand-50 transition-all shadow-xl hover:-translate-y-1"
            >
              Create free account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/how-it-works" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4 text-slate-300">Product</h4>
              <ul className="space-y-3 text-slate-500">
                <li><Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/safety" className="hover:text-white transition-colors">Safety</Link></li>
                <li><Link href="/cities" className="hover:text-white transition-colors">Cities</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-300">For Workers</h4>
              <ul className="space-y-3 text-slate-500">
                <li><Link href="/create-account?mode=work" className="hover:text-white transition-colors">Become a Worker</Link></li>
                <li><Link href="/help/workers" className="hover:text-white transition-colors">Worker Resources</Link></li>
                <li><Link href="/help/earnings" className="hover:text-white transition-colors">Earnings Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-300">For Hirers</h4>
              <ul className="space-y-3 text-slate-500">
                <li><Link href="/create-account?mode=hire" className="hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="/help/hiring" className="hover:text-white transition-colors">Hiring Guide</Link></li>
                <li><Link href="/help/business" className="hover:text-white transition-colors">Business Accounts</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-300">Support</h4>
              <ul className="space-y-3 text-slate-500">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/help/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/help/trust" className="hover:text-white transition-colors">Trust & Safety</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">CrewLink</span>
            </div>
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} CrewLink. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
