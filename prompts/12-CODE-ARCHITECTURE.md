# 12-CODE-ARCHITECTURE.md

**CrewLink Code Architecture Audit & Optimization Guide**

## Executive Summary

CrewLink is a Next.js 14+ marketplace application with a PostgreSQL backend. The current architecture is functional but has significant organizational challenges that impact maintainability and scalability. This document outlines the audit findings and provides a roadmap for architectural improvements.

**Current Status:** 60+ pages, 33+ components, 9 Zustand stores, 2 React contexts, 15 API routes
**Primary Issues:** Mega-file structures, missing route groups, inconsistent component organization, duplicate state management patterns
**Priority Level:** High — refactoring will improve developer velocity and reduce cognitive load

---

## 1. Current Architecture Overview

### 1.1 Tech Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| **Framework** | Next.js | 14+ with App Router | Production-ready |
| **Language** | TypeScript | Latest | Strict mode status: **NEEDS VERIFICATION** |
| **Styling** | Tailwind CSS | Custom config | Verified working |
| **State Management** | Zustand | 8 stores | Single mega-file (570+ lines) |
| **State Management** | React Context | 2 contexts | User role + app mode |
| **Database** | PostgreSQL | Via Prisma v5.10 | Production database |
| **ORM** | Prisma | 5.10 | Schema-driven development |
| **Authentication** | NextAuth.js | v4 | Session-based auth |
| **API Pattern** | REST | Next.js route handlers | 15 endpoints |
| **Validation** | Zod | Latest | Runtime type safety |
| **HTTP Client** | Fetch API | Native | No external HTTP library |
| **Testing** | Playwright | Latest | E2E only, no unit tests |
| **Linting** | ESLint | eslint-config-next | Next.js preset |
| **CI/CD** | GitHub Actions + Vercel | Dual deployment | Automated deployments |

### 1.2 Project Structure (Current)

```
src/
├── app/                          # 60+ pages, NO route groups
│   ├── (public pages)
│   │   ├── sign-in/
│   │   ├── create-account/
│   │   ├── forgot-password/
│   │   ├── select-role/
│   │   ├── landing-a/ through landing-f/
│   │   ├── about/, how-it-works/, pricing/, safety/
│   │   ├── blog/, contact/, privacy/, terms/
│   │   └── [+10 other public routes]
│   ├── (dashboard pages)
│   │   ├── hiring/ (layout + 15+ pages)
│   │   │   ├── create-job/, edit-job/, manage-jobs/
│   │   │   ├── bids/, applications/
│   │   │   └── [other hiring flows]
│   │   ├── work/ (layout + 14+ pages)
│   │   │   ├── job-detail/, job-feed/
│   │   │   ├── apply/, my-applications/
│   │   │   └── [other worker flows]
│   │   ├── team/ (4 member pages)
│   │   └── help/ (account, articles, etc.)
│   ├── api/ (15 route handlers)
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── bids/
│   │   ├── messages/
│   │   ├── notifications/
│   │   └── [other endpoints]
│   ├── layout.tsx (root layout)
│   ├── error.tsx
│   ├── loading.tsx
│   ├── cities/ (dynamic city pages)
│   ├── categories/ (dynamic category pages)
│   ├── careers/ (hiring pages)
│   ├── nav-concepts/ (experimental)
│   └── wrong-side/ (legacy?)
├── components/                   # 33+ components
│   ├── ui/                       # 13 primitives (NO barrel export)
│   │   ├── Button.tsx, Input.tsx, Select.tsx, Modal.tsx
│   │   ├── Badge.tsx, Card.tsx, Dropdown.tsx, Tabs.tsx
│   │   └── [+5 more primitives]
│   ├── map/                      # 4 map-related components
│   │   ├── Map.tsx, MapMarker.tsx, MapOverlay.tsx, MapControls.tsx
│   ├── navigation/               # 5 components + 3 experimental
│   │   ├── Navbar.tsx, Sidebar.tsx, Breadcrumbs.tsx
│   │   ├── NavConceptA.tsx, NavConceptB.tsx, NavConceptC.tsx (experimental)
│   ├── cards/                    # 3 card components
│   │   ├── JobCard.tsx, BidCard.tsx, ApplicationCard.tsx
│   ├── layout/                   # 1 component (inconsistent placement)
│   │   ├── Header.tsx
│   ├── sidebar/                  # 1 component
│   │   ├── Sidebar.tsx
│   ├── access/                   # 2 access control components
│   │   ├── RoleGuard.tsx, RestrictedAccess.tsx
│   ├── providers/                # 1 provider
│   │   ├── SessionProvider.tsx
│   ├── Top-level (inconsistent)
│   │   ├── AmbientBackground.tsx
│   │   ├── MarketingFooter.tsx
│   │   ├── MarketingLayout.tsx
│   │   ├── UniversalNav.tsx
│
├── store/                        # MEGA-FILE PROBLEM
│   └── index.ts (570+ lines)     # All 9 stores in one file
│       ├── useAuthStore
│       ├── useAppModeStore
│       ├── useMapStore
│       ├── useJobStore
│       ├── useBidStore
│       ├── useMessageStore
│       ├── useNotificationStore
│       ├── useOnboardingStore
│       └── useJobFormStore
│
├── contexts/                     # 2 React contexts
│   ├── UserRoleContext.tsx
│   ├── AppModeContext.tsx
│   └── index.ts (barrel)
│
├── lib/                          # Mixed concerns
│   ├── auth.ts (NextAuth configuration)
│   ├── db.ts (Prisma client)
│   ├── utils.ts (general utilities)
│   ├── constants.ts
│   ├── api.ts (API client utilities)
│   ├── design-system.ts
│   ├── map-tokens.ts
│   ├── careers.ts (DATA)
│   ├── categories.ts (DATA)
│   └── cities-data.ts (DATA)
│
├── types/                        # MEGA-FILE PROBLEM
│   ├── index.ts (ALL types in one file)
│   │   ├── User, Job, Bid, Message, Notification types
│   │   ├── API request/response types
│   │   ├── Map types, Form types
│   │   └── [30+ other types]
│   └── next-auth.d.ts (NextAuth augmentation)
│
├── hooks/                        # 2 custom hooks
│   ├── useMobileAnimation.ts
│   └── useScrollReveal.ts
│
├── design/
│   └── tokens.ts (design tokens)
│
├── qa/                           # QA utilities
└── [root files: next.config.js, tsconfig.json, tailwind.config.js, etc.]
```

---

## 2. Architecture Issues & Audit Findings

### Issue #1: Mega-File Problem in `store/index.ts` (CRITICAL)

**Problem:** All 9 Zustand stores (~570 lines) are defined in a single file, making it:
- Difficult to locate and modify specific stores
- Painful to review changes (large diffs)
- Hard to track store dependencies
- Violates single responsibility principle

**Current Stores:**
1. `useAuthStore` — User authentication, role, permissions
2. `useAppModeStore` — Current app mode (hiring/work)
3. `useMapStore` — Map state, markers, filters
4. `useJobStore` — Job list, filters, selected job
5. `useBidStore` — Bid management, bid list
6. `useMessageStore` — Messages, conversations
7. `useNotificationStore` — Notification queue
8. `useOnboardingStore` — Onboarding step tracking
9. `useJobFormStore` — Job creation/edit form state

**Recommendation:** Split into individual files with barrel export

```
store/
├── auth.ts           # useAuthStore
├── appMode.ts        # useAppModeStore
├── map.ts            # useMapStore
├── jobs.ts           # useJobStore
├── bids.ts           # useBidStore
├── messages.ts       # useMessageStore
├── notifications.ts  # useNotificationStore
├── onboarding.ts     # useOnboardingStore
├── jobForm.ts        # useJobFormStore
└── index.ts          # Re-exports all stores
```

**Timeline:** 2-3 sprints (1-2 days per store migration)
**Effort:** Medium | **Impact:** High

---

### Issue #2: Mega-File Problem in `types/index.ts` (CRITICAL)

**Problem:** All TypeScript types (~40+ types) are in a single file:
- Difficult to navigate and find types
- Mixes unrelated domains
- Large merge conflicts
- Violates domain-driven organization

**Estimated Types by Domain:**
- User types: 8-10 (User, UserProfile, UserPreferences, UserRole, etc.)
- Job types: 10-12 (Job, JobPost, JobStatus, JobCategory, etc.)
- Bid types: 5-7 (Bid, BidStatus, BidResponse, etc.)
- Message types: 5-7 (Message, Conversation, ConversationMember, etc.)
- Map types: 4-5 (Location, Marker, GeoPoint, etc.)
- API types: 10-15 (Request/response envelopes, error types)

**Recommendation:** Split by domain

```
types/
├── user.ts           # User, UserProfile, UserRole, UserPreferences
├── job.ts            # Job, JobPost, JobStatus, JobCategory
├── bid.ts            # Bid, BidStatus, BidResponse
├── message.ts        # Message, Conversation, ConversationMember
├── map.ts            # Location, Marker, GeoPoint
├── api.ts            # API request/response wrappers
├── common.ts         # Shared types (Status, Pagination, etc.)
└── index.ts          # Re-exports all types
```

**Timeline:** 1-2 sprints
**Effort:** Medium | **Impact:** High

---

### Issue #3: No Route Groups (Next.js Anti-Pattern)

**Problem:** The `app/` directory has 60+ pages without using Next.js route groups. This causes:
- Shared layouts cannot be applied to logical groups
- No visual grouping of related pages
- Lost opportunity for selective layout composition
- URL structure less RESTful

**Current Structure (Flat):**
```
/sign-in, /create-account, /forgot-password, /select-role
/hiring/create-job, /hiring/manage-jobs, /work/job-feed, /work/apply
/landing-a, /landing-b, /landing-c
/about, /how-it-works, /pricing, /safety
/blog, /contact, /privacy, /terms
/careers, /careers/[slug], /careers/apply
/help, /help/account, /help/articles
/team, /team/members
/cities, /cities/[cityId], /categories
/nav-concepts, /wrong-side
```

**Recommendation:** Implement route groups

```
app/
├── (auth)/
│   ├── layout.tsx (auth layout)
│   ├── sign-in/
│   ├── create-account/
│   ├── forgot-password/
│   └── select-role/
│
├── (dashboard)/
│   ├── layout.tsx (dashboard layout with shared sidebar)
│   ├── hiring/
│   │   ├── layout.tsx (hiring-specific layout)
│   │   ├── create-job/
│   │   ├── manage-jobs/
│   │   ├── job-detail/
│   │   └── [+12 more pages]
│   ├── work/
│   │   ├── layout.tsx (worker-specific layout)
│   │   ├── job-feed/
│   │   ├── apply/
│   │   ├── my-applications/
│   │   └── [+11 more pages]
│   ├── messages/
│   ├── notifications/
│   └── help/
│
├── (marketing)/
│   ├── layout.tsx (marketing layout - no auth check)
│   ├── landing-a/ through landing-f/
│   ├── about/
│   ├── how-it-works/
│   ├── pricing/
│   ├── safety/
│   ├── blog/
│   ├── contact/
│   ├── privacy/
│   └── terms/
│
├── (admin)/
│   ├── layout.tsx (admin layout)
│   ├── careers/
│   ├── careers/[slug]/
│   ├── careers/apply/
│   ├── team/
│   └── [team member pages]
│
├── api/
│   ├── auth/
│   ├── jobs/
│   ├── applications/
│   ├── bids/
│   ├── messages/
│   └── notifications/
│
├── (dynamic)/
│   ├── cities/
│   ├── cities/[cityId]/
│   └── categories/
│
├── layout.tsx (root layout)
├── error.tsx
└── not-found.tsx (MISSING - create this)
```

**Benefits:**
- Automatic layout nesting
- Cleaner URL structure
- Better code organization
- Simplified auth redirects (via middleware)

**Timeline:** 1-2 sprints
**Effort:** Medium | **Impact:** High

---

### Issue #4: Inconsistent Component Organization

**Problem:** Components are scattered without clear organization:

**Current Issues:**
1. **Top-level components:** `AmbientBackground.tsx`, `MarketingFooter.tsx`, `MarketingLayout.tsx`, `UniversalNav.tsx` lack organization
2. **Navigation split:** `UniversalNav.tsx` (top-level) vs. `components/navigation/` folder
3. **Marketing components:** `MarketingFooter.tsx` and `MarketingLayout.tsx` (top-level) should be in `layout/`
4. **No barrel exports:** `components/ui/` and `components/layout/` should have `index.ts` for clean imports
5. **Missing feature folders:** No separation of hiring-specific, worker-specific, or onboarding components

**Recommendation:** Reorganize with clear hierarchy

```
components/
├── ui/
│   ├── Button.tsx, Input.tsx, Select.tsx, Modal.tsx
│   ├── Badge.tsx, Card.tsx, Dropdown.tsx, Tabs.tsx
│   ├── [+5 more primitives]
│   └── index.ts (barrel export)
│
├── layout/
│   ├── Header.tsx
│   ├── MarketingFooter.tsx
│   ├── MarketingLayout.tsx
│   ├── RootLayout.tsx (wrapper for root layout)
│   └── index.ts (barrel export)
│
├── navigation/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Breadcrumbs.tsx
│   ├── UniversalNav.tsx (moved here)
│   └── index.ts (barrel export)
│
├── map/
│   ├── Map.tsx, MapMarker.tsx, MapOverlay.tsx, MapControls.tsx
│   └── index.ts (barrel export)
│
├── cards/
│   ├── JobCard.tsx, BidCard.tsx, ApplicationCard.tsx
│   └── index.ts (barrel export)
│
├── access/
│   ├── RoleGuard.tsx, RestrictedAccess.tsx
│   └── index.ts (barrel export)
│
├── providers/
│   ├── SessionProvider.tsx
│   └── index.ts (barrel export)
│
├── features/                  # Feature-specific components
│   ├── hiring/
│   │   ├── JobForm.tsx, JobPreview.tsx, BidList.tsx
│   │   └── index.ts
│   ├── work/
│   │   ├── JobFeed.tsx, ApplicationForm.tsx, MyApplications.tsx
│   │   └── index.ts
│   ├── onboarding/
│   │   ├── StepIndicator.tsx, RoleSelector.tsx, PreferencesForm.tsx
│   │   └── index.ts
│   └── messaging/
│       ├── ConversationList.tsx, MessageThread.tsx
│       └── index.ts
│
├── AmbientBackground.tsx (deprecated/cleanup)
└── index.ts (main barrel export)
```

**Import Pattern After Refactoring:**
```typescript
// Before (scattered)
import { Button } from '@/components/ui/Button'
import { MarketingFooter } from '@/components/MarketingFooter'
import { UniversalNav } from '@/components/UniversalNav'

// After (clean)
import { Button } from '@/components/ui'
import { MarketingFooter, RootLayout } from '@/components/layout'
import { UniversalNav } from '@/components/navigation'
import { JobForm } from '@/components/features/hiring'
```

**Timeline:** 1-2 sprints
**Effort:** Medium | **Impact:** Medium

---

### Issue #5: Duplicate Role/Mode State Management (CRITICAL)

**Problem:** Three overlapping systems manage user role and app mode:

1. **Zustand Store:** `useAuthStore.user.role`
2. **Zustand Store:** `useAppModeStore.mode` (hiring/work)
3. **React Context:** `UserRoleContext.role` (redundant)

**Current Usage:**
- Auth state: `useAuthStore` (read user role)
- Route protection: `RoleGuard.tsx` (uses `UserRoleContext`)
- App mode switching: `useAppModeStore` (hiring/work toggle)

**Issues:**
- Duplicate source of truth
- Different update mechanisms
- Potential inconsistency
- Context + Zustand combined is unnecessary

**Recommendation:** Consolidate to single store with context provider

```typescript
// store/auth.ts - single source of truth
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  mode: 'hiring', // hiring | work
  isAuthenticated: false,

  setUser: (user) => set({ user, role: user.role }),
  setMode: (mode) => set({ mode }),
  logout: () => set({ user: null, role: null, isAuthenticated: false }),
}))

// contexts/AuthContext.tsx - thin provider
export const AuthProvider = ({ children }) => {
  const { user, role, mode } = useAuthStore()
  return (
    <AuthContext.Provider value={{ user, role, mode }}>
      {children}
    </AuthContext.Provider>
  )
}
```

**Timeline:** 2-3 days
**Effort:** Low | **Impact:** High (consistency)

---

### Issue #6: Mixed Concerns in `lib/` Directory

**Problem:** `lib/` conflates utility functions and static data:

**Current Structure:**
```
lib/
├── auth.ts          # NextAuth configuration (utility)
├── db.ts            # Prisma client (utility)
├── utils.ts         # Helper functions (utility)
├── constants.ts     # App constants (utility)
├── api.ts           # API client utilities (utility)
├── design-system.ts # Design system helpers (utility)
├── map-tokens.ts    # Map design tokens (utility)
├── careers.ts       # CAREERS DATA (not a utility!)
├── categories.ts    # CATEGORY DATA (not a utility!)
└── cities-data.ts   # CITY DATA (not a utility!)
```

**Recommendation:** Separate data into dedicated `data/` folder

```
lib/                 # Pure utilities only
├── auth.ts, db.ts, utils.ts, constants.ts
├── api.ts, design-system.ts, map-tokens.ts
└── index.ts (barrel if needed)

data/                # Static data files
├── careers.ts
├── categories.ts
├── cities.ts
├── industries.ts
└── index.ts
```

**Timeline:** 1 day
**Effort:** Low | **Impact:** Medium (organization)

---

### Issue #7: Missing `not-found.tsx` (Custom 404 Page)

**Problem:** No custom 404 page — users see generic Next.js 404.

**Current State:**
- No `app/not-found.tsx` exists
- No custom error handling for undefined routes

**Recommendation:** Create `app/not-found.tsx`

```typescript
// app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-gray-600">Page not found</p>
      <Link href="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}
```

**Timeline:** 1 day
**Effort:** Very Low | **Impact:** Low (UX)

---

### Issue #8: Experimental/Dead Code Cleanup

**Problem:** Unmaintained experimental code clutters the codebase:

**Identified Dead Code:**
1. **`nav-concepts/` page** — Contains experimental navigation concepts
2. **`NavConceptA.tsx`, `NavConceptB.tsx`, `NavConceptC.tsx`** — Experimental nav components
3. **`landing-a/` through `landing-f/` pages** — Multiple landing page variants (are all needed?)
4. **`wrong-side/` page** — Legacy page (purpose unclear)

**Questions to Answer:**
- Are all 6 landing page variants (`landing-a` through `landing-f`) active?
- Which NavConcept variant is actually used?
- What is `/wrong-side/` for?

**Recommendation:**
1. Document purpose of each landing variant
2. Remove unused variants (keep only active A/B tests)
3. Delete experimental nav components if not in use
4. Delete `nav-concepts/` and `wrong-side/` pages unless intentional

**Timeline:** 2-3 days (requires clarification)
**Effort:** Low | **Impact:** Low (cleanup)

---

### Issue #9: Missing `middleware.ts` (Auth Redirects)

**Problem:** Authentication and role-based redirects are currently handled client-side via `RoleGuard.tsx` component:

**Current Issue:**
- Users see full page load before being redirected
- Unauthenticated users can access protected pages briefly
- No server-side auth checks

**Recommendation:** Create Next.js middleware for auth redirects

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextRequest, NextResponse } from 'next/server'

export const middleware = withAuth(
  function middleware(req: NextRequest) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Redirect unauthenticated users to login
    if (!token) {
      if (pathname.startsWith('/hiring') || pathname.startsWith('/work')) {
        return NextResponse.redirect(new URL('/sign-in', req.url))
      }
    }

    // Redirect workers away from hiring routes
    if (token?.role === 'worker' && pathname.startsWith('/hiring')) {
      return NextResponse.redirect(new URL('/work', req.url))
    }

    // Redirect hirers away from worker routes
    if (token?.role === 'hirer' && pathname.startsWith('/work')) {
      return NextResponse.redirect(new URL('/hiring', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/hiring/:path*', '/work/:path*', '/messages/:path*', '/api/:path*'],
}
```

**Benefits:**
- Instant server-side redirects
- No flash of unprotected content
- Cleaner page components
- Better security posture

**Timeline:** 1-2 days
**Effort:** Low-Medium | **Impact:** High (security)

---

### Issue #10: TypeScript Strict Mode Verification (CRITICAL)

**Problem:** Unknown if TypeScript strict mode is enabled. This can lead to:
- Type safety loopholes
- Any-typed variables
- Unsafe operations

**Verification Steps:**
1. Check `tsconfig.json` for `"strict": true`
2. Verify all `tsconfig.json` configurations match Next.js 14 best practices

**Current Assumption:** Need to verify

**Recommendation:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "strictBindCallApply": true,
    "strictFunctionTypes": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "alwaysStrict": true
  }
}
```

**Timeline:** 2-3 hours (if refactoring needed)
**Effort:** Low | **Impact:** High (type safety)

---

### Issue #11: Missing Barrel Exports in Components

**Problem:** No barrel exports (index.ts files) in component folders:

**Current:**
```typescript
// Must import from deep path
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { RoleGuard } from '@/components/access/RoleGuard'
```

**Recommendation:** Add barrel exports

```typescript
// After barrel exports
import { Button } from '@/components/ui'
import { Header } from '@/components/layout'
import { RoleGuard } from '@/components/access'
```

**Implementation:**
```typescript
// components/ui/index.ts
export { Button } from './Button'
export { Input } from './Input'
export { Select } from './Select'
// ... all other exports

// components/layout/index.ts
export { Header } from './Header'
export { MarketingFooter } from './MarketingFooter'
// ... etc
```

**Timeline:** 3-4 hours
**Effort:** Very Low | **Impact:** Medium (DX)

---

### Issue #12: Import Path Standards (Verify @/ Alias Usage)

**Problem:** Inconsistent import paths can indicate:
- Deep relative imports (e.g., `../../../components`)
- Non-standard paths
- Import path confusion

**Recommendation:**
1. Audit all imports to ensure `@/` alias is used consistently
2. Verify `tsconfig.json` paths alias configuration

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Expected Pattern:**
```typescript
// Good: using @/ alias
import { Button } from '@/components/ui'
import { useAuthStore } from '@/store'
import { formatDate } from '@/lib/utils'

// Bad: relative imports (avoid)
import { Button } from '../../../components/ui/Button'
import { useAuthStore } from '../../../../store'
```

**Timeline:** 2-3 hours (audit + fix)
**Effort:** Low | **Impact:** Medium (consistency)

---

## 3. Recommended Architecture

### 3.1 Revised Directory Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── sign-in/
│   │   ├── create-account/
│   │   ├── forgot-password/
│   │   └── select-role/
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx (shared dashboard layout)
│   │   ├── hiring/
│   │   │   ├── layout.tsx (hiring-specific)
│   │   │   ├── page.tsx
│   │   │   ├── create-job/
│   │   │   ├── edit-job/[id]/
│   │   │   ├── manage-jobs/
│   │   │   ├── bids/
│   │   │   ├── applications/
│   │   │   └── [+10 more pages]
│   │   ├── work/
│   │   │   ├── layout.tsx (worker-specific)
│   │   │   ├── page.tsx
│   │   │   ├── job-feed/
│   │   │   ├── job-detail/[id]/
│   │   │   ├── apply/
│   │   │   ├── my-applications/
│   │   │   └── [+9 more pages]
│   │   ├── messages/
│   │   ├── notifications/
│   │   └── help/
│   │       ├── account/
│   │       ├── articles/
│   │       └── [help pages]
│   │
│   ├── (marketing)/
│   │   ├── layout.tsx (public layout - no sidebar)
│   │   ├── page.tsx (home)
│   │   ├── landing-a/ through landing-f/
│   │   ├── about/
│   │   ├── how-it-works/
│   │   ├── pricing/
│   │   ├── safety/
│   │   ├── blog/ (or /blog as separate - depends on content)
│   │   ├── contact/
│   │   ├── privacy/
│   │   └── terms/
│   │
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── careers/
│   │   ├── careers/[slug]/
│   │   ├── careers/apply/
│   │   └── team/
│   │
│   ├── (dynamic)/
│   │   ├── cities/
│   │   ├── cities/[cityId]/
│   │   └── categories/
│   │
│   ├── api/
│   │   ├── auth/
│   │   ├── jobs/
│   │   ├── applications/
│   │   ├── bids/
│   │   ├── messages/
│   │   ├── notifications/
│   │   └── [other endpoints]
│   │
│   ├── layout.tsx (root layout)
│   ├── error.tsx
│   ├── loading.tsx
│   └── not-found.tsx (NEW)
│
├── components/
│   ├── ui/ (primitives)
│   │   ├── Button.tsx, Input.tsx, Select.tsx, Modal.tsx
│   │   ├── Badge.tsx, Card.tsx, Dropdown.tsx, Tabs.tsx
│   │   └── index.ts (barrel)
│   │
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── MarketingFooter.tsx
│   │   ├── MarketingLayout.tsx
│   │   ├── RootLayout.tsx
│   │   └── index.ts (barrel)
│   │
│   ├── navigation/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Breadcrumbs.tsx
│   │   ├── UniversalNav.tsx
│   │   └── index.ts (barrel)
│   │
│   ├── map/
│   │   ├── Map.tsx, MapMarker.tsx, MapOverlay.tsx, MapControls.tsx
│   │   └── index.ts (barrel)
│   │
│   ├── cards/
│   │   ├── JobCard.tsx, BidCard.tsx, ApplicationCard.tsx
│   │   └── index.ts (barrel)
│   │
│   ├── access/
│   │   ├── RoleGuard.tsx, RestrictedAccess.tsx
│   │   └── index.ts (barrel)
│   │
│   ├── providers/
│   │   ├── SessionProvider.tsx
│   │   └── index.ts (barrel)
│   │
│   ├── features/
│   │   ├── hiring/
│   │   │   ├── JobForm.tsx
│   │   │   ├── JobPreview.tsx
│   │   │   ├── BidList.tsx
│   │   │   ├── BidDetail.tsx
│   │   │   └── index.ts
│   │   ├── work/
│   │   │   ├── JobFeed.tsx
│   │   │   ├── ApplicationForm.tsx
│   │   │   ├── MyApplications.tsx
│   │   │   ├── JobDetail.tsx
│   │   │   └── index.ts
│   │   ├── onboarding/
│   │   │   ├── StepIndicator.tsx
│   │   │   ├── RoleSelector.tsx
│   │   │   ├── PreferencesForm.tsx
│   │   │   └── index.ts
│   │   └── messaging/
│   │       ├── ConversationList.tsx
│   │       ├── MessageThread.tsx
│   │       ├── MessageInput.tsx
│   │       └── index.ts
│   │
│   └── index.ts (main barrel)
│
├── store/
│   ├── auth.ts (useAuthStore)
│   ├── appMode.ts (useAppModeStore)
│   ├── map.ts (useMapStore)
│   ├── jobs.ts (useJobStore)
│   ├── bids.ts (useBidStore)
│   ├── messages.ts (useMessageStore)
│   ├── notifications.ts (useNotificationStore)
│   ├── onboarding.ts (useOnboardingStore)
│   ├── jobForm.ts (useJobFormStore)
│   └── index.ts (re-exports: export * from './auth', etc.)
│
├── types/
│   ├── user.ts (User, UserProfile, UserRole, UserPreferences)
│   ├── job.ts (Job, JobPost, JobStatus, JobCategory)
│   ├── bid.ts (Bid, BidStatus, BidResponse)
│   ├── message.ts (Message, Conversation, ConversationMember)
│   ├── map.ts (Location, Marker, GeoPoint)
│   ├── api.ts (ApiResponse, ApiError, PaginationParams)
│   ├── common.ts (Status, Pagination, Sort, etc.)
│   ├── index.ts (re-exports all)
│   └── next-auth.d.ts (NextAuth augmentation)
│
├── lib/
│   ├── auth.ts (NextAuth configuration)
│   ├── db.ts (Prisma client)
│   ├── utils.ts (general helpers)
│   ├── constants.ts
│   ├── api.ts (API client utilities)
│   ├── design-system.ts
│   ├── map-tokens.ts
│   └── index.ts (optional barrel)
│
├── data/
│   ├── careers.ts
│   ├── categories.ts
│   ├── cities.ts
│   ├── industries.ts
│   └── index.ts (optional barrel)
│
├── hooks/
│   ├── useMobileAnimation.ts
│   ├── useScrollReveal.ts
│   └── [add domain-specific hooks as needed]
│
├── config/
│   ├── site.ts (site config, metadata)
│   ├── navigation.ts (nav structure)
│   └── index.ts
│
├── design/
│   └── tokens.ts
│
├── qa/
│   └── [QA utilities]
│
├── middleware.ts (NEW - auth + role redirects)
│
└── [env.local, next.config.js, tsconfig.json, tailwind.config.js, etc.]
```

### 3.2 Key Improvements Summary

| Area | Issue | Solution | Timeline | Effort | Impact |
|------|-------|----------|----------|--------|--------|
| State | Mega-file store (570 lines) | Split into 9 individual files | 2-3 sprints | Medium | High |
| Types | Mega-file types (40+ types) | Split by domain (7 files) | 1-2 sprints | Medium | High |
| Routing | No route groups | Implement 4 route groups: auth, dashboard, marketing, admin | 1-2 sprints | Medium | High |
| Components | Inconsistent organization | Reorganize with barrel exports + feature folders | 1-2 sprints | Medium | Medium |
| State | Duplicate role/mode | Consolidate to single store | 2-3 days | Low | High |
| Organization | Mixed concerns in lib/ | Separate lib/ and data/ | 1 day | Low | Medium |
| UX | Missing 404 page | Create not-found.tsx | 1 day | Very Low | Low |
| Cleanup | Dead code (landing, nav concepts) | Document and remove unused variants | 2-3 days | Low | Low |
| Security | No server-side auth | Create middleware.ts | 1-2 days | Low-Medium | High |
| Types | TypeScript strict mode | Verify and enforce strict: true | 2-3 hours | Low | High |
| DX | No barrel exports | Add index.ts to component folders | 3-4 hours | Very Low | Medium |
| Standards | Import path audit | Ensure @/ alias usage | 2-3 hours | Low | Medium |

---

## 4. Implementation Roadmap

### Phase 1: Foundation (Sprint 1-2) — CRITICAL
Priority: **Must-do** before major feature work

- [ ] Verify TypeScript strict mode in `tsconfig.json`
- [ ] Create `middleware.ts` for server-side auth
- [ ] Create `app/not-found.tsx`
- [ ] Audit and fix import paths (@/ alias)
- [ ] Document landing variant usage and delete unused pages

**Output:** Stricter type safety, better auth, cleaner codebase

### Phase 2: Organization (Sprint 2-4) — HIGH PRIORITY
Priority: **Important for scaling** developer productivity

- [ ] Split `store/index.ts` into 9 individual files
- [ ] Split `types/index.ts` into 7 domain files
- [ ] Add barrel exports to component folders (ui/, layout/, etc.)
- [ ] Move data files from `lib/` to new `data/` folder
- [ ] Move top-level components (MarketingFooter, etc.) into proper folders

**Output:** Much improved code navigation and maintainability

### Phase 3: Architecture (Sprint 3-5) — HIGH PRIORITY
Priority: **Enables better feature development**

- [ ] Implement 4 route groups: (auth), (dashboard), (marketing), (admin)
- [ ] Create shared layouts for dashboard, marketing
- [ ] Create `config/` folder with site.ts, navigation.ts
- [ ] Create `components/features/` folders for hiring, work, messaging
- [ ] Consolidate duplicate role/mode state into single store

**Output:** Cleaner architecture, better shared layout composition

### Phase 4: Polish (Sprint 5-6) — MEDIUM PRIORITY
Priority: **Nice to have, improves DX**

- [ ] Clean up unused NavConcept components
- [ ] Add config/ folder with site configuration
- [ ] Review and optimize component re-exports
- [ ] Add missing hook organization if needed
- [ ] Document architecture decisions (ADR files)

**Output:** Polished codebase ready for scaling

---

## 5. Migration Checklist

### Store Migration (store/index.ts → 9 files)

```
[ ] Create store/auth.ts (useAuthStore)
[ ] Create store/appMode.ts (useAppModeStore)
[ ] Create store/map.ts (useMapStore)
[ ] Create store/jobs.ts (useJobStore)
[ ] Create store/bids.ts (useBidStore)
[ ] Create store/messages.ts (useMessageStore)
[ ] Create store/notifications.ts (useNotificationStore)
[ ] Create store/onboarding.ts (useOnboardingStore)
[ ] Create store/jobForm.ts (useJobFormStore)
[ ] Create store/index.ts (re-exports)
[ ] Update all imports across codebase
[ ] Delete old store/index.ts
[ ] Verify no broken imports with build
```

### Types Migration (types/index.ts → 7 files)

```
[ ] Create types/user.ts
[ ] Create types/job.ts
[ ] Create types/bid.ts
[ ] Create types/message.ts
[ ] Create types/map.ts
[ ] Create types/api.ts
[ ] Create types/common.ts
[ ] Create types/index.ts (re-exports)
[ ] Update all imports across codebase
[ ] Delete old types/index.ts
[ ] Verify no broken imports with build
```

### Route Groups Migration

```
[ ] Create app/(auth)/ and move auth pages
[ ] Create app/(marketing)/ and move marketing pages
[ ] Create app/(dashboard)/ and move dashboard pages
[ ] Create app/(admin)/ and move admin pages
[ ] Create shared layouts for each group
[ ] Update navigation links if routes changed
[ ] Test all routes after migration
[ ] Update middleware.ts if needed
```

### Component Organization

```
[ ] Add components/ui/index.ts (barrel)
[ ] Add components/layout/index.ts (barrel)
[ ] Add components/navigation/index.ts (barrel)
[ ] Add components/map/index.ts (barrel)
[ ] Add components/cards/index.ts (barrel)
[ ] Add components/access/index.ts (barrel)
[ ] Add components/providers/index.ts (barrel)
[ ] Create components/features/hiring/ with index.ts
[ ] Create components/features/work/ with index.ts
[ ] Create components/features/onboarding/ with index.ts
[ ] Create components/features/messaging/ with index.ts
[ ] Move MarketingFooter/Layout to components/layout/
[ ] Move UniversalNav to components/navigation/
[ ] Update all component imports
[ ] Delete top-level component files
```

---

## 6. Testing & Validation

After each phase, verify:

1. **Build succeeds:** `npm run build` or `yarn build`
2. **No type errors:** `tsc --noEmit`
3. **ESLint passes:** `eslint src/`
4. **All routes accessible:** Test each route group manually
5. **Store state works:** Verify Zustand stores in browser devtools
6. **Auth flows work:** Test login, logout, role-based redirects
7. **No console errors:** Check browser console for warnings/errors

---

## 7. Technical Debt & Future Work

### Future Improvements (Beyond This Phase)

1. **Unit Tests:** No unit tests exist. Add Jest + React Testing Library for components and utilities.
2. **Integration Tests:** Expand Playwright tests beyond E2E; add API integration tests.
3. **Performance Audit:** Check code splitting, bundle size, Core Web Vitals.
4. **API Standardization:** Verify all 15 API routes follow consistent patterns (error handling, validation, authorization).
5. **Database Schema Review:** Verify Prisma schema aligns with current data needs (migrations, relationships).
6. **Error Handling:** Standardize error handling patterns across components and API routes.
7. **Logging:** Add structured logging (e.g., Winston, Pino) for debugging production issues.
8. **Configuration Management:** Move env vars, API endpoints to config/ folder.
9. **Documentation:** Add JSDoc comments to complex functions and components.
10. **Storybook:** Add Storybook for component documentation (optional but useful for larger teams).

---

## 8. Success Criteria

After completing Phase 1-3, the codebase should have:

- ✅ **Type Safety:** Strict TypeScript mode enabled, no `any` types
- ✅ **Organization:** Clear separation of concerns (components, stores, types, lib, data)
- ✅ **Scalability:** New pages/features can be added quickly without confusion
- ✅ **Maintainability:** Easier to find and modify specific code sections
- ✅ **DX:** Consistent import patterns, barrel exports, clear file organization
- ✅ **Security:** Server-side auth redirects via middleware, no flashing of protected content
- ✅ **Performance:** No degradation in build time or bundle size
- ✅ **Testing:** Existing tests pass, no regressions

---

## 9. References & Best Practices

### Next.js 14 Documentation
- [Next.js App Router](https://nextjs.org/docs/app)
- [Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

### State Management (Zustand)
- [Zustand Best Practices](https://github.com/pmndrs/zustand)
- [Slices Pattern](https://github.com/pmndrs/zustand#slices-pattern)

### TypeScript
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Type-Driven Development](https://www.typescriptlang.org/docs/)

### Component Architecture
- [Bulletproof React](https://github.com/alan2207/bulletproof-react) — Reference architecture for React
- [Component Composition](https://www.patterns.dev/posts/compound-pattern/)

---

**Document Version:** 1.0
**Last Updated:** February 2026
**Status:** ACTIVE — Ready for implementation
**Owner:** Engineering Team
**Reviewers:** TBD

---

## Appendix A: Common Questions

### Q: Why split stores instead of using a single store?
**A:** Separation of concerns makes debugging easier, reduces bundle size impact, and improves code navigation. Individual stores are easier to test and maintain than one mega-file.

### Q: Will route groups break existing URLs?
**A:** No. Route groups don't affect the public URL structure. `/sign-in` stays `/sign-in` even if it's in `(auth)/sign-in/`.

### Q: Do we need both React Context and Zustand?
**A:** Generally no. Consolidate to Zustand for global state and React Context only for provider-level concerns (theme, locale). Current duplicate state is technical debt.

### Q: Should we migrate to Client Components or keep Server Components?
**A:** Current architecture with client components + Zustand is fine. Consider Server Components for data-fetching pages (e.g., job feeds) in future phases.

### Q: How long will refactoring take?
**A:** 4-6 sprints total (1-2 weeks per sprint). Prioritize Phase 1 (critical) and Phase 2 (high-value). Phase 3-4 can be done incrementally.

### Q: Should we add E2E tests for each route group?
**A:** Yes. Playwright tests should cover each route group's main flows (auth group → login/register, dashboard group → navigation, etc.).

---

## Appendix B: File Splitting Examples

### Example: Splitting store/index.ts → store/auth.ts

**Before:**
```typescript
// store/index.ts (570+ lines)
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, role: user.role }),
  logout: () => set({ user: null, role: null, isAuthenticated: false }),
}))

export const useJobStore = create<JobState>((set) => ({
  jobs: [],
  selectedJob: null,
  // ... 50+ lines of job state
}))
// ... 8 more stores
```

**After:**
```typescript
// store/auth.ts
import { create } from 'zustand'
import { AuthState } from '@/types'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, role: user.role }),
  logout: () => set({ user: null, role: null, isAuthenticated: false }),
}))
```

```typescript
// store/index.ts
export { useAuthStore } from './auth'
export { useJobStore } from './jobs'
export { useMapStore } from './map'
// ... re-export all stores
```

### Example: Splitting types/index.ts → types/user.ts

**Before:**
```typescript
// types/index.ts (40+ types)
export type User = {
  id: string
  email: string
  role: 'hirer' | 'worker'
  // ... 20+ fields
}

export type Job = {
  id: string
  title: string
  // ... 15+ fields
}
// ... 38 more type definitions
```

**After:**
```typescript
// types/user.ts
export type User = {
  id: string
  email: string
  role: 'hirer' | 'worker'
  // ... fields
}

export type UserProfile = {
  userId: string
  // ... profile fields
}
```

```typescript
// types/job.ts
export type Job = {
  id: string
  title: string
  // ... fields
}
```

```typescript
// types/index.ts
export * from './user'
export * from './job'
export * from './bid'
export * from './message'
export * from './map'
export * from './api'
export * from './common'
```

---

**END OF DOCUMENT**
