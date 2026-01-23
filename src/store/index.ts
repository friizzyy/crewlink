import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  User,
  UserRole,
  AppMode,
  Job,
  JobFilters,
  MapCenter,
  MapBounds,
  MessageThread,
  Notification,
  WorkerOnboardingData,
} from '@/types'

// ============================================
// ENVIRONMENT FLAGS
// ============================================

// Enable role toggle for QA/Admin testing only - NEVER enable in production
export const ENABLE_ROLE_TOGGLE = process.env.NEXT_PUBLIC_ENABLE_ROLE_TOGGLE === 'true'

// ============================================
// MOCK USER FOR DEVELOPMENT
// ============================================

const MOCK_USER: User = {
  id: 'demo-user-1',
  phone: '+1 (555) 123-4567',
  email: 'john@example.com',
  name: 'John Doe',
  avatarUrl: null,
  role: 'hirer', // Default role for demo
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ============================================
// AUTH STORE (with role management)
// ============================================

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  // Role management
  switchRole: (role: UserRole) => void
  getCurrentRole: () => UserRole
  // Initialize with mock user for development
  initializeMockUser: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false, // Changed to false since we auto-init
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
      // Switch user role and persist
      switchRole: (role: UserRole) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, role } })
        } else {
          // If no user, initialize mock user with the requested role
          set({ user: { ...MOCK_USER, role }, isAuthenticated: true })
        }
      },
      // Get current role (defaults to 'hirer' if no user)
      getCurrentRole: () => {
        const user = get().user
        return user?.role || 'hirer'
      },
      // Initialize with mock user for development
      initializeMockUser: () => {
        const currentUser = get().user
        if (!currentUser) {
          set({ user: MOCK_USER, isAuthenticated: true, isLoading: false })
        }
      },
    }),
    {
      name: 'crewlink-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      // Auto-initialize mock user on hydration if not already set
      onRehydrateStorage: () => (state) => {
        if (state && !state.user) {
          state.user = MOCK_USER
          state.isAuthenticated = true
        }
      },
    }
  )
)

// ============================================
// APP MODE STORE (legacy - derives from user role)
// ============================================

interface AppModeState {
  mode: AppMode
  setMode: (mode: AppMode) => void
  toggleMode: () => void
}

// This store now derives mode from user role for consistency
// The toggle is kept for backward compatibility but only works with ENABLE_ROLE_TOGGLE
export const useAppModeStore = create<AppModeState>()(
  persist(
    (set, get) => ({
      mode: 'hire',
      setMode: (mode) => set({ mode }),
      toggleMode: () => {
        // Only allow toggle in QA/Admin mode
        if (ENABLE_ROLE_TOGGLE) {
          set({ mode: get().mode === 'hire' ? 'work' : 'hire' })
        }
      },
    }),
    {
      name: 'crewlink-mode',
    }
  )
)

// ============================================
// ENHANCED MAP STORE - CENTRALIZED STATE
// ============================================

export interface UserLocation {
  latitude: number
  longitude: number
  accuracy: number
  heading?: number | null
  timestamp?: number
}

export interface MapViewport {
  center: MapCenter
  zoom: number
  bearing?: number
  pitch?: number
}

type LocationPermission = 'prompt' | 'granted' | 'denied' | 'unavailable' | 'loading'

interface MapState {
  // Core viewport state
  viewport: MapViewport
  bounds: MapBounds | null

  // User location (live geolocation)
  userLocation: UserLocation | null
  locationPermission: LocationPermission
  isLocating: boolean

  // Search/manual location override
  searchLocation: MapCenter | null
  searchQuery: string

  // Follow mode
  followMode: boolean

  // Auto-refresh when panning
  autoRefresh: boolean
  needsRefresh: boolean

  // Selected city filter
  selectedCity: string | null

  // Map style
  mapStyle: 'dark' | 'satellite'

  // Selection state
  selectedJobId: string | null
  hoveredJobId: string | null

  // Actions
  setViewport: (viewport: Partial<MapViewport>) => void
  setBounds: (bounds: MapBounds) => void
  setUserLocation: (location: UserLocation | null) => void
  setLocationPermission: (permission: LocationPermission) => void
  setIsLocating: (isLocating: boolean) => void
  setSearchLocation: (location: MapCenter | null) => void
  setSearchQuery: (query: string) => void
  setFollowMode: (follow: boolean) => void
  setAutoRefresh: (auto: boolean) => void
  setNeedsRefresh: (needs: boolean) => void
  setSelectedCity: (city: string | null) => void
  setMapStyle: (style: 'dark' | 'satellite') => void
  setSelectedJobId: (id: string | null) => void
  setHoveredJobId: (id: string | null) => void

  // Computed actions
  recenterToUser: () => void
  recenterToSearch: () => void
  updateLocationAndRecenter: (location: UserLocation) => void
  clearSearchLocation: () => void

  // Get effective center (search location takes precedence over user location)
  getEffectiveCenter: () => MapCenter
}

const DEFAULT_CENTER: MapCenter = { lat: 37.7749, lng: -122.4194 } // San Francisco
const DEFAULT_ZOOM = 12

export const useMapStore = create<MapState>()((set, get) => ({
  // Initial state
  viewport: {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    bearing: 0,
    pitch: 0,
  },
  bounds: null,
  userLocation: null,
  locationPermission: 'loading',
  isLocating: false,
  searchLocation: null,
  searchQuery: '',
  followMode: true,
  autoRefresh: false,
  needsRefresh: false,
  selectedCity: null,
  mapStyle: 'dark',
  selectedJobId: null,
  hoveredJobId: null,

  // Basic setters
  setViewport: (viewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
      // If user manually moves map while in follow mode, disable follow
      followMode: viewport.center ? false : state.followMode,
    })),

  setBounds: (bounds) => set({ bounds, needsRefresh: !get().autoRefresh }),

  setUserLocation: (userLocation) => {
    const state = get()
    set({ userLocation })

    // If follow mode is on, update viewport center
    if (userLocation && state.followMode && !state.searchLocation) {
      set({
        viewport: {
          ...state.viewport,
          center: { lat: userLocation.latitude, lng: userLocation.longitude },
        },
      })
    }
  },

  setLocationPermission: (locationPermission) => set({ locationPermission }),
  setIsLocating: (isLocating) => set({ isLocating }),

  setSearchLocation: (searchLocation) => {
    set({
      searchLocation,
      followMode: false, // Disable follow when manually searching
      needsRefresh: true,
    })

    // Recenter to search location
    if (searchLocation) {
      set((state) => ({
        viewport: {
          ...state.viewport,
          center: searchLocation,
          zoom: 14,
        },
      }))
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setFollowMode: (followMode) => {
    set({ followMode })
    // If enabling follow mode, immediately recenter to user
    if (followMode) {
      get().recenterToUser()
    }
  },

  setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
  setNeedsRefresh: (needsRefresh) => set({ needsRefresh }),

  setSelectedCity: (selectedCity) => {
    set({ selectedCity, needsRefresh: true })
  },

  setMapStyle: (mapStyle) => set({ mapStyle }),
  setSelectedJobId: (selectedJobId) => set({ selectedJobId }),
  setHoveredJobId: (hoveredJobId) => set({ hoveredJobId }),

  // Computed actions
  recenterToUser: () => {
    const { userLocation, viewport } = get()
    if (userLocation) {
      set({
        viewport: {
          ...viewport,
          center: { lat: userLocation.latitude, lng: userLocation.longitude },
          zoom: 15,
        },
        followMode: true,
        searchLocation: null, // Clear search override
        needsRefresh: true,
      })
    }
  },

  recenterToSearch: () => {
    const { searchLocation, viewport } = get()
    if (searchLocation) {
      set({
        viewport: {
          ...viewport,
          center: searchLocation,
          zoom: 14,
        },
        followMode: false,
        needsRefresh: true,
      })
    }
  },

  updateLocationAndRecenter: (location: UserLocation) => {
    const state = get()
    set({
      userLocation: location,
      locationPermission: 'granted',
      isLocating: false,
    })

    // Only auto-recenter if follow mode and no search override
    if (state.followMode && !state.searchLocation) {
      set({
        viewport: {
          ...state.viewport,
          center: { lat: location.latitude, lng: location.longitude },
        },
        needsRefresh: true,
      })
    }
  },

  clearSearchLocation: () => {
    set({ searchLocation: null, searchQuery: '' })
    // Optionally recenter to user
    get().recenterToUser()
  },

  getEffectiveCenter: () => {
    const { searchLocation, userLocation, viewport } = get()
    if (searchLocation) return searchLocation
    if (userLocation) return { lat: userLocation.latitude, lng: userLocation.longitude }
    return viewport.center
  },
}))

// ============================================
// JOBS STORE
// ============================================

interface JobsState {
  jobs: Job[]
  isLoading: boolean
  filters: JobFilters
  searchQuery: string
  setJobs: (jobs: Job[]) => void
  addJob: (job: Job) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  removeJob: (id: string) => void
  setLoading: (loading: boolean) => void
  setFilters: (filters: Partial<JobFilters>) => void
  resetFilters: () => void
  setSearchQuery: (query: string) => void
}

const defaultFilters: JobFilters = {
  sortBy: 'distance',
  radius: 25,
}

export const useJobsStore = create<JobsState>()((set) => ({
  jobs: [],
  isLoading: false,
  filters: defaultFilters,
  searchQuery: '',
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  updateJob: (id, updates) =>
    set((state) => ({
      jobs: state.jobs.map((job) => (job.id === id ? { ...job, ...updates } : job)),
    })),
  removeJob: (id) => set((state) => ({ jobs: state.jobs.filter((job) => job.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))

// ============================================
// MESSAGES STORE
// ============================================

interface MessagesState {
  threads: MessageThread[]
  activeThreadId: string | null
  isLoading: boolean
  unreadCount: number
  setThreads: (threads: MessageThread[]) => void
  addThread: (thread: MessageThread) => void
  updateThread: (id: string, updates: Partial<MessageThread>) => void
  setActiveThreadId: (id: string | null) => void
  setLoading: (loading: boolean) => void
  setUnreadCount: (count: number) => void
  markThreadAsRead: (id: string) => void
}

export const useMessagesStore = create<MessagesState>()((set, get) => ({
  threads: [],
  activeThreadId: null,
  isLoading: false,
  unreadCount: 0,
  setThreads: (threads) => set({ threads }),
  addThread: (thread) => set((state) => ({ threads: [thread, ...state.threads] })),
  updateThread: (id, updates) =>
    set((state) => ({
      threads: state.threads.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  setActiveThreadId: (activeThreadId) => set({ activeThreadId }),
  setLoading: (isLoading) => set({ isLoading }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  markThreadAsRead: (id) => {
    const { threads } = get()
    const thread = threads.find((t) => t.id === id)
    if (thread && thread.unreadCount) {
      set({
        threads: threads.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t)),
        unreadCount: Math.max(0, get().unreadCount - (thread.unreadCount || 0)),
      })
    }
  },
}))

// ============================================
// NOTIFICATIONS STORE
// ============================================

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  setLoading: (loading: boolean) => void
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
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
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: new Date() } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: n.readAt || new Date(),
      })),
      unreadCount: 0,
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))

// ============================================
// ONBOARDING STORE (Worker)
// ============================================

interface OnboardingState {
  step: number
  data: Partial<WorkerOnboardingData>
  isComplete: boolean
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setData: (data: Partial<WorkerOnboardingData>) => void
  reset: () => void
  markComplete: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      step: 1,
      data: {},
      isComplete: false,
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
      setData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
      reset: () => set({ step: 1, data: {}, isComplete: false }),
      markComplete: () => set({ isComplete: true }),
    }),
    {
      name: 'crewlink-onboarding',
    }
  )
)

// ============================================
// JOB FORM STORE (Draft autosave)
// ============================================

interface JobFormState {
  step: number
  data: Partial<import('@/types').JobFormData>
  isDirty: boolean
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  setData: (data: Partial<import('@/types').JobFormData>) => void
  reset: () => void
  setDirty: (dirty: boolean) => void
}

export const useJobFormStore = create<JobFormState>()(
  persist(
    (set) => ({
      step: 1,
      data: {},
      isDirty: false,
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
      setData: (data) => set((state) => ({ data: { ...state.data, ...data }, isDirty: true })),
      reset: () => set({ step: 1, data: {}, isDirty: false }),
      setDirty: (isDirty) => set({ isDirty }),
    }),
    {
      name: 'crewlink-job-form',
    }
  )
)

// ============================================
// UI STORE
// ============================================

interface UIState {
  isMobileMenuOpen: boolean
  isFilterDrawerOpen: boolean
  isBottomSheetOpen: boolean
  bottomSheetContent: 'list' | 'detail' | 'filter' | null
  bottomSheetHeight: 'collapsed' | 'half' | 'full'
  toasts: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>
  setMobileMenuOpen: (open: boolean) => void
  setFilterDrawerOpen: (open: boolean) => void
  setBottomSheet: (open: boolean, content?: 'list' | 'detail' | 'filter' | null) => void
  setBottomSheetHeight: (height: 'collapsed' | 'half' | 'full') => void
  addToast: (type: 'success' | 'error' | 'info', message: string) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>()((set) => ({
  isMobileMenuOpen: false,
  isFilterDrawerOpen: false,
  isBottomSheetOpen: false,
  bottomSheetContent: null,
  bottomSheetHeight: 'half',
  toasts: [],
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  setFilterDrawerOpen: (isFilterDrawerOpen) => set({ isFilterDrawerOpen }),
  setBottomSheet: (isBottomSheetOpen, bottomSheetContent = null) =>
    set({ isBottomSheetOpen, bottomSheetContent }),
  setBottomSheetHeight: (bottomSheetHeight) => set({ bottomSheetHeight }),
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2)
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
