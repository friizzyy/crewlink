# 09-NAVIGATION-UX.md — CrewLink Navigation & UX Audit

## Executive Summary

CrewLink's navigation architecture supports two distinct user ecosystems (Hiring and Work dashboards) with overlapping marketing sections and role-based routing guards. This audit identifies critical UX gaps, mobile interaction patterns, deep linking vulnerabilities, and state management inconsistencies that impact user onboarding, task completion, and accessibility.

**Key Issues:**
- Role-based routing lacks comprehensive audit and deep link protection
- Mobile bottom navigation lacks transition animations and swipe gestures
- No breadcrumb system; users lack context in nested routes
- Map sidebar navigation lacks keyboard/accessibility patterns
- Missing 404 and error boundary pages
- Landing page variants isolated; no shared layout strategy
- Internal testing pages not protected from public access

---

## 1. Navigation Architecture Overview

### 1.1 Framework & Routing Foundation

**Tech Stack:**
- **Framework:** Next.js 14 App Router (next/navigation)
- **State Management:** Zustand + UserRoleContext
- **Styling:** Tailwind CSS (md: 768px breakpoint)
- **UI Library:** Custom components (no shadcn/ui dependency)
- **Mobile UX:** Bottom navigation bars, bottom sheets, hamburger menus

**Current Routing Pattern:**
```
/                          → Landing page (marketing site)
/sign-in, /create-account  → Auth flow
/select-role               → Role selection post-signup
/hiring/*                  → Hirer dashboard (protected)
/work/*                    → Worker dashboard (protected)
/(marketing-routes)        → Public pages (about, pricing, etc.)
/wrong-side                → Role mismatch fallback
/nav-concepts              → Internal testing (no protection)
/landing-a to /landing-f   → A/B test variants (isolated)
```

**Route Protection Method:**
- RoleGuard component wraps protected routes
- UserRoleContext provides: `isOnCorrectSide()`, `getCorrectSideRoute()`
- Redirect logic: User on wrong side → /wrong-side

### 1.2 Navigation Component Hierarchy

| Component | Purpose | Location | Mobile Behavior |
|-----------|---------|----------|-----------------|
| **UniversalNav** | Marketing site navigation | src/components/UniversalNav.tsx | Hamburger menu collapse |
| **HiringNav** | Hirer dashboard persistent nav | src/components/navigation/HiringNav.tsx | Bottom bar (md: side rail) |
| **WorkerNav** | Worker dashboard persistent nav | src/components/navigation/WorkerNav.tsx | Bottom bar (md: side rail) |
| **Header** | Top bar (logo, auth state, theme) | src/components/layout/Header.tsx | Sticky, responsive |
| **MarketingFooter** | Footer with links & CTA | src/components/MarketingFooter.tsx | Stack on mobile |
| **NavConceptA/B/C** | Experimental (unused) | src/components/navigation/ | ⚠️ Should be removed/archived |

---

## 2. Role-Based Routing Audit

### 2.1 Current Protection Model

**UserRoleContext Structure:**
```typescript
// Expected shape (verify in code)
{
  user: { id: string; role: 'hirer' | 'worker' | null }
  isOnCorrectSide: () => boolean
  getCorrectSideRoute: (path: string) => string
  redirectIfWrongSide: (pathname: string) => void
}
```

**RoleGuard Implementation Pattern:**
```typescript
// Example: /hiring/layout.tsx
export default function HiringLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard requiredRole="hirer">
      <HiringNav>
        {children}
      </HiringNav>
    </RoleGuard>
  )
}
```

### 2.2 Critical Audit Checkpoints

**Checkpoint 1: Flat Routes — Deep Link Protection**
- ❌ **Issue:** User deep-links to `/hiring/job/abc123` without authentication
  - Expected: Redirect to `/sign-in?redirect=/hiring/job/abc123`
  - Current: Likely 404 or unprotected access
- **Action Required:** Verify middleware or layout-level auth checks
  - If no middleware exists, add next/navigation redirect in RoleGuard
  - Store intended route in session/localStorage for post-login redirect

**Checkpoint 2: Wrong-Side Redirect Logic**
- ❌ **Issue:** `/wrong-side` is reachable but unclear what triggers it
  - Does RoleGuard redirect on every role mismatch?
  - Is there a user-friendly message explaining the error?
  - Can user switch roles from this page?
- **Action Required:**
  - Add role-switching UI on `/wrong-side` page (if allowed by product)
  - Verify RoleGuard triggers on mount (not just on navigation)
  - Add analytics event to track role mismatches

**Checkpoint 3: Role Cache & Stale State**
- ❌ **Issue:** User logs in as hirer, then admin changes role to worker
  - Cache in localStorage or UserRoleContext may be stale
  - User sees hirer UI but is actually a worker
- **Action Required:**
  - Implement role sync on app mount and route change
  - Compare cached role with server-side role (via API call)
  - Prompt user to refresh if mismatch detected

**Checkpoint 4: Auth Boundary Verification**
- Routes to test: `/hiring/page.tsx`, `/work/page.tsx`, `/hiring/job/[id]/page.tsx`
- **Required Behavior:**
  1. Unauthenticated user tries `/hiring/*`
  2. Redirect to `/sign-in?redirect=/hiring/path`
  3. User signs in with hirer role
  4. Redirect to original `/hiring/path`
  5. If user role is worker, show `/wrong-side` instead

---

## 3. Mobile Bottom Navigation Patterns

### 3.1 HiringNav Bottom Bar Architecture

**Current Implementation Notes:**
- Appears on mobile only (md: 768px breakpoint)
- Sits above keyboard input when forms are focused
- Must support 4–6 navigation items

**Mobile Menu Items (Expected for Hirers):**
1. Dashboard (home)
2. Jobs (posted jobs list)
3. Messages (conversations)
4. Notifications
5. Profile/Settings

**UX Gaps to Address:**

| Gap | Impact | Solution |
|-----|--------|----------|
| No transition animations on route change | Feels janky, unclear what changed | Add Framer Motion slide/fade on TabButton active state |
| No swipe gestures between tabs | Users on mobile expect swipe | Implement useSwipeGesture (custom hook or Framer Motion) |
| Bottom sheet (map results) covers navigation | Can't see or tap nav while sheet open | Adjust sheet max-height to 70vh on map pages |
| Active tab indicator unclear | User unsure which nav item is active | Add underline/highlight to active tab; use aria-current |
| Focus visible on mobile | Keyboard users can't navigate tabs | Add :focus-visible ring; test with Tab key |
| No label text on mobile (icons only?) | Low discoverability, accessibility fail | Always show label below icon on bottom nav |
| Hamburger menu on mobile (if exists) | Navigation split between hamburger + bottom nav | Consolidate into bottom nav; remove redundant menu |

### 3.2 WorkerNav Bottom Bar Architecture

**Expected Mobile Menu Items:**
1. Dashboard (home / map view)
2. Jobs (list or nearby)
3. Messages
4. Notifications
5. Earnings (worker-specific)
6. Profile/Settings

**Mobile-Specific Pattern: Map as Primary Entry Point**
- `/work/page.tsx` → Should show map by default (if geo-enabled)
- Tapping map marker → Bottom sheet slides up with job preview
- "View Details" → Navigate to `/work/job/[id]` (full page)
- Back from job page → Return to map view (not map list)

**Critical Issue: Back Button & State Preservation**
- **Problem:** User navigates: map → bottom sheet → job details → back
  - Expected: Return to map + scroll to original marker
  - Current: Likely returns to job list or map center; marker state lost
- **Solution:**
  - Store selected marker ID in Zustand store
  - Use next/navigation useRouter.back() with state context
  - Restore marker center + highlight on unmount of detail page
  - Consider using sessionStorage for back button state

### 3.3 Bottom Navigation Implementation Checklist

```
MOBILE NAV — IMPLEMENTATION AUDIT
═════════════════════════════════

[ ] Verify bottom nav appears on md: breakpoint (768px+)
[ ] Verify active route indicator (aria-current="page")
[ ] Verify focus-visible outline on Tab key
[ ] Verify label text visible (not icons only)
[ ] Verify no nav obstruction by bottom sheet / keyboard
[ ] Verify smooth fade/slide transition on route change
[ ] Verify swipe gesture detection (left/right)
[ ] Verify no redundant hamburger + bottom nav
[ ] Verify keyboard-only navigation works (Tab → Enter)
[ ] Verify aria-label on nav buttons
[ ] Test on viewport: 320px, 375px, 414px (mobile sizes)
[ ] Test with system keyboard open
[ ] Test with VoiceOver/TalkBack enabled
```

---

## 4. Map Sidebar & Job Detail Navigation

### 4.1 Map Sidebar Interaction Patterns

**Worker Dashboard Map Flow:**
```
/work/page or /work/map
    ↓
[Map View] + [Sidebar Container]
    ↓
User taps marker
    ↓
Bottom sheet / sidebar slides in with:
  - Job title, hirer name, rate
  - "View Details" button
  - "Apply Now" / "Bid" button
    ↓
User clicks "View Details"
    ↓
/work/job/[id]  (Full page)
    ↓
Back button or close sidebar
    ↓
Return to /work/map or /work/jobs list
```

### 4.2 Navigation Accessibility Gaps

**Issue 1: Tab Order in Bottom Sheet**
- **Problem:** Keyboard users can't Tab between sidebar content and map
- **Current:** Bottom sheet likely overlays map with z-index; focus trap unclear
- **Solution:**
  - Implement FocusTrap component (headlessui/react-focus-trap or custom)
  - When sheet open: Tab loops within sheet content
  - When sheet closed: Tab stays in map controls
  - Escape key closes sheet AND returns focus to map (or last tapped marker)

**Issue 2: Screen Reader Announcement**
- **Problem:** Job details appear in sidebar but screen reader may not announce
- **Solution:**
  - Add `role="complementary"` to sidebar
  - Add live region: `<div role="status" aria-live="polite" aria-atomic="true">`
  - Announce: "Job details loaded: [job title], [rate]/hour"
  - Include job count in header: "4 nearby jobs"

**Issue 3: Deep Linking into Job Details**
- **Problem:** Direct link `/work/job/abc123` bypasses map context
  - Map not visible
  - No "back to search" breadcrumb
  - User feels lost
- **Solution:**
  - Detect if coming from `/work/map` vs. direct link
  - If direct link: Show breadcrumb "← Nearby Jobs" or "← Search"
  - Provide map toggle button: "Show on Map"
  - Store previous route in router state

### 4.3 Mobile Bottom Sheet Patterns

**Bottom Sheet Behavior Checklist:**

```
BOTTOM SHEET UX — MOBILE WORKERS
═════════════════════════════════

[ ] Sheet slides up from bottom with smooth animation (Framer Motion)
[ ] Sheet max-height: 70–75vh (leaves room for top map controls)
[ ] Draggable handle at top (visual indicator)
[ ] Swipe down on handle closes sheet
[ ] Outside tap (map area) optionally closes sheet
[ ] Escape key closes sheet
[ ] Sheet content scrollable independently from map
[ ] "View Details" button navigates to /work/job/[id]
[ ] Back button on /work/job/[id] returns to map with sheet CLOSED
[ ] Keyboard focus managed (focus trap / focus restore)
[ ] Sticky header (job title, close button) while scrolling
[ ] Bid/Apply button sticky at bottom of sheet
[ ] Confirm dialog when applying (prevent accidental submission)
[ ] Loading state while fetching job details
[ ] Error state if job deleted or user no longer eligible
[ ] No white space / layout shift when sheet animates
```

---

## 5. Breadcrumb Navigation (Missing)

### 5.1 Current State

**Finding:** No breadcrumbs detected anywhere in CrewLink codebase
- Users lack context in nested routes
- Especially problematic in: job details, settings, messages
- No "up one level" visual affordance

### 5.2 Recommended Breadcrumb Routes

**Hiring Dashboard:**
```
/hiring/job/abc123/edit
  Breadcrumb: Hiring > Jobs > Job: "Build Website" > Edit

/hiring/worker/def456/reviews
  Breadcrumb: Hiring > Workers > John Doe > Reviews

/hiring/settings/payment
  Breadcrumb: Hiring > Settings > Payment
```

**Worker Dashboard:**
```
/work/job/abc123
  Breadcrumb: Work > Nearby Jobs > "Build Website"

/work/hirer/def456
  Breadcrumb: Work > Hirers > "Acme Corp"

/work/messages/thread-xyz
  Breadcrumb: Work > Messages > Chat: "Sarah M."
```

**Marketing:**
```
/pricing
  Breadcrumb: Home > Pricing

/team/julius-williams
  Breadcrumb: Home > Team > Julius Williams
```

### 5.3 Breadcrumb Implementation

**Component Structure:**
```typescript
// src/components/ui/Breadcrumbs.tsx
interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumbs">
      <ol className="flex items-center gap-2">
        {items.map((item, idx) => (
          <li key={idx}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {idx < items.length - 1 && <span>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

**Placement:**
- **Dashboards:** Below Header, above main content (hiring/work layout)
- **Marketing:** Below Header, above hero/content
- **Hide on mobile?** Optional; consider showing if breadcrumb fits (no line wrap)

**Schema Support:**
- Add `schema.org/BreadcrumbList` JSON-LD for SEO
- Helps search engines understand site structure

---

## 6. Deep Linking & State Recovery

### 6.1 Deep Link Testing Matrix

| Route | Logged Out | Logged In (Wrong Role) | Logged In (Correct Role) | Expected Behavior |
|-------|-----------|------------------------|-------------------------|-------------------|
| `/hiring/job/abc123` | Redirect to `/sign-in?redirect=...` | Redirect to `/wrong-side` | Show job details | ✓ |
| `/work/map?lat=40&lng=-74` | Redirect to `/sign-in?redirect=...` | Redirect to `/wrong-side` | Show map centered at coords | ⚠️ Query params lost? |
| `/hiring/job/invalid-id` | Redirect to `/sign-in` | Redirect to `/wrong-side` | Show 404 or "Job not found" | ✗ Missing not-found.tsx |
| `/hiring/messages/thread-xyz` | Redirect to `/sign-in?redirect=...` | Redirect to `/wrong-side` | Show chat thread | ✓ |
| `/work/hirer/def456/reviews` | Redirect to `/sign-in?redirect=...` | Redirect to `/wrong-side` | Show hirer reviews | ✓ |

**Key Findings:**
1. ❌ **No 404 Page:** Route `/hiring/job/nonexistent` likely shows blank page
   - Create `app/not-found.tsx` (global) and layout-scoped `not-found.tsx`
2. ❌ **Query Params May Be Lost:** `/work/map?lat=40&lng=-74`
   - Verify redirect preserves query string
   - Test: `useRouter().push(redirectUrl + window.location.search)`
3. ⚠️ **Auth State Timing:** Middleware vs. Layout Check
   - If using middleware: Redirect happens before client render
   - If using layout RoleGuard: Flash of wrong content before redirect
   - Recommend middleware for auth checks

### 6.2 Redirect Strategy with Query Params

**Current Pattern (likely):**
```typescript
// ❌ Loses query params
router.push(`/sign-in?redirect=/protected/route`)
```

**Improved Pattern:**
```typescript
// ✓ Preserves full URL
const returnUrl = window.location.pathname + window.location.search
router.push(`/sign-in?redirect=${encodeURIComponent(returnUrl)}`)

// On sign-in success:
const returnUrl = searchParams.get('redirect') || '/hiring'
router.push(returnUrl)
```

**Recommended Middleware (Next.js):**
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value

  if (!token && req.nextUrl.pathname.startsWith('/hiring')) {
    const returnUrl = req.nextUrl.pathname + req.nextUrl.search
    return NextResponse.redirect(
      new URL(`/sign-in?redirect=${encodeURIComponent(returnUrl)}`, req.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/hiring/:path*', '/work/:path*']
}
```

---

## 7. Missing Pages & Error Handling

### 7.1 Not-Found Page

**Current State:** No `not-found.tsx` detected
- Route `/hiring/job/invalid-id` returns blank or unexpected page
- User has no clear indication of error

**Action Required:**

**Global 404 (app/not-found.tsx):**
```typescript
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">404 — Page Not Found</h1>
      <p className="text-gray-600 mt-4">The page you're looking for doesn't exist.</p>
      <Link href="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded">
        Go Home
      </Link>
    </div>
  )
}
```

**Dashboard-Specific 404 (app/hiring/not-found.tsx):**
```typescript
export default function HiringNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Job Not Found</h1>
      <p className="text-gray-600 mt-4">This job posting no longer exists or has been removed.</p>
      <Link href="/hiring/jobs" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded">
        Back to Jobs
      </Link>
    </div>
  )
}
```

### 7.2 Error Boundary & Fallback

**Current State:** Likely using default Next.js error page
- No custom error messages
- Poor UX for network failures, API errors

**Action Required:**

**Create (app/error.tsx):**
```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  )
}
```

---

## 8. Internal Routes & Testing Pages

### 8.1 Current Issues

**Route: /nav-concepts**
- Purpose: Internal testing/experimentation of nav designs
- Problem: Not protected; publicly accessible
- Status: Contains NavConceptA/B/C experimental components

**Route: /landing-a through /landing-f**
- Purpose: A/B testing landing page variants
- Problem: Isolated routes; each is separate page (no shared layout)
- Status: Analytics likely separate per variant

### 8.2 Cleanup & Organization Recommendations

**Option 1: Archive Experiments**
```
src/
├── components/
│   ├── navigation/
│   │   ├── HiringNav.tsx
│   │   ├── WorkerNav.tsx
│   │   ├── _archived/
│   │   │   ├── NavConceptA.tsx
│   │   │   ├── NavConceptB.tsx
│   │   │   └── NavConceptC.tsx
```
- Move unused concepts to `_archived/` folder
- Update comments with reason for archival + date
- Remove from production routes entirely

**Option 2: Protect Internal Routes**
```typescript
// app/nav-concepts/layout.tsx
export default function NavConceptsLayout({ children }: { children: React.ReactNode }) {
  // Require admin role or specific feature flag
  if (process.env.NODE_ENV === 'production') {
    redirect('/')
  }
  return children
}
```

**Option 3: Consolidate Landing Variants**
```
app/
├── landing/
│   ├── layout.tsx          (shared layout)
│   ├── page.tsx            (default variant or variant-a)
│   └── variants/
│       ├── b/page.tsx
│       ├── c/page.tsx
│       └── ...
```
- Use shared layout for consistent header/footer
- Track variant via URL path or searchParams
- Easier analytics aggregation

---

## 9. Navigation State Management (Zustand)

### 9.1 Current State Store Usage

**Expected Zustand Slices:**
```typescript
// useUIStore
{
  isBottomSheetOpen: boolean
  selectedMapMarker: string | null
  openBottomSheet: (markerId: string) => void
  closeBottomSheet: () => void
  setSelectedMarker: (id: string | null) => void
}

// useUserStore (or UserRoleContext)
{
  user: User | null
  role: 'hirer' | 'worker' | null
  setRole: (role) => void
}
```

### 9.2 Navigation-Specific State Issues

**Issue 1: Bottom Sheet State Persistence**
- Problem: Sheet state lost on route change
- Example: User opens sheet on `/work/map`, navigates to `/work/job/[id]`, back button → sheet state lost
- Solution: Store `selectedMarker` in Zustand with persistence
```typescript
const useUIStore = create(
  persist(
    (set) => ({
      selectedMarker: null as string | null,
      setSelectedMarker: (id) => set({ selectedMarker: id }),
    }),
    { name: 'ui-storage' }
  )
)
```

**Issue 2: Message Thread State**
- Problem: Switching between `/hiring/messages` and `/work/messages` without clear thread state
- Solution: Store `activeThreadId` per role
```typescript
{
  hiringActiveThread: string | null
  workActiveThread: string | null
  setActiveThread: (role: 'hiring' | 'work', threadId: string) => void
}
```

**Issue 3: Map View State**
- Problem: Zoom level, center coordinates not preserved on back navigation
- Solution: Store map state separately
```typescript
{
  mapCenter: { lat: number; lng: number } | null
  mapZoom: number
  setMapState: (center, zoom) => void
}
```

---

## 10. Accessibility & Keyboard Navigation

### 10.1 Audit Checklist

| Area | Requirement | Status | Notes |
|------|-------------|--------|-------|
| **Focus Management** | Focus visible on all interactive elements | ⚠️ | May lack :focus-visible styling |
| **Keyboard Navigation** | All nav items accessible via Tab key | ⚠️ | Bottom sheet may not have focus trap |
| **ARIA Labels** | Nav buttons have aria-label or text | ⚠️ | Icons may lack labels on mobile |
| **Breadcrumbs** | aria-label="Breadcrumbs" on nav element | ✗ | Missing breadcrumbs |
| **Active Indicator** | aria-current="page" on active nav item | ⚠️ | Check HiringNav/WorkerNav |
| **Screen Readers** | Live regions for state changes | ✗ | Sheet opening likely not announced |
| **Color Contrast** | WCAG AA on all text | ⚠️ | Needs audit of Tailwind colors |
| **Skip Links** | Skip to main content link | ✗ | Not present |

### 10.2 Critical Fixes

**Add Skip Link (app/layout.tsx):**
```typescript
<a
  href="#main-content"
  className="absolute -top-full left-0 z-50 bg-blue-600 text-white px-4 py-2 focus:top-0"
>
  Skip to main content
</a>
<main id="main-content">
  {/* page content */}
</main>
```

**Add Focus Visible to Tailwind Config (tailwind.config.ts):**
```typescript
module.exports = {
  theme: {
    extend: {
      ringColor: {
        focus: 'rgb(37, 99, 235)',
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        '@apply focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600':
          {},
      })
    },
  ],
}
```

**Verify aria-current on Active Tab:**
```typescript
// src/components/navigation/HiringNav.tsx
<Link
  href="/hiring/jobs"
  aria-current={pathname === '/hiring/jobs' ? 'page' : undefined}
  className={`nav-link ${pathname === '/hiring/jobs' ? 'active' : ''}`}
>
  Jobs
</Link>
```

---

## 11. Mobile-Specific UX Patterns

### 11.1 Viewport & Breakpoint Testing

**Recommended Test Sizes:**
- **320px:** iPhone SE
- **375px:** iPhone 12 (base)
- **414px:** iPhone 12 Pro Max
- **540px:** Android (6" tablet in portrait)
- **768px:** iPad / Tailwind md: breakpoint (where nav changes)
- **1024px:** Landscape tablet / desktop

**Testing Procedure:**
```
For each breakpoint:
1. Test all nav transitions (HiringNav, WorkerNav, UniversalNav)
2. Verify bottom sheet doesn't cover nav
3. Check text readability (no cutoff, proper size)
4. Test with keyboard open (doesn't shift layout)
5. Test with system notifications (doesn't cover content)
6. Verify sticky headers don't overlap dynamic content
```

### 11.2 Gesture-Based Navigation

**Current State:** Unknown if swipe gestures implemented
- No Framer Motion gesture detection in nav components (likely)

**Recommended Patterns:**

**Swipe Between Tabs (optional, advanced UX):**
```typescript
// src/hooks/useSwipeNavigation.ts
import { useMotionValue, useTransform } from 'framer-motion'

export function useSwipeNavigation(navItems: string[], onSwipe: (index: number) => void) {
  const x = useMotionValue(0)

  useGestureHandler('pointer', (x) => {
    if (x > 50) onSwipe(-1)  // Swiped right → prev item
    if (x < -50) onSwipe(1)  // Swiped left → next item
  })

  return { x }
}
```

**Swipe to Close Bottom Sheet:**
```typescript
// Bottom sheet with drag-to-close
<motion.div
  drag="y"
  dragElastic={0.2}
  onDragEnd={(_, { offset, velocity }) => {
    if (offset.y > 100 || velocity.y > 500) {
      closeSheet()
    }
  }}
>
  {/* Sheet content */}
</motion.div>
```

---

## 12. Analytics & Navigation Tracking

### 12.1 Current State

**Finding:** No analytics configured in CrewLink
- Navigation events not tracked
- User flow unclear
- No data on drop-off points

### 12.2 Recommended Analytics Events

```typescript
// src/lib/analytics.ts
export const navigationEvents = {
  // Role-based routing
  'user_wrong_side_redirect': { role: string; attempted_route: string },
  'user_role_mismatch_detected': { cached_role: string; server_role: string },

  // Mobile nav
  'mobile_nav_tab_clicked': { tab: string; from_tab?: string },
  'mobile_nav_swipe': { direction: 'left' | 'right'; from_tab: string; to_tab: string },

  // Map interactions
  'map_marker_clicked': { marker_id: string; job_title: string },
  'bottom_sheet_opened': { marker_id: string },
  'bottom_sheet_closed': { reason: 'back_button' | 'outside_tap' | 'escape' },
  'job_details_view_details_clicked': { job_id: string },

  // Deep linking
  'deep_link_success': { path: string; auth_required: boolean },
  'deep_link_failed': { path: string; reason: string },

  // Breadcrumbs
  'breadcrumb_clicked': { breadcrumb_index: number; destination: string },

  // 404 / errors
  'page_not_found': { attempted_route: string; referrer?: string },
  'navigation_error': { error: string; route: string },
}
```

### 12.3 Integration Points

**Middleware or Route Change Hook:**
```typescript
// app/layout.tsx
'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent } from '@/lib/analytics'

export default function RootLayout({ children }) {
  const pathname = usePathname()

  useEffect(() => {
    trackEvent('page_view', { path: pathname })
  }, [pathname])

  return <>{children}</>
}
```

---

## 13. Testing Strategy

### 13.1 Playwright E2E Test Cases

**Test Suite 1: Role-Based Routing**
```typescript
// tests/navigation/role-based.spec.ts
test.describe('Role-Based Routing', () => {
  test('hirer cannot access /work routes', async ({ page }) => {
    await loginAsHirer(page)
    await page.goto('/work/jobs')
    await expect(page).toHaveURL(/\/wrong-side|\/hiring/)
  })

  test('worker cannot access /hiring routes', async ({ page }) => {
    await loginAsWorker(page)
    await page.goto('/hiring/post')
    await expect(page).toHaveURL(/\/wrong-side|\/work/)
  })

  test('unauthenticated user redirects to sign-in with return URL', async ({ page }) => {
    await page.goto('/hiring/job/123')
    await expect(page).toHaveURL(/sign-in\?redirect=/)
  })
})
```

**Test Suite 2: Mobile Navigation**
```typescript
// tests/navigation/mobile-nav.spec.ts
test.describe('Mobile Bottom Navigation', async () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
  })

  test('clicking nav tab changes active state', async ({ page }) => {
    await page.goto('/hiring')
    await page.click('text=Jobs')
    await expect(page.locator('[aria-current="page"]')).toContainText('Jobs')
  })

  test('bottom sheet closes on back button', async ({ page }) => {
    // Worker on map
    await page.goto('/work/map')
    // Open bottom sheet
    await page.click('[data-marker-id="123"]')
    // Click back
    await page.click('button:has-text("Back")')
    await expect(page.locator('[role="complementary"]')).toBeHidden()
  })
})
```

**Test Suite 3: Deep Linking**
```typescript
// tests/navigation/deep-linking.spec.ts
test.describe('Deep Linking', () => {
  test('preserves query params on auth redirect', async ({ page }) => {
    await page.goto('/work/map?lat=40.7&lng=-74.0')
    await expect(page).toHaveURL(/\?.*lat=/)
    // After login, should redirect with params intact
  })

  test('returns to intended route after login', async ({ page }) => {
    await page.goto('/hiring/job/123')
    // Auto-redirects to sign-in
    await loginAsHirer(page)
    // Should return to /hiring/job/123
    await expect(page).toHaveURL('/hiring/job/123')
  })
})
```

### 13.2 Manual Testing Checklist

```
NAVIGATION — MANUAL TEST MATRIX
════════════════════════════════════════

[ ] HIRER FLOW
  [ ] Sign in as hirer
  [ ] Navigate /hiring → verify HiringNav active
  [ ] Click "Post Job" → /hiring/post
  [ ] Fill form, submit → /hiring/jobs (verify job appears)
  [ ] Click job from list → /hiring/job/[id]
  [ ] Click back → /hiring/jobs (scroll position?)
  [ ] Try /work/map → redirects to /wrong-side
  [ ] Mobile: Test bottom nav tab clicks
  [ ] Mobile: Test hamburger menu (if exists)

[ ] WORKER FLOW
  [ ] Sign in as worker
  [ ] Navigate /work → verify map loads or redirect to /work/jobs
  [ ] Click job marker → bottom sheet opens
  [ ] Click "View Details" → /work/job/[id]
  [ ] Click back → bottom sheet still visible? Or closed?
  [ ] Try /hiring/jobs → redirects to /wrong-side
  [ ] Mobile: Swipe gestures on map (if implemented)
  [ ] Mobile: Swipe down on bottom sheet → closes

[ ] DEEP LINKING
  [ ] Unauthenticated: Visit /hiring/job/123 → redirects to /sign-in?redirect=
  [ ] Visit /work/map?lat=40&lng=-74 → preserves query params
  [ ] After login, visits original URL
  [ ] Invalid ID: /hiring/job/nonexistent → 404 page

[ ] MARKETING PAGES
  [ ] Hamburger menu opens/closes
  [ ] Footer links work
  [ ] Breadcrumbs appear (if implemented)
  [ ] Mobile: No horizontal scroll

[ ] ACCESSIBILITY
  [ ] Tab key navigates all elements
  [ ] Focus outline visible
  [ ] Screen reader announces nav items
  [ ] aria-current="page" on active nav
  [ ] Keyboard can open/close bottom sheet (Escape)
  [ ] Color contrast passes WCAG AA
```

---

## 14. Implementation Roadmap

### Phase 1: Critical Fixes (Week 1–2)

| Task | Effort | Impact | Status |
|------|--------|--------|--------|
| Add not-found.tsx (global + per-layout) | 2h | High | ⬜ |
| Implement skip links & focus-visible | 2h | High | ⬜ |
| Verify deep link query param preservation | 3h | High | ⬜ |
| Add breadcrumbs to main routes | 4h | Medium | ⬜ |
| Test role-based routing edge cases | 3h | High | ⬜ |

### Phase 2: Mobile UX (Week 2–3)

| Task | Effort | Impact | Status |
|------|--------|--------|--------|
| Add transition animations to bottom nav | 3h | Medium | ⬜ |
| Implement bottom sheet focus trap | 3h | High | ⬜ |
| Test swipe gestures on mobile | 2h | Medium | ⬜ |
| Verify bottom nav doesn't overlap keyboard/sheet | 2h | High | ⬜ |
| Add aria-live for sheet state changes | 1h | Medium | ⬜ |

### Phase 3: Cleanup & Optimization (Week 3–4)

| Task | Effort | Impact | Status |
|------|--------|--------|--------|
| Archive NavConceptA/B/C or document | 1h | Low | ⬜ |
| Consolidate landing variants or protect /nav-concepts | 2h | Low | ⬜ |
| Add analytics events | 4h | Medium | ⬜ |
| E2E test suite (Playwright) | 6h | High | ⬜ |
| Accessibility audit (WAVE, axe) | 2h | Medium | ⬜ |

---

## 15. Monitoring & Maintenance

### 15.1 Key Metrics to Track

```
Navigation Health Dashboard
═══════════════════════════
- Page load time (by route)
- Time to interactive (TTI)
- 404 error rate
- Role mismatch redirects
- Deep link success rate
- Bottom sheet open/close duration
- Mobile nav interaction rate
- Keyboard navigation usage
```

### 15.2 Regular Audits

- **Monthly:** Review analytics; check for new 404s or redirect loops
- **Quarterly:** Accessibility audit (WAVE, axe DevTools)
- **Quarterly:** Mobile UX testing on new device sizes
- **Bi-yearly:** User testing; validate navigation mental model

---

## 16. Summary & Action Items

### Quick Wins (Can implement immediately)

1. **Create not-found.tsx** — Prevent blank 404 pages
2. **Add skip link + focus-visible** — Accessibility boost
3. **Verify deep link query params** — Fix lost state
4. **Add aria-current to active nav** — Screen reader support

### Medium Priority

5. **Implement breadcrumbs** — Improve UX in nested routes
6. **Add bottom sheet focus trap** — Keyboard accessibility
7. **Test role-based routing** — Catch edge cases
8. **Add analytics events** — Understand user flows

### Long-term Improvements

9. **Consolidate landing variants** — Cleaner routing structure
10. **Implement swipe gestures** — Modern mobile UX
11. **Add E2E test suite** — Catch regressions
12. **Full accessibility audit** — WCAG AA compliance

---

## Appendix: Code Snippets & Resources

### A1. RoleGuard Component (Reference Implementation)

```typescript
// src/components/RoleGuard.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserRoleContext } from '@/context/UserRoleContext'

interface RoleGuardProps {
  requiredRole: 'hirer' | 'worker'
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function RoleGuard({
  requiredRole,
  children,
  fallback,
}: RoleGuardProps) {
  const router = useRouter()
  const { user, isLoading } = useUserRoleContext()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search
      )
      router.push(`/sign-in?redirect=${returnUrl}`)
      return
    }

    if (user.role !== requiredRole) {
      router.push('/wrong-side')
      return
    }
  }, [user, isLoading, requiredRole, router])

  if (isLoading) return <div>Loading...</div>
  if (!user || user.role !== requiredRole) return fallback || null

  return <>{children}</>
}
```

### A2. Breadcrumb Hook

```typescript
// src/hooks/useBreadcrumbs.ts
import { useMemo } from 'react'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href: string
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
    ]

    let currentPath = ''
    segments.forEach((segment) => {
      currentPath += `/${segment}`
      const label = segment
        .replace(/^\[|]$/g, '')
        .replace(/-/g, ' ')
        .toUpperCase()
      breadcrumbs.push({ label, href: currentPath })
    })

    return breadcrumbs
  }, [pathname])
}
```

### A3. Deep Link Middleware (Next.js 14)

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value
  const pathname = req.nextUrl.pathname

  // Protect /hiring routes
  if (pathname.startsWith('/hiring') && !token) {
    const returnUrl = pathname + req.nextUrl.search
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect', returnUrl)
    return NextResponse.redirect(signInUrl)
  }

  // Protect /work routes
  if (pathname.startsWith('/work') && !token) {
    const returnUrl = pathname + req.nextUrl.search
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect', returnUrl)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/hiring/:path*', '/work/:path*'],
}
```

### A4. Resources & References

- **Next.js Routing:** https://nextjs.org/docs/app/building-your-application/routing
- **Accessibility (WCAG 2.1):** https://www.w3.org/WAI/WCAG21/quickref/
- **Framer Motion Gestures:** https://www.framer.com/motion/gestures/
- **Breadcrumb Schema:** https://schema.org/BreadcrumbList
- **Focus Management:** https://www.smashingmagazine.com/2015/05/focus-management-in-single-page-applications/
- **Mobile UX Patterns:** https://www.nngroup.com/articles/mobile-navigation/

---

**Document Version:** 1.0
**Last Updated:** February 2025
**Audience:** CrewLink Product & Engineering Team
**Status:** Ready for Implementation
