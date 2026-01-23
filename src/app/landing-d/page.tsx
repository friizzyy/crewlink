'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  MapPin, ArrowRight, Shield, Clock, Star, Briefcase, 
  Users, Menu, X, Zap, Check, Sparkles, BadgeCheck,
  TrendingUp, DollarSign, CheckCircle2, Play
} from 'lucide-react'

const navigation = [
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Safety', href: '/safety' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Cities', href: '/cities' },
]

// Floating job cards that animate around the hero
const floatingJobs = [
  { id: 1, title: 'Home Cleaning', price: '$120', time: '3 hrs', rating: 4.9, status: 'new', x: 'left-[5%]', y: 'top-[15%]', delay: '0s' },
  { id: 2, title: 'Move Help', price: '$200', time: '4 hrs', rating: 4.8, status: 'urgent', x: 'right-[8%]', y: 'top-[20%]', delay: '1s' },
  { id: 3, title: 'Furniture Assembly', price: '$85', time: '2 hrs', rating: 5.0, status: 'new', x: 'left-[2%]', y: 'bottom-[30%]', delay: '2s' },
  { id: 4, title: 'Yard Work', price: '$95', time: '2.5 hrs', rating: 4.7, status: 'completed', x: 'right-[5%]', y: 'bottom-[25%]', delay: '3s' },
]

// Orbiting worker avatars
const orbitingWorkers = [
  { id: 1, name: 'Sarah K.', rating: 4.9, jobs: 142, color: 'from-cyan-400 to-blue-500', orbitClass: 'animate-orbit' },
  { id: 2, name: 'Marcus J.', rating: 4.8, jobs: 89, color: 'from-purple-400 to-pink-500', orbitClass: 'animate-orbit-reverse' },
  { id: 3, name: 'Elena R.', rating: 5.0, jobs: 203, color: 'from-emerald-400 to-cyan-500', orbitClass: 'animate-orbit-slow' },
]

const categories = [
  { name: 'Cleaning', icon: '🧹', jobs: 1240, gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Moving', icon: '📦', jobs: 890, gradient: 'from-orange-500 to-red-600' },
  { name: 'Handyman', icon: '🔧', jobs: 1560, gradient: 'from-purple-500 to-pink-600' },
  { name: 'Yard Work', icon: '🌱', jobs: 720, gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Assembly', icon: '🪑', jobs: 430, gradient: 'from-amber-500 to-orange-600' },
  { name: 'Events', icon: '🎉', jobs: 280, gradient: 'from-rose-500 to-pink-600' },
]

const features = [
  { icon: Shield, title: 'Verified & Secure', desc: 'Every worker is background-checked and identity verified', gradient: 'from-emerald-400 to-cyan-500' },
  { icon: Zap, title: 'Instant Matching', desc: 'AI connects you with the perfect match in minutes', gradient: 'from-amber-400 to-orange-500' },
  { icon: Clock, title: 'Flexible Scheduling', desc: 'Book on your timeline, even same-day service', gradient: 'from-violet-400 to-purple-500' },
  { icon: DollarSign, title: 'Fair Pricing', desc: 'Transparent rates with no hidden fees', gradient: 'from-cyan-400 to-blue-500' },
]

const stats = [
  { value: '50K+', label: 'Jobs Done', icon: CheckCircle2 },
  { value: '15K+', label: 'Pro Workers', icon: Users },
  { value: '4.8', label: 'Avg Rating', icon: Star },
  { value: '98%', label: 'Happy Clients', icon: TrendingUp },
]

export default function LandingPageD() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeWorkers, setActiveWorkers] = useState(2847)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setActiveWorkers(prev => prev + Math.floor(Math.random() * 5) - 2)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px] animate-pulse-soft" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[180px] animate-pulse-soft" style={{ animationDelay: '2s' }} />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating particles */}
        {mounted && [...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-particle-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-2xl border-b border-cyan-500/10" />
        <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity animate-glow-pulse" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">CrewLink</span>
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
              <Link href="/create-account" className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="relative block px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl">
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
          {/* Floating Job Cards - Animated */}
          {mounted && floatingJobs.map((job) => (
            <div
              key={job.id}
              className={`absolute ${job.x} ${job.y} hidden lg:block animate-float z-10`}
              style={{ animationDelay: job.delay }}
            >
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative bg-slate-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 w-56 hover:border-cyan-500/50 transition-all hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-white">{job.title}</span>
                    {job.status === 'new' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 rounded-full animate-pulse-soft">New</span>
                    )}
                    {job.status === 'urgent' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 rounded-full animate-pulse-soft">Urgent</span>
                    )}
                    {job.status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-400 font-bold">{job.price}</span>
                    <span className="text-slate-500">{job.time}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs text-slate-400">{job.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="text-center max-w-4xl mx-auto">
            {/* Live indicator */}
            <div className={`inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-full mb-8 ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-slate-300">
                <span className="text-emerald-400 font-semibold">{activeWorkers.toLocaleString()}</span> workers online now
              </span>
            </div>

            {/* Main headline */}
            <h1 className={`font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[0.9] ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <span className="text-white">Get help.</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">Find work.</span>
              <br />
              <span className="text-white">Build trust.</span>
            </h1>

            {/* Subheadline */}
            <p className={`mt-8 text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              The marketplace where verified local workers meet people who need help. Cleaning, moving, handyman, and more.
            </p>

            {/* CTA Buttons */}
            <div className={`mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <Link href="/create-account?mode=hire" className="group relative w-full sm:w-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl group-hover:from-cyan-400 group-hover:to-blue-500 transition-all">
                  <Briefcase className="w-5 h-5" />
                  Post a Job
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/create-account?mode=work" className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-cyan-500/30 transition-all">
                <Users className="w-5 h-5" />
                Find Work
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className={`mt-12 flex flex-wrap items-center justify-center gap-8 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Shield className="w-5 h-5 text-cyan-500" />
                <span>Background checked</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <BadgeCheck className="w-5 h-5 text-cyan-500" />
                <span>Secure payments</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Sparkles className="w-5 h-5 text-cyan-500" />
                <span>AI-powered matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`text-center ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: `${0.1 * i}s` }}>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 mb-4">
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
              Popular categories
            </h2>
            <p className={`text-lg text-slate-400 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              Find help for any task, big or small
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, i) => (
              <Link
                key={category.name}
                href={`/app/search?category=${category.name.toLowerCase()}`}
                className={`group relative p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all duration-500 overflow-hidden ${mounted ? 'animate-pop-in' : 'opacity-0'}`}
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                {/* Glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                
                <div className="relative">
                  <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                  <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                  <p className="text-sm text-slate-500">{category.jobs.toLocaleString()} jobs</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 border-t border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Why choose CrewLink?
            </h2>
            <p className="text-lg text-slate-400">
              Built with trust and safety at the core
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group relative p-8 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all duration-500 ${mounted ? 'animate-card-enter' : 'opacity-0'}`}
                style={{ animationDelay: `${0.15 * i}s` }}
              >
                {/* Animated border glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-4xl">
            {/* Background with animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-600 to-purple-700 animate-gradient-shift bg-[length:200%_200%]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]" />
            
            <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to get started?
              </h2>
              <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl mx-auto">
                Join thousands of people finding help and work in their local community.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/create-account?mode=hire" className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-cyan-600 bg-white rounded-2xl hover:bg-slate-50 transition-colors">
                  <Briefcase className="w-5 h-5" />
                  Hire Help
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/create-account?mode=work" className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl hover:bg-white/30 transition-colors">
                  <Users className="w-5 h-5" />
                  Find Work
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
