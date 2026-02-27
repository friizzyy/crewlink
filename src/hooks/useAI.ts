'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

// ============================================
// TYPES
// ============================================

interface UseAIOptions {
  showErrorToast?: boolean
}

interface UseAIReturn<T> {
  data: T | null
  loading: boolean
  error: string | null
  call: (body?: Record<string, unknown>) => Promise<T | null>
  reset: () => void
}

// AI response types for each endpoint
interface PricingSuggestion {
  min: number
  max: number
  average: number
  confidence: number
  reasoning: string
}

interface GeneratedDescription {
  description: string
  title?: string
  tags?: string[]
}

interface JobMatch {
  jobId: string
  score: number
  reasons: string[]
}

interface ChatSuggestion {
  suggestions: string[]
}

interface GeneratedBid {
  message: string
  suggestedAmount?: number
}

interface GeneratedProfile {
  headline: string
  bio: string
  highlights?: string[]
}

interface SearchResult {
  results: Array<{
    id: string
    type: string
    title: string
    snippet: string
    score: number
  }>
}

interface JobQualityScore {
  score: number
  maxScore: number
  feedback: Array<{
    field: string
    status: 'good' | 'warning' | 'error'
    message: string
  }>
}

interface DemandHeatmapData {
  regions: Array<{
    lat: number
    lng: number
    demand: number
    category: string
  }>
}

interface OnboardingTip {
  tips: Array<{
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
  }>
}

// ============================================
// ERROR MESSAGES
// ============================================

const ERROR_MESSAGES: Record<string, string> = {
  RATE_LIMIT: 'AI usage limit reached. Please try again later.',
  NOT_CONFIGURED: 'AI features are not configured. Contact support.',
  UNAUTHORIZED: 'Please sign in to use AI features.',
  INVALID_INPUT: 'Invalid input provided. Please check your data.',
}

// ============================================
// GENERIC HOOK
// ============================================

export function useAI<T>(
  endpoint: string,
  options: UseAIOptions = {}
): UseAIReturn<T> {
  const { showErrorToast = true } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const call = useCallback(
    async (body?: Record<string, unknown>): Promise<T | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/ai/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorCode = (errorData as Record<string, string>).code || ''
          const errorMessage =
            ERROR_MESSAGES[errorCode] ||
            (errorData as Record<string, string>).error ||
            'An error occurred with the AI service.'

          setError(errorMessage)
          if (showErrorToast) {
            toast.error(errorMessage)
          }
          setLoading(false)
          return null
        }

        const result = (await response.json()) as T
        setData(result)
        setLoading(false)
        return result
      } catch {
        const errorMessage = 'Failed to connect to AI service. Please try again.'
        setError(errorMessage)
        if (showErrorToast) {
          toast.error(errorMessage)
        }
        setLoading(false)
        return null
      }
    },
    [endpoint, showErrorToast]
  )

  const reset = useCallback(() => {
    setData(null)
    setLoading(false)
    setError(null)
  }, [])

  return { data, loading, error, call, reset }
}

// ============================================
// CONVENIENCE HOOKS
// ============================================

export function useAIPricing(options?: UseAIOptions) {
  return useAI<PricingSuggestion>('pricing-suggestion', options)
}

export function useAIDescription(options?: UseAIOptions) {
  return useAI<GeneratedDescription>('generate-description', options)
}

export function useAIJobMatches(options?: UseAIOptions) {
  return useAI<JobMatch[]>('match-jobs', options)
}

export function useAIChatSuggestions(options?: UseAIOptions) {
  return useAI<ChatSuggestion>('chat-suggestions', options)
}

export function useAIBidWriter(options?: UseAIOptions) {
  return useAI<GeneratedBid>('bid-writer', options)
}

export function useAIProfileWriter(options?: UseAIOptions) {
  return useAI<GeneratedProfile>('profile-writer', options)
}

export function useAISearch(options?: UseAIOptions) {
  return useAI<SearchResult>('search', options)
}

export function useAIJobQuality(options?: UseAIOptions) {
  return useAI<JobQualityScore>('job-quality-score', options)
}

export function useAIDemandHeatmap(options?: UseAIOptions) {
  return useAI<DemandHeatmapData>('demand-heatmap', options)
}

export function useAIOnboardingTips(options?: UseAIOptions) {
  return useAI<OnboardingTip>('onboarding-tips', options)
}
