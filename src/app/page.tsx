'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  MapPin, ArrowRight, Shield, Briefcase,
  Users, CheckCircle2, BadgeCheck, Star,
  DollarSign, Zap, Clock, TrendingUp, Lock
} from 'lucide-react'
import { UniversalNav } from '@/components/UniversalNav'
import { MarketingFooter } from '@/components/MarketingFooter'

// ============================================
// LANDING PAGE - Mobile-First Optimized
// Reliable animations across all devices
// ============================================

// Detect if we should reduce motion (preference OR mobile Safari)
function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    // Check user preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Check if mobile Safari (performance reasons)
    const isMobileSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) &&
                          /WebKit/.test(navigator.userAgent) &&
                          !/(Chrome|CriOS|Firefox)/.test(navigator.userAgent)
    const isMobile = window.innerWidth < 768

    setReducedMotion(mediaQuery.matches || (isMobileSafari && isMobile))

    const handler = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches || (isMobileSafari && isMobile))
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return reducedMotion
}

// Scroll reveal hook using IntersectionObserver
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Check reduced motion - if so, just show immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      hasAnimated.current = true
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          setIsVisible(true)
          hasAnimated.current = true
        }
      },
      {
        threshold,
        // Use a smaller negative margin to trigger earlier
        rootMargin: '0px 0px -50px 0px'
      }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// Floating card data
const floatingCards = [
  {
    id: 1,
    title: 'Handyman Help',
    subtitle: 'Available now',
    icon: '🔧',
    gradient: 'from-cyan-400 to-blue-600',
    position: 'top-[15%] right-[8%] md:top-[15%] md:right-[8%]',
    mobilePosition: 'top-[8%] right-[2%]',
    rotation: 'rotate-3',
    delay: 0,
  },
  {
    id: 2,
    title: 'Deep Cleaning',
    subtitle: '$35/hr',
    icon: '🧹',
    gradient: 'from-emerald-400 to-teal-600',
    position: 'top-[35%] left-[5%] md:top-[35%] md:left-[5%]',
    mobilePosition: 'top-[16%] left-[2%]',
    rotation: '-rotate-2',
    delay: 100,
  },
  {
    id: 3,
    title: 'Moving Help',
    subtitle: '2 workers · $45/hr',
    icon: '📦',
    gradient: 'from-purple-400 to-pink-600',
    position: 'bottom-[25%] left-[8%] md:bottom-[25%] md:left-[8%]',
    mobilePosition: 'bottom-[20%] left-[2%]',
    rotation: '-rotate-1',
    delay: 200,
  },
  {
    id: 4,
    title: 'Job Complete!',
    subtitle: '+$127.50 earned',
    icon: '⭐',
    gradient: 'from-amber-400 to-orange-600',
    position: 'bottom-[18%] right-[10%] md:bottom-[18%] md:right-[10%]',
    mobilePosition: 'bottom-[12%] right-[2%]',
    rotation: 'rotate-1',
    delay: 300,
    isSuccess: true,
  },
]

const categories = [
  { name: 'Cleaning', icon: '🧹', count: '1.2K', hot: true },
  { name: 'Moving', icon: '📦', count: '890' },
  { name: 'Handyman', icon: '🔧', count: '1.5K', hot: true },
  { name: 'Yard Work', icon: '🌱', count: '720' },
  { name: 'Assembly', icon: '🪑', count: '430' },
  { name: 'Delivery', icon: '🚚', count: '560' },
]

const trustBadges = [
  { label: 'Background Checked', icon: Shield },
  { label: 'Verified Reviews', icon: BadgeCheck },
  { label: 'Secure Payments', icon: Lock },
]

// Floating card component - handles its own animation state
function FloatingCard({
  card,
  isMobile,
  mounted,
  reducedMotion
}: {
  card: typeof floatingCards[0]
  isMobile: boolean
  mounted: boolean
  reducedMotion: boolean
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!mounted) return

    // Stagger the appearance
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, card.delay)

    return () => clearTimeout(timer)
  }, [mounted, card.delay])

  // Mobile version - simpler, no backdrop-blur, no float animation
  if (isMobile) {
    return (
      <div
        className={`
          absolute ${card.mobilePosition} ${card.rotation}
          transition-all duration-500 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        style={{
          willChange: isVisible ? 'auto' : 'transform, opacity',
          transform: `${card.rotation === 'rotate-3' ? 'rotate(3deg)' :
                       card.rotation === '-rotate-2' ? 'rotate(-2deg)' :
                       card.rotation === '-rotate-1' ? 'rotate(-1deg)' :
                       'rotate(1deg)'} ${isVisible ? 'translateY(0)' : 'translateY(16px)'}`,
        }}
      >
        <div
          className={`
            relative p-2 rounded-xl
            bg-slate-900/95 border border-white/10
            shadow-lg
            ${card.isSuccess ? 'border-emerald-500/30' : ''}
          `}
        >
          {card.isSuccess && (
            <div className="absolute inset-0 bg-emerald-500/10 rounded-xl" />
          )}
          <div className="relative flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
              <span className="text-xs">{card.icon}</span>
            </div>
            <div>
              <div className="font-semibold text-white text-[10px]">{card.title}</div>
              <div className={`text-[8px] ${card.isSuccess ? 'text-emerald-400' : 'text-slate-400'}`}>
                {card.subtitle}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Desktop/tablet version
  return (
    <div
      className={`
        absolute ${card.position} ${card.rotation}
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{
        willChange: isVisible ? 'auto' : 'transform, opacity',
      }}
    >
      <div
        className={`
          relative p-4 rounded-2xl
          bg-slate-900/80 border border-white/10
          shadow-2xl shadow-black/20
          ${card.isSuccess ? 'border-emerald-500/30' : ''}
          ${!reducedMotion ? 'hover:translate-y-[-4px] transition-transform duration-300' : ''}
        `}
        style={{
          // Subtle float animation only on desktop with motion enabled
          animation: !reducedMotion ? `float-gentle 6s ease-in-out infinite ${card.delay}ms` : 'none',
        }}
      >
        {card.isSuccess && (
          <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl" />
        )}
        <div className="relative flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
            <span className="text-xl">{card.icon}</span>
          </div>
          <div>
            <div className="font-semibold text-white text-sm">{card.title}</div>
            <div className={`text-xs ${card.isSuccess ? 'text-emerald-400' : 'text-slate-400'} flex items-center gap-1`}>
              {card.id === 1 && !reducedMotion && (
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
              {card.id === 1 && reducedMotion && (
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              )}
              {card.subtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const reducedMotion = useReducedMotion()

  const statsSection = useScrollReveal()
  const categoriesSection = useScrollReveal()
  const howSection = useScrollReveal()

  useEffect(() => {
    setMounted(true)
    // Check viewport on mount and resize
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="min-h-screen min-h-[100dvh] text-white bg-slate-950">
      <UniversalNav variant="marketing" />

      {/* ============ HERO ============ */}
      {/* Use dvh for proper mobile viewport handling */}
      <section className="relative min-h-screen min-h-[100dvh] flex items-center pt-16">

        {/* ====== BACKGROUND - Performance optimized ====== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Static gradient base - no animation */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

          {/* Glow spots - STATIC on mobile, subtle pulse on desktop */}
          <div
            className={`
              absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px]
              bg-cyan-500/15 rounded-full blur-[100px]
              ${!reducedMotion && !isMobile ? 'animate-pulse-slow' : ''}
            `}
          />
          <div
            className={`
              absolute bottom-1/4 right-1/4 w-[250px] md:w-[400px] h-[250px] md:h-[400px]
              bg-blue-600/10 rounded-full blur-[80px]
              ${!reducedMotion && !isMobile ? 'animate-pulse-slow' : ''}
            `}
            style={{ animationDelay: '2s' }}
          />

          {/* Grid - always static */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* ====== FLOATING CARDS ====== */}
        <div className="absolute inset-0 pointer-events-none">
          {floatingCards.map((card) => (
            <FloatingCard
              key={card.id}
              card={card}
              isMobile={isMobile}
              mounted={mounted}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>

        {/* ====== HERO CONTENT ====== */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Live indicator */}
            <div
              className={`
                inline-flex items-center gap-3 px-5 py-2.5
                bg-slate-900/80 border border-white/10 rounded-full
                mb-10 transition-all duration-500 ease-out
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
            >
              <span className="relative flex h-2.5 w-2.5">
                {!reducedMotion && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" style={{ animationDuration: '2s' }}></span>
                )}
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-slate-300">
                <span className="font-bold text-white">2,847</span> workers active in your area
              </span>
            </div>

            {/* Headline */}
            <h1
              className={`
                text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[0.95]
                transition-all duration-500 ease-out
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
              style={{ transitionDelay: '100ms' }}
            >
              <span className="text-white">Get help</span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"> today.</span>
              <br />
              <span className="text-white">Not</span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"> next week.</span>
            </h1>

            {/* Subheadline */}
            <p
              className={`
                mt-6 sm:mt-8 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed
                transition-all duration-500 ease-out
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
              style={{ transitionDelay: '200ms' }}
            >
              Hire verified local workers for cleaning, moving, handyman work, and more.
              Average match time: <span className="text-cyan-400 font-semibold">4 minutes</span>.
            </p>

            {/* CTA Buttons */}
            <div
              className={`
                mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4
                transition-all duration-500 ease-out
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
              style={{ transitionDelay: '300ms' }}
            >
              <Link
                href="/create-account?mode=hire"
                className="group relative overflow-hidden rounded-2xl shadow-2xl shadow-cyan-500/25 w-full sm:w-auto"
                data-qa="cta-hire-help"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold">
                  <Briefcase className="w-5 h-5" />
                  Hire Help Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/create-account?mode=work"
                className="group relative overflow-hidden rounded-2xl w-full sm:w-auto"
                data-qa="cta-find-work"
              >
                <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-2xl group-hover:border-emerald-400/60 transition-colors" />
                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                <span className="relative flex items-center justify-center gap-2 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                  Start Earning
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className={`
                mt-12 sm:mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-8
                transition-all duration-500 ease-out
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
              style={{ transitionDelay: '400ms' }}
            >
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-slate-500">
                  <badge.icon className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* ============ STATS BAR ============ */}
      <section ref={statsSection.ref} className="py-8 border-y border-white/5 bg-slate-900/30">
        <div className={`max-w-5xl mx-auto px-6 transition-opacity duration-500 ${statsSection.isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: '50K+', label: 'Jobs Completed', icon: CheckCircle2 },
              { value: '12K+', label: 'Verified Workers', icon: BadgeCheck },
              { value: '4.9', label: 'Average Rating', icon: Star },
              { value: '4 min', label: 'Avg Match Time', icon: Clock },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`
                  text-center transition-all duration-500 ease-out
                  ${statsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-cyan-400" />
                  <span className="text-2xl sm:text-3xl font-black text-white">{stat.value}</span>
                </div>
                <span className="text-xs sm:text-sm text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section ref={categoriesSection.ref} className="py-14 sm:py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div
            className={`
              flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8
              transition-all duration-500 ease-out
              ${categoriesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                What do you need?
              </h2>
              <p className="text-slate-400 mt-1">Browse popular categories</p>
            </div>
            <Link href="/categories" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                href={`/cities?category=${cat.name.toLowerCase()}`}
                className={`
                  group relative p-4 rounded-xl
                  bg-slate-900/40 border border-white/5
                  hover:border-cyan-500/30 hover:bg-slate-900/60
                  transition-all duration-300 ease-out
                  ${categoriesSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors truncate">{cat.name}</h3>
                      {cat.hot && (
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{cat.count} jobs</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section ref={howSection.ref} className="py-14 sm:py-16 border-y border-white/5 bg-slate-900/20">
        <div className="max-w-5xl mx-auto px-6 sm:px-8">
          <div
            className={`
              mb-12 transition-all duration-500 ease-out
              ${howSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center sm:text-left">
              How it works
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Post your job', desc: 'Describe what you need in under 2 minutes.', color: 'cyan' },
                { step: '2', title: 'Get matched', desc: 'AI matches you with verified workers.', color: 'blue' },
                { step: '3', title: 'Work gets done', desc: 'Track progress. Pay when satisfied.', color: 'emerald' },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className={`
                    flex items-start gap-4
                    transition-all duration-500 ease-out
                    ${howSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}
                  style={{ transitionDelay: `${i * 75}ms` }}
                >
                  <div className={`
                    shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                    ${item.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                      item.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-emerald-500/10 text-emerald-400'}
                  `}>
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />

      {/* ====== ANIMATION STYLES ====== */}
      <style jsx global>{`
        /* Gentle float for desktop cards */
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        /* Slow pulse for background - desktop only */
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-slow,
          .animate-ping,
          .animate-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
