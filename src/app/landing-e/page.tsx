'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  MapPin, ArrowRight, Shield, Clock, Star, Briefcase,
  Users, Menu, X, Zap, BadgeCheck, Sparkles, CheckCircle2,
  TrendingUp, DollarSign, Compass, Target, Award, Wrench,
  Package, Leaf, Armchair, PartyPopper, Truck, PawPrint
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const navigation = [
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Safety', href: '/safety' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Cities', href: '/cities' },
]

// Animated job feed cards
const jobFeed = [
  { id: 1, type: 'post', title: 'Deep Cleaning', area: 'Downtown SF', price: '$180', time: '2 min ago', urgent: true },
  { id: 2, type: 'match', worker: 'Maria G.', rating: 4.9, specialty: 'Cleaning Pro' },
  { id: 3, type: 'complete', title: 'Furniture Assembly', earnings: '$95', duration: '1.5 hrs' },
  { id: 4, type: 'post', title: 'Moving Help', area: 'Mission District', price: '$250', time: '5 min ago' },
  { id: 5, type: 'match', worker: 'James K.', rating: 4.8, specialty: 'Moving Expert' },
  { id: 6, type: 'complete', title: 'Yard Maintenance', earnings: '$120', duration: '2 hrs' },
]

// Slide-in worker profiles
const topWorkers = [
  { id: 1, name: 'Sarah Chen', specialty: 'Home Cleaning', rating: 4.97, jobs: 234, earnings: '$12.4K', avatar: 'S', badge: 'Elite', direction: 'left' },
  { id: 2, name: 'Marcus Johnson', specialty: 'Moving & Heavy Lifting', rating: 4.92, jobs: 189, earnings: '$18.2K', avatar: 'M', badge: 'Top Rated', direction: 'right' },
  { id: 3, name: 'Elena Rodriguez', specialty: 'Event Setup', rating: 4.98, jobs: 312, earnings: '$21.8K', avatar: 'E', badge: 'Superstar', direction: 'left' },
]

const categories: { name: string; Icon: LucideIcon; count: string; hot?: boolean; gradient: string }[] = [
  { name: 'Cleaning', Icon: Sparkles, count: '1.2K', hot: true, gradient: 'from-blue-500 to-cyan-400' },
  { name: 'Moving', Icon: Package, count: '890', gradient: 'from-orange-500 to-amber-400' },
  { name: 'Handyman', Icon: Wrench, count: '1.5K', hot: true, gradient: 'from-violet-500 to-purple-400' },
  { name: 'Yard Work', Icon: Leaf, count: '720', gradient: 'from-green-500 to-emerald-400' },
  { name: 'Assembly', Icon: Armchair, count: '430', gradient: 'from-rose-500 to-pink-400' },
  { name: 'Events', Icon: PartyPopper, count: '280', gradient: 'from-yellow-500 to-orange-400' },
  { name: 'Delivery', Icon: Truck, count: '560', gradient: 'from-indigo-500 to-blue-400' },
  { name: 'Pet Care', Icon: PawPrint, count: '340', gradient: 'from-teal-500 to-emerald-400' },
]

const processSteps = [
  { num: '01', title: 'Post Your Job', desc: 'Describe what you need help with', icon: Target },
  { num: '02', title: 'Get Matched', desc: 'AI finds the perfect workers', icon: Compass },
  { num: '03', title: 'Work Gets Done', desc: 'Sit back and relax', icon: CheckCircle2 },
  { num: '04', title: 'Pay Securely', desc: 'Simple, protected payments', icon: Shield },
]

const stats = [
  { label: 'Active Jobs', value: '3,847', change: '+12%', up: true },
  { label: 'Workers Online', value: '2,156', change: '+8%', up: true },
  { label: 'Avg. Match Time', value: '4.2m', change: '-15%', up: true },
  { label: 'Satisfaction', value: '98.4%', change: '+2%', up: true },
]

export default function LandingPageE() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const [currentFeedIndex, setCurrentFeedIndex] = useState(0)
  
  useEffect(() => {
    setMounted(true)
    
    // Stagger card animations
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleCards(prev => {
          if (prev.length >= 8) {
            clearInterval(interval)
            return prev
          }
          return [...prev, prev.length]
        })
      }, 100)
      return () => clearInterval(interval)
    }, 500)

    // Rotate feed
    const feedInterval = setInterval(() => {
      setCurrentFeedIndex(prev => (prev + 1) % jobFeed.length)
    }, 3000)

    return () => {
      clearTimeout(timer)
      clearInterval(feedInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Matrix Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Animated grid lines */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />
          {/* Scanning line effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-40 animate-slide-down" style={{ animationDuration: '8s', animationIterationCount: 'infinite' }} />
        </div>
        
        {/* Glow spots */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl border-b border-cyan-500/10" />
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center border border-cyan-400/30">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="font-display text-2xl font-bold tracking-tight">CrewLink</span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link href="/sign-in" className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/create-account" className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="relative block px-6 py-2.5 text-sm font-semibold bg-slate-950 m-[1px] rounded-[11px] group-hover:bg-transparent transition-colors">
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
          <div className="md:hidden relative bg-slate-900/95 backdrop-blur-xl border-t border-cyan-500/10">
            <div className="px-4 py-6 space-y-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href} className="block px-4 py-3 text-base font-medium text-slate-300 hover:text-cyan-400 hover:bg-white/5 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
                <Link href="/sign-in" className="block px-4 py-3 text-base font-medium text-slate-300 hover:bg-white/5 rounded-xl">Sign In</Link>
                <Link href="/create-account" className="block w-full text-center px-4 py-3 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              {/* Status bar */}
              <div className={`inline-flex items-center gap-4 px-4 py-2 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-full mb-8 ${mounted ? 'animate-slide-in-left' : 'opacity-0'}`}>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-medium text-emerald-400">LIVE</span>
                </div>
                <div className="h-4 w-px bg-slate-700" />
                <span className="text-sm text-slate-400">3,847 active jobs right now</span>
              </div>

              {/* Headline with typing effect */}
              <h1 className={`font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
                <span className="text-white">The future of</span>
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">local work</span>
                  <span className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-2xl -z-10" />
                </span>
                <br />
                <span className="text-white">is here.</span>
              </h1>

              {/* Subheadline */}
              <p className={`mt-8 text-xl text-slate-400 max-w-lg ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                AI-powered matching. Verified workers. Instant connections. The smartest way to hire local help or find flexible work.
              </p>

              {/* CTA Buttons */}
              <div className={`mt-10 flex flex-col sm:flex-row gap-4 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
                <Link href="/create-account?mode=hire" className="group relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Animated border beam */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute w-20 h-20 bg-white/30 blur-xl -top-10 -left-10 group-hover:left-full group-hover:top-full transition-all duration-1000" />
                  </div>
                  <span className="relative flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold">
                    <Briefcase className="w-5 h-5" />
                    Post a Job
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                
                <Link href="/create-account?mode=work" className="group relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 border border-cyan-500/30 rounded-2xl group-hover:border-cyan-500/60 transition-colors" />
                  <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
                  <span className="relative flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-cyan-400">
                    <Users className="w-5 h-5" />
                    Find Work
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>

              {/* Stats row */}
              <div className={`mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-1 justify-center sm:justify-start">
                      {stat.label}
                      <span className={`text-xs ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>{stat.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Animated Feed */}
            <div className="relative">
              {/* Live feed container */}
              <div className={`relative bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-6 ${mounted ? 'animate-slide-in-right' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-slate-400">Live Activity Feed</span>
                  </div>
                  <span className="text-xs text-slate-600">Updated just now</span>
                </div>

                {/* Feed items with slide animation */}
                <div className="space-y-4 h-[360px] overflow-hidden">
                  {jobFeed.map((item, i) => (
                    <div
                      key={item.id}
                      className={`transform transition-all duration-500 ${
                        i === currentFeedIndex ? 'opacity-100 translate-y-0' : 
                        i === (currentFeedIndex + 1) % jobFeed.length ? 'opacity-70 translate-y-0' :
                        i === (currentFeedIndex + 2) % jobFeed.length ? 'opacity-40 translate-y-0' :
                        'opacity-0 -translate-y-4'
                      }`}
                      style={{ 
                        order: (i - currentFeedIndex + jobFeed.length) % jobFeed.length,
                        display: Math.abs((i - currentFeedIndex + jobFeed.length) % jobFeed.length) < 4 ? 'block' : 'none'
                      }}
                    >
                      {item.type === 'post' && (
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 hover:border-cyan-500/30 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{item.title}</span>
                                {item.urgent && <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 rounded-full">Urgent</span>}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                <MapPin className="w-3 h-3" />
                                <span>{item.area}</span>
                                <span>•</span>
                                <span>{item.time}</span>
                              </div>
                            </div>
                            <span className="text-lg font-bold text-emerald-400">{item.price}</span>
                          </div>
                        </div>
                      )}
                      {item.type === 'match' && (
                        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold">
                              {item.worker?.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{item.worker}</span>
                                <BadgeCheck className="w-4 h-4 text-cyan-400" />
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-slate-400">{item.rating}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-cyan-400">{item.specialty}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {item.type === 'complete' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div>
                                <span className="font-semibold text-white">{item.title}</span>
                                <div className="text-sm text-slate-500">Completed in {item.duration}</div>
                              </div>
                            </div>
                            <span className="text-lg font-bold text-emerald-400">+{item.earnings}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl animate-float" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl animate-float" style={{ animationDelay: '2s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Categories - Staggered Grid */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Browse by category
            </h2>
            <p className="text-lg text-slate-400">
              Every type of help you could need
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                href={`/app/search?category=${cat.name.toLowerCase()}`}
                className={`group relative p-6 bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all duration-300 overflow-hidden ${
                  visibleCards.includes(i) ? 'animate-pop-in' : 'opacity-0'
                }`}
              >
                {/* Animated background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
                
                {/* Shine effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                <div className="relative flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <cat.Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{cat.name}</h3>
                      {cat.hot && <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-orange-500/20 text-orange-400 rounded">Hot</span>}
                    </div>
                    <p className="text-sm text-slate-500">{cat.count} jobs</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps - Animated */}
      <section className="relative py-24 border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-400">
              Getting help has never been easier
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            
            {processSteps.map((step, i) => (
              <div
                key={step.num}
                className={`relative text-center ${mounted ? 'animate-card-enter' : 'opacity-0'}`}
                style={{ animationDelay: `${0.2 * i}s` }}
              >
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform" />
                  <div className="absolute inset-0 bg-slate-900 rounded-2xl border border-cyan-500/20" />
                  <div className="relative flex flex-col items-center">
                    <span className="text-xs font-bold text-cyan-400 mb-1">{step.num}</span>
                    <step.icon className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Workers - Slide In */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Top-rated workers
            </h2>
            <p className="text-lg text-slate-400">
              The cream of the crop, ready to help
            </p>
          </div>

          <div className="space-y-6">
            {topWorkers.map((worker, i) => (
              <div
                key={worker.id}
                className={`group relative bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 hover:border-cyan-500/30 transition-all ${
                  mounted ? (worker.direction === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right') : 'opacity-0'
                }`}
                style={{ animationDelay: `${0.2 * i}s` }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                      {worker.avatar}
                    </div>
                    <div className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-[10px] font-bold text-white">
                      {worker.badge}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white">{worker.name}</h3>
                      <BadgeCheck className="w-5 h-5 text-cyan-400" />
                    </div>
                    <p className="text-slate-400">{worker.specialty}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-xl font-bold text-white">{worker.rating}</span>
                      </div>
                      <span className="text-xs text-slate-500">Rating</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl font-bold text-white">{worker.jobs}</span>
                      <span className="block text-xs text-slate-500">Jobs</span>
                    </div>
                    <div className="text-center">
                      <span className="text-xl font-bold text-emerald-400">{worker.earnings}</span>
                      <span className="block text-xs text-slate-500">Earned</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href="/create-account?mode=hire" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all">
                    Hire Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/20">
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse-soft" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
            </div>
            
            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Join the network
              </h2>
              <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-xl mx-auto">
                50,000+ jobs completed. 15,000+ verified workers. Be part of the movement.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/create-account?mode=hire" className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl hover:from-cyan-400 hover:to-blue-500 transition-all">
                  <Briefcase className="w-5 h-5" />
                  Start Hiring
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/create-account?mode=work" className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white border border-white/20 rounded-2xl hover:bg-white/5 transition-colors">
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
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
