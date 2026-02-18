'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Users, Menu, X, Briefcase, Plus, Bell, MessageSquare,
  ChevronDown, User, Settings, LogOut, HelpCircle,
  Map, ClipboardList, Compass, DollarSign, Wrench,
  ArrowRight, Shield, BadgeCheck
} from 'lucide-react'
import { ENABLE_ROLE_TOGGLE, useAuthStore } from '@/store'
import { useToast } from '@/components/ui/Toast'

// ============================================
// FLOATING NAV v3 - Animated Glow Border
// Premium floating bar with pulsing glow effect
// ============================================

const marketingNavigation = [
  { name: 'How It Works', href: '/how-it-works', qa: 'nav-how-it-works' },
  { name: 'Safety', href: '/safety', qa: 'nav-safety' },
  { name: 'Pricing', href: '/pricing', qa: 'nav-pricing' },
  { name: 'Cities', href: '/cities', qa: 'nav-cities' },
]

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const hireNavItems: NavItem[] = [
  { name: 'Map', href: '/hiring/map', icon: Map },
  { name: 'My Jobs', href: '/hiring/jobs', icon: ClipboardList },
  { name: 'Messages', href: '/hiring/messages', icon: MessageSquare },
]

const workNavItems: NavItem[] = [
  { name: 'Find Jobs', href: '/work/jobs', icon: Compass },
  { name: 'Earnings', href: '/work/earnings', icon: DollarSign },
  { name: 'Messages', href: '/work/messages', icon: MessageSquare },
]

type Mode = 'hire' | 'work'
type RoutePrefix = '/work' | '/hiring'

interface UniversalNavProps {
  variant: 'marketing' | 'app'
  mode?: Mode
  onModeChange?: (mode: Mode) => void
  routePrefix?: RoutePrefix
}

export function UniversalNav({ variant, mode = 'hire', onModeChange, routePrefix = '/hiring' }: UniversalNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()

  const getNavItems = (currentMode: Mode, prefix: RoutePrefix): NavItem[] => {
    if (currentMode === 'hire') {
      return [
        { name: 'Map', href: `${prefix}/map`, icon: Map },
        { name: 'My Jobs', href: `${prefix}/jobs`, icon: ClipboardList },
        { name: 'Messages', href: `${prefix}/messages`, icon: MessageSquare },
      ]
    }
    return [
      { name: 'Find Jobs', href: `${prefix}/jobs`, icon: Compass },
      { name: 'Earnings', href: `${prefix}/earnings`, icon: DollarSign },
      { name: 'Messages', href: `${prefix}/messages`, icon: MessageSquare },
    ]
  }

  const getHomeRoute = () => `${routePrefix}/map`

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'bid', title: 'New Bid!', desc: 'Marcus J. bid $85 on cleaning job', time: '5m ago', unread: true, emoji: '💰' },
    { id: '2', type: 'completed', title: 'Completed', desc: 'Sarah M. finished "Deep Clean"', time: '1h ago', unread: true, emoji: '✅' },
    { id: '3', type: 'message', title: 'Message', desc: 'New message from David T.', time: '2h ago', unread: true, emoji: '💬' },
  ])
  const [messages, setMessages] = useState([
    { id: '1', name: 'Sarah M.', avatar: 'SM', message: 'Thanks for the quick response!', time: '2m ago', unread: true },
    { id: '2', name: 'Marcus J.', avatar: 'MJ', message: 'I can start tomorrow at 9am', time: '15m ago', unread: true },
    { id: '3', name: 'David T.', avatar: 'DT', message: 'Is the job still available?', time: '1h ago', unread: false },
  ])

  const notificationsRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { getCurrentRole, logout } = useAuthStore()
  const userRole = getCurrentRole()

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    toast.success('All notifications marked as read')
  }

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, unread: false } : n))
    setNotificationsOpen(false)
    if (notification.title.includes('message')) {
      router.push(`${routePrefix}/messages`)
    } else if (notification.title.includes('bid')) {
      router.push(`${routePrefix}/jobs`)
    } else {
      router.push(`${routePrefix}/notifications`)
    }
  }

  const handleSignOut = () => {
    logout()
    toast.success('Signed out successfully')
    router.push('/sign-in')
  }

  const handleMessageClick = (message: typeof messages[0]) => {
    setMessages(prev => prev.map(m => m.id === message.id ? { ...m, unread: false } : m))
    setMessagesOpen(false)
    router.push(`${routePrefix}/messages`)
  }

  // Track scroll position for marketing nav background fade
  useEffect(() => {
    if (variant !== 'marketing') return
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    handleScroll() // Check initial state
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [variant])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false)
      }
      if (messagesRef.current && !messagesRef.current.contains(target)) {
        setMessagesOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false)
        setNotificationsOpen(false)
        setMessagesOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const effectiveMode = routePrefix === '/work' ? 'work' : routePrefix === '/hiring' ? 'hire' :
    (ENABLE_ROLE_TOGGLE ? mode : (userRole === 'worker' ? 'work' : 'hire'))
  const navItems = getNavItems(effectiveMode, routePrefix)

  // ============================================
  // SHARED LOGO - With glow effect
  // ============================================
  const Logo = (
    <Link href={variant === 'app' ? getHomeRoute() : '/'} className="flex items-center gap-3 group" data-qa="nav-logo">
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
      <span className="font-bold text-xl tracking-tight">CrewLink</span>
    </Link>
  )

  // ============================================
  // MARKETING VARIANT - Floating Bar with Glow
  // ============================================
  if (variant === 'marketing') {
    return (
      <>
        {/* Top mask - covers content that scrolls above the nav */}
        <div
          className="fixed top-0 left-0 right-0 h-5 bg-slate-950 z-[51] pointer-events-none"
          aria-hidden="true"
        />

        <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-5">
          <nav className="relative max-w-6xl mx-auto">
            {/* Animated glow border - contained within nav bounds */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/40 via-blue-500/20 to-purple-500/40 rounded-2xl blur-sm animate-nav-glow" />
            </div>

            {/* Nav content - fully opaque background */}
            <div className="relative bg-slate-950 backdrop-blur-2xl rounded-2xl px-6 py-4 flex items-center justify-between border border-white/[0.08]">
              {/* Left - Logo + Nav Links */}
              <div className="flex items-center gap-8">
                {Logo}

                {/* Nav Links with hover underline */}
                <div className="hidden md:flex items-center gap-1">
                  {marketingNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="relative px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors group"
                      data-qa={item.qa}
                    >
                      {item.name}
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full group-hover:w-3/4 transition-all duration-300" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right - CTAs */}
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  data-qa="cta-sign-in"
                >
                  Sign In
                </Link>

                {/* Premium CTA with double border effect */}
                <Link href="/create-account" className="relative group" data-qa="cta-get-started">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl" />
                  <span className="relative flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-slate-950 rounded-[10px] m-[1px] group-hover:bg-transparent transition-colors">
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>

              {/* Mobile menu button - 44px minimum touch target */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 -mr-1 text-slate-400 hover:text-white active:text-white touch-target"
                data-qa="mobile-nav-toggle"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </nav>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[88px] z-50">
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute inset-x-4 top-0 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
              <div className="px-6 py-8">
                <nav className="space-y-1">
                  {marketingNavigation.map((item, index) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 hover:bg-white/5 active:bg-white/10"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="text-lg font-medium text-white group-hover:text-cyan-400 transition-colors">
                        {item.name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </nav>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />

                <div className="space-y-3">
                  <Link
                    href="/sign-in"
                    className="flex items-center justify-center w-full px-6 py-4 text-base font-medium text-slate-300 border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/5 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/create-account"
                    className="group relative flex items-center justify-center w-full px-6 py-4 text-base font-semibold text-white overflow-hidden rounded-2xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <span className="relative flex items-center gap-2">
                      Get Started
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Verified workers
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Secure payments
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Glow animation styles */}
        <style jsx>{`
          @keyframes nav-glow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          .animate-nav-glow {
            animation: nav-glow 3s ease-in-out infinite;
          }
        `}</style>
      </>
    )
  }

  // ============================================
  // APP VARIANT - Floating Corner Elements (Concept B)
  // Desktop: Logo top-left, actions top-right (no center nav - in sidebar)
  // Mobile: Same bottom nav as before
  // ============================================
  return (
    <>
      {/* ===== DESKTOP: Floating Logo (Top Left) ===== */}
      <div className="hidden md:block fixed top-4 left-6 z-50">
        <Link href={getHomeRoute()} className="flex items-center gap-3 group" data-qa="nav-logo">
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

      {/* ===== DESKTOP: Floating Actions (Top Right) ===== */}
      <div className="hidden md:flex fixed top-4 right-6 z-50 items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setNotificationsOpen(!notificationsOpen)
              setMessagesOpen(false)
              setUserMenuOpen(false)
            }}
            className={`relative p-3 rounded-xl backdrop-blur-xl border transition-all ${
              notificationsOpen
                ? 'bg-slate-900/95 border-white/20 text-white'
                : 'bg-slate-900/95 border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20'
            }`}
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            aria-haspopup="true"
            data-qa="nav-notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.filter(n => n.unread).length > 0 && (
              <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
                effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
              }`} />
            )}
          </button>

          {notificationsOpen && (
            <div
              className="absolute right-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white">Notifications</h3>
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    effectiveMode === 'work' ? 'text-emerald-400 bg-emerald-500/10' : 'text-cyan-400 bg-cyan-500/10'
                  }`}>
                    {notifications.filter(n => n.unread).length} new
                  </span>
                )}
              </div>
              <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {notifications.map((notification, i) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNotificationClick(notification) } }}
                    role="button"
                    tabIndex={0}
                    className="bg-slate-800/50 rounded-xl p-3 cursor-pointer hover:bg-slate-800 transition-all duration-200 border border-white/5 hover:border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg shrink-0">
                        {notification.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-white">{notification.title}</p>
                          <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded shrink-0">{notification.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{notification.desc}</p>
                      </div>
                      {notification.unread && (
                        <span className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                          effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
                        }`} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/10">
                <Link
                  href={`${routePrefix}/notifications`}
                  className={`block text-center text-sm font-medium transition-colors ${
                    effectiveMode === 'work' ? 'text-emerald-400 hover:text-emerald-300' : 'text-cyan-400 hover:text-cyan-300'
                  }`}
                  onClick={() => setNotificationsOpen(false)}
                  data-qa="notifications-view-all"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="relative" ref={messagesRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMessagesOpen(!messagesOpen)
              setNotificationsOpen(false)
              setUserMenuOpen(false)
            }}
            className={`relative p-3 rounded-xl backdrop-blur-xl border transition-all ${
              messagesOpen || pathname === `${routePrefix}/messages` || pathname.startsWith(`${routePrefix}/messages/`)
                ? 'bg-slate-900/95 border-white/20 text-white'
                : 'bg-slate-900/95 border-white/[0.06] text-slate-400 hover:text-white hover:border-white/20'
            }`}
            aria-label="Messages"
            aria-expanded={messagesOpen}
            aria-haspopup="true"
            data-qa="nav-messages"
          >
            <MessageSquare className="w-5 h-5" />
            {messages.filter(m => m.unread).length > 0 && (
              <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${
                effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
              }`} />
            )}
          </button>

          {messagesOpen && (
            <div
              className="absolute right-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-white">Messages</h3>
                {messages.filter(m => m.unread).length > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    effectiveMode === 'work' ? 'text-emerald-400 bg-emerald-500/10' : 'text-cyan-400 bg-cyan-500/10'
                  }`}>
                    {messages.filter(m => m.unread).length} new
                  </span>
                )}
              </div>
              <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {messages.map((message, i) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMessageClick(message) } }}
                    role="button"
                    tabIndex={0}
                    className={`rounded-xl p-3 cursor-pointer transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      message.unread
                        ? `bg-slate-800/50 hover:bg-slate-800 ${effectiveMode === 'work' ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-cyan-500/20 hover:border-cyan-500/40'}`
                        : 'bg-slate-800/30 border-white/5 hover:border-white/10 hover:bg-slate-800/50'
                    }`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold ${
                          message.unread
                            ? effectiveMode === 'work'
                              ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                            : 'bg-slate-700 text-slate-400'
                        }`}>
                          {message.avatar}
                        </div>
                        {message.unread && (
                          <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                            effectiveMode === 'work' ? 'bg-emerald-500' : 'bg-cyan-500'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-semibold text-sm truncate ${message.unread ? 'text-white' : 'text-slate-400'}`}>
                            {message.name}
                          </p>
                          <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded shrink-0">{message.time}</span>
                        </div>
                        <p className={`text-xs mt-1 line-clamp-2 ${message.unread ? 'text-slate-300' : 'text-slate-500'}`}>
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-white/10">
                <Link
                  href={`${routePrefix}/messages`}
                  className={`block text-center text-sm font-medium transition-colors ${
                    effectiveMode === 'work' ? 'text-emerald-400 hover:text-emerald-300' : 'text-cyan-400 hover:text-cyan-300'
                  }`}
                  onClick={() => setMessagesOpen(false)}
                  data-qa="messages-view-all"
                >
                  View all messages
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setUserMenuOpen(!userMenuOpen)
              setNotificationsOpen(false)
              setMessagesOpen(false)
            }}
            className={`p-1.5 rounded-xl backdrop-blur-xl border transition-all ${
              userMenuOpen
                ? 'bg-slate-900/95 border-white/20'
                : 'bg-slate-900/95 border-white/[0.06] hover:border-white/20'
            }`}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
            aria-haspopup="true"
            data-qa="nav-user-menu"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-semibold bg-gradient-to-br ${
              effectiveMode === 'work' ? 'from-emerald-400 to-teal-600' : 'from-cyan-400 to-blue-600'
            }`}>
              JD
            </div>
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10">
                <p className="font-semibold text-white">John Doe</p>
                <p className="text-sm text-slate-400">john@example.com</p>
              </div>
              <div className="py-2">
                <Link
                  href={`${routePrefix}/profile`}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    pathname === `${routePrefix}/profile`
                      ? effectiveMode === 'work' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
                      : effectiveMode === 'work' ? 'text-slate-300 hover:bg-white/5 hover:text-emerald-400' : 'text-slate-300 hover:bg-white/5 hover:text-cyan-400'
                  }`}
                  onClick={() => setUserMenuOpen(false)}
                  data-qa="user-menu-profile"
                >
                  <User className={`w-4 h-4 ${pathname === `${routePrefix}/profile` ? (effectiveMode === 'work' ? 'text-emerald-400' : 'text-cyan-400') : 'text-slate-500'}`} />
                  My Profile
                </Link>
                <Link
                  href={`${routePrefix}/settings`}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    pathname === `${routePrefix}/settings` || pathname.startsWith(`${routePrefix}/settings/`)
                      ? effectiveMode === 'work' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
                      : effectiveMode === 'work' ? 'text-slate-300 hover:bg-white/5 hover:text-emerald-400' : 'text-slate-300 hover:bg-white/5 hover:text-cyan-400'
                  }`}
                  onClick={() => setUserMenuOpen(false)}
                  data-qa="user-menu-settings"
                >
                  <Settings className={`w-4 h-4 ${pathname === `${routePrefix}/settings` ? (effectiveMode === 'work' ? 'text-emerald-400' : 'text-cyan-400') : 'text-slate-500'}`} />
                  Settings
                </Link>
                <Link
                  href={`${routePrefix}/settings#account-mode`}
                  className={`flex items-center justify-between px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors ${
                    effectiveMode === 'work' ? 'hover:text-emerald-400' : 'hover:text-cyan-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {effectiveMode === 'hire' ? (
                      <Briefcase className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Wrench className="w-4 h-4 text-slate-500" />
                    )}
                    Account Mode
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    effectiveMode === 'hire'
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {effectiveMode === 'hire' ? 'Hiring' : 'Working'}
                  </span>
                </Link>
                <Link
                  href="/help"
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors ${
                    effectiveMode === 'work' ? 'hover:text-emerald-400' : 'hover:text-cyan-400'
                  }`}
                  data-qa="user-menu-help"
                >
                  <HelpCircle className="w-4 h-4 text-slate-500" />
                  Help Center
                </Link>
              </div>
              <div className="border-t border-white/10 py-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors"
                  data-qa="user-menu-signout"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== MOBILE: Keep existing bottom nav ===== */}
      {/* Mobile Bottom Navigation - Symmetric 5-item layout with centered action button */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 px-2 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-between py-1">
          {/* Left side - 2 items */}
          <div className="flex items-center flex-1 justify-around">
            {effectiveMode === 'hire' ? (
              <>
                <Link
                  href={`${routePrefix}/map`}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition-colors ${
                    pathname === `${routePrefix}/map` || pathname.startsWith(`${routePrefix}/map/`)
                      ? 'text-cyan-400'
                      : 'text-slate-500 active:text-slate-300'
                  }`}
                >
                  <Map className="w-5 h-5" />
                  <span className="text-[11px] font-medium">Map</span>
                </Link>
                <Link
                  href={`${routePrefix}/jobs`}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition-colors ${
                    pathname === `${routePrefix}/jobs` || pathname.startsWith(`${routePrefix}/jobs/`)
                      ? 'text-cyan-400'
                      : 'text-slate-500 active:text-slate-300'
                  }`}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span className="text-[11px] font-medium">My Jobs</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={`${routePrefix}/jobs`}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition-colors ${
                    pathname === `${routePrefix}/jobs` || pathname.startsWith(`${routePrefix}/jobs/`) || pathname.startsWith(`${routePrefix}/job/`) || pathname === `${routePrefix}/map` || pathname.startsWith(`${routePrefix}/map/`)
                      ? 'text-emerald-400'
                      : 'text-slate-500 active:text-slate-300'
                  }`}
                >
                  <Compass className="w-5 h-5" />
                  <span className="text-[11px] font-medium">Find Jobs</span>
                </Link>
                <Link
                  href={`${routePrefix}/earnings`}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition-colors ${
                    pathname === `${routePrefix}/earnings` || pathname.startsWith(`${routePrefix}/earnings/`) || pathname === `${routePrefix}/transactions` || pathname.startsWith(`${routePrefix}/transactions/`)
                      ? 'text-emerald-400'
                      : 'text-slate-500 active:text-slate-300'
                  }`}
                >
                  <DollarSign className="w-5 h-5" />
                  <span className="text-[11px] font-medium">Earnings</span>
                </Link>
              </>
            )}
          </div>

          {/* Center - Action Button (Post Job for hire, Find Work for work) */}
          <div className="flex items-center justify-center px-2">
            <Link
              href={effectiveMode === 'hire' ? `${routePrefix}/post` : `${routePrefix}/map`}
              className="flex flex-col items-center -mt-4"
              aria-label={effectiveMode === 'hire' ? 'Post a new job' : 'Find work'}
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
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition-colors relative ${
                pathname === `${routePrefix}/messages` || pathname.startsWith(`${routePrefix}/messages/`)
                  ? effectiveMode === 'work' ? 'text-emerald-400' : 'text-cyan-400'
                  : 'text-slate-500 active:text-slate-300'
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
              <span className="text-[11px] font-medium">Messages</span>
            </Link>
            <Link
              href={`${routePrefix}/profile`}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition-colors ${
                pathname === `${routePrefix}/profile` || pathname.startsWith(`${routePrefix}/profile/`) || pathname === `${routePrefix}/settings` || pathname.startsWith(`${routePrefix}/settings/`)
                  ? effectiveMode === 'work' ? 'text-emerald-400' : 'text-cyan-400'
                  : 'text-slate-500 active:text-slate-300'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[11px] font-medium">Profile</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}

export default UniversalNav
