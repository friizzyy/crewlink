'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Shield, Briefcase,
  CheckCircle2, BadgeCheck, Star,
  DollarSign, Clock, TrendingUp, Lock,
  Wrench, Sparkles, Package, Leaf, Armchair, Truck,
  Quote, MapPin, Zap, Users, Heart
} from 'lucide-react'
import { UniversalNav } from '@/components/UniversalNav'
import { MarketingFooter } from '@/components/MarketingFooter'
import {
  useDeviceType,
  useReducedMotion,
  useMobileReveal,
  mobileAnimationStyles,
} from '@/hooks/useMobileAnimation'

// ============================================
// LANDING PAGE
// Desktop: LOCKED - uses existing animation system
// Mobile: Uses new mobile animation engine
// ============================================

// ============================================
// DESKTOP ANIMATION SYSTEM (UNCHANGED)
// ============================================
function useDesktopScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

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
      { threshold, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// ============================================
// DATA
// ============================================
const floatingCards = [
  {
    id: 1,
    title: 'Handyman Help',
    subtitle: 'Available now',
    Icon: Wrench,
    gradient: 'from-cyan-400 to-blue-600',
    desktopPosition: 'top-[15%] right-[8%]',
    mobilePosition: { top: '12%', right: '4%' },
    rotation: 3,
    delay: 0,
    showOnMobile: true,
  },
  {
    id: 2,
    title: 'Deep Cleaning',
    subtitle: '$35/hr',
    Icon: Sparkles,
    gradient: 'from-emerald-400 to-teal-600',
    desktopPosition: 'top-[35%] left-[5%]',
    mobilePosition: { top: '18%', left: '4%' },
    rotation: -2,
    delay: 0.1,
    showOnMobile: true,
  },
  {
    id: 3,
    title: 'Moving Help',
    subtitle: '2 workers · $45/hr',
    Icon: Package,
    gradient: 'from-purple-400 to-pink-600',
    desktopPosition: 'bottom-[25%] left-[8%]',
    mobilePosition: { bottom: '35%', left: '4%' },
    rotation: -1,
    delay: 0.2,
    showOnMobile: false,
  },
  {
    id: 4,
    title: 'Job Complete!',
    subtitle: '+$127.50 earned',
    Icon: CheckCircle2,
    gradient: 'from-amber-400 to-orange-600',
    desktopPosition: 'bottom-[18%] right-[10%]',
    mobilePosition: { bottom: '30%', right: '4%' },
    rotation: 1,
    delay: 0.3,
    isSuccess: true,
    showOnMobile: false,
  },
]

const categories = [
  { name: 'Cleaning', Icon: Sparkles, count: '1.2K', hot: true, gradient: 'from-cyan-400 to-blue-500' },
  { name: 'Moving', Icon: Package, count: '890', gradient: 'from-purple-400 to-pink-500' },
  { name: 'Handyman', Icon: Wrench, count: '1.5K', hot: true, gradient: 'from-amber-400 to-orange-500' },
  { name: 'Yard Work', Icon: Leaf, count: '720', gradient: 'from-emerald-400 to-teal-500' },
  { name: 'Assembly', Icon: Armchair, count: '430', gradient: 'from-indigo-400 to-violet-500' },
  { name: 'Delivery', Icon: Truck, count: '560', gradient: 'from-rose-400 to-red-500' },
]

const trustBadges = [
  { label: 'Background Checked', icon: Shield },
  { label: 'Verified Reviews', icon: BadgeCheck },
  { label: 'Secure Payments', icon: Lock },
]

// ============================================
// MOBILE FLOATING CARD COMPONENT
// Uses CSS keyframes - no JS animation
// ============================================
function MobileFloatingCard({
  card,
  isVisible,
}: {
  card: typeof floatingCards[0]
  isVisible: boolean
}) {
  if (!card.showOnMobile) return null

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        ...card.mobilePosition,
        opacity: isVisible ? 1 : 0,
        transform: `rotate(${card.rotation}deg) translateY(${isVisible ? '0' : '12px'})`,
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        transitionDelay: `${card.delay}s`,
        animation: isVisible ? `mobileFloat 4s ease-in-out infinite ${card.delay}s` : 'none',
        ['--float-rotation' as string]: `${card.rotation}deg`,
      }}
    >
      <div
        className={`
          relative p-2 rounded-xl
          bg-slate-900/90 border border-white/10
          shadow-lg
          ${card.isSuccess ? 'border-emerald-500/30' : ''}
        `}
      >
        {card.isSuccess && (
          <div className="absolute inset-0 bg-emerald-500/10 rounded-xl" />
        )}
        <div className="relative flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}>
            <card.Icon className="w-3 h-3 text-white" />
          </div>
          <div>
            <div className="font-semibold text-white text-[9px] leading-tight">{card.title}</div>
            <div className={`text-[7px] leading-tight ${card.isSuccess ? 'text-emerald-400' : 'text-slate-400'}`}>
              {card.subtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// DESKTOP FLOATING CARD COMPONENT (UNCHANGED)
// ============================================
function DesktopFloatingCard({
  card,
  isVisible,
  reducedMotion,
}: {
  card: typeof floatingCards[0]
  isVisible: boolean
  reducedMotion: boolean
}) {
  return (
    <div
      className={`
        absolute ${card.desktopPosition}
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{
        transform: `rotate(${card.rotation}deg)`,
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
          animation: !reducedMotion ? `float-gentle 6s ease-in-out infinite ${card.delay}s` : 'none',
        }}
      >
        {card.isSuccess && (
          <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl" />
        )}
        <div className="relative flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
            <card.Icon className="w-5 h-5 text-white" />
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

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { isMobile, isTablet, isDesktop } = useDeviceType()
  const reducedMotion = useReducedMotion()

  // Desktop scroll reveals (unchanged)
  const desktopStatsReveal = useDesktopScrollReveal()
  const desktopCategoriesReveal = useDesktopScrollReveal()
  const desktopHowReveal = useDesktopScrollReveal()
  const desktopFeaturesReveal = useDesktopScrollReveal()
  const desktopTestimonialsReveal = useDesktopScrollReveal()
  const desktopCtaReveal = useDesktopScrollReveal()

  // Mobile scroll reveals (new system)
  const mobileStatsReveal = useMobileReveal({ rootMargin: '0px 0px -5% 0px', threshold: 0.05 })
  const mobileCategoriesReveal = useMobileReveal({ rootMargin: '0px 0px -5% 0px', threshold: 0.05 })
  const mobileHowReveal = useMobileReveal({ rootMargin: '0px 0px -5% 0px', threshold: 0.05 })
  const mobileFeaturesReveal = useMobileReveal({ rootMargin: '0px 0px -5% 0px', threshold: 0.05 })
  const mobileTestimonialsReveal = useMobileReveal({ rootMargin: '0px 0px -5% 0px', threshold: 0.05 })
  const mobileCtaReveal = useMobileReveal({ rootMargin: '0px 0px -5% 0px', threshold: 0.05 })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Choose which reveal system to use based on device
  const statsReveal = isMobile || isTablet ? mobileStatsReveal : desktopStatsReveal
  const categoriesReveal = isMobile || isTablet ? mobileCategoriesReveal : desktopCategoriesReveal
  const howReveal = isMobile || isTablet ? mobileHowReveal : desktopHowReveal
  const featuresReveal = isMobile || isTablet ? mobileFeaturesReveal : desktopFeaturesReveal
  const testimonialsReveal = isMobile || isTablet ? mobileTestimonialsReveal : desktopTestimonialsReveal
  const ctaReveal = isMobile || isTablet ? mobileCtaReveal : desktopCtaReveal

  return (
    <div className="min-h-screen min-h-[100dvh] text-white bg-slate-950">
      {/* Inject mobile animation CSS */}
      <style dangerouslySetInnerHTML={{ __html: mobileAnimationStyles }} />

      <UniversalNav variant="marketing" />

      {/* ============ HERO ============ */}
      <section className={`
        relative flex items-center
        min-h-screen min-h-[100dvh]
        pt-20 pb-8 md:pt-16 md:pb-0
      `}>

        {/* ====== BACKGROUND ====== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

          {/* Glow spots - static on mobile, animated on desktop */}
          <div
            className={`
              absolute top-1/4 left-1/4
              w-[200px] h-[200px] md:w-[500px] md:h-[500px]
              bg-cyan-500/15 rounded-full
              blur-[60px] md:blur-[100px]
              ${!reducedMotion && isDesktop ? 'animate-pulse-slow' : ''}
            `}
          />
          <div
            className={`
              absolute bottom-1/4 right-1/4
              w-[150px] h-[150px] md:w-[400px] md:h-[400px]
              bg-blue-600/10 rounded-full
              blur-[50px] md:blur-[80px]
              ${!reducedMotion && isDesktop ? 'animate-pulse-slow' : ''}
            `}
            style={{ animationDelay: '2s' }}
          />

          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.02] md:opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* ====== FLOATING CARDS ====== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {floatingCards.map((card) => (
            isMobile || isTablet ? (
              <MobileFloatingCard
                key={`mobile-${card.id}`}
                card={card}
                isVisible={mounted && !reducedMotion}
              />
            ) : (
              <DesktopFloatingCard
                key={`desktop-${card.id}`}
                card={card}
                isVisible={mounted}
                reducedMotion={reducedMotion}
              />
            )
          ))}
        </div>

        {/* ====== HERO CONTENT ====== */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="text-center max-w-4xl mx-auto">
            {/* Live indicator */}
            <div
              className={`
                inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5
                bg-slate-900/80 border border-white/10 rounded-full
                mb-6 sm:mb-10
              `}
              style={isMobile ? {
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
              } : {
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.5s ease-out',
              }}
            >
              <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                {!reducedMotion && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" style={{ animationDuration: '2s' }}></span>
                )}
                <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs sm:text-sm text-slate-300">
                <span className="font-bold text-white">2,847</span> workers active
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-[2rem] leading-[1.1] sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight sm:leading-[0.95]"
              style={isMobile ? {
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s',
              } : {
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.5s ease-out 0.1s',
              }}
            >
              <span className="text-white">Get help</span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"> today.</span>
              <br />
              <span className="text-white">Not</span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"> next week.</span>
            </h1>

            {/* Subheadline */}
            <p
              className="mt-4 sm:mt-8 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0"
              style={isMobile ? {
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.5s ease-out 0.2s, transform 0.5s ease-out 0.2s',
              } : {
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.5s ease-out 0.2s',
              }}
            >
              Hire verified local workers for cleaning, moving, handyman work, and more.
              {isDesktop && <> Average match time: <span className="text-cyan-400 font-semibold">4 minutes</span>.</>}
            </p>

            {/* CTA Buttons */}
            <div
              className="mt-6 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
              style={isMobile ? {
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.5s ease-out 0.3s, transform 0.5s ease-out 0.3s',
              } : {
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.5s ease-out 0.3s',
              }}
            >
              <Link
                href="/create-account?mode=hire"
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-2xl shadow-cyan-500/25 w-full sm:w-auto"
                data-qa="cta-hire-help"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2 px-6 sm:px-10 py-3.5 sm:py-5 text-sm sm:text-lg font-semibold">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                  Hire Help Now
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              <Link
                href="/create-account?mode=work"
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl w-full sm:w-auto"
                data-qa="cta-find-work"
              >
                <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-xl sm:rounded-2xl group-hover:border-emerald-400/60 transition-colors" />
                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                <span className="relative flex items-center justify-center gap-2 px-6 sm:px-10 py-3.5 sm:py-5 text-sm sm:text-lg font-semibold text-emerald-400">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                  Start Earning
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className="mt-6 sm:mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-8"
              style={isMobile ? {
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'opacity 0.5s ease-out 0.4s, transform 0.5s ease-out 0.4s',
              } : {
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.5s ease-out 0.4s',
              }}
            >
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
                  <badge.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                  <span className="text-xs sm:text-sm">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section
        ref={statsReveal.ref}
        className="py-6 sm:py-8 border-y border-white/5 bg-slate-900/30"
      >
        <div
          className="max-w-5xl mx-auto px-5 sm:px-6"
          style={isMobile || isTablet ? mobileStatsReveal.style : {
            opacity: desktopStatsReveal.isVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-out',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: '50K+', label: 'Jobs Completed', icon: CheckCircle2 },
              { value: '12K+', label: 'Verified Workers', icon: BadgeCheck },
              { value: '4.9', label: 'Average Rating', icon: Star },
              { value: '4 min', label: 'Avg Match Time', icon: Clock },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="text-center"
                style={isMobile || isTablet ? {
                  opacity: mobileStatsReveal.isVisible ? 1 : 0,
                  transform: mobileStatsReveal.isVisible ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.4s ease-out ${i * 50}ms, transform 0.4s ease-out ${i * 50}ms`,
                } : {
                  opacity: desktopStatsReveal.isVisible ? 1 : 0,
                  transform: desktopStatsReveal.isVisible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `all 0.5s ease-out ${i * 50}ms`,
                }}
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                  <span className="text-xl sm:text-3xl font-black text-white">{stat.value}</span>
                </div>
                <span className="text-[10px] sm:text-sm text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section ref={categoriesReveal.ref} className="py-10 sm:py-16">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4 mb-5 sm:mb-8"
            style={isMobile || isTablet ? mobileCategoriesReveal.style : {
              opacity: desktopCategoriesReveal.isVisible ? 1 : 0,
              transform: desktopCategoriesReveal.isVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.5s ease-out',
            }}
          >
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-white">
                What do you need?
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-0.5 sm:mt-1">Browse popular categories</p>
            </div>
            <Link href="/categories" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                href={`/cities?category=${cat.name.toLowerCase()}`}
                className="group relative p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 hover:bg-slate-900/60 transition-all duration-300"
                style={isMobile || isTablet ? {
                  opacity: mobileCategoriesReveal.isVisible ? 1 : 0,
                  transform: mobileCategoriesReveal.isVisible ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.4s ease-out ${i * 50}ms, transform 0.4s ease-out ${i * 50}ms`,
                } : {
                  opacity: desktopCategoriesReveal.isVisible ? 1 : 0,
                  transform: desktopCategoriesReveal.isVisible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `all 0.5s ease-out ${i * 50}ms`,
                }}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                    <cat.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h3 className="font-semibold text-white text-sm sm:text-base group-hover:text-cyan-400 transition-colors truncate">{cat.name}</h3>
                      {cat.hot && (
                        <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-500">{cat.count} jobs</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 hidden sm:block" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section ref={howReveal.ref} className="py-10 sm:py-16 border-y border-white/5 bg-slate-900/20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div
            style={isMobile || isTablet ? mobileHowReveal.style : {
              opacity: desktopHowReveal.isVisible ? 1 : 0,
              transform: desktopHowReveal.isVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.5s ease-out',
            }}
          >
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-5 sm:mb-8 text-center sm:text-left">
              How it works
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { step: '1', title: 'Post your job', desc: 'Describe what you need in under 2 minutes.', color: 'cyan' },
                { step: '2', title: 'Get matched', desc: 'AI matches you with verified workers.', color: 'blue' },
                { step: '3', title: 'Work gets done', desc: 'Track progress. Pay when satisfied.', color: 'emerald' },
              ].map((item, i) => (
                <div
                  key={item.step}
                  className="flex items-start gap-3 sm:gap-4"
                  style={isMobile || isTablet ? {
                    opacity: mobileHowReveal.isVisible ? 1 : 0,
                    transform: mobileHowReveal.isVisible ? 'translateY(0)' : 'translateY(12px)',
                    transition: `opacity 0.4s ease-out ${i * 75}ms, transform 0.4s ease-out ${i * 75}ms`,
                  } : {
                    opacity: desktopHowReveal.isVisible ? 1 : 0,
                    transform: desktopHowReveal.isVisible ? 'translateY(0)' : 'translateY(16px)',
                    transition: `all 0.5s ease-out ${i * 75}ms`,
                  }}
                >
                  <div className={`
                    shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg
                    ${item.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' :
                      item.color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-emerald-500/10 text-emerald-400'}
                  `}>
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm sm:text-base mb-0.5 sm:mb-1">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY CREWLINK ============ */}
      <section ref={featuresReveal.ref} className="py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div
            className="text-center mb-8 sm:mb-12"
            style={isMobile || isTablet ? mobileFeaturesReveal.style : {
              opacity: desktopFeaturesReveal.isVisible ? 1 : 0,
              transform: desktopFeaturesReveal.isVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.5s ease-out',
            }}
          >
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
              Why people choose CrewLink
            </h2>
            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
              Built for trust, speed, and reliability from the ground up.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { icon: Shield, title: 'Verified Workers', desc: 'Every worker passes background checks and identity verification.', color: 'emerald' },
              { icon: Zap, title: 'Instant Matching', desc: 'AI-powered matching connects you with the right person in minutes.', color: 'cyan' },
              { icon: Lock, title: 'Secure Payments', desc: 'Funds held safely until work is complete and approved.', color: 'blue' },
              { icon: MapPin, title: 'Local Focus', desc: 'Find help right in your neighborhood with real-time availability.', color: 'purple' },
              { icon: Star, title: 'Trusted Reviews', desc: 'Transparent ratings from real clients build accountability.', color: 'amber' },
              { icon: Heart, title: 'Fair Pay', desc: 'Workers set their own rates. No middleman markups.', color: 'rose' },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="group p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all duration-300"
                style={isMobile || isTablet ? {
                  opacity: mobileFeaturesReveal.isVisible ? 1 : 0,
                  transform: mobileFeaturesReveal.isVisible ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.4s ease-out ${i * 50}ms, transform 0.4s ease-out ${i * 50}ms`,
                } : {
                  opacity: desktopFeaturesReveal.isVisible ? 1 : 0,
                  transform: desktopFeaturesReveal.isVisible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `all 0.5s ease-out ${i * 60}ms`,
                }}
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 ${
                  feature.color === 'emerald' ? 'bg-emerald-500/10' :
                  feature.color === 'cyan' ? 'bg-cyan-500/10' :
                  feature.color === 'blue' ? 'bg-blue-500/10' :
                  feature.color === 'purple' ? 'bg-purple-500/10' :
                  feature.color === 'amber' ? 'bg-amber-500/10' :
                  'bg-rose-500/10'
                }`}>
                  <feature.icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${
                    feature.color === 'emerald' ? 'text-emerald-400' :
                    feature.color === 'cyan' ? 'text-cyan-400' :
                    feature.color === 'blue' ? 'text-blue-400' :
                    feature.color === 'purple' ? 'text-purple-400' :
                    feature.color === 'amber' ? 'text-amber-400' :
                    'text-rose-400'
                  }`} />
                </div>
                <h3 className="font-semibold text-white text-sm sm:text-base mb-1">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section ref={testimonialsReveal.ref} className="py-14 sm:py-20 border-y border-white/5 bg-slate-900/20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div
            className="text-center mb-8 sm:mb-12"
            style={isMobile || isTablet ? mobileTestimonialsReveal.style : {
              opacity: desktopTestimonialsReveal.isVisible ? 1 : 0,
              transform: desktopTestimonialsReveal.isVisible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 0.5s ease-out',
            }}
          >
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
              Trusted by thousands
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Real feedback from hirers and workers on the platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                quote: 'Found a cleaner in 10 minutes. She was professional, thorough, and reasonably priced. Will definitely use again.',
                name: 'Rachel K.',
                role: 'Hirer',
                rating: 5,
                gradient: 'from-cyan-400 to-blue-600',
              },
              {
                quote: 'I make more per hour than my old job, pick my own schedule, and get paid fast. CrewLink changed everything for me.',
                name: 'Marcus T.',
                role: 'Worker',
                rating: 5,
                gradient: 'from-emerald-400 to-teal-600',
              },
              {
                quote: 'The background checks and reviews gave me confidence. Hired a handyman for a weekend project — perfect work.',
                name: 'David L.',
                role: 'Hirer',
                rating: 5,
                gradient: 'from-purple-400 to-pink-600',
              },
            ].map((testimonial, i) => (
              <div
                key={testimonial.name}
                className="p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col"
                style={isMobile || isTablet ? {
                  opacity: mobileTestimonialsReveal.isVisible ? 1 : 0,
                  transform: mobileTestimonialsReveal.isVisible ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.4s ease-out ${i * 75}ms, transform 0.4s ease-out ${i * 75}ms`,
                } : {
                  opacity: desktopTestimonialsReveal.isVisible ? 1 : 0,
                  transform: desktopTestimonialsReveal.isVisible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `all 0.5s ease-out ${i * 75}ms`,
                }}
              >
                <Quote className="w-5 h-5 text-slate-600 mb-3 shrink-0" />
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed flex-1 mb-4">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{testimonial.name}</div>
                    <div className="text-xs text-slate-500">{testimonial.role}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BOTTOM CTA ============ */}
      <section ref={ctaReveal.ref} className="py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-cyan-500/20 p-6 sm:p-10 text-center"
            style={isMobile || isTablet ? mobileCtaReveal.style : {
              opacity: desktopCtaReveal.isVisible ? 1 : 0,
              transform: desktopCtaReveal.isVisible ? 'scale(1)' : 'scale(0.98)',
              transition: 'all 0.5s ease-out',
            }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">
                Ready to get started?
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8 max-w-md mx-auto">
                Create your free account in under a minute. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/create-account?mode=hire"
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg shadow-cyan-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white">
                    <Briefcase className="w-4 h-4" />
                    Start Hiring
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link
                  href="/create-account?mode=work"
                  className="group relative overflow-hidden rounded-xl sm:rounded-2xl"
                >
                  <div className="absolute inset-0 border-2 border-emerald-500/40 rounded-xl sm:rounded-2xl group-hover:border-emerald-400/60 transition-colors" />
                  <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                  <span className="relative flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                    Start Earning
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />

      {/* ====== DESKTOP ANIMATION STYLES (UNCHANGED) ====== */}
      <style jsx global>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

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
