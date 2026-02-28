'use client'

import Link from 'next/link'
import { ArrowRight, Search, MapPin, Globe, Sparkles, Users, Briefcase, TrendingUp, CheckCircle2 } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import MarketingLayout from '@/components/MarketingLayout'
import { useUserRole } from '@/contexts/UserRoleContext'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import { cn } from '@/lib/utils'
import { GlassPanel, GlassCard, Button, Badge } from '@/components/ui'
import {
  getCaliforniaCities,
  getTahoeCities,
  getExpansionCities,
  type City,
} from '@/lib/cities-data'
import {
  getSavedCategory,
  isValidCategorySlug,
  normalizeCategorySlug,
  buildUrlWithCategory,
} from '@/lib/categories'

// Priority cities to feature prominently
const PRIORITY_CITY_IDS = ['san-francisco', 'los-angeles', 'grass-valley', 'san-jose']

// Stats data
const stats = [
  { label: 'Cities Live', value: '35+', icon: MapPin, color: 'cyan' },
  { label: 'Launching Next', value: '15+', icon: TrendingUp, color: 'purple' },
  { label: 'Active Workers', value: '50K+', icon: Users, color: 'emerald' },
  { label: 'Jobs Completed', value: '120K+', icon: Briefcase, color: 'amber' },
]

function CityCard({
  city,
  role,
  category,
  isLive = true,
  isFeatured = false,
}: {
  city: City
  role: 'HIRER' | 'WORKER' | null
  category: string | null
  isLive?: boolean
  isFeatured?: boolean
}) {
  const getDestination = () => {
    if (!isLive) return `/cities/${city.id}`
    const basePath = role === 'HIRER' ? '/hiring/map' : role === 'WORKER' ? '/work/map' : `/cities/${city.id}`
    if (basePath.startsWith('/cities/')) return basePath
    return buildUrlWithCategory(basePath, category, { city: city.id })
  }

  if (isFeatured) {
    return (
      <Link href={getDestination()}>
        <GlassCard interactive padding="lg" rounded="xl" className="relative hover:translate-y-[-2px] transition-all group">
          <div className="absolute top-4 right-4">
            <Badge variant="success" size="sm" dot>Live</Badge>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
            {city.name}
          </h3>
          <p className="text-sm text-slate-400 mb-4">{city.state}</p>
          <div className="flex items-center gap-2 text-sm text-cyan-400 font-medium">
            <span>Explore</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </GlassCard>
      </Link>
    )
  }

  return (
    <Link
      href={getDestination()}
      className={cn(
        'group flex items-center justify-between py-3 px-4 rounded-xl transition-all',
        isLive
          ? 'hover:bg-white/5 text-slate-300 hover:text-white'
          : 'text-slate-500 hover:text-slate-400'
      )}
    >
      <div className="flex items-center gap-3">
        <MapPin className={cn('w-4 h-4', isLive ? 'text-cyan-400' : 'text-slate-600')} />
        <span className="font-medium">{city.name}</span>
      </div>
      {isLive ? (
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      ) : (
        <span className="text-xs text-slate-600 bg-slate-800 px-2 py-1 rounded-full">Soon</span>
      )}
    </Link>
  )
}

function HeroSection({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (v: string) => void }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="relative pt-24 pb-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div
        ref={ref}
        className={cn(
          'relative max-w-5xl mx-auto px-4 text-center',
          getRevealClasses(isVisible)
        )}
      >
        {/* Badge */}
        <Badge variant="brand" size="md" className="mb-8">
          <Globe className="w-4 h-4 mr-2" />
          Locations
        </Badge>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Where{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            CrewLink
          </span>{' '}
          Operates
        </h1>

        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Live across California and Lake Tahoe. Find local workers and jobs in your area, with more cities launching soon.
        </p>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <GlassPanel variant="elevated" padding="none" border="glow" rounded="xl" className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-transparent text-white placeholder:text-slate-500 focus:outline-none transition-all"
            />
          </GlassPanel>
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', icon: 'text-cyan-400' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'text-emerald-400' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: 'text-purple-400' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'text-amber-400' },
    }
    return colors[color] || colors.cyan
  }

  return (
    <section className="py-12">
      <div
        ref={ref}
        className={cn(
          'max-w-5xl mx-auto px-4',
          getRevealClasses(isVisible)
        )}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            const colors = getColorClasses(stat.color)
            return (
              <GlassPanel
                key={stat.label}
                variant="subtle"
                padding="lg"
                border="light"
                rounded="xl"
                hoverable
                className="text-center p-5"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3', colors.bg)}>
                  <Icon className={cn('w-5 h-5', colors.icon)} />
                </div>
                <div className={cn('text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent', {
                  'from-cyan-400 to-blue-400': stat.color === 'cyan',
                  'from-emerald-400 to-teal-400': stat.color === 'emerald',
                  'from-purple-400 to-pink-400': stat.color === 'purple',
                  'from-amber-400 to-orange-400': stat.color === 'amber',
                })}>{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </GlassPanel>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeaturedCitiesSection({
  cities,
  role,
  category,
}: {
  cities: City[]
  role: 'HIRER' | 'WORKER' | null
  category: string | null
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  if (cities.length === 0) return null

  return (
    <section className="py-16">
      <div
        ref={ref}
        className={cn(
          'max-w-5xl mx-auto px-4',
          getRevealClasses(isVisible)
        )}
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Featured Cities</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Most Popular Locations
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              role={role}
              category={category}
              isFeatured
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function CityListSection({
  title,
  badge,
  badgeColor,
  cities,
  role,
  category,
  isLive = true,
}: {
  title: string
  badge: string
  badgeColor: 'cyan' | 'purple' | 'emerald'
  cities: City[]
  role: 'HIRER' | 'WORKER' | null
  category: string | null
  isLive?: boolean
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  if (cities.length === 0) return null

  const colorClasses = {
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  }

  const colors = colorClasses[badgeColor]

  return (
    <section className="py-12">
      <div
        ref={ref}
        className={cn(
          'max-w-5xl mx-auto px-4',
          getRevealClasses(isVisible)
        )}
      >
        <div className="p-6 bg-slate-900/30 backdrop-blur-sm rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full', colors.bg, colors.border)}>
              <MapPin className={cn('w-4 h-4', colors.text)} />
              <span className={cn('text-sm font-medium', colors.text)}>{badge}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-1">
            {cities.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                role={role}
                category={category}
                isLive={isLive}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section className="py-20">
      <div
        ref={ref}
        className={cn(
          'max-w-5xl mx-auto px-4',
          getRevealClasses(isVisible)
        )}
      >
        <GlassPanel variant="elevated" padding="none" border="glow" rounded="2xl" className="relative p-8 md:p-12 overflow-hidden text-center">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />

          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Don&apos;t See Your City?
              </span>
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto mb-8">
              We&apos;re expanding rapidly. Let us know where you&apos;d like to see CrewLink next, and be the first to know when we launch in your area.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create-account">
                <Button variant="primary" size="lg" glow rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Get Started
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Request a City
                </Button>
              </Link>
            </div>
          </div>
        </GlassPanel>
      </div>
    </section>
  )
}

function CitiesPageContent() {
  const { role } = useUserRole()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const urlCategory = searchParams.get('category')
    if (urlCategory) {
      const normalized = normalizeCategorySlug(urlCategory)
      if (normalized !== 'all') {
        setSelectedCategory(normalized)
        return
      }
    }
    const savedCategory = getSavedCategory()
    if (savedCategory && isValidCategorySlug(savedCategory)) {
      setSelectedCategory(savedCategory)
    }
  }, [searchParams])

  const californiaCities = useMemo(() => getCaliforniaCities(), [])
  const tahoeCities = useMemo(() => getTahoeCities(), [])
  const expansionCities = useMemo(() => getExpansionCities(), [])

  // Separate priority cities
  const priorityCities = useMemo(() =>
    californiaCities.filter(c => PRIORITY_CITY_IDS.includes(c.id)),
    [californiaCities]
  )
  const otherCalifornia = useMemo(() =>
    californiaCities.filter(c => !PRIORITY_CITY_IDS.includes(c.id)),
    [californiaCities]
  )

  // Filter by search
  const filter = (cities: City[]) => {
    if (!searchQuery) return cities
    return cities.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const filteredPriority = filter(priorityCities)
  const filteredOther = filter(otherCalifornia)
  const filteredTahoe = filter(tahoeCities)
  const filteredExpansion = filter(expansionCities)

  const hasResults = filteredPriority.length > 0 || filteredOther.length > 0 || filteredTahoe.length > 0 || filteredExpansion.length > 0

  return (
    <MarketingLayout>
      <div className="min-h-screen bg-slate-950">
        <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* No Results */}
        {!hasResults && searchQuery && (
          <section className="py-12">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <div className="p-8 bg-slate-900/50 rounded-2xl border border-white/5">
                <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No cities match &quot;{searchQuery}&quot;</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Clear search
                </button>
              </div>
            </div>
          </section>
        )}

        {hasResults && (
          <>
            <StatsSection />

            {/* Featured Cities - only show when not searching */}
            {!searchQuery && filteredPriority.length > 0 && (
              <FeaturedCitiesSection
                cities={filteredPriority}
                role={role}
                category={selectedCategory}
              />
            )}

            {/* California Cities */}
            <CityListSection
              title="California"
              badge="Live"
              badgeColor="cyan"
              cities={searchQuery ? [...filteredPriority, ...filteredOther] : filteredOther}
              role={role}
              category={selectedCategory}
            />

            {/* Lake Tahoe */}
            <CityListSection
              title="Lake Tahoe Region"
              badge="Live"
              badgeColor="emerald"
              cities={filteredTahoe}
              role={role}
              category={selectedCategory}
            />

            {/* Expanding To */}
            <CityListSection
              title="Expanding To"
              badge="Expansion"
              badgeColor="purple"
              cities={filteredExpansion}
              role={role}
              category={selectedCategory}
              isLive={false}
            />
          </>
        )}

        <CTASection />
      </div>
    </MarketingLayout>
  )
}

export default function CitiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    }>
      <CitiesPageContent />
    </Suspense>
  )
}
