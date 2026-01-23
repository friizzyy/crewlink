'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, RefreshCw, Briefcase, Users, Sparkles, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserRole, ROLE_LABELS } from '@/contexts/UserRoleContext'

function WrongSideContent() {
  const searchParams = useSearchParams()
  const { role, switchRole, getHomeRoute } = useUserRole()

  const attemptedRoute = searchParams.get('attempted') || ''
  const requiredRole = searchParams.get('required') as 'HIRER' | 'WORKER' | null
  const currentRole = searchParams.get('current') as 'HIRER' | 'WORKER' | null

  // Determine which side they're on and which they tried to access
  const isHirerTryingWorker = currentRole === 'HIRER' && requiredRole === 'WORKER'
  const isWorkerTryingHirer = currentRole === 'WORKER' && requiredRole === 'HIRER'

  const targetRoleLabel = requiredRole ? ROLE_LABELS[requiredRole] : null
  const currentRoleLabel = currentRole ? ROLE_LABELS[currentRole] : null

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={cn(
          'absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[150px]',
          isHirerTryingWorker ? 'bg-emerald-500/10' : 'bg-cyan-500/10'
        )} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">CrewLink</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">
          {/* Icon */}
          <div className={cn(
            'w-24 h-24 rounded-3xl mx-auto mb-8 flex items-center justify-center',
            isHirerTryingWorker
              ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20'
              : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/20'
          )}>
            {isHirerTryingWorker ? (
              <Briefcase className="w-12 h-12 text-emerald-400" />
            ) : (
              <Users className="w-12 h-12 text-cyan-400" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            This is the {requiredRole === 'WORKER' ? 'Worker' : 'Hiring'} Side
          </h1>

          {/* Description */}
          <p className="text-lg text-slate-400 mb-8 max-w-md mx-auto">
            {isHirerTryingWorker ? (
              <>
                You&apos;re signed in as a <span className="text-cyan-400">Hirer</span>.
                This area is for <span className="text-emerald-400">Workers</span> looking for jobs.
              </>
            ) : isWorkerTryingHirer ? (
              <>
                You&apos;re signed in as a <span className="text-emerald-400">Worker</span>.
                This area is for <span className="text-cyan-400">Hirers</span> posting jobs.
              </>
            ) : (
              <>
                You don&apos;t have access to this area.
              </>
            )}
          </p>

          {/* Current Role Card */}
          {currentRoleLabel && (
            <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-6 mb-8">
              <p className="text-sm text-slate-500 mb-2">You&apos;re currently on</p>
              <div className="flex items-center justify-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  currentRole === 'HIRER' ? 'bg-cyan-500/20' : 'bg-emerald-500/20'
                )}>
                  {currentRole === 'HIRER' ? (
                    <Users className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Briefcase className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div className="text-left">
                  <p className={cn(
                    'font-semibold',
                    currentRole === 'HIRER' ? 'text-cyan-400' : 'text-emerald-400'
                  )}>
                    {currentRoleLabel.title}
                  </p>
                  <p className="text-sm text-slate-500">{currentRoleLabel.subtitle}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            {/* Go to correct side */}
            <Link
              href={getHomeRoute()}
              className={cn(
                'w-full py-4 px-6 rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all',
                currentRole === 'HIRER'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
              )}
            >
              Go to {currentRole === 'HIRER' ? 'Hiring' : 'Worker'} Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Switch role */}
            <button
              onClick={switchRole}
              className="w-full py-4 px-6 rounded-2xl font-semibold bg-slate-800 text-white hover:bg-slate-700 border border-white/10 transition-all flex items-center justify-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              Switch to {requiredRole === 'WORKER' ? 'Worker' : 'Hirer'} Mode
            </button>

            {/* Learn more */}
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <HelpCircle className="w-4 h-4" />
              Learn how CrewLink works
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function WrongSidePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    }>
      <WrongSideContent />
    </Suspense>
  )
}
