'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell, Check, CheckCheck, Trash2, Settings,
  Briefcase, MessageCircle, DollarSign, Star, Clock,
  AlertCircle, CheckCircle2, XCircle, Filter, Zap, Award
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    type: 'job-match',
    title: 'New Job Match!',
    message: 'A new "Deep House Cleaning" job was posted near you - $120-180',
    time: '5 min ago',
    read: false,
    link: '/work/job/1',
    icon: Briefcase,
    iconColor: 'text-emerald-400 bg-emerald-500/20',
  },
  {
    id: '2',
    type: 'bid-accepted',
    title: 'Bid Accepted!',
    message: 'Alex J. accepted your bid for "Deep House Cleaning"',
    time: '1 hour ago',
    read: false,
    link: '/work/messages',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400 bg-emerald-500/20',
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    message: 'Jordan K. sent you a message about "IKEA Furniture Assembly"',
    time: '2 hours ago',
    read: true,
    link: '/work/messages',
    icon: MessageCircle,
    iconColor: 'text-blue-400 bg-blue-500/20',
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received!',
    message: 'You received $95 for "IKEA Furniture Assembly" - now available for withdrawal',
    time: '3 hours ago',
    read: true,
    link: '/work/earnings',
    icon: DollarSign,
    iconColor: 'text-green-400 bg-green-500/20',
  },
  {
    id: '5',
    type: 'review',
    title: 'New Review',
    message: 'Jordan K. left you a 5-star review! "Excellent work, very professional."',
    time: '3 hours ago',
    read: true,
    link: '/work/profile',
    icon: Star,
    iconColor: 'text-amber-400 bg-amber-500/20',
  },
  {
    id: '6',
    type: 'reminder',
    title: 'Job Starting Soon',
    message: '"Help Moving Furniture" starts in 2 hours. Don\'t forget!',
    time: '4 hours ago',
    read: true,
    link: '/work/job/2',
    icon: Clock,
    iconColor: 'text-amber-400 bg-amber-500/20',
  },
  {
    id: '7',
    type: 'bid-declined',
    title: 'Bid Not Selected',
    message: 'Your bid for "Yard Work" was not selected. Keep bidding!',
    time: '1 day ago',
    read: true,
    link: '/work/jobs',
    icon: XCircle,
    iconColor: 'text-slate-400 bg-slate-500/20',
  },
  {
    id: '8',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'You\'ve completed 100+ jobs! You earned the "Pro Worker" badge.',
    time: '2 days ago',
    read: true,
    link: '/work/profile',
    icon: Award,
    iconColor: 'text-purple-400 bg-purple-500/20',
  },
]

export default function WorkNotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-sm font-semibold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <Link
                href="/work/settings"
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                filter === 'all'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                filter === 'unread'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-2">
            {filteredNotifications.map((notification) => {
              const Icon = notification.icon
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'relative group bg-slate-900 border rounded-xl p-4 transition-colors',
                    notification.read
                      ? 'border-white/5 hover:border-white/10'
                      : 'border-emerald-500/30 bg-emerald-500/5'
                  )}
                >
                  <Link
                    href={notification.link}
                    onClick={() => markAsRead(notification.id)}
                    className="flex gap-4"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        notification.iconColor
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className={cn(
                              'font-semibold',
                              notification.read ? 'text-white' : 'text-emerald-400'
                            )}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-sm text-slate-400 mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 mt-2 block">
                        {notification.time}
                      </span>
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h2>
            <p className="text-slate-400 max-w-sm mx-auto">
              {filter === 'unread'
                ? "You're all caught up!"
                : "When hirers respond to your bids or new jobs match your skills, you'll see them here."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
