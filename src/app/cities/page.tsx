'use client'

import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useUserRole } from '@/contexts/UserRoleContext'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
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

// ============================================
// CITIES PAGE - Editorial Redesign
// Matching Pricing/Safety quality bar
// Clean hierarchy, primary cities emphasized
// ============================================

// Priority cities to feature prominently
const PRIORITY_CITY_IDS = ['san-francisco', 'los-angeles', 'grass-valley', 'san-jose']

function CityLink({
  city,
  role,
  category,
  isLive = true,
  isPriority = false,
}: {
  city: City
  role: 'HIRER' | 'WORKER' | null
  category: string | null
  isLive?: boolean
  isPriority?: boolean
}) {
  const getDestination = () => {
    if (!isLive) return `/cities/${city.id}`
    const basePath = role === 'HIRER' ? '/hiring/map' : role === 'WORKER' ? '/work/map' : `/cities/${city.id}`
    if (basePath.startsWith('/cities/')) return basePath
    return buildUrlWithCategory(basePath, category, { city: city.id })
  }

  if (isPriority) {
    return (
      <Link
        href={getDestination()}
        className="group flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:border-white/10 transition-colors"
      >
        <div>
          <h3 className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors">
            {city.name}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">{city.state}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-full">
            Live
          </span>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={getDestination()}
      className={`group flex items-center justify-between py-2.5 transition-colors ${
        isLive ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-400'
      }`}
    >
      <span>{city.name}</span>
      {isLive ? (
        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
      ) : (
        <span className="text-xs text-slate-600">Soon</span>
      )}
    </Link>
  )
}

function CitiesPageContent() {
  const { role } = useUserRole()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')

  const heroRef = useScrollReveal<HTMLDivElement>()
  const primaryRef = useScrollReveal<HTMLDivElement>()
  const californiaRef = useScrollReveal<HTMLDivElement>()
  const tahoeRef = useScrollReveal<HTMLDivElement>()
  const expansionRef = useScrollReveal<HTMLDivElement>()

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
      {/* Hero */}
      <section className="pt-28 pb-10 sm:pt-36 sm:pb-12">
        <div
          ref={heroRef.ref}
          className={`max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 ${getRevealClasses(heroRef.isVisible, 'up')}`}
        >
          <p className="text-sm font-medium text-cyan-400 uppercase tracking-wider mb-4">
            Locations
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
            Where CrewLink operates
          </h1>
          <p className="mt-5 text-lg text-slate-400 leading-relaxed">
            Live across California and Lake Tahoe. Expanding to more cities soon.
          </p>

          {/* Search */}
          <div className="mt-8 relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-900/60 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* No Results */}
      {!hasResults && searchQuery && (
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
            <p className="text-slate-400">No cities match &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-sm text-cyan-400 hover:underline"
            >
              Clear search
            </button>
          </div>
        </section>
      )}

      {/* Primary Cities */}
      {filteredPriority.length > 0 && !searchQuery && (
        <section className="py-10 border-t border-white/5">
          <div
            ref={primaryRef.ref}
            className={`max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 ${getRevealClasses(primaryRef.isVisible, 'up')}`}
          >
            <div className="grid lg:grid-cols-[140px_1fr] gap-6 lg:gap-12">
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider lg:pt-4">
                Featured
              </h2>
              <div>
                {filteredPriority.map((city) => (
                  <CityLink
                    key={city.id}
                    city={city}
                    role={role}
                    category={selectedCategory}
                    isPriority
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* California */}
      {(filteredOther.length > 0 || (searchQuery && filteredPriority.length > 0)) && (
        <section className="py-10 border-t border-white/5">
          <div
            ref={californiaRef.ref}
            className={`max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 ${getRevealClasses(californiaRef.isVisible, 'up')}`}
          >
            <div className="grid lg:grid-cols-[140px_1fr] gap-6 lg:gap-12">
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider lg:pt-2">
                California
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
                {searchQuery && filteredPriority.map((city) => (
                  <CityLink key={city.id} city={city} role={role} category={selectedCategory} />
                ))}
                {filteredOther.map((city) => (
                  <CityLink key={city.id} city={city} role={role} category={selectedCategory} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Lake Tahoe */}
      {filteredTahoe.length > 0 && (
        <section className="py-10 border-t border-white/5">
          <div
            ref={tahoeRef.ref}
            className={`max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 ${getRevealClasses(tahoeRef.isVisible, 'up')}`}
          >
            <div className="grid lg:grid-cols-[140px_1fr] gap-6 lg:gap-12">
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider lg:pt-2">
                Lake Tahoe
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
                {filteredTahoe.map((city) => (
                  <CityLink key={city.id} city={city} role={role} category={selectedCategory} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon */}
      {filteredExpansion.length > 0 && (
        <section className="py-10 border-t border-white/5">
          <div
            ref={expansionRef.ref}
            className={`max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 ${getRevealClasses(expansionRef.isVisible, 'up')}`}
          >
            <div className="grid lg:grid-cols-[140px_1fr] gap-6 lg:gap-12">
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider lg:pt-2">
                Coming soon
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-1">
                {filteredExpansion.map((city) => (
                  <CityLink key={city.id} city={city} role={role} category={selectedCategory} isLive={false} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="py-10 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-[140px_1fr] gap-6 lg:gap-12">
            <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider lg:pt-1">
              Coverage
            </h2>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-2xl font-bold text-white">{californiaCities.length + tahoeCities.length}</div>
                <div className="text-sm text-slate-500 mt-1">Cities live</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{expansionCities.length}</div>
                <div className="text-sm text-slate-500 mt-1">Coming soon</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">2</div>
                <div className="text-sm text-slate-500 mt-1">Regions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-[140px_1fr] gap-6 lg:gap-12">
            <div />
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
              <Link
                href="/create-account"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
              >
                Get started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                Request a city
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
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
