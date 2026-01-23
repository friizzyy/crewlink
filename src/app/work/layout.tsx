'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { useRoleGuard } from '@/contexts/UserRoleContext'
import { UniversalNav } from '@/components/UniversalNav'

// ============================================
// WORKER LAYOUT INNER - Uses role guard + UniversalNav
// Now uses the unified navigation system with /work route prefix
// ============================================
function WorkerLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthorized, isLoading } = useRoleGuard('WORKER')

  // Check if we're on a full-screen page (map)
  const isFullScreen = pathname === '/work/map' || pathname === '/work'

  // Show loading while checking authorization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
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
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-slate-950">
      {/* Universal Navigation - unified with /app, using /work route prefix */}
      <UniversalNav
        variant="app"
        mode="work"
        routePrefix="/work"
      />

      {/* Main Content - Full screen for map, navbar height is h-20 (80px) */}
      <main className={`pt-20 ${isFullScreen ? 'h-screen' : 'min-h-screen'}`}>
        {children}
      </main>
    </div>
  )
}

// ============================================
// WORKER LAYOUT - Wraps with Suspense for useSearchParams
// ============================================
export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <WorkerLayoutInner>{children}</WorkerLayoutInner>
    </Suspense>
  )
}
