# CrewLink State Management Architecture & Audit

**Last Updated:** 2026-02-27

## Executive Summary

CrewLink's state management uses **Zustand stores** for client-side state, **React Contexts** for role/mode management, and **localStorage persistence** for critical data. The architecture has **significant architectural debt** including:

- **Role definition duplication** across 3 separate systems with casing inconsistencies
- **Client-side-only state** for data that should be URL-driven (filters, active threads, pagination)
- **No server state management** (missing React Query / TanStack Query)
- **Imperative data fetching** instead of declarative query patterns
- **Large monolithic stores** (useMapStore, useJobsStore) that should be split
- **Missing optimistic updates** for mutations (bids, messages, job posts)
- **No invalidation strategy** for cache coherency

---

## Section 1: Zustand Stores (src/store/index.ts)

### 1.1 useAuthStore

**Persisted As:** `crewlink-auth`

**State Shape:**
```typescript
{
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

**Key Actions:**
- `setUser(user: User | null)` — Set the authenticated user
- `setLoading(isLoading: boolean)` — Toggle loading state
- `logout()` — Clear user and set isAuthenticated to false
- `switchRole(role: 'hirer' | 'worker')` — Change user role within same account
- `getCurrentRole()` — Get current role from user object
- `initializeMockUser()` — Initialize MOCK_USER for development

**Persistence Config:**
- Persists to localStorage key: `crewlink-auth`
- Partializes: `['user', 'isAuthenticated']` — does NOT persist `isLoading`
- Auto-rehydrates with MOCK_USER if no user exists on initial load

**Current Issues:**
- ⚠️ **CRITICAL:** Mock user auto-initialization creates security risk in production
  - Calling `initializeMockUser()` on app load if no user is persisted could leak test data
  - Mock user should only initialize in development mode (`process.env.NODE_ENV === 'development'`)
  - Consider environment-gated initialization or development-only middleware

- ⚠️ **ROLE CASING MISMATCH:** User roles are stored as `'hirer' | 'worker'` (lowercase, Prisma schema)
  - But `switchRole()` accepts lowercase and `user.role` is lowercase
  - UserRoleContext uses uppercase `'HIRER' | 'WORKER'` — inconsistent!
  - Causes conversion bugs when bridging Zustand ↔ Context

- ⚠️ **REDUNDANT STATE:** Role is duplicated in:
  - `useAuthStore.user.role` (source of truth for role)
  - `useAppModeStore.mode` (also tracks role)
  - `UserRoleContext.role` (uppercase version)
  - Creates synchronization problems when role changes

**Recommended Fixes:**
1. Gate mock user initialization to dev mode only:
   ```typescript
   if (process.env.NODE_ENV === 'development' && !user) {
     setUser(MOCK_USER);
   }
   ```

2. Establish `useAuthStore.user.role` as **single source of truth** for role
   - Remove `useAppModeStore.mode` or repurpose for visual mode only
   - Normalize UserRoleContext to read from `useAuthStore`

3. Standardize role type to lowercase throughout codebase:
   ```typescript
   type UserRole = 'hirer' | 'worker'; // Single definition
   ```

---

### 1.2 useAppModeStore

**Persisted As:** `crewlink-mode`

**State Shape:**
```typescript
{
  mode: 'hire' | 'work';
}
```

**Key Actions:**
- `setMode(mode: 'hire' | 'work')` — Set the app mode
- `toggleMode()` — Toggle between modes (only if `ENABLE_ROLE_TOGGLE` feature flag)

**Persistence Config:**
- Persists to localStorage key: `crewlink-mode`
- Conditional toggle based on `ENABLE_ROLE_TOGGLE` environment variable

**Current Issues:**
- ⚠️ **ARCHITECTURAL REDUNDANCY:** Mode duplication with `useAuthStore.user.role`
  - `useAppModeStore.mode` = `'hire' | 'work'`
  - `useAuthStore.user.role` = `'hirer' | 'worker'`
  - These represent the same concept — which is source of truth?
  - Leads to sync bugs: user role changes but mode doesn't, or vice versa

- ⚠️ **FEATURE FLAG COUPLING:** `toggleMode()` is conditional on `ENABLE_ROLE_TOGGLE`
  - Tightly couples store logic to environment config
  - Should be a capability check at UI layer, not store layer

- ⚠️ **MISSING SYNC:** No setter that syncs mode with auth store role
  - `setMode('hire')` doesn't update `useAuthStore.user.role`
  - Data diverges: app thinks it's in 'hire' mode but user.role is still 'worker'

**Recommended Fixes:**
1. **Deprecate this store in favor of auth store role:**
   - Use `useAuthStore.user.role` as single source of truth
   - If visual mode differs from role (e.g., hirer browsing job board), use a separate `uiMode` state, not `appMode`

2. **Move toggleMode to useAuthStore:**
   ```typescript
   switchRole: async (newRole: 'hirer' | 'worker') => {
     // Only if ENABLE_ROLE_TOGGLE
     await updateUserRole(newRole);
     setUser({ ...user, role: newRole });
   }
   ```

3. **Keep useAppModeStore ONLY if needed for UI visual state:**
   - Example: hirer looking at job details in 'work' mode view
   - Rename to `useUIRoleViewStore` for clarity
   - Derive from auth store, don't duplicate

---

### 1.3 useMapStore

**Persisted As:** NOT persisted (runtime only)

**State Shape:**
```typescript
{
  // Viewport state
  viewport: {
    center: [lng, lat],
    zoom: number,
    bearing: number,
    pitch: number
  };
  bounds: [[minLng, minLat], [maxLng, maxLat]];

  // User location state
  userLocation: { latitude, longitude } | null;
  locationPermission: 'granted' | 'denied' | 'prompt' | null;
  isLocating: boolean;

  // Search state
  searchLocation: { latitude, longitude } | null;
  searchQuery: string;

  // Interaction state
  followMode: boolean; // Camera follows user location
  autoRefresh: boolean; // Auto-refresh jobs as user moves
  needsRefresh: boolean; // Flag that jobs list needs refresh

  // Selection state
  selectedCity: string | null;
  mapStyle: 'dark' | 'satellite';
  selectedJobId: string | null;
  hoveredJobId: string | null;
}
```

**Default Values:**
- Center: San Francisco `[37.7749, -122.4194]`
- Zoom: TBD (typical: 12-14)
- Bearing: 0, Pitch: 0
- mapStyle: `'dark'`

**Key Actions (15+):**
- `setViewport(center, zoom, bearing, pitch)` — Update map viewport
- `setBounds(bounds)` — Set visible map bounds
- `setUserLocation(lat, lng)` — Update user's real location
- `setLocationPermission(status)` — Track browser permission status
- `startLocating() / stopLocating()` — Toggle geolocation request
- `setSearchLocation(lat, lng)` — Set search/filter location
- `setSearchQuery(query)` — Set text search query
- `setFollowMode(enabled)` — Enable/disable camera tracking of user
- `setAutoRefresh(enabled)` — Enable/disable auto-refresh as user moves
- `setNeedsRefresh(needed)` — Flag that job list needs refresh (used by useJobsStore)
- `setSelectedCity(city)` — Set city filter
- `setMapStyle(style)` — Switch between dark/satellite
- `setSelectedJobId(jobId)` — Highlight a job on map
- `setHoveredJobId(jobId)` — Hover highlight for a job
- `recenterToUser()` — Pan camera to user location
- `recenterToSearch()` — Pan camera to search location
- `updateLocationAndRecenter(lat, lng)` — Set location and pan
- `getEffectiveCenter()` — Computed getter for current center (user > search > default)

**Current Issues:**
- ⚠️ **MONOLITHIC STORE:** 15+ actions for viewport, geolocation, search, and selection
  - Should be split into multiple logical stores:
    - `useMapViewportStore` — viewport, bounds, zoom, bearing, pitch
    - `useGeolocationStore` — userLocation, locationPermission, isLocating
    - `useMapSearchStore` — searchLocation, searchQuery, selectedCity
    - `useMapSelectionStore` — selectedJobId, hoveredJobId, mapStyle

- ⚠️ **MISSING URL STATE:** Viewport and search location are client-only
  - User reloads page → viewport resets to San Francisco
  - Sharing a map link (job search at specific location) is impossible
  - Should persist to URL query params: `?lat=37.77&lng=-122.42&zoom=14&center=search`

- ⚠️ **AUTO-REFRESH COUPLING:** `needsRefresh` flag bridges map and jobs stores
  - When user moves in follow mode, `setNeedsRefresh(true)` triggers jobs refetch
  - Tightly coupled; should use event emitter or query invalidation instead

- ⚠️ **LOCATION PERMISSION HANDLING:** Browser permission flows are async
  - `startLocating()` should handle permission prompts and errors
  - Missing error state for "permission denied" scenarios
  - No retry logic if permission was previously denied

- ⚠️ **SEARCH LOCATION AMBIGUITY:** Difference between `searchLocation` and `userLocation` not clear
  - `searchLocation` = location user searched for or filtered by?
  - `userLocation` = actual GPS location?
  - Documentation is needed

**Recommended Fixes:**
1. **Split into 4 focused stores:**
   ```typescript
   // src/store/map/viewport.ts
   useMapViewportStore = create((set) => ({
     viewport: { center, zoom, bearing, pitch },
     setBounds, setViewport, ...
   }));

   // src/store/map/geolocation.ts
   useGeolocationStore = create((set) => ({
     userLocation, locationPermission, isLocating,
     setUserLocation, startLocating, stopLocating, ...
   }));
   ```

2. **Migrate viewport + search to URL state:**
   ```typescript
   // src/hooks/useMapUrlState.ts
   export const useMapUrlState = () => {
     const searchParams = useSearchParams();
     const viewport = useMemo(() => ({
       center: [
         parseFloat(searchParams.get('lng') || '-122.4194'),
         parseFloat(searchParams.get('lat') || '37.7749'),
       ],
       zoom: parseInt(searchParams.get('zoom') || '12'),
       // ... bearing, pitch from params
     }), [searchParams]);

     return { viewport, setViewport: (vp) => updateSearchParams(...) };
   };
   ```

3. **Use React Query invalidation instead of `needsRefresh` flag:**
   ```typescript
   // When user location changes significantly:
   queryClient.invalidateQueries(['jobs']);
   ```

4. **Add comprehensive location permission handling:**
   ```typescript
   startLocating: async () => {
     try {
       const permission = await navigator.permissions.query({ name: 'geolocation' });
       if (permission.state === 'denied') {
         setLocationPermission('denied');
         // Show toast: "Enable location in browser settings"
         return;
       }
       // ... request actual location
     } catch (err) {
       setLocationPermission('error');
     }
   };
   ```

---

### 1.4 useJobsStore

**Persisted As:** NOT persisted (runtime only)

**State Shape:**
```typescript
{
  jobs: Job[];
  isLoading: boolean;
  filters: JobFilters;
  searchQuery: string;
}
```

**JobFilters Structure:**
```typescript
{
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
  radius?: number;
  distance?: number;
  sort?: 'distance' | 'newest' | 'hourlyRate' | 'rating';
  // Additional filters TBD based on Job schema
}
```

**Default Filters:**
```typescript
{
  sort: 'distance',
  radius: 25, // miles
}
```

**Key Actions:**
- `setJobs(jobs: Job[])` — Set the full jobs array
- `addJob(job: Job)` — Add a single job (for new postings)
- `updateJob(jobId: string, updates: Partial<Job>)` — Update a job
- `removeJob(jobId: string)` — Remove a job
- `setLoading(isLoading: boolean)` — Toggle loading state
- `setFilters(filters: Partial<JobFilters>)` — Update filters
- `resetFilters()` — Reset to default filters

**Current Issues:**
- ⚠️ **MISSING URL STATE:** Filters are client-only state
  - User navigates to `/work/jobs?category=cleaning` then reloads → filters lost
  - Cannot share filtered job list with others via URL
  - Sharing a saved search is impossible
  - SEO-unfriendly (search engines see same content for different filters)

- ⚠️ **MISSING PAGINATION:** No pagination state in store
  - How many jobs loaded at once?
  - Infinite scroll vs. page-based navigation?
  - Should be URL state: `?page=2&limit=20`

- ⚠️ **FILTER SYNC WITH MAP:** Filters live in useJobsStore, but map has `selectedCity`, `searchLocation`
  - Are city and searchLocation the same?
  - Which store is source of truth for location filter?
  - Should be single filter object in URL

- ⚠️ **NO OPTIMISTIC UPDATES:** When user bids on a job, no optimistic UI
  - Bid state (accepted, rejected, pending) stored where?
  - User must wait for server before seeing bid status
  - Lazy loading of bid history

- ⚠️ **NO CACHING STRATEGY:** Every `setJobs()` replaces entire array
  - No partial updates or differential sync
  - No cache invalidation strategy
  - No stale-while-revalidate pattern

**Recommended Fixes:**
1. **Migrate filters to URL state:**
   ```typescript
   // src/hooks/useJobFilters.ts
   export const useJobFilters = () => {
     const searchParams = useSearchParams();
     const setSearchParams = useSetSearchParams();

     const filters: JobFilters = {
       category: searchParams.get('category') || undefined,
       budgetMin: searchParams.get('budgetMin') ? parseInt(...) : undefined,
       budgetMax: searchParams.get('budgetMax') ? parseInt(...) : undefined,
       radius: parseInt(searchParams.get('radius') || '25'),
       sort: searchParams.get('sort') || 'distance',
     };

     const setFilters = (newFilters: Partial<JobFilters>) => {
       const newParams = new URLSearchParams(searchParams);
       Object.entries(newFilters).forEach(([key, value]) => {
         if (value === undefined) newParams.delete(key);
         else newParams.set(key, String(value));
       });
       setSearchParams(newParams);
     };

     return { filters, setFilters };
   };
   ```

2. **Adopt React Query for jobs fetching:**
   ```typescript
   // src/hooks/useJobs.ts
   export const useJobs = (filters: JobFilters) => {
     return useQuery({
       queryKey: ['jobs', filters],
       queryFn: ({ signal }) => fetchJobs(filters, { signal }),
       staleTime: 5 * 60 * 1000, // 5 minutes
       cacheTime: 30 * 60 * 1000, // 30 minutes
     });
   };
   ```

3. **Add pagination state to URL:**
   ```typescript
   // In URL: /work/jobs?category=cleaning&page=1&limit=20
   ```

4. **Implement optimistic updates for bids:**
   ```typescript
   const { mutate: placeBid } = useMutation({
     mutationFn: (bidData) => createBid(bidData),
     onMutate: async (bidData) => {
       // Optimistically update jobs store
       queryClient.setQueryData(['jobs'], (old) => ({
         ...old,
         jobs: old.jobs.map((job) =>
           job.id === bidData.jobId
             ? { ...job, userHasBid: true }
             : job
         ),
       }));
     },
     onError: (err, bidData, context) => {
       // Revert on error
       queryClient.setQueryData(['jobs'], context.previousJobs);
       toast.error('Failed to place bid');
     },
   });
   ```

---

### 1.5 useMessagesStore

**Persisted As:** NOT persisted (runtime only)

**State Shape:**
```typescript
{
  threads: MessageThread[];
  activeThreadId: string | null;
  isLoading: boolean;
  unreadCount: number;
}
```

**MessageThread Structure:**
```typescript
{
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage?: string;
  lastMessageAt: Date;
  unread: boolean;
  messages: Message[]; // Full message history for active thread
}
```

**Key Actions:**
- `setThreads(threads: MessageThread[])` — Set all threads
- `addThread(thread: MessageThread)` — Add a new thread
- `updateThread(threadId: string, updates: Partial<MessageThread>)` — Update thread
- `setActiveThreadId(threadId: string | null)` — Set active conversation
- `markThreadAsRead(threadId: string)` — Mark thread as read

**Current Issues:**
- ⚠️ **MISSING URL STATE:** Active thread is client-only state
  - User opens thread, then reloads page → thread closes, back to list
  - Cannot share a specific conversation link with team members
  - Breaks deep linking: `/work/messages/:threadId` not driven by URL

- ⚠️ **FULL THREAD MESSAGES IN STORE:** Entire message history in `MessageThread`
  - Loads all messages for active thread into memory
  - No pagination for long conversations (e.g., 500+ messages)
  - Slow initial load if conversation is large
  - Should load messages separately and paginate

- ⚠️ **UNREAD COUNT SYNC:** `unreadCount` is derived from threads
  - When marking thread as read, must update both thread AND count
  - Risk of getting out of sync
  - Should be computed property, not stored

- ⚠️ **NO REAL-TIME UPDATES:** Threads don't update from server changes
  - If other user sends message, user doesn't see it until page refresh
  - No WebSocket connection or polling
  - Should use React Query with real-time subscription

- ⚠️ **MESSAGE PAGINATION MISSING:** No previous/next page mechanism
  - How many messages loaded initially?
  - How does "load more messages" work?
  - Should be separate `useQueryKey: ['messages', threadId, { page }]`

**Recommended Fixes:**
1. **Move activeThreadId to URL state:**
   ```typescript
   // URL: /work/messages/:threadId
   // Component reads route param, not store
   const { threadId } = useParams();
   const { data: thread } = useQuery(['messages', 'thread', threadId], ...);
   ```

2. **Use React Query for threads list:**
   ```typescript
   export const useMessageThreads = () => {
     return useQuery({
       queryKey: ['messages', 'threads'],
       queryFn: fetchMessageThreads,
       staleTime: 2 * 60 * 1000, // 2 minutes
     });
   };
   ```

3. **Paginate messages within threads:**
   ```typescript
   export const useMessages = (threadId: string, page: number = 1) => {
     return useQuery({
       queryKey: ['messages', threadId, { page }],
       queryFn: ({ signal }) => fetchMessages(threadId, { page, limit: 50, signal }),
     });
   };
   ```

4. **Remove full message history from thread list:**
   ```typescript
   // ThreadListItem only shows last message preview
   threads: Array<{
     id, otherUserId, otherUserName, otherUserAvatar,
     lastMessage, lastMessageAt, unread,
     // NO messages array here
   }>;
   ```

5. **Make unreadCount computed:**
   ```typescript
   const unreadCount = useMemo(
     () => threads.filter(t => t.unread).length,
     [threads]
   );
   ```

6. **Add real-time updates via WebSocket:**
   ```typescript
   // On component mount:
   useEffect(() => {
     const unsubscribe = subscribeToMessages(threadId, (newMessage) => {
       queryClient.invalidateQueries(['messages', threadId]);
     });
     return unsubscribe;
   }, [threadId]);
   ```

---

### 1.6 useNotificationsStore

**Persisted As:** NOT persisted (runtime only)

**State Shape:**
```typescript
{
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}
```

**Notification Structure:**
```typescript
{
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'bid' | 'message' | 'job';
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string; // Link to navigate on click
  read: boolean;
  createdAt: Date;
  expiresAt?: Date; // Auto-expire after time
}
```

**Key Actions:**
- `setNotifications(notifications: Notification[])` — Set all notifications
- `addNotification(notification: Notification)` — Add a notification
- `markAsRead(notificationId: string)` — Mark one as read
- `markAllAsRead()` — Mark all as read

**Current Issues:**
- ⚠️ **MISSING REAL-TIME UPDATES:** Notifications don't stream from server
  - User receives bid/message but doesn't know until refresh
  - No WebSocket subscription for new notifications
  - Polling interval unknown or missing

- ⚠️ **UNREAD COUNT SYNC:** Same as useMessagesStore
  - Manually updated with each read action
  - Could get out of sync if multiple windows/tabs open

- ⚠️ **NOTIFICATION PERSISTENCE:** Where are notifications persisted?
  - Server-side persistence? (Should be)
  - Are they loaded on app init?
  - No initial fetch action visible

- ⚠️ **EXPIRATION HANDLING:** `expiresAt` field not used
  - Should auto-dismiss or remove expired notifications
  - No cleanup mechanism visible

- ⚠️ **MISSING NOTIFICATION GROUPING:** All notifications in flat array
  - Users with many notifications get overwhelming list
  - Should group by type or time (Last 24h, Last week, etc.)

**Recommended Fixes:**
1. **Use React Query with real-time updates:**
   ```typescript
   export const useNotifications = () => {
     return useQuery({
       queryKey: ['notifications'],
       queryFn: fetchNotifications,
       staleTime: 1 * 60 * 1000, // 1 minute (high priority, low cache time)
     });
   };
   ```

2. **Add WebSocket subscription for real-time:**
   ```typescript
   useEffect(() => {
     const unsubscribe = subscribeToNotifications((newNotification) => {
       queryClient.setQueryData(['notifications'], (old) => [
         newNotification,
         ...old,
       ]);
     });
     return unsubscribe;
   }, []);
   ```

3. **Compute unreadCount from query data:**
   ```typescript
   const unreadCount = useMemo(
     () => data?.filter(n => !n.read).length ?? 0,
     [data]
   );
   ```

4. **Implement notification expiration:**
   ```typescript
   useEffect(() => {
     const timers = notifications
       .filter(n => n.expiresAt)
       .map(n => {
         const timeout = new Date(n.expiresAt).getTime() - Date.now();
         return setTimeout(() => {
           removeNotification(n.id);
         }, Math.max(0, timeout));
       });

     return () => timers.forEach(clearTimeout);
   }, [notifications]);
   ```

5. **Add notification grouping/filtering:**
   ```typescript
   const groupedNotifications = useMemo(() => {
     return groupBy(notifications, n => getGroupLabel(n.createdAt));
   }, [notifications]);
   ```

---

### 1.7 useOnboardingStore

**Persisted As:** `crewlink-onboarding`

**State Shape:**
```typescript
{
  step: number; // Current step (0-indexed or 1-indexed? Clarify)
  data: Partial<WorkerOnboardingData>;
  isComplete: boolean;
}
```

**WorkerOnboardingData Structure:**
```typescript
{
  // Step 1: Profile
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;

  // Step 2: Skills
  skills?: string[];

  // Step 3: Availability
  weeklyHours?: number;
  availableFrom?: Date;
  availableTo?: Date;

  // Step 4: Payment
  bankAccountToken?: string; // Stripe Connect token
  bankAccountLast4?: string;

  // Additional steps TBD
}
```

**Key Actions:**
- `setStep(step: number)` — Move to specific step
- `nextStep()` — Progress to next step
- `previousStep()` — Go back one step
- `setData(data: Partial<WorkerOnboardingData>)` — Update form data
- `updateData(key: string, value: unknown)` — Update single field
- `setComplete(isComplete: boolean)` — Mark onboarding as finished
- `reset()` — Reset wizard to beginning

**Current Issues:**
- ⚠️ **URL STATE MISSING:** Step not driven by URL
  - User on step 3, refreshes page → back to step 0 (unless cached)
  - URL should be `/onboarding?step=3`
  - Enables browser back/forward

- ⚠️ **MISSING VALIDATION:** No field validation rules
  - When can user proceed to next step?
  - Are required fields checked before moving forward?
  - Error messages stored where?

- ⚠️ **MISSING AUTO-SAVE:** Form data not auto-saved to server
  - User fills form, navigates away → data lost (only localStorage)
  - Should debounce-save to server as user types
  - Server should be source of truth for in-progress onboarding

- ⚠️ **SENSITIVE DATA HANDLING:** `bankAccountToken` in store
  - Tokens should NOT be stored in store or localStorage
  - Stripe tokens should be generated and immediately sent to server
  - Store only masked last 4 digits

- ⚠️ **MISSING STEP DEFINITIONS:** Store doesn't define steps
  - What are all the steps?
  - Which are optional vs. required?
  - What's the order?
  - Should be defined as configuration

**Recommended Fixes:**
1. **Move step to URL state:**
   ```typescript
   // URL: /onboarding?step=2
   // Component reads from useSearchParams
   const searchParams = useSearchParams();
   const step = parseInt(searchParams.get('step') || '0');
   ```

2. **Add server persistence:**
   ```typescript
   const { mutate: saveOnboardingData } = useMutation({
     mutationFn: (data: Partial<WorkerOnboardingData>) =>
       updateOnboardingProgress(data),
     onSuccess: () => queryClient.invalidateQueries(['user']),
   });

   useEffect(() => {
     const timer = debounce(() => saveOnboardingData(data), 2000);
     return () => clearTimeout(timer);
   }, [data]);
   ```

3. **Add validation schema:**
   ```typescript
   const validationSchema = {
     step0: z.object({
       firstName: z.string().min(2),
       lastName: z.string().min(2),
       email: z.string().email(),
     }),
     step1: z.object({
       skills: z.array(z.string()).min(1),
     }),
     // ... etc
   };

   const canProceedToNextStep = () => {
     return validationSchema[`step${step}`].safeParse(data).success;
   };
   ```

4. **Remove sensitive tokens from store:**
   ```typescript
   // Never store full tokens
   // After Stripe.createPaymentMethod(), immediately POST to /api/onboarding/payment
   // Server validates token and stores securely
   // Client only displays: "✓ Bank account added ending in 1234"
   ```

5. **Define onboarding steps configuration:**
   ```typescript
   const ONBOARDING_STEPS = [
     { id: 0, title: 'Profile Info', required: true },
     { id: 1, title: 'Skills', required: true },
     { id: 2, title: 'Availability', required: false },
     { id: 3, title: 'Payment Method', required: true },
   ];
   ```

---

### 1.8 useJobFormStore

**Persisted As:** `crewlink-job-form`

**State Shape:**
```typescript
{
  step: number; // Current step in job posting wizard
  data: Partial<JobFormData>;
  isDirty: boolean; // Track if unsaved changes exist
}
```

**JobFormData Structure:**
```typescript
{
  // Basic Info
  title?: string;
  description?: string;
  category?: string;

  // Budget & Time
  budgetType?: 'fixed' | 'hourly';
  budgetAmount?: number;
  estimatedDuration?: string; // '1-3 days' | '1-2 weeks' | etc

  // Location
  location?: { latitude, longitude };
  city?: string;
  radius?: number; // How far to recruit from job location

  // Requirements
  skills?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  minimumRating?: number;

  // Attachments
  attachments?: Array<{ url, name, size }>;
}
```

**Key Actions:**
- `setStep(step: number)` — Move to specific step
- `nextStep()` — Progress to next step
- `previousStep()` — Go back one step
- `setData(data: Partial<JobFormData>)` — Update form data
- `updateData(key: string, value: unknown)` — Update single field
- `setDirty(isDirty: boolean)` — Mark as modified
- `reset()` — Clear form and start over
- `publishJob()` — Submit job to server (should trigger mutation, not store action)

**Current Issues:**
- ⚠️ **AUTO-SAVE NOT IMPLEMENTED:** isDirty tracked but not acted upon
  - Form data lost on page refresh (or persisted to localStorage only)
  - Should auto-save draft to server periodically
  - User should be able to resume draft later

- ⚠️ **URL STATE MISSING:** Step not in URL
  - URL should be `/hire/post-job?step=2`
  - Enables browser back/forward

- ⚠️ **PUBLISH LOGIC IN STORE:** `publishJob()` should be mutation, not store action
  - Mixing async server operations with client state
  - Loading state during publish should be separate

- ⚠️ **FILE UPLOADS NOT TRACKED:** Attachments stored but upload progress not shown
  - No upload progress UI (percentage uploaded)
  - No retry mechanism for failed uploads
  - Should use separate mutation: `useUploadAttachment`

- ⚠️ **MISSING VALIDATION:** Like useOnboardingStore
  - When can user proceed to next step?
  - What fields are required per step?

- ⚠️ **STEP DEFINITION MISSING:** Hardcoded in component or store?
  - Should be configuration

**Recommended Fixes:**
1. **Move step to URL state:**
   ```typescript
   // URL: /hire/post-job?step=2&draftId=abc123
   ```

2. **Implement server-side draft saving:**
   ```typescript
   const { mutate: saveDraft } = useMutation({
     mutationFn: (data: Partial<JobFormData>) =>
       upsertJobDraft(draftId, data),
     onSuccess: (data) => setDraftId(data.id),
   });

   useEffect(() => {
     const timer = debounce(() => saveDraft(data), 3000);
     return () => clearTimeout(timer);
   }, [data, draftId]);
   ```

3. **Separate publish into mutation:**
   ```typescript
   const { mutate: publishJob, isPending } = useMutation({
     mutationFn: () => createJob(data),
     onSuccess: (createdJob) => {
       navigate(`/hire/jobs/${createdJob.id}`);
       queryClient.invalidateQueries(['jobs']);
     },
   });
   ```

4. **Add file upload mutations:**
   ```typescript
   const { mutate: uploadAttachment, isPending } = useMutation({
     mutationFn: (file: File) => uploadToS3(file),
     onSuccess: (url) => {
       updateData('attachments', [
         ...data.attachments,
         { url, name: file.name, size: file.size },
       ]);
     },
   });
   ```

5. **Add validation schema:**
   ```typescript
   const validationSchema = {
     step0: z.object({
       title: z.string().min(5).max(100),
       description: z.string().min(20),
       category: z.string().min(1),
     }),
     // ... etc
   };
   ```

---

### 1.9 useUIStore

**Persisted As:** NOT persisted (runtime only)

**State Shape:**
```typescript
{
  isMobileMenuOpen: boolean;
  isFilterDrawerOpen: boolean;
  isBottomSheetOpen: boolean;
  bottomSheetContent: 'list' | 'detail' | 'filter' | null;
  bottomSheetHeight: 'collapsed' | 'half' | 'full';
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>;
}
```

**Key Actions:**
- `setMobileMenuOpen(isOpen: boolean)` — Toggle mobile menu
- `setFilterDrawerOpen(isOpen: boolean)` — Toggle filter sidebar
- `setBottomSheetOpen(isOpen: boolean)` — Toggle bottom sheet
- `setBottomSheetContent(content)` — Set what's in bottom sheet
- `setBottomSheetHeight(height)` — Resize bottom sheet
- `addToast(type, message)` — Add toast notification
- `removeToast(id)` — Remove specific toast
- `clearToasts()` — Clear all toasts

**Current Issues:**
- ⚠️ **TOAST AUTO-REMOVAL USES SETTIMEOUT:** No cleanup
  - `setTimeout(..., 4000)` to auto-remove toasts
  - If component unmounts before timeout fires, timeout still runs
  - Memory leak if many toasts are added/removed

- ⚠️ **BOTTOM SHEET STATE COMPLEX:** Multiple fields for one component
  - `isBottomSheetOpen`, `bottomSheetContent`, `bottomSheetHeight`
  - Opening/closing/resizing requires multiple setters
  - Should be single compound action

- ⚠️ **NO TOAST ID GENERATION:** Store doesn't generate IDs
  - Caller must generate unique ID
  - Risk of duplicate IDs

- ⚠️ **NO TOAST PERSISTENCE:** Toasts lost on navigation
  - Is this intentional?
  - Some toasts might be important (success confirmations)

**Recommended Fixes:**
1. **Implement proper toast auto-removal:**
   ```typescript
   const addToast = (type, message) => {
     const id = nanoid();
     set((state) => ({
       toasts: [...state.toasts, { id, type, message }],
     }));

     const timer = setTimeout(() => {
       set((state) => ({
         toasts: state.toasts.filter(t => t.id !== id),
       }));
     }, 4000);

     // Return cancel function
     return () => clearTimeout(timer);
   };
   ```

2. **Simplify bottom sheet state:**
   ```typescript
   type BottomSheetState = {
     content: 'list' | 'detail' | 'filter' | null;
     height: 'collapsed' | 'half' | 'full';
     isOpen: boolean;
   };

   setBottomSheet: (state: Partial<BottomSheetState>) => {
     // Opens sheet if any property is set
     set((prev) => ({
       bottomSheet: {
         ...prev.bottomSheet,
         ...state,
         isOpen: true,
       },
     }));
   };

   closeBottomSheet: () => {
     set({ bottomSheet: { content: null, height: 'collapsed', isOpen: false } });
   };
   ```

3. **Auto-generate toast IDs:**
   ```typescript
   import { nanoid } from 'nanoid';

   addToast: (type, message) => {
     const id = nanoid();
     // ... rest of logic
   };
   ```

4. **Consider toast persistence for critical notifications:**
   ```typescript
   // Persist important toasts to sessionStorage?
   // Or use React Portals to keep toasts across page navigation?
   ```

---

## Section 2: React Contexts (src/contexts/)

### 2.1 UserRoleContext

**Location:** `src/contexts/UserRoleContext.tsx` (assumed)

**Context Shape:**
```typescript
{
  role: 'HIRER' | 'WORKER';
  isRoleLoading: boolean;
  switchRole: (newRole: 'HIRER' | 'WORKER') => Promise<void>;
  getHomeRoute: () => string; // Returns '/' or '/work' based on role
  getMapRoute: () => string; // Returns '/hire' or '/work/jobs'
  isOnCorrectSide: () => boolean; // Is user on their role's section?
  getCorrectSideRoute: () => string; // Where should user be based on role?
}
```

**Persistence:**
- Persists role to localStorage key: `crewlink_user_role`
- Role options: `'HIRER' | 'WORKER'` (uppercase)

**Key Issues:**
- ⚠️ **ROLE CASING MISMATCH (CRITICAL):**
  - This context uses: `'HIRER' | 'WORKER'` (uppercase)
  - Prisma schema / useAuthStore uses: `'hirer' | 'worker'` (lowercase)
  - Causes conversion bugs when Context ↔ Store sync
  - Example: User logged in with `useAuthStore.user.role = 'hirer'`, but Context.role = 'HIRER'

- ⚠️ **ROLE DEFINED IN 3 PLACES:**
  - `useAuthStore.user.role` = source from JWT token
  - `UserRoleContext.role` = converted to uppercase locally
  - `useAppModeStore.mode` = parallel concept
  - Which is source of truth? Context reads from localStorage, not from useAuthStore!
  - If user changes role in useAuthStore, Context might still show old role

- ⚠️ **ROUTE LOGIC IN CONTEXT:** Hard to test, inflexible
  - `getHomeRoute()`, `getMapRoute()`, etc. are coupled to role concept
  - Should be routing configuration, not context logic
  - Hard to change routing without changing context

- ⚠️ **LOCALSTORAGE PERSISTENCE OF SENSITIVE DATA:**
  - Role stored in localStorage separately from auth token
  - If localStorage is cleared but auth cookie persists, they could diverge
  - On page load, which is source of truth: localStorage or server?

**Recommended Fixes:**
1. **ELIMINATE THIS CONTEXT — use useAuthStore as single source of truth:**
   ```typescript
   // Instead of UserRoleContext, use:
   const useUserRole = () => {
     const store = useAuthStore();
     return {
       role: store.user?.role as 'hirer' | 'worker' | undefined,
       isLoading: store.isLoading,
       switchRole: store.switchRole,
     };
   };
   ```

2. **Normalize role type to lowercase everywhere:**
   ```typescript
   // Global type definition
   export type UserRole = 'hirer' | 'worker';

   // Not context-specific types
   ```

3. **Move route logic to routing configuration:**
   ```typescript
   // src/config/routes.ts
   const ROUTES_BY_ROLE = {
     hirer: {
       home: '/',
       map: '/hire',
       messages: '/hire/messages',
     },
     worker: {
       home: '/work',
       map: '/work/jobs',
       messages: '/work/messages',
     },
   };

   export const getRouteForRole = (role: UserRole, key: keyof typeof ROUTES_BY_ROLE.hirer) => {
     return ROUTES_BY_ROLE[role][key];
   };
   ```

4. **On app mount, validate role consistency:**
   ```typescript
   useEffect(() => {
     // On app init:
     const storedRole = localStorage.getItem('crewlink_user_role');
     const serverRole = useAuthStore.user?.role;

     if (storedRole && storedRole.toLowerCase() !== serverRole) {
       // Server is source of truth
       localStorage.setItem('crewlink_user_role', serverRole || '');
     }
   }, []);
   ```

---

### 2.2 AppModeContext

**Location:** `src/contexts/AppModeContext.tsx` (assumed)

**Context Shape:**
```typescript
{
  mode: 'hire' | 'work';
  toggleMode: () => void;
}
```

**Key Issues:**
- ⚠️ **REDUNDANCY:** Duplicates useAppModeStore and useAuthStore.user.role
  - Context provides the same mode data as store
  - Unclear which should be used in components
  - Increases bundle size with duplicate logic

- ⚠️ **CONTEXT API OVERHEAD:** Unnecessary context wrapping
  - Could just use hooks directly: `useAppModeStore()`
  - Context adds provider boilerplate without benefit

- ⚠️ **NO CLEAR OWNERSHIP:** useAppModeStore exists in parallel
  - Is Context a wrapper around Store? Then why both?
  - If Store is deprecated, why keep Context?

**Recommended Fix:**
1. **DELETE THIS CONTEXT** — use `useAppModeStore` directly in components:
   ```typescript
   // Before:
   <AppModeContext.Consumer>
     {({ mode }) => <Layout mode={mode} />}
   </AppModeContext.Consumer>

   // After:
   const mode = useAppModeStore((s) => s.mode);
   <Layout mode={mode} />
   ```

---

## Section 3: State Architecture Issues & Recommendations

### 3.1 Role Definition: Root Cause Analysis

**Problem:** Role is defined in 3 conflicting places

| Source | Type | Casing | Persistence | Sync Strategy |
|--------|------|--------|-------------|---------------|
| `useAuthStore.user.role` | `'hirer' \| 'worker'` | lowercase | localStorage via 'crewlink-auth' | Part of user object |
| `UserRoleContext` | `'HIRER' \| 'WORKER'` | uppercase | localStorage via 'crewlink_user_role' | Separate sync (or none!) |
| `useAppModeStore.mode` | `'hire' \| 'work'` | lowercase | localStorage via 'crewlink-mode' | No sync with auth store |

**Consequences:**
1. User logs in → `useAuthStore.user.role = 'hirer'` → Context reads localStorage (empty initially) → Context shows undefined until localStorage is synced
2. User switches role → `useAuthStore.switchRole('worker')` → Store updates → Context still shows old role from stale localStorage
3. localStorage cleared (user clears browser data) → Role lost, user becomes "unroled"
4. Multiple browser tabs → One tab has localStorage update, other tabs' Contexts are stale

**Root Cause:**
- No single source of truth for role
- Separate persistence layers (useAuthStore's crewlink-auth vs Context's crewlink_user_role)
- No sync mechanism between Zustand store and React Context
- Casing inconsistency (lowercase vs uppercase)

**Solution: Single Source of Truth Architecture**

```
┌─────────────────────────────────────────┐
│     Browser: localStorage               │
│  ┌─────────────────────────────────────┐│
│  │ crewlink-auth: {                    ││
│  │   user: { id, email, role, ...},    ││
│  │   isAuthenticated: true,             ││
│  │ }                                     ││
│  └─────────────────────────────────────┘│
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  Zustand: useAuthStore (persisted)      │
│  ┌─────────────────────────────────────┐│
│  │ user: { id, email, role, ... }      ││
│  │ isAuthenticated: boolean            ││
│  │ isLoading: boolean                  ││
│  └─────────────────────────────────────┘│
└──────────────┬──────────────────────────┘
               │
               ├─→ useUserRole hook reads from here
               │
               ├─→ Components subscribe to store changes
               │
               └─→ Role is ALWAYS lowercase: 'hirer' | 'worker'
```

**Implementation:**

```typescript
// src/store/index.ts
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  switchRole: async (newRole: 'hirer' | 'worker') => {
    if (!get().user) throw new Error('No user');
    set({ isLoading: true });
    try {
      const updated = await updateUserRoleAPI(newRole);
      set({ user: updated });
    } finally {
      set({ isLoading: false });
    }
  },

  // ... other actions
}), {
  name: 'crewlink-auth',
  partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
});

// src/hooks/useUserRole.ts
export const useUserRole = () => {
  const user = useAuthStore((state) => state.user);
  const switchRole = useAuthStore((state) => state.switchRole);
  const isLoading = useAuthStore((state) => state.isLoading);

  return {
    role: user?.role as UserRole | undefined,
    user,
    switchRole,
    isLoading,
  };
};

// src/config/routes.ts — TYPE SAFE ROUTING
const ROLE_ROUTES: Record<UserRole, { home: string; map: string }> = {
  hirer: { home: '/', map: '/hire' },
  worker: { home: '/work', map: '/work/jobs' },
};

export const getRoleRoute = (role: UserRole, page: 'home' | 'map') => {
  return ROLE_ROUTES[role][page];
};

// Usage in component:
const { role } = useUserRole();
const homeRoute = getRoleRoute(role, 'home');
```

**Deprecate these entirely:**
- ❌ `UserRoleContext` — use `useUserRole()` hook
- ❌ `AppModeContext` — use `useAppModeStore()` hook
- ❌ `useAppModeStore` (redundant) — role lives in `useAuthStore`

---

### 3.2 URL State vs. Client State

**Problem:** Business-critical state is client-only, making it unshareable and non-bookmarkable

| State | Current Storage | Should Be | Impact |
|-------|-----------------|-----------|--------|
| Job filters (category, budget, radius) | useJobsStore (client) | URL: `?category=cleaning&budget=50-100&radius=25` | Cannot share filtered results |
| Job sort order | useJobsStore (client) | URL: `?sort=distance` | Resets on reload |
| Pagination | Not tracked | URL: `?page=2&limit=20` | Cannot implement pagination |
| Active message thread | useMessagesStore.activeThreadId (client) | URL: `/messages/:threadId` | Cannot link to specific conversation |
| Onboarding step | useOnboardingStore.step (client) | URL: `/onboarding?step=2` | Cannot resume mid-wizard |
| Job post form step | useJobFormStore.step (client) | URL: `/post-job?step=3&draftId=xxx` | Cannot resume job draft across sessions |
| Map viewport | useMapStore.viewport (client) | URL: `?lat=37.77&lng=-122.42&zoom=14` | Cannot share map location |
| Bottom sheet state | useUIStore (client) | Browser history (back/forward) | UI state broken by nav |

**Why URL state matters:**
1. **Bookmarking** — User bookmarks filtered job search, later clicks bookmark, filters restored
2. **Sharing** — "Check out these cleaning jobs near me" → clickable link
3. **SEO** — Different filter combinations = different URLs = indexable content
4. **Browser History** — Back button works intuitively
5. **Deep Linking** — `/messages/:threadId` works even on fresh page load
6. **Server-Side Rendering** — Can pre-render with correct filters
7. **Mobile Share** — Share sheet includes complete URL with state

**Implementation Pattern:**

```typescript
// src/hooks/useJobFilters.ts
export const useJobFilters = (defaultFilters?: Partial<JobFilters>) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: JobFilters = {
    category: searchParams.get('category') || undefined,
    budgetMin: searchParams.get('budgetMin') ? parseInt(...) : undefined,
    budgetMax: searchParams.get('budgetMax') ? parseInt(...) : undefined,
    radius: parseInt(searchParams.get('radius') || '25'),
    sort: searchParams.get('sort') || 'distance',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  };

  const updateFilters = (updates: Partial<JobFilters>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams(
      new URLSearchParams(defaultFilters)
    ));
  };

  return { filters, updateFilters, resetFilters };
};

// Usage in component:
const { filters, updateFilters } = useJobFilters();

<JobFilterForm
  values={filters}
  onChange={(newFilters) => updateFilters(newFilters)}
/>

// URL automatically updates: /work/jobs?category=cleaning&radius=25
```

**Migration checklist:**
- [ ] Job list filters → URL state
- [ ] Job list pagination → URL state
- [ ] Message active thread → URL param (`:threadId`)
- [ ] Onboarding step → URL state
- [ ] Job form step → URL state + server draft persistence
- [ ] Map viewport (optional) → URL state for sharing
- [ ] Bottom sheet open/close → Browser history

---

### 3.3 Missing Server State Management: React Query

**Problem:** No declarative data fetching library

Current approach:
```typescript
// Component must manually handle:
1. Fetch trigger (useEffect)
2. Loading state (useState)
3. Error state (useState)
4. Response data (useState)
5. Cache invalidation (manual trigger)
6. Deduplication (if two components fetch same data)
7. Stale data handling (if data not fetched in a while)

// Example: Jobs list
const [jobs, setJobs] = useState([]);
const [isLoading, setIsLoading] = useState(false);

useEffect(() => {
  setIsLoading(true);
  fetchJobs(filters)
    .then(setJobs)
    .catch(err => setError(err))
    .finally(() => setIsLoading(false));
}, [filters]);

// Now if two components both need jobs data:
// - Both fetch independently (duplicate requests)
// - Both maintain separate loading/error state
// - Cache invalidation requires manual coordination
```

**React Query solution:**
```typescript
// src/hooks/useJobs.ts
export const useJobs = (filters: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', filters], // Auto-deduplicates by key
    queryFn: ({ signal }) => fetchJobs(filters, { signal }),
    staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
    cacheTime: 30 * 60 * 1000, // Keep in memory for 30 minutes
    enabled: !!filters.category, // Only fetch when filters ready
  });
};

// Usage:
const { data: jobs, isLoading, error, refetch } = useJobs(filters);

// Benefits:
// - Automatic deduplication: 2 components = 1 fetch
// - Automatic refetch on focus / window reactivation
// - Automatic stale-time handling
// - Background refetch while showing stale data
// - Built-in loading/error/data states
// - Mutations with optimistic updates and rollback
```

**Implement React Query for all server data:**

1. **Queries (GET endpoints):**
   ```typescript
   useJobs(filters) → ['jobs', filters]
   useJobDetails(jobId) → ['jobs', jobId]
   useMessageThreads() → ['messages', 'threads']
   useMessages(threadId, page) → ['messages', threadId, { page }]
   useNotifications() → ['notifications']
   useUser() → ['user']
   useOnboardingStatus() → ['onboarding', 'status']
   ```

2. **Mutations (POST/PUT/DELETE endpoints):**
   ```typescript
   const { mutate: placeBid } = useMutation({
     mutationFn: (bidData) => createBid(bidData),
     onMutate: (bidData) => {
       // Optimistic update
       queryClient.setQueryData(['jobs', bidData.jobId], (old) => ({
         ...old,
         userHasBid: true,
       }));
     },
     onSuccess: () => {
       queryClient.invalidateQueries(['jobs']);
     },
     onError: (err, bidData, context) => {
       // Rollback on error
       queryClient.setQueryData(['jobs', bidData.jobId], context.previousJob);
       toast.error('Failed to place bid');
     },
   });
   ```

3. **WebSocket subscriptions for real-time:**
   ```typescript
   useEffect(() => {
     const unsubscribe = subscribeToMessages(threadId, (newMessage) => {
       queryClient.setQueryData(['messages', threadId, { page: 1 }], (old) => [
         newMessage,
         ...old,
       ]);
     });
     return unsubscribe;
   }, [threadId]);
   ```

**Benefits of React Query:**
- ✅ Automatic request deduplication
- ✅ Smart caching with stale-time
- ✅ Background refetching
- ✅ Optimistic updates with rollback
- ✅ Automatic error handling
- ✅ Loading/error/data states in one object
- ✅ Devtools for debugging queries
- ✅ Persistent queries across sessions (optional)
- ✅ Automatic retry on network failure

**Setup in app:**

```typescript
// src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// src/main.tsx
<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

### 3.4 Store Splitting: useMapStore Too Large

**Problem:** useMapStore handles 4 unrelated concerns:

1. **Viewport management** (center, zoom, bearing, pitch) — map rendering
2. **Geolocation** (userLocation, locationPermission, isLocating) — location services
3. **Search state** (searchLocation, searchQuery) — filtering
4. **Selection state** (selectedJobId, hoveredJobId) — UI interaction

**Consequences:**
- Changes to userLocation trigger full store recompute
- Components subscribing to selectedJobId are notified of userLocation updates (wasted renders)
- Hard to test — setup requires all state
- Hard to reuse — can't export just geolocation logic to another app

**Solution: Split into 4 stores**

```typescript
// src/store/map/viewport.ts
export const useMapViewportStore = create((set) => ({
  viewport: { center: [lng, lat], zoom, bearing, pitch },
  bounds: [[minLng, minLat], [maxLng, maxLat]],

  setViewport: (viewport) => set({ viewport }),
  setBounds: (bounds) => set({ bounds }),
}));

// src/store/map/geolocation.ts
export const useGeolocationStore = create((set, get) => ({
  userLocation: null,
  locationPermission: 'prompt',
  isLocating: false,

  setUserLocation: (location) => set({ userLocation: location }),
  setLocationPermission: (permission) => set({ locationPermission: permission }),

  startLocating: async () => {
    set({ isLocating: true });
    try {
      const position = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      set({
        userLocation: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        locationPermission: 'granted',
      });
    } catch (err) {
      set({ locationPermission: 'denied' });
    } finally {
      set({ isLocating: false });
    }
  },
}));

// src/store/map/search.ts
export const useMapSearchStore = create((set) => ({
  searchLocation: null,
  searchQuery: '',
  selectedCity: null,

  setSearchLocation: (location) => set({ searchLocation: location }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCity: (city) => set({ selectedCity: city }),
}));

// src/store/map/selection.ts
export const useMapSelectionStore = create((set) => ({
  selectedJobId: null,
  hoveredJobId: null,
  mapStyle: 'dark',

  setSelectedJobId: (id) => set({ selectedJobId: id }),
  setHoveredJobId: (id) => set({ hoveredJobId: id }),
  setMapStyle: (style) => set({ mapStyle: style }),
}));

// (Optional) Re-export from src/store/map/index.ts for convenience:
export { useMapViewportStore, useGeolocationStore, useMapSearchStore, useMapSelectionStore };

// Usage in components:
const viewport = useMapViewportStore((s) => s.viewport); // Only viewport updates
const userLocation = useGeolocationStore((s) => s.userLocation); // Only location updates
const selectedJob = useMapSelectionStore((s) => s.selectedJobId); // Only selection updates

// Component only re-renders when its subscribed selector changes
```

**Computed actions that bridge stores:**

```typescript
// src/hooks/useMapCentering.ts
export const useMapCentering = () => {
  const viewport = useMapViewportStore((s) => s.viewport);
  const setViewport = useMapViewportStore((s) => s.setViewport);
  const userLocation = useGeolocationStore((s) => s.userLocation);
  const searchLocation = useMapSearchStore((s) => s.searchLocation);

  const effectiveCenter = userLocation || searchLocation || viewport.center;

  const recenterToUser = () => {
    if (userLocation) {
      setViewport({
        ...viewport,
        center: [userLocation.longitude, userLocation.latitude],
      });
    }
  };

  const recenterToSearch = () => {
    if (searchLocation) {
      setViewport({
        ...viewport,
        center: [searchLocation.longitude, searchLocation.latitude],
      });
    }
  };

  return { effectiveCenter, recenterToUser, recenterToSearch };
};
```

---

### 3.5 Missing Optimistic Updates

**Problem:** No optimistic UI updates for mutations

Current experience when placing a bid:
1. Click "Place Bid"
2. Button shows spinner
3. Stare at spinner for 1-2 seconds
4. Server responds
5. Job card finally shows "✓ Bid Placed"
6. User annoyed at latency

Better experience:
1. Click "Place Bid"
2. **Immediately** show "✓ Bid Placed" (optimistic)
3. Button goes back to normal
4. Server confirms in background
5. If server fails → show error, revert "✓" to checkmark

**Implementation with React Query:**

```typescript
// src/hooks/usePlaceBid.ts
export const usePlaceBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => createBid(jobId),

    onMutate: async (jobId) => {
      // Cancel any in-flight requests for jobs
      await queryClient.cancelQueries(['jobs', jobId]);

      // Get previous data
      const previousJob = queryClient.getQueryData(['jobs', jobId]);

      // Optimistically update
      queryClient.setQueryData(['jobs', jobId], (old) => ({
        ...old,
        userHasBid: true,
        bidStatus: 'pending',
      }));

      return { previousJob }; // Return for rollback
    },

    onSuccess: (response, jobId) => {
      // Update with server response
      queryClient.setQueryData(['jobs', jobId], (old) => ({
        ...old,
        bidStatus: response.status,
        bidId: response.bidId,
      }));

      toast.success('Bid placed successfully!');
    },

    onError: (error, jobId, context) => {
      // Revert to previous data on error
      queryClient.setQueryData(['jobs', jobId], context.previousJob);
      toast.error('Failed to place bid. Please try again.');
    },
  });
};

// Usage in component:
const { mutate: placeBid, isPending } = usePlaceBid();

<button
  onClick={() => placeBid(jobId)}
  disabled={isPending}
>
  {isPending ? 'Placing bid...' : 'Place Bid'}
</button>
```

**Apply optimistic updates to:**
- [ ] Place bid on job
- [ ] Send message
- [ ] Mark notification as read
- [ ] Publish job post
- [ ] Update profile
- [ ] Accept/reject bid

---

### 3.6 Toast Auto-Removal Memory Leak

**Problem:** useUIStore.addToast() uses setTimeout without cleanup

```typescript
addToast: (type, message) => {
  const id = nanoid();
  const toasts = [...get().toasts, { id, type, message }];
  set({ toasts });

  // BUG: No cleanup of this timeout!
  // If component unmounts before 4s, timeout still fires
  setTimeout(() => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  }, 4000); // Memory leak: setTimeout not tracked
};
```

**Problems:**
1. If 50 toasts added in a day → 50 timers left hanging
2. Timers might run after component unmounts
3. In tests, timers accumulate and slow down suite
4. No way to cancel a toast early

**Solution: Return cancel function + cleanup**

```typescript
// src/store/ui.ts
const createToastStore = () =>
  create<UIStore>((set, get) => {
    const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

    return {
      toasts: [],

      addToast: (type, message, duration = 4000) => {
        const id = nanoid();
        set((state) => ({
          toasts: [...state.toasts, { id, type, message }],
        }));

        const timer = setTimeout(() => {
          get().removeToast(id);
          activeTimers.delete(id);
        }, duration);

        activeTimers.set(id, timer);

        // Return cancel function
        return () => {
          const t = activeTimers.get(id);
          if (t) clearTimeout(t);
          activeTimers.delete(id);
          get().removeToast(id);
        };
      },

      removeToast: (id) => {
        // Clear timer if exists
        const timer = activeTimers.get(id);
        if (timer) {
          clearTimeout(timer);
          activeTimers.delete(id);
        }

        set((state) => ({
          toasts: state.toasts.filter(t => t.id !== id),
        }));
      },
    };
  });

// Usage with cleanup:
const cancel = addToast('success', 'Job posted!');

// Or auto-cleanup:
useEffect(() => {
  const cancel = addToast('info', 'Loading jobs...');
  return cancel; // Cancel toast if component unmounts
}, []);
```

---

### 3.7 Missing Mock User Guards (Production Security)

**Problem:** useAuthStore.initializeMockUser() could leak into production

```typescript
// In store initialization:
const useAuthStore = create((set) => ({
  // ...
  initializeMockUser: () => {
    set({ user: MOCK_USER, isAuthenticated: true });
  },
}));

// Called in component (with no guards):
useEffect(() => {
  if (!user) {
    initializeMockUser(); // Oops, ran in production!
  }
}, []);
```

**Risks:**
- Test user account visible in production
- Sensitive mock data (fake password, test payment method) exposed
- "Demo" mode accidentally shipped to users
- Security vulnerability if MOCK_USER has admin privileges

**Solution: Environment-gated initialization**

```typescript
// src/lib/constants.ts
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// src/store/index.ts
const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,

  initializeMockUser: () => {
    if (!isDevelopment) {
      console.warn('[DEV ONLY] Mock user initialization disabled in production');
      return;
    }
    set({ user: MOCK_USER, isAuthenticated: true });
  },

  // Safer: auto-initialize only in dev
  hydrate: () => {
    if (isDevelopment && !get().user && !localStorage.getItem('crewlink-auth')) {
      get().initializeMockUser();
    }
  },
}));

// src/main.tsx — don't automatically init mock user
useAuthStore.getState().hydrate();
```

**Or better: separate dev and prod stores:**

```typescript
// src/store/dev.ts (dev-only)
export const useDevAuthStore = isDevelopment ? useAuthStore : null;

// src/store/index.ts (always used)
export const useAuthStore = create(/* ... */);

// Components never call initializeMockUser() directly
// Tests import from dev store only
```

---

## Section 4: Implementation Roadmap

### Phase 1: Role Consolidation (CRITICAL)
**Timeline:** 1-2 sprints
1. Standardize role type to lowercase `'hirer' | 'worker'` globally
2. Make useAuthStore the single source of truth for role
3. Delete UserRoleContext and AppModeContext
4. Add migration logic for old localStorage entries
5. Add tests for role switching across stores

**Success metrics:**
- No role casing mismatches in codebase
- No duplicate role state
- Role changes are atomic

---

### Phase 2: URL State Migration
**Timeline:** 2-3 sprints
1. Migrate job filters to URL state
2. Migrate pagination to URL state
3. Migrate active message thread to URL param
4. Migrate onboarding step to URL state
5. Update routing to support these params

**Success metrics:**
- All filters shareable via URL
- Browser back/forward works correctly
- Page refresh preserves state

---

### Phase 3: React Query Adoption
**Timeline:** 3-4 sprints
1. Install React Query and setup QueryClient
2. Convert useJobsStore data fetching to useQuery
3. Convert useMessagesStore to useQuery
4. Convert useNotificationsStore to useQuery
5. Implement optimistic updates for mutations

**Success metrics:**
- No manual fetch/loading/error state
- Automatic deduplication of requests
- Optimistic updates work with rollback

---

### Phase 4: Store Splitting & Cleanup
**Timeline:** 2-3 sprints
1. Split useMapStore into 4 focused stores
2. Delete redundant useAppModeStore
3. Fix toast cleanup memory leak
4. Add comprehensive error handling to all stores

**Success metrics:**
- Stores are <200 lines of code each
- No unrelated concerns in single store
- No memory leaks from timers

---

### Phase 5: Real-time Updates
**Timeline:** 2-3 sprints
1. Add WebSocket subscription for messages
2. Add WebSocket subscription for notifications
3. Add presence awareness for conversations
4. Implement read receipts

**Success metrics:**
- Messages appear in real-time (no page refresh needed)
- Notifications arrive instantly
- Users see who else is online

---

## Section 5: Recommended File Structure

```
src/
├── store/
│   ├── index.ts              (Zustand setup)
│   ├── auth.ts               (useAuthStore — SINGLE source of truth for role)
│   ├── ui.ts                 (useUIStore)
│   ├── onboarding.ts         (useOnboardingStore, remove step → URL)
│   ├── job-form.ts           (useJobFormStore, remove step → URL)
│   ├── map/
│   │   ├── viewport.ts       (useMapViewportStore)
│   │   ├── geolocation.ts    (useGeolocationStore)
│   │   ├── search.ts         (useMapSearchStore)
│   │   └── selection.ts      (useMapSelectionStore)
│   ├── (DELETE) index-old.ts (useJobsStore, useMessagesStore → React Query)
│   ├── (DELETE) mode.ts      (useAppModeStore — moved to auth)
│   └── (DELETE) notifications.ts (→ React Query)
│
├── hooks/
│   ├── useUserRole.ts        (reads from useAuthStore, replaces UserRoleContext)
│   ├── useJobFilters.ts      (reads/writes URL state)
│   ├── useMapCentering.ts    (bridges map stores)
│   ├── queries/
│   │   ├── useJobs.ts        (React Query for jobs)
│   │   ├── useJobDetails.ts  (React Query)
│   │   ├── useMessages.ts    (React Query)
│   │   ├── useNotifications.ts (React Query + WebSocket)
│   │   └── ...
│   └── mutations/
│       ├── usePlaceBid.ts    (with optimistic updates)
│       ├── useSendMessage.ts (with optimistic updates)
│       └── ...
│
├── contexts/
│   ├── (DELETE) UserRoleContext.tsx
│   └── (DELETE) AppModeContext.tsx
│
├── config/
│   └── routes.ts             (role-based routing, replaces context logic)
│
└── types/
    └── index.ts              (single UserRole = 'hirer' | 'worker')
```

---

## Section 6: Testing Implications

### Current Pain Points:
- Mock user auto-initialization breaks tests
- No way to reset stores between tests
- Role sync issues cause test flakiness
- localStorage not cleared between tests

### Recommended Testing Setup:

```typescript
// src/store/__tests__/setup.ts
import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../auth';

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

beforeEach(() => {
  // Clear all stores
  useAuthStore.setState({ user: null, isAuthenticated: false });

  // Clear localStorage
  localStorage.clear();

  // Clear queryClient cache
  queryClient.clear();
});

// Tests no longer flaky from store pollution
```

---

## Summary of Changes

| Change | Current | Recommended | Priority |
|--------|---------|-------------|----------|
| Role source | 3 places | 1 place (useAuthStore) | CRITICAL |
| Role casing | Mixed case | Lowercase 'hirer'\|'worker' | CRITICAL |
| useAppModeStore | Exists | DELETE | HIGH |
| UserRoleContext | Exists | DELETE | HIGH |
| Job filters state | Client (useJobsStore) | URL state | HIGH |
| Active thread | Client (useMessagesStore) | URL param (:threadId) | HIGH |
| Data fetching | Imperative + Zustand | React Query | HIGH |
| useMapStore size | 15+ actions | Split into 4 stores | MEDIUM |
| Toast cleanup | No cleanup | Proper cleanup + cancel | MEDIUM |
| Optimistic updates | Missing | Add to all mutations | MEDIUM |
| Real-time updates | Polling/manual | WebSocket subscriptions | LOW |
| Mock user guards | None | Environment-gated | MEDIUM |

---

**Document Version:** 1.0
**Last Updated:** 2026-02-27
**Status:** Ready for implementation
