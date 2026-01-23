'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ============================================
// MOTION SYSTEM - CrewLink Design System
// Fast, snappy animations optimized for mobile
// ============================================

// Motion constants - optimized for mobile performance
export const MOTION = {
  // Durations - FAST for mobile
  duration: {
    fast: 150,
    normal: 300,
    slow: 400,
    reveal: 400, // Reduced from 800ms
  },
  // Easing curves
  easing: {
    default: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // Smooth and fast
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  // Distances - smaller for snappier feel
  distance: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  // Stagger delays - reduced for faster cascade
  stagger: 40, // Reduced from 80ms
} as const

// Hook options
interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  delay?: number
}

// Hook for scroll-triggered reveal animations - OPTIMIZED
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: UseScrollRevealOptions = {}
) {
  const {
    threshold = 0.05, // Lower threshold = triggers earlier
    rootMargin = '0px 0px -20px 0px', // Smaller margin = triggers sooner
    triggerOnce = true,
    delay = 0,
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        setIsVisible(true)
        hasAnimatedRef.current = true
        return
      }
    }

    const element = ref.current
    if (!element) return

    // NO DELAY - observe immediately
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!triggerOnce || !hasAnimatedRef.current)) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true)
              hasAnimatedRef.current = true
            }, delay)
          } else {
            setIsVisible(true)
            hasAnimatedRef.current = true
          }
        } else if (!triggerOnce && !entry.isIntersecting) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce, delay])

  return { ref, isVisible }
}

// Hook for staggered children animations
export function useStaggeredReveal(itemCount: number, baseDelay = 0) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  const getStaggerDelay = useCallback((index: number) => {
    return baseDelay + (index * MOTION.stagger)
  }, [baseDelay])

  const getStaggerStyle = useCallback((index: number) => ({
    transitionDelay: `${getStaggerDelay(index)}ms`,
  }), [getStaggerDelay])

  return { ref, isVisible, getStaggerDelay, getStaggerStyle }
}

// CSS class helpers for reveal animations
export const revealClasses = {
  // Base hidden state - smaller translate for snappier feel
  hidden: 'opacity-0 translate-y-4',
  hiddenLeft: 'opacity-0 -translate-x-4',
  hiddenRight: 'opacity-0 translate-x-4',
  hiddenScale: 'opacity-0 scale-95',

  // Visible state
  visible: 'opacity-100 translate-y-0',
  visibleX: 'opacity-100 translate-x-0',
  visibleScale: 'opacity-100 scale-100',

  // Transition classes - FAST
  transition: `transition-[transform,opacity] duration-300 ease-out`,
  transitionFast: `transition-[transform,opacity] duration-200 ease-out`,
}

// Utility to build reveal class string - OPTIMIZED FOR MOBILE
export function getRevealClasses(
  isVisible: boolean,
  variant: 'up' | 'left' | 'right' | 'scale' = 'up'
) {
  // Fast transition, no will-change (can hurt performance if overused)
  const baseTransition = 'transition-[transform,opacity] duration-400 ease-out'

  const hiddenMap = {
    up: 'opacity-0 translate-y-4',
    left: 'opacity-0 -translate-x-4',
    right: 'opacity-0 translate-x-4',
    scale: 'opacity-0 scale-95',
  }

  const visibleMap = {
    up: 'opacity-100 translate-y-0',
    left: 'opacity-100 translate-x-0',
    right: 'opacity-100 translate-x-0',
    scale: 'opacity-100 scale-100',
  }

  return `${baseTransition} ${isVisible ? visibleMap[variant] : hiddenMap[variant]}`
}
