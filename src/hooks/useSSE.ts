'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useNotificationsStore } from '@/store'
import type { Notification, NotificationType } from '@/types'

// ============================================
// TYPES
// ============================================

type SSEEventType =
  | 'connected'
  | 'new-message'
  | 'bid-received'
  | 'bid-accepted'
  | 'job-status-change'
  | 'payment-received'

interface SSEEventData {
  type: SSEEventType
  payload: Record<string, unknown>
}

type SSEEventHandler = (data: SSEEventData['payload']) => void

// Map SSE events to notification types
const EVENT_TO_NOTIFICATION_TYPE: Partial<Record<SSEEventType, NotificationType>> = {
  'bid-received': 'new_bid',
  'bid-accepted': 'bid_accepted',
  'payment-received': 'payment_received',
}

// ============================================
// HOOK
// ============================================

export function useSSE() {
  const eventSourceRef = useRef<EventSource | null>(null)
  const handlersRef = useRef<Map<SSEEventType, Set<SSEEventHandler>>>(new Map())
  const reconnectAttemptRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const addNotification = useNotificationsStore((state) => state.addNotification)

  const getReconnectDelay = useCallback(() => {
    const attempt = reconnectAttemptRef.current
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000)
    return delay
  }, [])

  const handleEvent = useCallback(
    (eventType: SSEEventType, data: Record<string, unknown>) => {
      // Dispatch to registered handlers
      const handlers = handlersRef.current.get(eventType)
      if (handlers) {
        handlers.forEach((handler) => handler(data))
      }

      // Auto-add notifications for specific event types
      const notificationType = EVENT_TO_NOTIFICATION_TYPE[eventType]
      if (notificationType) {
        const notification: Notification = {
          id: (data.id as string) || crypto.randomUUID(),
          userId: (data.userId as string) || '',
          type: notificationType,
          title: (data.title as string) || getDefaultTitle(eventType),
          body: (data.body as string) || getDefaultBody(eventType),
          data: data,
          isRead: false,
          readAt: null,
          createdAt: new Date(),
        }
        addNotification(notification)
      }
    },
    [addNotification]
  )

  const connect = useCallback(() => {
    if (!mountedRef.current) return
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource('/api/sse')
    eventSourceRef.current = eventSource

    const eventTypes: SSEEventType[] = [
      'connected',
      'new-message',
      'bid-received',
      'bid-accepted',
      'job-status-change',
      'payment-received',
    ]

    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as Record<string, unknown>
          handleEvent(eventType, data)
        } catch {
          // Silently ignore malformed event data
        }
      })
    })

    eventSource.onopen = () => {
      reconnectAttemptRef.current = 0
    }

    eventSource.onerror = () => {
      eventSource.close()
      eventSourceRef.current = null

      if (!mountedRef.current) return

      const delay = getReconnectDelay()
      reconnectAttemptRef.current += 1

      reconnectTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          connect()
        }
      }, delay)
    }
  }, [handleEvent, getReconnectDelay])

  // Register a custom event handler
  const on = useCallback((eventType: SSEEventType, handler: SSEEventHandler) => {
    if (!handlersRef.current.has(eventType)) {
      handlersRef.current.set(eventType, new Set())
    }
    handlersRef.current.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = handlersRef.current.get(eventType)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  }, [])

  // Connect on mount, cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      handlersRef.current.clear()
    }
  }, [connect])

  return { on }
}

// ============================================
// DEFAULT NOTIFICATION CONTENT
// ============================================

function getDefaultTitle(eventType: SSEEventType): string {
  switch (eventType) {
    case 'bid-received':
      return 'New Bid Received'
    case 'bid-accepted':
      return 'Bid Accepted'
    case 'payment-received':
      return 'Payment Received'
    default:
      return 'Notification'
  }
}

function getDefaultBody(eventType: SSEEventType): string {
  switch (eventType) {
    case 'bid-received':
      return 'A worker submitted a bid on your job.'
    case 'bid-accepted':
      return 'Your bid has been accepted!'
    case 'payment-received':
      return 'A payment has been processed.'
    default:
      return ''
  }
}
