'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell, Check, CheckCheck, Trash2, Settings,
  Users, MessageCircle, DollarSign, Star, Clock,
  AlertCircle, CheckCircle2, XCircle, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    type: 'bid',
    title: 'New Bid Received',
    message: 'Marcus T. submitted a bid of $175 for "Deep House Cleaning"',
    time: '5 min ago',
    read: false,
    link: '/hiring/job/1#bids',
    icon: Users,
    iconColor: 'text-cyan-400 bg-cyan-500/20',
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    message: 'Sarah K. sent you a message about "IKEA Furniture Assembly"',
    time: '1 hour ago',
    read: false,
    link: '/hiring/messages',
    icon: MessageCircle,
    iconColor: 'text-blue-400 bg-blue-500/20',
  },
  {
    id: '3',
    type: 'job-complete',
    title: 'Job Completed',
    message: '"IKEA Furniture Assembly" has been marked as completed. Please leave a review!',
    time: '2 hours ago',
    read: true,
    link: '/hiring/job/3',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400 bg-emerald-500/20',
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Processed',
    message: 'Your payment of $95 for "IKEA Furniture Assembly" was successful',
    time: '2 hours ago',
    read: true,
    link: '/hiring/job/3',
    icon: DollarSign,
    iconColor: 'text-green-400 bg-green-500/20',
  },
  {
    id: '5',
    type: 'bid',
    title: 'Multiple Bids',
    message: '3 new workers bid on "Help Moving Furniture"',
    time: '4 hours ago',
    read: true,
    link: '/hiring/job/2#bids',
    icon: Users,
    iconColor: 'text-cyan-400 bg-cyan-500/20',
  },
  {
    id: '6',
    type: 'reminder',
    title: 'Job Starting Soon',
    message: '"Help Moving Furniture" starts tomorrow at 10:00 AM with Marcus T.',
    time: '1 day ago',
    read: true,
    link: '/hiring/job/2',
    icon: Clock,
    iconColor: 'text-amber-400 bg-amber-500/20',
  },
  {
    id: '7',
    type: 'review',
    title: 'Review Received',
    message: 'Sarah K. left you a 5-star review for "IKEA Furniture Assembly"',
    time: '2 days ago',
    read: true,
    link: '/hiring/profile',
    icon: Star,
    iconColor: 'text-amber-400 bg-amber-500/20',
  },
]

export default function HiringNotificationsPage() {
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
                <span className="px-2.5 py-0.5 bg-cyan-500 text-white text-sm font-semibold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              <Link
                href="/hiring/settings"
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
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
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
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
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
                      : 'border-cyan-500/30 bg-cyan-500/5'
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
                              notification.read ? 'text-white' : 'text-cyan-400'
                            )}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-sm text-slate-400 mt-0.5">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full shrink-0 mt-1.5" />
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
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
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
                : "When workers bid on your jobs or send messages, you'll see them here."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
