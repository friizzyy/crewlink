# CrewLink Design System Audit & Checklist

**Last Updated:** February 2026
**Scope:** Complete design token consistency, component implementation, and dark premium aesthetic audit
**Primary Reference Files:**
- `/src/design/tokens.ts` – Master token definitions
- `/tailwind.config.ts` – Tailwind theme configuration
- `/src/lib/design-system.ts` – Component-level design system
- `/src/lib/map-tokens.ts` – Map experience design tokens
- `/src/components/AmbientBackground.tsx` – Marketing background system

---

## 1. Color System Audit

### 1.1 Brand Colors (Cyan/Blue Spectrum)

**Tailwind Configuration** (`tailwind.config.ts` lines 13-25):
```
brand-50: #f0f7ff → brand-950: #072849
Primary: brand-500 #0c8ce7 (cyan, action color)
Secondary: brand-600 #006fc5 (darker cyan, hover states)
```

**Design Tokens** (`src/design/tokens.ts` lines 17-27):
```
primary-500: #06b6d4 (cyan-500 from Tailwind)
primary-600: #0891b2 (cyan-600)
primary-700: #0e7490 (cyan-700)
```

**Status Check:**
- [ ] All buttons using `from-cyan-500 to-blue-600` gradient (not hardcoded hex #0c8ce7)
- [ ] Hover states use `from-cyan-400 to-blue-500` (one shade lighter)
- [ ] Brand colors in Button.tsx lines 35-39 match token definitions
- [ ] GlassPanel.tsx uses `border-cyan-500/20` for glow border (line 39)
- [ ] All links and interactive elements respect cyan/blue palette
- [ ] LiveDot.tsx cyan variant uses brand-500 shade for pulsing indicator (lines 18-20)

**Issue Examples to Catch:**
- Hardcoded hex codes like `#0c8ce7` instead of `from-cyan-500`
- Using non-brand colors (e.g., `from-blue-400`) for primary actions
- Inconsistent hover states not using lighter brand shades

---

### 1.2 Accent Colors (Orange/Warm Tones for CTAs)

**Tailwind Configuration** (`tailwind.config.ts` lines 27-39):
```
accent-500: #ff7f10 (primary orange CTA)
accent-600: #f06306 (darker orange, hover)
```

**Status Check:**
- [ ] CTA buttons consistently use orange accent where appropriate
- [ ] Danger actions use red gradient, not orange (Button.tsx line 61)
- [ ] Badge components have `amber` variant for warnings (design-system.ts line 388)
- [ ] Status indicators use accent colors for specific states only

---

### 1.3 Success, Warning, Error Colors

**Token Definitions** (`src/design/tokens.ts`):

**Success (Green/Emerald):**
```
success-400: #4ade80
success-500: #22c55e
success-600: #16a34a
```

**Warning (Amber):**
```
warning-400: #fbbf24
warning-500: #f59e0b
warning-600: #d97706
```

**Error (Red):**
```
error-400: #f87171
error-500: #ef4444
error-600: #dc2626
```

**Status Check:**
- [ ] Success states (checkmarks, confirmations) use `from-emerald-500 to-teal-600`
- [ ] Warning badges use amber palette (design-system.ts line 388)
- [ ] Error/danger buttons use red gradient (Button.tsx lines 60-65)
- [ ] Toast notifications match status color scheme
- [ ] Form validation states use correct error colors
- [ ] LiveDot component has green variant for active/online status (line 22-24)

---

### 1.4 Neutral/Slate Colors (Dark Theme Base)

**Tailwind Configuration** (`tailwind.config.ts` lines 54-67):
```
slate-50: #f8fafc (almost white, rarely used)
slate-150: #e9eef4 (custom shade for subtle contrasts)
slate-800: #1e293b (elevated surfaces)
slate-900: #0f172a (primary card/panel background)
slate-950: #020617 (primary page background)
```

**Status Check:**
- [ ] Page background is `bg-slate-950` (not pure black)
- [ ] Elevated surfaces/cards use `bg-slate-900/80` or `bg-slate-800`
- [ ] Text on dark background: use `text-white` or `text-slate-300`
- [ ] Secondary text: `text-slate-400` or `text-slate-500`
- [ ] Borders: `border-white/5` or `border-white/10` (translucent white)
- [ ] All gray elements avoid pure neutral gray (#808080); use slate scale only
- [ ] GlassPanel backgrounds use slate with opacity: `bg-slate-900/80 backdrop-blur-md` (line 22)

**Critical for Dark Theme:**
- [ ] No hardcoded `#999999` or `#cccccc` – use slate scale
- [ ] Text contrast meets WCAG AA minimum (4.5:1 for body text)
- [ ] Form inputs use `bg-slate-800/50` (design-system.ts line 264)

---

### 1.5 Glass Morphism Colors & Presets

**Glass Effect System** (`src/design/tokens.ts` lines 304-335 and `src/lib/design-system.ts`):

```typescript
// Panel glass (default overlay)
background: rgba(15, 23, 42, 0.8)
backdropBlur: blur(16px)
border: 1px solid rgba(255, 255, 255, 0.05)
borderRadius: 1rem

// Header/Nav glass (stronger backdrop)
background: rgba(2, 6, 23, 0.8)
backdropBlur: blur(24px)

// Card glass (more transparent)
background: rgba(15, 23, 42, 0.6)
backdropBlur: blur(12px)

// Modal glass (opaque)
background: rgba(15, 23, 42, 0.95)
backdropBlur: blur(20px)
```

**Status Check:**
- [ ] MapSidebarShell.tsx uses `bg-slate-900/95 backdrop-blur-xl` (map-tokens.ts line 200)
- [ ] Modal.tsx uses opaque glass (0.95 opacity minimum)
- [ ] GlassPanel variants match token definitions
- [ ] Card overlays use lower opacity (0.6–0.8 range) for floating effect
- [ ] All glass components have `border border-white/5` or `border-white/10`
- [ ] Backdrop blur levels: sidebar (xl/24px) > panel (md/16px) > card (sm/12px)
- [ ] No glass effect without backdrop blur – it must use `backdrop-blur-*` class
- [ ] Mobile bottom sheets are opaque glass (not transparent)

---

### 1.6 Glow & Shadow Colors

**Shadow Definitions** (`src/design/tokens.ts` lines 200-212):

```
// Brand glow (cyan)
glow: 0 0 20px rgba(6, 182, 212, 0.3)
glowMd: 0 0 30px rgba(6, 182, 212, 0.4)
glowLg: 0 0 40px rgba(6, 182, 212, 0.5)

// Button shadows
button: 0 4px 14px -2px rgba(6, 182, 212, 0.4)
buttonHover: 0 6px 20px -2px rgba(6, 182, 212, 0.5)

// Soft shadows (dark theme appropriate)
soft: 0 2px 8px -2px rgba(0, 0, 0, 0.08)
medium: 0 4px 12px -2px rgba(0, 0, 0, 0.1)
heavy: 0 8px 24px -4px rgba(0, 0, 0, 0.12)
```

**Status Check:**
- [ ] Primary buttons have `shadow-[0_4px_14px_-2px_rgba(6,182,212,0.4)]` (Button.tsx line 37)
- [ ] Button hover state uses `shadow-[0_6px_20px_-2px_rgba(6,182,212,0.5)]`
- [ ] GlassPanel hover uses `hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]`
- [ ] All glow shadows use cyan (6, 182, 212) = #06b6d4
- [ ] Accent glow shadows reserved for orange CTAs only
- [ ] Modal/overlay shadows are subtle (not heavy 0.5 opacity blacks)
- [ ] Cards have soft/medium shadow, not heavy shadow
- [ ] Success/error states use color-specific glows (green/red)

---

## 2. Typography System

### 2.1 Font Family & Loading

**Configuration** (`tailwind.config.ts` lines 69-75 and `src/design/tokens.ts` lines 122-126):

```typescript
fontFamily: {
  sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
  display: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
}
```

**Status Check:**
- [ ] Inter font loaded via `next/font` in root layout (e.g., `src/app/layout.tsx`)
- [ ] CSS variable `--font-inter` injected globally
- [ ] No direct font imports; use Tailwind `font-sans` / `font-display`
- [ ] Mono font for code blocks, not used in UI text
- [ ] All landing variants (A–F) use same Inter family
- [ ] Font weight explicitly set (400, 500, 600, 700) – no implicit fallback

---

### 2.2 Font Size Scale

**Type Scale** (`tailwind.config.ts` lines 76-87):

```
xs: 0.75rem (12px) → 1rem line-height
sm: 0.875rem (14px) → 1.25rem
base: 1rem (16px) → 1.5rem
lg: 1.125rem (18px) → 1.75rem
xl: 1.25rem (20px) → 1.75rem
2xl: 1.5rem (24px) → 2rem
3xl: 1.875rem (30px) → 2.25rem
4xl: 2.25rem (36px) → 2.5rem
5xl: 3rem (48px) → 1.15 (tighter for headlines)
6xl: 3.75rem (60px) → 1.1 (very tight for hero)
```

**Status Check:**
- [ ] Body text uses `text-base` (16px) or `text-sm` (14px)
- [ ] Labels use `text-sm` with `font-semibold`
- [ ] Headings use `text-2xl` or larger
- [ ] Hero text uses `text-5xl` or `text-6xl`
- [ ] Form input text is `text-base` or `text-sm`
- [ ] Captions/metadata use `text-xs` only
- [ ] All sizes include appropriate line-height from scale
- [ ] No custom font-size values; use only scale values

---

### 2.3 Font Weight

**Weights** (`src/design/tokens.ts` lines 141-146):

```
normal: 400
medium: 500
semibold: 600
bold: 700
```

**Status Check:**
- [ ] Body text: `font-normal` (400)
- [ ] Labels/meta: `font-medium` (500)
- [ ] Buttons/headings: `font-semibold` (600)
- [ ] Hero text: `font-bold` (700)
- [ ] No weights outside 400/500/600/700 range
- [ ] Buttons always use `font-semibold` (Button.tsx line 26)
- [ ] Links use `font-medium` default
- [ ] All labels in dropdowns use `font-medium`

---

### 2.4 Heading & Body Presets

**Predefined Styles** (`src/design/tokens.ts` lines 40-64):

```typescript
headings: {
  h1: 'text-4xl sm:text-5xl font-bold tracking-tight',
  h2: 'text-3xl sm:text-4xl font-bold tracking-tight',
  h3: 'text-2xl sm:text-3xl font-semibold',
  h4: 'text-xl sm:text-2xl font-semibold',
  h5: 'text-lg font-semibold',
  h6: 'text-base font-semibold',
}

body: {
  large: 'text-lg text-slate-300',
  base: 'text-base text-slate-400',
  small: 'text-sm text-slate-400',
  xs: 'text-xs text-slate-500',
}
```

**Status Check:**
- [ ] All headings use preset classes (not custom inline styles)
- [ ] Body text uses preset colors (slate-300, slate-400, slate-500)
- [ ] No ad-hoc text colors like `text-gray-300` – use slate only
- [ ] Landing pages H1 uses `text-5xl` or larger
- [ ] Section headings use H2 or H3
- [ ] Subheadings are H4 or H5
- [ ] Page body text is `text-slate-400` (secondary)
- [ ] Emphasized text is `text-slate-300` (primary)
- [ ] Muted text is `text-slate-500` (tertiary)

---

## 3. Spacing System

### 3.1 Tailwind Spacing Scale

**Standard Tailwind** (inherited) + **Custom Additions** (`tailwind.config.ts` lines 88-96):

```
px = 1px
0–3 (standard)
4: 1rem (16px) – base spacing unit
5: 1.25rem
6: 1.5rem
...
Custom:
4.5: 1.125rem (18px)
13: 3.25rem (52px)
15: 3.75rem (60px)
18: 4.5rem (72px)
22: 5.5rem (88px)
26: 6.5rem (104px)
30: 7.5rem (120px)
```

**Status Check:**
- [ ] Padding/margin use Tailwind scale (p-4, m-6, gap-3, etc.)
- [ ] No hardcoded pixel values in inline styles
- [ ] Custom spacing (4.5, 13, 15, 18, 22, 26, 30) used where needed
- [ ] Button padding: horizontal `px-4` or `px-6`, vertical `py-2.5`
- [ ] Card padding: `p-4` (md) or `p-6` (lg)
- [ ] Form input padding: `px-4 py-2.5` (Button.tsx line 82)
- [ ] Gap between elements: `gap-2`, `gap-3`, `gap-4` (not arbitrary)
- [ ] Sidebar padding: `p-5` (20px) or `p-6` (24px)

**Map-Specific Spacing** (`src/lib/map-tokens.ts` lines 8–41):
- [ ] Card padding: 16px (p-4)
- [ ] Icon size: 48px (w-12 h-12)
- [ ] Icon radius: 12px (rounded-xl)
- [ ] Gap between icon and content: 14px
- [ ] Sidebar padding: 20px (p-5)
- [ ] Results bar padding: 20px horizontal, 14px vertical

---

### 3.2 Container & Layout

**Breakpoints** (`src/design/tokens.ts` lines 293-299):

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

**Status Check:**
- [ ] Mobile-first responsive design (sm: → md: → lg:)
- [ ] Map layout is full-width on mobile, sidebar on desktop
- [ ] Sidebar width: 420px default (map-tokens.ts line 27)
- [ ] Content max-width respects breakpoints (no full-bleed on desktop)
- [ ] Modal max-width is constrained (not full screen on large displays)
- [ ] Card grids use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [ ] Padding increases at larger breakpoints (e.g., `px-4 sm:px-6 lg:px-8`)

---

## 4. Border Radius System

### 4.1 Radius Scale

**Tailwind** (standard) + **Custom Additions** (`tailwind.config.ts` lines 97-100):

```
none: 0
sm: 0.125rem (2px)
base: 0.25rem (4px)
md: 0.375rem (6px)
lg: 0.5rem (8px)
xl: 0.75rem (12px)
2xl: 1rem (16px)
3xl: 1.5rem (24px)
4xl: 2rem (32px) – custom
5xl: 2.5rem (40px) – custom
full: 9999px
```

**Status Check:**
- [ ] Buttons use `rounded-lg` (sm buttons) or `rounded-xl` (md/lg)
- [ ] Cards use `rounded-2xl` or `rounded-3xl` (premium feel)
- [ ] Inputs use `rounded-xl` (12px)
- [ ] Dropdowns/modals use `rounded-2xl` or higher
- [ ] No hardcoded border-radius; always use scale
- [ ] Small UI elements (badges, pills) use `rounded-full`
- [ ] Large decorative shapes use `rounded-[2.5rem]` (4xl/5xl)
- [ ] Form fields match button radius for visual consistency

---

## 5. Shadow System

### 5.1 Elevation Shadows

**Soft → Heavy Progression** (`tailwind.config.ts` lines 101-107):

```
soft: 0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 4px 16px -4px rgba(0, 0, 0, 0.06)
medium: 0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 8px 24px -4px rgba(0, 0, 0, 0.08)
heavy: 0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 16px 48px -8px rgba(0, 0, 0, 0.1)
glow: 0 0 24px rgba(12, 140, 231, 0.25) – brand cyan
glow-accent: 0 0 24px rgba(255, 127, 16, 0.3) – orange accent
```

**Status Check:**
- [ ] Elevated cards use `shadow-soft` or `shadow-medium`
- [ ] Hovered cards escalate to `shadow-medium` or `shadow-lg`
- [ ] Modals use `shadow-heavy` or `shadow-xl`
- [ ] Buttons have glow shadow: `shadow-[0_4px_14px_-2px_rgba(6,182,212,0.4)]`
- [ ] No pure black shadows (always use rgba with low opacity for dark theme)
- [ ] Glow effects use cyan (brand) or orange (accent), not white
- [ ] Hover states increase shadow depth/opacity
- [ ] Active/pressed states reduce shadow (feels pressed)

---

### 5.2 Glow Effects & Neon Shadows

**Glow Shadow Variants** (`src/design/tokens.ts` lines 200–212):

```
glow: 0 0 20px rgba(6, 182, 212, 0.3)
glowMd: 0 0 30px rgba(6, 182, 212, 0.4)
glowLg: 0 0 40px rgba(6, 182, 212, 0.5)
glowAccent: 0 0 20px rgba(59, 130, 246, 0.3)
glowSuccess: 0 0 20px rgba(34, 197, 94, 0.3)
glowError: 0 0 20px rgba(239, 68, 68, 0.3)
```

**Status Check:**
- [ ] Primary buttons have cyan glow on hover
- [ ] Success states use green glow
- [ ] Error states use red glow
- [ ] GlassPanel with `glowOnHover` applies cyan glow (line 84)
- [ ] Glow shadows scale with component importance (button > card > badge)
- [ ] Glows fade at lower opacity on non-focused elements
- [ ] All glows use `box-shadow` (not text-shadow)
- [ ] Glow combined with backdrop blur for premium effect

---

## 6. Animation & Motion System

### 6.1 Core Animations (30+)

**Tailwind Keyframes** (`tailwind.config.ts` lines 108–155):

**Fade Family:**
```
fade-in: 0.3s ease-out
fade-up: 0.4s ease-out (translateY 20px)
```

**Slide Family:**
```
slide-up: 0.3s ease-out
slide-down: 0.3s ease-out
slide-in-right: 0.5s ease-out (translateX 50px)
slide-in-left: 0.5s ease-out (translateX -50px)
slide-in-bottom: 0.6s ease-out (translateY 40px)
```

**Scale & Pop:**
```
scale-in: 0.2s ease-out (0.95 → 1)
scale-up: 0.3s ease-out (0.8 → 1)
pop-in: 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) (overshoot)
```

**Glow & Light:**
```
glow-pulse: 3s ease-in-out infinite (box-shadow expansion)
neon-flicker: 3s ease-in-out infinite (opacity + text-shadow)
pulse-soft: 2s ease-in-out infinite (opacity 1 → 0.6)
shimmer: 2s linear infinite (background-position shift)
```

**Float & Orbit:**
```
float: 6s ease-in-out infinite (translateY ±20px)
float-slow: 8s ease-in-out infinite
float-reverse: 7s ease-in-out infinite (inverted)
orbit: 20s linear infinite (360° rotation)
orbit-reverse: 25s linear infinite reverse
orbit-slow: 30s linear infinite
```

**Specialized:**
```
typewriter: 4s steps(40) infinite (width reveal)
blink: 1s step-end infinite (cursor effect)
border-beam: 4s linear infinite (offset-distance)
particle-up: 3s ease-out infinite (translateY -100px, scale)
particle-float: 4s ease-in-out infinite (multi-axis movement)
wiggle: 2.5s ease-in-out infinite (rotate ±3deg)
spin-slow: 15s linear infinite (full rotation)
bounce-gentle: 2s ease-in-out infinite (translateY ±10px)
bounce-in: 0.6s cubic-bezier (bounce entrance)
```

**Card & Stagger:**
```
card-enter: 0.5s ease-out (translateY 30px, rotateX 10deg)
stagger-fade: 0.4s ease-out (translateY 20px, fade)
```

**Aurora & Gradient:**
```
aurora: 8s ease-in-out infinite (background-position shift + hue-rotate)
gradient-shift: 6s ease-in-out infinite (background-position shift)
```

**Status Check:**
- [ ] Page load animations use `animate-fade-in` or `animate-fade-up`
- [ ] Form inputs slide in from bottom on open: `animate-slide-in-bottom`
- [ ] Cards scale in on page load: `animate-scale-in` or `animate-card-enter`
- [ ] Modal overlays fade in: `animate-fade-in`
- [ ] Floating UI elements use `animate-float` (hero badges, floating cards)
- [ ] Loading states use `animate-pulse-soft` (not built-in Tailwind pulse)
- [ ] Status indicators use `animate-glow-pulse` (not fade)
- [ ] Text reveals use `animate-typewriter` (if applicable)
- [ ] Particle effects use `animate-particle-up` or `animate-particle-float`
- [ ] Staggered animations applied to list items via `stagger-fade` with delays
- [ ] No animation longer than 3s for UI (except background: 6–30s)
- [ ] All animations respect `prefers-reduced-motion: reduce`

**Stagger Implementation:**
```
// Applied via delay classes
delay-[0ms], delay-[50ms], delay-[100ms]... delay-[500ms]
// Applied to list children sequentially
```

---

### 6.2 Animation Timings & Easing

**Transition Timing** (`tailwind.config.ts` lines 295–298):

```
bounce-in: cubic-bezier(0.68, -0.55, 0.265, 1.55) – overshoot
smooth: cubic-bezier(0.4, 0, 0.2, 1) – standard easing
```

**Duration Tokens** (`src/design/tokens.ts` lines 203–209):

```
instant: 0ms
fast: 150ms (hover states, small interactions)
normal: 200ms (default transitions)
slow: 300ms (modals, important transitions)
slower: 500ms (background animations, low priority)
```

**Status Check:**
- [ ] All `transition-*` use standard Tailwind durations (not custom ms)
- [ ] Hover states: 150–200ms
- [ ] Enter animations: 200–600ms (depending on travel distance)
- [ ] Exit animations: equal to or faster than enter
- [ ] Color transitions use `transition-colors duration-200`
- [ ] Transform transitions use `transition-transform duration-200`
- [ ] Opacity transitions use `transition-opacity duration-200`
- [ ] Composite: `transition-all duration-200` (be careful with performance)
- [ ] No cubic-bezier custom values outside the two defined presets
- [ ] GlassPanel hover transition: `transition-all duration-200` (line 83)
- [ ] Button active state scales: `active:scale-[0.98]` (no animation, instant)

---

### 6.3 Animation Performance & GPU Acceleration

**Critical Performance Checks:**
- [ ] All animations use `transform` and `opacity` (GPU-accelerated properties)
- [ ] Avoid animating: `width`, `height`, `left`, `right`, `top`, `bottom`
- [ ] Use `translate-x/y` instead of `left/top`
- [ ] Use `scale` instead of `width/height`
- [ ] All transform animations use `will-change: transform`
- [ ] Opacity animations use `will-change: opacity`
- [ ] Particles/floating elements use `transform: translate3d()` (3D acceleration)
- [ ] AmbientBackground uses `will-change: transform, opacity` for boxes (line 119)
- [ ] Staggered animations have offsets via `delay-*` (not sequential JS)
- [ ] Reduced motion respected via `@media (prefers-reduced-motion: reduce)`
- [ ] No more than 10–15 simultaneous animations on large screens
- [ ] Mobile: disable heavy animations (AmbientBackground reduces on mobile, line 150)

**AmbientBackground Motion Tokens** (`src/lib/map-tokens.ts` lines 64–79 and `src/components/AmbientBackground.tsx`):

```typescript
motion: {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    smooth: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    linear: 'linear',
  },
}
```

**Status Check:**
- [ ] CSS variable injection for motion durations (line 221–231)
- [ ] Respect `prefers-reduced-motion` at system level
- [ ] Mobile Safari disables animations on small screens
- [ ] Background box animations use GPU-accelerated `transform` only
- [ ] Scan line uses `animation: scanLine {speed}s linear infinite` (line 269)
- [ ] Glow effects use `opacity` animation (not blur or other expensive props)

---

## 7. Component-Level Design System

### 7.1 Button Component (`src/components/ui/Button.tsx`)

**Variants:**

| Variant | Gradient | Hover | Shadow | Use Case |
|---------|----------|-------|--------|----------|
| primary | cyan-500 → blue-600 | cyan-400 → blue-500 | glow cyan | Main CTAs |
| secondary | slate-800 border | slate-700 | soft | Alternative actions |
| ghost | transparent | bg-white/5 | none | Low-priority actions |
| accent | purple-500 → pink-600 | purple-400 → pink-500 | glow purple | Special emphasis |
| danger | red-600 → rose-600 | red-500 → rose-500 | glow red | Destructive actions |
| success | emerald-500 → teal-600 | emerald-400 → teal-500 | glow green | Confirmations |
| outline | cyan-500/50 border | cyan-500 | none | Secondary emphasis |

**Sizes:**

```
sm: h-8 px-3 text-xs rounded-lg
md: h-10 px-4 text-sm rounded-xl (default)
lg: h-12 px-6 text-base rounded-xl
xl: h-14 px-8 text-lg rounded-2xl
icon-sm: 8×8 h-8 w-8 p-0 rounded-lg
icon-md: 10×10 h-10 w-10 p-0 rounded-xl (default)
icon-lg: 12×12 h-12 w-12 p-0 rounded-xl
```

**Status Check:**
- [ ] All buttons use gradient from `from-*-500 to-*-600`
- [ ] Hover states change to `from-*-400 to-*-500` (lighter)
- [ ] Primary buttons always use cyan→blue gradient (not other combos)
- [ ] Danger buttons use red→rose (not orange)
- [ ] Success buttons use emerald→teal (not green-500)
- [ ] Shadow on primary/danger/success: `shadow-[0_4px_14px_-2px_rgba(...,0.4)]`
- [ ] Hover shadow amplified: `shadow-[0_6px_20px_-2px_rgba(...,0.5)]`
- [ ] Button base styles: `font-semibold transition-all duration-200` (line 26)
- [ ] Disabled state: `disabled:opacity-50 disabled:pointer-events-none`
- [ ] Active state: `active:scale-[0.98]` (no transition, instant)
- [ ] Focus ring: `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`
- [ ] Loading state shows spinner, hides text via opacity-0
- [ ] Icon buttons are perfect squares (no width class needed if using `p-0`)
- [ ] Glow animation on primary variant: animated shine effect on hover

**Glow Button Variant:**
- [ ] Animated gradient border using pseudo-element (line 223–234)
- [ ] Background glow: `bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur`
- [ ] Glow opacity: `opacity-30 group-hover:opacity-60`
- [ ] Smooth transition: `transition-opacity duration-500`

---

### 7.2 GlassPanel Component (`src/components/ui/GlassPanel.tsx`)

**Variants:**

| Variant | Background | Blur | Shadow | Use Case |
|---------|------------|------|--------|----------|
| default | slate-900/80 | md | soft | Standard panels |
| elevated | slate-900/90 | lg | xl | Important containers |
| subtle | slate-900/60 | sm | none | Subtle backgrounds |
| solid | slate-900 | none | none | Opaque surfaces |

**Padding Options:**

```
none: 0
sm: p-3 (12px)
md: p-4 (16px) – default
lg: p-6 (24px)
xl: p-8 (32px)
```

**Border Options:**

```
none: no border
light: border-white/5 (subtle)
glow: border-cyan-500/20 (brand highlight)
```

**Rounded Options:**

```
md: rounded-lg (8px)
lg: rounded-xl (12px)
xl: rounded-2xl (16px)
2xl: rounded-3xl (24px)
3xl: rounded-[2rem] (custom 32px)
```

**Blur Options:**

```
none: backdrop-blur-none
sm: backdrop-blur-sm
md: backdrop-blur-md – default
lg: backdrop-blur-lg
```

**Interactive Options:**

```
hoverable: hover:bg-slate-900/90 + cursor-pointer + transition-all
glowOnHover: hover:border-cyan-500/30 + glow shadow
```

**Status Check:**
- [ ] MapSidebarShell uses `variant="elevated"` with glow border
- [ ] Modal overlays use `variant="elevated"` with high opacity background
- [ ] Card panels use `variant="default"` with light border
- [ ] All panels have `border border-white/5` at minimum
- [ ] Glow borders only on interactive/important panels
- [ ] Blur levels match hierarchy: elevated (lg) > default (md) > subtle (sm)
- [ ] Hover effects transition smoothly (200ms)
- [ ] Padding consistent within component category
- [ ] No glass effect without backdrop blur
- [ ] Rounded corners match button radii where appropriate (xl for buttons, 2xl+ for cards)

**GlassCard Variant:**
- [ ] Interactive by default (`interactive=true`)
- [ ] Hovers with glow: `glowOnHover=true`
- [ ] Active scale: `active:scale-[0.99]` (subtle press effect)
- [ ] Used for job cards, worker cards, stat cards

**FeatureCard Variant:**
- [ ] Gradient border on hover (opacity 0 → 100)
- [ ] Gradient options: cyan, purple, emerald, amber
- [ ] Shine effect optional (hover shine sweep)
- [ ] Used for feature/benefit cards on landing

---

### 7.3 Modal Component (`src/components/ui/Modal.tsx`)

**Status Check:**
- [ ] Backdrop: `bg-slate-950/50` with `backdrop-blur-sm` (not opaque black)
- [ ] Modal container: uses GlassPanel or custom glass styles
- [ ] Modal background: `bg-slate-900/95 backdrop-blur-20px` (opaque)
- [ ] Border: `border-white/10` (slightly visible)
- [ ] Rounded: `rounded-2xl` or `rounded-3xl`
- [ ] Padding: `p-6` or `p-8` (generous)
- [ ] Z-index: `z-50` (from zIndex tokens)
- [ ] Animation: `animate-fade-in` or `animate-scale-in`
- [ ] Close button: ghost variant, top-right positioned
- [ ] Focus management: first focusable element on open
- [ ] Escape key closes modal
- [ ] Click outside closes (if not critical modal)

**Geolocation Modal Example** (`src/components/ui/GeolocationModal.tsx`):
- [ ] Uses glass morphism
- [ ] Shows description text in slate-400
- [ ] Has primary CTA button (cyan gradient)
- [ ] Respects user privacy (no auto-request)
- [ ] Clear deny option

---

### 7.4 Input Component (`src/components/ui/Input.tsx`)

**Base Style:**

```
bg-slate-800/50
border border-white/10
rounded-xl
text-white
placeholder-slate-500
transition-all duration-200
focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
```

**Sizes:**

```
sm: h-9 px-3 text-sm
md: h-11 px-4 text-base (default)
lg: h-13 px-5 text-lg
```

**States:**

```
error: border-red-500/50 focus:border-red-500 focus:ring-red-500/20
success: border-green-500/50 focus:border-green-500 focus:ring-green-500/20
disabled: opacity-50 cursor-not-allowed
```

**Status Check:**
- [ ] Input background is dark (slate-800/50), not white
- [ ] Border is subtle white/10, not hard gray
- [ ] Focus border uses cyan (brand color), not default blue
- [ ] Focus ring uses low opacity cyan (0.2)
- [ ] Placeholder text is slate-500 (medium gray)
- [ ] Padding consistent with button padding
- [ ] Border-radius matches buttons (rounded-xl)
- [ ] Error state uses red (not pink or other red variant)
- [ ] Success state uses green (not emerald)
- [ ] Disabled state grayed out and non-interactive
- [ ] Label color: `text-white` for required, `text-slate-400` for optional
- [ ] Helper text: `text-xs text-slate-500`
- [ ] Icons inside input aligned properly

---

### 7.5 Card Component (`src/components/ui/Card.tsx`)

**Base Style:**

```
bg-slate-900/80
backdrop-blur-sm
border border-white/5
rounded-2xl
padding: p-4 (md) or p-6 (lg)
transition-all duration-200
```

**Interactive Card:**

```
hover:border-white/10
hover:bg-slate-900/90
hover:shadow-glow (if glowOnHover)
active:scale-[0.99]
cursor-pointer
```

**Job Card Example** (`src/components/cards/JobListCard.tsx`):
- [ ] Shows job title (bold, white)
- [ ] Shows company/location (slate-400)
- [ ] Shows pay or rate (cyan or success accent)
- [ ] Badge for job type (hourly/fixed/project)
- [ ] Hover lifts with glow
- [ ] Click navigates to detail

**Worker Card Example** (`src/components/cards/WorkerListCard.tsx`):
- [ ] Shows worker name and avatar
- [ ] Shows rating and review count
- [ ] Shows skills/specialties
- [ ] Live dot (if online)
- [ ] Hover effect with glow
- [ ] Click navigates to profile

**Stat Card Example:**
- [ ] Large number (text-3xl or 4xl) in white
- [ ] Label (text-sm, slate-400)
- [ ] Trend indicator if applicable (green/red)
- [ ] Icon or background accent
- [ ] No hover effect (informational)

**Status Check:**
- [ ] All cards use glass morphism (bg + backdrop-blur + border)
- [ ] Card padding matches token scale
- [ ] Interactive cards scale on active: `active:scale-[0.99]`
- [ ] Borders are white/5 or white/10 (not hard colors)
- [ ] Rounded corners are 2xl or 3xl (not lg)
- [ ] Glow shadow on hover (if clickable)
- [ ] Content hierarchy: heading → metadata → action
- [ ] Icons in cards are sized consistently (24–32px)
- [ ] Empty states show placeholder text (slate-500)

---

### 7.6 LiveDot & Status Indicators (`src/components/ui/LiveDot.tsx`)

**LiveDot Component:**

```
Variants: cyan, green, red, amber, purple, blue
Sizes: sm (h-2 w-2), md (h-3 w-3), lg (h-4 w-4)
Pulse: true (animated) | false (static)
```

**Color Mapping:**

```
cyan: outer/inner bg-cyan-400/500 (brand, active)
green: outer/inner bg-emerald-400/500 (online)
red: outer/inner bg-red-400/500 (urgent, offline)
amber: outer/inner bg-amber-400/500 (away)
purple: outer/inner bg-purple-400/500 (custom status)
blue: outer/inner bg-blue-400/500 (secondary status)
```

**StatusDot Component:**

```
Status: online, offline, busy, away, invisible
Sizes: sm (h-2), md (h-2.5), lg (h-3)
No pulse animation (static indicator)
```

**LiveIndicator Component:**

```
Shows: pulsing dot + label text (e.g., "LIVE", "ACTIVE")
Background: bg-{color}-500/20
Text color: text-{color}-400
```

**ActivityIndicator Component:**

```
Shows: count + label (e.g., "23 active")
Background: glass panel style
Cyan dot indicator
```

**Status Check:**
- [ ] LiveDot used for pulsing status (online, active)
- [ ] StatusDot used for static status (offline, away)
- [ ] Cyan variant always indicates "active" or "online" state
- [ ] Green variant for confirmations or success
- [ ] Red variant for errors, offline, or urgent
- [ ] Amber variant for pending or away states
- [ ] Pulse animation uses `animate-ping` (Tailwind built-in)
- [ ] Pulse has outer (fading) and inner (solid) rings
- [ ] Border on status dots: `border-2 border-slate-900` (separation)
- [ ] Sizes match icon hierarchy
- [ ] No hardcoded colors – use variant system

---

### 7.7 Dropdown Components

**Dropdown.tsx** (Generic):
- [ ] Uses GlassPanel or custom glass
- [ ] Trigger button is ghost or secondary variant
- [ ] Menu items: `text-slate-300 hover:bg-slate-800/50`
- [ ] Selected item: `bg-slate-800 border-l-2 border-cyan-500`
- [ ] Dividers: `border-white/10`
- [ ] Icons aligned left, text centered
- [ ] Z-index: 50 (dropdown)

**BudgetDropdown.tsx** & **CategoryDropdown.tsx**:
- [ ] Extends generic dropdown
- [ ] Budget ranges or categories displayed as list
- [ ] Checkmark icon for selected item
- [ ] Scroll-friendly (max-height with overflow)
- [ ] Search/filter optional
- [ ] Keyboard navigation (arrow keys, enter)

**Status Check:**
- [ ] Dropdown trigger button matches surrounding style
- [ ] Menu positioned absolutely, not overlapping content
- [ ] Menu has glass background and border
- [ ] Hover state on items is subtle (bg-slate-800/50)
- [ ] Selected item has left border accent
- [ ] Rounded corners consistent with buttons
- [ ] Padding consistent with card/button padding
- [ ] Closing animation: `animate-fade-out` or fade
- [ ] Opening animation: `animate-fade-in` or `animate-slide-in-bottom`
- [ ] Escape key closes menu
- [ ] Click outside closes menu

---

### 7.8 Toast Component (`src/components/ui/Toast.tsx`)

**Status Check:**
- [ ] Uses react-hot-toast or custom implementation
- [ ] Background: glass morphism (slate-900/90 backdrop-blur-md)
- [ ] Border: border-white/10
- [ ] Rounded: rounded-xl or rounded-2xl
- [ ] Padding: p-4
- [ ] Z-index: 80 (top layer)
- [ ] Success variant: green/emerald color scheme
- [ ] Error variant: red color scheme
- [ ] Info variant: cyan/blue color scheme
- [ ] Warning variant: amber color scheme
- [ ] Icon color matches status color
- [ ] Message text: white
- [ ] Auto-dismiss after 4–5 seconds
- [ ] Dismiss button or click-to-close
- [ ] Animation: `animate-slide-in-bottom` entry, `animate-fade-out` exit
- [ ] Multiple toasts stack vertically with gap
- [ ] Max z-index avoids blocking modals

---

## 8. Map Experience Design

### 8.1 Map Container & Layout

**Reference:** `src/lib/map-tokens.ts`

**Status Check:**
- [ ] Map itself is full-width, full-height on mobile
- [ ] Desktop: map takes remaining space, sidebar fixed left
- [ ] Sidebar width: 420px (default) or 480px (expanded)
- [ ] Map style: `'dark'` or `'satellite'` (no light mode)
- [ ] Map markers use brand colors (cyan for hire, emerald for work)
- [ ] Z-index hierarchy: map (10) < sidebar (20) < modals (50)

---

### 8.2 Sidebar Design (`MapSidebarShell.tsx`)

**Background & Glass:**
- [ ] `bg-slate-900/95 backdrop-blur-xl` (opaque, premium glass)
- [ ] `border border-white/10` (subtle border)
- [ ] Rounded corners on mobile bottom sheet
- [ ] Z-index: 20

**Header:**
- [ ] Padding: `p-5` (20px)
- [ ] Gap: `gap-4` (16px)
- [ ] Shows mode (Hire/Work) or close button on mobile
- [ ] Title in white, bold
- [ ] Search input (if applicable)

**Results Bar:**
- [ ] Padding: `px-5 py-3.5` (20px horizontal, 14px vertical)
- [ ] Shows count: "45 jobs found"
- [ ] Sort/filter buttons on right
- [ ] Background: subtle glass or transparent

**Content Area:**
- [ ] Scrollable (max-height, overflow-y)
- [ ] Padding: `p-5` (20px)
- [ ] Gap between cards: `gap-4` (16px)
- [ ] No bottom padding (cards scroll past edge)

**Card Styling:**
- [ ] Padding: `p-4` (16px)
- [ ] Icon: `w-12 h-12` (48px)
- [ ] Icon border-radius: `rounded-xl` (12px)
- [ ] Title font-size: 15px (slightly larger than body)
- [ ] Meta font-size: 13px (smaller than body)
- [ ] Price font-size: 15px (semibold)
- [ ] Gap icon to content: 14px

**Status Check:**
- [ ] Sidebar is opaque (not see-through to map)
- [ ] No content should be hidden behind sidebar
- [ ] Mobile: bottom sheet with drag handle (if swipeable)
- [ ] Mobile: full-width, scrollable
- [ ] Desktop: fixed height, scrollable content
- [ ] Card click opens detail view
- [ ] Filters update results in real-time
- [ ] Empty state shows helpful message

---

### 8.3 Map Markers & Icons

**Marker Colors:**
- [ ] Work mode: emerald-500 (#10b981)
- [ ] Hire mode: cyan-500 (#06b6d4)
- [ ] Highlighted/hovered: lighter shade
- [ ] Cluster markers: muted (slate-500)

**Marker Size:**
- [ ] Standard: 32–40px diameter
- [ ] Hover/highlighted: 40–48px
- [ ] Cluster: 48px+

**Status Check:**
- [ ] All markers use design token colors
- [ ] No hardcoded hex codes for markers
- [ ] Marker icon is recognizable (building, person, etc.)
- [ ] Active marker has glow effect (box-shadow)
- [ ] Cluster markers show count
- [ ] Marker click shows card info or navigates

---

### 8.4 Map Mode-Specific Styling

**Work Mode** (`modeColors.work` in map-tokens.ts):
```
primary: emerald
colors: emerald-500/emerald-400 for text, emerald-500/10 for backgrounds
border: emerald-500/20 (normal), emerald-500/50 (active)
ring: emerald-500/30 for focus states
shadow: emerald-500/25 for glow
liveDot: green (for online workers)
```

**Hire Mode** (`modeColors.hire`):
```
primary: cyan
colors: cyan-500/cyan-400 for text, cyan-500/10 for backgrounds
border: cyan-500/20 (normal), cyan-500/50 (active)
ring: cyan-500/30 for focus states
shadow: cyan-500/25 for glow
liveDot: cyan (for available contractors)
```

**Status Check:**
- [ ] Work UI uses emerald consistently (buttons, badges, accents)
- [ ] Hire UI uses cyan consistently
- [ ] Mode switch changes all accent colors
- [ ] Status indicators (LiveDot) use mode color
- [ ] Badges and pills use mode color
- [ ] No mixing of emerald/cyan in single experience
- [ ] Gradient buttons use mode colors: `from-emerald-500 to-teal-600` (work) or `from-cyan-500 to-blue-600` (hire)

---

## 9. Dark Mode Implementation

### 9.1 Dark Theme as Primary

**Status Check:**
- [ ] No light mode toggle (dark is only option)
- [ ] All colors designed for slate-950 background
- [ ] No white text on white background (use slate hierarchy)
- [ ] Text contrast verified for WCAG AA
- [ ] No pure black (#000000) – use slate-950 (#020617)
- [ ] No pure white (#FFFFFF) – use white for primary text only
- [ ] Secondary text consistently slate-300–slate-400
- [ ] Muted text consistently slate-500–slate-600

**Text Color Hierarchy:**
```
Primary (headings): #ffffff (white)
Primary (body): #e2e8f0 (slate-200) – use sparingly
Secondary (body): #cbd5e1 (slate-300)
Tertiary (body): #94a3b8 (slate-400) – most common
Muted (meta): #64748b (slate-500)
Very muted: #475569 (slate-600) – avoid using
```

**Status Check:**
- [ ] No light mode colors in CSS
- [ ] No `dark:` prefixes (not needed, everything is dark)
- [ ] No `light:` variant components
- [ ] No theme switcher in UI
- [ ] All components default to dark theme

---

### 9.2 Contrast & Readability

**WCAG Compliance:**

| Use Case | Minimum Ratio | Current Check |
|----------|---------------|---------------|
| Body text (normal) | 4.5:1 | white on slate-950: ✓ |
| Small text (<18px) | 4.5:1 | slate-400 on slate-950: ✓ |
| Large text (18px+) | 3:1 | All current: ✓ |
| UI controls | 3:1 | button borders: ✓ |

**Status Check:**
- [ ] Run WebAIM contrast checker on all text
- [ ] Hover/focus states have sufficient contrast
- [ ] Icon colors have sufficient contrast (e.g., cyan icons on dark background)
- [ ] Badges and labels are readable
- [ ] Error messages are red (sufficient contrast on dark bg)
- [ ] Links are cyan (sufficient contrast)
- [ ] No text smaller than 12px without 4.5:1 contrast
- [ ] No color-only distinction (always use text or icon + color)

---

## 10. Landing Page Variants (A–F)

**Variants Location:** `/src/app/landing-a` through `/src/app/landing-f`

**Each Variant Must Use:**
- [ ] Same token system (no variant-specific colors)
- [ ] Same Inter font loaded globally
- [ ] Same animation library
- [ ] Same spacing scale
- [ ] Same border radius scale
- [ ] Same shadow system
- [ ] Same glass morphism presets

**Variant-Specific Elements:**
- [ ] Different layout (hero full-width vs. two-column)
- [ ] Different copy or messaging
- [ ] Different CTA placement
- [ ] Different visual hierarchy
- [ ] Different form field arrangement
- [ ] All using AmbientBackground for consistency

**Status Check:**
- [ ] All variants load from same tailwind config
- [ ] Color value never hardcoded (always use Tailwind class or token)
- [ ] Font always via `font-sans` class (not direct font-family)
- [ ] Spacing always via Tailwind scale (not hardcoded px)
- [ ] Border radius always from scale (not custom values)
- [ ] Animations always from tailwind config (not custom CSS)
- [ ] If variant needs unique style, add to tailwind config, not inline
- [ ] All variants A–F render same in terms of design tokens

---

## 11. Marketing Background (`AmbientBackground.tsx`)

**Component Location:** `/src/components/AmbientBackground.tsx`

### 11.1 Design Token System

**Colors (from `backgroundTokens`):**

```typescript
colors: {
  base: 'rgb(2, 6, 23)',           // slate-950
  glow1: 'rgba(6, 182, 212, 0.10)' // cyan-500
  glow2: 'rgba(37, 99, 235, 0.10)' // blue-600
  glow3: 'rgba(139, 92, 246, 0.05)' // purple-600
  box: 'rgba(6, 182, 212, 0.03)'    // cyan boxes
  boxBorder: 'rgba(6, 182, 212, 0.08)' // cyan borders
  gridLine: 'rgba(6, 182, 212, 0.05)' // grid lines
  scanLine: 'rgba(6, 182, 212, 0.05)' // scan effect
}
```

**Intensity Levels:**

```
low: { box: 60s, scan: 12s } + reduced opacity
normal: { box: 40s, scan: 8s } + standard opacity (default)
high: { box: 25s, scan: 5s } + enhanced opacity
```

**Opacity Multipliers:**

```
low: { glow: 0.5, box: 0.3, grid: 0.3 }
normal: { glow: 1, box: 0.6, grid: 0.5 }
high: { glow: 1, box: 0.9, grid: 0.7 }
```

**Status Check:**
- [ ] All glow colors use cyan (#06b6d4) or blue/purple variants
- [ ] Opacity values are consistent (not random floats)
- [ ] Intensity state saved to localStorage
- [ ] Custom event dispatched on intensity change
- [ ] Reduced motion respected (`prefers-reduced-motion: reduce`)
- [ ] Mobile Safari optimized (animations disabled on small viewport)

### 11.2 Animation Details

**Grid Lines:**
- [ ] Pattern: 60px grid (6px gap, 4px line)
- [ ] Color: rgba(6, 182, 212, 0.05)
- [ ] Static (no animation)

**Scan Line:**
- [ ] Height: 128px (h-32)
- [ ] Gradient: transparent → cyan/5 → transparent
- [ ] Animation: `scanLine {speed}s linear infinite`
- [ ] Speed varies by intensity (slow: 12s, normal: 8s, fast: 5s)

**Glow Spots (3):**
- [ ] Top-left: cyan-500/10 (96×96 pixels)
- [ ] Bottom-right: blue-600/10 (96×96 pixels)
- [ ] Center: purple-600/5 (500×500 pixels, blurred to 120px)
- [ ] All use `blur(100px)` or `blur(120px)` for soft effect
- [ ] Static opacity changes with intensity

**Floating Boxes:**
- [ ] Count: 6–14 boxes (varies by intensity)
- [ ] Size: 80–320px (randomized per box)
- [ ] Position: deterministic but varied
- [ ] Rotation: -15 to +15 degrees
- [ ] Animation: `ambientBoxFloat {duration}s ease-in-out infinite {delay}s`
- [ ] Duration: 25–60 seconds (varies by intensity and index)
- [ ] Delay: staggered 0–8 seconds
- [ ] GPU acceleration: `transform: translate3d()` + `will-change`

**Status Check:**
- [ ] Grid is visible but subtle (not distracting)
- [ ] Scan line moves from top to bottom continuously
- [ ] Glow spots are blurred (not sharp circles)
- [ ] Boxes float smoothly (not jerky)
- [ ] No excessive opacity variations (smooth breathing)
- [ ] Performance is good (no FPS drops)
- [ ] Mobile viewport disables animations
- [ ] Reduced motion completely disables animations

### 11.3 Intensity Control

**Storage & Event System:**

```typescript
getStoredIntensity()        // Get from localStorage
setStoredIntensity(level)   // Save to localStorage + dispatch event
// Event: 'background-intensity-change' with detail: 'low' | 'normal' | 'high'
```

**Status Check:**
- [ ] Intensity preference persists across page reload
- [ ] Other components can listen for intensity changes
- [ ] Settings page can adjust background intensity
- [ ] No performance impact when changing intensity
- [ ] Intensity applies immediately to new renders

---

## 12. Consistency Across Features

### 12.1 Hardcoded Color Audit

**Search for Anti-Patterns:**

```bash
# ❌ WRONG - Hardcoded hex
background-color: #0c8ce7;
fill: #ff7f10;
color: '#1e293b';

# ✓ CORRECT - Token-based
className="from-cyan-500 to-blue-600"
style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }} (if necessary with token)
```

**Status Check:**
- [ ] No hex codes outside token definitions
- [ ] No `rgb()` colors except in token definitions
- [ ] All component colors use Tailwind classes or token constants
- [ ] Token file is single source of truth
- [ ] Design system file is secondary source of truth
- [ ] Tailwind config is third source (should match tokens)

---

### 12.2 Font Usage Audit

**Status Check:**
- [ ] All text uses `font-sans` (Inter, globally loaded)
- [ ] No `font-serif` or `font-mono` in UI text
- [ ] Mono font reserved for code/terminal elements
- [ ] Font sizes always from scale (0.75rem–3.75rem)
- [ ] Font weights always 400/500/600/700
- [ ] No `@import` of fonts except Inter in layout
- [ ] Web font loading doesn't block render (use `next/font`)

---

### 12.3 Spacing Consistency

**Status Check:**
- [ ] All padding uses scale: `p-3`, `p-4`, `p-6`, `p-8`
- [ ] All margin uses scale: `m-2`, `m-4`, `m-6`, etc.
- [ ] All gap uses scale: `gap-2`, `gap-3`, `gap-4`, etc.
- [ ] No hardcoded pixel values in inline styles
- [ ] Custom spacings (4.5, 13, 15, 18, 22, 26, 30) used sparingly
- [ ] Negative margins use scale: `-m-2`, `-m-4`, etc.
- [ ] Translate uses scale: `translate-x-4`, `translate-y-6`, etc.

---

### 12.4 Animation Consistency

**Status Check:**
- [ ] All animations use defined keyframes
- [ ] No custom CSS animations outside tailwind config
- [ ] Duration always from scale: 150ms, 200ms, 300ms, 500ms
- [ ] Easing functions are consistent (default, in, out, inOut)
- [ ] Stagger animations use delay scale: `delay-[50ms]`, `delay-[100ms]`, etc.
- [ ] `will-change` applied to animated elements
- [ ] Reduced motion respected globally
- [ ] Mobile animations disabled where performance-critical

---

### 12.5 Component Reusability

**Status Check:**
- [ ] Button component used everywhere (no inline styled buttons)
- [ ] Card component used for all card layouts
- [ ] GlassPanel used for all overlays/panels
- [ ] Input component used for all text fields
- [ ] Modal component used for all dialogs
- [ ] Toast component used for all notifications
- [ ] LiveDot used for all status indicators
- [ ] Dropdown components used for all menus
- [ ] No duplicate component implementations

---

## 13. Performance & Optimization

### 13.1 Animation Performance

**Critical Checks:**
- [ ] Animate transform/opacity only (GPU-accelerated)
- [ ] Use `will-change: transform, opacity` on animated elements
- [ ] No animating width/height/top/left/right
- [ ] No box-shadow animations (expensive)
- [ ] Particle animations use `transform: translate3d()` for 3D acceleration
- [ ] Max 10–15 simultaneous animations
- [ ] Staggered animations use CSS delays (not JS loops)
- [ ] `prefers-reduced-motion: reduce` disables all animations
- [ ] AmbientBackground disabled on mobile Safari

**Measurement:**
- [ ] Chrome DevTools: Rendering → Paint flashing (should be minimal)
- [ ] DevTools: Performance tab, record animation (60 FPS target)
- [ ] Lighthouse Performance score > 85 on landing page

### 13.2 CSS Bundle Size

**Status Check:**
- [ ] Unused Tailwind classes purged via content config
- [ ] No duplicate CSS rules
- [ ] Custom colors only in `extend` section (not entire palette)
- [ ] Animations only added if used
- [ ] Keyframes not duplicated across files
- [ ] Global CSS minimal (use component-scoped styles)

### 13.3 Component Bundle Size

**Status Check:**
- [ ] Button component is lightweight (no heavy dependencies)
- [ ] GlassPanel is pure CSS (no external libs)
- [ ] AmbientBackground uses React hooks efficiently
- [ ] No duplicate npm packages
- [ ] Icons use tree-shaking (lucide-react supports this)
- [ ] No unused imports in component files

---

## 14. Checklist for Code Review

### Design System Compliance

- [ ] Colors use token system (no hardcoded hex)
- [ ] Typography uses Inter font and defined scale
- [ ] Spacing uses Tailwind scale (no hardcoded px)
- [ ] Border radius uses token scale
- [ ] Shadows use predefined shadow system
- [ ] Z-index uses token scale
- [ ] Animations use defined keyframes
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Dark theme is primary (no light mode)
- [ ] All components use shared base styles

### Component Implementation

- [ ] Button uses correct variant and size
- [ ] GlassPanel uses appropriate variant (default/elevated/subtle)
- [ ] Cards have proper glass morphism effect
- [ ] Inputs have correct focus states
- [ ] Modals are opaque with glass background
- [ ] Dropdowns positioned correctly with proper z-index
- [ ] LiveDot/StatusDot use correct variant
- [ ] Toast notifications have correct styling
- [ ] Forms have proper label and error styling
- [ ] Icons are properly sized and colored

### Responsive & Mobile

- [ ] Mobile-first approach (sm: → md: → lg:)
- [ ] No horizontal scrolling on mobile
- [ ] Sidebar becomes bottom sheet on mobile
- [ ] Buttons/inputs touch-friendly (min 44px height)
- [ ] Text readable without zoom
- [ ] No animations on mobile Safari
- [ ] Tap targets properly spaced
- [ ] Modal takes full height on mobile
- [ ] Flexbox/Grid properly stacked on mobile

### Accessibility

- [ ] Text contrast ≥ 4.5:1 (WCAG AA)
- [ ] Focus rings visible (cyan ring)
- [ ] Keyboard navigation works
- [ ] Reduced motion respected
- [ ] Form labels present (not just placeholder)
- [ ] Error messages clear and visible
- [ ] Link text descriptive (not "click here")
- [ ] Icons have alt text or aria-label
- [ ] Modal has proper ARIA attributes
- [ ] Loading states announced to screen readers

### Performance

- [ ] Animations use GPU-accelerated properties
- [ ] `will-change` applied appropriately
- [ ] No expensive paint operations
- [ ] Layout shifts minimized (no CLS)
- [ ] Images optimized (no oversized)
- [ ] Fonts loaded efficiently (`next/font`)
- [ ] Bundle size acceptable
- [ ] No inline styles where Tailwind classes exist
- [ ] CSS/JS minified in production
- [ ] Lighthouse score ≥ 85

---

## 15. Common Issues & Solutions

### Issue 1: Hardcoded Colors in Components

**Problem:**
```tsx
<div style={{ backgroundColor: '#0c8ce7' }}>
```

**Solution:**
```tsx
<div className="bg-cyan-500">  // or from-cyan-500 for gradients
```

---

### Issue 2: Inconsistent Glass Morphism

**Problem:**
```tsx
<div className="bg-slate-900 border-white/5">  // Missing blur
```

**Solution:**
```tsx
<div className="bg-slate-900/80 backdrop-blur-md border-white/5">
```

---

### Issue 3: Wrong Button Gradient

**Problem:**
```tsx
<button className="bg-gradient-to-r from-blue-400 to-blue-600">
```

**Solution:**
```tsx
<button className="bg-gradient-to-r from-cyan-500 to-blue-600">
```

---

### Issue 4: Animating Expensive Properties

**Problem:**
```css
@keyframes slide {
  0% { left: 0; }
  100% { left: 100px; }  // Bad: animates left position
}
```

**Solution:**
```css
@keyframes slide {
  0% { transform: translateX(0); }
  100% { transform: translateX(100px); }  // Good: GPU-accelerated
}
```

---

### Issue 5: Missing Reduced Motion Support

**Problem:**
```tsx
<div className="animate-float">  // Always animates, ignores user preference
```

**Solution:**
```tsx
// In tailwind config, prefers-reduced-motion is handled globally
// Component automatically disables if user prefers reduced motion
```

---

### Issue 6: Inconsistent Spacing

**Problem:**
```tsx
<div style={{ padding: '20px', margin: '16px' }}>
```

**Solution:**
```tsx
<div className="p-5 m-4">  // Uses Tailwind scale (20px and 16px)
```

---

### Issue 7: Focus States Missing

**Problem:**
```tsx
<button className="bg-cyan-500 text-white">  // No focus ring
```

**Solution:**
```tsx
<button className="bg-cyan-500 text-white focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
```

---

## 16. Maintenance & Updates

### Adding New Colors

1. Add to `src/design/tokens.ts` (primary source)
2. Add to `tailwind.config.ts` (Tailwind source)
3. Update `src/lib/design-system.ts` if needed
4. Update this checklist
5. Do NOT use in code until added to all three sources

### Adding New Animations

1. Add keyframes to `tailwind.config.ts`
2. Add to `animation:` section in Tailwind config
3. Add to `src/design/tokens.ts` if used in tokens
4. Test on various browsers
5. Ensure `prefers-reduced-motion` is respected
6. Test performance (no FPS drops)

### Changing Breakpoints

1. Update `tailwind.config.ts`
2. Update `src/design/tokens.ts` breakpoints section
3. Test responsive layout at all breakpoints
4. Check mobile touch targets
5. Test on actual devices (not just DevTools)

### Updating Font

1. Ensure new font is loaded via `next/font` in layout
2. Update CSS variable: `--font-inter`
3. Update all font references in token files
4. Update Tailwind config `fontFamily`
5. Test on multiple browsers
6. Verify WCAG contrast ratios

---

## 17. Final Review Checklist

Before merging any PR:

- [ ] All colors from token system only
- [ ] No hardcoded hex, rgb(), or hsl() values
- [ ] Typography uses Inter + defined scale
- [ ] Spacing uses Tailwind scale
- [ ] Border radius uses token scale
- [ ] Animations use defined keyframes
- [ ] All components use shared base styles
- [ ] Glass morphism present on overlays (bg + blur + border)
- [ ] Focus rings visible and consistent
- [ ] Dark theme is primary (no light mode)
- [ ] Reduced motion respected
- [ ] Mobile responsive verified
- [ ] Text contrast ≥ 4.5:1
- [ ] No console errors or warnings
- [ ] Lighthouse performance ≥ 85
- [ ] AmbientBackground works on all landing variants
- [ ] Map experience uses correct mode colors (emerald/cyan)
- [ ] All buttons use correct variant/size
- [ ] All cards use glass morphism styling
- [ ] Form inputs styled consistently
- [ ] Error states clearly visible
- [ ] Loading states use proper spinner animation

---

## References

**Design Files:**
- Tailwind Config: `/tailwind.config.ts`
- Tokens File: `/src/design/tokens.ts`
- Design System: `/src/lib/design-system.ts`
- Map Tokens: `/src/lib/map-tokens.ts`
- Ambient Background: `/src/components/AmbientBackground.tsx`

**Component Files:**
- Button: `/src/components/ui/Button.tsx`
- GlassPanel: `/src/components/ui/GlassPanel.tsx`
- Card: `/src/components/ui/Card.tsx`
- Modal: `/src/components/ui/Modal.tsx`
- Input: `/src/components/ui/Input.tsx`
- Dropdown: `/src/components/ui/Dropdown.tsx`
- LiveDot: `/src/components/ui/LiveDot.tsx`
- Toast: `/src/components/ui/Toast.tsx`
- MapSidebarShell: `/src/components/sidebar/MapSidebarShell.tsx`

**Landing Variants:** `/src/app/landing-{a,b,c,d,e,f}/page.tsx`

---

**Document Version:** 1.0
**Last Updated:** February 2026
**Status:** Complete & Production-Ready
