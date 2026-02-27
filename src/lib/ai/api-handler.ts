/**
 * `withAIAuth` -- a wrapper for Next.js API route handlers that use AI features.
 *
 * Handles:
 *  - Session authentication (401 if unauthenticated)
 *  - AIRateLimitError  -> 429
 *  - SyntaxError       -> 502 (JSON parse failure from the model)
 *  - Missing API key   -> 503
 *  - Unknown errors    -> 503
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AIRateLimitError } from './index'

interface AuthenticatedSession {
  user: {
    id: string
    role: string
    email?: string | null
    name?: string | null
  }
}

type AIRouteHandler = (
  req: NextRequest,
  session: AuthenticatedSession
) => Promise<NextResponse>

/**
 * Wrap an AI-powered API route handler with authentication and standardised
 * error handling. The inner handler receives the validated session so it
 * never has to check for null.
 *
 * Usage:
 * ```ts
 * export const POST = withAIAuth(async (req, session) => {
 *   const body = await req.json()
 *   const result = await callAIJSON(session.user.id, 'pricingSuggestion', prompt)
 *   return NextResponse.json(result)
 * })
 * ```
 */
export function withAIAuth(handler: AIRouteHandler) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // 1. Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const authenticatedSession: AuthenticatedSession = {
      user: {
        id: session.user.id as string,
        role: (session.user as Record<string, unknown>).role as string,
        email: session.user.email,
        name: session.user.name,
      },
    }

    try {
      return await handler(req, authenticatedSession)
    } catch (error: unknown) {
      // 2. Rate limit exceeded
      if (error instanceof AIRateLimitError) {
        return NextResponse.json(
          {
            error: 'AI rate limit exceeded',
            remaining: error.remaining,
            limit: error.limit,
          },
          { status: 429 }
        )
      }

      // 3. JSON parse failure (model returned malformed JSON)
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'AI returned an invalid response. Please try again.' },
          { status: 502 }
        )
      }

      // 4. Gemini API key issues
      if (error instanceof Error && error.message.includes('API key')) {
        console.error('[AI] API key error:', error.message)
        return NextResponse.json(
          { error: 'AI service is not configured. Please contact support.' },
          { status: 503 }
        )
      }

      // 5. Unknown / unexpected errors
      console.error('[AI] Unexpected error:', error)
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }
  }
}
