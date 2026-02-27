# 00-MASTER-FULL-AUDIT.md
## CrewLink Gig Economy Platform — Complete System Audit & Technical Specification

**Last Updated:** February 27, 2026
**Project:** CrewLink — Premium gig economy platform (map-centric job discovery, hirer/worker marketplace)
**Scope:** Full-stack Next.js 14 TypeScript application with PostgreSQL backend

---

## 1. EXECUTIVE SUMMARY

CrewLink is a premium gig economy platform built on Next.js 14 with TypeScript, PostgreSQL, and Zustand. The platform connects verified hirers with skilled workers via an intuitive map-centric interface. This audit document serves as the single source of truth for architecture, patterns, and implementation requirements across all 12 development phases.

### Key Project Characteristics
- **Two-role system:** Hirer (`/hiring/*`) and Worker (`/work/*`) with strict role-based access control
- **Map-first UX:** Mapbox/Leaflet integration for job discovery and geolocated search
- **Real-time features:** Messaging, notifications, live bidding on job posts
- **Security-first:** NextAuth.js credentials provider, Prisma ORM with user scoping, protected API routes
- **Enterprise hosting:** Vercel with PostgreSQL (Neon) and Edge Network CDN
- **Design system:** Tailwind CSS with custom brand tokens (brand-*, accent-*, success-*, slate-*)

---

## 2. TECH STACK SPECIFICATION

### 2.1 Core Framework & Language
```
Framework:        Next.js 14 (App Router)
Language:         TypeScript (strict mode)
Node Version:     18+ LTS
Package Manager:  npm or pnpm
```

**Decision Rationale:**
- App Router for modern file-based routing and server components
- TypeScript strict mode enforces type safety across auth, API routes, and component props
- Server components default for SEO and security; client components for interactive dashboards

### 2.2 Rendering Strategy (Hybrid)
```
Marketing Pages (SSR):
  - /                           → Static with ISR (60s revalidation)
  - /about, /how-it-works       → Static with ISR
  - /pricing, /safety, /cities  → Static with ISR
  - /blog                       → ISR with dynamic slug routing
  - /careers, /careers/[slug]   → ISR with slug-based navigation
  - /contact, /privacy, /terms  → Static
  - /help/*, /team/*            → Static with ISR
  - Landing variants A–F        → Static with performance tracking

Dashboard Pages (CSR + Hydration):
  - /hiring (map, jobs, messages, notifications)  → Zustand + client-side hydration
  - /work (map, jobs, messages, earnings)         → Zustand + client-side hydration
  - User settings, profile pages                   → CSR with optimistic updates
```

**Hydration Strategy:**
- Zustand stores initialized on server with `getServerSideProps` equivalent
- React Context (UserRoleContext, AppModeContext) hydrated in layout
- Map state (viewport, filters) restored from localStorage with validation
- Sessions checked via `useSession()` hook (NextAuth.js)

### 2.3 Backend Layer

#### API Routes (Next.js Route Handlers)
```
/api/auth/*                          → NextAuth.js endpoints
/api/jobs/                           → Create, list, get, update job posts
/api/jobs/[id]/bid                   → Submit worker bids
/api/jobs/[id]/accept                → Hirer accepts worker bid
/api/jobs/[id]/reject                → Hirer rejects worker bid
/api/bids/                           → List worker's bids
/api/conversations/                  → Create, list messages
/api/conversations/[conversationId]  → Get conversation thread
/api/notifications                   → Real-time badge counts
/api/profile                         → Get/update user profile
/api/health                          → Service health check
```

**Authentication & Authorization:**
- All routes validate `session` via `getServerSession(authOptions)`
- Every resource query includes `where: { userId: session.user.id }` (Prisma scoping)
- Job endpoints verify `job.userId === session.user.id` before mutations
- Role checks via `session.user.role` (HIRER | WORKER)

#### Database: PostgreSQL via Prisma ORM
```
Host:             Neon (production) or local postgres (dev)
ORM:              Prisma v5+
Connection Pool:  Neon's serverless connection pool
Migrations:       Prisma Migrate (schema.prisma source of truth)
Seed Data:        scripts/seed.ts for dev/staging
```

**Core Tables:**
```
users
  id (UUID primary key)
  email (unique, indexed)
  name, avatarUrl
  role (HIRER | WORKER)
  location (nullable - worker location)
  verified (boolean)
  createdAt, updatedAt

jobs
  id (UUID)
  userId (FK → users, hirer)
  title, description, budget
  category (enum: DELIVERY, TASK, CONSULTING, TRADES, CREATIVE)
  status (OPEN | IN_PROGRESS | COMPLETED | CANCELLED)
  latitude, longitude (for map display)
  expiresAt
  createdAt, updatedAt
  (unique constraint: userId + slug for SEO)

bids
  id (UUID)
  jobId (FK → jobs)
  workerId (FK → users)
  amount, message
  status (PENDING | ACCEPTED | REJECTED | WITHDRAWN)
  createdAt, updatedAt
  (unique constraint: jobId + workerId)

conversations
  id (UUID)
  jobId (FK → jobs, nullable for general contact)
  hirerId (FK → users)
  workerId (FK → users)
  createdAt, updatedAt
  (unique constraint: jobId + hirerId + workerId)

messages
  id (UUID)
  conversationId (FK → conversations)
  senderId (FK → users)
  content, attachments (jsonb)
  readAt (nullable, for read receipts)
  createdAt

notifications
  id (UUID)
  userId (FK → users)
  type (JOB_POSTED | BID_RECEIVED | BID_ACCEPTED | MESSAGE | COMPLETED)
  resourceId (nullable - job/bid/message ID)
  read (boolean, default false)
  createdAt

reviews
  id (UUID)
  jobId (FK → jobs)
  fromUserId (FK → users)
  toUserId (FK → users)
  rating (1–5)
  comment
  createdAt
  (unique constraint: jobId + fromUserId + toUserId)

ratings
  id (UUID)
  userId (FK → users)
  averageRating (decimal)
  totalReviews (int)
  updatedAt
```

---

## 3. AUTHENTICATION & SECURITY ARCHITECTURE

### 3.1 NextAuth.js v4 Configuration
```typescript
// auth.ts (root of project or api/auth/[...nextauth].ts)
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" } // HIRER | WORKER
      },
      async authorize(credentials) {
        // 1. Fetch user from database
        // 2. Verify password with bcrypt.compare()
        // 3. Validate role matches user.role
        // 4. Return user object with id, email, name, role, image
        // 5. On failure, throw new Error() → login fails
      }
    })
  ],
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    jwt({ token, user, account }) {
      // Add user.role to JWT token
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      // Ensure session.user has role and id
      session.user.role = token.role;
      session.user.id = token.id;
      return session;
    }
  },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',  // auth errors redirect here
    newUser: '/create-account'
  },
  secret: process.env.NEXTAUTH_SECRET (must be 32+ chars, generated via: openssl rand -base64 32)
};
```

**Session Strategy:**
- JWT-based sessions for stateless Vercel deployment
- Tokens refresh on every API call (maxAge: 30 days)
- NextAuth session middleware validates on `/api/*` routes

### 3.2 API Route Security Pattern

```typescript
// Example: /api/jobs/[id]/accept
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  // 1. Verify session exists
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // 2. Verify user is a HIRER (only hirers accept bids)
  if (session.user.role !== "HIRER") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  // 3. Verify user owns the job
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    select: { userId: true }
  });

  if (!job || job.userId !== session.user.id) {
    return new Response(JSON.stringify({ error: "Job not found" }), { status: 404 });
  }

  // 4. Parse and validate request body
  const body = await req.json().catch(() => ({}));
  if (!body.bidId) {
    return new Response(JSON.stringify({ error: "bidId required" }), { status: 400 });
  }

  // 5. Perform mutation with Prisma
  const bid = await prisma.bid.update({
    where: { id: body.bidId },
    data: { status: "ACCEPTED" }
  });

  // 6. Trigger side effects (send notification to worker, etc.)
  await notificationService.send(bid.workerId, {
    type: "BID_ACCEPTED",
    resourceId: params.id
  });

  return new Response(JSON.stringify(bid), { status: 200 });
}
```

### 3.3 Secret Management
```
Environment Variables (committed to .env.example, actual values in .env.local or Vercel dashboard):
  NEXTAUTH_URL           → https://crewlink.com (production) or http://localhost:3000
  NEXTAUTH_SECRET        → Random 32+ char string (openssl rand -base64 32)
  DATABASE_URL           → postgresql://user:pass@host/db
  DATABASE_URL_SHADOW    → Prisma shadow DB for migrations
  MAPBOX_PUBLIC_TOKEN    → Public (safe to commit)
  MAPBOX_SECRET_TOKEN    → Secret (Vercel dashboard only)
```

**Rotating Secrets:**
1. Generate new NEXTAUTH_SECRET: `openssl rand -base64 32`
2. Update NEXTAUTH_SECRET in Vercel dashboard
3. Deploy → all existing sessions invalidate (users must re-login)
4. Update .env.local for local development

---

## 4. STATE MANAGEMENT ARCHITECTURE

### 4.1 Zustand Store Inventory (8 Stores)

#### 1. **authStore** — Authentication & Session State
```typescript
// stores/authStore.ts
interface AuthState {
  user: { id: string; email: string; role: "HIRER" | "WORKER"; name: string } | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: AuthState["user"]) => void;
  setSession: (session: Session) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(...)
```

**Hydration:** On app startup (RootLayout), call `useAuthStore.getState().checkSession()` to validate JWT and reload session data.

#### 2. **modeStore** — Hirer vs Worker Mode Toggle
```typescript
interface ModeState {
  mode: "HIRER" | "WORKER";
  setMode: (mode: "HIRER" | "WORKER") => void;
}

export const useModeStore = create<ModeState>(...)
```

**Usage:** Used alongside UserRoleContext for role-based UI rendering. Allows users to switch perspective (if they have both roles).

#### 3. **mapStore** — Map Viewport & Filters
```typescript
interface MapState {
  viewport: { latitude: number; longitude: number; zoom: number };
  filters: {
    category?: string;
    maxDistance?: number;
    minBudget?: number;
    maxBudget?: number;
  };
  isLoading: boolean;
  setViewport: (vp: Partial<MapState["viewport"]>) => void;
  setFilters: (filters: Partial<MapState["filters"]>) => void;
  resetFilters: () => void;
}

export const useMapStore = create<MapState>(...)
```

**Persistence:** Map viewport and filters persisted to localStorage (with schema validation on hydration).

#### 4. **jobsStore** — Job Listings & Details
```typescript
interface JobsState {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  error: string | null;
  fetchJobs: (filters: MapState["filters"]) => Promise<void>;
  setSelectedJob: (job: Job | null) => void;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
}

export const useJobsStore = create<JobsState>(...)
```

**Data Flow:** Fetches from `/api/jobs?category=DELIVERY&maxDistance=10` based on mapStore filters.

#### 5. **messagesStore** — Conversations & Message Threads
```typescript
interface MessagesState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  unreadCount: number;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
}

export const useMessagesStore = create<MessagesState>(...)
```

**Real-time:** Consider WebSocket integration (e.g., Socket.io) or Vercel KV for push notifications on new messages.

#### 6. **notificationsStore** — Notification Badges & History
```typescript
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  dismissNotification: (id: string) => void;
  markAsRead: (id: string) => void;
}

export const useNotificationsStore = create<NotificationsState>(...)
```

**Badge Updates:** Poll `/api/notifications` every 30s or use WebSocket.

#### 7. **onboardingStore** — User Onboarding Flow State
```typescript
interface OnboardingState {
  currentStep: number; // 0: role selection, 1: profile, 2: payment (hirer), 3: skills (worker)
  completedSteps: boolean[];
  isOnboarded: boolean;
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;
  finishOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>(...)
```

**Routes:** `/create-account` → `/onboarding/role` → `/onboarding/profile` → redirect to `/hiring` or `/work`.

#### 8. **jobFormStore** — Job Posting Draft State
```typescript
interface JobFormState {
  draft: Partial<Job>;
  isDirty: boolean;
  errors: Record<string, string>;
  setDraft: (updates: Partial<Job>) => void;
  validate: () => boolean;
  submit: () => Promise<Job>;
  clear: () => void;
}

export const useJobFormStore = create<JobFormState>(...)
```

**Persistence:** Auto-save draft to localStorage every 5s if isDirty. Warn before navigating away if unsaved.

### 4.2 React Context (Complementary to Zustand)

#### UserRoleContext
```typescript
interface UserRoleContextType {
  role: "HIRER" | "WORKER" | null;
  isLoading: boolean;
  setRole: (role: "HIRER" | "WORKER") => void;
}

export const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

// In RootLayout, wrap with <UserRoleProvider>
export function UserRoleProvider({ children }) {
  const [role, setRole] = useState<"HIRER" | "WORKER" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch session, set role, persist to localStorage
  }, []);

  return (
    <UserRoleContext.Provider value={{ role, isLoading, setRole }}>
      {children}
    </UserRoleContext.Provider>
  );
}

// Usage: const { role } = useContext(UserRoleContext)
```

#### AppModeContext
```typescript
interface AppModeContextType {
  appMode: "MAP_DISCOVERY" | "DASHBOARD" | "MESSAGING";
  setAppMode: (mode: AppModeContextType["appMode"]) => void;
}

export const AppModeContext = createContext<AppModeContextType | undefined>(undefined);
```

### 4.3 Hydration & Initialization Sequence

```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <UserRoleProvider>
          <AppModeProvider>
            <Hydrate> {/* Custom component that rehydrates Zustand stores */}
              <UniversalNav />
              {children}
              <MarketingFooter />
            </Hydrate>
          </AppModeProvider>
        </UserRoleProvider>
      </body>
    </html>
  );
}

// components/Hydrate.tsx
"use client";
import { useEffect } from "react";
import { useAuthStore, useMapStore, useJobsStore } from "@/stores";

export function Hydrate({ children }) {
  useEffect(() => {
    // 1. Load auth session
    useAuthStore.getState().checkSession();

    // 2. Restore map viewport from localStorage
    const saved = localStorage.getItem("mapViewport");
    if (saved) useMapStore.setState({ viewport: JSON.parse(saved) });

    // 3. Prefetch jobs for current viewport
    useJobsStore.getState().fetchJobs(useMapStore.getState().filters);
  }, []);

  return <>{children}</>;
}
```

---

## 5. DESIGN SYSTEM & STYLING

### 5.1 Tailwind CSS Configuration
```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Brand palette (primary actions, CTAs)
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Primary brand blue
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c3d66',
          950: '#051e3e',
        },
        // Accent palette (secondary CTAs, highlights)
        accent: {
          50: '#fdf7f1',
          100: '#fbede3',
          200: '#f6d5be',
          300: '#f0b896',
          400: '#eb9b6f',
          500: '#e67e3d',  // Warm orange accent
          600: '#d45a1f',
          700: '#b84219',
          800: '#9d3718',
          900: '#7d2c12',
        },
        // Success palette (completion, approvals)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Primary success green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#145231',
        },
        // Slate palette (backgrounds, text, borders)
        slate: {
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
          950: '#020617',
        },
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        6: '1.5rem',
        8: '2rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
      },
    },
  },
  plugins: [],
};
```

### 5.2 Component Styling Patterns

#### GlassPanel Component (Dark UI Aesthetic)
```typescript
// components/ui/GlassPanel.tsx
"use client";

interface GlassPanelProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent";
  blur?: "sm" | "md" | "lg";
}

export function GlassPanel({
  children,
  variant = "primary",
  blur = "md"
}: GlassPanelProps) {
  const blurClass = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
  }[blur];

  const bgClass = {
    primary: "bg-slate-900/30 border-slate-700/30",
    secondary: "bg-slate-800/40 border-slate-600/40",
    accent: "bg-brand-500/10 border-brand-500/20",
  }[variant];

  return (
    <div className={`${bgClass} ${blurClass} border rounded-xl p-4 text-white`}>
      {children}
    </div>
  );
}
```

#### Button Component with Brand Colors
```typescript
// components/ui/Button.tsx
"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: "bg-brand-500 hover:bg-brand-600 text-white",
    secondary: "bg-slate-700 hover:bg-slate-600 text-white",
    accent: "bg-accent-500 hover:bg-accent-600 text-white",
    ghost: "bg-transparent hover:bg-slate-700/50 text-slate-200",
  }[variant];

  const sizeClass = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  }[size];

  return (
    <button
      className={`${variantClass} ${sizeClass} rounded-lg transition-colors disabled:opacity-50`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
```

### 5.3 Dark Mode Implementation
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html className="dark">
      <body className="bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}

// Note: CrewLink uses dark theme by default (no light mode toggle planned for Phase 1)
// To implement future light mode: use next-themes library with { defaultTheme: "dark" }
```

---

## 6. PAGE & ROUTE INVENTORY

### 6.1 Marketing Pages (SSR/ISR)

| Route | Purpose | SEO Focus | Rendering |
|-------|---------|-----------|-----------|
| `/` | Hero + CTA (role selector) | Brand, keywords: "gig economy", "trusted workers" | SSR, ISR 60s |
| `/about` | Company story, mission | Brand building, "about us" | Static, ISR |
| `/how-it-works` | 3-step platform overview (post → bid → complete) | Platform explanation | Static, ISR |
| `/pricing` | Hirer fees (8%), Worker payouts (100% - gas), guarantees | Pricing comparison | Static, ISR |
| `/safety` | Verification process, dispute resolution, insurance | Trust signals | Static, ISR |
| `/cities` | List of 50+ supported cities (dynamically generated) | Local SEO, city keywords | ISR |
| `/cities/[cityId]` | City-specific landing page (jobs, market stats, reviews) | Local SEO, "jobs in [city]" | ISR + dynamic |
| `/careers` | Job openings (embedded from external ATS) | Employer brand | ISR |
| `/careers/[slug]` | Individual job opening | Job-specific keywords | ISR + dynamic |
| `/careers/apply` | Application form | Internal tracking | CSR |
| `/blog` | Articles, case studies, tips (CMS or Notion) | Organic traffic, long-tail keywords | ISR + dynamic |
| `/blog/[slug]` | Individual blog post | Article SEO, author keywords | ISR + dynamic |
| `/contact` | Support form, chat widget integration | Email capture, support channel | CSR |
| `/privacy` | Privacy policy (legal) | Regulatory compliance | Static |
| `/terms` | Terms of service (legal) | Regulatory compliance | Static |
| `/help/*` | FAQ, documentation pages | Support, "how to" queries | Static, ISR |
| `/team/*` | Team member bios (optional) | Transparency, employee profiles | Static, ISR |
| `/landing-a` through `/landing-f` | A/B test landing variants | Performance optimization, testing | Static |

### 6.2 Authentication Pages

| Route | Purpose | UI Pattern |
|-------|---------|-----------|
| `/sign-in` | Login form (email + password) | Form modal or full page |
| `/create-account` | Registration (email, password, role selection) | Multi-step form or single page |
| `/forgot-password` | Password reset flow | Email verification → reset form |
| `/select-role` | Onboarding: choose HIRER or WORKER | Role card selector, skip option |

### 6.3 Hirer Dashboard Routes

**Base:** `/hiring`

| Route | Component | Features |
|-------|-----------|----------|
| `/hiring` | DashboardLayout + MapboxMap + JobListCard | Main map view, job list sidebar, filters |
| `/hiring/map` | Dedicated full-screen map | Larger viewport, search bar, location input |
| `/hiring/jobs` | Job management list | Posted jobs, bid history, earnings |
| `/hiring/job/[id]` | Job detail view | Full description, worker bids, bid acceptance UI |
| `/hiring/post` | JobFormStore + form UI | Redirect to `/hiring/post/new` |
| `/hiring/post/new` | Job creation wizard | Step 1: title/desc, Step 2: budget/category, Step 3: location, Step 4: review & submit |
| `/hiring/messages` | Conversations list + chat UI | Real-time messaging with workers |
| `/hiring/notifications` | Notification center | Grouped by type (bids, messages, completions) |
| `/hiring/reviews` | Received reviews from workers | Ratings, comments, response option |
| `/hiring/worker/[id]` | Worker profile card | Photo, bio, skills, ratings, review history |
| `/hiring/profile` | Edit hirer profile | Name, company, avatar, bio |
| `/hiring/profile/edit` | Full profile form | All fields editable |
| `/hiring/settings` | Settings hub | Password, notifications, privacy |
| `/hiring/settings/payment` | Payment method management | Stripe card setup, invoicing settings |

### 6.4 Worker Dashboard Routes

**Base:** `/work`

| Route | Component | Features |
|-------|-----------|----------|
| `/work` | DashboardLayout + MapboxMap + JobListCard | Main map view, available jobs by location |
| `/work/map` | Dedicated full-screen map | Large map, job clusters, detail popups |
| `/work/jobs` | Available jobs list | Filters: category, budget, distance, skills match |
| `/work/job/[id]` | Job detail + bid form | Full description, post bid UI |
| `/work/bids` | Worker's bids history | Status: pending, accepted, rejected, withdrawn |
| `/work/messages` | Conversations list + chat UI | Real-time messaging with hirers |
| `/work/notifications` | Notification center | Bid acceptances, messages, job completions |
| `/work/earnings` | Earnings dashboard | Total earned, pending payouts, graph |
| `/work/transactions` | Transaction history | Completed jobs, fees, payout dates |
| `/work/hirer/[id]` | Hirer profile card | Company, rating, hiring history |
| `/work/profile` | Edit worker profile | Name, avatar, bio, skills, location |
| `/work/profile/edit` | Full profile form | Skills, availability, certifications |
| `/work/settings` | Settings hub | Password, notifications, privacy |
| `/work/settings/payout` | Payout method setup | Bank account, Stripe Express setup |

### 6.5 Error & Fallback Pages

| Route | Trigger | Message |
|-------|---------|---------|
| `/error.tsx` (global) | Unhandled error in any page | "Something went wrong. Try reloading." |
| `/not-found.tsx` | 404 on any route | "Page not found" with home/back links |
| `/wrong-side` | Worker navigates to `/hiring/*` or vice versa | "You're on the wrong side. Go to [your dashboard]" |

---

## 7. COMPONENT LIBRARY & ARCHITECTURE

### 7.1 Navigation Components

#### UniversalNav (All Pages)
```typescript
// components/UniversalNav.tsx
"use client";

export function UniversalNav() {
  const { role } = useContext(UserRoleContext);
  const { data: session } = useSession();

  return (
    <nav className="bg-slate-900 border-b border-slate-700/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <span className="text-2xl font-bold text-brand-500">CrewLink</span>
        </Link>

        {/* Role-based nav items */}
        {session && role === "HIRER" && <HiringNav />}
        {session && role === "WORKER" && <WorkerNav />}
        {!session && <AuthNav />}

        {/* Mobile menu */}
        <MobileMenuButton />
      </div>
    </nav>
  );
}
```

#### HiringNav (Hirer Dashboard)
```typescript
export function HiringNav() {
  return (
    <ul className="hidden md:flex gap-6">
      <li><Link href="/hiring">Dashboard</Link></li>
      <li><Link href="/hiring/jobs">My Jobs</Link></li>
      <li><Link href="/hiring/messages">Messages</Link></li>
      <li><Link href="/hiring/notifications">Notifications</Link></li>
      <li><Link href="/hiring/profile">Profile</Link></li>
    </ul>
  );
}
```

#### WorkerNav (Worker Dashboard)
```typescript
export function WorkerNav() {
  return (
    <ul className="hidden md:flex gap-6">
      <li><Link href="/work">Dashboard</Link></li>
      <li><Link href="/work/bids">My Bids</Link></li>
      <li><Link href="/work/messages">Messages</Link></li>
      <li><Link href="/work/notifications">Notifications</Link></li>
      <li><Link href="/work/profile">Profile</Link></li>
    </ul>
  );
}
```

#### NavConceptA/B/C (Experimental Variants)
- ConceptA: Horizontal top nav (current)
- ConceptB: Vertical left sidebar
- ConceptC: Bottom sheet nav (mobile-first)

### 7.2 Map Components

#### MapboxMap (Primary)
```typescript
// components/MapboxMap.tsx
"use client";
import MapboxGl from "mapbox-gl";
import { useMapStore } from "@/stores";

interface MapboxMapProps {
  jobs: Job[];
  onJobSelected: (job: Job) => void;
  height?: string;
}

export function MapboxMap({ jobs, onJobSelected, height = "h-96" }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxGl.Map | null>(null);
  const { viewport, setViewport } = useMapStore();

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [viewport.longitude, viewport.latitude],
      zoom: viewport.zoom,
    });

    // Add job markers
    jobs.forEach((job) => {
      new mapboxgl.Marker({ color: "#0ea5e9" })
        .setLngLat([job.longitude, job.latitude])
        .addTo(map.current!)
        .getElement()
        .addEventListener("click", () => onJobSelected(job));
    });

    // Track viewport changes
    map.current.on("moveend", () => {
      const { lng, lat } = map.current!.getCenter();
      setViewport({ longitude: lng, latitude: lat, zoom: map.current!.getZoom() });
    });
  }, [viewport, jobs]);

  return <div ref={mapContainer} className={height} />;
}
```

**Token Setup:**
```bash
# .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk_test_... # Public token (safe to commit)
MAPBOX_SECRET_TOKEN=sk_test_...      # Secret token (Vercel dashboard)
```

#### LeafletMap (Alternative)
```typescript
// components/LeafletMap.tsx - Lighter alternative to Mapbox for budget-conscious deploys
import L from "leaflet";
```

#### VirtualMap (Fallback for Geolocation Denied)
```typescript
// components/VirtualMap.tsx
export function VirtualMap() {
  // Show jobs as list with manual address search instead of map
  // Used when navigator.geolocation denied
  return <JobListCard jobs={jobs} layout="grid" />;
}
```

#### MapStates (Loading, Error, Empty)
```typescript
// components/map/MapStates.tsx

export function MapLoadingState() {
  return <div className="h-96 bg-slate-800 animate-pulse rounded-lg" />;
}

export function MapErrorState() {
  return (
    <div className="h-96 bg-slate-800 border border-red-500/30 rounded-lg flex items-center justify-center">
      <p className="text-red-300">Failed to load map. Please refresh.</p>
    </div>
  );
}

export function MapEmptyState() {
  return (
    <div className="h-96 bg-slate-800 rounded-lg flex items-center justify-center">
      <p className="text-slate-400">No jobs found in this area.</p>
    </div>
  );
}
```

#### MapSidebarShell (Job List + Filters)
```typescript
// components/map/MapSidebarShell.tsx
"use client";

interface MapSidebarShellProps {
  jobs: Job[];
  selectedJob: Job | null;
  onSelect: (job: Job) => void;
  filters: MapFilters;
  onFilterChange: (filters: Partial<MapFilters>) => void;
}

export function MapSidebarShell({
  jobs,
  selectedJob,
  onSelect,
  filters,
  onFilterChange
}: MapSidebarShellProps) {
  return (
    <div className="flex gap-4 h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-slate-900 border-r border-slate-700/30 flex flex-col">
        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-700/30">
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
          <CategoryDropdown value={filters.category} onChange={(v) => onFilterChange({ category: v })} />
          <BudgetDropdown value={filters.maxBudget} onChange={(v) => onFilterChange({ maxBudget: v })} />
        </div>

        {/* Job List */}
        <div className="flex-1 overflow-y-auto">
          {jobs.map((job) => (
            <JobListCard
              key={job.id}
              job={job}
              isSelected={selectedJob?.id === job.id}
              onClick={() => onSelect(job)}
            />
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapboxMap jobs={jobs} onJobSelected={onSelect} height="h-full" />
      </div>
    </div>
  );
}
```

### 7.3 Form Components

#### AddressAutocomplete (Geolocation Input)
```typescript
// components/forms/AddressAutocomplete.tsx
"use client";

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, lat: number, lng: number) => void;
  onGeolocationDenied?: () => void;
}

export function AddressAutocomplete({
  value,
  onChange,
  onGeolocationDenied
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const requestGeolocation = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      // Reverse geocode with Mapbox Geocoding API
      const resp = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${position.coords.longitude},${position.coords.latitude}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const data = await resp.json();
      const place = data.features[0];
      onChange(place.place_name, position.coords.latitude, position.coords.longitude);
    } catch (err) {
      onGeolocationDenied?.();
    }
  };

  const handleSearch = async (query: string) => {
    const resp = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    );
    const data = await resp.json();
    setSuggestions(data.features.map(f => f.place_name));
  };

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Enter address or use geolocation"
        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2"
      />
      <button onClick={requestGeolocation} className="text-xs text-brand-400 mt-1">
        Use my location
      </button>
      {suggestions.map((s) => (
        <div key={s} onClick={() => onChange(s, 0, 0)} className="p-2 hover:bg-slate-700 cursor-pointer">
          {s}
        </div>
      ))}
    </div>
  );
}
```

#### BudgetDropdown & CategoryDropdown
```typescript
// components/forms/BudgetDropdown.tsx
export function BudgetDropdown({ value, onChange }) {
  const ranges = [
    { label: "$0 - $100", min: 0, max: 100 },
    { label: "$100 - $500", min: 100, max: 500 },
    { label: "$500 - $1000", min: 500, max: 1000 },
    { label: "$1000+", min: 1000, max: Infinity },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
    >
      <option value="">All budgets</option>
      {ranges.map((r) => (
        <option key={r.label} value={r.max}>{r.label}</option>
      ))}
    </select>
  );
}

// components/forms/CategoryDropdown.tsx
export function CategoryDropdown({ value, onChange }) {
  const categories = ["DELIVERY", "TASK", "CONSULTING", "TRADES", "CREATIVE"];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
    >
      <option value="">All categories</option>
      {categories.map((cat) => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );
}
```

### 7.4 Card Components

#### JobListCard
```typescript
// components/cards/JobListCard.tsx
interface JobListCardProps {
  job: Job;
  isSelected?: boolean;
  onClick?: () => void;
  variant?: "list" | "grid";
}

export function JobListCard({
  job,
  isSelected = false,
  onClick,
  variant = "list"
}: JobListCardProps) {
  const distance = calculateDistance(job.latitude, job.longitude); // Helper function

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition ${
        isSelected ? "bg-brand-500/20 border-brand-500/50" : "bg-slate-800 border-slate-700/30 hover:border-slate-600"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white">{job.title}</h3>
          <p className="text-sm text-slate-400 mt-1">{job.description.substring(0, 60)}...</p>
        </div>
        <span className="text-lg font-bold text-brand-400">${job.budget}</span>
      </div>

      <div className="flex gap-4 mt-3 text-xs text-slate-400">
        <span>{distance} km away</span>
        <span>{job.category}</span>
        <span className="text-success-400">{job.bids} bids</span>
      </div>
    </div>
  );
}
```

#### JobPostListCard (Hirer's Posted Jobs)
```typescript
// components/cards/JobPostListCard.tsx
interface JobPostListCardProps {
  job: Job;
  bidCount: number;
  acceptedBidId?: string;
}

export function JobPostListCard({ job, bidCount, acceptedBidId }: JobPostListCardProps) {
  const statusColor = {
    OPEN: "text-amber-400",
    IN_PROGRESS: "text-blue-400",
    COMPLETED: "text-green-400",
    CANCELLED: "text-red-400",
  }[job.status];

  return (
    <div className="p-4 bg-slate-800 border border-slate-700/30 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white">{job.title}</h3>
          <p className={`text-sm ${statusColor} mt-1`}>{job.status}</p>
        </div>
        <span className="text-lg font-bold text-brand-400">${job.budget}</span>
      </div>

      <div className="mt-3 flex gap-3 text-sm">
        <span className="text-slate-400">{bidCount} bids</span>
        {acceptedBidId && <span className="text-success-400">Worker assigned</span>}
      </div>

      <div className="mt-4 flex gap-2">
        <Link href={`/hiring/job/${job.id}`} className="text-xs text-brand-400 hover:underline">
          View details
        </Link>
      </div>
    </div>
  );
}
```

#### WorkerListCard (Worker Profiles)
```typescript
// components/cards/WorkerListCard.tsx
interface WorkerListCardProps {
  worker: User;
  rating: { averageRating: number; totalReviews: number };
  onViewProfile?: () => void;
}

export function WorkerListCard({ worker, rating, onViewProfile }: WorkerListCardProps) {
  return (
    <div className="p-4 bg-slate-800 border border-slate-700/30 rounded-lg text-center">
      <img
        src={worker.avatarUrl}
        alt={worker.name}
        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
      />
      <h3 className="font-semibold text-white">{worker.name}</h3>

      {/* Star rating */}
      <div className="flex justify-center gap-1 mt-2">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < Math.round(rating.averageRating) ? "text-amber-400" : "text-slate-600"}>
            ★
          </span>
        ))}
        <span className="text-xs text-slate-400 ml-2">({rating.totalReviews} reviews)</span>
      </div>

      <button
        onClick={onViewProfile}
        className="mt-4 w-full px-3 py-2 bg-brand-500 hover:bg-brand-600 rounded text-sm text-white"
      >
        View profile
      </button>
    </div>
  );
}
```

### 7.5 UI Primitives

#### Button, Input, Modal, Card
See Section 5.2 for Button implementation.

```typescript
// components/ui/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm text-slate-300 mb-2">{label}</label>}
      <input
        className={`w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
```

#### Modal
```typescript
// components/ui/Modal.tsx
"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <GlassPanel variant="primary" className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="mb-4">{children}</div>
        {footer && <div className="flex gap-2">{footer}</div>}
      </GlassPanel>
    </div>
  );
}
```

#### Toast (Notifications)
```typescript
// components/ui/Toast.tsx
"use client";

export function Toast({ message, type = "info", onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, []);

  const bgColor = {
    success: "bg-success-500/20 text-success-300",
    error: "bg-red-500/20 text-red-300",
    info: "bg-brand-500/20 text-brand-300",
  }[type];

  return (
    <div className={`${bgColor} border border-slate-600 rounded p-4 mb-4`}>
      {message}
    </div>
  );
}
```

#### LiveDot (Real-time Status Indicator)
```typescript
// components/ui/LiveDot.tsx
export function LiveDot() {
  return (
    <span className="inline-flex w-2 h-2 bg-success-500 rounded-full animate-pulse" />
  );
}
```

#### GeolocationModal
```typescript
// components/GeolocationModal.tsx
"use client";

interface GeolocationModalProps {
  onAllow: (lat: number, lng: number) => void;
  onDeny: () => void;
}

export function GeolocationModal({ onAllow, onDeny }: GeolocationModalProps) {
  const handleAllow = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onAllow(position.coords.latitude, position.coords.longitude);
      },
      () => onDeny()
    );
  };

  return (
    <Modal isOpen title="Allow location access?">
      <p className="text-slate-300 mb-4">
        We need your location to show nearby jobs on the map.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onDeny}>Deny</Button>
        <Button onClick={handleAllow}>Allow location</Button>
      </div>
    </Modal>
  );
}
```

### 7.6 Access Control Components

#### RoleGuard
```typescript
// components/RoleGuard.tsx
"use client";

interface RoleGuardProps {
  requiredRole: "HIRER" | "WORKER";
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ requiredRole, children, fallback }: RoleGuardProps) {
  const { role, isLoading } = useContext(UserRoleContext);

  if (isLoading) return <div className="animate-pulse">Loading...</div>;

  if (role !== requiredRole) {
    return (
      fallback || (
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">You don't have access to this page.</p>
          <Link href={requiredRole === "HIRER" ? "/hiring" : "/work"} className="text-brand-400 hover:underline">
            Go to {requiredRole === "HIRER" ? "hirer" : "worker"} dashboard
          </Link>
        </div>
      )
    );
  }

  return <>{children}</>;
}
```

#### RestrictedAccess
```typescript
// components/RestrictedAccess.tsx
"use client";

interface RestrictedAccessProps {
  requiredRoles: ("HIRER" | "WORKER")[];
  children: React.ReactNode;
}

export function RestrictedAccess({ requiredRoles, children }: RestrictedAccessProps) {
  const { data: session } = useSession();

  if (!session || !requiredRoles.includes(session.user.role)) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
        <p className="text-red-300">Access denied. Required role: {requiredRoles.join(" or ")}</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

### 7.7 Layout Components

#### MarketingLayout (For Marketing Pages)
```typescript
// app/layouts/MarketingLayout.tsx
import { UniversalNav } from "@/components/UniversalNav";
import { MarketingFooter } from "@/components/MarketingFooter";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <UniversalNav />
      <main className="max-w-7xl mx-auto px-4 py-12">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
```

#### AmbientBackground
```typescript
// components/AmbientBackground.tsx
export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Animated gradient orbs in background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-slate-900 to-accent-500/10" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse" />
    </div>
  );
}
```

---

## 8. API ROUTES SPECIFICATION

### 8.1 Authentication API Routes

#### POST /api/auth/[...nextauth]
Handled by NextAuth.js automatically. See Section 3.1.

#### POST /api/auth/sign-up (Custom)
```typescript
// app/api/auth/sign-up/route.ts
export async function POST(req: Request) {
  const { email, password, name, role } = await req.json();

  // 1. Validate input
  if (!email || !password || !role) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  // 2. Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return new Response(JSON.stringify({ error: "User already exists" }), { status: 409 });
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
      verified: false
    }
  });

  // 5. Send verification email (optional)
  // await sendVerificationEmail(email, user.id);

  return new Response(JSON.stringify({ userId: user.id }), { status: 201 });
}
```

### 8.2 Jobs API Routes

#### GET /api/jobs
```typescript
// app/api/jobs/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latitude = parseFloat(searchParams.get("latitude") || "0");
  const longitude = parseFloat(searchParams.get("longitude") || "0");
  const maxDistance = parseFloat(searchParams.get("maxDistance") || "50");
  const category = searchParams.get("category");
  const minBudget = parseFloat(searchParams.get("minBudget") || "0");
  const maxBudget = parseFloat(searchParams.get("maxBudget") || "Infinity");

  // TODO: Implement distance calculation (PostGIS or haversine)
  const jobs = await prisma.job.findMany({
    where: {
      status: "OPEN",
      category: category ? category : undefined,
      budget: {
        gte: minBudget,
        lte: isFinite(maxBudget) ? maxBudget : undefined
      },
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return new Response(JSON.stringify(jobs), { status: 200 });
}
```

#### POST /api/jobs
```typescript
// app/api/jobs/route.ts (POST)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "HIRER") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { title, description, budget, category, latitude, longitude } = await req.json();

  // Validate
  if (!title || !description || !budget || !category) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
  }

  const job = await prisma.job.create({
    data: {
      title,
      description,
      budget,
      category,
      latitude,
      longitude,
      userId: session.user.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  return new Response(JSON.stringify(job), { status: 201 });
}
```

#### GET /api/jobs/[id]
```typescript
// app/api/jobs/[id]/route.ts
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      bids: {
        where: { status: { in: ["PENDING", "ACCEPTED"] } },
        include: { worker: { select: { id: true, name: true, avatarUrl: true } } }
      },
      user: { select: { id: true, name: true, avatarUrl: true } }
    }
  });

  if (!job) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  return new Response(JSON.stringify(job), { status: 200 });
}
```

#### PATCH /api/jobs/[id]
```typescript
// app/api/jobs/[id]/route.ts (PATCH)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    select: { userId: true }
  });

  if (!job || job.userId !== session.user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const { title, description, status } = await req.json();

  const updated = await prisma.job.update({
    where: { id: params.id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status })
    }
  });

  return new Response(JSON.stringify(updated), { status: 200 });
}
```

### 8.3 Bids API Routes

#### POST /api/jobs/[id]/bid
```typescript
// app/api/jobs/[id]/bid/route.ts
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "WORKER") {
    return new Response(JSON.stringify({ error: "Only workers can bid" }), { status: 403 });
  }

  const { amount, message } = await req.json();

  if (!amount) {
    return new Response(JSON.stringify({ error: "Amount required" }), { status: 400 });
  }

  // Check for duplicate bid
  const existingBid = await prisma.bid.findUnique({
    where: { jobId_workerId: { jobId: params.id, workerId: session.user.id } }
  });

  if (existingBid) {
    return new Response(JSON.stringify({ error: "You already bid on this job" }), { status: 409 });
  }

  const bid = await prisma.bid.create({
    data: {
      jobId: params.id,
      workerId: session.user.id,
      amount,
      message,
      status: "PENDING"
    }
  });

  // Notify hirer
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    select: { userId: true }
  });

  await prisma.notification.create({
    data: {
      userId: job!.userId,
      type: "BID_RECEIVED",
      resourceId: bid.id
    }
  });

  return new Response(JSON.stringify(bid), { status: 201 });
}
```

#### POST /api/jobs/[id]/accept
```typescript
// app/api/jobs/[id]/accept/route.ts
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "HIRER") {
    return new Response(JSON.stringify({ error: "Only hirers can accept bids" }), { status: 403 });
  }

  const { bidId } = await req.json();

  // Verify job ownership
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    select: { userId: true }
  });

  if (!job || job.userId !== session.user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  // Accept bid
  const bid = await prisma.bid.update({
    where: { id: bidId },
    data: { status: "ACCEPTED" }
  });

  // Reject all other bids on this job
  await prisma.bid.updateMany({
    where: { jobId: params.id, id: { not: bidId }, status: "PENDING" },
    data: { status: "REJECTED" }
  });

  // Update job status
  await prisma.job.update({
    where: { id: params.id },
    data: { status: "IN_PROGRESS" }
  });

  // Notify worker
  await prisma.notification.create({
    data: {
      userId: bid.workerId,
      type: "BID_ACCEPTED",
      resourceId: params.id
    }
  });

  return new Response(JSON.stringify(bid), { status: 200 });
}
```

### 8.4 Conversations & Messages API Routes

#### GET /api/conversations
```typescript
// app/api/conversations/route.ts
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { hirerId: session.user.id },
        { workerId: session.user.id }
      ]
    },
    include: {
      messages: { take: 1, orderBy: { createdAt: "desc" } },
      hirer: { select: { id: true, name: true, avatarUrl: true } },
      worker: { select: { id: true, name: true, avatarUrl: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return new Response(JSON.stringify(conversations), { status: 200 });
}
```

#### POST /api/conversations
```typescript
// app/api/conversations/route.ts (POST)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { jobId, otherUserId } = await req.json();

  const isHirer = session.user.role === "HIRER";
  const hirerId = isHirer ? session.user.id : otherUserId;
  const workerId = !isHirer ? session.user.id : otherUserId;

  // Check for existing conversation
  let conversation = await prisma.conversation.findUnique({
    where: { jobId_hirerId_workerId: { jobId, hirerId, workerId } }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { jobId, hirerId, workerId }
    });
  }

  return new Response(JSON.stringify(conversation), { status: 201 });
}
```

#### GET /api/conversations/[conversationId]
```typescript
// app/api/conversations/[conversationId]/route.ts
export async function GET(req: Request, { params }: { params: { conversationId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.conversationId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      hirer: { select: { id: true, name: true, avatarUrl: true } },
      worker: { select: { id: true, name: true, avatarUrl: true } }
    }
  });

  if (!conversation) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  if (
    conversation.hirerId !== session.user.id &&
    conversation.workerId !== session.user.id
  ) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  return new Response(JSON.stringify(conversation), { status: 200 });
}
```

#### POST /api/conversations/[conversationId]/messages
```typescript
// app/api/conversations/[conversationId]/messages/route.ts
export async function POST(req: Request, { params }: { params: { conversationId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { content } = await req.json();

  if (!content) {
    return new Response(JSON.stringify({ error: "Content required" }), { status: 400 });
  }

  // Verify user is part of conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id: params.conversationId }
  });

  if (
    !conversation ||
    (conversation.hirerId !== session.user.id && conversation.workerId !== session.user.id)
  ) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: params.conversationId,
      senderId: session.user.id,
      content
    }
  });

  // Notify other party
  const otherUserId = conversation.hirerId === session.user.id
    ? conversation.workerId
    : conversation.hirerId;

  await prisma.notification.create({
    data: {
      userId: otherUserId,
      type: "MESSAGE",
      resourceId: message.id
    }
  });

  return new Response(JSON.stringify(message), { status: 201 });
}
```

### 8.5 Notifications API Route

#### GET /api/notifications
```typescript
// app/api/notifications/route.ts
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const unreadCount = await prisma.notification.count({
    where: { userId: session.user.id, read: false }
  });

  return new Response(JSON.stringify({ notifications, unreadCount }), { status: 200 });
}
```

#### PATCH /api/notifications/[id]
```typescript
// app/api/notifications/[id]/route.ts
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const notification = await prisma.notification.findUnique({
    where: { id: params.id }
  });

  if (!notification || notification.userId !== session.user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const updated = await prisma.notification.update({
    where: { id: params.id },
    data: { read: true }
  });

  return new Response(JSON.stringify(updated), { status: 200 });
}
```

### 8.6 Health Check

#### GET /api/health
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return new Response(
      JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected"
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "error",
        database: "disconnected"
      }),
      { status: 503 }
    );
  }
}
```

---

## 9. TESTING ARCHITECTURE

### 9.1 Playwright E2E Testing

#### Setup & Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "mobile safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
});
```

#### Critical User Flows

##### Flow 1: Post Job → Receive Bid → Accept → Complete
```typescript
// tests/e2e/hirer-job-flow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Hirer Job Posting Flow", () => {
  test("Post job, receive bids, accept, and mark complete", async ({ page, context }) => {
    // Login as Hirer
    await page.goto("/sign-in");
    await page.fill("input[type='email']", "hirer@example.com");
    await page.fill("input[type='password']", "password123");
    await page.click("button:has-text('Sign in')");
    await page.waitForNavigation();
    await expect(page).toHaveURL("/hiring");

    // Post new job
    await page.click("button:has-text('Post a job')");
    await expect(page).toHaveURL("/hiring/post/new");

    // Step 1: Title & Description
    await page.fill("input[placeholder='Job title']", "Move furniture across town");
    await page.fill("textarea[placeholder='Description']", "Need to move 3 pieces of furniture from downtown to uptown");
    await page.click("button:has-text('Next')");

    // Step 2: Budget & Category
    await page.fill("input[placeholder='Budget']", "150");
    await page.selectOption("select[name='category']", "DELIVERY");
    await page.click("button:has-text('Next')");

    // Step 3: Location
    await page.fill("input[placeholder='Address']", "123 Main St, San Francisco");
    await page.click("button:has-text('Use my location')");
    await page.waitForTimeout(500);
    await page.click("button:has-text('Next')");

    // Step 4: Review & Submit
    await expect(page.locator("text=Move furniture across town")).toBeVisible();
    await page.click("button:has-text('Post job')");

    // Verify job appears on map
    await expect(page).toHaveURL("/hiring");
    await expect(page.locator("text=Move furniture across town")).toBeVisible();

    // Simulate Worker applying
    const workerContext = await context.newPage();
    await workerContext.goto("/sign-in");
    await workerContext.fill("input[type='email']", "worker@example.com");
    await workerContext.fill("input[type='password']", "password123");
    await workerContext.click("button:has-text('Sign in')");
    await workerContext.waitForNavigation();

    // Worker bids on job
    await workerContext.goto("/work");
    await expect(workerContext.locator("text=Move furniture across town")).toBeVisible();
    await workerContext.click("text=Move furniture across town");
    await workerContext.fill("input[placeholder='Your bid amount']", "120");
    await workerContext.fill("textarea[placeholder='Message to hirer']", "I have a truck and experience");
    await workerContext.click("button:has-text('Submit bid')");

    // Hirer sees bid notification
    await page.reload();
    await expect(page.locator("text=New bid received")).toBeVisible();

    // Hirer accepts bid
    await page.click("text=View bid");
    await page.click("button:has-text('Accept bid')");
    await expect(page.locator("text=Bid accepted")).toBeVisible();

    // Verify conversation created
    await page.click("button:has-text('Messages')");
    await expect(page.locator("text=Worker")).toBeVisible();

    await workerContext.close();
  });
});
```

##### Flow 2: Worker Bid → Acceptance → Earnings
```typescript
// tests/e2e/worker-bid-flow.spec.ts
test("Worker bids, gets accepted, and earnings recorded", async ({ page }) => {
  await page.goto("/sign-in");
  await page.fill("input[type='email']", "worker@example.com");
  await page.fill("input[type='password']", "password123");
  await page.click("button:has-text('Sign in')");
  await page.waitForNavigation();

  // View available jobs
  await expect(page).toHaveURL("/work");
  await expect(page.locator("text=Available jobs")).toBeVisible();

  // Apply filter
  await page.selectOption("select[name='category']", "DELIVERY");

  // Find and bid on job
  const jobCard = page.locator("[class*='JobListCard']").first();
  await jobCard.click();

  await page.fill("input[placeholder='Your bid amount']", "100");
  await page.click("button:has-text('Submit bid')");

  // Check bid appears in "My Bids"
  await page.click("button:has-text('My bids')");
  await expect(page.locator("text=PENDING")).toBeVisible();

  // Simulate acceptance & completion
  // ... (mark as completed by hirer)

  // Check earnings updated
  await page.click("button:has-text('Earnings')");
  await expect(page.locator("text=$100.00")).toBeVisible();
});
```

##### Flow 3: Messaging Between Hirer & Worker
```typescript
// tests/e2e/messaging-flow.spec.ts
test("Hirer and worker exchange messages", async ({ page, context }) => {
  // Setup: Hirer logged in
  const hirerPage = page;
  await hirerPage.goto("/hiring");

  const workerPage = await context.newPage();
  await workerPage.goto("/work");

  // Both navigate to messages
  await hirerPage.click("button:has-text('Messages')");
  await workerPage.click("button:has-text('Messages')");

  // Hirer sends first message
  await hirerPage.click("text=Worker");
  await hirerPage.fill("textarea", "When can you start?");
  await hirerPage.click("button:has-text('Send')");

  // Worker receives message
  await expect(workerPage.locator("text=When can you start?")).toBeVisible();

  // Worker replies
  await workerPage.fill("textarea", "Tomorrow morning works for me");
  await workerPage.click("button:has-text('Send')");

  // Hirer sees reply
  await expect(hirerPage.locator("text=Tomorrow morning works for me")).toBeVisible();
});
```

### 9.2 QA Test Agents (5 Automated Agents)

#### Agent 1: Visual Regression Testing
```typescript
// tests/agents/visual-regression.agent.ts
class VisualRegressionAgent {
  async runTests() {
    const pages = [
      "/",
      "/sign-in",
      "/hiring",
      "/work",
      "/hiring/post/new",
    ];

    for (const page of pages) {
      await this.page.goto(page);
      await this.page.waitForLoadState("networkidle");

      // Take screenshot and compare to baseline
      await expect(this.page).toHaveScreenshot(`${page}.png`, {
        maxDiffPixels: 100, // Allow 100 pixel differences
      });
    }
  }
}
```

#### Agent 2: Performance Metrics Testing
```typescript
// tests/agents/performance.agent.ts
class PerformanceAgent {
  async measureCoreWebVitals() {
    const metrics = await this.page.evaluate(() => {
      return {
        LCP: performance.getEntriesByName("largest-contentful-paint")[0],
        FID: performance.getEntriesByName("first-input")[0],
        CLS: performance.getEntriesByName("layout-shift")[0],
      };
    });

    // Assert LCP < 2.5s, FID < 100ms, CLS < 0.1
    expect(metrics.LCP.startTime).toBeLessThan(2500);
    expect(metrics.FID.duration).toBeLessThan(100);
    expect(metrics.CLS.value).toBeLessThan(0.1);
  }
}
```

#### Agent 3: Accessibility Testing
```typescript
// tests/agents/accessibility.agent.ts
import { injectAxe, checkA11y } from "axe-playwright";

class AccessibilityAgent {
  async auditPage(url: string) {
    await this.page.goto(url);
    await injectAxe(this.page);
    await checkA11y(this.page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  }
}
```

#### Agent 4: API Integration Testing
```typescript
// tests/agents/api.agent.ts
class APIIntegrationAgent {
  async testJobsEndpoint() {
    const response = await fetch("http://localhost:3000/api/jobs?latitude=37.7749&longitude=-122.4194&maxDistance=50");
    expect(response.status).toBe(200);
    const jobs = await response.json();
    expect(Array.isArray(jobs)).toBe(true);
    jobs.forEach(job => {
      expect(job).toHaveProperty("id");
      expect(job).toHaveProperty("title");
      expect(job).toHaveProperty("budget");
    });
  }

  async testAuthFlow() {
    const signUpResponse = await fetch("http://localhost:3000/api/auth/sign-up", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "SecurePass123!",
        name: "Test User",
        role: "WORKER"
      })
    });
    expect(signUpResponse.status).toBe(201);
  }
}
```

#### Agent 5: Security Testing
```typescript
// tests/agents/security.agent.ts
class SecurityAgent {
  async testCSRFProtection() {
    // Verify CSRF tokens on forms
    await this.page.goto("/hiring/post/new");
    const csrfToken = await this.page.inputValue("input[name='_csrf']");
    expect(csrfToken).toBeTruthy();
  }

  async testXSSPrevention() {
    // Try to inject script via job title
    const response = await fetch("http://localhost:3000/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "<script>alert('xss')</script>",
        description: "Test",
        budget: 100,
        category: "DELIVERY"
      })
    });

    const job = await response.json();
    expect(job.title).not.toContain("<script>");
  }

  async testSQLInjection() {
    const response = await fetch("http://localhost:3000/api/jobs?search='; DROP TABLE jobs; --");
    // Table should still exist and query should be safe
    expect(response.status).toBe(200);
  }
}
```

### 9.3 Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- tests/e2e/hirer-job-flow.spec.ts

# Run agents
npm run test:agents

# Run with UI mode (debug)
npm run test:e2e -- --ui

# Generate HTML report
npm run test:e2e -- --reporter=html
```

---

## 10. MONITORING & OBSERVABILITY (Phase 5)

### 10.1 Recommended: Sentry Integration

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter out certain errors
    if (event.exception) {
      const error = event.exception.values?.[0]?.value || "";
      if (error.includes("Network request failed")) {
        return null; // Don't send network errors
      }
    }
    return event;
  },
});
```

```typescript
// app/layout.tsx
import * as Sentry from "@sentry/nextjs";

export const RootLayout = Sentry.withProfiler(async ({ children }) => {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
});
```

### 10.2 Error Tracking
```typescript
// Hook to track errors in components
"use client";
import * as Sentry from "@sentry/nextjs";

export function useErrorTracking() {
  return {
    captureException: (error: Error) => Sentry.captureException(error),
    captureMessage: (message: string, level: "error" | "warning" | "info") =>
      Sentry.captureMessage(message, level),
  };
}
```

### 10.3 Performance Monitoring
```typescript
// Automatically track Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

export function registerWebVitals() {
  getCLS((metric) => Sentry.captureMessage(`CLS: ${metric.value}`));
  getFID((metric) => Sentry.captureMessage(`FID: ${metric.value}`));
  getLCP((metric) => Sentry.captureMessage(`LCP: ${metric.value}`));
  getTTFB((metric) => Sentry.captureMessage(`TTFB: ${metric.value}`));
}
```

---

## 11. DEPLOYMENT & INFRASTRUCTURE

### 11.1 Vercel Deployment

#### vercel.json
```json
{
  "buildCommand": "npm run build",
  "env": {
    "NEXTAUTH_URL": "@nextauth_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "DATABASE_URL": "@database_url"
  },
  "functions": {
    "app/api/**": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "redirects": [
    {
      "source": "/blog/:slug*",
      "destination": "https://blog.crewlink.com/:slug*",
      "permanent": true
    }
  ]
}
```

#### Environment Variables (Vercel Dashboard)
```
NEXTAUTH_URL                   → https://crewlink.com
NEXTAUTH_SECRET                → (generated 32+ char string)
DATABASE_URL                   → postgresql://user:pass@neon.tech/db
DATABASE_URL_SHADOW            → (Prisma migration DB)
NEXT_PUBLIC_MAPBOX_TOKEN       → pk_test_...
MAPBOX_SECRET_TOKEN            → sk_test_...
NEXT_PUBLIC_SENTRY_DSN         → https://...@sentry.io/...
STRIPE_SECRET_KEY              → sk_test_... (future)
```

### 11.2 Prisma Migrations

```bash
# Generate migration after schema.prisma changes
npx prisma migrate dev --name add_job_table

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### 11.3 PostgreSQL / Neon Setup

```bash
# Connection pool (Neon serverless)
DATABASE_URL="postgresql://user:password@ep-xyz.us-east-1.aws.neon.tech/crewlink?sslmode=require"

# Shadow DB for migrations
DATABASE_URL_SHADOW="postgresql://user:password@ep-shadow.us-east-1.aws.neon.tech/crewlink_shadow?sslmode=require"
```

### 11.4 Preview Deployments

- Every PR automatically gets a preview deployment
- Preview DB: Use staging database or shadow DB
- Test with real data before production merge

---

## 12. DEVELOPMENT WORKFLOW

### 12.1 Local Development Setup

```bash
# Clone repo
git clone https://github.com/crewlink/crewlink.git
cd crewlink

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Fill in NEXTAUTH_SECRET, DATABASE_URL, MAPBOX tokens

# Run Prisma migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start dev server
npm run dev

# Run tests
npm run test:e2e
```

### 12.2 Code Style & Linting

```bash
# ESLint check
npm run lint

# Fix linting errors
npm run lint:fix

# TypeScript check
npm run type-check

# Prettier format
npm run format
```

### 12.3 Git Workflow

```
main (production)
 ├─ staging (pre-production)
 └─ feature/* (feature branches)

Flow:
1. Create feature branch: git checkout -b feature/job-posting-ui
2. Commit with semantic messages: git commit -m "feat: add job title input"
3. Push: git push origin feature/job-posting-ui
4. Open PR → review → merge to staging
5. Staging tests pass → merge to main
6. Tag release: git tag v1.2.0 && git push --tags
```

---

## 13. DEVELOPMENT PHASE PRIORITIES

### Phase 1: Design System (Week 1–2)
- [ ] Establish Tailwind color tokens (brand-*, accent-*, success-*, slate-*)
- [ ] Create GlassPanel component with dark aesthetic
- [ ] Define spacing & typography scales
- [ ] Build Button, Input, Modal primitives
- [ ] Design system documentation

### Phase 2: Authentication (Week 2–3)
- [ ] NextAuth.js setup with credentials provider
- [ ] Sign-in, sign-up, forgot-password pages
- [ ] Role selection (HIRER vs WORKER)
- [ ] Session hydration in Zustand + React Context
- [ ] Protected API routes with `getServerSession()`

### Phase 3: Database & Backend (Week 3–4)
- [ ] Prisma schema (users, jobs, bids, conversations, notifications, reviews)
- [ ] Neon PostgreSQL setup
- [ ] Migration scripts
- [ ] API routes: /api/jobs/*, /api/bids/*, /api/conversations/*
- [ ] Data validation & error handling

### Phase 4: Core Features (Week 4–6)
- [ ] Job posting flow (create, edit, delete)
- [ ] Job discovery & filtering (map + list views)
- [ ] Worker bidding system
- [ ] Hirer bid acceptance/rejection
- [ ] Messaging between hirer & worker
- [ ] Real-time notifications

### Phase 5: Hirer Dashboard (Week 6–7)
- [ ] Dashboard layout & navigation
- [ ] My Jobs list + job detail view
- [ ] Map view with job markers
- [ ] Messages & notification center
- [ ] Reviews & ratings

### Phase 6: Worker Dashboard (Week 7–8)
- [ ] Dashboard layout & navigation
- [ ] Available jobs discovery
- [ ] My Bids history
- [ ] Messages & notification center
- [ ] Earnings & payout setup

### Phase 7: Map Integration (Week 8–9)
- [ ] Mapbox integration with API key setup
- [ ] Job clustering on map
- [ ] Geolocation request + fallback
- [ ] Map filters (category, budget, distance)
- [ ] Responsive map design (mobile bottom sheet)

### Phase 8: State Management (Week 9–10)
- [ ] Zustand mega-store (auth, map, jobs, messages, notifications, etc.)
- [ ] React Context (UserRole, AppMode)
- [ ] Hydration on app startup
- [ ] Persistence to localStorage with validation

### Phase 9: Testing (Week 10–11)
- [ ] Playwright E2E tests for critical flows
- [ ] QA agents (visual, performance, accessibility, API, security)
- [ ] Coverage reports
- [ ] CI/CD pipeline with GitHub Actions

### Phase 10: Deployment (Week 11–12)
- [ ] Vercel setup with env vars
- [ ] Prisma migrations to production
- [ ] Preview deployments for PRs
- [ ] Monitoring & error tracking (Sentry)
- [ ] Performance optimization

### Phase 11: SEO & Marketing (Week 12–13)
- [ ] Meta tags on all pages
- [ ] Structured data (Schema.org) for job posts
- [ ] City pages for local SEO
- [ ] Blog integration
- [ ] Landing page variants A–F

### Phase 12: Polish & Launch (Week 13–14)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security audit (OWASP, CSRF, XSS, SQL injection)
- [ ] Performance budget review
- [ ] User testing & feedback
- [ ] Soft launch + monitoring

---

## 14. AUDIT CHECKLIST

### Security Checklist
- [ ] All API routes validate `session` via `getServerSession()`
- [ ] Every resource query includes user scoping (e.g., `userId === session.user.id`)
- [ ] No sensitive data in URL parameters
- [ ] NEXTAUTH_SECRET generated and stored securely
- [ ] Environment variables not committed to repo (use .env.local)
- [ ] Passwords hashed with bcrypt (cost: 10)
- [ ] CSRF tokens on forms (if using form submission, not API)
- [ ] XSS prevention: sanitize user input, use React's default escaping
- [ ] SQL injection prevention: use Prisma parameterized queries
- [ ] Rate limiting on auth endpoints (optional: use middleware)
- [ ] No API keys in client-side code (Mapbox public token is safe)

### Functionality Checklist
- [ ] All API routes verify user owns the resource (job.userId === session.user.id)
- [ ] Role guards on all /hiring and /work routes
- [ ] Map works with geolocation denied (manual address fallback)
- [ ] Job posting flow works end-to-end (post → appears on map → worker sees it)
- [ ] Bid flow works end-to-end (worker bids → hirer sees bid → accept/reject)
- [ ] Messaging works between hirer and worker on a job
- [ ] Notification badges update in real-time (or on poll)
- [ ] Mobile bottom sheet works for map job selection
- [ ] Landing page variants (A-F) all render correctly
- [ ] City pages have proper SEO meta and structured data
- [ ] Job completion triggers earnings calculation
- [ ] Reviews and ratings persist correctly
- [ ] Payout methods saved securely (PCI compliance if Stripe)

### Performance Checklist
- [ ] Mapbox bundle size < 500KB (gzipped)
- [ ] First Contentful Paint (FCP) < 1.5s on desktop
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] API routes respond in < 500ms (p95)
- [ ] Database queries indexed properly (userId, jobId, etc.)
- [ ] Next.js Image component used for all images
- [ ] Zustand store updates do not cause unnecessary re-renders
- [ ] MessageBox/Chat list virtualized for performance
- [ ] Map markers use clustering for 100+ jobs

### Accessibility Checklist
- [ ] All form inputs have associated labels
- [ ] Buttons have aria-labels or text content
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Interactive elements keyboard navigable (Tab, Enter)
- [ ] Modal traps focus (first element on open, returns to trigger on close)
- [ ] Map has keyboard navigation (zoom with +/-, pan with arrow keys)
- [ ] Page structure uses semantic HTML (h1, h2, nav, main, footer)
- [ ] Error messages linked to form fields (aria-describedby)
- [ ] Loading states announced to screen readers (aria-live)
- [ ] Alt text on all images (not just decorative)

### SEO Checklist
- [ ] All pages have unique, descriptive meta titles (50–60 chars)
- [ ] Meta descriptions set on all pages (150–160 chars)
- [ ] Open Graph tags for social sharing
- [ ] Structured data (schema.org) for Job, Organization, Review
- [ ] City pages include location-based keywords
- [ ] Blog posts have proper heading hierarchy
- [ ] Internal links use descriptive anchor text (not "click here")
- [ ] XML sitemap generated and updated
- [ ] Robots.txt configured (allow crawlers, disallow /admin)
- [ ] Page speed optimized (Core Web Vitals)
- [ ] Mobile-friendly (responsive design, touch targets)

### Testing Checklist
- [ ] E2E tests cover all critical user flows (post → bid → accept → complete)
- [ ] Visual regression tests pass on all pages
- [ ] Accessibility audit passes (axe-playwright)
- [ ] API integration tests pass
- [ ] Security tests pass (CSRF, XSS, SQL injection)
- [ ] Performance tests pass (LCP, FID, CLS)
- [ ] Mobile tests pass (iOS Safari, Chrome Mobile)
- [ ] Desktop tests pass (Chrome, Firefox, Safari, Edge)

### Code Quality Checklist
- [ ] ESLint passes with no warnings
- [ ] TypeScript strict mode, no `any` types
- [ ] Prettier formatting consistent
- [ ] No console.log() statements in production code
- [ ] No TODO/FIXME comments without associated issues
- [ ] Component prop types documented (JSDoc)
- [ ] API route error handling consistent
- [ ] Zustand stores documented with usage examples
- [ ] README.md up-to-date with setup instructions
- [ ] CHANGELOG.md records all releases

### Deployment Checklist
- [ ] All env vars set in Vercel dashboard
- [ ] DATABASE_URL points to production DB (Neon)
- [ ] NEXTAUTH_URL set to production domain
- [ ] Mapbox tokens for production environment
- [ ] Sentry DSN configured
- [ ] Preview deployments pass all tests
- [ ] Production deployment passes all tests
- [ ] Database migrations applied
- [ ] Seed data not present in production
- [ ] Error pages (404, 500) tested
- [ ] Redirects working correctly

---

## 15. RESOURCES & REFERENCES

### Official Documentation
- [Next.js 14 App Router](https://nextjs.org/docs)
- [NextAuth.js v4](https://next-auth.js.org/)
- [Prisma ORM](https://www.prisma.io/docs/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Playwright](https://playwright.dev/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)

### CrewLink-Specific Guides
- `/docs/ARCHITECTURE.md` — System design patterns
- `/docs/COMPONENT_LIBRARY.md` — All component APIs
- `/docs/API_REFERENCE.md` — All API endpoint specs
- `/docs/DEPLOYMENT.md` — Vercel & database setup
- `/docs/TESTING.md` — Test framework & agent setup

### Commands
```bash
npm run dev                # Start dev server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run type-check         # Run TypeScript check
npm run test:e2e           # Run Playwright tests
npm run test:agents        # Run QA agents
npm run db:migrate         # Run Prisma migrations
npm run db:seed            # Seed database
npm run db:studio          # Open Prisma Studio (UI)
npm run format             # Format code with Prettier
```

---

## 16. CONTACT & SUPPORT

**Project Lead:** [Name]
**Product Manager:** [Name]
**Engineering Leads:** [Names]

**Slack Channel:** #crewlink-engineering
**Issues Tracker:** GitHub Issues
**Documentation:** Confluence / Notion

---

**END OF 00-MASTER-FULL-AUDIT.md**

---

## Document Maintenance

This document should be updated:
- **Weekly** — Add completed phases, resolved issues
- **Monthly** — Review architecture decisions, update tech stack versions
- **Quarterly** — Full audit against deployment checklist, security review

Last review: February 27, 2026
