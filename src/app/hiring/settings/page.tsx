'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, Bell, Shield, CreditCard, Smartphone, Globe,
  Moon, Sun, ChevronRight, LogOut, Trash2, Eye, EyeOff,
  Check, AlertTriangle, ArrowLeftRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserRole } from '@/contexts/UserRoleContext'

// Settings sections
const settingsSections = [
  {
    id: 'account',
    title: 'Account',
    icon: User,
    items: [
      { id: 'personal', label: 'Personal Information', description: 'Name, email, phone number' },
      { id: 'password', label: 'Password & Security', description: 'Change password, enable 2FA' },
      { id: 'verification', label: 'Verification Status', description: 'ID verification, phone verification' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    items: [
      { id: 'push', label: 'Push Notifications', description: 'Mobile and browser notifications' },
      { id: 'email', label: 'Email Preferences', description: 'Choose what emails you receive' },
      { id: 'sms', label: 'SMS Alerts', description: 'Text message notifications' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: CreditCard,
    items: [
      { id: 'methods', label: 'Payment Methods', description: 'Add or remove payment cards' },
      { id: 'history', label: 'Transaction History', description: 'View past payments' },
      { id: 'billing', label: 'Billing Address', description: 'Update billing information' },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: Shield,
    items: [
      { id: 'data', label: 'Data & Privacy', description: 'Manage your data and privacy settings' },
      { id: 'sessions', label: 'Active Sessions', description: 'View and manage logged-in devices' },
      { id: 'blocked', label: 'Blocked Users', description: 'Manage blocked accounts' },
    ],
  },
]

export default function HiringSettingsPage() {
  const router = useRouter()
  const { switchRole, clearRole } = useUserRole()
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
  })

  const handleSwitchToWorker = () => {
    switchRole() // Toggles to WORKER and handles navigation internally
  }

  const handleLogout = () => {
    clearRole()
    router.push('/')
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">Manage your account preferences</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Toggles */}
        <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Quick Settings</h2>
          </div>
          <div className="divide-y divide-white/5">
            {/* Theme Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Appearance</div>
                  <div className="text-sm text-slate-400">Choose your theme</div>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1">
                {(['dark', 'light', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize',
                      theme === t
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Push Notifications Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Push Notifications</div>
                  <div className="text-sm text-slate-400">Receive instant updates</div>
                </div>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, push: !prev.push }))}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  notifications.push ? 'bg-cyan-500' : 'bg-slate-700'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 bg-white rounded-full absolute top-1 transition-transform',
                    notifications.push ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            {/* Email Notifications Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Email Notifications</div>
                  <div className="text-sm text-slate-400">Get updates via email</div>
                </div>
              </div>
              <button
                onClick={() => setNotifications((prev) => ({ ...prev, email: !prev.email }))}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  notifications.email ? 'bg-cyan-500' : 'bg-slate-700'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 bg-white rounded-full absolute top-1 transition-transform',
                    notifications.email ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section) => {
          const Icon = section.icon
          return (
            <div
              key={section.id}
              id={section.id}
              className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden scroll-mt-24"
            >
              <div className="p-4 border-b border-white/5 flex items-center gap-3">
                <Icon className="w-5 h-5 text-cyan-400" />
                <h2 className="font-semibold text-white">{section.title}</h2>
              </div>
              <div className="divide-y divide-white/5">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                  >
                    <div>
                      <div className="font-medium text-white">{item.label}</div>
                      <div className="text-sm text-slate-400">{item.description}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {/* Switch to Worker Mode */}
        <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
          <button
            onClick={handleSwitchToWorker}
            className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-white">Switch to Worker Mode</div>
              <div className="text-sm text-slate-400">
                Find work opportunities instead of hiring
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-slate-900 rounded-xl border border-red-500/20 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="font-semibold text-white">Danger Zone</h2>
          </div>
          <div className="divide-y divide-white/5">
            <button
              onClick={handleLogout}
              className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-white">Log Out</div>
                <div className="text-sm text-slate-400">Sign out of your account</div>
              </div>
            </button>
            <button className="w-full p-4 flex items-center gap-4 hover:bg-red-500/10 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-red-400">Delete Account</div>
                <div className="text-sm text-slate-400">
                  Permanently delete your account and all data
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-slate-500 py-4">
          <p>CrewLink v1.0.0</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link href="/terms" className="hover:text-slate-300">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-slate-300">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
