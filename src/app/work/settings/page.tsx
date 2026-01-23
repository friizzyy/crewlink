'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  User, Bell, Shield, CreditCard, Smartphone, Globe,
  Moon, Sun, ChevronRight, LogOut, Trash2, Eye, EyeOff,
  Check, AlertTriangle, ArrowLeftRight, DollarSign, FileText
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
      { id: 'verification', label: 'Verification Status', description: 'ID verification, background check' },
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    items: [
      { id: 'push', label: 'Push Notifications', description: 'Mobile and browser notifications' },
      { id: 'email', label: 'Email Preferences', description: 'Choose what emails you receive' },
      { id: 'job-alerts', label: 'Job Alerts', description: 'Get notified about new matching jobs' },
    ],
  },
  {
    id: 'payments',
    title: 'Payments & Payouts',
    icon: DollarSign,
    items: [
      { id: 'payout-methods', label: 'Payout Methods', description: 'Add or manage bank accounts' },
      { id: 'payout-schedule', label: 'Payout Schedule', description: 'Choose when you get paid' },
      { id: 'transaction-history', label: 'Transaction History', description: 'View all past transactions' },
    ],
  },
  {
    id: 'tax',
    title: 'Tax Information',
    icon: FileText,
    items: [
      { id: 'tax-forms', label: 'Tax Forms', description: 'Download your 1099 forms' },
      { id: 'tax-info', label: 'Tax Information', description: 'Update your tax details (SSN/EIN)' },
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

export default function WorkSettingsPage() {
  const router = useRouter()
  const { switchRole, clearRole } = useUserRole()
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark')
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    jobAlerts: true,
  })
  const [availability, setAvailability] = useState(true)

  const handleSwitchToHiring = () => {
    switchRole() // Toggles to HIRER and handles navigation internally
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
          <p className="text-slate-400 mt-1">Manage your account and preferences</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Toggles */}
        <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Quick Settings</h2>
          </div>
          <div className="divide-y divide-white/5">
            {/* Availability Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    availability ? 'bg-emerald-500/20' : 'bg-slate-800'
                  )}
                >
                  <Eye
                    className={cn('w-5 h-5', availability ? 'text-emerald-400' : 'text-slate-400')}
                  />
                </div>
                <div>
                  <div className="font-medium text-white">Available for Work</div>
                  <div className="text-sm text-slate-400">
                    {availability ? 'Hirers can see you in search' : 'Hidden from search results'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAvailability(!availability)}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  availability ? 'bg-emerald-500' : 'bg-slate-700'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 bg-white rounded-full absolute top-1 transition-transform',
                    availability ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

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
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-slate-400 hover:text-white'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Job Alerts Toggle */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Job Alerts</div>
                  <div className="text-sm text-slate-400">Get notified about new jobs</div>
                </div>
              </div>
              <button
                onClick={() =>
                  setNotifications((prev) => ({ ...prev, jobAlerts: !prev.jobAlerts }))
                }
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  notifications.jobAlerts ? 'bg-emerald-500' : 'bg-slate-700'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 bg-white rounded-full absolute top-1 transition-transform',
                    notifications.jobAlerts ? 'translate-x-6' : 'translate-x-1'
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
                <Icon className="w-5 h-5 text-emerald-400" />
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

        {/* Switch to Hiring Mode */}
        <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
          <button
            onClick={handleSwitchToHiring}
            className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-white">Switch to Hiring Mode</div>
              <div className="text-sm text-slate-400">Post jobs and hire workers instead</div>
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
