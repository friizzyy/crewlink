// ============================================
// CREWLINK DESIGN SYSTEM
// Single source of truth for all design tokens
// ============================================

// ============================================
// TYPOGRAPHY
// ============================================
export const typography = {
  // Font family - Inter loaded globally
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    display: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Menlo, Monaco, monospace',
  },

  // Type scale with line heights
  fontSize: {
    'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
    'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
    'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1.15' }],        // 48px
    '6xl': ['3.75rem', { lineHeight: '1.1' }],      // 60px
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Heading styles
  headings: {
    h1: 'text-4xl sm:text-5xl font-bold tracking-tight',
    h2: 'text-3xl sm:text-4xl font-bold tracking-tight',
    h3: 'text-2xl sm:text-3xl font-semibold',
    h4: 'text-xl sm:text-2xl font-semibold',
    h5: 'text-lg font-semibold',
    h6: 'text-base font-semibold',
  },

  // Body styles
  body: {
    large: 'text-lg text-slate-300',
    base: 'text-base text-slate-400',
    small: 'text-sm text-slate-400',
    xs: 'text-xs text-slate-500',
  },

  // Label styles
  label: {
    default: 'text-sm font-medium text-white',
    muted: 'text-sm font-medium text-slate-400',
    uppercase: 'text-xs font-semibold uppercase tracking-wider text-slate-500',
  },
} as const

// ============================================
// COLORS - DARK THEME
// ============================================
export const colors = {
  // Base backgrounds
  bg: {
    primary: '#020617',     // slate-950
    secondary: '#0f172a',   // slate-900
    tertiary: '#1e293b',    // slate-800
    elevated: 'rgba(15, 23, 42, 0.8)', // slate-900/80
    glass: 'rgba(15, 23, 42, 0.6)',    // glassmorphism
  },

  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#e2e8f0',   // slate-200
    tertiary: '#94a3b8',    // slate-400
    muted: '#64748b',       // slate-500
    inverse: '#0f172a',     // slate-900
  },

  // Brand colors (cyan/blue spectrum)
  brand: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',  // Primary cyan
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  // Accent (blue)
  accent: {
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
  },

  // Success (green)
  success: {
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
  },

  // Warning (amber)
  warning: {
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
  },

  // Error (red)
  error: {
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
  },

  // Border colors
  border: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.10)',
    heavy: 'rgba(255, 255, 255, 0.20)',
    glow: 'rgba(6, 182, 212, 0.30)',      // cyan glow
    glowStrong: 'rgba(6, 182, 212, 0.50)',
  },

  // Glow colors for effects
  glow: {
    cyan: 'rgba(6, 182, 212, 0.4)',
    blue: 'rgba(59, 130, 246, 0.4)',
    purple: 'rgba(139, 92, 246, 0.3)',
  },
} as const

// ============================================
// SPACING
// ============================================
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
} as const

// ============================================
// BORDER RADIUS
// ============================================
export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const

// ============================================
// SHADOWS
// ============================================
export const shadows = {
  // Standard shadows
  sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

  // Glow shadows
  glow: '0 0 20px rgba(6, 182, 212, 0.3)',
  glowMd: '0 0 30px rgba(6, 182, 212, 0.4)',
  glowLg: '0 0 40px rgba(6, 182, 212, 0.5)',
  glowAccent: '0 0 20px rgba(59, 130, 246, 0.3)',
  glowSuccess: '0 0 20px rgba(34, 197, 94, 0.3)',
  glowError: '0 0 20px rgba(239, 68, 68, 0.3)',

  // Button shadows
  button: '0 4px 14px -2px rgba(6, 182, 212, 0.4)',
  buttonHover: '0 6px 20px -2px rgba(6, 182, 212, 0.5)',
} as const

// ============================================
// TRANSITIONS
// ============================================
export const transitions = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Timing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Common transitions
  all: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  colors: 'color, background-color, border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const

// ============================================
// Z-INDEX SCALE
// ============================================
export const zIndex = {
  base: 0,
  dropdown: 50,
  sticky: 100,
  modal: 200,
  popover: 300,
  toast: 400,
  tooltip: 500,
  overlay: 1000,
} as const

// ============================================
// ANIMATION KEYFRAMES
// ============================================
export const animations = {
  // Fade animations
  fadeIn: 'fadeIn 0.3s ease-out forwards',
  fadeUp: 'fadeUp 0.4s ease-out forwards',
  fadeDown: 'fadeDown 0.4s ease-out forwards',

  // Slide animations
  slideUp: 'slideUp 0.3s ease-out',
  slideDown: 'slideDown 0.3s ease-out',
  slideInRight: 'slideInRight 0.5s ease-out forwards',
  slideInLeft: 'slideInLeft 0.5s ease-out forwards',

  // Scale animations
  scaleIn: 'scaleIn 0.2s ease-out',
  popIn: 'popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',

  // Glow animations
  glowPulse: 'glowPulse 3s ease-in-out infinite',
  pulse: 'pulse 2s ease-in-out infinite',

  // Float animations (for hero elements)
  float: 'float 6s ease-in-out infinite',
  floatSlow: 'float 8s ease-in-out infinite',

  // Spin
  spin: 'spin 1s linear infinite',
  spinSlow: 'spin 15s linear infinite',

  // Shimmer (for shine effect)
  shimmer: 'shimmer 2s linear infinite',
} as const

// ============================================
// BREAKPOINTS
// ============================================
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// ============================================
// GLASSMORPHISM PRESETS
// ============================================
export const glass = {
  // Panel/Card glass
  panel: {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropBlur: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '1rem',
  },

  // Header/Nav glass
  header: {
    background: 'rgba(2, 6, 23, 0.8)',
    backdropBlur: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },

  // Card glass (elevated)
  card: {
    background: 'rgba(15, 23, 42, 0.6)',
    backdropBlur: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '1rem',
  },

  // Modal glass
  modal: {
    background: 'rgba(15, 23, 42, 0.95)',
    backdropBlur: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1.5rem',
  },
} as const

// ============================================
// COMPONENT STYLES
// ============================================
export const componentStyles = {
  // Button variants
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none',

    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-button hover:shadow-buttonHover active:scale-[0.98] focus-visible:ring-cyan-500',

    secondary: 'bg-slate-800 text-white border border-white/10 hover:bg-slate-700 hover:border-white/20 active:scale-[0.98] focus-visible:ring-slate-500',

    ghost: 'text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 focus-visible:ring-white/20',

    danger: 'bg-red-600 text-white hover:bg-red-500 shadow-glowError active:scale-[0.98] focus-visible:ring-red-500',

    outline: 'border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500 active:scale-[0.98] focus-visible:ring-cyan-500',

    // Sizes
    sm: 'h-8 px-3 text-sm rounded-lg gap-1.5',
    md: 'h-10 px-4 text-sm rounded-xl gap-2',
    lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
    xl: 'h-14 px-8 text-lg rounded-2xl gap-3',
  },

  // Input styles
  input: {
    base: 'w-full bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed',

    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-13 px-5 text-lg',

    error: 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20',
    success: 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20',
  },

  // Card styles
  card: {
    base: 'bg-slate-900/80 backdrop-blur-sm border border-white/5 rounded-2xl',
    interactive: 'hover:border-white/10 hover:bg-slate-900/90 transition-all duration-200 cursor-pointer',
    glow: 'hover:shadow-glow hover:border-cyan-500/20',
  },

  // Badge styles
  badge: {
    base: 'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium',
    cyan: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    green: 'bg-green-500/20 text-green-400 border border-green-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    red: 'bg-red-500/20 text-red-400 border border-red-500/30',
    slate: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  },
} as const

// ============================================
// STAGGER ANIMATION DELAYS
// ============================================
export const staggerDelays = [
  'delay-[0ms]',
  'delay-[50ms]',
  'delay-[100ms]',
  'delay-[150ms]',
  'delay-[200ms]',
  'delay-[250ms]',
  'delay-[300ms]',
  'delay-[350ms]',
  'delay-[400ms]',
  'delay-[450ms]',
  'delay-[500ms]',
] as const

// ============================================
// CONTAINER WIDTHS
// ============================================
export const containers = {
  sm: 'max-w-screen-sm',    // 640px
  md: 'max-w-screen-md',    // 768px
  lg: 'max-w-screen-lg',    // 1024px
  xl: 'max-w-screen-xl',    // 1280px
  '2xl': 'max-w-screen-2xl', // 1536px
  prose: 'max-w-prose',      // 65ch
  full: 'max-w-full',
} as const

export default {
  typography,
  colors,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  animations,
  breakpoints,
  glass,
  componentStyles,
  staggerDelays,
  containers,
}
