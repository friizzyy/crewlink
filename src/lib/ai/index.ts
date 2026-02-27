/**
 * AI module barrel export and main orchestration functions.
 *
 * `callAI` and `callAIJSON` handle the full lifecycle:
 *   rate-limit check -> cache check -> AI call -> cache store -> usage log
 *
 * Consumer code should use these rather than calling the provider directly.
 */

export { geminiProvider } from './gemini'
export type { AIGenerateOptions, AIProvider, AIResponse } from './provider'
export { RATE_LIMITS, checkRateLimit, logUsage } from './rate-limit'
export { hashInput, getCachedResponse, setCachedResponse } from './cache'
export * from './prompts'

import type { AIGenerateOptions, AIResponse } from './provider'
import { geminiProvider } from './gemini'
import { hashInput, getCachedResponse, setCachedResponse } from './cache'
import { checkRateLimit, logUsage } from './rate-limit'

// ---------------------------------------------------------------------------
// Custom error classes
// ---------------------------------------------------------------------------

export class AIRateLimitError extends Error {
  public remaining: number
  public limit: number

  constructor(feature: string, remaining: number, limit: number) {
    super(
      `AI rate limit exceeded for "${feature}". Limit: ${limit}/day, remaining: ${remaining}.`
    )
    this.name = 'AIRateLimitError'
    this.remaining = remaining
    this.limit = limit
  }
}

export class AIUnavailableError extends Error {
  constructor(reason: string) {
    super(`AI service unavailable: ${reason}`)
    this.name = 'AIUnavailableError'
  }
}

// ---------------------------------------------------------------------------
// Orchestrated AI calls
// ---------------------------------------------------------------------------

interface CallAIOptions extends AIGenerateOptions {
  /** Cache TTL in hours. Set to 0 to skip caching. Default: 24 */
  cacheTTLHours?: number
}

/**
 * Full-lifecycle text generation:
 * rate-limit -> cache check -> Gemini call -> cache store -> usage log.
 */
export async function callAI(
  userId: string,
  feature: string,
  prompt: string,
  options?: CallAIOptions
): Promise<AIResponse> {
  // 1. Rate limit check
  const { allowed, remaining, limit } = await checkRateLimit(userId, feature)
  if (!allowed) {
    throw new AIRateLimitError(feature, remaining, limit)
  }

  const cacheTTL = options?.cacheTTLHours ?? 24

  // 2. Cache check
  if (cacheTTL > 0) {
    const inputHash = hashInput(`${feature}:${prompt}`)
    const cached = await getCachedResponse(feature, inputHash)
    if (cached !== null) {
      // Log usage even for cached hits so rate limits stay accurate
      await logUsage(userId, feature, 0, true)
      return { text: cached, tokensUsed: 0, cached: true }
    }
  }

  // 3. AI call
  const { temperature, maxTokens, systemPrompt } = options ?? {}
  const response = await geminiProvider.generate(prompt, {
    temperature,
    maxTokens,
    systemPrompt,
  })

  // 4. Cache store
  if (cacheTTL > 0) {
    const inputHash = hashInput(`${feature}:${prompt}`)
    await setCachedResponse(feature, inputHash, response.text, cacheTTL).catch(
      () => {
        // Non-critical: cache write failures should not break the request
      }
    )
  }

  // 5. Usage log
  await logUsage(userId, feature, response.tokensUsed, false)

  return response
}

/**
 * Full-lifecycle structured JSON generation:
 * rate-limit -> cache check -> Gemini call -> parse -> cache store -> usage log.
 */
export async function callAIJSON<T>(
  userId: string,
  feature: string,
  prompt: string,
  options?: CallAIOptions
): Promise<{ data: T; tokensUsed: number; cached: boolean }> {
  // 1. Rate limit check
  const { allowed, remaining, limit } = await checkRateLimit(userId, feature)
  if (!allowed) {
    throw new AIRateLimitError(feature, remaining, limit)
  }

  const cacheTTL = options?.cacheTTLHours ?? 24

  // 2. Cache check
  if (cacheTTL > 0) {
    const inputHash = hashInput(`${feature}:${prompt}`)
    const cached = await getCachedResponse(feature, inputHash)
    if (cached !== null) {
      await logUsage(userId, feature, 0, true)
      const data = JSON.parse(cached) as T
      return { data, tokensUsed: 0, cached: true }
    }
  }

  // 3. AI call (generateJSON handles parsing)
  const { temperature, maxTokens, systemPrompt } = options ?? {}
  const result = await geminiProvider.generateJSON<T>(prompt, {
    temperature,
    maxTokens,
    systemPrompt,
  })

  // 4. Cache store (store the serialised JSON, not the raw model output)
  if (cacheTTL > 0) {
    const inputHash = hashInput(`${feature}:${prompt}`)
    await setCachedResponse(
      feature,
      inputHash,
      JSON.stringify(result.data),
      cacheTTL
    ).catch(() => {
      // Non-critical
    })
  }

  // 5. Usage log
  await logUsage(userId, feature, result.tokensUsed, false)

  return result
}
