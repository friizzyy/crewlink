// ============================================
// MAP EXPERIENCE DESIGN TOKENS
// Unified spacing, typography, motion, and color system
// for /work/map and /hiring/map experiences
// ============================================

// SPACING SCALE (8px base)
export const spacing = {
  '0': '0',
  '0.5': '2px',
  '1': '4px',
  '1.5': '6px',
  '2': '8px',
  '2.5': '10px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
} as const

// SIDEBAR DIMENSIONS
export const sidebar = {
  width: {
    default: '420px',
    expanded: '480px',
  },
  header: {
    padding: '20px', // p-5 equivalent
    gap: '16px',     // space-y-4 equivalent
  },
  content: {
    padding: '20px',
  },
  resultsBar: {
    paddingX: '20px',
    paddingY: '14px',
  },
} as const

// CARD DIMENSIONS
export const card = {
  padding: '16px',           // Consistent card padding
  iconSize: '48px',          // 12 * 4 = 48px (w-12 h-12)
  iconRadius: '12px',        // rounded-xl
  gap: '14px',               // Gap between icon and content
  titleSize: '15px',         // Slightly larger for better hierarchy
  metaSize: '13px',
  priceSize: '15px',
} as const

// BORDER RADIUS SCALE
export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
} as const

// MOTION TOKENS (respect prefers-reduced-motion)
export const motion = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    smooth: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',    // ease-out
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',    // expo-out
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // overshoot
    linear: 'linear',
  },
} as const

// COLOR MODES
export const modeColors = {
  work: {
    primary: 'emerald',
    gradient: {
      from: 'from-emerald-500',
      to: 'to-teal-600',
    },
    text: 'text-emerald-400',
    bg: 'bg-emerald-500',
    bgSubtle: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    borderActive: 'border-emerald-500/50',
    ring: 'ring-emerald-500/30',
    shadow: 'shadow-emerald-500/25',
    hover: 'hover:text-emerald-400',
    liveDot: 'green',
  },
  hire: {
    primary: 'cyan',
    gradient: {
      from: 'from-cyan-500',
      to: 'to-blue-600',
    },
    text: 'text-cyan-400',
    bg: 'bg-cyan-500',
    bgSubtle: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    borderActive: 'border-cyan-500/50',
    ring: 'ring-cyan-500/30',
    shadow: 'shadow-cyan-500/25',
    hover: 'hover:text-cyan-400',
    liveDot: 'cyan',
  },
} as const

// STATUS COLORS (urgency, application status, etc.)
export const statusColors = {
  urgent: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
    dot: 'bg-red-500',
  },
  today: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
  },
  scheduled: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    dot: 'bg-purple-500',
  },
  flexible: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-500',
  },
  active: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  pending: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-500',
  },
  accepted: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
} as const

// TYPOGRAPHY
export const typography = {
  // Headings
  h1: 'text-2xl font-bold tracking-tight',
  h2: 'text-xl font-semibold tracking-tight',
  h3: 'text-base font-semibold',

  // Body
  body: 'text-sm leading-relaxed',
  bodySmall: 'text-xs leading-relaxed',

  // Labels
  label: 'text-xs font-medium uppercase tracking-wider text-slate-500',

  // Prices / Key metrics
  price: 'text-lg font-semibold tabular-nums',
  priceSmall: 'text-base font-semibold tabular-nums',

  // Meta / secondary info
  meta: 'text-sm text-slate-400',
  metaSmall: 'text-xs text-slate-500',
} as const

// Z-INDEX LAYERS
export const zIndex = {
  base: 0,
  map: 10,
  sidebar: 20,
  overlay: 30,
  bottomSheet: 35,
  dropdown: 40,
  modal: 50,
  toast: 60,
} as const

// GLASSMORPHISM PRESETS
export const glass = {
  sidebar: 'bg-slate-900/95 backdrop-blur-xl',
  card: 'bg-slate-800/60 backdrop-blur-sm',
  panel: 'bg-slate-900/80 backdrop-blur-md',
  overlay: 'bg-slate-950/80 backdrop-blur-lg',
  input: 'bg-slate-800/50',
} as const

// SHADOWS
export const shadows = {
  sm: 'shadow-sm shadow-black/10',
  md: 'shadow-md shadow-black/15',
  lg: 'shadow-lg shadow-black/20',
  xl: 'shadow-xl shadow-black/25',
  glow: {
    cyan: 'shadow-lg shadow-cyan-500/20',
    emerald: 'shadow-lg shadow-emerald-500/20',
    purple: 'shadow-lg shadow-purple-500/20',
  },
} as const

// CSS VARIABLES FOR MOTION (inject in layout)
export const motionCSSVariables = `
  :root {
    --motion-duration-instant: 0ms;
    --motion-duration-fast: 150ms;
    --motion-duration-normal: 200ms;
    --motion-duration-smooth: 300ms;
    --motion-duration-slow: 500ms;
    --motion-easing-default: cubic-bezier(0.4, 0, 0.2, 1);
    --motion-easing-smooth: cubic-bezier(0.16, 1, 0.3, 1);
    --motion-easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    :root {
      --motion-duration-instant: 0ms;
      --motion-duration-fast: 0ms;
      --motion-duration-normal: 0ms;
      --motion-duration-smooth: 0ms;
      --motion-duration-slow: 0ms;
    }
  }
`

// ANIMATION KEYFRAMES (for global CSS)
export const keyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInFromBottom {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes shimmer {
    from { background-position: -200% 0; }
    to { background-position: 200% 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    @keyframes fadeInUp {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeInScale {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInFromBottom {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  }
`

// UTILITY CLASSES
export const utilities = {
  // Scrollbar hiding
  scrollbarHide: 'scrollbar-hide',

  // Transitions
  transition: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-200 ease-out',
    smooth: 'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
  },

  // Animation classes
  animate: {
    fadeIn: 'animate-fadeIn',
    fadeInUp: 'animate-fadeInUp',
    fadeInScale: 'animate-fadeInScale',
    pulse: 'animate-pulse',
  },

  // Focus states
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',

  // Hover states
  hoverLift: 'hover:-translate-y-0.5 hover:shadow-lg',
  hoverScale: 'hover:scale-[1.02] active:scale-[0.98]',
} as const

// Helper to get mode-specific classes
export function getModeClasses(mode: 'work' | 'hire') {
  return modeColors[mode]
}

// Helper to get status classes
export function getStatusClasses(status: keyof typeof statusColors) {
  return statusColors[status]
}
