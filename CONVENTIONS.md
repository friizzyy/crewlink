# CrewLink Code Conventions

This document establishes comprehensive code conventions for the CrewLink project—a premium gig economy platform built with Next.js 14, TypeScript, Tailwind CSS, Zustand, Prisma, and NextAuth.js. All team members must follow these conventions to maintain consistency, readability, and scalability across the codebase.

---

## 1. File and Directory Structure

### Overall Architecture
CrewLink follows a feature-based structure with clear separation between role-specific routes and shared components:

```
src/
├── app/
│   ├── (auth)                  # Authentication pages (optional grouping)
│   │   ├── sign-in/page.tsx
│   │   ├── create-account/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── select-role/page.tsx
│   ├── hiring/                 # Hirer dashboard (strict /hiring/* routes)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── map/
│   │   ├── jobs/
│   │   ├── job/[id]/
│   │   ├── post/
│   │   ├── new/
│   │   ├── messages/
│   │   ├── notifications/
│   │   ├── reviews/
│   │   ├── worker/[id]/
│   │   ├── profile/
│   │   └── settings/
│   ├── work/                   # Worker dashboard (strict /work/* routes)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── map/
│   │   ├── jobs/
│   │   ├── job/[id]/
│   │   ├── messages/
│   │   ├── notifications/
│   │   ├── earnings/
│   │   ├── transactions/
│   │   ├── hirer/[id]/
│   │   ├── profile/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── [...nextauth]/route.ts
│   │   ├── jobs/
│   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   ├── [id]/route.ts     # GET, PATCH, DELETE
│   │   │   ├── [id]/bids/route.ts
│   │   │   └── [id]/status/route.ts
│   │   ├── bids/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── conversations/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/messages/route.ts
│   │   ├── notifications/route.ts
│   │   ├── profile/route.ts
│   │   └── health/route.ts
│   ├── public/
│   ├── landing-a/ through landing-f/    # A/B test variants
│   ├── (marketing)/           # Optional grouping for marketing pages
│   │   ├── about/
│   │   ├── how-it-works/
│   │   ├── pricing/
│   │   ├── safety/
│   │   ├── cities/
│   │   ├── careers/
│   │   ├── blog/
│   │   ├── contact/
│   │   ├── privacy/
│   │   ├── terms/
│   │   └── help/
│   ├── team/
│   │   ├── julius-williams/
│   │   ├── ali-alkhaleef/
│   │   ├── ares-williams/
│   │   └── zahraa-alkhaleef/
│   ├── layout.tsx
│   ├── error.tsx
│   └── loading.tsx
├── components/
│   ├── ui/                     # Reusable UI primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   ├── card.tsx
│   │   ├── dropdown.tsx
│   │   ├── toast.tsx
│   │   ├── glass-panel.tsx
│   │   ├── live-dot.tsx
│   │   ├── geolocation-modal.tsx
│   │   ├── address-autocomplete.tsx
│   │   ├── budget-dropdown.tsx
│   │   └── category-dropdown.tsx
│   ├── map/                    # Map-related components
│   │   ├── mapbox-map.tsx
│   │   ├── leaflet-map.tsx
│   │   ├── virtual-map.tsx
│   │   └── map-states.tsx
│   ├── navigation/             # Navigation components
│   │   ├── hiring-nav.tsx
│   │   ├── worker-nav.tsx
│   │   ├── universal-nav.tsx
│   │   ├── nav-concept-a.tsx
│   │   ├── nav-concept-b.tsx
│   │   └── nav-concept-c.tsx
│   ├── cards/                  # Card components
│   │   ├── job-list-card.tsx
│   │   ├── job-post-list-card.tsx
│   │   └── worker-list-card.tsx
│   ├── layout/
│   │   └── header.tsx
│   ├── sidebar/
│   │   └── map-sidebar-shell.tsx
│   ├── access/                 # Role-based access
│   │   ├── role-guard.tsx
│   │   └── restricted-access.tsx
│   ├── providers/
│   │   └── session-provider.tsx
│   ├── ambient-background.tsx
│   ├── marketing-footer.tsx
│   ├── marketing-layout.tsx
│   └── universal-nav.tsx
├── store/
│   └── index.ts                # ALL Zustand stores (auth, mode, map, jobs, messages, notifications, onboarding, jobForm, UI)
├── contexts/
│   ├── user-role.context.tsx
│   └── app-mode.context.tsx
├── design/
│   └── tokens.ts
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── utils.ts
│   ├── constants.ts
│   ├── design-system.ts
│   ├── map-tokens.ts
│   ├── api.ts
│   ├── careers.ts
│   ├── categories.ts
│   └── cities-data.ts
├── hooks/
│   ├── use-mobile-animation.ts
│   └── use-scroll-reveal.ts
├── types/
│   └── index.ts                # All TypeScript types
├── qa/
│   ├── test.ts
│   └── mocks.ts
├── middleware.ts
└── globals.css
```

### Naming Conventions
- **Files**: Use kebab-case (e.g., `job-list-card.tsx`, `map-sidebar-shell.tsx`)
- **Directories**: Use lowercase kebab-case (e.g., `components/ui/`, `api/jobs/`)
- **Page routes**: Use descriptive names matching their purpose (e.g., `/hiring/jobs/`, `/work/map/`)
- **Dynamic routes**: Always use single brackets for segments (e.g., `[id]`, not `{id}`)

---

## 2. TypeScript and Type Safety

### Type Organization
All type definitions must be centralized in `src/types/index.ts`:

```typescript
// src/types/index.ts

// User and Auth
export type UserRole = 'hirer' | 'worker';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  rating?: number;
  completedJobs?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: User;
  expires: string;
  accessToken: string;
}

// Jobs and Bids
export type JobCategory =
  | 'cleaning'
  | 'moving'
  | 'handyman'
  | 'yard'
  | 'assembly'
  | 'painting'
  | 'event'
  | 'tech'
  | 'petcare'
  | 'errands'
  | 'other';

export type JobStatus = 'draft' | 'open' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'completed';

export interface Job {
  id: string;
  hirerId: string;
  title: string;
  description: string;
  category: JobCategory;
  status: JobStatus;
  budget: {
    min: number;
    max: number;
    currency: 'USD' | 'GBP';
  };
  location: {
    address: string;
    lat: number;
    lng: number;
    city: string;
    radius?: number;
  };
  startDate: Date;
  endDate?: Date;
  estimatedDuration?: string;
  skills?: string[];
  bidCount: number;
  acceptedBidId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  id: string;
  jobId: string;
  workerId: string;
  status: BidStatus;
  proposedRate: number;
  message?: string;
  estimatedDuration?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Messaging
export interface Conversation {
  id: string;
  participants: [string, string];
  relatedJobId?: string;
  relatedBidId?: string;
  lastMessage?: Message;
  lastMessageAt: Date;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

// Notifications
export type NotificationType =
  | 'new-bid'
  | 'bid-accepted'
  | 'bid-rejected'
  | 'message'
  | 'job-assigned'
  | 'job-cancelled'
  | 'review-received'
  | 'job-started'
  | 'job-completed';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  relatedId?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Geolocation
export interface GeolocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface MapViewport {
  center: GeolocationCoordinates;
  zoom: number;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Strict Type Rules
- Never use `any` type. Use `unknown` if needed, then narrow with guards
- Use discriminated unions for state variants:
  ```typescript
  // Good
  type MapState =
    | { status: 'loading' }
    | { status: 'loaded'; data: Job[] }
    | { status: 'error'; error: Error };

  // Avoid
  type MapState = {
    loading?: boolean;
    data?: Job[];
    error?: Error;
  };
  ```
- Use `readonly` for immutable data structures
- Always type function parameters and return types

---

## 3. Component Architecture

### Component Classification
Components are organized by responsibility and scope:

#### UI Primitives (`components/ui/`)
Single-purpose, highly reusable components:

```typescript
// components/ui/button.tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          // Variant styles
          variant === 'primary' && 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
          variant === 'secondary' && 'bg-slate-200 text-slate-900 hover:bg-slate-300',
          variant === 'ghost' && 'text-slate-700 hover:bg-slate-100',
          variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
          // Size styles
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-base',
          size === 'lg' && 'px-6 py-3 text-lg',
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <span className="mr-2 animate-spin">⚙️</span>}
        {props.children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

#### Feature Components (`components/map/`, `components/cards/`, etc.)
Multi-part components serving specific features:

```typescript
// components/cards/job-list-card.tsx
'use client';

import React from 'react';
import { Job } from '@/types';
import { Card } from '@/components/ui/card';
import { CategoryDropdown } from '@/components/ui/category-dropdown';
import Link from 'next/link';

interface JobListCardProps {
  job: Job;
  onSelect?: (jobId: string) => void;
  isSelected?: boolean;
}

export const JobListCard: React.FC<JobListCardProps> = ({
  job,
  onSelect,
  isSelected = false
}) => {
  return (
    <Link href={`/work/job/${job.id}`}>
      <Card
        className={`p-4 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-brand-500' : ''
        }`}
        onClick={() => onSelect?.(job.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{job.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{job.description}</p>
            <div className="flex gap-2 mt-3">
              <CategoryDropdown
                value={job.category}
                disabled
              />
              <span className="text-sm font-medium text-brand-600">
                ${job.budget.min} - ${job.budget.max}
              </span>
            </div>
          </div>
          <div className="text-right ml-4">
            <p className="text-2xl font-bold text-brand-600">
              {job.bidCount}
            </p>
            <p className="text-xs text-slate-500">bids</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
```

#### Map Components (Dual Provider Pattern)
Always use the dual-provider pattern for production resilience:

```typescript
// components/map/virtual-map.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { MapboxMap } from './mapbox-map';
import { LeafletMap } from './leaflet-map';
import { MapStates } from './map-states';
import { MapViewport } from '@/types';

interface VirtualMapProps {
  viewport: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  jobs?: Array<{ id: string; location: { lat: number; lng: number } }>;
  isLoading?: boolean;
}

export const VirtualMap: React.FC<VirtualMapProps> = ({
  viewport,
  onViewportChange,
  jobs,
  isLoading = false,
}) => {
  const [useLeaflet, setUseLeaflet] = useState(false);

  // Fall back to Leaflet if Mapbox fails
  const handleMapboxError = () => {
    console.warn('Mapbox failed to load, falling back to Leaflet');
    setUseLeaflet(true);
  };

  if (isLoading) {
    return <MapStates.Loading />;
  }

  if (useLeaflet) {
    return (
      <LeafletMap
        viewport={viewport}
        onViewportChange={onViewportChange}
        jobs={jobs}
      />
    );
  }

  return (
    <MapboxMap
      viewport={viewport}
      onViewportChange={onViewportChange}
      jobs={jobs}
      onError={handleMapboxError}
    />
  );
};
```

#### Layout Components
Page-level layout wrappers:

```typescript
// components/layout/header.tsx
'use client';

import React from 'react';
import { useAuthStore } from '@/store';
import { HiringNav } from '@/components/navigation/hiring-nav';
import { WorkerNav } from '@/components/navigation/worker-nav';

interface HeaderProps {
  variant?: 'hiring' | 'worker';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'worker' }) => {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-soft">
      <div className="max-w-screen-2xl mx-auto px-4">
        {variant === 'hiring' && <HiringNav currentUser={user} />}
        {variant === 'worker' && <WorkerNav currentUser={user} />}
      </div>
    </header>
  );
};
```

### Component Patterns

#### Client vs Server Components
- Use `'use client'` only when necessary (state, hooks, event handlers)
- Prefer Server Components for data fetching and reduced bundle size
- Example of proper split:

```typescript
// app/hiring/jobs/page.tsx (Server Component)
import { JobsListContainer } from '@/components/containers/jobs-list-container';
import { getJobsByHirer } from '@/lib/db';

export default async function HiringJobsPage() {
  const jobs = await getJobsByHirer(params.hirerId);
  return <JobsListContainer initialJobs={jobs} />;
}

// components/containers/jobs-list-container.tsx (Client Component)
'use client';

import { useState } from 'react';
import { Job } from '@/types';

interface JobsListContainerProps {
  initialJobs: Job[];
}

export const JobsListContainer: React.FC<JobsListContainerProps> = ({
  initialJobs
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  // Handle client-side filtering, sorting, etc.
  return <div>{/* ... */}</div>;
};
```

#### Props Interfaces
Always define props interfaces explicitly:

```typescript
// Good
interface JobPostListCardProps {
  job: Job;
  onEdit?: (jobId: string) => void;
  onDelete?: (jobId: string) => Promise<void>;
  isLoading?: boolean;
}

// Avoid
export const JobPostListCard = (props: any) => {
  // ...
};
```

#### Compound Components Pattern
Use for complex UI groups:

```typescript
// components/ui/card.tsx
export const Card = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="rounded-lg border border-slate-200 bg-white" {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="border-b border-slate-200 px-6 py-4">{children}</div>
);

export const CardBody = ({ children }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="px-6 py-4">{children}</div>
);

// Usage
<Card>
  <CardHeader>Job Details</CardHeader>
  <CardBody>Job information here</CardBody>
</Card>
```

---

## 4. State Management with Zustand

### Store Organization
All stores are defined in `src/store/index.ts` for centralization and easy refactoring:

```typescript
// src/store/index.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Job, Message, Notification, MapViewport, JobCategory } from '@/types';

// ============================================================================
// AUTH STORE
// ============================================================================

interface AuthStore {
  user: User | null;
  session: { accessToken: string; expires: string } | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: AuthStore['session']) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;

  // Async actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearAuth: () => set({ user: null, session: null, error: null }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) throw new Error('Login failed');
          const data = await res.json();
          set({ user: data.user, session: data.session });
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, role) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role }),
          });
          if (!res.ok) throw new Error('Registration failed');
          const data = await res.json();
          set({ user: data.user, session: data.session });
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
          set({ user: null, session: null });
        } finally {
          set({ isLoading: false });
        }
      },

      switchRole: (newRole) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, role: newRole } });
        }
      },
    }),
    {
      name: 'crewlink-auth',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// ============================================================================
// APP MODE STORE (hire vs work toggle)
// ============================================================================

interface AppModeStore {
  mode: 'hiring' | 'working';
  setMode: (mode: 'hiring' | 'working') => void;
}

export const useAppModeStore = create<AppModeStore>()(
  persist(
    (set) => ({
      mode: 'working',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'crewlink-app-mode' }
  )
);

// ============================================================================
// MAP STORE
// ============================================================================

interface MapStore {
  viewport: MapViewport;
  geolocation: { lat: number; lng: number } | null;
  selectedCity: string;
  searchQuery: string;
  isFollowingUser: boolean;
  mapStyle: 'streets' | 'satellite' | 'light' | 'dark';
  isLoadingGeolocation: boolean;

  // Actions
  setViewport: (viewport: MapViewport) => void;
  setGeolocation: (coords: { lat: number; lng: number } | null) => void;
  setSelectedCity: (city: string) => void;
  setSearchQuery: (query: string) => void;
  setFollowingUser: (following: boolean) => void;
  setMapStyle: (style: MapStore['mapStyle']) => void;
  setLoadingGeolocation: (loading: boolean) => void;

  // Async actions
  requestGeolocation: () => Promise<void>;
}

export const useMapStore = create<MapStore>()(
  persist(
    (set) => ({
      viewport: {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 12,
      },
      geolocation: null,
      selectedCity: 'New York',
      searchQuery: '',
      isFollowingUser: false,
      mapStyle: 'streets',
      isLoadingGeolocation: false,

      setViewport: (viewport) => set({ viewport }),
      setGeolocation: (coords) => set({ geolocation: coords }),
      setSelectedCity: (city) => set({ selectedCity: city }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setFollowingUser: (following) => set({ isFollowingUser: following }),
      setMapStyle: (style) => set({ mapStyle: style }),
      setLoadingGeolocation: (loading) => set({ isLoadingGeolocation: loading }),

      requestGeolocation: async () => {
        set({ isLoadingGeolocation: true });
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              maximumAge: 0,
            });
          });
          const { latitude, longitude } = position.coords;
          set({
            geolocation: { lat: latitude, lng: longitude },
            viewport: {
              center: { lat: latitude, lng: longitude },
              zoom: 15,
            },
            isFollowingUser: true,
          });
        } catch (error) {
          console.error('Geolocation error:', error);
        } finally {
          set({ isLoadingGeolocation: false });
        }
      },
    }),
    { name: 'crewlink-map' }
  )
);

// ============================================================================
// JOBS STORE
// ============================================================================

interface JobsStore {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category?: JobCategory;
    maxDistance?: number;
    minBudget?: number;
    maxBudget?: number;
  };

  // Actions
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (jobId: string, updates: Partial<Job>) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: JobsStore['filters']) => void;

  // Async actions
  fetchJobs: (params?: Record<string, any>) => Promise<void>;
  fetchJobById: (jobId: string) => Promise<Job | null>;
}

export const useJobsStore = create<JobsStore>((set, get) => ({
  jobs: [],
  isLoading: false,
  error: null,
  filters: {},

  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (jobId, updates) =>
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, ...updates } : j)),
    })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setFilters: (filters) => set({ filters }),

  fetchJobs: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryString = new URLSearchParams(params).toString();
      const res = await fetch(`/api/jobs?${queryString}`);
      if (!res.ok) throw new Error('Failed to fetch jobs');
      const data = await res.json();
      set({ jobs: data.jobs });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchJobById: async (jobId) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
}));

// ============================================================================
// MESSAGES STORE
// ============================================================================

interface MessagesStore {
  conversations: Conversation[];
  selectedConversationId: string | null;
  messagesByConversation: Record<string, Message[]>;
  isLoading: boolean;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setSelectedConversation: (conversationId: string | null) => void;
  setMessagesByConversation: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setIsLoading: (loading: boolean) => void;

  // Async actions
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
}

export const useMessagesStore = create<MessagesStore>((set, get) => ({
  conversations: [],
  selectedConversationId: null,
  messagesByConversation: {},
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),
  setSelectedConversation: (conversationId) => set({ selectedConversationId: conversationId }),
  setMessagesByConversation: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: messages,
      },
    })),
  addMessage: (conversationId, message) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [...(state.messagesByConversation[conversationId] || []), message],
      },
    })),
  setIsLoading: (loading) => set({ isLoading: loading }),

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/conversations');
      if (!res.ok) throw new Error('Failed to fetch conversations');
      const data = await res.json();
      set({ conversations: data.conversations });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: data.messages,
        },
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: async (conversationId, content) => {
    const { messagesByConversation } = get();
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: 'current-user', // Replace with actual user ID
      content,
      isRead: true,
      createdAt: new Date(),
    };

    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [
          ...(state.messagesByConversation[conversationId] || []),
          tempMessage,
        ],
      },
    }));

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();
      // Replace temp message with real one
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [
            ...(state.messagesByConversation[conversationId] || []).filter(
              (m) => m.id !== tempMessage.id
            ),
            data.message,
          ],
        },
      }));
    } catch (error) {
      // Remove temp message on error
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: (state.messagesByConversation[conversationId] || []).filter(
            (m) => m.id !== tempMessage.id
          ),
        },
      }));
      throw error;
    }
  },
}));

// ============================================================================
// NOTIFICATIONS STORE
// ============================================================================

interface NotificationsStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  // Actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  setIsLoading: (loading: boolean) => void;

  // Async actions
  fetchNotifications: () => Promise<void>;
}

export const useNotificationsStore = create<NotificationsStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
    })),
  markAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  setIsLoading: (loading) => set({ isLoading: loading }),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      set({ notifications: data.notifications, unreadCount: data.unreadCount });
    } finally {
      set({ isLoading: false });
    }
  },
}));

// ============================================================================
// ONBOARDING STORE
// ============================================================================

interface OnboardingStore {
  completedSteps: ('role-selection' | 'profile-setup' | 'payment' | 'verification')[];
  currentStep: number;

  // Actions
  completeStep: (step: OnboardingStore['completedSteps'][number]) => void;
  setCurrentStep: (step: number) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      completedSteps: [],
      currentStep: 0,

      completeStep: (step) =>
        set((state) => ({
          completedSteps: [...new Set([...state.completedSteps, step])],
        })),
      setCurrentStep: (step) => set({ currentStep: step }),
      resetOnboarding: () => set({ completedSteps: [], currentStep: 0 }),
    }),
    { name: 'crewlink-onboarding' }
  )
);

// ============================================================================
// JOB FORM STORE (multi-step wizard with autosave)
// ============================================================================

interface JobFormState {
  title: string;
  description: string;
  category: JobCategory | '';
  location: { address: string; lat?: number; lng?: number } | null;
  budget: { min: number; max: number } | null;
  startDate: Date | null;
  endDate?: Date | null;
  estimatedDuration: string;
  skills: string[];
  isDraft: boolean;
  lastSaved: Date | null;
}

interface JobFormStore extends JobFormState {
  // Actions
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setCategory: (category: JobCategory | '') => void;
  setLocation: (location: JobFormState['location']) => void;
  setBudget: (budget: JobFormState['budget']) => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  setEstimatedDuration: (duration: string) => void;
  setSkills: (skills: string[]) => void;

  // Async actions
  saveDraft: () => Promise<void>;
  submitForm: () => Promise<Job>;
  resetForm: () => void;
}

const initialJobFormState: JobFormState = {
  title: '',
  description: '',
  category: '',
  location: null,
  budget: null,
  startDate: null,
  endDate: null,
  estimatedDuration: '',
  skills: [],
  isDraft: true,
  lastSaved: null,
};

export const useJobFormStore = create<JobFormStore>()(
  persist(
    (set, get) => ({
      ...initialJobFormState,

      setTitle: (title) => set({ title }),
      setDescription: (description) => set({ description }),
      setCategory: (category) => set({ category }),
      setLocation: (location) => set({ location }),
      setBudget: (budget) => set({ budget }),
      setStartDate: (date) => set({ startDate: date }),
      setEndDate: (date) => set({ endDate: date }),
      setEstimatedDuration: (duration) => set({ estimatedDuration: duration }),
      setSkills: (skills) => set({ skills }),

      saveDraft: async () => {
        const state = get();
        try {
          const res = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...state, isDraft: true }),
          });
          if (!res.ok) throw new Error('Failed to save draft');
          set({ lastSaved: new Date() });
        } catch (error) {
          console.error('Draft save error:', error);
          throw error;
        }
      },

      submitForm: async () => {
        const state = get();
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...state, isDraft: false }),
        });
        if (!res.ok) throw new Error('Failed to submit job');
        const job = await res.json();
        get().resetForm();
        return job;
      },

      resetForm: () => set(initialJobFormState),
    }),
    { name: 'crewlink-job-form' }
  )
);

// ============================================================================
// UI STORE (mobile menu, filter drawer, bottom sheet, toasts)
// ============================================================================

interface UIStore {
  mobileMenuOpen: boolean;
  filterDrawerOpen: boolean;
  bottomSheetOpen: boolean;
  bottomSheetContent: string | null;
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>;

  // Actions
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleFilterDrawer: () => void;
  setFilterDrawerOpen: (open: boolean) => void;
  openBottomSheet: (content: string) => void;
  closeBottomSheet: () => void;
  addToast: (toast: Omit<UIStore['toasts'][number], 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  mobileMenuOpen: false,
  filterDrawerOpen: false,
  bottomSheetOpen: false,
  bottomSheetContent: null,
  toasts: [],

  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleFilterDrawer: () =>
    set((state) => ({ filterDrawerOpen: !state.filterDrawerOpen })),
  setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),
  openBottomSheet: (content) =>
    set({ bottomSheetOpen: true, bottomSheetContent: content }),
  closeBottomSheet: () =>
    set({ bottomSheetOpen: false, bottomSheetContent: null }),
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: `toast-${Date.now()}`, ...toast },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));
```

### Store Usage Rules
- **Always define actions inside stores**, never in components
- Use `persist` middleware for data that needs to survive page refreshes
- For async operations, follow the pattern: set loading → try/catch → set result
- Never directly modify store state; use actions
- Use `get()` to access current state in async operations
- Selectors can be created with `useShallow()` for performance:
  ```typescript
  const { jobs, filters } = useJobsStore(useShallow((state) => ({
    jobs: state.jobs,
    filters: state.filters,
  })));
  ```

---

## 5. Routing and Navigation

### Role-Based Routing Convention
CrewLink uses strict role separation. All hirer routes start with `/hiring/`, all worker routes start with `/work/`:

```typescript
// src/middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Allow public routes
  const publicRoutes = [
    '/',
    '/sign-in',
    '/create-account',
    '/forgot-password',
    '/select-role',
    '/about',
    '/how-it-works',
    '/pricing',
  ];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Protect role-specific routes
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Hirer can only access /hiring/*
  if (pathname.startsWith('/hiring') && token.role !== 'hirer') {
    return NextResponse.redirect(new URL('/work', request.url));
  }

  // Worker can only access /work/*
  if (pathname.startsWith('/work') && token.role !== 'worker') {
    return NextResponse.redirect(new URL('/hiring', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/hiring/:path*', '/work/:path*'],
};
```

### Layout Structure
Each dashboard has a dedicated layout:

```typescript
// app/hiring/layout.tsx
import { RoleGuard } from '@/components/access/role-guard';
import { Header } from '@/components/layout/header';
import { HiringNav } from '@/components/navigation/hiring-nav';

export default function HiringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard role="hirer">
      <div className="flex h-screen flex-col">
        <Header variant="hiring" />
        <div className="flex flex-1 overflow-hidden">
          <HiringNav className="hidden md:flex" />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
```

### Page Organization
Pages are organized by feature area:

```typescript
// Hirer routes
/hiring/                    # Dashboard home
/hiring/jobs/              # List posted jobs
/hiring/job/[id]/          # View specific job, manage bids
/hiring/post/              # New job post workflow
/hiring/new/               # Quick job posting
/hiring/map/               # Worker map view
/hiring/messages/          # Conversations with workers
/hiring/messages/[id]/     # Specific conversation
/hiring/notifications/     # Notifications
/hiring/reviews/           # Reviews and ratings
/hiring/worker/[id]/       # Worker profile
/hiring/profile/           # Hirer profile settings
/hiring/settings/          # Account and preferences

// Worker routes
/work/                     # Dashboard home
/work/jobs/                # Available jobs
/work/job/[id]/            # View job, submit bid
/work/map/                 # Jobs map view
/work/messages/            # Conversations with hirers
/work/messages/[id]/       # Specific conversation
/work/notifications/       # Notifications
/work/earnings/            # Earnings summary
/work/transactions/        # Transaction history
/work/hirer/[id]/          # Hirer profile
/work/profile/             # Worker profile settings
/work/settings/            # Account and preferences
```

---

## 6. API Routes and Data Fetching

### API Route Naming
All API routes follow RESTful conventions:

```typescript
// Listing and creating
GET    /api/jobs              # List all jobs
POST   /api/jobs              # Create new job
GET    /api/jobs/[id]         # Get specific job
PATCH  /api/jobs/[id]         # Update job
DELETE /api/jobs/[id]         # Delete job

// Nested resources
GET    /api/jobs/[id]/bids    # Get bids for a job
POST   /api/jobs/[id]/bids    # Submit new bid
GET    /api/jobs/[id]/status  # Get job status updates
PATCH  /api/jobs/[id]/status  # Update job status

// Bidding
GET    /api/bids/[id]         # Get specific bid
PATCH  /api/bids/[id]         # Update bid (accept/reject)
DELETE /api/bids/[id]         # Withdraw bid

// Messaging
GET    /api/conversations     # List conversations
POST   /api/conversations     # Create conversation
GET    /api/conversations/[id]              # Get conversation details
GET    /api/conversations/[id]/messages     # Get messages
POST   /api/conversations/[id]/messages     # Send message

// Other
GET    /api/notifications      # Get notifications
GET    /api/profile            # Get user profile
PATCH  /api/profile            # Update user profile
GET    /api/health             # Health check
```

### API Route Implementation Pattern
```typescript
// app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { jobSchema } from '@/lib/schemas';
import { ApiResponse, Job } from '@/types';

// List jobs with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const maxDistance = searchParams.get('maxDistance');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const city = searchParams.get('city');

    const jobs = await prisma.job.findMany({
      where: {
        status: 'open',
        ...(category && { category }),
        ...(minBudget && { budget: { gte: parseInt(minBudget) } }),
        ...(maxBudget && { budget: { lte: parseInt(maxBudget) } }),
        ...(city && { location: { city } }),
      },
      include: { hirer: true, bids: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const response: ApiResponse<Job[]> = {
      success: true,
      data: jobs,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// Create new job
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'hirer') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = jobSchema.parse(body);

    const job = await prisma.job.create({
      data: {
        ...validated,
        hirerId: session.user.id,
        status: validated.isDraft ? 'draft' : 'open',
      },
      include: { hirer: true },
    });

    return NextResponse.json(
      { success: true, data: job },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 400 }
    );
  }
}

// app/api/jobs/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: { hirer: true, bids: true },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const job = await prisma.job.findUnique({
      where: { id: params.id },
    });

    if (!job || job.hirerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const updated = await prisma.job.update({
      where: { id: params.id },
      data: body,
      include: { hirer: true, bids: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: params.id },
    });

    if (!job || job.hirerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.job.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
```

### Data Fetching Patterns
Use `fetch` with proper error handling:

```typescript
// Good: fetch in Server Components
// app/hiring/jobs/page.tsx
import { Job } from '@/types';

async function getJobs(filters?: Record<string, string>): Promise<Job[]> {
  const queryString = new URLSearchParams(filters).toString();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?${queryString}`, {
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.statusText}`);
  }

  const data = await res.json();
  return data.data;
}

export default async function HiringJobsPage() {
  const jobs = await getJobs();

  return (
    <div>
      {/* render jobs */}
    </div>
  );
}
```

---

## 7. Styling with Tailwind CSS

### Design Tokens
Use the centralized design token system:

```typescript
// src/design/tokens.ts
export const DESIGN_TOKENS = {
  // Brand colors (primary blues)
  brand: {
    50: '#f0f7ff',
    100: '#e0eeff',
    200: '#c7deff',
    300: '#a3c8ff',
    400: '#7aacff',
    500: '#5a8fd9',
    600: '#1e40af', // Primary
    700: '#1e3a8a',
    800: '#1e2d5f',
    900: '#0f172a',
    950: '#0c0f1a',
  },
  // Accent colors (secondary oranges)
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // Primary accent
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  },
  // Success colors (greens)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
  },
  // Shadows
  shadow: {
    soft: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    heavy: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(30, 64, 175, 0.3)',
    'glow-accent': '0 0 20px rgba(249, 115, 22, 0.3)',
  },
  // Animations (30+ in tailwind.config.ts)
  animation: {
    fadeIn: 'fadeIn 0.3s ease-in',
    slideUp: 'slideUp 0.3s ease-out',
    slideDown: 'slideDown 0.3s ease-out',
    // ... more
  },
};
```

### Tailwind Usage
Always use the color system for consistency:

```typescript
// Good: Use design token colors
<div className="bg-brand-600 text-white hover:bg-brand-700 shadow-glow rounded-lg p-4">
  Premium Job Listing
</div>

// Good: Combine classes for variants
<button className={cn(
  'px-4 py-2 rounded-lg font-medium transition-all',
  isActive && 'bg-brand-600 text-white',
  !isActive && 'bg-slate-200 text-slate-900 hover:bg-slate-300',
)}>
  Submit Bid
</button>

// Avoid: Hardcoded colors
<div className="bg-blue-500">...</div> // Wrong
<div className="bg-#1e40af">...</div>  // Wrong
```

### Glass Panel Pattern
Use for premium dark UI aesthetic:

```typescript
// components/ui/glass-panel.tsx
interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'dark' | 'light';
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  variant = 'dark',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border backdrop-blur-lg',
        variant === 'dark' && 'bg-slate-900/50 border-slate-700/50',
        variant === 'light' && 'bg-white/20 border-white/30',
        className
      )}
      {...props}
    />
  );
};

// Usage
<GlassPanel variant="dark" className="p-6">
  <h2 className="text-white">Premium Feature</h2>
</GlassPanel>
```

### Animation Usage
Use Framer Motion for complex animations:

```typescript
// components/map/mapbox-map.tsx
'use client';

import { motion } from 'framer-motion';

export const MapboxMap = ({ jobs, ...props }: MapboxMapProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div ref={mapContainer} className="w-full h-full" />
      {jobs.map((job, i) => (
        <motion.div
          key={job.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          {/* Job marker */}
        </motion.div>
      ))}
    </motion.div>
  );
};
```

---

## 8. Map Component Patterns

### Dual Provider Pattern (Mapbox + Leaflet)
Always implement fallback to ensure service reliability:

```typescript
// components/map/mapbox-map.tsx
'use client';

import mapboxgl, { Map as MapboxGLMap } from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { MapViewport } from '@/types';

interface MapboxMapProps {
  viewport: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  jobs?: Array<{ id: string; location: { lat: number; lng: number } }>;
  onError?: () => void;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  viewport,
  onViewportChange,
  jobs,
  onError,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxGLMap | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [viewport.center.lng, viewport.center.lat],
        zoom: viewport.zoom,
      });

      // Add job markers
      jobs?.forEach((job) => {
        new mapboxgl.Marker({ color: '#1e40af' })
          .setLngLat([job.location.lng, job.location.lat])
          .addTo(map.current!);
      });

      // Listen to viewport changes
      map.current.on('move', () => {
        const center = map.current!.getCenter();
        const zoom = map.current!.getZoom();
        onViewportChange?.({
          center: { lat: center.lat, lng: center.lng },
          zoom,
        });
      });
    } catch (error) {
      console.error('Mapbox initialization error:', error);
      onError?.();
    }

    return () => {
      map.current?.remove();
    };
  }, [viewport, jobs, onViewportChange, onError]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

// components/map/leaflet-map.tsx
'use client';

import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { MapViewport } from '@/types';

interface LeafletMapProps {
  viewport: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  jobs?: Array<{ id: string; location: { lat: number; lng: number } }>;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  viewport,
  onViewportChange,
  jobs,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = L.map(mapContainer.current).setView(
      [viewport.center.lat, viewport.center.lng],
      viewport.zoom
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map.current);

    // Add job markers
    jobs?.forEach((job) => {
      L.circleMarker([job.location.lat, job.location.lng], {
        radius: 8,
        color: '#1e40af',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7,
      }).addTo(map.current!);
    });

    // Listen to viewport changes
    map.current.on('moveend', () => {
      const center = map.current!.getCenter();
      const zoom = map.current!.getZoom();
      onViewportChange?.({
        center: { lat: center.lat, lng: center.lng },
        zoom,
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [viewport, jobs, onViewportChange]);

  return <div ref={mapContainer} className="w-full h-full" />;
};

// components/map/virtual-map.tsx (Wrapper with fallback)
'use client';

import { useState } from 'react';
import { MapboxMap } from './mapbox-map';
import { LeafletMap } from './leaflet-map';
import { MapViewport } from '@/types';

interface VirtualMapProps {
  viewport: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  jobs?: Array<{ id: string; location: { lat: number; lng: number } }>;
  isLoading?: boolean;
}

export const VirtualMap: React.FC<VirtualMapProps> = ({
  viewport,
  onViewportChange,
  jobs,
  isLoading = false,
}) => {
  const [useLeaflet, setUseLeaflet] = useState(false);

  if (useLeaflet) {
    return (
      <LeafletMap
        viewport={viewport}
        onViewportChange={onViewportChange}
        jobs={jobs}
      />
    );
  }

  return (
    <MapboxMap
      viewport={viewport}
      onViewportChange={onViewportChange}
      jobs={jobs}
      onError={() => setUseLeaflet(true)}
    />
  );
};
```

### Geolocation Pattern
```typescript
// hooks/use-geolocation.ts
'use client';

import { useEffect, useState } from 'react';
import { useMapStore } from '@/store';

export const useGeolocation = () => {
  const [error, setError] = useState<string | null>(null);
  const { setGeolocation, setLoadingGeolocation, isLoadingGeolocation } = useMapStore();

  const requestLocation = () => {
    setLoadingGeolocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoadingGeolocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeolocation({ lat: latitude, lng: longitude });
        setLoadingGeolocation(false);
      },
      (err) => {
        setError(err.message);
        setLoadingGeolocation(false);
      },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  return { requestLocation, error, isLoading: isLoadingGeolocation };
};
```

---

## 9. Mobile and Responsive Patterns

### Bottom Sheet Pattern
Used extensively for mobile map interactions:

```typescript
// components/ui/bottom-sheet.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store';

export const BottomSheet: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { bottomSheetOpen, closeBottomSheet } = useUIStore();

  return (
    <AnimatePresence>
      {bottomSheetOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBottomSheet}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white rounded-t-2xl"
          >
            <div className="flex justify-center pt-2 pb-4">
              <div className="h-1 w-12 bg-slate-300 rounded-full" />
            </div>
            <div className="px-4 pb-safe-area-inset-bottom">
              {children}
            </div>
          </motion.div>
        </>
      );
    </AnimatePresence>
  );
};

// Usage
<BottomSheet>
  <h2>Filter Jobs</h2>
  {/* Filter controls */}
</BottomSheet>
```

### Responsive Breakpoints
Follow Tailwind defaults; test mobile-first:

```typescript
// Good: Mobile-first responsive design
<div className="
  w-full px-4 py-6           // Mobile defaults
  md:w-2/3 md:px-6 md:py-8   // Tablet and up
  lg:w-1/2 lg:px-8           // Desktop and up
">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">
    Find Your Next Gig
  </h1>
</div>

// Avoid: Desktop-first (harder to read, worse performance)
<div className="w-1/2 px-8 md:w-2/3 md:px-6 sm:w-full sm:px-4">
  ...
</div>
```

---

## 10. Form Handling and Validation

### Zod Schema Usage
```typescript
// lib/schemas.ts
import { z } from 'zod';
import { JobCategory } from '@/types';

const jobCategoryEnum = z.enum([
  'cleaning',
  'moving',
  'handyman',
  'yard',
  'assembly',
  'painting',
  'event',
  'tech',
  'petcare',
  'errands',
  'other',
] as const);

export const jobSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: jobCategoryEnum,
  location: z.object({
    address: z.string().min(5),
    lat: z.number(),
    lng: z.number(),
    city: z.string(),
    radius: z.number().optional(),
  }),
  budget: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
  }),
  startDate: z.date(),
  endDate: z.date().optional(),
  estimatedDuration: z.string().optional(),
  skills: z.array(z.string()).optional(),
  isDraft: z.boolean().default(true),
});

export const bidSchema = z.object({
  jobId: z.string().uuid(),
  proposedRate: z.number().positive('Rate must be positive'),
  message: z.string().optional(),
  estimatedDuration: z.string().optional(),
});

export type JobInput = z.infer<typeof jobSchema>;
export type BidInput = z.infer<typeof bidSchema>;
```

### Form Component Pattern
```typescript
// components/forms/job-post-form.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useJobFormStore } from '@/store';
import { jobSchema, JobInput } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryDropdown } from '@/components/ui/category-dropdown';
import toast from 'react-hot-toast';

export const JobPostForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
  });

  const {
    title,
    setTitle,
    saveDraft,
    submitForm,
  } = useJobFormStore();

  const onSubmit = async (data: JobInput) => {
    try {
      const job = await submitForm();
      toast.success('Job posted successfully!');
      // Redirect to job detail
    } catch (error) {
      toast.error('Failed to post job');
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft();
      toast.success('Draft saved');
    } catch (error) {
      toast.error('Failed to save draft');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form fields */}
      <div>
        <label className="block text-sm font-medium text-slate-900">
          Job Title
        </label>
        <Input
          {...register('title')}
          placeholder="e.g., House Cleaning - 3 Bedroom"
          className="mt-1"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* More fields... */}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={handleSaveDraft}
          disabled={isSubmitting}
        >
          Save Draft
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          Post Job
        </Button>
      </div>
    </form>
  );
};
```

---

## 11. Authentication and Authorization

### NextAuth.js v4 Setup
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !(await comparePasswords(credentials.password, user.password))) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Role Guard Component
```typescript
// components/access/role-guard.tsx
'use client';

import React from 'react';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';

interface RoleGuardProps {
  role: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  role,
  children,
  fallback,
}) => {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  if (user.role !== role) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-600 mt-2">You don't have permission to access this page</p>
        </div>
      )
    );
  }

  return <>{children}</>;
};
```

---

## 12. Error Handling and Logging

### Error Boundaries
```typescript
// app/error.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <h1 className="text-3xl font-bold text-slate-900">Something went wrong</h1>
      <p className="text-slate-600 mt-2">{error.message}</p>
      <Button onClick={reset} variant="primary" className="mt-6">
        Try again
      </Button>
    </div>
  );
}
```

### API Error Response Pattern
```typescript
// lib/api-errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Usage in routes
export async function GET(request: NextRequest) {
  try {
    // ...
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 13. Testing

### Test File Organization
```
src/
├── __tests__/
│   ├── components/
│   │   └── job-list-card.test.tsx
│   ├── store/
│   │   └── auth.store.test.ts
│   ├── lib/
│   │   └── utils.test.ts
│   └── e2e/
│       ├── hirer-workflow.spec.ts
│       └── worker-workflow.spec.ts
```

### Playwright E2E Testing
```typescript
// tests/e2e/worker-job-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Worker Job Search', () => {
  test('should display available jobs on map', async ({ page }) => {
    await page.goto('http://localhost:3000/work/map');

    // Wait for map to load
    await page.waitForSelector('[data-testid="mapbox-map"]');

    // Check that job markers are visible
    const markers = page.locator('[data-testid="job-marker"]');
    expect(markers).toHaveCount(5);
  });

  test('should filter jobs by category', async ({ page }) => {
    await page.goto('http://localhost:3000/work/jobs');

    // Open filter drawer
    await page.click('[data-testid="filter-button"]');

    // Select category
    await page.click('[data-testid="category-cleaning"]');

    // Verify filtered results
    const cards = page.locator('[data-testid="job-card"]');
    await expect(cards.first()).toContainText('Cleaning');
  });
});
```

---

## 14. Performance Optimization

### Image Optimization
Use Next.js Image component:

```typescript
// components/worker-list-card.tsx
import Image from 'next/image';

export const WorkerListCard = ({ worker }: Props) => {
  return (
    <Card>
      <Image
        src={worker.avatar}
        alt={worker.name}
        width={100}
        height={100}
        className="rounded-full"
        priority={false}
      />
      {/* ... */}
    </Card>
  );
};
```

### Code Splitting
Use dynamic imports for heavy components:

```typescript
import dynamic from 'next/dynamic';

const MapboxMap = dynamic(
  () => import('@/components/map/mapbox-map').then((mod) => mod.MapboxMap),
  { loading: () => <div>Loading map...</div> }
);

export default function Page() {
  return <MapboxMap />;
}
```

### Query Optimization
Use Prisma select to limit fields:

```typescript
// lib/db.ts
export const getJobsByHirer = (hirerId: string) => {
  return prisma.job.findMany({
    where: { hirerId },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      budget: true,
      _count: {
        select: { bids: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};
```

---

## 15. Git and Version Control

### Commit Message Convention
Follow conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Examples:
```
feat(jobs): add job filtering by category
fix(auth): resolve session persistence bug
refactor(map): simplify viewport state management
docs(api): update job endpoint documentation
```

### Branch Naming
```
feature/job-filtering
feature/worker-profile
fix/mapbox-fallback
docs/api-routes
```

---

## 16. Environment and Configuration

### .env.local Structure
```
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crewlink

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
NEXT_PUBLIC_MAPBOX_STYLE=mapbox://styles/mapbox/streets-v12

# API
NEXT_PUBLIC_API_URL=http://localhost:3000
API_TOKEN=your-api-token

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_AB_TEST_VARIANT=landing-a
```

### Deployment (Vercel)
- Use Vercel's environment variables UI for production secrets
- Enable Preview Deployments for pull requests
- Set up automatic deployments from main branch

---

## 17. Documentation and Commenting

### Code Comments
Use comments for "why", not "what":

```typescript
// Good: Explains the reason
// Fallback to Leaflet if Mapbox token is missing or service is down
// This ensures map functionality works even if primary provider fails
if (!mapboxToken || mapboxError) {
  setUseLeaflet(true);
}

// Avoid: Restates what code does
// Set useLeaflet to true
setUseLeaflet(true);
```

### Documentation Templates
Create `.md` files for complex features:

```markdown
# Job Filtering Feature

## Overview
Allows workers to filter available jobs by category, budget, distance, and more.

## Store State
- `filters`: Current filter selections
- `jobs`: Filtered job results

## API Endpoint
`GET /api/jobs?category=cleaning&maxDistance=5&minBudget=100`

## Usage
```typescript
const { jobs, filters, setFilters } = useJobsStore();
```

## Performance Considerations
- Filters are debounced to avoid excessive API calls
- Results are cached per filter combination
```

---

## Summary

CrewLink's code conventions emphasize:

1. **Role-based organization**: Strict `/hiring/` and `/work/` separation
2. **Centralized state**: All Zustand stores in `src/store/index.ts`
3. **Type safety**: Comprehensive types in `src/types/index.ts`
4. **Map resilience**: Dual Mapbox + Leaflet provider pattern
5. **Design consistency**: Brand/accent color tokens for all styling
6. **Async patterns**: Proper error handling and loading states
7. **Component reusability**: UI primitives, feature components, layouts
8. **Mobile-first**: Bottom sheets, responsive breakpoints
9. **API conventions**: RESTful routes with consistent response format
10. **Performance**: Next.js Image, dynamic imports, query optimization

All team members must follow these conventions to maintain consistency, readability, and scalability across the CrewLink codebase.
