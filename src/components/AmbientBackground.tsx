'use client'

import { useEffect, useState, useMemo } from 'react'

// ============================================
// DESIGN TOKENS FOR BACKGROUND
// ============================================
export const backgroundTokens = {
  // Base colors (derived from CrewLink brand - Cyber Matrix style)
  colors: {
    base: 'rgb(2, 6, 23)', // slate-950
    // Glow spots from original Option E
    glow1: 'rgba(6, 182, 212, 0.05)', // cyan-500 - top left
    glow2: 'rgba(37, 99, 235, 0.05)', // blue-600 - bottom right
    glow3: 'rgba(139, 92, 246, 0.02)', // purple-600 - center
    // Floating boxes
    box: 'rgba(6, 182, 212, 0.03)', // cyan for boxes
    boxBorder: 'rgba(6, 182, 212, 0.08)',
    // Grid
    gridLine: 'rgba(6, 182, 212, 0.025)',
  },
  // Animation speeds (in seconds)
  speeds: {
    low: { box: 80 },
    normal: { box: 60 },
    high: { box: 35 },
  },
  // Opacity levels
  opacity: {
    low: { glow: 0.5, box: 0.3, grid: 0.3 },
    normal: { glow: 1, box: 0.6, grid: 0.5 },
    high: { glow: 1, box: 0.9, grid: 0.7 },
  },
  // Blur amounts
  blur: {
    glow: '80px',
    box: '40px',
  },
  // Box density (number of boxes)
  density: {
    low: 6,
    normal: 10,
    high: 14,
  },
}

export type BackgroundIntensity = 'low' | 'normal' | 'high'

// ============================================
// BACKGROUND STORE (localStorage persistence)
// ============================================
const STORAGE_KEY = 'crewlink-background-intensity'

export function getStoredIntensity(): BackgroundIntensity {
  if (typeof window === 'undefined') return 'normal'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'low' || stored === 'normal' || stored === 'high') {
    return stored
  }
  return 'normal'
}

export function setStoredIntensity(intensity: BackgroundIntensity): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, intensity)
  // Dispatch custom event for other components to listen
  window.dispatchEvent(new CustomEvent('background-intensity-change', { detail: intensity }))
}

// ============================================
// AMBIENT BOX COMPONENT
// ============================================
interface AmbientBoxProps {
  index: number
  intensity: BackgroundIntensity
  reducedMotion: boolean
}

function AmbientBox({ index, intensity, reducedMotion }: AmbientBoxProps) {
  // Generate deterministic but varied properties based on index
  const seed = index * 137.5 // Golden angle for distribution

  const props = useMemo(() => {
    const size = 80 + (index % 5) * 60 // 80-320px
    const left = (seed % 100)
    const top = ((seed * 1.618) % 100)
    const rotation = (seed * 2.5) % 30 - 15 // -15 to 15 degrees
    const delay = (index * 0.8) % 8 // Stagger animations
    const duration = backgroundTokens.speeds[intensity].box + (index % 10) * 2

    return { size, left, top, rotation, delay, duration }
  }, [index, intensity, seed])

  const opacityMultiplier = backgroundTokens.opacity[intensity].box

  return (
    <div
      className="absolute rounded-3xl pointer-events-none"
      style={{
        width: `${props.size}px`,
        height: `${props.size}px`,
        left: `${props.left}%`,
        top: `${props.top}%`,
        transform: `rotate(${props.rotation}deg) translateZ(0)`,
        WebkitTransform: `rotate(${props.rotation}deg) translateZ(0)`,
        background: backgroundTokens.colors.box,
        border: `1px solid ${backgroundTokens.colors.boxBorder}`,
        filter: `blur(${backgroundTokens.blur.box})`,
        WebkitFilter: `blur(${backgroundTokens.blur.box})`,
        opacity: opacityMultiplier,
        WebkitAnimation: reducedMotion
          ? 'none'
          : `ambientBoxFloat ${props.duration}s ease-in-out infinite ${props.delay}s`,
        animation: reducedMotion
          ? 'none'
          : `ambientBoxFloat ${props.duration}s ease-in-out infinite ${props.delay}s`,
        willChange: reducedMotion ? 'auto' : 'transform, opacity',
      }}
    />
  )
}

// ============================================
// AMBIENT BACKGROUND COMPONENT
// ============================================
interface AmbientBackgroundProps {
  /** Override intensity (otherwise uses stored preference) */
  intensity?: BackgroundIntensity
  /** Additional className for the container */
  className?: string
}

export function AmbientBackground({ intensity: propIntensity, className = '' }: AmbientBackgroundProps) {
  const [intensity, setIntensity] = useState<BackgroundIntensity>('normal')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage and listen for changes
  useEffect(() => {
    setMounted(true)

    // Check for reduced motion preference OR mobile Safari (performance)
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isMobileSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && /WebKit/.test(navigator.userAgent)
    const isMobile = window.innerWidth < 768

    // Disable animations on mobile Safari or if user prefers reduced motion
    setReducedMotion(motionQuery.matches || (isMobileSafari && isMobile))

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches || (isMobileSafari && isMobile))
    }
    motionQuery.addEventListener('change', handleMotionChange)

    // Get stored intensity
    if (!propIntensity) {
      setIntensity(getStoredIntensity())
    }

    // Listen for intensity changes from settings
    const handleIntensityChange = (e: CustomEvent<BackgroundIntensity>) => {
      if (!propIntensity) {
        setIntensity(e.detail)
      }
    }
    window.addEventListener('background-intensity-change', handleIntensityChange as EventListener)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      window.removeEventListener('background-intensity-change', handleIntensityChange as EventListener)
    }
  }, [propIntensity])

  // Use prop intensity if provided
  const effectiveIntensity = propIntensity || intensity
  const boxCount = backgroundTokens.density[effectiveIntensity]
  const opacityLevel = backgroundTokens.opacity[effectiveIntensity]
  const speeds = backgroundTokens.speeds[effectiveIntensity]

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className={`fixed inset-0 z-0 pointer-events-none ${className}`}>
        <div className="absolute inset-0 bg-slate-950" />
      </div>
    )
  }

  return (
    <>
      {/* CSS Keyframes - injected once with webkit prefixes for Safari */}
      <style jsx global>{`
        @-webkit-keyframes ambientBoxFloat {
          0%, 100% {
            -webkit-transform: translate3d(0, 0, 0) scale(1);
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            -webkit-transform: translate3d(-10px, 10px, 0) scale(0.98);
            transform: translate3d(-10px, 10px, 0) scale(0.98);
          }
        }
        @keyframes ambientBoxFloat {
          0%, 100% {
            -webkit-transform: translate3d(0, 0, 0) scale(1);
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            -webkit-transform: translate3d(-10px, 10px, 0) scale(0.98);
            transform: translate3d(-10px, 10px, 0) scale(0.98);
          }
        }

        @-webkit-keyframes ambientBoxBreath {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.4; }
        }
        @keyframes ambientBoxBreath {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.4; }
        }

        @-webkit-keyframes glowPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Background Container - fixed, full-bleed, z-0 */}
      <div
        className={`fixed inset-0 z-0 pointer-events-none overflow-hidden ${className}`}
        aria-hidden="true"
      >
        {/* Base gradient - from Option E */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

        {/* Matrix Grid Lines - from Option E */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(${backgroundTokens.colors.gridLine} 1px, transparent 1px),
              linear-gradient(90deg, ${backgroundTokens.colors.gridLine} 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            opacity: opacityLevel.grid,
          }}
        />

        {/* Glow spots */}
        <div
          className="absolute top-20 left-20 w-96 h-96 rounded-full"
          style={{
            background: backgroundTokens.colors.glow1,
            filter: `blur(${backgroundTokens.blur.glow})`,
            opacity: opacityLevel.glow,
          }}
        />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full"
          style={{
            background: backgroundTokens.colors.glow2,
            filter: `blur(${backgroundTokens.blur.glow})`,
            opacity: opacityLevel.glow,
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: backgroundTokens.colors.glow3,
            filter: 'blur(120px)',
            opacity: opacityLevel.glow,
          }}
        />

        {/* Drifting rounded boxes - the moving element */}
        {Array.from({ length: boxCount }).map((_, i) => (
          <AmbientBox
            key={i}
            index={i}
            intensity={effectiveIntensity}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      {/* Readability scrim - sits above background but below content */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(to bottom, rgba(2, 6, 23, 0.2) 0%, rgba(2, 6, 23, 0.05) 50%, rgba(2, 6, 23, 0.2) 100%)',
        }}
      />
    </>
  )
}

export default AmbientBackground
