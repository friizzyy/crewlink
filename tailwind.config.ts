import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc5fb',
          400: '#36a7f6',
          500: '#0c8ce7',
          600: '#006fc5',
          700: '#0159a0',
          800: '#064c84',
          900: '#0b406e',
          950: '#072849',
        },
        // Accent for CTAs and highlights
        accent: {
          50: '#fff8ed',
          100: '#ffefd4',
          200: '#ffdba8',
          300: '#ffc170',
          400: '#ff9c37',
          500: '#ff7f10',
          600: '#f06306',
          700: '#c74a07',
          800: '#9e3b0e',
          900: '#7f330f',
          950: '#451705',
        },
        // Success states
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Neutral grays
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          150: '#e9eef4',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Geist Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-geist-sans)', 'Geist Sans', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.15' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 16px -4px rgba(0, 0, 0, 0.06)',
        'medium': '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 8px 24px -4px rgba(0, 0, 0, 0.08)',
        'heavy': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 16px 48px -8px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 24px rgba(12, 140, 231, 0.12)',
        'glow-accent': '0 0 24px rgba(255, 127, 16, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'fade-up': 'fadeUp 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        // Floating animations
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'float-reverse': 'floatReverse 7s ease-in-out infinite',
        // Glow animations
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'neon-flicker': 'neonFlicker 3s ease-in-out infinite',
        // Orbit animations
        'orbit': 'orbit 20s linear infinite',
        'orbit-reverse': 'orbit 25s linear infinite reverse',
        'orbit-slow': 'orbit 30s linear infinite',
        // Slide animations
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'slide-in-bottom': 'slideInBottom 0.6s ease-out forwards',
        // Scale animations
        'scale-up': 'scaleUp 0.3s ease-out forwards',
        'pop-in': 'popIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        // Rotation animations
        'spin-slow': 'spin 15s linear infinite',
        'wiggle': 'wiggle 2.5s ease-in-out infinite',
        // Text animations
        'typewriter': 'typewriter 4s steps(40) infinite',
        'blink': 'blink 1s step-end infinite',
        // Particle animations  
        'particle-up': 'particleUp 3s ease-out infinite',
        'particle-float': 'particleFloat 4s ease-in-out infinite',
        // Border animations
        'border-beam': 'borderBeam 4s linear infinite',
        // Aurora/gradient animations
        'aurora': 'aurora 8s ease-in-out infinite',
        'gradient-shift': 'gradientShift 6s ease-in-out infinite',
        // Bounce variations
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        // Card entrance animations
        'card-enter': 'cardEnter 0.5s ease-out forwards',
        'stagger-fade': 'staggerFade 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Floating
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(-15px)' },
          '50%': { transform: 'translateY(15px)' },
        },
        // Glow effects
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.3), 0 0 40px rgba(6, 182, 212, 0.1)' },
          '50%': { boxShadow: '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.2)' },
        },
        neonFlicker: {
          '0%, 100%': { opacity: '1', textShadow: '0 0 10px currentColor, 0 0 20px currentColor' },
          '33%': { opacity: '0.9', textShadow: '0 0 15px currentColor, 0 0 30px currentColor' },
          '66%': { opacity: '1', textShadow: '0 0 5px currentColor, 0 0 15px currentColor' },
        },
        // Orbit
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(150px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(150px) rotate(-360deg)' },
        },
        // Slide ins
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInBottom: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Scale
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '80%': { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Wiggle
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        // Text
        typewriter: {
          '0%, 100%': { width: '0' },
          '50%': { width: '100%' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        // Particles
        particleUp: {
          '0%': { opacity: '0', transform: 'translateY(0) scale(0)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translateY(-100px) scale(1)' },
        },
        particleFloat: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)', opacity: '0.6' },
          '25%': { transform: 'translateY(-15px) translateX(10px) rotate(90deg)', opacity: '1' },
          '50%': { transform: 'translateY(-25px) translateX(-5px) rotate(180deg)', opacity: '0.8' },
          '75%': { transform: 'translateY(-10px) translateX(-15px) rotate(270deg)', opacity: '1' },
        },
        // Border beam
        borderBeam: {
          '0%': { offsetDistance: '0%' },
          '100%': { offsetDistance: '100%' },
        },
        // Aurora
        aurora: {
          '0%, 100%': { backgroundPosition: '50% 50%', filter: 'hue-rotate(0deg)' },
          '25%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '50% 100%', filter: 'hue-rotate(30deg)' },
          '75%': { backgroundPosition: '100% 50%' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        // Bounce
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Card entrance
        cardEnter: {
          '0%': { opacity: '0', transform: 'translateY(30px) rotateX(10deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotateX(0)' },
        },
        staggerFade: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

export default config
