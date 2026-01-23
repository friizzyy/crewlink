'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ============================================
// MOTION SYSTEM - CrewLink Design System
// Consistent, restrained animations for premium feel
// ============================================

// Motion constants - single source of truth
export const MOTION = {
  // Durations
  duration: {
    fast: 200,
    normal: 400,
    slow: 600,
    reveal: 800,
  },
  // Easing curves
  easing: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth decelerate
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Subtle bounce
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)', // Material-like
  },
  // Distances
  distance: {
    sm: 12,
    md: 24,
    lg: 40,
  },
  // Stagger delays
  stagger: 80,
} as const

// Hook options
interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  delay?: number
}

// Hook for scroll-triggered reveal animations
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options: UseScrollRevealOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0,
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Check for reduced motion preference
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        setIsVisible(true)
        setHasAnimated(true)
        return
      }
    }

    const element = ref.current
    if (!element) return

    // Small delay to ensure CSS is painted before observing
    const initTimer = setTimeout(() => {
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && (!triggerOnce || !hasAnimated)) {
            // Use requestAnimationFrame for smooth animation start
            requestAnimationFrame(() => {
              if (delay > 0) {
                setTimeout(() => {
                  setIsVisible(true)
                  setHasAnimated(true)
                }, delay)
              } else {
                setIsVisible(true)
                setHasAnimated(true)
              }
            })
          } else if (!triggerOnce && !entry.isIntersecting) {
            setIsVisible(false)
          }
        },
        { threshold, rootMargin }
      )

      observerRef.current.observe(element)
    }, 100) // 100ms delay ensures CSS is ready

    return () => {
      clearTimeout(initTimer)
      observerRef.current?.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce, delay, hasAnimated])

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
  // Base hidden state
  hidden: 'opacity-0 translate-y-6',
  hiddenLeft: 'opacity-0 -translate-x-6',
  hiddenRight: 'opacity-0 translate-x-6',
  hiddenScale: 'opacity-0 scale-95',

  // Visible state
  visible: 'opacity-100 translate-y-0',
  visibleX: 'opacity-100 translate-x-0',
  visibleScale: 'opacity-100 scale-100',

  // Transition classes
  transition: `transition-all duration-[${MOTION.duration.reveal}ms] ease-[${MOTION.easing.default}]`,
  transitionFast: `transition-all duration-[${MOTION.duration.normal}ms] ease-[${MOTION.easing.default}]`,
}

// Utility to build reveal class string
export function getRevealClasses(
  isVisible: boolean,
  variant: 'up' | 'left' | 'right' | 'scale' = 'up'
) {
  // GPU-accelerated transition with will-change for smooth mobile performance
  const baseTransition = 'transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,opacity]'

  const hiddenMap = {
    up: 'opacity-0 translate-y-6',
    left: 'opacity-0 -translate-x-6',
    right: 'opacity-0 translate-x-6',
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
