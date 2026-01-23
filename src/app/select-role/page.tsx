'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Briefcase, Users, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserRole, type UserRole, ROLE_LABELS } from '@/contexts/UserRoleContext'

export default function SelectRolePage() {
  const { setRole, isLoading } = useUserRole()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
  }

  const handleContinue = () => {
    if (!selectedRole) return
    setIsTransitioning(true)
    // Small delay for animation
    setTimeout(() => {
      setRole(selectedRole)
    }, 300)
  }

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

  return (
    <div className={cn(
      'min-h-screen bg-slate-950 flex flex-col transition-opacity duration-300',
      isTransitioning && 'opacity-0'
    )}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
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
        <div className="w-full max-w-3xl">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              How will you use CrewLink?
            </h1>
            <p className="text-xl text-slate-400 max-w-lg mx-auto">
              Choose your role to get started. You can switch later if needed.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Hirer Card */}
            <button
              onClick={() => handleRoleSelect('HIRER')}
              className={cn(
                'relative p-8 rounded-3xl border-2 text-left transition-all duration-300 group',
                selectedRole === 'HIRER'
                  ? 'bg-cyan-500/10 border-cyan-500 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/50 border-white/10 hover:border-cyan-500/50 hover:bg-slate-900'
              )}
            >
              {/* Selected indicator */}
              {selectedRole === 'HIRER' && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all',
                selectedRole === 'HIRER'
                  ? 'bg-gradient-to-br from-cyan-400 to-blue-600'
                  : 'bg-slate-800 group-hover:bg-cyan-500/20'
              )}>
                <Users className={cn(
                  'w-8 h-8 transition-colors',
                  selectedRole === 'HIRER' ? 'text-white' : 'text-cyan-400'
                )} />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {ROLE_LABELS.HIRER.title}
              </h2>
              <p className="text-slate-400 mb-6">
                {ROLE_LABELS.HIRER.subtitle}
              </p>

              {/* Features */}
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Post jobs and get bids from workers
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Browse verified local professionals
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Secure payments and reviews
                </li>
              </ul>
            </button>

            {/* Worker Card */}
            <button
              onClick={() => handleRoleSelect('WORKER')}
              className={cn(
                'relative p-8 rounded-3xl border-2 text-left transition-all duration-300 group',
                selectedRole === 'WORKER'
                  ? 'bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900/50 border-white/10 hover:border-emerald-500/50 hover:bg-slate-900'
              )}
            >
              {/* Selected indicator */}
              {selectedRole === 'WORKER' && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              )}

              {/* Icon */}
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all',
                selectedRole === 'WORKER'
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
                  : 'bg-slate-800 group-hover:bg-emerald-500/20'
              )}>
                <Briefcase className={cn(
                  'w-8 h-8 transition-colors',
                  selectedRole === 'WORKER' ? 'text-white' : 'text-emerald-400'
                )} />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {ROLE_LABELS.WORKER.title}
              </h2>
              <p className="text-slate-400 mb-6">
                {ROLE_LABELS.WORKER.subtitle}
              </p>

              {/* Features */}
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Find jobs near you instantly
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Set your rates and availability
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Build your reputation with reviews
                </li>
              </ul>
            </button>
          </div>

          {/* Continue Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={cn(
                'w-full max-w-md py-4 px-8 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all duration-300',
                selectedRole
                  ? selectedRole === 'HIRER'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              )}
            >
              {selectedRole ? (
                <>
                  Continue as {selectedRole === 'HIRER' ? 'Hirer' : 'Worker'}
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                'Select a role to continue'
              )}
            </button>

            <p className="text-sm text-slate-500">
              You can switch roles anytime from your account settings
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-slate-500">
          <p>&copy; 2024 CrewLink. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/safety" className="hover:text-white transition-colors">Safety</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
