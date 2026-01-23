import { clsx, type ClassValue } from 'clsx'
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'

// ============================================
// CLASS NAME UTILITY
// ============================================

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// ============================================
// DATE FORMATTING
// ============================================

export function formatDate(date: Date | string, formatStr = 'MMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr)
}

export function formatTime(date: Date | string) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'h:mm a')
}

export function formatDateTime(date: Date | string) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function formatRelativeTime(date: Date | string) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatMessageTime(date: Date | string) {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return format(d, 'h:mm a')
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export function formatScheduleDate(date: Date | string) {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`
  return format(d, "EEE, MMM d 'at' h:mm a")
}

// ============================================
// NUMBER FORMATTING
// ============================================

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatCompactNumber(num: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

export function formatRating(rating: number) {
  return rating.toFixed(1)
}

export function formatDistance(miles: number) {
  if (miles < 0.1) return 'Nearby'
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`
  return `${miles.toFixed(1)} mi`
}

// ============================================
// STRING FORMATTING
// ============================================

export function truncate(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length - 3) + '...'
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function pluralize(count: number, singular: string, plural?: string) {
  return count === 1 ? singular : plural || singular + 's'
}

// ============================================
// PHONE FORMATTING
// ============================================

export function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

export function cleanPhone(phone: string) {
  return phone.replace(/\D/g, '')
}

// ============================================
// VALIDATION
// ============================================

export function isValidPhone(phone: string) {
  const cleaned = cleanPhone(phone)
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1')
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ============================================
// GEO UTILITIES
// ============================================

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number) {
  return deg * (Math.PI / 180)
}

export function getBoundsFromCenter(
  lat: number,
  lng: number,
  radiusMiles: number
): { north: number; south: number; east: number; west: number } {
  const latDelta = radiusMiles / 69.0 // Approximate miles per degree latitude
  const lngDelta = radiusMiles / (69.0 * Math.cos(toRad(lat)))
  return {
    north: lat + latDelta,
    south: lat - latDelta,
    east: lng + lngDelta,
    west: lng - lngDelta,
  }
}

// ============================================
// URL UTILITIES
// ============================================

export function buildQueryString(params: Record<string, any>) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v))
      } else {
        searchParams.set(key, String(value))
      }
    }
  })
  return searchParams.toString()
}

// ============================================
// ASYNC UTILITIES
// ============================================

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// ============================================
// ID UTILITIES
// ============================================

export function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ============================================
// ARRAY UTILITIES
// ============================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key])
      if (!groups[groupKey]) groups[groupKey] = []
      groups[groupKey].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set()
  return array.filter((item) => {
    const k = item[key]
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// ============================================
// STORAGE UTILITIES
// ============================================

export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage might be full or disabled
  }
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore
  }
}
