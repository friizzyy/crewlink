'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MapPin, ArrowRight, Shield, Clock, Star, Briefcase, 
  Users, Menu, X, Zap, Check, Search, MessageSquare,
  DollarSign, CheckCircle, Heart, Truck, Wrench, Leaf,
  Package, Sparkles, ChevronRight, Play
} from 'lucide-react'

const navigation = [
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Safety', href: '/safety' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Cities', href: '/cities' },
]

const categories = [
  { name: 'Cleaning', icon: Sparkles, color: 'bg-sky-100 text-sky-600' },
  { name: 'Moving', icon: Truck, color: 'bg-amber-100 text-amber-600' },
  { name: 'Handyman', icon: Wrench, color: 'bg-rose-100 text-rose-600' },
  { name: 'Yard Work', icon: Leaf, color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Assembly', icon: Package, color: 'bg-violet-100 text-violet-600' },
]

const workers = [
  { name: 'Sarah M.', skill: 'Cleaner', rating: 4.9, jobs: 127, avatar: 'SM', distance: '0.8 mi' },
  { name: 'James K.', skill: 'Handyman', rating: 4.8, jobs: 89, avatar: 'JK', distance: '1.2 mi' },
  { name: 'Maria G.', skill: 'Organizer', rating: 5.0, jobs: 64, avatar: 'MG', distance: '0.5 mi' },
]

const benefits = [
  { icon: Shield, title: 'Verified Workers', desc: 'Every worker passes background checks and ID verification.' },
  { icon: Zap, title: 'Fast Matching', desc: 'Get connected with qualified help in minutes, not days.' },
  { icon: MessageSquare, title: 'Direct Chat', desc: 'Message workers directly to discuss details and timing.' },
  { icon: DollarSign, title: 'Fair Pricing', desc: 'Transparent pricing with no hidden fees. You see what you pay.' },
]

const testimonials = [
  {
    quote: 'Finally, a platform that actually vets its workers. I feel safe hiring through CrewLink every time.',
    author: 'Emily R.',
    location: 'San Francisco',
  },
  {
    quote: 'I tripled my client base in 3 months. The steady work and fair pay changed everything for me.',
    author: 'David T.',
    location: 'Oakland',
  },
]

export default function LandingPageC() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-stone-50 overflow-hidden">
      {/* Warm background texture */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0iI2ZhZjlmNiI+PC9yZWN0Pgo8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9IiNlN2U1ZTQiIG9wYWNpdHk9IjAuNCI+PC9jaXJjbGU+Cjwvc3ZnPg==')] opacity-50 pointer-events-none" />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-stone-50/90 backdrop-blur-xl border-b border-stone-200/50">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-stone-900">CrewLink</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/create-account"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition-colors shadow-sm"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden bg-stone-50 border-t border-stone-200">
            <div className="px-4 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium text-stone-700 hover:bg-stone-100 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-stone-200 mt-4 space-y-2">
                <Link href="/sign-in" className="block px-4 py-3 text-base font-medium text-stone-700 hover:bg-stone-100 rounded-xl">
                  Sign In
                </Link>
                <Link href="/create-account" className="block w-full text-center px-4 py-3 text-base font-semibold text-white bg-stone-900 rounded-xl">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Split Layout */}
      <section className="relative pt-16 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              {/* Social Proof */}
              <div className="flex items-center gap-3 mb-8">
                <div className="flex -space-x-2">
                  {['bg-amber-400', 'bg-rose-400', 'bg-sky-400', 'bg-emerald-400'].map((color, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-stone-50 flex items-center justify-center text-xs font-bold text-white`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-stone-600">
                  <span className="font-semibold text-stone-900">2,847</span> people hired help this week
                </div>
              </div>

              {/* Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-[1.1]">
                Local help,
                <br />
                <span className="text-amber-600">done right.</span>
              </h1>

              {/* Subheadline */}
              <p className="mt-6 text-lg text-stone-600 max-w-lg">
                Find trusted, verified workers in your neighborhood for cleaning, repairs, moving, and more. Or earn money doing what you&apos;re great at.
              </p>

              {/* Search Box */}
              <div className="mt-10 p-2 bg-white rounded-2xl shadow-lg shadow-stone-200/50 border border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3 flex-1 px-4 py-3">
                    <Search className="w-5 h-5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="What do you need help with?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-stone-900 placeholder:text-stone-400 focus:outline-none"
                    />
                  </div>
                  <Link
                    href="/create-account?mode=hire"
                    className="px-6 py-3 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition-colors shadow-sm flex items-center gap-2"
                  >
                    Find Help
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Quick Categories */}
              <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSearchQuery(cat.name)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 ${cat.color}`}
                  >
                    <cat.icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Trust Badges */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-stone-500">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Background checked</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Secure payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>4.8 avg rating</span>
                </div>
              </div>
            </div>

            {/* Right - Map Preview with Cards */}
            <div className="relative h-[500px] lg:h-[600px]">
              {/* Map Container */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl shadow-stone-300/50 border border-stone-200">
                {/* Fake map background */}
                <div className="absolute inset-0 bg-gradient-to-br from-stone-100 to-stone-200">
                  {/* Roads */}
                  <div className="absolute top-1/4 left-0 right-0 h-2 bg-white/60" />
                  <div className="absolute top-2/3 left-0 right-0 h-3 bg-white/70" />
                  <div className="absolute top-0 bottom-0 left-1/3 w-2 bg-white/50" />
                  <div className="absolute top-0 bottom-0 right-1/4 w-3 bg-white/60" />
                  
                  {/* Parks/Green areas */}
                  <div className="absolute top-1/2 left-1/4 w-24 h-20 bg-emerald-200/50 rounded-full blur-md" />
                  <div className="absolute bottom-1/4 right-1/3 w-32 h-24 bg-emerald-200/40 rounded-full blur-md" />
                </div>

                {/* Location Pins */}
                <div className="absolute top-1/4 left-1/3">
                  <div className="relative">
                    <div className="absolute inset-0 w-8 h-8 bg-amber-400 rounded-full animate-ping opacity-30" />
                    <div className="relative w-8 h-8 bg-amber-500 rounded-full shadow-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 right-1/4">
                  <div className="w-6 h-6 bg-rose-400 rounded-full shadow-md flex items-center justify-center">
                    <span className="text-xs font-bold text-white">S</span>
                  </div>
                </div>
                <div className="absolute bottom-1/3 left-1/2">
                  <div className="w-6 h-6 bg-sky-400 rounded-full shadow-md flex items-center justify-center">
                    <span className="text-xs font-bold text-white">J</span>
                  </div>
                </div>
                <div className="absolute top-2/3 right-1/3">
                  <div className="w-6 h-6 bg-emerald-400 rounded-full shadow-md flex items-center justify-center">
                    <span className="text-xs font-bold text-white">M</span>
                  </div>
                </div>

                {/* Your location indicator */}
                <div className="absolute bottom-1/4 left-1/4">
                  <div className="relative">
                    <div className="absolute inset-0 w-12 h-12 bg-blue-400 rounded-full animate-pulse opacity-20" />
                    <div className="relative w-12 h-12 bg-white rounded-full shadow-lg border-4 border-blue-500 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Worker Cards */}
              {workers.map((worker, i) => (
                <div
                  key={worker.name}
                  className="absolute bg-white rounded-2xl shadow-xl border border-stone-100 p-4 w-56 hover:scale-105 transition-transform cursor-pointer"
                  style={{
                    top: i === 0 ? '10%' : i === 1 ? '40%' : '70%',
                    right: i === 0 ? '5%' : i === 1 ? '-5%' : '10%',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                      i === 0 ? 'bg-gradient-to-br from-rose-400 to-rose-500' :
                      i === 1 ? 'bg-gradient-to-br from-sky-400 to-sky-500' :
                      'bg-gradient-to-br from-emerald-400 to-emerald-500'
                    }`}>
                      {worker.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">{worker.name}</div>
                      <div className="text-sm text-stone-500">{worker.skill}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-amber-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-semibold">{worker.rating}</span>
                      <span className="text-stone-400">({worker.jobs})</span>
                    </div>
                    <div className="flex items-center gap-1 text-stone-500">
                      <MapPin className="w-3 h-3" />
                      <span>{worker.distance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900">
              Why people love CrewLink
            </h2>
            <p className="mt-4 text-lg text-stone-600">
              Built from the ground up for trust, simplicity, and reliability
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="p-6 bg-stone-50 rounded-2xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center mb-4 transition-colors">
                  <benefit.icon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-stone-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 bg-stone-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,white_25%,white_26%,transparent_26%,transparent_75%,white_75%,white_76%,transparent_76%)] bg-[size:60px_60px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Illustration */}
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-square max-w-md mx-auto">
                {/* Phone Mockup */}
                <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-700 rounded-[3rem] shadow-2xl border border-stone-600">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-stone-900 rounded-full" />
                  <div className="absolute inset-4 top-16 bg-stone-100 rounded-[2rem] overflow-hidden">
                    {/* App UI */}
                    <div className="h-full flex flex-col">
                      <div className="p-4 bg-white border-b border-stone-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Search className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1 h-10 bg-stone-100 rounded-lg" />
                        </div>
                      </div>
                      <div className="flex-1 bg-stone-200 p-4">
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <div className="w-2/3 h-4 bg-stone-900 rounded mb-2" />
                          <div className="w-1/2 h-3 bg-stone-300 rounded" />
                          <div className="mt-3 flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-amber-400" />
                            <div className="flex-1">
                              <div className="w-20 h-3 bg-stone-400 rounded" />
                              <div className="w-12 h-2 bg-stone-300 rounded mt-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white p-3 rounded-xl shadow-lg">
                  <Check className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-amber-500 text-white px-4 py-2 rounded-xl shadow-lg text-sm font-semibold">
                  $85 earned
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="order-1 lg:order-2">
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                Simple for everyone
              </h2>
              <p className="text-lg text-stone-400 mb-10">
                Whether you&apos;re hiring help or looking for work, CrewLink makes it easy to get started.
              </p>

              <div className="space-y-8">
                {/* Hire Steps */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Need help?</h3>
                  </div>
                  <div className="ml-13 pl-6 border-l border-stone-700 space-y-4">
                    <p className="text-stone-400">Post your job → Get matched → Book a worker → Done!</p>
                    <Link href="/create-account?mode=hire" className="inline-flex items-center gap-2 text-amber-400 font-medium hover:text-amber-300">
                      Post a job <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Work Steps */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Want work?</h3>
                  </div>
                  <div className="ml-13 pl-6 border-l border-stone-700 space-y-4">
                    <p className="text-stone-400">Create profile → Browse jobs → Accept or bid → Earn!</p>
                    <Link href="/create-account?mode=work" className="inline-flex items-center gap-2 text-emerald-400 font-medium hover:text-emerald-300">
                      Start earning <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 bg-amber-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Heart className="w-8 h-8 text-rose-400 mx-auto mb-4" />
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-stone-900">
              Real stories, real results
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="p-8 bg-white rounded-3xl shadow-sm border border-stone-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-lg text-stone-700 mb-6 leading-relaxed">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center font-bold text-stone-600">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900">{testimonial.author}</div>
                    <div className="text-sm text-stone-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 bg-white border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50K+', label: 'Jobs completed' },
              { value: '15K+', label: 'Verified workers' },
              { value: '120+', label: 'Cities' },
              { value: '4.8', label: 'Average rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl sm:text-4xl font-bold text-stone-900">{stat.value}</div>
                <div className="mt-1 text-sm text-stone-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-br from-amber-500 to-orange-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0idHJhbnNwYXJlbnQiPjwvcmVjdD4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4xIj48L2NpcmNsZT4KPC9zdmc+')] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Ready to get started?
          </h2>
          <p className="mt-4 text-xl text-amber-100">
            Join thousands of people finding help and earning money on CrewLink
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/create-account"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-amber-600 bg-white rounded-2xl hover:bg-amber-50 transition-colors shadow-xl"
            >
              Create free account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4 text-stone-400">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/how-it-works" className="text-stone-500 hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="text-stone-500 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/safety" className="text-stone-500 hover:text-white transition-colors">Safety</Link></li>
                <li><Link href="/cities" className="text-stone-500 hover:text-white transition-colors">Cities</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-stone-400">Workers</h4>
              <ul className="space-y-3">
                <li><Link href="/create-account?mode=work" className="text-stone-500 hover:text-white transition-colors">Become a Worker</Link></li>
                <li><Link href="/help/workers" className="text-stone-500 hover:text-white transition-colors">Resources</Link></li>
                <li><Link href="/help/earnings" className="text-stone-500 hover:text-white transition-colors">Earnings</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-stone-400">Hirers</h4>
              <ul className="space-y-3">
                <li><Link href="/create-account?mode=hire" className="text-stone-500 hover:text-white transition-colors">Post a Job</Link></li>
                <li><Link href="/help/hiring" className="text-stone-500 hover:text-white transition-colors">Hiring Guide</Link></li>
                <li><Link href="/help/business" className="text-stone-500 hover:text-white transition-colors">Business</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-stone-400">Support</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-stone-500 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/help/contact" className="text-stone-500 hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/help/trust" className="text-stone-500 hover:text-white transition-colors">Trust & Safety</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">CrewLink</span>
            </div>
            <div className="text-sm text-stone-500">
              © {new Date().getFullYear()} CrewLink. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
