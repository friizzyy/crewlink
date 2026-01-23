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
    glow1: 'rgba(6, 182, 212, 0.10)', // cyan-500 - top left
    glow2: 'rgba(37, 99, 235, 0.10)', // blue-600 - bottom right
    glow3: 'rgba(139, 92, 246, 0.05)', // purple-600 - center
    // Floating boxes
    box: 'rgba(6, 182, 212, 0.03)', // cyan for boxes
    boxBorder: 'rgba(6, 182, 212, 0.08)',
    // Grid
    gridLine: 'rgba(6, 182, 212, 0.05)',
    // Scan line
    scanLine: 'rgba(6, 182, 212, 0.05)',
  },
  // Animation speeds (in seconds)
  speeds: {
    low: { box: 60, scan: 12 },
    normal: { box: 40, scan: 8 },
    high: { box: 25, scan: 5 },
  },
  // Opacity levels
  opacity: {
    low: { glow: 0.5, box: 0.3, grid: 0.3 },
    normal: { glow: 1, box: 0.6, grid: 0.5 },
    high: { glow: 1, box: 0.9, grid: 0.7 },
  },
  // Blur amounts
  blur: {
    glow: '100px',
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
        transform: `rotate(${props.rotation}deg)`,
        background: backgroundTokens.colors.box,
        border: `1px solid ${backgroundTokens.colors.boxBorder}`,
        filter: `blur(${backgroundTokens.blur.box})`,
        opacity: opacityMultiplier,
        animation: reducedMotion
          ? 'none'
          : `ambientBoxFloat ${props.duration}s ease-in-out infinite ${props.delay}s, ambientBoxBreath ${props.duration * 0.6}s ease-in-out infinite ${props.delay}s`,
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

    // Check for reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(motionQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
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
      {/* CSS Keyframes - injected once */}
      <style jsx global>{`
        @keyframes ambientBoxFloat {
          0%, 100% {
            transform: translate(0, 0) rotate(var(--rotation, 0deg)) scale(1);
          }
          25% {
            transform: translate(15px, -20px) rotate(calc(var(--rotation, 0deg) + 3deg)) scale(1.02);
          }
          50% {
            transform: translate(-10px, 10px) rotate(calc(var(--rotation, 0deg) - 2deg)) scale(0.98);
          }
          75% {
            transform: translate(5px, 15px) rotate(calc(var(--rotation, 0deg) + 1deg)) scale(1.01);
          }
        }

        @keyframes ambientBoxBreath {
          0%, 100% {
            opacity: var(--base-opacity, 0.6);
          }
          50% {
            opacity: calc(var(--base-opacity, 0.6) * 0.7);
          }
        }

        @keyframes scanLine {
          0% { top: -10%; }
          100% { top: 110%; }
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

        {/* Scanning line effect - from Option E */}
        <div
          className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent"
          style={{
            animation: reducedMotion ? 'none' : `scanLine ${speeds.scan}s linear infinite`,
          }}
        />

        {/* Glow spots - from Option E */}
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
