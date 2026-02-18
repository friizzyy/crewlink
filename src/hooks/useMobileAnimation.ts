'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================
// MOBILE ANIMATION ENGINE
// Separate animation system for mobile/tablet
// Desktop uses existing animation system unchanged
// ============================================

// Breakpoint constants - single source of truth
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const

// ============================================
// DEVICE DETECTION HOOK
// Stable across hydration with mounted check
// ============================================
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<{
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    mounted: boolean
  }>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    mounted: false,
  })

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setDeviceType({
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.tablet,
        mounted: true,
      })
    }

    // Debounced resize handler to avoid excessive recalculations
    let resizeTimeout: NodeJS.Timeout
    const debouncedCheck = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(checkDevice, 150)
    }

    checkDevice()
    window.addEventListener('resize', debouncedCheck)
    return () => {
      window.removeEventListener('resize', debouncedCheck)
      clearTimeout(resizeTimeout)
    }
  }, [])

  return deviceType
}

// ============================================
// REDUCED MOTION DETECTION
// ============================================
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return reducedMotion
}

// ============================================
// MOBILE REVEAL HOOK
// Uses IntersectionObserver - no scroll listeners
// Fails safe: if observer errors, content is visible
// ============================================
interface MobileRevealOptions {
  /** Trigger once or repeat on each intersection */
  once?: boolean
  /** Root margin for earlier/later trigger. Default: '0px 0px -10% 0px' */
  rootMargin?: string
  /** Intersection threshold. Default: 0.1 */
  threshold?: number
  /** Delay before animation starts (ms). Default: 0 */
  delay?: number
  /** Disable animation entirely */
  disabled?: boolean
}

interface MobileRevealReturn {
  ref: React.RefObject<HTMLDivElement>
  isVisible: boolean
  /** Animation style object to apply */
  style: React.CSSProperties
  /** Animation className to apply */
  className: string
}

export function useMobileReveal(options: MobileRevealOptions = {}): MobileRevealReturn {
  const {
    once = true,
    rootMargin = '0px 0px -10% 0px',
    threshold = 0.1,
    delay = 0,
    disabled = false,
  } = options

  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const element = ref.current

    // Fail safe: if disabled, reduced motion, or no element, show content
    if (disabled || reducedMotion || !element) {
      setIsVisible(true)
      return
    }

    // Fail safe: if IntersectionObserver not supported, show content
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('[MobileReveal] IntersectionObserver not supported, showing content')
      setIsVisible(true)
      return
    }

    // If already animated in "once" mode, don't re-observe
    if (once && hasAnimated) {
      return
    }

    let timeoutId: NodeJS.Timeout | null = null

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            timeoutId = setTimeout(() => {
              setIsVisible(true)
              setHasAnimated(true)
            }, delay)
          } else {
            setIsVisible(true)
            setHasAnimated(true)
          }

          if (once) {
            observer.disconnect()
          }
        } else if (!once) {
          setIsVisible(false)
          if (timeoutId) clearTimeout(timeoutId)
        }
      },
      { rootMargin, threshold }
    )

    try {
      observer.observe(element)
    } catch (error) {
      console.warn('[MobileReveal] Observer failed, showing content:', error)
      setIsVisible(true)
    }

    return () => {
      observer.disconnect()
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [once, rootMargin, threshold, delay, disabled, reducedMotion, hasAnimated])

  // Animation styles - subtle fade + small translate
  const style: React.CSSProperties = reducedMotion
    ? {} // No animation for reduced motion
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
      }

  const className = isVisible ? 'mobile-reveal-visible' : 'mobile-reveal-hidden'

  return { ref, isVisible, style, className }
}

// ============================================
// STAGGERED REVEAL FOR LISTS
// ============================================
interface StaggeredRevealOptions extends MobileRevealOptions {
  /** Number of items to stagger */
  itemCount: number
  /** Delay between each item (ms). Default: 50 */
  staggerDelay?: number
}

export function useStaggeredReveal(options: StaggeredRevealOptions) {
  const { itemCount, staggerDelay = 50, ...revealOptions } = options
  const reveal = useMobileReveal(revealOptions)

  const getItemStyle = useCallback(
    (index: number): React.CSSProperties => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reducedMotion) return {}

      return {
        opacity: reveal.isVisible ? 1 : 0,
        transform: reveal.isVisible ? 'translateY(0)' : 'translateY(12px)',
        transition: `opacity 0.4s ease-out ${index * staggerDelay}ms, transform 0.4s ease-out ${index * staggerDelay}ms`,
      }
    },
    [reveal.isVisible, staggerDelay]
  )

  return { ...reveal, getItemStyle }
}

// ============================================
// MOBILE HERO FLOATING CONFIG
// CSS keyframe-based - no JS animation loops
// ============================================
export interface FloatingElementConfig {
  id: string | number
  /** Position on mobile (absolute positioning) */
  position: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
  /** Rotation in degrees */
  rotation?: number
  /** Animation delay in seconds */
  delay?: number
  /** Whether to show on mobile */
  showOnMobile?: boolean
  /** Whether to show on tablet */
  showOnTablet?: boolean
  /** Custom animation duration */
  duration?: number
}

export function useMobileFloating(config: FloatingElementConfig) {
  const { isMobile, isTablet, mounted } = useDeviceType()
  const reducedMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(false)

  // Staggered entrance animation
  useEffect(() => {
    if (!mounted) return

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, (config.delay || 0) * 1000 + 100)

    return () => clearTimeout(timer)
  }, [mounted, config.delay])

  // Determine if element should render
  const shouldRender =
    mounted &&
    ((isMobile && config.showOnMobile !== false) ||
     (isTablet && config.showOnTablet !== false) ||
     (!isMobile && !isTablet))

  // Get animation style
  const getStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      ...config.position,
      pointerEvents: 'none',
      zIndex: 1,
    }

    // Entrance animation
    if (!isVisible) {
      return {
        ...baseStyle,
        opacity: 0,
        transform: `rotate(${config.rotation || 0}deg) translateY(20px)`,
      }
    }

    // Visible state
    if (reducedMotion) {
      return {
        ...baseStyle,
        opacity: 1,
        transform: `rotate(${config.rotation || 0}deg)`,
      }
    }

    // Mobile: CSS keyframe floating
    if (isMobile || isTablet) {
      return {
        ...baseStyle,
        opacity: 1,
        transform: `rotate(${config.rotation || 0}deg)`,
        animation: `mobileFloat ${config.duration || 4}s ease-in-out infinite`,
        animationDelay: `${config.delay || 0}s`,
        transition: 'opacity 0.5s ease-out',
      }
    }

    // Desktop: keep existing behavior (this hook shouldn't be used on desktop)
    return {
      ...baseStyle,
      opacity: 1,
      transform: `rotate(${config.rotation || 0}deg)`,
    }
  }

  return {
    shouldRender,
    isVisible,
    style: getStyle(),
    isMobile,
    isTablet,
    reducedMotion,
  }
}

// ============================================
// CSS KEYFRAMES (inject once via style tag)
// ============================================
export const mobileAnimationStyles = `
/* Mobile Animation Engine - CSS Keyframes */

/* Mobile floating - reduced amplitude, smooth */
@keyframes mobileFloat {
  0%, 100% {
    transform: translateY(0) rotate(var(--float-rotation, 0deg));
  }
  50% {
    transform: translateY(-6px) rotate(var(--float-rotation, 0deg));
  }
}

@-webkit-keyframes mobileFloat {
  0%, 100% {
    -webkit-transform: translateY(0) rotate(var(--float-rotation, 0deg));
    transform: translateY(0) rotate(var(--float-rotation, 0deg));
  }
  50% {
    -webkit-transform: translateY(-6px) rotate(var(--float-rotation, 0deg));
    transform: translateY(-6px) rotate(var(--float-rotation, 0deg));
  }
}

/* Mobile fade in */
@keyframes mobileFadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@-webkit-keyframes mobileFadeIn {
  from {
    opacity: 0;
    -webkit-transform: translateY(16px);
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
}

/* Mobile reveal classes */
.mobile-reveal-hidden {
  opacity: 0;
  transform: translateY(16px);
}

.mobile-reveal-visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

/* Reduced motion override */
@media (prefers-reduced-motion: reduce) {
  .mobile-reveal-hidden,
  .mobile-reveal-visible {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    animation: none !important;
  }
}
`

// ============================================
// DEBUG UTILITIES (dev only)
// ============================================
export function debugMobileAnimation(enabled = false) {
  if (!enabled || typeof window === 'undefined') return

  console.log('[MobileAnimation] Debug mode enabled')
  console.log('[MobileAnimation] Window width:', window.innerWidth)
  console.log('[MobileAnimation] Device pixel ratio:', window.devicePixelRatio)
  console.log(
    '[MobileAnimation] Reduced motion:',
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  console.log('[MobileAnimation] IntersectionObserver supported:', typeof IntersectionObserver !== 'undefined')
}
