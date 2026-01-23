# CrewLink Theme Consistency Checklist

Use this checklist when reviewing UI changes to ensure theme consistency.

## Colors

### Background Colors
- [ ] Primary background: `bg-slate-950` (#020617)
- [ ] Secondary background: `bg-slate-900` (#0f172a)
- [ ] Elevated surfaces: `bg-slate-900/50` with backdrop blur
- [ ] Card backgrounds: `bg-slate-900/50` or `bg-slate-800/50`

### Text Colors
- [ ] Primary text: `text-white`
- [ ] Secondary text: `text-slate-400`
- [ ] Muted text: `text-slate-500`
- [ ] Links: `text-cyan-400` with `hover:text-cyan-300`

### Accent Colors
- [ ] Primary accent: `cyan-500` (#06b6d4)
- [ ] Secondary accent: `blue-600` (#2563eb)
- [ ] Success: `emerald-500` (#10b981)
- [ ] Warning: `amber-500` (#f59e0b)
- [ ] Error: `red-500` (#ef4444)

### Border Colors
- [ ] Default borders: `border-cyan-500/10`
- [ ] Hover borders: `border-cyan-500/20`
- [ ] Active borders: `border-cyan-500/30`

## Typography

### Font Family
- [ ] Body: `font-sans` (Inter)
- [ ] Display: `font-display` (Inter)
- [ ] Mono: `font-mono` (system monospace)

### Font Sizes
- [ ] Headings follow scale: `text-4xl`, `text-3xl`, `text-2xl`, `text-xl`
- [ ] Body text: `text-base` or `text-sm`
- [ ] Small text: `text-xs`
- [ ] No arbitrary sizes like `text-[13px]`

### Font Weights
- [ ] Headings: `font-bold` or `font-semibold`
- [ ] Body: default (400) or `font-medium`
- [ ] Labels: `font-medium`

## Spacing

### Padding
- [ ] Section padding: `p-6` or `p-8`
- [ ] Card padding: `p-4` or `p-6`
- [ ] Input padding: `px-4 py-3` or `px-3 py-2`
- [ ] Button padding: `px-6 py-2.5` or `px-4 py-2`

### Margins
- [ ] Section margins: `mb-8` or `mb-12`
- [ ] Element spacing: `gap-4` or `gap-6`
- [ ] Tight spacing: `gap-2` or `gap-3`

### Consistent spacing values
- [ ] Use Tailwind's scale: 2, 3, 4, 5, 6, 8, 10, 12...
- [ ] No arbitrary values like `m-[7px]`

## Border Radius

- [ ] Buttons: `rounded-xl` (12px)
- [ ] Cards: `rounded-2xl` (16px)
- [ ] Inputs: `rounded-xl` (12px)
- [ ] Tags/Badges: `rounded-full` or `rounded-lg`
- [ ] Avatars: `rounded-xl` (square) or `rounded-full` (circle)

## Shadows

- [ ] Cards: `shadow-xl shadow-black/20` or `shadow-2xl shadow-black/40`
- [ ] Elevated elements: Use blur + border, not heavy shadows
- [ ] Glow effects: `shadow-lg shadow-cyan-500/25`

## Icons

### Sizes
- [ ] Navigation: `w-5 h-5`
- [ ] Buttons with icons: `w-4 h-4`
- [ ] Feature icons: `w-6 h-6`
- [ ] Decorative: `w-8 h-8` or larger

### Style
- [ ] Use Lucide icons consistently
- [ ] Stroke width: default (2px)
- [ ] Same icon set throughout (no mixing icon libraries)

## Buttons

### Primary CTA
```jsx
className="relative group overflow-hidden"
// Inner gradient + glow on hover
```

### Secondary Button
```jsx
className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl"
```

### Ghost Button
```jsx
className="px-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg"
```

### Icon Button
```jsx
className="p-2.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg"
```

## Form Elements

### Inputs
```jsx
className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl
           text-white placeholder-slate-500
           focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
```

### Labels
```jsx
className="block text-sm font-medium text-slate-300 mb-2"
```

### Helper Text
```jsx
className="text-xs text-slate-500 mt-1"
```

### Error State
```jsx
className="border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
```

## Cards

### Standard Card
```jsx
className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/10 rounded-2xl p-6"
```

### Interactive Card
```jsx
className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/10 rounded-2xl p-6
           hover:border-cyan-500/20 hover:bg-slate-900/70 transition-all cursor-pointer"
```

### Glass Panel
```jsx
className="bg-slate-900/80 backdrop-blur-2xl border border-cyan-500/10 rounded-2xl"
```

## Animations

### Existing animations to preserve:
- [ ] Float animations on decorative elements
- [ ] Glow pulse on primary CTAs
- [ ] Scan line effect on backgrounds
- [ ] Slide-in animations on modals/dropdowns
- [ ] Fade-up on page content
- [ ] Pulse on notification indicators

### Transition defaults:
- [ ] Colors: `transition-colors` (150ms)
- [ ] All properties: `transition-all` (200ms)
- [ ] Transform: `transition-transform` (200ms)

### Never modify:
- [ ] Animation keyframes in tailwind.config.ts
- [ ] Ambient background animations
- [ ] Page entrance animations

## Accessibility

- [ ] Focus states visible: `focus:ring-2 focus:ring-cyan-500`
- [ ] Color contrast meets WCAG AA
- [ ] Interactive elements have hover states
- [ ] Disabled states visually distinct

## Common Anti-Patterns to Avoid

- [ ] No random grays (use slate scale)
- [ ] No pure black (`#000`) - use `slate-950`
- [ ] No pure white text on colored backgrounds (reduce opacity)
- [ ] No inconsistent border radius
- [ ] No inline styles for colors/spacing
- [ ] No hardcoded pixel values
- [ ] No mixing different icon libraries
- [ ] No custom fonts outside the design system

## Verification Commands

```bash
# Check for inline styles
grep -r "style={{" src/

# Check for arbitrary Tailwind values
grep -rE "\[#[0-9a-fA-F]+\]|\[[0-9]+px\]" src/

# Check for non-Lucide icons
grep -r "from 'react-icons'" src/

# Verify theme token usage
npm run lint
```
