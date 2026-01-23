'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { useRoleGuard } from '@/contexts/UserRoleContext'
import { UniversalNav } from '@/components/UniversalNav'

// ============================================
// HIRING LAYOUT INNER - Uses role guard + UniversalNav
// Now uses the unified navigation system with /hiring route prefix
// ============================================
function HiringLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthorized, isLoading } = useRoleGuard('HIRER')

  // Check if we're on a full-screen page (map)
  const isFullScreen = pathname === '/hiring/map' || pathname === '/hiring'

  // Show loading while checking authorization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authorized, the guard will handle redirect
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-slate-950">
      {/* Universal Navigation - unified with /app, using /hiring route prefix */}
      <UniversalNav
        variant="app"
        mode="hire"
        routePrefix="/hiring"
      />

      {/* Main Content - Full screen for map, navbar height is h-20 (80px) */}
      <main className={`pt-20 ${isFullScreen ? 'h-screen' : 'min-h-screen'}`}>
        {children}
      </main>
    </div>
  )
}

// ============================================
// HIRING LAYOUT - Wraps with Suspense for useSearchParams
// ============================================
export default function HiringLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <HiringLayoutInner>{children}</HiringLayoutInner>
    </Suspense>
  )
}
