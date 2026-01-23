'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore, useAppModeStore, useMessagesStore, useNotificationsStore } from '@/store'
import { Avatar } from '@/components/ui'
import {
  ChevronDown,
  Briefcase,
  HardHat,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  User,
  HelpCircle,
} from 'lucide-react'
import { UniversalNav } from '@/components/UniversalNav'

// ============================================
// PUBLIC HEADER
// Now uses UniversalNav to ensure EXACT match with landing page
// ============================================

export function PublicHeader() {
  // Simply render the UniversalNav with marketing variant
  // This ensures ALL marketing pages have the EXACT same header as landing page
  return <UniversalNav variant="marketing" />
}

// ============================================
// APP HEADER
// Legacy component - app layout now uses UniversalNav directly
// Kept for backwards compatibility
// ============================================

export function AppHeader() {
  const { user, logout } = useAuthStore()
  const { mode, toggleMode } = useAppModeStore()
  const { unreadCount: messageCount } = useMessagesStore()
  const { unreadCount: notificationCount } = useNotificationsStore()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Mode Toggle */}
          <div className="flex items-center gap-4">
            <Link href="/hiring" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="hidden sm:block font-display font-semibold text-lg text-slate-900">
                CrewLink
              </span>
            </Link>

            {/* Mode Toggle */}
            <button
              onClick={toggleMode}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                mode === 'hire'
                  ? 'bg-brand-100 text-brand-700'
                  : 'bg-accent-100 text-accent-700'
              )}
            >
              {mode === 'hire' ? (
                <>
                  <Briefcase size={16} />
                  <span>Hiring</span>
                </>
              ) : (
                <>
                  <HardHat size={16} />
                  <span>Working</span>
                </>
              )}
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Messages */}
            <Link href="/hiring/messages">
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <MessageSquare size={20} />
                {messageCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                    {messageCount > 9 ? '9+' : messageCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Notifications */}
            <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Avatar
                  src={user?.avatarUrl}
                  name={user?.name || 'User'}
                  size="sm"
                />
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg z-50 py-2 animate-scale-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-medium text-slate-900 truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-sm text-slate-500 truncate">{user?.phone}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href={`/hiring/profile/${user?.id}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={16} />
                        View Profile
                      </Link>
                      <Link
                        href="/hiring/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <Link
                        href="/help"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <HelpCircle size={16} />
                        Help & Support
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          logout()
                          setIsUserMenuOpen(false)
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default PublicHeader
