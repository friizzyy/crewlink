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
// CONCEPT A: STRUCTURED / ANCHORED
// "Professional Dock" - Fixed edge-to-edge top bar
// Predictable, muscle-memory friendly navigation
// ============================================

type Mode = 'hire' | 'work'
type RoutePrefix = '/work' | '/hiring'

interface NavConceptAProps {
  mode?: Mode
  routePrefix?: RoutePrefix
}

export function NavConceptA({ mode = 'hire', routePrefix = '/hiring' }: NavConceptAProps) {
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()
  const { logout } = useAuthStore()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)

  const notificationsRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [notifications] = useState([
    { id: '1', title: 'New Bid!', desc: 'Marcus J. bid $85 on cleaning job', time: '5m ago', unread: true, emoji: '💰' },
    { id: '2', title: 'Completed', desc: 'Sarah M. finished "Deep Clean"', time: '1h ago', unread: true, emoji: '✅' },
    { id: '3', title: 'Message', desc: 'New message from David T.', time: '2h ago', unread: false, emoji: '💬' },
  ])

  const [messages] = useState([
    { id: '1', name: 'Sarah M.', avatar: 'SM', message: 'Thanks for the quick response!', time: '2m ago', unread: true },
    { id: '2', name: 'Marcus J.', avatar: 'MJ', message: 'I can start tomorrow at 9am', time: '15m ago', unread: true },
  ])

  const effectiveMode = routePrefix === '/work' ? 'work' : 'hire'
  const accentColor = effectiveMode === 'work' ? 'emerald' : 'cyan'

  // Navigation items based on mode
  const navItems = effectiveMode === 'hire'
    ? [
        { name: 'Map', href: `${routePrefix}/map`, icon: Map },
        { name: 'My Jobs', href: `${routePrefix}/jobs`, icon: ClipboardList },
        { name: 'Messages', href: `${routePrefix}/messages`, icon: MessageSquare },
      ]
    : [
        { name: 'Find Jobs', href: `${routePrefix}/jobs`, icon: Compass },
        { name: 'Earnings', href: `${routePrefix}/earnings`, icon: DollarSign },
        { name: 'Messages', href: `${routePrefix}/messages`, icon: MessageSquare },
      ]

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (notificationsRef.current && !notificationsRef.current.contains(target)) setNotificationsOpen(false)
      if (messagesRef.current && !messagesRef.current.contains(target)) setMessagesOpen(false)
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
      {/* ===== DESKTOP TOP BAR ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950 border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Zone 1: Logo */}
            <Link href={`${routePrefix}/map`} className="flex items-center gap-3 group">
              <div className="relative">
                <div className={`absolute inset-0 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity ${
                  effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
                }`} />
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center border ${
                  effectiveMode === 'work'
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-600 border-emerald-400/30'
                    : 'bg-gradient-to-br from-cyan-400 to-blue-600 border-cyan-400/30'
                }`}>
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="font-bold text-xl tracking-tight text-white hidden sm:block">CrewLink</span>
            </Link>

            {/* Zone 2: Tab Bar (Desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900/50 rounded-xl p-1 border border-white/5">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? `bg-${accentColor}-500/20 text-${accentColor}-400`
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {active && (
                      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-${accentColor}-500 rounded-full`} />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Zone 3: Mode Badge */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              effectiveMode === 'hire'
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {effectiveMode === 'hire' ? <Briefcase className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
              <span className="text-xs font-medium">{effectiveMode === 'hire' ? 'Hiring' : 'Working'}</span>
            </div>

            {/* Zone 4: Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Post Job (Hire mode only) */}
              {effectiveMode === 'hire' && (
                <Link
                  href={`${routePrefix}/post`}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Post Job
                </Link>
              )}

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setNotificationsOpen(!notificationsOpen); setMessagesOpen(false); setUserMenuOpen(false) }}
                  className={`relative p-2.5 rounded-lg transition-colors ${
                    notificationsOpen ? `bg-${accentColor}-500/10 text-${accentColor}-400` : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => n.unread).length > 0 && (
                    <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-${accentColor}-500 ring-2 ring-slate-950`} />
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="font-semibold text-white">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                      {notifications.map((n) => (
                        <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                          <span className="text-xl">{n.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{n.title}</p>
                            <p className="text-xs text-slate-400 truncate">{n.desc}</p>
                          </div>
                          <span className="text-[10px] text-slate-500">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="relative" ref={messagesRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMessagesOpen(!messagesOpen); setNotificationsOpen(false); setUserMenuOpen(false) }}
                  className={`relative p-2.5 rounded-lg transition-colors ${
                    messagesOpen ? `bg-${accentColor}-500/10 text-${accentColor}-400` : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  {messages.filter(m => m.unread).length > 0 && (
                    <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-${accentColor}-500 ring-2 ring-slate-950`} />
                  )}
                </button>
                {messagesOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="font-semibold text-white">Messages</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                      {messages.map((m) => (
                        <div key={m.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            m.unread ? `bg-gradient-to-br from-${accentColor}-400 to-${accentColor}-600 text-white` : 'bg-slate-700 text-slate-400'
                          }`}>
                            {m.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{m.name}</p>
                            <p className="text-xs text-slate-400 truncate">{m.message}</p>
                          </div>
                          <span className="text-[10px] text-slate-500">{m.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); setMessagesOpen(false) }}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold bg-gradient-to-br ${
                    effectiveMode === 'work' ? 'from-emerald-400 to-teal-600' : 'from-cyan-400 to-blue-600'
                  }`}>
                    JD
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
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
                      <Link href="/help" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5">
                        <HelpCircle className="w-4 h-4 text-slate-500" />
                        Help Center
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

            {/* Mobile: Notification bell only */}
            <button className="md:hidden relative p-2 text-slate-400 hover:text-white">
              <Bell className="w-6 h-6" />
              <span className={`absolute top-1 right-1 w-2 h-2 rounded-full bg-${accentColor}-500`} />
            </button>
          </div>
        </nav>
      </header>

      {/* ===== MOBILE BOTTOM DOCK ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-white/10 z-40 pb-safe">
        <div className="flex items-center justify-around py-2">
          {/* Left items */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 ${
                  active ? `text-${accentColor}-400` : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}

          {/* Center: Post Job / Find Work */}
          <Link
            href={effectiveMode === 'hire' ? `${routePrefix}/post` : `${routePrefix}/map`}
            className="flex flex-col items-center -mt-6"
          >
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${
                effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
              }`} />
              <div className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                effectiveMode === 'work'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600'
              }`}>
                <Plus className="w-7 h-7 text-white" />
              </div>
            </div>
          </Link>

          {/* Right items */}
          <Link
            href={`${routePrefix}/messages`}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 ${
              isActive(`${routePrefix}/messages`) ? `text-${accentColor}-400` : 'text-slate-500'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              {messages.filter(m => m.unread).length > 0 && (
                <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full bg-${accentColor}-500`} />
              )}
            </div>
            <span className="text-[10px] font-medium">Messages</span>
          </Link>

          <Link
            href={`${routePrefix}/profile`}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 ${
              isActive(`${routePrefix}/profile`) ? `text-${accentColor}-400` : 'text-slate-500'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  )
}

export default NavConceptA
