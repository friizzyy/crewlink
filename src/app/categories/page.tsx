'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, TrendingUp, Search, X } from 'lucide-react'
import { useState } from 'react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import { CATEGORIES, saveCategory } from '@/lib/categories'

// ============================================
// CATEGORIES PAGE - Premium Job Category Browser
// Design: Enhanced scroll animations, search filter,
// card hover effects, ambient backgrounds
// ============================================

function HeroSection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <section ref={ref} className="pt-36 pb-12 sm:pt-44 sm:pb-16 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '2s' }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative">
        <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '0ms' }}>
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-cyan-500/10 backdrop-blur-xl rounded-full border border-cyan-500/20 mb-10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400 tracking-wide">Browse categories</span>
          </div>
        </div>

        <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
          Find help for{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            any task
          </span>
        </h1>

        <p className={`mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '160ms' }}>
          From cleaning to moving to handyman work, discover thousands of jobs in every category.
        </p>

        {/* Search Bar */}
        <div
          className={`mt-10 max-w-xl mx-auto ${getRevealClasses(isVisible, 'up')}`}
          style={{ transitionDelay: '240ms' }}
        >
          <div className="relative group">
            {/* Focus glow */}
            <div
              className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 transition-opacity duration-500 ${
                searchFocused ? 'opacity-20' : 'group-hover:opacity-10'
              }`}
            />
            <div className="relative">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                searchFocused ? 'text-cyan-400' : 'text-slate-500'
              }`} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-14 pr-12 py-5 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
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
        </div>
      </div>
    </section>
  )
}

function CategoriesGrid({ searchQuery }: { searchQuery: string }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const router = useRouter()

  // Filter categories based on search
  const filteredCategories = searchQuery
    ? CATEGORIES.filter(cat =>
        cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : CATEGORIES

  // Handle category card click - save to localStorage and navigate
  const handleCategoryClick = (slug: string) => {
    saveCategory(slug)
    router.push(`/cities?category=${slug}`)
  }

  if (filteredCategories.length === 0) {
    return (
      <section className="py-12">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="p-12 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-white font-medium text-lg">No categories found</p>
            <p className="text-slate-500 mt-2">Try a different search term</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Category count */}
        <div className={`mb-8 ${getRevealClasses(isVisible, 'up')}`}>
          <p className="text-slate-500 text-sm">
            Showing <span className="text-white font-medium">{filteredCategories.length}</span> categories
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat, i) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`group relative p-6 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900/70 transition-all duration-300 overflow-hidden text-left hover:shadow-xl hover:shadow-cyan-500/5 ${getRevealClasses(isVisible, 'up')}`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-300">
                      <span className="text-3xl">{cat.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {cat.label}
                      </h3>
                      {cat.popular && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400">
                          <TrendingUp className="w-3 h-3" />
                          Popular
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {cat.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500">{cat.jobs}</span>
                  <span className="text-xs font-medium text-emerald-400">{cat.avgPay}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  return (
    <section ref={ref} className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className={`relative overflow-hidden p-10 sm:p-14 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl border border-cyan-500/20 text-center ${getRevealClasses(isVisible, 'scale')}`}>
          {/* Animated background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"
              style={{ animationDuration: '8s' }}
            />
            <div
              className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-pulse"
              style={{ animationDuration: '10s', animationDelay: '2s' }}
            />
          </div>

          <div className="relative">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Post a job in any category and get matched with qualified workers in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/create-account?mode=hire"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30 w-full sm:w-auto active:scale-[0.98]"
              >
                Post a Job
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/create-account?mode=work"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/5 hover:border-white/30 transition-all w-full sm:w-auto active:scale-[0.98]"
              >
                Start Earning
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <MarketingLayout>
      <HeroSectionWithSearch onSearch={setSearchQuery} />
      <CategoriesGrid searchQuery={searchQuery} />
      <CTASection />
    </MarketingLayout>
  )
}

// Enhanced Hero with search callback
function HeroSectionWithSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  return (
    <section ref={ref} className="pt-36 pb-12 sm:pt-44 sm:pb-16 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-[150px] animate-pulse"
          style={{ animationDuration: '10s' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '2s' }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative">
        <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '0ms' }}>
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-cyan-500/10 backdrop-blur-xl rounded-full border border-cyan-500/20 mb-10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-400 tracking-wide">Browse categories</span>
          </div>
        </div>

        <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
          Find help for{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            any task
          </span>
        </h1>

        <p className={`mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '160ms' }}>
          From cleaning to moving to handyman work, discover thousands of jobs in every category.
        </p>

        {/* Search Bar */}
        <div
          className={`mt-10 max-w-xl mx-auto ${getRevealClasses(isVisible, 'up')}`}
          style={{ transitionDelay: '240ms' }}
        >
          <div className="relative group">
            {/* Focus glow */}
            <div
              className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 transition-opacity duration-500 ${
                searchFocused ? 'opacity-20' : 'group-hover:opacity-10'
              }`}
            />
            <div className="relative">
              <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                searchFocused ? 'text-cyan-400' : 'text-slate-500'
              }`} />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-14 pr-12 py-5 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
