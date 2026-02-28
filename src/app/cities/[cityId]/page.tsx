'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  MapPin, ArrowRight, Users, Briefcase, Star, Shield, Clock,
  Sparkles, ChevronRight, DollarSign, Map,
  Package, Wrench, Leaf, Armchair, PartyPopper
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import { useUserRole } from '@/contexts/UserRoleContext'
import { getCityById, regionLabels, getCitiesByRegion, type City } from '@/lib/cities-data'

// ============================================
// CITY DETAIL PAGE - Premium Design
// Upgraded to use MarketingLayout with scroll reveals
// ============================================

// Popular categories for each city type
const categories: { id: string; name: string; Icon: LucideIcon; jobs: number }[] = [
  { id: 'cleaning', name: 'House Cleaning', Icon: Sparkles, jobs: 45 },
  { id: 'moving', name: 'Moving & Delivery', Icon: Package, jobs: 32 },
  { id: 'handyman', name: 'Handyman', Icon: Wrench, jobs: 28 },
  { id: 'yard', name: 'Yard Work', Icon: Leaf, jobs: 24 },
  { id: 'assembly', name: 'Furniture Assembly', Icon: Armchair, jobs: 18 },
  { id: 'events', name: 'Event Help', Icon: PartyPopper, jobs: 12 },
]

// How it works steps - role aware
const hirerSteps = [
  {
    number: '1',
    title: 'Post your job',
    description: 'Describe what you need done and when.',
  },
  {
    number: '2',
    title: 'Get matched',
    description: 'Receive bids from verified local workers.',
  },
  {
    number: '3',
    title: 'Hire with confidence',
    description: 'Review profiles, ratings, and choose your worker.',
  },
  {
    number: '4',
    title: 'Get it done',
    description: 'Track progress and pay securely through the app.',
  },
]

const workerSteps = [
  {
    number: '1',
    title: 'Create your profile',
    description: 'Showcase your skills and set your availability.',
  },
  {
    number: '2',
    title: 'Browse jobs',
    description: 'Find jobs that match your skills in your area.',
  },
  {
    number: '3',
    title: 'Submit bids',
    description: 'Apply to jobs with your proposed rate.',
  },
  {
    number: '4',
    title: 'Get paid',
    description: 'Complete work and receive secure payment.',
  },
]

function CityPageContent() {
  const params = useParams()
  const { role, isRoleSelected } = useUserRole()
  const cityId = params.cityId as string

  const city = getCityById(cityId)

  // Scroll reveal refs
  const heroRef = useScrollReveal<HTMLDivElement>()
  const categoriesRef = useScrollReveal<HTMLDivElement>()
  const stepsRef = useScrollReveal<HTMLDivElement>()
  const nearbyCitiesRef = useScrollReveal<HTMLDivElement>()
  const ctaRef = useScrollReveal<HTMLDivElement>()

  // Role-specific configuration
  const isWorker = role === 'WORKER'
  const steps = isWorker ? workerSteps : hirerSteps
  const primaryGradient = isWorker
    ? 'from-emerald-400 to-teal-500'
    : 'from-cyan-400 to-blue-500'
  const buttonGradient = isWorker
    ? 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25'
    : 'from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25'
  const borderColor = isWorker ? 'border-emerald-500/20' : 'border-cyan-500/20'
  const glowColor = isWorker ? 'bg-emerald-500/10' : 'bg-cyan-500/10'
  const accentColor = isWorker ? 'text-emerald-400' : 'text-cyan-400'
  const accentBg = isWorker ? 'bg-emerald-500/10' : 'bg-cyan-500/10'
  const accentBorder = isWorker ? 'border-emerald-500/20' : 'border-cyan-500/20'

  // 404 if city not found
  if (!city) {
    return (
      <MarketingLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">City Not Found</h1>
            <p className="text-slate-400 mb-8">We could not find information for this city.</p>
            <Link
              href="/cities"
              className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${buttonGradient} text-white font-semibold rounded-xl`}
            >
              View All Cities
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </MarketingLayout>
    )
  }

  // Get nearby cities in the same region
  const nearbyCities = getCitiesByRegion(city.region)
    .filter(c => c.id !== city.id && c.status === 'live')
    .slice(0, 4)

  const isComingSoon = city.status === 'coming-soon'

  // Determine destinations based on role
  const mapDestination = isWorker ? `/work/map?city=${city.id}` : `/hiring/map?city=${city.id}`
  const actionDestination = isWorker ? '/work/profile' : '/hiring/post'

  return (
    <MarketingLayout>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-20 left-1/4 w-[500px] h-[500px] ${glowColor} rounded-full blur-[150px]`} />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="pt-28 pb-12 sm:pt-36 sm:pb-16 relative">
        <div
          ref={heroRef.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 ${getRevealClasses(heroRef.isVisible, 'up')}`}
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Link href="/cities" className="hover:text-white transition-colors">Cities</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{city.name}, {city.state}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div>
              {/* Role indicator */}
              {isRoleSelected && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 ${accentBg} rounded-full border ${accentBorder} mb-6`}>
                  {isWorker ? (
                    <Briefcase className={`w-4 h-4 ${accentColor}`} />
                  ) : (
                    <Users className={`w-4 h-4 ${accentColor}`} />
                  )}
                  <span className={`text-sm font-medium ${accentColor}`}>
                    {isWorker ? 'Finding Work' : 'Hiring Help'}
                  </span>
                </div>
              )}

              <div className={`inline-flex items-center gap-2 px-4 py-2 ${accentBg} rounded-full border ${accentBorder} mb-6`}>
                <MapPin className={`w-4 h-4 ${accentColor}`} />
                <span className={`text-sm font-medium ${accentColor}`}>{regionLabels[city.region]}</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
                {isWorker ? 'Work in' : 'CrewLink in'}{' '}
                <span className={`bg-gradient-to-r ${primaryGradient} bg-clip-text text-transparent`}>
                  {city.name}
                </span>
              </h1>

              <p className="text-lg text-slate-400 mb-8 max-w-lg">
                {isWorker
                  ? `Find jobs and earn money in ${city.name}, ${city.state}. Browse opportunities from verified hirers in your area.`
                  : city.description || `Find trusted local help for any task in ${city.name}, ${city.state}. Our verified workers are ready to help.`
                }
              </p>

              {isComingSoon ? (
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border border-amber-500/30">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">Launching Soon</span>
                  </div>
                  <p className="text-slate-400">
                    We are working on launching in {city.name}. Join the waitlist to be notified.
                  </p>
                  <Link
                    href="/select-role"
                    className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${buttonGradient} text-white font-semibold rounded-2xl transition-all shadow-lg`}
                  >
                    Join the Waitlist
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={mapDestination}
                    className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r ${buttonGradient} text-white font-semibold rounded-2xl transition-all shadow-lg`}
                  >
                    <Map className="w-5 h-5" />
                    {isWorker ? `View jobs in ${city.name}` : `View workers in ${city.name}`}
                  </Link>
                  <Link
                    href={isRoleSelected ? actionDestination : '/select-role'}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white font-semibold rounded-2xl hover:bg-slate-700 border border-white/10 transition-all"
                  >
                    {isWorker ? 'Create Profile' : 'Post a Job'}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right - Stats Card */}
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${isWorker ? 'from-emerald-500/20 to-teal-600/20' : 'from-cyan-500/20 to-blue-600/20'} rounded-3xl blur-xl`} />
              <div className={`relative bg-slate-900/80 backdrop-blur-xl rounded-3xl border ${borderColor} p-8`}>
                <h3 className="text-lg font-semibold text-white mb-6">
                  {isWorker ? `Opportunities in ${city.name}` : `Coverage in ${city.name}`}
                </h3>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {isWorker ? (
                        <Briefcase className={`w-5 h-5 ${accentColor}`} />
                      ) : (
                        <Users className="w-5 h-5 text-emerald-400" />
                      )}
                      <span className="text-sm text-slate-400">
                        {isWorker ? 'Active Jobs' : 'Active Workers'}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {isWorker ? (city.jobs?.toLocaleString() || 'N/A') : (city.workers?.toLocaleString() || 'N/A')}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {isWorker ? (
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Briefcase className={`w-5 h-5 ${accentColor}`} />
                      )}
                      <span className="text-sm text-slate-400">
                        {isWorker ? 'Avg. Earnings' : 'Jobs This Month'}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white">
                      {isWorker ? '$35/hr' : (city.jobs?.toLocaleString() || 'N/A')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${accentBg} flex items-center justify-center`}>
                      <Shield className={`w-4 h-4 ${accentColor}`} />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {isWorker ? 'Verified Hirers' : 'Background Checked'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {isWorker ? 'All hirers verified' : 'All workers verified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Fast Response</p>
                      <p className="text-sm text-slate-400">
                        {isWorker ? 'Quick job approvals' : 'Avg. 15 min to first bid'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Star className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Highly Rated</p>
                      <p className="text-sm text-slate-400">4.8 average rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      {!isComingSoon && (
        <section className="py-12 sm:py-16">
          <div
            ref={categoriesRef.ref}
            className={`max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 ${getRevealClasses(categoriesRef.isVisible, 'up')}`}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                {isWorker ? `Jobs in ${city.name}` : `Popular in ${city.name}`}
              </h2>
              <Link
                href={mapDestination}
                className={`hidden sm:flex items-center gap-1 ${accentColor} hover:opacity-80 transition-colors`}
              >
                {isWorker ? 'View all jobs' : 'View all workers'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, index) => (
                <Link
                  key={cat.id}
                  href={`${mapDestination}&category=${cat.id}`}
                  className={`group p-5 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:${borderColor} transition-all duration-300`}
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <cat.Icon className={`w-7 h-7 ${accentColor}`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-white group-hover:${accentColor} transition-colors`}>
                        {cat.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {isWorker ? `${cat.jobs}+ jobs available` : `${cat.jobs}+ workers available`}
                      </p>
                    </div>
                    <ArrowRight className={`w-5 h-5 text-slate-600 group-hover:${accentColor} ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-12 sm:py-16">
        <div
          ref={stepsRef.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 ${getRevealClasses(stepsRef.isVisible, 'up')}`}
        >
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
              {isWorker ? `How to Find Work in ${city.name}` : `How CrewLink Works in ${city.name}`}
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              {isWorker ? 'Start earning in a few simple steps' : 'Get help with any task in a few simple steps'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5"
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={`hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r ${isWorker ? 'from-emerald-500/50' : 'from-cyan-500/50'} to-transparent`} />
                )}

                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${isWorker ? 'from-emerald-500 to-teal-600' : 'from-cyan-500 to-blue-600'} flex items-center justify-center text-white font-bold mb-4`}>
                  {step.number}
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Cities */}
      {nearbyCities.length > 0 && (
        <section className="py-12 sm:py-16">
          <div
            ref={nearbyCitiesRef.ref}
            className={`max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 ${getRevealClasses(nearbyCitiesRef.isVisible, 'up')}`}
          >
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-8">
              Also serving nearby
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearbyCities.map((nearby, index) => (
                <Link
                  key={nearby.id}
                  href={`/cities/${nearby.id}`}
                  className={`group p-4 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-white/5 hover:${borderColor} transition-all`}
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-medium text-white group-hover:${accentColor} transition-colors`}>
                        {nearby.name}
                      </h3>
                      <p className="text-sm text-slate-500">{nearby.state}</p>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-slate-600 group-hover:${accentColor} transition-colors`} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 sm:py-16 pb-20">
        <div
          ref={ctaRef.ref}
          className={`max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 ${getRevealClasses(ctaRef.isVisible, 'scale')}`}
        >
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-800 border ${borderColor} p-8 sm:p-12 text-center`}>
            {/* Background glows */}
            <div className="absolute inset-0 pointer-events-none">
              <div className={`absolute top-0 right-0 w-64 h-64 ${glowColor} rounded-full blur-[100px]`} />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
                {isComingSoon
                  ? `Be first to know when we launch in ${city.name}`
                  : isWorker
                    ? `Ready to start earning in ${city.name}?`
                    : `Ready to get started in ${city.name}?`
                }
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
                {isComingSoon
                  ? 'Join our waitlist and get early access when we expand to your area.'
                  : isWorker
                    ? 'Create your free profile and start finding jobs today.'
                    : 'Create your free account and start hiring today.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={isRoleSelected ? (isWorker ? '/work/profile' : '/hiring/post') : '/select-role'}
                  className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r ${buttonGradient} text-white font-semibold rounded-2xl transition-all shadow-lg`}
                >
                  {isComingSoon ? 'Join the Waitlist' : 'Get Started Free'}
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800 text-white font-semibold rounded-2xl hover:bg-slate-700 border border-white/10 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}

export default function CityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <CityPageContent />
    </Suspense>
  )
}
