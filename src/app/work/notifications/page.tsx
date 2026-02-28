'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Bell, Check, CheckCheck, Trash2, Settings,
  Briefcase, MessageCircle, DollarSign, Star, Clock,
  AlertCircle, CheckCircle2, XCircle, Loader2, Zap, Award,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Card'
import { AmbientBackground } from '@/components/AmbientBackground'
import { GlassPanel, GlassCard, FeatureCard, Button } from '@/components/ui'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  data: Record<string, unknown> | null
  actionUrl: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

const notificationIconMap: Record<string, { icon: typeof Bell; iconColor: string }> = {
  'job_match': { icon: Briefcase, iconColor: 'text-emerald-400 bg-emerald-500/20' },
  'new_job': { icon: Briefcase, iconColor: 'text-emerald-400 bg-emerald-500/20' },
  'bid_accepted': { icon: CheckCircle2, iconColor: 'text-emerald-400 bg-emerald-500/20' },
  'bid_rejected': { icon: XCircle, iconColor: 'text-slate-400 bg-slate-500/20' },
  'bid_declined': { icon: XCircle, iconColor: 'text-slate-400 bg-slate-500/20' },
  'new_message': { icon: MessageCircle, iconColor: 'text-blue-400 bg-blue-500/20' },
  'message': { icon: MessageCircle, iconColor: 'text-blue-400 bg-blue-500/20' },
  'payment': { icon: DollarSign, iconColor: 'text-green-400 bg-green-500/20' },
  'payment_received': { icon: DollarSign, iconColor: 'text-green-400 bg-green-500/20' },
  'new_review': { icon: Star, iconColor: 'text-amber-400 bg-amber-500/20' },
  'review': { icon: Star, iconColor: 'text-amber-400 bg-amber-500/20' },
  'booking_in_progress': { icon: Clock, iconColor: 'text-amber-400 bg-amber-500/20' },
  'booking_completed': { icon: CheckCircle2, iconColor: 'text-emerald-400 bg-emerald-500/20' },
  'booking_cancelled': { icon: XCircle, iconColor: 'text-red-400 bg-red-500/20' },
  'reminder': { icon: Clock, iconColor: 'text-amber-400 bg-amber-500/20' },
  'achievement': { icon: Award, iconColor: 'text-purple-400 bg-purple-500/20' },
}

const defaultIcon = { icon: Bell, iconColor: 'text-slate-400 bg-slate-500/20' }

function getNotificationIcon(type: string) {
  return notificationIconMap[type] || defaultIcon
}

function NotificationSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-xl p-4 flex gap-4">
          <Skeleton variant="rectangular" width={40} height={40} className="shrink-0 !rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" height={16} />
            <Skeleton variant="text" width="80%" height={14} />
            <Skeleton variant="text" width="20%" height={12} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function WorkNotificationsPage() {
  const { data: session } = useSession()
  const toast = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Failed to load notifications')
      const json = await res.json()
      setNotifications(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    return true
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })
      if (!res.ok) throw new Error('Failed to mark as read')
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
    } catch {
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      if (!res.ok) throw new Error('Failed to mark all as read')
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete notification')
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch {
      toast.error('Failed to delete notification')
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8 relative">
      <AmbientBackground />

      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50 relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-sm font-semibold rounded-full animate-glow-pulse">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  leftIcon={<CheckCheck className="w-4 h-4" />}
                  className="text-emerald-400"
                >
                  Mark all read
                </Button>
              )}
              <Link href="/work/settings">
                <Button variant="ghost" size="icon-sm">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                filter === 'all'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                filter === 'unread'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-3xl mx-auto px-4 py-4 relative z-10">
        {loading ? (
          <NotificationSkeleton />
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Failed to load notifications</h2>
            <p className="text-slate-400 max-w-sm mx-auto mb-6">{error}</p>
            <Button variant="success" onClick={fetchNotifications} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Retry
            </Button>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-2">
            {filteredNotifications.map((notification, index) => {
              const { icon: Icon, iconColor } = getNotificationIcon(notification.type)
              return (
                <GlassCard
                  key={notification.id}
                  interactive={false}
                  padding="md"
                  className={cn(
                    'group animate-card-enter',
                    !notification.isRead && 'border-l-4 border-l-emerald-400 bg-emerald-500/5'
                  )}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <Link
                    href={notification.actionUrl || '/work/notifications'}
                    onClick={() => {
                      if (!notification.isRead) markAsRead(notification.id)
                    }}
                    className="flex gap-4"
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                        iconColor
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
                              notification.isRead ? 'text-white' : 'text-emerald-400'
                            )}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-sm text-slate-400 mt-0.5">
                            {notification.body}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 mt-1.5 animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500 mt-2 block">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {!notification.isRead && (
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
                </GlassCard>
              )
            })}
          </div>
        ) : (
          <FeatureCard gradient="emerald" shine className="mt-8">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-emerald-400" />
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
          </FeatureCard>
        )}
      </div>
    </div>
  )
}
