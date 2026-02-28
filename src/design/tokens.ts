/**
 * CrewLink Design Tokens
 * Single source of truth for all design values
 *
 * IMPORTANT: Do not modify these values without updating:
 * 1. tailwind.config.ts (if applicable)
 * 2. src/design/primitives.tsx components
 * 3. agents/docs/theme-checklist.md
 */

// ============================================
// COLOR TOKENS
// ============================================

export const colors = {
  // Primary brand - Blue (matches tailwind brand-*)
  primary: {
    50: '#f0f7ff',
    100: '#e0effe',
    200: '#b9dffd',
    300: '#7cc5fb',
    400: '#36a7f6',
    500: '#0c8ce7', // brand-500 - primary accent
    600: '#006fc5', // brand-600
    700: '#0159a0', // brand-700
    800: '#064c84', // brand-800
    900: '#0b406e', // brand-900
  },

  // Secondary - Blue
  secondary: {
    400: '#60a5fa',
    500: '#3b82f6', // blue-500
    600: '#2563eb', // blue-600
    700: '#1d4ed8',
  },

  // Success - Emerald/Green
  success: {
    400: '#34d399',
    500: '#10b981', // emerald-500
    600: '#059669',
  },

  // Warning - Amber
  warning: {
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
  },

  // Error - Red
  error: {
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
  },

  // Neutral - Slate (dark theme base)
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617', // Primary background
  },
} as const

// ============================================
// SPACING TOKENS
// ============================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const

// ============================================
// TYPOGRAPHY TOKENS
// ============================================

export const typography = {
  fontFamily: {
    sans: ['var(--font-geist-sans)', 'Geist Sans', 'system-ui', 'sans-serif'],
    display: ['var(--font-geist-sans)', 'Geist Sans', 'system-ui', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1.15' }],
    '6xl': ['3.75rem', { lineHeight: '1.1' }],
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const

// ============================================
// BORDER RADIUS TOKENS
// ============================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  '4xl': '2rem',
  full: '9999px',
} as const

// ============================================
// SHADOW TOKENS
// ============================================

export const shadows = {
  soft: '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
  medium: '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 8px 24px -4px rgba(0, 0, 0, 0.08)',
  heavy: '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 16px 48px -8px rgba(0, 0, 0, 0.1)',
  glow: '0 0 24px rgba(12, 140, 231, 0.12)',
  glowAccent: '0 0 24px rgba(255, 127, 16, 0.15)',
} as const

// ============================================
// Z-INDEX TOKENS
// ============================================

export const zIndex = {
  background: 0,
  content: 10,
  dropdown: 20,
  sticky: 30,
  fixed: 40,
  modalBackdrop: 45,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 9999,
} as const

// ============================================
// ANIMATION TOKENS
// ============================================

export const animation = {
  // Durations
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounceIn: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
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
// COMPONENT-SPECIFIC TOKENS
// ============================================

export const components = {
  // Navbar
  navbar: {
    height: '80px', // h-20
    background: 'rgba(2, 6, 23, 0.8)', // slate-950/80
    borderColor: 'rgba(255, 255, 255, 0.06)', // white/6
  },

  // Buttons
  button: {
    borderRadius: '0.75rem', // rounded-xl
    paddingX: '1.5rem', // px-6
    paddingY: '0.625rem', // py-2.5
    fontSize: '0.875rem', // text-sm
    fontWeight: '600', // font-semibold
  },

  // Cards/Panels
  card: {
    borderRadius: '1rem', // rounded-2xl
    background: 'rgba(15, 23, 42, 0.6)', // slate-900/60
    borderColor: 'rgba(255, 255, 255, 0.06)', // white/6
  },

  // Inputs
  input: {
    borderRadius: '0.75rem', // rounded-xl
    background: 'rgba(30, 41, 59, 0.5)', // slate-800/50
    borderColor: 'rgba(255, 255, 255, 0.10)', // white/10
    focusBorderColor: 'rgba(12, 140, 231, 0.5)', // brand-500/50
  },

  // Icons
  icon: {
    sizes: {
      xs: '12px',
      sm: '16px',
      md: '20px',
      lg: '24px',
      xl: '32px',
    },
  },
} as const

// ============================================
// GRADIENT PRESETS
// ============================================

export const gradients = {
  // Primary CTA gradient
  primaryCta: 'linear-gradient(to right, #0c8ce7, #3b82f6)', // brand-500 to blue-500

  // Secondary gradient (emerald)
  secondaryCta: 'linear-gradient(to right, #10b981, #14b8a6)', // emerald-500 to teal-500

  // Background gradients
  backgroundMain: 'linear-gradient(to bottom, #020617, #0f172a, #020617)', // slate-950 to slate-900

  // Glass effect
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
} as const

// ============================================
// EXPORTS
// ============================================

export const tokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  zIndex,
  animation,
  breakpoints,
  components,
  gradients,
} as const

export default tokens
