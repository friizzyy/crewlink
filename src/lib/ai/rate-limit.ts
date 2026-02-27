/**
 * Per-user, per-feature AI rate limiting.
 *
 * Limits are checked against the AIUsageLog table (daily rolling window).
 * This keeps rate state in the database so it works correctly across
 * multiple serverless function instances on Vercel.
 */

import { prisma } from '@/lib/db'

// ---------------------------------------------------------------------------
// Daily call limits per feature
// ---------------------------------------------------------------------------

export const RATE_LIMITS: Record<string, number> = {
  pricingSuggestion: 20,
  generateDescription: 15,
  matchJobs: 10,
  reviewSummary: 15,
  chatSuggestions: 50,
  cleanScope: 15,
  profileWriter: 10,
  bidWriter: 30,
  searchParse: 40,
  jobQualityScore: 20,
  fraudCheck: 30,
  disputeAssist: 10,
  demandHeatmap: 10,
  smartNotification: 50,
  photoAnalysis: 15,
  onboardingTips: 20,
}

const DEFAULT_DAILY_LIMIT = 10

// ---------------------------------------------------------------------------
// Rate limit check
// ---------------------------------------------------------------------------

interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
}

/**
 * Check whether a user is within their daily call budget for the given feature.
 * Uses a 24-hour rolling window counted from the AIUsageLog table.
 */
export async function checkRateLimit(
  userId: string,
  feature: string
): Promise<RateLimitResult> {
  const limit = RATE_LIMITS[feature] ?? DEFAULT_DAILY_LIMIT
  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const usageCount = await prisma.aIUsageLog.count({
    where: {
      userId,
      feature,
      createdAt: { gte: windowStart },
    },
  })

  const remaining = Math.max(0, limit - usageCount)

  return {
    allowed: usageCount < limit,
    remaining,
    limit,
  }
}

// ---------------------------------------------------------------------------
// Usage logging
// ---------------------------------------------------------------------------

/**
 * Record a single AI usage event. Called after every successful (or cached)
 * AI invocation so the rate limiter has accurate counts.
 */
export async function logUsage(
  userId: string,
  feature: string,
  tokensUsed: number,
  cached: boolean
): Promise<void> {
  await prisma.aIUsageLog.create({
    data: {
      userId,
      feature,
      tokensUsed,
      cached,
    },
  })
}
