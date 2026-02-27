'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getStorageItem, setStorageItem } from '@/lib/utils'

// ============================================
// STRICT ROLE TYPES
// ============================================

export type UserRole = 'HIRER' | 'WORKER'

export interface UserRoleState {
  // Core role - null means not yet selected
  role: UserRole | null
  isRoleSelected: boolean

  // Loading states
  isLoading: boolean

  // Actions
  setRole: (role: UserRole) => void
  switchRole: () => void
  clearRole: () => void

  // Route helpers
  getHomeRoute: () => string
  getMapRoute: () => string
  isOnCorrectSide: (pathname: string) => boolean
  getCorrectSideRoute: (pathname: string) => string | null
}

// ============================================
// STORAGE KEY
// ============================================
const ROLE_STORAGE_KEY = 'crewlink_user_role'

// ============================================
// CONTEXT
// ============================================

const UserRoleContext = createContext<UserRoleState | null>(null)

export function useUserRole() {
  const context = useContext(UserRoleContext)
  if (!context) {
    throw new Error('useUserRole must be used within UserRoleProvider')
  }
  return context
}

// ============================================
// ROUTE CONFIGURATION
// ============================================

// Routes that require HIRER role
const HIRER_ROUTES = [
  '/hiring',
  '/hiring/map',
  '/hiring/post',
  '/hiring/jobs',
  '/hiring/workers',
  '/hiring/messages',
  '/hiring/notifications',
  '/hiring/profile',
  '/hiring/settings',
]

// Routes that require WORKER role
const WORKER_ROUTES = [
  '/work',
  '/work/map',
  '/work/jobs',
  '/work/job',
  '/work/profile',
  '/work/messages',
  '/work/notifications',
  '/work/earnings',
  '/work/settings',
]

// Public routes (no role required)
const PUBLIC_ROUTES = [
  '/',
  '/cities',
  '/safety',
  '/pricing',
  '/auth',
  '/onboarding',
  '/select-role',
]

// ============================================
// PROVIDER
// ============================================

interface UserRoleProviderProps {
  children: ReactNode
}

export function UserRoleProvider({ children }: UserRoleProviderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [role, setRoleState] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load role from storage on mount
  useEffect(() => {
    const storedRole = getStorageItem<UserRole | null>(ROLE_STORAGE_KEY, null)
    if (storedRole === 'HIRER' || storedRole === 'WORKER') {
      setRoleState(storedRole)
    }
    setIsLoading(false)
  }, [])

  // Check if user has selected a role
  const isRoleSelected = role !== null

  // Persist role to server (non-blocking — localStorage is primary for speed)
  const persistRoleToServer = useCallback((newRole: UserRole) => {
    const dbRole = newRole === 'HIRER' ? 'hirer' : 'worker'
    fetch('/api/auth/set-role', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: dbRole }),
    }).catch((err) => {
      console.error('Failed to persist role to server:', err)
    })
  }, [])

  // Set role and persist
  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole)
    setStorageItem(ROLE_STORAGE_KEY, newRole)
    persistRoleToServer(newRole)

    // Navigate to the appropriate home after role selection
    const homeRoute = newRole === 'HIRER' ? '/hiring/map' : '/work/map'
    router.push(homeRoute)
  }, [router, persistRoleToServer])

  // Switch to the other role
  const switchRole = useCallback(() => {
    const newRole = role === 'HIRER' ? 'WORKER' : 'HIRER'
    setRoleState(newRole)
    setStorageItem(ROLE_STORAGE_KEY, newRole)
    persistRoleToServer(newRole)

    // Navigate to the new role's home
    const homeRoute = newRole === 'HIRER' ? '/hiring/map' : '/work/map'
    router.push(homeRoute)
  }, [role, router, persistRoleToServer])

  // Clear role (for logout or role reset)
  const clearRole = useCallback(() => {
    setRoleState(null)
    setStorageItem(ROLE_STORAGE_KEY, null)
    router.push('/select-role')
  }, [router])

  // Get home route for current role
  const getHomeRoute = useCallback(() => {
    if (role === 'HIRER') return '/hiring/map'
    if (role === 'WORKER') return '/work/map'
    return '/select-role'
  }, [role])

  // Get map route for current role
  const getMapRoute = useCallback(() => {
    if (role === 'HIRER') return '/hiring/map'
    if (role === 'WORKER') return '/work/map'
    return '/select-role'
  }, [role])

  // Check if user is on the correct side for their role
  const isOnCorrectSide = useCallback((path: string) => {
    // Public routes are always correct
    if (PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + '/'))) {
      return true
    }

    // No role = must go to role selection
    if (!role) {
      return path === '/select-role' || path === '/onboarding'
    }

    // Check hirer routes
    if (HIRER_ROUTES.some(route => path === route || path.startsWith(route + '/'))) {
      return role === 'HIRER'
    }

    // Check worker routes
    if (WORKER_ROUTES.some(route => path === route || path.startsWith(route + '/'))) {
      return role === 'WORKER'
    }

    // Unknown routes default to correct (could be public)
    return true
  }, [role])

  // Get the correct route to redirect to if on wrong side
  const getCorrectSideRoute = useCallback((path: string) => {
    // If on a hirer route but is a worker
    if (HIRER_ROUTES.some(route => path === route || path.startsWith(route + '/'))) {
      if (role === 'WORKER') {
        // Map hirer route to equivalent worker route
        if (path.includes('/hiring/map')) return '/work/map'
        if (path.includes('/hiring/messages')) return '/work/messages'
        if (path.includes('/hiring/notifications')) return '/work/notifications'
        if (path.includes('/hiring/profile')) return '/work/profile'
        if (path.includes('/hiring/settings')) return '/work/settings'
        return '/work/map' // Default worker home
      }
    }

    // If on a worker route but is a hirer
    if (WORKER_ROUTES.some(route => path === route || path.startsWith(route + '/'))) {
      if (role === 'HIRER') {
        // Map worker route to equivalent hirer route
        if (path.includes('/work/map')) return '/hiring/map'
        if (path.includes('/work/messages')) return '/hiring/messages'
        if (path.includes('/work/notifications')) return '/hiring/notifications'
        if (path.includes('/work/profile')) return '/hiring/profile'
        if (path.includes('/work/settings')) return '/hiring/settings'
        return '/hiring/map' // Default hirer home
      }
    }

    return null
  }, [role])

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: UserRoleState = {
    role,
    isRoleSelected,
    isLoading,
    setRole,
    switchRole,
    clearRole,
    getHomeRoute,
    getMapRoute,
    isOnCorrectSide,
    getCorrectSideRoute,
  }

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  )
}

// ============================================
// ROLE GUARD HOOK
// ============================================

export function useRoleGuard(requiredRole: UserRole) {
  const { role, isLoading, isRoleSelected } = useUserRole()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!isRoleSelected) {
      router.replace('/select-role')
      return
    }

    if (role !== requiredRole) {
      // Redirect to wrong-side page with context
      const params = new URLSearchParams({
        attempted: pathname,
        required: requiredRole,
        current: role || '',
      })
      router.replace(`/wrong-side?${params.toString()}`)
    }
  }, [isLoading, isRoleSelected, role, requiredRole, router, pathname])

  return {
    isAuthorized: role === requiredRole,
    isLoading,
  }
}

// ============================================
// ROLE-SPECIFIC LABELS
// ============================================

export const ROLE_LABELS = {
  HIRER: {
    title: "I'm Hiring",
    subtitle: 'Post jobs and find trusted local help',
    mapAction: 'Find Workers',
    browseLabel: 'Browse Workers',
    postLabel: 'Post Job',
    nearMeLabel: 'Find help near me',
    cityLabel: (city: string) => `View workers in ${city}`,
    markerType: 'workers',
  },
  WORKER: {
    title: "I'm Working",
    subtitle: 'Find jobs and build your business',
    mapAction: 'Find Jobs',
    browseLabel: 'Browse Jobs',
    postLabel: 'Edit Profile',
    nearMeLabel: 'Find work near me',
    cityLabel: (city: string) => `View jobs in ${city}`,
    markerType: 'jobs',
  },
} as const
