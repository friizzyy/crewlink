'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Users, Bell, MessageSquare, ChevronDown, User, Settings,
  LogOut, HelpCircle, Map, ClipboardList, Compass, DollarSign,
  Plus, Briefcase, Wrench
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { useToast } from '@/components/ui/Toast'

// ============================================
// CONCEPT B: FLOATING / MODULAR
// "Premium Island" - Floating pill navigation
// Modern, premium feel with maximum content space
// ============================================

type Mode = 'hire' | 'work'
type RoutePrefix = '/work' | '/hiring'

interface NavConceptBProps {
  mode?: Mode
  routePrefix?: RoutePrefix
}

export function NavConceptB({ mode = 'hire', routePrefix = '/hiring' }: NavConceptBProps) {
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()
  const { logout } = useAuthStore()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const notificationsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [notifications] = useState([
    { id: '1', title: 'New Bid!', desc: 'Marcus J. bid $85 on cleaning job', time: '5m ago', unread: true, emoji: '💰' },
    { id: '2', title: 'Completed', desc: 'Sarah M. finished "Deep Clean"', time: '1h ago', unread: true, emoji: '✅' },
  ])

  const [messages] = useState([
    { id: '1', name: 'Sarah M.', unread: true },
    { id: '2', name: 'Marcus J.', unread: true },
  ])

  const effectiveMode = routePrefix === '/work' ? 'work' : 'hire'

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (notificationsRef.current && !notificationsRef.current.contains(target)) setNotificationsOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(target)) setUserMenuOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleSignOut = () => {
    logout()
    toast.success('Signed out successfully')
    router.push('/sign-in')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      {/* ===== CORNER ANCHORS (DESKTOP) ===== */}

      {/* Top Left: Logo */}
      <div className="hidden md:block fixed top-5 left-6 z-50">
        <Link href={`${routePrefix}/map`} className="flex items-center gap-3 group">
          <div className="relative">
            <div className={`absolute inset-0 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity ${
              effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
            }`} />
            <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center border shadow-lg ${
              effectiveMode === 'work'
                ? 'bg-gradient-to-br from-emerald-400 to-teal-600 border-emerald-400/30'
                : 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-400/30'
            }`}>
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
        </Link>
      </div>

      {/* Top Right: Action Icons */}
      <div className="hidden md:flex fixed top-5 right-6 z-50 items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setNotificationsOpen(!notificationsOpen); setUserMenuOpen(false) }}
            className={`relative p-3 rounded-xl backdrop-blur-xl border transition-all ${
              notificationsOpen
                ? 'bg-slate-900/90 border-white/20 text-white'
                : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            <Bell className="w-5 h-5" />
            {notifications.filter(n => n.unread).length > 0 && (
              <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
                effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
              }`} />
            )}
          </button>
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                    <span className="text-xl">{n.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-slate-400 truncate">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Messages Quick Badge */}
        <Link
          href={`${routePrefix}/messages`}
          className={`relative p-3 rounded-xl backdrop-blur-xl border transition-all ${
            isActive(`${routePrefix}/messages`)
              ? 'bg-slate-900/90 border-white/20 text-white'
              : 'bg-slate-950/80 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          {messages.filter(m => m.unread).length > 0 && (
            <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
              effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
            }`} />
          )}
        </Link>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false) }}
            className={`p-1.5 rounded-xl backdrop-blur-xl border transition-all ${
              userMenuOpen
                ? 'bg-slate-900/90 border-white/20'
                : 'bg-slate-950/80 border-white/10 hover:border-white/20'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold bg-gradient-to-br ${
              effectiveMode === 'work' ? 'from-emerald-400 to-teal-600' : 'from-cyan-400 to-blue-600'
            }`}>
              JD
            </div>
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <p className="font-semibold text-white">John Doe</p>
                <p className="text-sm text-slate-400">john@example.com</p>
              </div>
              <div className="py-2">
                <Link href={`${routePrefix}/profile`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5">
                  <User className="w-4 h-4 text-slate-500" />
                  My Profile
                </Link>
                <Link href={`${routePrefix}/settings`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5">
                  <Settings className="w-4 h-4 text-slate-500" />
                  Settings
                </Link>
              </div>
              <div className="border-t border-white/10 py-2">
                <button onClick={handleSignOut} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MOBILE - Use same nav as UniversalNav ===== */}
      {/* Mobile Bottom Navigation - Symmetric 5-item layout with centered action button */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-2 pb-safe z-40">
        <div className="flex items-center justify-between py-2">
          {/* Left side - 2 items */}
          <div className="flex items-center flex-1 justify-around">
            {effectiveMode === 'hire' ? (
              <>
                <Link
                  href={`${routePrefix}/map`}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                    pathname === `${routePrefix}/map` || pathname.startsWith(`${routePrefix}/map/`)
                      ? 'text-cyan-400'
                      : 'text-slate-500'
                  }`}
                >
                  <Map className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Map</span>
                </Link>
                <Link
                  href={`${routePrefix}/jobs`}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                    pathname === `${routePrefix}/jobs` || pathname.startsWith(`${routePrefix}/jobs/`)
                      ? 'text-cyan-400'
                      : 'text-slate-500'
                  }`}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span className="text-[10px] font-medium">My Jobs</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`${routePrefix}/jobs`}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                    pathname === `${routePrefix}/jobs` || pathname.startsWith(`${routePrefix}/jobs/`) || pathname.startsWith(`${routePrefix}/job/`) || pathname === `${routePrefix}/map` || pathname.startsWith(`${routePrefix}/map/`)
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                >
                  <Compass className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Find Jobs</span>
                </Link>
                <Link
                  href={`${routePrefix}/earnings`}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                    pathname === `${routePrefix}/earnings` || pathname.startsWith(`${routePrefix}/earnings/`) || pathname === `${routePrefix}/transactions` || pathname.startsWith(`${routePrefix}/transactions/`)
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  <span className="text-[10px] font-medium">Earnings</span>
                </Link>
              </>
            )}
          </div>

          {/* Center - Action Button (Post Job for hire, Find Work for work) */}
          <div className="flex items-center justify-center px-2">
            <Link
              href={effectiveMode === 'hire' ? `${routePrefix}/post` : `${routePrefix}/map`}
              className="flex flex-col items-center -mt-4"
            >
              <div className="relative">
                <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${
                  effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
                }`} />
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  effectiveMode === 'work'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/25'
                }`}>
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          </div>

          {/* Right side - 2 items */}
          <div className="flex items-center flex-1 justify-around">
            <Link
              href={`${routePrefix}/messages`}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors relative ${
                pathname === `${routePrefix}/messages` || pathname.startsWith(`${routePrefix}/messages/`)
                  ? effectiveMode === 'work' ? 'text-emerald-400' : 'text-cyan-400'
                  : 'text-slate-500'
              }`}
            >
              <div className="relative">
                <MessageSquare className="w-5 h-5" />
                {messages.filter(m => m.unread).length > 0 && (
                  <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
                  }`} />
                )}
              </div>
              <span className="text-[10px] font-medium">Messages</span>
            </Link>
            <Link
              href={`${routePrefix}/profile`}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
                pathname === `${routePrefix}/profile` || pathname.startsWith(`${routePrefix}/profile/`) || pathname === `${routePrefix}/settings` || pathname.startsWith(`${routePrefix}/settings/`)
                  ? effectiveMode === 'work' ? 'text-emerald-400' : 'text-cyan-400'
                  : 'text-slate-500'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Profile</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}

export default NavConceptB
