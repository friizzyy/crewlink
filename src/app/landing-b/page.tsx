'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MapPin, ArrowRight, Shield, Clock, Star, Briefcase, 
  Users, Menu, X, Zap, ChevronDown, Play, BadgeCheck,
  Sparkles, ArrowUpRight, MousePointer2
} from 'lucide-react'

const navigation = [
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Safety', href: '/safety' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Cities', href: '/cities' },
]

const categories = [
  { name: 'Cleaning', icon: '🧹', jobs: '1.2K', trending: true },
  { name: 'Moving', icon: '📦', jobs: '890' },
  { name: 'Handyman', icon: '🔧', jobs: '1.5K', trending: true },
  { name: 'Yard Work', icon: '🌱', jobs: '720' },
  { name: 'Assembly', icon: '🪑', jobs: '430' },
  { name: 'Events', icon: '🎉', jobs: '280' },
]

const testimonials = [
  {
    quote: 'CrewLink transformed how I run my property management business. Finding reliable help used to take days—now it takes minutes.',
    author: 'Jennifer M.',
    role: 'Property Manager',
    company: 'Bay Area Properties',
    rating: 5,
  },
  {
    quote: 'I went from struggling to find clients to being fully booked within my first month. The platform just works.',
    author: 'Carlos R.',
    role: 'Professional Cleaner',
    earnings: '$4,200/mo avg',
    rating: 5,
  },
  {
    quote: 'The background checks and secure payments give me complete peace of mind. I recommend CrewLink to everyone.',
    author: 'Michael T.',
    role: 'Homeowner',
    tasks: '23 jobs completed',
    rating: 5,
  },
]

const metrics = [
  { label: 'Jobs completed', value: '50K+' },
  { label: 'Verified workers', value: '15K+' },
  { label: 'Cities', value: '120+' },
  { label: 'Average rating', value: '4.8' },
]

export default function LandingPageB() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5" />
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="font-display text-2xl font-bold tracking-tight">CrewLink</span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/sign-in"
                className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/create-account"
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <span className="relative block px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all">
                  Get Started
                </span>
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden relative bg-slate-900/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
                <Link href="/sign-in" className="block px-4 py-3 text-base font-medium text-slate-300 hover:bg-white/5 rounded-xl">
                  Sign In
                </Link>
                <Link href="/create-account" className="block w-full text-center px-4 py-3 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0">
          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
          
          {/* Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
          
          {/* Radial fade */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0f172a_70%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full mb-10 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
              <span className="text-sm font-medium text-slate-300">
                Now in <span className="text-cyan-400">120+ cities</span> nationwide
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.95]">
              <span className="block text-white">The future of</span>
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">local work</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Connect with verified workers in your area. Get things done with trust, speed, and complete transparency.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/create-account?mode=hire"
                className="group relative w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <span className="relative flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl hover:from-cyan-400 hover:to-blue-500 transition-all">
                  <Briefcase className="w-5 h-5" />
                  Post a Job
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/create-account?mode=work"
                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white border border-white/20 rounded-2xl hover:bg-white/5 hover:border-white/30 transition-all"
              >
                <Users className="w-5 h-5" />
                Find Work
                <ArrowUpRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </Link>
            </div>

            {/* Metrics */}
            <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8">
              {metrics.map((metric) => (
                <div key={metric.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <span className="text-xs font-medium tracking-wider uppercase">Scroll</span>
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">Popular Services</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold">
                Find help for <span className="text-cyan-400">anything</span>
              </h2>
            </div>
            <Link href="/work/map" className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <span className="font-medium">View all categories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/work/map?category=${category.name.toLowerCase()}`}
                className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300"
              >
                {category.trending && (
                  <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-xs font-semibold">
                    Hot
                  </div>
                )}
                <span className="text-4xl mb-4 block">{category.icon}</span>
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{category.name}</h3>
                <p className="text-sm text-slate-500">{category.jobs} jobs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Built for Trust</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6">
                Safety and security at every step
              </h2>
              <p className="text-xl text-slate-400 mb-10">
                We&apos;ve built CrewLink from the ground up with trust as our foundation. Every worker is verified, every payment is protected.
              </p>

              <div className="space-y-6">
                {[
                  { icon: BadgeCheck, title: 'Identity Verification', desc: 'Every worker passes ID verification and background checks.' },
                  { icon: Shield, title: 'Secure Payments', desc: 'Your payment is protected until the job is complete.' },
                  { icon: Zap, title: 'Real-time Tracking', desc: 'Know exactly when your worker arrives and track progress.' },
                ].map((feature) => (
                  <div key={feature.title} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                      <p className="text-slate-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                {/* Mock verification card */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 mb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-bold">
                      MJ
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Marcus Johnson</div>
                      <div className="text-slate-400">Professional Handyman</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                      <BadgeCheck className="w-4 h-4" />
                      ID Verified
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                      <Shield className="w-4 h-4" />
                      Background Check
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
                      <Star className="w-4 h-4 fill-current" />
                      4.9 Rating
                    </span>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-400">Payment Protected</span>
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">$175.00</div>
                  <div className="text-sm text-slate-500">Released when job is complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl sm:text-5xl font-bold">
              How it <span className="text-cyan-400">works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Hire Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 md:p-10 bg-white/5 border border-white/10 rounded-3xl hover:border-cyan-500/30 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-8 shadow-lg shadow-cyan-500/30">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-8">Need to hire?</h3>
                
                <div className="space-y-6">
                  {[
                    { num: '01', title: 'Post your job', desc: 'Describe what you need in detail. Our AI helps clarify scope.' },
                    { num: '02', title: 'Review & compare', desc: 'See verified workers, their ratings, reviews, and bids.' },
                    { num: '03', title: 'Book & track', desc: 'Confirm, pay securely, and track progress in real-time.' },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-5">
                      <span className="text-4xl font-bold text-cyan-500/30">{step.num}</span>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                        <p className="text-slate-400 text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/create-account?mode=hire" className="mt-10 inline-flex items-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                  Post a job now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Work Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-8 md:p-10 bg-white/5 border border-white/10 rounded-3xl hover:border-purple-500/30 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/30">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-8">Looking for work?</h3>
                
                <div className="space-y-6">
                  {[
                    { num: '01', title: 'Create your profile', desc: 'Add your skills, rates, availability, and service area.' },
                    { num: '02', title: 'Discover opportunities', desc: 'Browse the map, get matched, receive instant alerts.' },
                    { num: '03', title: 'Earn & grow', desc: 'Complete jobs, build your reputation, get paid fast.' },
                  ].map((step) => (
                    <div key={step.num} className="flex gap-5">
                      <span className="text-4xl font-bold text-purple-500/30">{step.num}</span>
                      <div>
                        <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                        <p className="text-slate-400 text-sm">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/create-account?mode=work" className="mt-10 inline-flex items-center gap-2 text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                  Start earning
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/30 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold">
              Trusted by <span className="text-cyan-400">thousands</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="relative group p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-lg font-bold text-white">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
                {(testimonial.earnings || testimonial.tasks || testimonial.company) && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="text-sm text-cyan-400 font-medium">
                      {testimonial.earnings || testimonial.tasks || testimonial.company}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-slate-400 mb-12">
            Join 50,000+ people finding work and getting things done on CrewLink
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/create-account" className="group relative w-full sm:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2 px-10 py-5 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl hover:from-cyan-400 hover:to-blue-500 transition-all">
                Create free account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link href="/how-it-works" className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 text-lg font-semibold text-white border border-white/20 rounded-2xl hover:bg-white/5 transition-all">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4 text-slate-400">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/how-it-works" className="text-slate-500 hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="text-slate-500 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/safety" className="text-slate-500 hover:text-white transition-colors">Safety</Link></li>
                <li><Link href="/cities" className="text-slate-500 hover:text-white transition-colors">Cities</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-400">Workers</h4>
              <ul className="space-y-3">
                <li><Link href="/create-account?mode=work" className="text-slate-500 hover:text-white transition-colors">Become a Worker</Link></li>
                <li><Link href="/help/workers" className="text-slate-500 hover:text-white transition-colors">Resources</Link></li>
                <li><Link href="/help/earnings" className="text-slate-500 hover:text-white transition-colors">Earnings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-400">Hirers</h4>
              <ul className="space-y-3">
                <li><Link href="/create-account?mode=hire" className="text-slate-500 hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="/help/hiring" className="text-slate-500 hover:text-white transition-colors">Hiring Guide</Link></li>
                <li><Link href="/help/business" className="text-slate-500 hover:text-white transition-colors">Business</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-slate-400">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-slate-500 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/help/contact" className="text-slate-500 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/help/trust" className="text-slate-500 hover:text-white transition-colors">Trust & Safety</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold">CrewLink</span>
            </div>
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} CrewLink. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
