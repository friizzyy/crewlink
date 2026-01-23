'use client'

import { useRouter } from 'next/navigation'
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store'
import type { UserRole } from '@/types'

interface RestrictedAccessProps {
  requiredRole: UserRole
  currentRole: UserRole
}

export function RestrictedAccess({ requiredRole, currentRole }: RestrictedAccessProps) {
  const router = useRouter()
  const { switchRole } = useAuthStore()

  const targetRoleLabel = requiredRole === 'hirer' ? 'Hiring' : 'Working'
  const currentRoleLabel = currentRole === 'hirer' ? 'Hiring' : 'Working'

  const handleSwitchRole = () => {
    switchRole(requiredRole)
    // Redirect to appropriate home after switch
    const targetPath = requiredRole === 'hirer' ? '/hiring/map' : '/work/map'
    router.push(targetPath)
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Glass Panel */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/10 p-8 shadow-2xl shadow-black/40">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-white/10 flex items-center justify-center">
              <Lock className="w-10 h-10 text-slate-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-3">
            Access Restricted
          </h1>

          {/* Message */}
          <p className="text-slate-400 text-center mb-8 leading-relaxed">
            You&apos;re currently in <span className="text-white font-medium">{currentRoleLabel}</span> mode.
            {' '}Switch to <span className="text-cyan-400 font-medium">{targetRoleLabel}</span> to
            {requiredRole === 'worker'
              ? ' view job opportunities.'
              : ' access hiring tools.'
            }
          </p>

          {/* Primary Action */}
          <button
            onClick={handleSwitchRole}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25"
          >
            Switch to {targetRoleLabel}
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Secondary Action */}
          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2 py-3 mt-3 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}

export default RestrictedAccess
