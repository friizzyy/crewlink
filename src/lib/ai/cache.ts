/**
 * AI response caching backed by Prisma (AIResponseCache model).
 *
 * Caching avoids redundant API calls for identical inputs within a TTL window.
 * Inputs are hashed with SHA-256 so we never store raw user prompts in the
 * cache key.
 */

import { createHash } from 'crypto'
import { prisma } from '@/lib/db'

/**
 * Deterministic SHA-256 hash of an arbitrary input string.
 * Used as the cache key so the actual prompt text is not stored as-is.
 */
export function hashInput(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

/**
 * Look up a cached response for (feature, inputHash).
 * Returns `null` if there is no cached entry or if the entry has expired.
 */
export async function getCachedResponse(
  feature: string,
  inputHash: string
): Promise<string | null> {
  const entry = await prisma.aIResponseCache.findUnique({
    where: { feature_inputHash: { feature, inputHash } },
  })

  if (!entry) return null

  // TTL check: if the entry has expired, treat it as a miss
  if (entry.expiresAt < new Date()) {
    // Fire-and-forget cleanup of the stale entry
    prisma.aIResponseCache
      .delete({ where: { id: entry.id } })
      .catch(() => {
        // Ignore cleanup errors
      })
    return null
  }

  return entry.response
}

/**
 * Store (or update) a cached response.
 *
 * Uses upsert so that a race between two concurrent requests for the same
 * input just overwrites rather than failing with a unique constraint error.
 *
 * @param feature   - AI feature name (e.g. "pricingSuggestion")
 * @param inputHash - SHA-256 hash of the prompt input
 * @param response  - Serialised JSON response string
 * @param ttlHours  - Time-to-live in hours (default: 24)
 */
export async function setCachedResponse(
  feature: string,
  inputHash: string,
  response: string,
  ttlHours: number = 24
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000)

  await prisma.aIResponseCache.upsert({
    where: { feature_inputHash: { feature, inputHash } },
    update: { response, expiresAt },
    create: { feature, inputHash, response, expiresAt },
  })
}
