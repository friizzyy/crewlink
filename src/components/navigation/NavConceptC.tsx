'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Users, Bell, MessageSquare, ChevronDown, User, Settings,
  LogOut, HelpCircle, Map, ClipboardList, Compass, DollarSign,
  Plus, Briefcase, Wrench, Menu, X, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { useToast } from '@/components/ui/Toast'

// ============================================
// CONCEPT C: CONTEXTUAL / ADAPTIVE
// "Smart Sidebar" - Collapsible rail + minimal header
// Perfect for map-heavy interfaces
// ============================================

type Mode = 'hire' | 'work'
type RoutePrefix = '/work' | '/hiring'

interface NavConceptCProps {
  mode?: Mode
  routePrefix?: RoutePrefix
}

export function NavConceptC({ mode = 'hire', routePrefix = '/hiring' }: NavConceptCProps) {
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()
  const { logout } = useAuthStore()

  const [railExpanded, setRailExpanded] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)

  const [notifications] = useState([
    { id: '1', unread: true },
    { id: '2', unread: true },
  ])

  const [messages] = useState([
    { id: '1', unread: true },
    { id: '2', unread: true },
  ])

  const effectiveMode = routePrefix === '/work' ? 'work' : 'hire'

  // Navigation items
  const navItems = effectiveMode === 'hire'
    ? [
        { name: 'Map', href: `${routePrefix}/map`, icon: Map },
        { name: 'My Jobs', href: `${routePrefix}/jobs`, icon: ClipboardList },
        { name: 'Messages', href: `${routePrefix}/messages`, icon: MessageSquare, badge: messages.filter(m => m.unread).length },
      ]
    : [
        { name: 'Find Jobs', href: `${routePrefix}/jobs`, icon: Compass },
        { name: 'Earnings', href: `${routePrefix}/earnings`, icon: DollarSign },
        { name: 'Messages', href: `${routePrefix}/messages`, icon: MessageSquare, badge: messages.filter(m => m.unread).length },
      ]

  const secondaryItems = [
    { name: 'Profile', href: `${routePrefix}/profile`, icon: User },
    { name: 'Settings', href: `${routePrefix}/settings`, icon: Settings },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ]

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
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
      {/* ===== DESKTOP SIDE RAIL ===== */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 bottom-0 z-50 flex-col bg-slate-950 border-r border-white/10 transition-all duration-300 ${
          railExpanded ? 'w-60' : 'w-16'
        }`}
        onMouseEnter={() => setRailExpanded(true)}
        onMouseLeave={() => setRailExpanded(false)}
      >
        {/* Logo */}
        <div className="p-3 border-b border-white/10">
          <Link href={`${routePrefix}/map`} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              effectiveMode === 'work'
                ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
                : 'bg-gradient-to-br from-cyan-400 to-blue-600'
            }`}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className={`font-bold text-white text-lg whitespace-nowrap transition-opacity duration-200 ${
              railExpanded ? 'opacity-100' : 'opacity-0'
            }`}>
              CrewLink
            </span>
          </Link>
        </div>

        {/* Post Job Button (Hire mode) */}
        {effectiveMode === 'hire' && (
          <div className="p-3">
            <Link
              href={`${routePrefix}/post`}
              className={`flex items-center gap-3 rounded-xl transition-all ${
                railExpanded
                  ? 'px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                  : 'w-10 h-10 justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              }`}
            >
              <Plus className="w-5 h-5 flex-shrink-0" />
              <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${
                railExpanded ? 'opacity-100' : 'opacity-0 w-0'
              }`}>
                Post Job
              </span>
            </Link>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl transition-all ${
                  railExpanded ? 'px-4 py-3' : 'w-10 h-10 justify-center'
                } ${
                  active
                    ? effectiveMode === 'work'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Icon className="w-5 h-5" />
                  {item.badge && item.badge > 0 && (
                    <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      effectiveMode === 'work' ? 'bg-emerald-500 text-white' : 'bg-cyan-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`font-medium whitespace-nowrap transition-opacity duration-200 ${
                  railExpanded ? 'opacity-100' : 'opacity-0 w-0'
                }`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-3 border-t border-white/10" />

        {/* Secondary Navigation */}
        <div className="p-3 space-y-1">
          {secondaryItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl transition-all ${
                  railExpanded ? 'px-4 py-2.5' : 'w-10 h-10 justify-center'
                } ${
                  active
                    ? 'text-white bg-white/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${
                  railExpanded ? 'opacity-100' : 'opacity-0 w-0'
                }`}>
                  {item.name}
                </span>
              </Link>
            )
          })}

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full ${
              railExpanded ? 'px-4 py-2.5' : 'w-10 h-10 justify-center'
            }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className={`text-sm whitespace-nowrap transition-opacity duration-200 ${
              railExpanded ? 'opacity-100' : 'opacity-0 w-0'
            }`}>
              Sign Out
            </span>
          </button>
        </div>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <div className={`flex items-center gap-3 ${railExpanded ? '' : 'justify-center'}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 bg-gradient-to-br ${
              effectiveMode === 'work' ? 'from-emerald-400 to-teal-600' : 'from-cyan-400 to-blue-600'
            }`}>
              JD
            </div>
            <div className={`transition-opacity duration-200 ${railExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
              <p className="text-sm font-medium text-white whitespace-nowrap">John Doe</p>
              <p className="text-xs text-slate-500 whitespace-nowrap">Hiring Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== DESKTOP MINIMAL HEADER ===== */}
      <header className="hidden lg:flex fixed top-0 left-16 right-0 z-40 h-12 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 items-center justify-end px-6 gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          {notifications.filter(n => n.unread).length > 0 && (
            <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
              effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
            }`} />
          )}
        </button>

        {/* Messages */}
        <Link
          href={`${routePrefix}/messages`}
          className="relative p-2 text-slate-400 hover:text-white transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          {messages.filter(m => m.unread).length > 0 && (
            <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
              effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
            }`} />
          )}
        </Link>

        {/* Mode Badge */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
          effectiveMode === 'hire'
            ? 'bg-cyan-500/10 text-cyan-400'
            : 'bg-emerald-500/10 text-emerald-400'
        }`}>
          {effectiveMode === 'hire' ? <Briefcase className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
          {effectiveMode === 'hire' ? 'Hiring' : 'Working'}
        </div>
      </header>

      {/* ===== TABLET COLLAPSED RAIL ===== */}
      <aside className="hidden md:flex lg:hidden fixed top-0 left-0 bottom-0 z-50 w-16 flex-col bg-slate-950 border-r border-white/10">
        {/* Logo */}
        <div className="p-3 border-b border-white/10">
          <Link href={`${routePrefix}/map`} className="flex justify-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              effectiveMode === 'work'
                ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
                : 'bg-gradient-to-br from-cyan-400 to-blue-600'
            }`}>
              <Users className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>

        {/* Post Job */}
        {effectiveMode === 'hire' && (
          <div className="p-3">
            <Link
              href={`${routePrefix}/post`}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                  active
                    ? effectiveMode === 'work'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                    effectiveMode === 'work' ? 'bg-emerald-500 text-white' : 'bg-cyan-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/10">
          <Link href={`${routePrefix}/profile`} className="flex justify-center">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold bg-gradient-to-br ${
              effectiveMode === 'work' ? 'from-emerald-400 to-teal-600' : 'from-cyan-400 to-blue-600'
            }`}>
              JD
            </div>
          </Link>
        </div>
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-slate-950 border-b border-white/10 flex items-center justify-between px-4">
        <Link href={`${routePrefix}/map`} className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            effectiveMode === 'work'
              ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
              : 'bg-gradient-to-br from-cyan-400 to-blue-600'
          }`}>
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">CrewLink</span>
        </Link>

        <div className="flex items-center gap-2">
          <button className="relative p-2 text-slate-400">
            <Bell className="w-5 h-5" />
            <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
              effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
            }`} />
          </button>
          <button
            onClick={() => setMobileSheetOpen(true)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ===== MOBILE BOTTOM SHEET ===== */}
      {mobileSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSheetOpen(false)}
          />

          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-slate-950 rounded-t-3xl border-t border-white/10 animate-in slide-in-from-bottom duration-300 max-h-[70vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-slate-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold bg-gradient-to-br ${
                  effectiveMode === 'work' ? 'from-emerald-400 to-teal-600' : 'from-cyan-400 to-blue-600'
                }`}>
                  JD
                </div>
                <div>
                  <p className="font-semibold text-white">John Doe</p>
                  <p className="text-sm text-slate-400">{effectiveMode === 'hire' ? 'Hiring Mode' : 'Working Mode'}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileSheetOpen(false)}
                    className={`flex items-center justify-between px-4 py-4 rounded-xl transition-all ${
                      active
                        ? effectiveMode === 'work'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && item.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          effectiveMode === 'work' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </Link>
                )
              })}
            </nav>

            <div className="mx-4 border-t border-white/10" />

            {/* Secondary Items */}
            <div className="p-4 space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileSheetOpen(false)}
                    className="flex items-center justify-between px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </Link>
                )
              })}
            </div>

            {/* Sign Out */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => { handleSignOut(); setMobileSheetOpen(false) }}
                className="flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spacers for content offset */}
      <div className="hidden lg:block ml-16" /> {/* Desktop rail offset */}
      <div className="hidden md:block lg:hidden ml-16" /> {/* Tablet rail offset */}
      <div className="md:hidden h-14" /> {/* Mobile header offset */}
    </>
  )
}

export default NavConceptC
