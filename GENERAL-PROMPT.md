# CrewLink Development Prompt Guide

This guide helps you write effective prompts for Claude to work on CrewLink. It explains the codebase structure, how to make requests, what quality looks like, and common patterns.

---

## About CrewLink

CrewLink is a premium gig economy platform connecting hirers with verified workers for local services:
- **Services:** Cleaning, moving, handyman, yard work, assembly, painting, events, tech support, pet care, errands
- **Users:** Hirers (post jobs at `/hiring/*`) and Workers (find jobs at `/work/*`)
- **Architecture:** Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand state, Prisma/PostgreSQL, NextAuth.js

### Key Tech Decisions
- **Map-centric:** Jobs discovered via Mapbox GL + Leaflet integration
- **Dual dashboards:** Role-aware UI that changes between `/hiring` and `/work` routes
- **Monolithic store:** Zustand mega-store at `src/store/index.ts` (consider splitting for future)
- **Design tokens:** All colors/spacing defined in `src/design/tokens.ts` (no magic values)
- **Testing:** Playwright E2E + QA agents that verify clicks, visuals, performance, security, copy

---

## How to Ask for Things

### Stage 1: Vague Request (What NOT to do)

❌ "Make the job posting better"
❌ "Fix the map"
❌ "Improve the dashboard"

### Stage 2: Specific Area (Better)

✓ "Add job category filters to the worker dashboard map sidebar"
✓ "Fix the role switching bug when transitioning from `/hiring` to `/work`"
✓ "Optimize Mapbox tile loading when zooming on job clusters"

### Stage 3: Context About Users & Impact (Even Better)

✓ "Add job category filters to the worker dashboard map sidebar so workers can search for only 'cleaning' jobs without scrolling through plumbing results"
✓ "Fix the role switching bug when transitioning from `/hiring` to `/work` – currently the UniversalNav doesn't update its active state, confusing users"
✓ "Optimize Mapbox tile loading when zooming on job clusters – currently it takes 2+ seconds and blocks the browser"

### Stage 4: Complete Request with Implementation Details (Best)

✓ "Add a job search bar to the map sidebar in `/work/dashboard` with: debounced input (300ms delay), category/budget/distance filters, live map marker updates, mobile bottom sheet integration, URL param sync (?q=painting&category=interior&budget=500), aria-live announcements for job count, and design tokens from `src/design/tokens.ts`"

✓ "Audit the UniversalNav, HiringNav, and WorkerNav components for: role-aware active states, correct routing between `/hiring/dashboard` and `/work/dashboard`, responsive behavior (mobile hamburger → desktop full nav), notification badge count from `useNotificationsStore()`, unread message count, proper aria-labels on all icon buttons, and correct z-index layering with Mapbox GL"

✓ "Create a `/hiring/contact` page with a form collecting job category, budget, description, and contact info. Store via new `POST /api/hiring/contact` endpoint using Prisma `Contact` model. Add RoleGuard to block non-hirers. Email to admin on submit. Redirect to success page with share-to-social options."

---

## Common Request Types & What to Expand

When you make a request, I'll ask clarifying questions in these categories:

### "Add [Feature]" Requests

**I'll ask:**
- "Should this be hirer-only, worker-only, or both?"
- "Where in the dashboard does this go? (`/hiring/*` or `/work/*`?)"
- "Does it need map integration?"
- "What Zustand store(s) does it touch? (job state, user state, notifications?)"
- "Does it need a new API route? What Prisma models?"

**Example expansion:**
- "Add real-time job notifications"
→ Is this in-app toast, email, or push? Does a worker get notified when a new job matches their preferences? Does a hirer get notified when a worker bids? Does it query `useNotificationsStore()` or create a new store? Does it need a `POST /api/notifications/subscribe` endpoint?

### "Fix [Thing]" Requests

**I'll ask:**
- "Is this hirer-side or worker-side?"
- "Does it affect map rendering, API routes, Zustand hydration, or NextAuth session?"
- "Exact steps to reproduce?"
- "Does it happen in production or only in dev?"

**Example expansion:**
- "Fix the login flow"
→ Is it a NextAuth session issue? Is the Prisma user lookup failing? Are we redirecting to the wrong dashboard after login? Is the role not being set? Is there a hydration mismatch between server/client?

### "Improve/Refactor [Thing]" Requests

**I'll ask:**
- "Is this for performance, maintainability, or user experience?"
- "Does this touch the mega-store? Should we split `src/store/index.ts`?"
- "Does it affect map performance?"
- "Are there TypeScript improvements needed?"

**Example expansion:**
- "Refactor the job listing component"
→ Does it need memoization (React.memo) to prevent re-renders? Should we split `useJobStore` into separate concerns? Does pagination need cursor-based optimization? Should we lazy-load card images? Does the filter UI need debouncing?

### "Build [Page/Component]" Requests

**I'll ask:**
- "Which dashboard? (`/hiring` or `/work`?)"
- "Does it need a new API route?"
- "What Prisma models? Any queries or mutations?"
- "Does it need role protection via RoleGuard?"
- "Responsive? Mobile-first or desktop-first?"

**Example expansion:**
- "Build a worker profile page"
→ Is this `/work/profile` or `/work/profile/[id]`? Does it query Prisma for User + Skills + Reviews? Does it need edit mode for the logged-in worker? Does it show a "Hire" CTA for hirers viewing another worker's profile? Does it need role-based visibility (hide email from public)? Is there a photo gallery with Cloudinary integration?

---

## Vague Prompt Handling

If you say something vague like "make it better" or "it's broken," I'll scan for these common issues:

### "Make it better" → I'll check for:
- Broken map interactions (pan/zoom freezing, markers not clickable)
- Missing loading states on job cards (skeleton screens during API calls)
- Bid submission flow issues (form validation, success feedback, error handling)
- Role switching bugs (session persistence when toggling `/hiring` ↔ `/work`)
- Notification delivery (real-time vs. polling, missed alerts)
- Slow Mapbox tile loading (check network tab, Mapbox plan limits)

### "It's broken" → I'll verify:
- NextAuth session validity (`useSession()` returns null?)
- Prisma connection (`DATABASE_URL` set? migrations run?)
- Mapbox token (`NEXT_PUBLIC_MAPBOX_TOKEN` in `.env.local`?)
- Role context (`UserRoleContext` provider wrapping page?)
- Zustand hydration (`useStore((state) => ...)` inside ClientComponent?)
- API route handlers returning correct status codes
- RoleGuard blocking unauthenticated access

---

## Code Quality: The Multiplier Table

### ❌ Minimum Effort (1x Quality)

**Add button:**
```tsx
<button onClick={handleClick}>Click Me</button>
```

**Fix login:**
```tsx
const { data: session } = useSession()
if (!session) return <div>Not logged in</div>
```

**Make it fast:**
Cut a library, remove a query, strip comments

**Build dashboard:**
Throw components at a page, minimal styling, hard-coded data

### ✓ Expected Quality (3-5x Multiplier)

**Add button:**
```tsx
<button
  data-qa="post-job-button"
  onClick={handleClick}
  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl
    font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  aria-label="Post a new job"
  disabled={isLoading}
>
  {isLoading ? 'Creating...' : 'Post Job'}
</button>
```
- ✓ Design tokens (cyan-500 from theme)
- ✓ Accessibility (aria-label, disabled state)
- ✓ Loading state feedback
- ✓ data-qa attribute for testing
- ✓ TypeScript prop types

**Fix login:**
```tsx
const { data: session, status } = useSession()
const router = useRouter()
const { userRole } = useUserRole()

useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/auth/signin')
  } else if (status === 'authenticated' && userRole === 'hirer') {
    router.push('/hiring/dashboard')
  } else if (status === 'authenticated' && userRole === 'worker') {
    router.push('/work/dashboard')
  }
}, [status, userRole, router])
```
- ✓ NextAuth status checking (not just null)
- ✓ Role-aware redirect
- ✓ useEffect dependencies correct
- ✓ Handles loading state

**Make it fast:**
- ✓ Analyze bundle with `next/bundle-analyzer`
- ✓ Profile with React DevTools (check for re-renders)
- ✓ Add React.memo to expensive components
- ✓ Debounce map interactions (300ms for panning, 500ms for search)
- ✓ Use cursor-based pagination instead of offset
- ✓ Cache Mapbox tile requests
- ✓ Report Lighthouse scores (LCP, FID, CLS)

**Build dashboard:**
- ✓ Role-based layout (different for `/hiring` vs `/work`)
- ✓ Map integration with Mapbox GL
- ✓ Job list with filters (category, budget, distance)
- ✓ Real-time updates from Zustand
- ✓ Error boundaries and loading states
- ✓ Mobile-responsive (hamburger nav, bottom sheet on mobile)
- ✓ Proper TypeScript types for all data
- ✓ Design tokens applied consistently
- ✓ aria-labels and semantic HTML
- ✓ Test coverage (at least QA sentinel click targets)

---

## CrewLink-Specific Patterns

### State Management (Zustand)

All state lives in `src/store/index.ts`. When you request a feature that needs state:

✓ "Add wishlist functionality for workers to save favorite jobs"
→ I'll add to the store:
```typescript
interface Job {
  id: string
  title: string
  // ...
}

interface WishlistState {
  savedJobs: Job[]
  addToWishlist: (job: Job) => void
  removeFromWishlist: (jobId: string) => void
}

export const useJobStore = create<WishlistState>((set) => ({
  savedJobs: [],
  addToWishlist: (job) => set((state) => ({
    savedJobs: [...state.savedJobs, job]
  })),
  removeFromWishlist: (jobId) => set((state) => ({
    savedJobs: state.savedJobs.filter(j => j.id !== jobId)
  }))
}))
```

### API Routes

Put new routes in `/src/app/api/[role]/[resource]/route.ts`:

```
/api/hiring/jobs/route.ts          # POST create job
/api/hiring/jobs/[id]/route.ts     # GET, PATCH, DELETE job
/api/work/jobs/route.ts            # GET search jobs (with filters)
/api/work/bids/route.ts            # POST submit bid
```

### Role Guards

Wrap routes that need role checks:

```tsx
import { RoleGuard } from '@/components/RoleGuard'

export default function HiringDashboard() {
  return (
    <RoleGuard allowedRoles={['hirer']}>
      <HiringContent />
    </RoleGuard>
  )
}
```

### Prisma Models

Common queries are in the Prisma schema. When you need a new feature:

✓ "Track job completion ratings"
→ I'll add to schema.prisma:
```prisma
model Rating {
  id String @id @default(cuid())
  jobId String
  job Job @relation(fields: [jobId], references: [id])
  workerId String
  score Int @db.SmallInt
  comment String?
  createdAt DateTime @default(now())
}
```

Then create the API route and component.

### Mapbox Integration

All map instances use Mapbox GL through Next.js components. When you request map features:

✓ "Show job clusters on the map and expand on zoom"
→ I'll use Mapbox clustering:
```tsx
<MapContainer
  center={[lat, lng]}
  zoom={12}
  markers={jobMarkers}
  clustering={{
    enabled: true,
    maxZoom: 14,
    radius: 50,
  }}
  onMarkerClick={(job) => router.push(`/work/jobs/${job.id}`)}
/>
```

### Responsive Design

CrewLink uses mobile-first Tailwind:
- **Mobile:** Full-width, bottom sheets, hamburger nav
- **Tablet:** 2-column layouts start
- **Desktop:** 3-4 column grids, side navigation

When you request UI:

✓ "Add a job filters panel"
→ I'll build:
```tsx
<div className="hidden lg:block w-80 bg-slate-900 p-6">
  {/* Desktop sidebar */}
</div>

<BottomSheet open={showFilters} className="lg:hidden">
  {/* Mobile bottom sheet */}
</BottomSheet>
```

---

## Before & After Examples

### Example 1: Bad Request → Good Request

**Bad:**
"Add a feature that lets workers browse jobs"

**Good:**
"Add infinite scroll pagination to the `/work/dashboard` job list with: 10 jobs per page, cursor-based pagination via `GET /api/work/jobs?cursor=...`, loading skeleton while fetching, 'Load more' button at bottom, proper error handling if API fails, and updates Zustand job state"

**What I'll implement:**
- Cursor pagination (more efficient than offset)
- Skeleton loading state
- Error boundary with retry
- `data-qa` attributes
- Proper TypeScript types
- Mobile-responsive bottom sheet for filters
- aria-live region announcing new jobs loaded

---

### Example 2: Building a Page

**Request:**
"Build the hirer job creation page"

**What I'll ask:**
- Is this single-step or multi-step wizard? (Budget, category, location, description, photos?)
- Should it auto-save drafts to Zustand?
- Does it geocode the location using Mapbox?
- Does it need image uploads? (Cloudinary integration?)
- Does it post jobs immediately or review first?
- Should hirer see live preview of how workers will see it?

**What I'll deliver:**
```
src/app/hiring/create/page.tsx          # Main page
src/components/hiring/JobForm.tsx       # Form component
src/components/hiring/JobPreview.tsx    # Preview panel
src/app/api/hiring/jobs/route.ts        # POST endpoint
src/types/job.ts                        # Updated Job type
```

With:
- Multi-step form with validation
- Mapbox geolocation integration
- Image upload via Cloudinary
- Zustand draft saving
- Error handling
- Loading states
- Mobile-responsive design
- QA attributes

---

### Example 3: Fixing a Bug

**Request:**
"Workers aren't getting notified when a hirer replies to their bid"

**What I'll investigate:**
1. Check `/api/work/bids/[id]/route.ts` – does PATCH handler emit notification?
2. Check `useNotificationsStore()` – is listener subscribed to new messages?
3. Check WebSocket vs polling – are we checking frequently enough?
4. Check NextAuth session – is worker still authenticated?
5. Check Prisma `Notification` model – is schema correct?
6. Check `/work/notifications` page – does UI query fresh data?

**What I'll provide:**
- Root cause analysis
- Code fix with explanation
- Test case (Playwright) to verify fix
- Performance impact assessment

---

## Commands You Can Use

### Development
```bash
npm run dev              # Start dev server at localhost:3000
npm run build            # Production build
npm run lint             # ESLint check
```

### Database
```bash
npm run db:push          # Push Prisma schema changes
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed with test data
npm run db:studio        # Open Prisma Studio GUI
```

### Testing & QA
```bash
npm run test:qa          # Agent A: click targets, nav flow
npm run test:visual      # Agent B: visual regression
npm run audit:perf       # Agent C: Lighthouse, bundle analysis
npm run audit:security   # Agent D: dependency audit
npm run audit:copy       # Agent E: copy/tone consistency
npm run agents:all       # Run all 5 agents
npm run agents:quick     # Quick check (QA + Security)
```

---

## File Locations Quick Reference

| Type | Location | Example |
|------|----------|---------|
| **Pages (Hirer)** | `src/app/hiring/[page]/page.tsx` | `/hiring/dashboard`, `/hiring/create` |
| **Pages (Worker)** | `src/app/work/[page]/page.tsx` | `/work/dashboard`, `/work/jobs/[id]` |
| **Components** | `src/components/[feature]/` | `JobCard.tsx`, `MapContainer.tsx` |
| **Zustand Store** | `src/store/index.ts` | All state in one file (consider splitting) |
| **API Routes** | `src/app/api/[role]/[resource]/route.ts` | `POST /api/hiring/jobs` |
| **Types** | `src/types/index.ts` | `Job`, `Worker`, `Bid` interfaces |
| **Design Tokens** | `src/design/tokens.ts` | Colors, spacing, typography |
| **Tests** | `tests/[qa|visual|performance]/` | Playwright test files |
| **Database** | `prisma/schema.prisma` | Prisma models and migrations |

---

## Environment Variables Needed

For local development, create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crewlink"

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_public_token"

# NextAuth
NEXTAUTH_SECRET="generate_random_string"
NEXTAUTH_URL="http://localhost:3000"

# Optional: QA Role Toggle
NEXT_PUBLIC_ENABLE_ROLE_TOGGLE="true"
```

---

## Common Mistakes to Avoid

❌ **Magic values in CSS:** Use `src/design/tokens.ts` instead
```tsx
// Bad
className="bg-blue-600 text-white px-12 py-3"

// Good
import { colors, spacing } from '@/design/tokens'
className="bg-cyan-500 text-white px-spacing-lg py-spacing-md"
```

❌ **Forgetting data-qa on new buttons:** QA agent will fail
```tsx
// Bad
<button onClick={handleSubmit}>Submit</button>

// Good
<button data-qa="submit-bid" onClick={handleSubmit}>Submit</button>
```

❌ **Duplicate state (Redux + Zustand):** Use Zustand only
```tsx
// Bad
const [jobs, setJobs] = useState([])  // AND useJobStore()

// Good
const { jobs } = useJobStore()
```

❌ **Not checking role guards:** Pages `/hiring/*` need hirer check, `/work/*` need worker check
```tsx
// Bad
export default function HiringDashboard() {
  return <div>Hirer content</div>  // Anyone can access!
}

// Good
export default function HiringDashboard() {
  return (
    <RoleGuard allowedRoles={['hirer']}>
      <div>Hirer content</div>
    </RoleGuard>
  )
}
```

❌ **Blocking the browser:** No slow API calls in component render
```tsx
// Bad
export default function Page() {
  const data = await fetch('/api/slow')  // Blocks page load
  return <div>{data}</div>
}

// Good
export default function Page() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/slow').then(setData)  // Non-blocking
  }, [])
  return <div>{data}</div>
}
```

---

## Quality Checklist

Before asking me to submit a PR, verify:

- [ ] TypeScript: No `any` types, proper interfaces defined
- [ ] Accessibility: aria-labels, semantic HTML, keyboard navigation
- [ ] Design: Colors from tokens, spacing consistent, mobile-responsive
- [ ] Performance: Images lazy-loaded, debounced search, memoized expensive components
- [ ] Testing: `data-qa` attributes on interactive elements
- [ ] Error handling: Graceful failures, user-friendly error messages
- [ ] Loading states: Skeleton screens or spinners during async
- [ ] Role guards: Pages check `useUserRole()` before rendering sensitive content
- [ ] Database: Prisma models updated, migrations run
- [ ] Copy: Tone matches voice guide, no jargon, action-oriented CTAs

---

## Example: Full Request Template

Use this template for maximum clarity:

```
Feature: [Name]
User Story: "As a [hirer/worker], I want to [goal] so that [outcome]"

Context:
- Part of: [dashboard/feature area]
- Affects: [which roles/pages]
- Dependencies: [related features/models]

Requirements:
- [ ] Show [what] on [where]
- [ ] When [user action], [system behavior]
- [ ] Mobile: [mobile behavior]
- [ ] Error case: [how to handle failures]

API/Database:
- Endpoint: [POST /api/work/jobs or similar]
- Prisma model: [Job, Bid, etc.]
- Fields needed: [list]

Success Criteria:
- [ ] Feature works on desktop/mobile
- [ ] QA agents pass (npm run agents:quick)
- [ ] No performance degradation
- [ ] Matches design tokens
- [ ] Documented in code
```

---

## When to Request Refactoring vs. New Features

**Request refactoring when:**
- Code is duplicated (DRY violation)
- Component is over 300 lines
- Store is doing too much (Zustand mega-store)
- Tests are flaky
- Type safety is weak (`any` types used)
- Performance is degrading

**Request new features when:**
- User story is clear
- Requirements don't require large refactoring
- Dependencies are already in place
- You have time/budget for QA testing

---

## Success = Clarity

The best prompts are **specific + contextual + have acceptance criteria.**

✓ **Good:** "Add password reset flow to `/auth/reset`: email validation via Prisma, reset token expiry 24h, update User model, API route POST `/api/auth/reset`, verify with Playwright test showing email link works, design matches signup form tokens"

✗ **Bad:** "Make password reset work"

The difference? Details about:
- WHERE (route, component, page)
- HOW (API route, Prisma model, flow)
- WHAT SUCCESS LOOKS LIKE (tests pass, no TypeScript errors, design consistent)

Ask for what you need. The more context, the better the result.
