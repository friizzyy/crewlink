# CrewLink Performance Guide

## Overview

CrewLink is a location-based gig marketplace with critical performance requirements:
- **Mapbox GL JS**: 500KB+ bundle (maps/markers)
- **Fallback mapping**: Leaflet + react-leaflet (~150KB)
- **Dynamic content**: Jobs, users, messages, notifications
- **Mobile-first**: Location tracking, geolocation API
- **Animation-heavy**: 30+ Tailwind animations, AmbientBackground particles

This guide documents performance monitoring, optimization strategies, and critical bottlenecks.

---

## Critical Performance Concerns

### 1. Map Performance (CRITICAL)

The map pages (`/hiring/map`, `/work/map`) are the heaviest in the application and directly impact LCP and TTI.

#### Bundle Impact
- **mapbox-gl**: ~500KB (JS + CSS)
- **@mapbox/mapbox-gl-geocoder**: ~50KB additional
- **Leaflet fallback**: ~39KB JS + ~8KB CSS
- **react-leaflet**: ~100KB

**Total map bundle**: ~700KB (uncompressed)

#### Map Rendering Issues

**Marker Rendering (100+ markers)**
```typescript
// src/components/map/MapboxMap.tsx
// Current: All markers rendered immediately on map load
markers?.forEach(marker => {
  const el = document.createElement('div')
  el.className = 'marker'
  new mapboxgl.Marker(el).setLngLat([marker.longitude, marker.latitude]).addTo(map)
})
```

**Problems:**
- DOM saturation with 100+ marker elements
- Re-renders on `selectedMarkerId` or `hoveredJobId` changes
- `MapSidebarShell` re-renders entire sidebar on map interaction
- No virtualization or clustering

**Solutions:**
- Implement marker clustering (mapbox-gl-cluster)
- Use WebGL rendering for markers (custom MapboxGL layer)
- Virtualize sidebar list (only render visible items)
- Memoize marker callbacks to prevent re-renders

#### Tile Loading on Slow Connections
- Mapbox tiles load at map initialization
- No prefetch strategy for expected viewport
- Cold starts on mobile have high latency

**Solutions:**
- Prefetch tiles for default center (San Francisco: 37.7749, -122.4194)
- Use `initialPitch: 0` to reduce perceived load time
- Cache tiles in service worker
- Show skeleton loaders during tile load

#### Geolocation API Latency
```typescript
// src/store/index.ts - useMapStore
locationPermission: 'loading' // Initial state
isLocating: boolean // Tracks geolocation request
```

**Issues:**
- Browser geolocation can take 2-5+ seconds on poor connections
- No timeout handling (infinite loading state possible)
- Blocks map interaction while locating

**Solutions:**
- Set 10-second timeout for geolocation request
- Allow map interaction during geolocation
- Cache last known location in localStorage
- Show "Location pending..." UI, not blocking

#### MapSidebarShell Re-renders
```typescript
// MapSidebarShell component
// Re-renders on every map pan/zoom due to:
// - onMapMove callback
// - setBounds state update
// - useMapStore subscriptions without selectors
```

**Problem:** Every map movement triggers full sidebar re-render.

**Solution:** Use Zustand selectors to subscribe only to needed fields
```typescript
// BEFORE (bad - subscribes to ALL state changes)
const { viewport, bounds, selectedJobId } = useMapStore()

// AFTER (good - only subscribe to needed fields)
const selectedJobId = useMapStore(state => state.selectedJobId)
const bounds = useMapStore(state => state.bounds)
// Don't subscribe to viewport if not used
```

#### useMapStore State Optimization
Current store in `/src/store/index.ts` has 13 state fields + 16 actions. Every action causes re-renders.

```typescript
// Current state shape
interface MapState {
  viewport: MapViewport           // 4 fields
  bounds: MapBounds | null        // 4 fields
  userLocation: UserLocation | null
  locationPermission: LocationPermission
  isLocating: boolean
  searchLocation: MapCenter | null // 2 fields
  searchQuery: string
  followMode: boolean
  autoRefresh: boolean
  needsRefresh: boolean
  selectedCity: string | null
  mapStyle: 'dark' | 'satellite'
  selectedJobId: string | null
  hoveredJobId: string | null
}
```

**Issues:**
- Components subscribe to entire store
- `setViewport` updates trigger all subscribers
- `setHoveredJobId` re-renders entire map + sidebar

**Solution:** Split into multiple stores
```typescript
// Split: viewport, selection, location, search
export const useMapViewportStore = create<MapViewportState>()
export const useMapSelectionStore = create<MapSelectionState>()
export const useMapLocationStore = create<MapLocationState>()
```

---

### 2. Bundle Size Analysis

#### Current Dependencies (by impact)

| Package | Size | Impact | Priority |
|---------|------|--------|----------|
| mapbox-gl | 500KB | Critical - maps | Must dynamic import |
| framer-motion | 100KB | High - animations | Tree-shake unused |
| leaflet | 39KB | Medium - fallback | Lazy load |
| react-leaflet | 100KB | Medium - fallback | Lazy load with leaflet |
| lucide-react | ~200KB | Medium - icons | Ensure tree-shaking |
| @mapbox/mapbox-gl-geocoder | 50KB | Medium - search | Lazy load |

#### Verification Checklist

- [ ] `npm run build` and check `.next/static/chunks/` sizes
- [ ] Use `npm ls` to verify dependency versions
- [ ] Analyze with `npx webpack-bundle-analyzer` if available
- [ ] Check `.next/static/chunks/pages/hiring/map.js` size (should be <1MB)
- [ ] Verify lucide-react tree-shaking in bundle

#### Optimization Strategies

**Dynamic Imports for Map Components**
```typescript
// src/app/hiring/map/page.tsx
const MapboxMap = dynamic(() => import('@/components/map/MapboxMap'), {
  loading: () => <MapLoadingSkeleton />,
  ssr: false, // Mapbox requires browser
})
```

**Lazy Load Mapbox Geocoder**
```typescript
// Only load geocoder when search input focused
const { data: gecoderModule } = useSWR(
  isFocused ? 'mapbox-geocoder' : null,
  async () => import('@mapbox/mapbox-gl-geocoder')
)
```

**Tree-shake Lucide Icons**
```typescript
// GOOD - tree-shakeable
import { MapPin, Users } from 'lucide-react'

// AVOID - pulls entire icon library
import * as LucideIcons from 'lucide-react'
```

---

### 3. Rendering Strategy by Page Type

#### Homepage (`/`)

**Current:** Likely CSR
**Optimal:** SSG (static site generation)
**Build time:** Build-time (not request-time)

```typescript
// src/app/page.tsx
export const revalidate = 86400 // ISR: 24 hours
export const dynamic = 'force-static' // Force SSG
```

**LCP targets:**
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Cumulative Layout Shift: <0.1

#### Landing Variants (`/landing-a` through `/landing-f`)

**Current:** Likely CSR
**Optimal:** SSG for each variant
**Why:** Marketing pages don't change per-request

```typescript
// src/app/landing-a/page.tsx (and B-F)
export const revalidate = 86400
export const dynamic = 'force-static'
```

**Key optimizations:**
- Image optimization with `next/image` priority
- Font subsetting (Inter already good)
- Remove AmbientBackground particles on mobile

#### City Pages (`/cities/[cityId]`)

**Current:** Likely CSR
**Optimal:** ISR with content revalidation
**Why:** SEO-critical, content updates need fast refresh

```typescript
// src/app/cities/[cityId]/page.tsx
export const revalidate = 3600 // ISR: 1 hour
export const dynamicParams = true // Allow new cities

export async function generateStaticParams() {
  const cities = await db.city.findMany({ where: { isActive: true } })
  return cities.map(city => ({ cityId: city.slug }))
}
```

**Metadata for SEO:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const city = await db.city.findUnique({ where: { slug: params.cityId } })
  return {
    title: `Jobs in ${city.name} | CrewLink`,
    description: `Find work and hire help in ${city.name}...`,
    openGraph: {
      url: `https://crewlink.com/cities/${city.slug}`,
      type: 'website',
    },
  }
}
```

#### Dashboard Pages (`/hiring/map`, `/hiring/jobs`, `/work/map`, `/work/jobs`)

**Current:** CSR (correct)
**Why:** User-specific data, real-time updates
**Hydration:** Client-side Zustand hydration

```typescript
// src/app/hiring/map/page.tsx
'use client'

export default function HiringMapPage() {
  const { viewport, bounds } = useMapStore()
  // CSR component, uses zustand store
}
```

**Performance requirements:**
- Hydrate store on client before render
- Prevent mismatch between server/client rendering
- Use `useEffect` to set user location after hydration

#### Message Pages (`/hiring/messages`, `/work/messages`)

**Current:** CSR
**Optimal:** CSR + server pagination
**Why:** Real-time messages, but can fetch in pages

```typescript
// Message loading should use pagination
async function loadMessages(threadId: string, page: number = 1) {
  const limit = 50
  const offset = (page - 1) * limit

  const messages = await db.message.findMany({
    where: { threadId },
    skip: offset,
    take: limit,
    orderBy: { createdAt: 'desc' },
  })

  return messages
}
```

---

### 4. Database Performance & Queries

#### Current Schema Analysis

**Good indexes present:**
```prisma
// Job model - good for map queries
@@index([status])
@@index([category])
@@index([lat, lng])      // CRITICAL for location queries
@@index([posterId])

// Message model
@@index([threadId])

// Notifications model
@@index([userId, isRead])
@@index([userId, createdAt])

// Bid model
@@index([jobId])
@@index([workerId])
```

#### Critical Performance Queries

**1. Jobs by Location (Map Page)**
```typescript
// SLOW: No index on city
const jobs = await db.job.findMany({
  where: {
    city: cityName, // Full table scan
    status: 'posted',
  },
})

// FAST: Use geospatial bounding box
const jobs = await db.job.findMany({
  where: {
    AND: [
      { lat: { gte: minLat, lte: maxLat } },
      { lng: { gte: minLng, lte: maxLng } },
      { status: 'posted' },
    ],
  },
  take: 100, // Pagination
})
```

**Missing index:** Add `@@index([city])` if filtering by city frequently
```prisma
model Job {
  // ... existing fields
  city: String?

  // Add this index
  @@index([city, status])  // For city + status filtering
}
```

**2. Job Listings with Pagination**
```typescript
// Use cursor-based pagination for better performance
interface JobQueryParams {
  limit: number
  cursor?: string
  status?: string
  category?: string
  bounds?: BoundingBox
}

async function getJobs(params: JobQueryParams) {
  return db.job.findMany({
    where: {
      status: params.status || 'posted',
      category: params.category,
      lat: { gte: params.bounds?.minLat, lte: params.bounds?.maxLat },
      lng: { gte: params.bounds?.minLng, lte: params.bounds?.maxLng },
    },
    take: params.limit,
    skip: params.cursor ? 1 : 0, // Skip cursor item
    cursor: params.cursor ? { id: params.cursor } : undefined,
    orderBy: { createdAt: 'desc' },
  })
}
```

**3. Conversation Loading**
```typescript
// SLOW: Load all messages
const thread = await db.messageThread.findUnique({
  where: { id: threadId },
  include: {
    messages: true, // All messages!
    participants: true,
  },
})

// FAST: Paginate messages
const thread = await db.messageThread.findUnique({
  where: { id: threadId },
  include: {
    messages: {
      take: 50, // Only latest 50
      orderBy: { createdAt: 'desc' },
      include: { sender: true },
    },
    participants: true,
  },
})
```

**Missing index:** Add for efficient message loading
```prisma
model Message {
  // ... existing fields

  @@index([threadId, createdAt])  // For paginated loading
}
```

**4. Notification Count Queries**
```typescript
// SLOW: Fetch all, count in app
const notifications = await db.notification.findMany({
  where: { userId, isRead: false },
})
const unreadCount = notifications.length

// FAST: Count at database
const unreadCount = await db.notification.count({
  where: { userId, isRead: false },
})
```

#### Geospatial Queries (Future Optimization)

PostgreSQL supports PostGIS for proper geospatial queries:
```sql
-- Haversine distance query (without PostGIS)
SELECT * FROM "Job"
WHERE
  (
    111.045 * DEGREES(
      ACOS(
        LEAST(1.0,
          COS(RADIANS(90 - $1)) *
          COS(RADIANS(90 - "lat")) +
          SIN(RADIANS(90 - $1)) *
          SIN(RADIANS(90 - "lat")) *
          COS(RADIANS($2 - "lng"))
        )
      )
    )
  ) <= 25  -- 25 mile radius
AND status = 'posted'
ORDER BY DISTANCE
LIMIT 100;
```

**Recommended schema migration:**
```prisma
model Job {
  // Add PostGIS point column
  location    Unsupported("geography")?

  // Keep lat/lng for fallback
  lat         Float
  lng         Float
}
```

#### Query Optimization Checklist

- [ ] Use `.select()` to fetch only needed fields
- [ ] Implement cursor-based pagination for large datasets
- [ ] Add database indexes for frequently filtered fields
- [ ] Test N+1 queries in complex nested includes
- [ ] Use `include` only for necessary relations
- [ ] Cache unchanging reference data (cities, categories, skills)
- [ ] Use database counts for unread notifications
- [ ] Implement soft deletes for safety (don't use DELETE)

---

### 5. Image Optimization

#### Current Configuration

```javascript
// next.config.js
images: {
  domains: ['api.mapbox.com', 'images.unsplash.com'],
},
```

**Problem:** Using deprecated `domains` instead of `remotePatterns`

```javascript
// MODERN APPROACH (next.js 12.3.0+)
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'api.mapbox.com',
      port: '',
      pathname: '/styles/v1/**',
    },
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
      port: '',
      pathname: '/**',
    },
  ],
},
```

#### Image Optimization Strategy

**User Avatars (avatarUrl field)**
```typescript
import Image from 'next/image'

export function UserAvatar({ user }: { user: User }) {
  return (
    <Image
      src={user.avatarUrl || '/default-avatar.png'}
      alt={user.name || 'User'}
      width={48}
      height={48}
      className="rounded-full"
      priority={false} // Don't priority load all avatars
      placeholder="blur"
      blurDataURL={generateBlurUrl(user.avatarUrl)} // 10x10 base64
    />
  )
}
```

**Mapbox Map Tiles**
- Not directly controllable (Mapbox CDN)
- Can prefetch in service worker cache
- Use `preconnect` for faster Mapbox API

```html
<!-- In next/head or layout -->
<link rel="preconnect" href="https://api.mapbox.com" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://tiles.mapbox.com" />
```

**Marketing Page Images**
```typescript
// src/app/landing-a/page.tsx
export default function LandingA() {
  return (
    <Image
      src="/hero-image.jpg"
      alt="CrewLink hero"
      width={1200}
      height={600}
      priority={true} // LCP image - prioritize
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 100vw"
    />
  )
}
```

#### Lighthouse Image Audit Fixes

- [x] Responsive images (use `sizes` prop)
- [ ] WebP format (requires image optimization service)
- [ ] Offscreen images (lazy load below fold)
- [ ] Next-gen formats (AVIF support in next/image)

---

### 6. Animation Performance

#### Current Animation Setup

**Tailwind Config:** 30+ animations defined in `/tailwind.config.ts`

```typescript
animation: {
  'fade-in': 'fadeIn 0.3s ease-out forwards',
  'float': 'float 6s ease-in-out infinite',
  'glow-pulse': 'glowPulse 3s ease-in-out infinite',
  'orbit': 'orbit 20s linear infinite',
  'particle-up': 'particleUp 3s ease-out infinite',
  // ... 20+ more
}
```

#### GPU-Accelerated Properties (Good)

These animations use `transform` and `opacity` (60fps):
- `fadeIn`, `fadeUp`: opacity
- `float`, `floatReverse`: translateY
- `slideInRight`, `slideInLeft`: translateX + opacity
- `scaleIn`, `popIn`: scale + opacity
- `rotate`, `spin`: rotate

#### Problematic Animations (Bad)

Animations that trigger layout recalculation:
- `shimmer`: backgroundPosition (GPU-accelerated in modern browsers)
- `typewriter`: width (layout thrashing)
- `borderBeam`: offsetDistance (check browser support)

**Fix typewriter animation:**
```typescript
// BEFORE: Bad - causes layout thrashing
typewriter: {
  '0%, 100%': { width: '0' },
  '50%': { width: '100%' },
}

// AFTER: Good - use transform clip-path
typewriter: {
  '0%, 100%': { clipPath: 'inset(0 100% 0 0)' },
  '50%': { clipPath: 'inset(0 0 0 0)' },
}
```

#### AmbientBackground Performance Impact

```typescript
// src/components/AmbientBackground.tsx
// Renders on EVERY page, even dashboards

// Issues:
// - 30+ animated elements (particles)
// - Canvas rendering on CPU (not GPU)
// - No mobile detection (runs on slow mobile)
// - No pause/disable mechanism

// Solutions:
export function AmbientBackground() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  if (isMobile || isReducedMotion) {
    return <StaticBackground /> // Static gradient instead
  }

  return <AnimatedParticles />
}
```

#### Animation Performance Checklist

- [ ] Animations use `transform` and `opacity` only
- [ ] No animations on dashboard/utility pages
- [ ] AmbientBackground disabled on mobile
- [ ] Respect `prefers-reduced-motion` media query
- [ ] Test 60fps with DevTools Performance tab
- [ ] Limit simultaneous animations to <5 on screen
- [ ] Use `will-change` sparingly (only for animated elements)

```css
/* Good: Only animate this element */
.float-item {
  animation: float 6s ease-in-out infinite;
  will-change: transform; /* Hint browser to optimize */
}

/* Bad: Over-using will-change */
.button {
  will-change: transform, opacity, filter; /* Too broad */
}
```

---

## Lighthouse CI Configuration

### Current Config (`lighthouserc.json`)

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run start",
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/app/map",
        "http://localhost:3000/app/messages",
        "http://localhost:3000/sign-in"
      ],
      "settings": {
        "preset": "desktop",
        "throttling": { "cpuSlowdownMultiplier": 1 }
      }
    },
    "assert": {
      "categories:performance": ["warn", { "minScore": 0.7 }],
      "first-contentful-paint": ["warn", { "maxNumericValue": 3000 }],
      "largest-contentful-paint": ["warn", { "maxNumericValue": 4000 }],
      "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.1 }],
      "total-blocking-time": ["warn", { "maxNumericValue": 500 }]
    }
  }
}
```

### Issues with Current Config

1. **Desktop preset only** - Missing mobile metrics (most users)
2. **`/app/map` is outdated** - Should be `/hiring/map` and `/work/map`
3. **Missing critical pages:**
   - `/cities/[cityId]` (SEO-critical)
   - `/hiring/jobs` and `/work/jobs` (high traffic)
   - Landing variants (A-F)

### Recommended Updates

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run start",
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/landing-a",
        "http://localhost:3000/cities/san-francisco",
        "http://localhost:3000/hiring/map",
        "http://localhost:3000/hiring/jobs",
        "http://localhost:3000/work/map",
        "http://localhost:3000/work/jobs",
        "http://localhost:3000/sign-in"
      ]
    },
    "assert": {
      "categories:performance": ["warn", { "minScore": 0.8 }],
      "categories:accessibility": ["error", { "minScore": 0.9 }],
      "first-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
      "largest-contentful-paint": ["warn", { "maxNumericValue": 3500 }],
      "cumulative-layout-shift": ["warn", { "maxNumericValue": 0.05 }],
      "total-blocking-time": ["warn", { "maxNumericValue": 300 }],
      "speed-index": ["warn", { "maxNumericValue": 3000 }]
    },
    "upload": {
      "target": "temporary-public-storage",
      "serverBaseUrl": "https://lhci.example.com"
    }
  }
}
```

### Running Lighthouse CI

```bash
# Full audit with local server
npm run audit:perf

# Quick desktop audit
npx @lhci/cli autorun --config=lighthouserc.json

# Mobile audit (requires separate config)
LHCI_PRESET=mobile npx @lhci/cli autorun
```

---

## Performance Testing with Playwright

### Current Test Script

`npm run test:perf` runs `tests/performance/*.spec.ts`

### Recommended Performance Tests

**1. Map Rendering Performance**
```typescript
// tests/performance/map.spec.ts
test('should load map with 100 markers under 3s', async ({ page }) => {
  const startTime = Date.now()

  await page.goto('/hiring/map')
  await page.waitForLoadState('networkidle')

  // Wait for Mapbox to initialize
  await page.waitForSelector('[data-testid="mapbox-canvas"]')

  const loadTime = Date.now() - startTime
  expect(loadTime).toBeLessThan(3000)
})

test('should handle 50 marker hovers without jank', async ({ page }) => {
  const metrics = await page.evaluate(() => {
    return performance.getEntriesByType('paint')
  })

  // Each marker hover should paint in <16ms (60fps)
  expect(metrics).toBeDefined()
})
```

**2. Database Query Performance**
```typescript
// tests/performance/database.spec.ts
test('should fetch jobs with location bounds in <500ms', async ({ request }) => {
  const startTime = Date.now()

  const response = await request.get('/api/jobs', {
    params: {
      minLat: 37.7,
      maxLat: 37.8,
      minLng: -122.5,
      maxLng: -122.4,
    },
  })

  const duration = Date.now() - startTime
  expect(duration).toBeLessThan(500)
  expect(response.status()).toBe(200)
})
```

**3. Memory Leaks**
```typescript
// tests/performance/memory.spec.ts
test('should not leak memory on navigation', async ({ page }) => {
  const memBefore = (await page.evaluate(() => performance.memory)).usedJSHeapSize

  // Navigate multiple times
  for (let i = 0; i < 10; i++) {
    await page.goto('/hiring/jobs')
    await page.goto('/hiring/map')
  }

  const memAfter = (await page.evaluate(() => performance.memory)).usedJSHeapSize
  const memIncrease = memAfter - memBefore

  // Should not increase by more than 50MB
  expect(memIncrease).toBeLessThan(50 * 1024 * 1024)
})
```

---

## Page-by-Page Performance Targets

### Homepage (`/`) - Marketing Landing

**Target Metrics:**
- FCP: <1.5s
- LCP: <2.5s
- CLS: <0.1
- TTI: <3.5s

**Optimizations:**
- SSG/ISR (pre-render at build time)
- Image priority for above-fold content
- Remove AmbientBackground particles on mobile
- Inline critical CSS

**Command:** `npm run build` then check `.next/static/chunks/pages/_next-app-dir/page.js`

### Map Pages (`/hiring/map`, `/work/map`) - Heaviest

**Target Metrics:**
- FCP: <2s (Mapbox overhead)
- LCP: <3.5s
- CLS: <0.1
- TTI: <4s

**Critical Path:**
1. Mapbox GL JS + CSS load (500KB) ← Split with dynamic import
2. Geolocation API call ← Run parallel, 10s timeout
3. Fetch jobs by bounds ← Server pagination
4. Render 50-100 markers ← Cluster or virtualize
5. Sidebar interactive ← Memoized selectors

**Optimization Priority:**
1. Dynamic import MapboxMap component
2. Zustand selector optimization (prevent re-renders)
3. Implement marker clustering
4. Cursor-based job pagination

### Job Listing Pages (`/hiring/jobs`, `/work/jobs`)

**Target Metrics:**
- FCP: <1.5s
- LCP: <2.5s
- CLS: <0.05 (no layout shift)
- TTI: <3s

**Optimizations:**
- Server-side pagination (cursor-based)
- Virtual scrolling for 100+ items
- Lazy load job cards below fold
- Filter options in sidebar (don't block)

### City Pages (`/cities/[cityId]`) - SEO Critical

**Target Metrics:**
- FCP: <1.5s
- LCP: <2.5s
- CLS: <0.1
- Core Web Vitals: All green

**Rendering:** ISR with 1-hour revalidation

**SEO Optimization:**
- Unique meta tags per city
- Structured data (Organization, LocalBusiness)
- Dynamic sitemap generation

### Messages Page (`/hiring/messages`, `/work/messages`)

**Target Metrics:**
- FCP: <2s
- LCP: <3s
- CLS: <0.1

**Optimizations:**
- Paginate message history (50 per load)
- Virtual scroll for conversation list
- Lazy load thread details
- Real-time updates via WebSocket/SSE (not polling)

### Auth Pages (`/sign-in`, `/create-account`)

**Target Metrics:**
- FCP: <1s
- LCP: <1.5s
- CLS: <0.05

**Optimizations:**
- Small payload (no unnecessary imports)
- Server-side form validation (reduce JS)
- No heavy animations

---

## Development Workflow

### Local Performance Testing

**1. Build and analyze bundle**
```bash
npm run build

# Check which chunks are largest
ls -lah .next/static/chunks/ | sort -k5 -h

# Analyze app chunk size
ls -lah .next/static/chunks/*app*.js

# Expected: map pages <1.5MB, others <500KB
```

**2. Run Lighthouse locally**
```bash
# Development mode
npm run dev
npx @lhci/cli autorun --config=lighthouserc.json

# Production mode (more accurate)
npm run build && npm run start
npx @lhci/cli autorun --config=lighthouserc.json
```

**3. Profile with Chrome DevTools**
```bash
# Open DevTools -> Performance tab
# Record interactions
# Check for:
# - Long tasks (>50ms)
# - Layout thrashing
# - Forced reflows
# - Memory leaks
```

**4. Test with Playwright**
```bash
npm run test:perf

# Run specific test
npx playwright test tests/performance/map.spec.ts

# Visual debugging
npx playwright test tests/performance/ --debug
```

**5. Simulate slow networks**
```bash
# DevTools -> Network -> Throttling
# Test with "Slow 4G" (5Mbps down, 20ms latency)

# Or in Playwright:
await page.route('**/*', async route => {
  await new Promise(r => setTimeout(r, 50)) // 50ms latency
  await route.continue()
})
```

### Profiling Zustand Selectors

```typescript
// Enable Redux DevTools for Zustand
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useMapStore = create<MapState>()(
  devtools(
    (set, get) => ({
      // ... store implementation
    }),
    { name: 'MapStore' }
  )
)
```

Then in Chrome DevTools -> Redux tab, watch selector usage.

---

## Performance Regression Prevention

### Git Hooks

Add pre-commit hook to warn on large bundle changes:

```bash
#!/bin/bash
# .husky/pre-commit

npm run build
BUNDLE_SIZE=$(du -sb .next/static/chunks/ | cut -f1)
LIMIT=$((5 * 1024 * 1024)) # 5MB limit

if [ $BUNDLE_SIZE -gt $LIMIT ]; then
  echo "WARNING: Bundle size exceeds 5MB ($BUNDLE_SIZE bytes)"
  echo "Run 'npm run audit:perf' to analyze"
  exit 1
fi
```

### CI/CD Integration

```yaml
# .github/workflows/performance.yml
name: Performance Audit

on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run audit:perf
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: lighthouse-results
          path: ./lighthouse-results/
```

---

## Monitoring in Production

### Core Web Vitals Tracking

Add to `src/app/layout.tsx`:

```typescript
import { CLS, FCP, FID, LCP, TTFB } from 'web-vitals'

export default function RootLayout() {
  useEffect(() => {
    // Track metrics
    FCP(metric => console.log('FCP:', metric.value))
    LCP(metric => console.log('LCP:', metric.value))
    CLS(metric => console.log('CLS:', metric.value))
    FID(metric => console.log('FID:', metric.value))
    TTFB(metric => console.log('TTFB:', metric.value))
  }, [])
}
```

Send to analytics:
```typescript
function sendToAnalytics(metric: Metric) {
  if (navigator.sendBeacon) {
    const data = JSON.stringify(metric)
    navigator.sendBeacon('/api/metrics', data)
  }
}
```

### Real User Monitoring (RUM)

Consider services like:
- Vercel Analytics (native Next.js integration)
- LogRocket (session replay + performance)
- Sentry (error tracking + performance monitoring)

---

## Quick Reference: Top 10 Optimizations

1. **Dynamic import MapboxMap** - Lazy load 500KB map bundle
2. **Zustand selectors** - Prevent MapSidebarShell re-renders
3. **Marker clustering** - Handle 100+ markers efficiently
4. **Job pagination** - Cursor-based, not offset
5. **Message pagination** - Load 50 at a time, not all
6. **AmbientBackground mobile** - Disable on mobile devices
7. **Image lazy loading** - Use `next/image` with `priority=false`
8. **SSG landing pages** - Pre-render marketing content
9. **ISR city pages** - 1-hour revalidation for SEO
10. **Geolocation timeout** - 10-second max wait, don't block UI

---

## Resources

- [Next.js Performance Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Lighthouse Best Practices](https://web.dev/lighthouse/)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Mapbox Performance](https://docs.mapbox.com/mapbox-gl-js/guides/)
- [Zustand Best Practices](https://docs.pmnd.rs/zustand/guides/practice)
- [Prisma Query Optimization](https://www.prisma.io/docs/concepts/components/prisma-client/query-optimization-performance)

---

## Checklist for Performance Review

- [ ] Bundle size analyzed (each chunk <1.5MB)
- [ ] Lighthouse CI passing (performance >70, all pages)
- [ ] No layout shift on interactive pages (CLS <0.1)
- [ ] Map pages load in <4s (FCP + LCP)
- [ ] Database queries optimized (<500ms for location bounds)
- [ ] Pagination implemented (jobs, messages)
- [ ] Marker clustering or virtualization implemented
- [ ] AmbientBackground disabled on mobile
- [ ] Image priority set correctly (LCP images)
- [ ] Zustand selectors optimized (no unnecessary re-renders)
- [ ] Geolocation timeout set (10s max)
- [ ] Service worker caching configured
- [ ] Monitoring in production (Core Web Vitals)
- [ ] Performance regression tests automated
