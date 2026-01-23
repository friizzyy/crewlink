'use client'

import { useEffect, useState } from 'react'
import { useAuthStore, ENABLE_ROLE_TOGGLE } from '@/store'
import { RestrictedAccess } from './RestrictedAccess'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  allowedRole: UserRole
  children: React.ReactNode
}

/**
 * RoleGuard - Protects routes based on user role
 *
 * Usage:
 * <RoleGuard allowedRole="hirer">
 *   <HirerOnlyContent />
 * </RoleGuard>
 *
 * If ENABLE_ROLE_TOGGLE is true (QA/Admin mode), all roles are allowed.
 */
export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const { user, isLoading, getCurrentRole } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }

  // Still loading auth state
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }

  // If QA/Admin mode is enabled, allow all access
  if (ENABLE_ROLE_TOGGLE) {
    return <>{children}</>
  }

  // Get the current role
  const currentRole = getCurrentRole()

  // Check if user has the required role
  if (currentRole !== allowedRole) {
    return <RestrictedAccess requiredRole={allowedRole} currentRole={currentRole} />
  }

  // User has the correct role
  return <>{children}</>
}

/**
 * HirerOnly - Shorthand for hirer-only content
 */
export function HirerOnly({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRole="hirer">{children}</RoleGuard>
}

/**
 * WorkerOnly - Shorthand for worker-only content
 */
export function WorkerOnly({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRole="worker">{children}</RoleGuard>
}

export default RoleGuard
