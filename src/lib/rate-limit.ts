const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
}

export function rateLimit(
  key: string,
  options: RateLimitOptions = { windowMs: 60_000, maxRequests: 20 }
): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + options.windowMs })
    return { success: true, remaining: options.maxRequests - 1 }
  }

  if (entry.count >= options.maxRequests) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: options.maxRequests - entry.count }
}

export function getRateLimitKey(ip: string, route: string): string {
  return `${ip}:${route}`
}

// Clean up stale entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }, 60_000)
}
