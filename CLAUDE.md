# CLAUDE.md — CrewLink Project Rules & Strict Guidelines

CrewLink is a premium gig economy platform connecting hirers with verified workers for local services (cleaning, moving, handyman, yard work, etc.). This document establishes non-negotiable rules, quality standards, and context injection protocols for all Claude interactions.

---

## PROJECT CONTEXT INJECTION

**Pre-filled context for every CrewLink task:**

### Framework & Language
- **Next.js 14** (App Router with `/src/app` directory)
- **TypeScript** (strict mode: `"strict": true` in tsconfig.json)
- **React 18+** with Server Components where possible

### Database & ORM
- **PostgreSQL** via Prisma (schema in `prisma/schema.prisma`)
- **Models:** User, Account, Session, VerificationToken, WorkerProfile, HirerProfile, Job, Bid, Booking, Review, Message, ThreadParticipant, Notification, PaymentRecord
- **User scoping:** ALL database queries must filter by authenticated user via Prisma where clauses

### Authentication & Authorization
- **NextAuth.js v4** with PrismaAdapter
- **Credentials provider:** email/password with bcrypt hashing
- **Two roles:** `HIRER` and `WORKER` (enum in User model)
- **Route protection:** RoleGuard component in `/src/components/access/RoleGuard.tsx`
- **Session:** via useAuthStore in client, session() function in server

### State Management
- **Zustand** stores in `/src/store/index.ts`:
  - `useAuthStore` (includes mock user for dev mode)
  - `useAppModeStore` ('hire' or 'work')
  - `useMapStore` (viewport, geolocation, search, city filter, job selection)
  - `useJobsStore` (job listings, filtering, pagination)
  - `useMessagesStore` (conversation threads, real-time message feel)
  - `useNotificationsStore` (unread counts, toast notifications)
  - `useOnboardingStore` (worker onboarding flow state)
  - `useJobFormStore` (hirer job posting form state)
  - `useUIStore` (modals, sidebars, theme, accessibility)

### UI & Styling
- **Tailwind CSS** with custom brand tokens in `tailwind.config.ts`:
  - Brand colors: `brand-*` (blues: 50–950)
  - Accent colors: `accent-*` (oranges: 50–950)
  - Success colors: `success-*` (greens: 50–950)
  - Slate neutrals: `slate-*` (grays: 50–950)
- **Font:** Inter (Google Fonts via next/font)
- **Custom shadows:** soft, medium, heavy, glow (in `src/design/tokens.ts`)
- **30+ animations:** fade, slide, bounce, pulse, glow, zoom (via Tailwind @keyframes)
- **Component library:** Button, Input, Modal, Card, Dropdown, Toast, GlassPanel, LiveDot, AddressAutocomplete, BudgetDropdown, CategoryDropdown

### Maps & Geolocation
- **Mapbox GL** (primary) + **Leaflet** (fallback)
  - Mapbox config in `src/config/mapbox.ts` (public token)
  - Leaflet OSM tiles in `src/config/leaflet.ts`
  - Dual provider abstraction: MapboxMap, LeafletMap, VirtualMap components
- **Geolocation API:** via GeolocationModal component, with permission handling
- **Use cases:**
  - Hirer: post job location, see worker locations (anonymized)
  - Worker: browse jobs by location, set service radius, see job map pins
- **Performance:** Tile clustering, viewport-based queries, lazy-loaded pins

### Validation
- **Zod** schemas in `/src/lib/validations/` for:
  - Auth (login, register, password reset)
  - Jobs (create, update, filter)
  - Bids (create, accept, cancel)
  - Reviews (create, rate)
  - Profile (update worker/hirer details)
  - Messages (create, edit)

### Testing & QA
- **Playwright** suite in `/tests/` with E2E, QA, visual, and performance tests
- **5 QA agents:** QA Sentinel, UI Enforcer, Performance, Security, Copy Polish
- **Test scenarios:**
  - Critical paths (sign-up, post job, submit bid, message, mark complete)
  - Role-specific flows (hiring dashboard vs. worker dashboard)
  - Geolocation & map interactions
  - Real-time message delivery
  - Payment/payout flows

### Hosting & Deployment
- **Vercel** (production: crewlink.com, preview per PR)
- **Environment variables:** `.env.local` (dev), `.env.production` (prod)
- **Secrets:** DB_URL, NEXTAUTH_SECRET, MAPBOX_PUBLIC_TOKEN, STRIPE_KEY, TWILIO_TOKEN, etc.

### Additional Libraries
- **Framer Motion:** page transitions, card animations, gesture interactions
- **Lucide React:** icons (map-pin, briefcase, message-circle, star, etc.)
- **react-hot-toast:** non-blocking notifications
- **No AI integration currently** (future feature)

---

## TRIGGER MAP: CrewLink-Specific Prompts

**Use these exact keywords to auto-load CrewLink expertise:**

### Maps & Geolocation
- **`audit the map`** → Load full map performance review, geolocation permission flows, tile clustering, viewport queries, dual provider fallback testing
- **`fix map performance`** → Optimize viewport-based job queries, reduce pin re-renders, analyze Mapbox/Leaflet bundle size, check tile load times
- **`geolocation issue`** → Review GeolocationModal component, permission handling, fallback to manual address input, browser permission prompts

### Hiring & Job Management
- **`fix the hiring flow`** → Review HiringNav, job posting form (JobFormStore), job cards (JobPostListCard), bid management, payment workflow
- **`audit job posting`** → Check Zod validation for job creation, budget/category dropdown logic, location autocomplete, images/attachments, real-time preview
- **`fix bid system`** → Review Bid model, bid acceptance/rejection, real-time bid notification push, worker profile preview, review ratings

### Worker & Job Discovery
- **`fix the worker flow`** → Review WorkerNav, job map browsing (useMapStore), search filters, job detail card (JobListCard), bid submission, earnings tracking
- **`optimize job search`** → Analyze job filtering (category, budget, distance, rating), pagination, search performance, favorite jobs, apply notifications
- **`audit worker profile`** → Check WorkerProfile model, verification status, review ratings, portfolio/images, availability, service radius

### Messaging & Real-Time
- **`fix messaging`** → Review Message model, conversation threading (ThreadParticipant), real-time delivery, unread counts, notification badges, message encryption
- **`audit notifications`** → Check Notification model, real-time push delivery, badge counts, user preferences, muting conversations, notification types

### Auth & Security
- **`fix authentication`** → Review NextAuth config, PrismaAdapter, password reset flow, email verification, magic link (if added), role assignment
- **`audit security`** → Check SQL injection prevention (Prisma), XSS in user-generated content, CSRF tokens, rate limiting, API endpoint auth guards
- **`audit data access`** → Verify all queries are user-scoped, worker personal data not exposed to hirers, payment info never shown in API responses

### Database & Prisma
- **`audit database schema`** → Review Prisma models, relationships, indexes, user scoping via where clauses, soft deletes, audit logging
- **`optimize queries`** → Check N+1 queries, missing indexes, Prisma select/include optimization, pagination cursor vs. offset
- **`fix database issue`** → Review migration, connection pooling, transaction handling, seed data for dev

### UI & Design
- **`fix UI consistency`** → Audit component usage, Tailwind token application, brand color usage, spacing/padding rhythm, typography hierarchy
- **`audit accessibility`** → Check WCAG 2.1 AA compliance, ARIA labels, keyboard navigation, color contrast, focus management, screen reader testing
- **`fix design tokens`** → Review `src/design/tokens.ts` and `tailwind.config.ts`, custom shadows, animation timings, breakpoints, z-index stacking

### Performance & Bundle
- **`audit performance`** → Check Lighthouse scores, Next.js Image optimization, code splitting, dead code, bundle size, Core Web Vitals
- **`optimize bundle`** → Analyze vendor libs (Mapbox, Leaflet, Zustand, Framer Motion), dynamic imports, tree-shaking, minification
- **`fix slow page`** → Profile with DevTools, identify CPU/memory issues, check database query performance, analyze waterfall chart

### Deployment & DevOps
- **`audit deployment`** → Check Vercel config, environment variables, CI/CD pipeline, preview deployments, secrets management
- **`fix deploy issue`** → Review build logs, env var validation, database migration on Vercel, Nextauth callback URLs

---

## CrewLink-Specific DO/DON'T Rules

### Database & User Scoping (CRITICAL)
- **DO** filter all database queries by authenticated user via Prisma where clauses
  - Example: `prisma.job.findMany({ where: { hirerProfileId: session.user.hirerId } })`
  - Example: `prisma.bid.findMany({ where: { workerId: session.user.workerId } })`
- **DO NOT** return all jobs, all users, or unscoped data in API responses
- **DO** use Prisma `select` to exclude sensitive fields (passwords, payment tokens, personal addresses)
- **DO NOT** expose worker personal data (full address, phone, social security) to hirers beyond matched job context

### Data Access & Privacy
- **DO** verify user role and ID before returning any data in API endpoints
- **DO** check that Booking.workerId matches session.user.workerId before returning worker details to hirer
- **DO NOT** return worker location data to hirer except after a bid is accepted (Booking created)
- **DO** anonymize or redact worker names/addresses from public job listings
- **DO NOT** log or cache sensitive user data (passwords, payment info, tokens)

### Maps & Geolocation
- **DO** validate geolocation before storing in database (±coordinate precision)
- **DO NOT** hardcode map coordinates; always allow user input or geolocation API
- **DO** handle geolocation permission denial gracefully with manual address input fallback
- **DO** store only job location for map display; keep worker home address private
- **DO** use Mapbox GL for production map (Leaflet as fallback only)
- **DO NOT** expose user geolocation to other users without explicit consent/booking
- **DO** debounce viewport change events to limit API calls

### Real-Time & Messaging
- **DO** ensure message delivery has optimistic UI (send, then confirm)
- **DO** show real-time unread badge counts without page refresh
- **DO** limit message queries to authenticated user's conversations only
- **DO NOT** send messages to arbitrary users; only thread participants
- **DO** validate message content (XSS prevention via sanitize)
- **DO NOT** store plain-text payment details in messages

### Authentication & Sessions
- **DO** use NextAuth.js session() function to get current user in server routes
- **DO** check role-based access in RoleGuard component before rendering protected pages
- **DO** expire sessions and force re-login after password reset
- **DO NOT** store passwords in user state (Zustand); only use NextAuth session
- **DO** use bcrypt hashing for password storage (NextAuth handles this)
- **DO NOT** allow mock dev user in production

### UI & Role-Based Rendering
- **DO** use `useAppModeStore()` to switch UI between hire/work modes
- **DO** show different navigation (HiringNav vs. WorkerNav) based on user role
- **DO** restrict routes via RoleGuard (`<RoleGuard requiredRole="HIRER">`)
- **DO NOT** render hiring dashboard features to workers or vice versa
- **DO** always show role indicator in header or navigation
- **DO NOT** allow single-account users to switch roles mid-session without re-auth

### Job Posting & Bid Management
- **DO** validate job budget via Zod (min/max constraints)
- **DO** require job location before posting (address + map pin)
- **DO** check hirerProfileId matches session.user.hirerId before updating job
- **DO NOT** allow editing job after first bid submitted
- **DO** show real-time bid count updates without refresh
- **DO NOT** expose other bids to a worker; only their own
- **DO** auto-expire old bids (>30 days) or allow hirer to cancel
- **DO** require review submission after job completion (Booking.status = 'COMPLETED')

### Payments & Payouts (High Risk)
- **DO** treat all payment operations as explicitly scoped to session.user
- **DO** never store unencrypted credit card data (use Stripe/payment processor)
- **DO** validate payout method before processing withdrawal
- **DO NOT** expose payment/payout details in public API responses
- **DO** log all financial transactions for audit trail
- **DO** require 2FA for payout method changes (future feature)
- **DO NOT** hardcode payment processing; always go through Stripe/authorized processor

### Image & File Uploads
- **DO** validate file type (whitelist: jpg, png, pdf for profiles/reviews)
- **DO** store uploads in Vercel Blob or S3 with user-scoped folder structure
- **DO NOT** allow arbitrary file execution or script uploads
- **DO** scan uploads for malware (if integrated)
- **DO** set expiration on temporary/draft images (e.g., job post drafts)

### Performance & Load
- **DO** paginate job lists (cursor-based preferred; offset-based acceptable)
- **DO** lazy-load job card images via Next.js Image component
- **DO** debounce search input to avoid excessive API calls
- **DO** cache read-only data (job categories, cities) in Zustand or browser cache
- **DO NOT** fetch entire user profile on every page load; use selective queries
- **DO** profile and optimize slow API endpoints (>500ms)

### Error Handling & Logging
- **DO** return descriptive error messages in JSON (`{ error: "Job not found" }`)
- **DO** log errors server-side with user ID for debugging (never expose stack traces to client)
- **DO** show user-friendly error toasts via react-hot-toast
- **DO NOT** log sensitive data (passwords, payment info, tokens)
- **DO** distinguish between 400 (client error), 403 (forbidden), 404 (not found), 500 (server error)

### Testing & QA
- **DO** write Playwright tests for critical paths (sign-up, post job, submit bid, message)
- **DO** test role-based route protection (worker can't access /hiring/*)
- **DO** test geolocation permission flows and fallbacks
- **DO** test real-time message delivery and notification badges
- **DO** run QA agents before marking PR as ready (QA Sentinel, UI Enforcer, Security)
- **DO NOT** merge PRs with failing Playwright tests or QA agent warnings

### Code Style & Patterns
- **DO** use TypeScript strict mode; no `any` types
- **DO** use server components for data fetching where possible (Next.js 14 best practice)
- **DO** name Zustand stores with `use` prefix: `useAuthStore`, `useMapStore`, etc.
- **DO** use Zod for runtime validation of API inputs
- **DO** use Lucide React icons; avoid Font Awesome or other icon libs
- **DO NOT** use `eval()` or `new Function()` for dynamic code execution
- **DO** prefer named exports over default exports for components

---

## CrewLink Quality Bar (Non-Negotiable)

### Map Performance
- [ ] Map initial load: < 3 seconds (Mapbox GL)
- [ ] Pan/zoom smooth: 60 FPS (no jank)
- [ ] Job pin rendering: < 5 seconds for 500+ pins (clustering enabled)
- [ ] Viewport query API call: debounced, < 1 second round-trip
- [ ] Fallback to Leaflet: functional, no data loss if Mapbox fails
- [ ] Geolocation request: shown, with clear permission prompt + manual fallback

### Geolocation & Location Features
- [ ] GeolocationModal: permission denied handling (show fallback address input)
- [ ] Manual address input: AddressAutocomplete functional, shows suggestions
- [ ] Job location validation: coordinates within valid bounds (±180° longitude, ±90° latitude)
- [ ] Worker service radius: set and enforced on job search (Mapbox distance filter)
- [ ] Location privacy: worker location hidden from hirer until Booking accepted

### Role-Based Route Protection
- [ ] `/hiring/*` routes: return 403 if user role !== HIRER
- [ ] `/work/*` routes: return 403 if user role !== WORKER
- [ ] `/api/jobs/create`: verify hirerProfileId matches session.user.hirerId
- [ ] `/api/bids` endpoints: verify workerId matches session.user.workerId
- [ ] RoleGuard component: blocks unauthorized renders before hydration

### Job Bid Real-Time Feel
- [ ] Submit bid: optimistic UI update (pending state) before server response
- [ ] Bid notification: appears in NotificationsStore < 1 second after acceptance
- [ ] Bid count badge: updates without full page refresh
- [ ] Bid list: polling refresh every 10s or WebSocket push (if implemented)
- [ ] Hirer bid review: see bid details, worker avatar, rating, without exposing personal data

### Authentication & Session
- [ ] Sign-in/sign-up: flow complete in < 3 screens (email, password, role selection)
- [ ] Session persistence: user stays logged in across page refresh (NextAuth session)
- [ ] Password reset: email with reset link, new password set, session invalidated
- [ ] Mock dev user: available in dev mode only (useAuthStore), not in production
- [ ] Role switching: if allowed, triggers re-auth or dual-session flow (TBD)

### Messaging & Notifications
- [ ] Message send: optimistic update, spinner until confirmed
- [ ] Unread badge: real-time count in header/navigation
- [ ] Conversation list: sorted by last message time, unread marked distinctly
- [ ] Message threading: grouped by conversation, no orphaned messages
- [ ] Notification toast: appears top-right, auto-dismisses in 4s, no spam

### Data Access & Privacy
- [ ] All API responses: filtered to authenticated user (where clause in Prisma)
- [ ] Worker data: full address, phone, SSN never in API response
- [ ] Hirer data: payment method never in API response to workers
- [ ] Job query: includes hirerProfileId = session.user.hirerId where applicable
- [ ] Bid query: includes workerId = session.user.workerId where applicable
- [ ] Audit log: all sensitive actions (bid accept, payout request, review) logged with user ID

### UI/UX & Accessibility
- [ ] Tailwind tokens: brand-*, accent-*, success-*, slate-* used consistently
- [ ] Custom shadows: shadow-soft, shadow-medium, shadow-heavy on cards/modals
- [ ] Animations: fade, slide, bounce used for transitions (Framer Motion)
- [ ] Icons: Lucide React only, no custom icon libs
- [ ] WCAG 2.1 AA: color contrast ≥ 4.5:1, keyboard nav, ARIA labels
- [ ] Loading states: spinners or skeleton screens visible, not silent hangs
- [ ] Error messages: user-friendly, not stack traces, actionable hints

### Database & Queries
- [ ] All User-scoped queries: WHERE clause filters by authenticated user ID
- [ ] Prisma select: excludes password hashes, payment tokens, sensitive fields
- [ ] N+1 prevention: use include/select to batch related data
- [ ] Pagination: cursor-based (preferred) or offset-based with max page size
- [ ] Index coverage: created on foreign keys, frequently-filtered columns
- [ ] Soft deletes: if used, filtered out of queries by default

### Performance & Bundle
- [ ] Lighthouse: Desktop ≥ 90, Mobile ≥ 80
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Bundle size: Next.js bundle < 200KB (gzipped)
- [ ] Image optimization: Next.js Image component, lazy loading, srcset
- [ ] Code splitting: Mapbox, Leaflet, Framer Motion lazy-loaded
- [ ] Dead code: unused imports, Zustand stores removed

### Testing Coverage
- [ ] E2E tests: sign-up, post job, submit bid, message, mark complete (Playwright)
- [ ] Route protection: 403 if unauthorized role accesses protected route
- [ ] Geolocation: permission granted/denied flows tested
- [ ] Real-time: message delivery, notification badges verified
- [ ] Visual: GlassPanel, JobPostListCard, WorkerListCard rendered correctly
- [ ] Performance: Lighthouse profile, map load time < 3s, job search < 500ms
- [ ] QA agents: all 5 agents pass (QA Sentinel, UI Enforcer, Security, Performance, Copy Polish)

---

## File Structure Quick Reference

```
/src
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Auth routes (sign-in, create-account, forgot-password, select-role)
│   ├── (marketing)/              # Public routes (/, /about, /how-it-works, /pricing, /safety, /team/*, etc.)
│   ├── hiring/                   # Hirer dashboard (/hiring/*, /hiring/map, /hiring/jobs, /hiring/post, etc.)
│   ├── work/                     # Worker dashboard (/work/*, /work/map, /work/jobs, /work/messages, etc.)
│   ├── api/                      # API routes (/api/auth/*, /api/jobs/*, /api/bids/*, /api/conversations/*, etc.)
│   └── layout.tsx                # Root layout with SessionProvider
├── components/
│   ├── ui/                       # Button, Input, Modal, Card, Dropdown, Toast, etc.
│   ├── map/                      # MapboxMap, LeafletMap, VirtualMap, MapStates
│   ├── nav/                      # HiringNav, WorkerNav, UniversalNav, NavConceptA/B/C
│   ├── cards/                    # JobListCard, JobPostListCard, WorkerListCard
│   ├── layout/                   # Header, MarketingLayout, MarketingFooter, MapSidebarShell
│   ├── access/                   # RoleGuard, RestrictedAccess
│   ├── providers/                # SessionProvider
│   ├── modals/                   # GeolocationModal, AddressAutocomplete
│   └── background/               # AmbientBackground
├── lib/
│   ├── validations/              # Zod schemas (auth, jobs, bids, reviews, profile, messages)
│   ├── auth.ts                   # NextAuth config, PrismaAdapter, session helpers
│   ├── prisma.ts                 # Prisma client singleton
│   └── utils.ts                  # Helper functions (date format, currency, etc.)
├── store/
│   └── index.ts                  # Zustand stores (AuthStore, AppModeStore, MapStore, JobsStore, MessagesStore, NotificationsStore, OnboardingStore, JobFormStore, UIStore)
├── design/
│   └── tokens.ts                 # Design system (colors, shadows, animations, typography)
├── config/
│   ├── mapbox.ts                 # Mapbox GL config (public token)
│   └── leaflet.ts                # Leaflet config (OSM tiles)
└── types/
    └── index.ts                  # TypeScript interfaces (User, Job, Bid, Message, etc.)

/prisma
├── schema.prisma                 # Prisma models (User, Job, Bid, Booking, Review, Message, etc.)
└── migrations/                   # Database migrations

/tests
├── e2e/                          # Playwright E2E tests (critical paths)
├── qa/                           # QA tests (role guards, geolocation, real-time, etc.)
├── visual/                       # Visual regression tests (components, modals)
├── performance/                  # Performance tests (Lighthouse, bundle size, map load)
└── fixtures/                     # Test data (users, jobs, bids)

/.env.local                       # Dev environment variables
/.env.production                  # Production environment variables
/tailwind.config.ts               # Tailwind + brand tokens
/next.config.js                   # Next.js config (Image optimization, etc.)
/tsconfig.json                    # TypeScript config (strict mode)
```

---

## Critical Checklist Before Submitting Code

- [ ] **TypeScript strict mode:** No `any` types, all functions typed
- [ ] **User scoping:** All database queries filtered by authenticated user
- [ ] **Role guards:** Routes protected via RoleGuard component or API endpoint auth check
- [ ] **Sensitive data:** No passwords, payment info, tokens in API responses
- [ ] **Geolocation:** Permission handling, fallback to manual input, no hardcoded coordinates
- [ ] **Real-time feel:** Optimistic UI, no silent loading, notification badges update
- [ ] **Error handling:** User-friendly messages, no stack traces to client, server-side logging
- [ ] **Testing:** Playwright tests written for critical paths, QA agents pass
- [ ] **Accessibility:** WCAG 2.1 AA (color contrast, keyboard nav, ARIA labels)
- [ ] **Performance:** Map < 3s load, job search < 500ms, bundle size < 200KB
- [ ] **Zod validation:** All API inputs validated, clear error messages
- [ ] **Prisma best practices:** No N+1 queries, select/include for optimization, indexes created
- [ ] **Zustand patterns:** Stores named with `use` prefix, immutable updates
- [ ] **Tailwind tokens:** Brand colors, custom shadows, animations used consistently
- [ ] **Code review:** No console.logs, dead code removed, DRY principles followed

---

## Quick Links & Reference

- **NextAuth.js docs:** https://next-auth.js.org
- **Prisma docs:** https://www.prisma.io/docs/
- **Zustand docs:** https://github.com/pmndrs/zustand
- **Tailwind CSS:** https://tailwindcss.com
- **Mapbox GL JS:** https://docs.mapbox.com/mapbox-gl-js/
- **Leaflet docs:** https://leafletjs.com
- **Framer Motion:** https://www.framer.com/motion/
- **Zod:** https://zod.dev
- **Playwright:** https://playwright.dev
- **Lucide React:** https://lucide.dev

---

**Last Updated:** 2026-02-27
**Maintained by:** CrewLink Dev Team
