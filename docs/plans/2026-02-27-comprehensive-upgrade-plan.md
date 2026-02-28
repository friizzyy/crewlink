# CrewLink Comprehensive Upgrade — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add 16 AI features (Gemini free tier), Stripe Connect payments, SSE real-time, location search, file uploads, and premium UI overhaul across all dashboard pages.

**Architecture:** Provider-agnostic AI layer at `src/lib/ai/` with caching + rate limiting. Stripe Connect for escrow payments. SSE for real-time. Recharts for analytics. All new APIs follow existing patterns in `src/app/api/`.

**Tech Stack:** Google Gemini (`@google/generative-ai`), Stripe (`stripe`), Recharts (`recharts`), Vercel Blob (`@vercel/blob`), react-hook-form + Zod.

---

## Phase 1: Foundation — Dependencies, Schema, AI Infrastructure

### Task 1: Install New Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install production dependencies**

Run:
```bash
npm install @google/generative-ai stripe recharts @vercel/blob react-hook-form @hookform/resolvers
```

**Step 2: Verify installation**

Run: `npm ls @google/generative-ai stripe recharts @vercel/blob react-hook-form`
Expected: All packages listed with versions

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add AI, payments, charts, upload, and form dependencies"
```

---

### Task 2: Add New Prisma Models (AIUsageLog, AIResponseCache)

**Files:**
- Modify: `prisma/schema.prisma` (append after Notification model, before Reference Data)

**Step 1: Add AI models to schema**

Add these models after the `Notification` model section (after line ~446):

```prisma
// ============================================
// AI TRACKING
// ============================================

model AIUsageLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation("AIUsage", fields: [userId], references: [id], onDelete: Cascade)
  feature     String   // "pricing-suggestion", "bid-writer", etc.
  tokensUsed  Int      @default(0)
  cached      Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([userId, feature, createdAt])
  @@index([userId])
}

model AIResponseCache {
  id          String   @id @default(cuid())
  feature     String
  inputHash   String
  response    String   @db.Text
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@unique([feature, inputHash])
  @@index([expiresAt])
}
```

**Step 2: Add relation to User model**

In the User model (around line 56-88), add this relation:

```prisma
  aiUsageLogs        AIUsageLog[]       @relation("AIUsage")
```

**Step 3: Generate Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

**Step 4: Push schema to database**

Run: `npx prisma db push`
Expected: Schema synced successfully

**Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add AIUsageLog and AIResponseCache Prisma models"
```

---

### Task 3: Add Environment Variables

**Files:**
- Modify: `.env.example`
- Modify: `.env.local` (if exists)

**Step 1: Add new env vars to .env.example**

Append these to `.env.example`:

```bash
# Google Gemini AI (free tier)
GOOGLE_GEMINI_API_KEY="your_gemini_api_key_here"

# Stripe (payment processing)
STRIPE_SECRET_KEY="sk_test_your_stripe_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_key_here"

# Vercel Blob (file uploads)
BLOB_READ_WRITE_TOKEN="vercel_blob_token_here"
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "feat: add Gemini, Stripe, and Vercel Blob env vars to example"
```

---

### Task 4: Build AI Provider Abstraction Layer

**Files:**
- Create: `src/lib/ai/provider.ts`
- Create: `src/lib/ai/gemini.ts`
- Create: `src/lib/ai/prompts.ts`
- Create: `src/lib/ai/cache.ts`
- Create: `src/lib/ai/rate-limit.ts`
- Create: `src/lib/ai/index.ts`

**Step 1: Create the abstract AI provider interface**

Create `src/lib/ai/provider.ts`:

```typescript
// Abstract AI provider interface — swap Gemini for Claude/GPT later
// by implementing this interface with a different provider

export interface AIGenerateOptions {
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

export interface AIResponse {
  text: string
  tokensUsed: number
  cached: boolean
}

export interface AIProvider {
  generate(prompt: string, options?: AIGenerateOptions): Promise<AIResponse>
  generateJSON<T>(prompt: string, options?: AIGenerateOptions): Promise<{ data: T; tokensUsed: number; cached: boolean }>
}
```

**Step 2: Create the Gemini implementation**

Create `src/lib/ai/gemini.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, AIGenerateOptions, AIResponse } from './provider'

let genAI: GoogleGenerativeAI | null = null

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured')
    }
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

export const geminiProvider: AIProvider = {
  async generate(prompt: string, options?: AIGenerateOptions): Promise<AIResponse> {
    const client = getClient()
    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    })

    const systemParts = options?.systemPrompt
      ? [{ text: options.systemPrompt }]
      : []

    const result = await model.generateContent({
      contents: [
        ...(systemParts.length > 0
          ? [{ role: 'user' as const, parts: [{ text: `System: ${options?.systemPrompt}\n\nUser: ${prompt}` }] }]
          : [{ role: 'user' as const, parts: [{ text: prompt }] }]),
      ],
    })

    const response = result.response
    const text = response.text()
    const usage = response.usageMetadata

    return {
      text,
      tokensUsed: (usage?.promptTokenCount ?? 0) + (usage?.candidatesTokenCount ?? 0),
      cached: false,
    }
  },

  async generateJSON<T>(prompt: string, options?: AIGenerateOptions): Promise<{ data: T; tokensUsed: number; cached: boolean }> {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond with valid JSON only. No markdown, no code blocks, no explanation — just the JSON object.`
    const response = await this.generate(jsonPrompt, {
      ...options,
      temperature: options?.temperature ?? 0.3,
    })

    // Strip markdown code blocks if present
    let cleaned = response.text.trim()
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7)
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3)
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3)
    }
    cleaned = cleaned.trim()

    const data = JSON.parse(cleaned) as T
    return { data, tokensUsed: response.tokensUsed, cached: false }
  },
}
```

**Step 3: Create the centralized prompts file**

Create `src/lib/ai/prompts.ts`:

```typescript
// All AI system prompts centralized here.
// Each prompt is a function that takes context and returns a formatted prompt string.

export const AI_PROMPTS = {
  pricingSuggestion: (category: string, location: string, description: string) =>
    `You are a pricing expert for local service jobs. Based on the following job details, suggest a fair price range.

Category: ${category}
Location: ${location}
Description: ${description}

Respond as JSON:
{
  "minPrice": <number in dollars>,
  "maxPrice": <number in dollars>,
  "confidence": "high" | "medium" | "low",
  "reasoning": "<brief 1-sentence explanation>"
}`,

  generateDescription: (category: string, briefDescription: string, location: string) =>
    `You are a professional job posting writer for a gig economy platform (like TaskRabbit). Write a clear, detailed job description.

Category: ${category}
Brief notes from hirer: ${briefDescription}
Location: ${location}

Write a professional job description (150-250 words) that includes:
1. Clear scope of work
2. What the worker should expect
3. Any materials or tools needed
4. Timeline expectations

Respond as JSON:
{
  "title": "<concise job title, 5-10 words>",
  "description": "<full description>",
  "estimatedHours": <number>,
  "suggestedSkills": ["<skill1>", "<skill2>"]
}

Write naturally — do NOT use corporate jargon or AI-sounding language. Write like a real person posting a job.`,

  matchJobs: (workerSkills: string[], workerLocation: string, workerRate: number, jobSummaries: string) =>
    `You are a job matching engine for a gig economy platform. Rank the following jobs by relevance for this worker.

Worker profile:
- Skills: ${workerSkills.join(', ')}
- Location: ${workerLocation}
- Typical rate: $${workerRate}/hr

Available jobs:
${jobSummaries}

Return a JSON array of job IDs ranked by best match, with match scores:
{
  "matches": [
    { "jobId": "<id>", "score": <0-100>, "reason": "<brief reason>" }
  ]
}

Prioritize: skill overlap > location proximity > pay alignment. Max 10 results.`,

  reviewSummary: (reviews: string) =>
    `Summarize these worker reviews into key themes. Be concise and honest.

Reviews:
${reviews}

Respond as JSON:
{
  "summary": "<2-3 sentence overall summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>"] or [],
  "keywords": ["reliable", "fast", "communicative"]
}

Write naturally. If reviews are mostly positive, say so. If there are concerns, mention them fairly.`,

  chatSuggestions: (conversationContext: string, lastMessage: string, userRole: string) =>
    `You are helping a ${userRole} respond to a message in a gig economy platform conversation.

Conversation context: ${conversationContext}
Last message received: "${lastMessage}"

Suggest 3 quick reply options. Keep each under 50 words. Make them natural and varied — one agreeing, one suggesting an alternative, one asking for clarification.

Respond as JSON:
{
  "suggestions": [
    "<reply option 1>",
    "<reply option 2>",
    "<reply option 3>"
  ]
}`,

  cleanScope: (rawDescription: string, category: string) =>
    `You are a project scope analyst. Clean up this rough job description into a structured scope.

Category: ${category}
Raw description: ${rawDescription}

Respond as JSON:
{
  "title": "<clear title>",
  "description": "<cleaned description, 100-200 words>",
  "tasks": ["<task 1>", "<task 2>", "<task 3>"],
  "estimatedHours": <number>,
  "suggestedBudget": { "min": <number>, "max": <number> },
  "requiredSkills": ["<skill>"],
  "safetyNotes": ["<note>"] or []
}`,

  profileWriter: (skills: string[], completedJobs: number, rating: number, category: string) =>
    `Write a professional but natural worker profile for a gig economy platform.

Worker info:
- Skills: ${skills.join(', ')}
- Completed jobs: ${completedJobs}
- Average rating: ${rating}/5
- Primary category: ${category}

Respond as JSON:
{
  "headline": "<professional headline, 8-15 words>",
  "bio": "<compelling bio, 80-150 words>"
}

Write like a real person — not a robot. No buzzwords. Be specific about experience.`,

  bidWriter: (jobTitle: string, jobDescription: string, workerSkills: string[], workerRating: number) =>
    `Write a personalized bid message for a gig worker applying to a job.

Job: ${jobTitle}
Description: ${jobDescription}
Worker skills: ${workerSkills.join(', ')}
Worker rating: ${workerRating}/5

Respond as JSON:
{
  "message": "<bid message, 50-100 words>"
}

Write naturally. Reference specific parts of the job. Show enthusiasm without being fake. Be professional but warm.`,

  searchParse: (naturalQuery: string) =>
    `Parse this natural language job search query into structured filters.

Query: "${naturalQuery}"

Respond as JSON:
{
  "category": "<detected category or null>",
  "location": "<detected location or null>",
  "budgetMin": <number or null>,
  "budgetMax": <number or null>,
  "scheduleType": "asap" | "flexible" | "specific" | null,
  "skills": ["<skill>"] or [],
  "searchTerms": "<remaining search text>"
}`,

  jobQualityScore: (title: string, description: string, budget: string, category: string) =>
    `Score this job posting on quality (1-10) and suggest improvements.

Title: ${title}
Description: ${description}
Budget: ${budget}
Category: ${category}

Respond as JSON:
{
  "score": <1-10>,
  "improvements": ["<suggestion 1>", "<suggestion 2>"],
  "strengths": ["<what's good>"]
}`,

  fraudCheck: (content: string, userHistory: string) =>
    `Analyze this content for potential spam or fraud on a gig economy platform.

Content: ${content}
User history: ${userHistory}

Respond as JSON:
{
  "riskLevel": "low" | "medium" | "high",
  "flags": ["<concern>"] or [],
  "recommendation": "allow" | "review" | "block"
}`,

  disputeAssist: (jobScope: string, conversationSummary: string, issue: string) =>
    `Help mediate a dispute between a hirer and worker on a gig platform.

Job scope: ${jobScope}
Conversation summary: ${conversationSummary}
Issue raised: ${issue}

Respond as JSON:
{
  "analysis": "<fair assessment of the situation, 2-3 sentences>",
  "suggestedResolution": "<recommended resolution>",
  "forHirer": "<advice for the hirer>",
  "forWorker": "<advice for the worker>"
}`,

  demandHeatmap: (jobData: string, location: string) =>
    `Analyze job posting patterns and identify high-demand areas/categories.

Recent job data: ${jobData}
Focus area: ${location}

Respond as JSON:
{
  "hotCategories": [
    { "category": "<name>", "demand": "high" | "medium", "trend": "rising" | "stable" | "declining" }
  ],
  "insights": ["<insight 1>", "<insight 2>"],
  "recommendation": "<what workers should focus on>"
}`,

  smartNotification: (eventType: string, eventData: string, recipientRole: string) =>
    `Write a personalized, helpful notification message for a ${recipientRole} on a gig platform.

Event: ${eventType}
Details: ${eventData}

Respond as JSON:
{
  "title": "<short title, 5-8 words>",
  "body": "<helpful message, 15-30 words>"
}

Make it specific and actionable — not generic. Include relevant details from the event data.`,

  photoAnalysis: (jobDescription: string) =>
    `You are verifying job completion photos. Based on the job description, describe what you would expect to see in completion photos.

Job description: ${jobDescription}

Respond as JSON:
{
  "expectedElements": ["<what should be visible>"],
  "verificationPrompt": "<what to look for in the photo>"
}`,

  onboardingTips: (userRole: string, currentStep: string, profileCompleteness: number) =>
    `Give a helpful onboarding tip for a new ${userRole} on a gig economy platform.

Current step: ${currentStep}
Profile completeness: ${profileCompleteness}%

Respond as JSON:
{
  "tip": "<actionable tip, 20-40 words>",
  "nextAction": "<what they should do next>",
  "motivation": "<encouraging message, 10-20 words>"
}

Be friendly and helpful, not patronizing.`,
} as const
```

**Step 4: Create the caching layer**

Create `src/lib/ai/cache.ts`:

```typescript
import crypto from 'crypto'
import { prisma } from '@/lib/db'

export function hashInput(input: unknown): string {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(input))
    .digest('hex')
}

export async function getCachedResponse(feature: string, inputHash: string): Promise<string | null> {
  const cached = await prisma.aIResponseCache.findUnique({
    where: {
      feature_inputHash: { feature, inputHash },
    },
  })

  if (cached && cached.expiresAt > new Date()) {
    return cached.response
  }

  // Clean up expired entry
  if (cached) {
    await prisma.aIResponseCache.delete({
      where: { id: cached.id },
    }).catch(() => {}) // Ignore if already deleted
  }

  return null
}

export async function setCachedResponse(
  feature: string,
  inputHash: string,
  response: string,
  ttlHours: number = 48
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + ttlHours)

  await prisma.aIResponseCache.upsert({
    where: { feature_inputHash: { feature, inputHash } },
    create: { feature, inputHash, response, expiresAt },
    update: { response, expiresAt },
  })
}
```

**Step 5: Create the rate limiter**

Create `src/lib/ai/rate-limit.ts`:

```typescript
import { prisma } from '@/lib/db'

// Per-feature daily rate limits
const RATE_LIMITS: Record<string, number> = {
  'pricing-suggestion': 10,
  'generate-description': 5,
  'match-jobs': 20,
  'review-summary': 10,
  'chat-suggestions': 30,
  'clean-scope': 10,
  'profile-writer': 3,
  'bid-writer': 15,
  'search': 30,
  'job-quality-score': 50, // Higher limit — auto-triggered
  'fraud-check': 100, // Auto-triggered, needs headroom
  'dispute-assist': 5,
  'demand-heatmap': 5,
  'smart-notification': 100, // Auto-triggered
  'photo-analysis': 5,
  'onboarding-tips': 10,
}

export async function checkRateLimit(
  userId: string,
  feature: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const limit = RATE_LIMITS[feature] ?? 10
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const usageCount = await prisma.aIUsageLog.count({
    where: {
      userId,
      feature,
      createdAt: { gte: today },
    },
  })

  return {
    allowed: usageCount < limit,
    remaining: Math.max(0, limit - usageCount),
    limit,
  }
}

export async function logUsage(
  userId: string,
  feature: string,
  tokensUsed: number,
  cached: boolean
): Promise<void> {
  await prisma.aIUsageLog.create({
    data: { userId, feature, tokensUsed, cached },
  })
}
```

**Step 6: Create the barrel export**

Create `src/lib/ai/index.ts`:

```typescript
import { geminiProvider } from './gemini'
import { getCachedResponse, setCachedResponse, hashInput } from './cache'
import { checkRateLimit, logUsage } from './rate-limit'
import type { AIProvider, AIGenerateOptions } from './provider'

export type { AIProvider, AIGenerateOptions, AIResponse } from './provider'
export { AI_PROMPTS } from './prompts'
export { checkRateLimit } from './rate-limit'

// The active AI provider — change this one line to swap providers
const activeProvider: AIProvider = geminiProvider

interface AICallOptions extends AIGenerateOptions {
  feature: string
  userId: string
  cacheKey?: unknown
  cacheTTLHours?: number
}

/**
 * Main entry point for all AI calls.
 * Handles: rate limiting → cache check → AI call → cache store → usage logging
 */
export async function callAI(prompt: string, options: AICallOptions): Promise<{ text: string; cached: boolean; tokensUsed: number }> {
  const { feature, userId, cacheKey, cacheTTLHours, ...aiOptions } = options

  // 1. Rate limit check
  const rateCheck = await checkRateLimit(userId, feature)
  if (!rateCheck.allowed) {
    throw new AIRateLimitError(feature, rateCheck.limit)
  }

  // 2. Cache check
  if (cacheKey) {
    const inputHash = hashInput(cacheKey)
    const cached = await getCachedResponse(feature, inputHash)
    if (cached) {
      await logUsage(userId, feature, 0, true)
      return { text: cached, cached: true, tokensUsed: 0 }
    }
  }

  // 3. Call AI provider
  const response = await activeProvider.generate(prompt, aiOptions)

  // 4. Cache response
  if (cacheKey) {
    const inputHash = hashInput(cacheKey)
    await setCachedResponse(feature, inputHash, response.text, cacheTTLHours ?? 48)
  }

  // 5. Log usage
  await logUsage(userId, feature, response.tokensUsed, false)

  return { text: response.text, cached: false, tokensUsed: response.tokensUsed }
}

/**
 * AI call that returns parsed JSON. Same lifecycle as callAI.
 */
export async function callAIJSON<T>(prompt: string, options: AICallOptions): Promise<{ data: T; cached: boolean; tokensUsed: number }> {
  const result = await callAI(prompt, { ...options, temperature: options.temperature ?? 0.3 })

  let cleaned = result.text.trim()
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7)
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3)
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3)
  cleaned = cleaned.trim()

  const data = JSON.parse(cleaned) as T
  return { data, cached: result.cached, tokensUsed: result.tokensUsed }
}

// Custom error classes
export class AIRateLimitError extends Error {
  constructor(feature: string, limit: number) {
    super(`AI rate limit exceeded for ${feature}. Daily limit: ${limit}`)
    this.name = 'AIRateLimitError'
  }
}

export class AIUnavailableError extends Error {
  constructor(message: string = 'AI service is temporarily unavailable') {
    super(message)
    this.name = 'AIUnavailableError'
  }
}
```

**Step 7: Commit**

```bash
git add src/lib/ai/
git commit -m "feat: add AI provider abstraction layer with Gemini, caching, and rate limiting"
```

---

## Phase 2: AI API Routes (16 Endpoints)

### Task 5: Create AI API Helper Middleware

**Files:**
- Create: `src/lib/ai/api-handler.ts`

**Step 1: Create reusable API handler wrapper**

Create `src/lib/ai/api-handler.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AIRateLimitError } from './index'

type AIRouteHandler = (
  request: NextRequest,
  session: { user: { id: string; role: string; email: string } }
) => Promise<NextResponse>

/**
 * Wraps AI API routes with auth check, error handling, and rate limit error formatting.
 */
export function withAIAuth(handler: AIRouteHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }

      return await handler(request, session as { user: { id: string; role: string; email: string } })
    } catch (error) {
      if (error instanceof AIRateLimitError) {
        return NextResponse.json(
          { success: false, error: error.message, code: 'RATE_LIMIT' },
          { status: 429 }
        )
      }

      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { success: false, error: 'AI returned invalid response. Please try again.', code: 'PARSE_ERROR' },
          { status: 502 }
        )
      }

      console.error('AI API error:', error)

      // Gemini-specific errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('API key') || errorMessage.includes('not configured')) {
        return NextResponse.json(
          { success: false, error: 'AI service not configured', code: 'NOT_CONFIGURED' },
          { status: 503 }
        )
      }

      return NextResponse.json(
        { success: false, error: 'AI service temporarily unavailable', code: 'UNAVAILABLE' },
        { status: 503 }
      )
    }
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/ai/api-handler.ts
git commit -m "feat: add AI API route handler wrapper with auth and error handling"
```

---

### Task 6: AI Route — Smart Pricing Suggestion

**Files:**
- Create: `src/app/api/ai/pricing-suggestion/route.ts`

**Step 1: Create the route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'

const schema = z.object({
  category: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(10).max(1000),
})

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: validation.error.errors[0].message },
      { status: 400 }
    )
  }

  const { category, location, description } = validation.data
  const prompt = AI_PROMPTS.pricingSuggestion(category, location, description)

  const result = await callAIJSON<{
    minPrice: number
    maxPrice: number
    confidence: string
    reasoning: string
  }>(prompt, {
    feature: 'pricing-suggestion',
    userId: session.user.id,
    cacheKey: { category, location, description: description.substring(0, 100) },
    cacheTTLHours: 24,
    systemPrompt: 'You are a pricing expert for local services. Be accurate and fair.',
  })

  return NextResponse.json({ success: true, data: result.data, cached: result.cached })
})
```

**Step 2: Commit**

```bash
git add src/app/api/ai/pricing-suggestion/route.ts
git commit -m "feat: add AI pricing suggestion API route"
```

---

### Task 7: AI Route — Generate Job Description

**Files:**
- Create: `src/app/api/ai/generate-description/route.ts`

**Step 1: Create the route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'

const schema = z.object({
  category: z.string().min(1),
  briefDescription: z.string().min(5).max(500),
  location: z.string().min(1),
})

export const POST = withAIAuth(async (request: NextRequest, session) => {
  if (session.user.role !== 'hirer') {
    return NextResponse.json(
      { success: false, error: 'Only hirers can generate job descriptions' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const validation = schema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: validation.error.errors[0].message },
      { status: 400 }
    )
  }

  const { category, briefDescription, location } = validation.data
  const prompt = AI_PROMPTS.generateDescription(category, briefDescription, location)

  const result = await callAIJSON<{
    title: string
    description: string
    estimatedHours: number
    suggestedSkills: string[]
  }>(prompt, {
    feature: 'generate-description',
    userId: session.user.id,
    systemPrompt: 'You write job descriptions for a gig economy platform. Write naturally, not like AI.',
  })

  return NextResponse.json({ success: true, data: result.data, cached: result.cached })
})
```

**Step 2: Commit**

```bash
git add src/app/api/ai/generate-description/route.ts
git commit -m "feat: add AI job description generator API route"
```

---

### Task 8: AI Route — Intelligent Job Matching

**Files:**
- Create: `src/app/api/ai/match-jobs/route.ts`

**Step 1: Create the route**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'
import { prisma } from '@/lib/db'

export const GET = withAIAuth(async (_request: NextRequest, session) => {
  if (session.user.role !== 'worker') {
    return NextResponse.json(
      { success: false, error: 'Only workers can get job matches' },
      { status: 403 }
    )
  }

  // Get worker profile
  const workerProfile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!workerProfile) {
    return NextResponse.json(
      { success: false, error: 'Worker profile not found' },
      { status: 404 }
    )
  }

  // Get recent open jobs
  const jobs = await prisma.job.findMany({
    where: { status: 'posted' },
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      budgetMin: true,
      budgetMax: true,
      address: true,
      city: true,
      lat: true,
      lng: true,
      skills: true,
      createdAt: true,
      poster: {
        select: {
          name: true,
          hirerProfile: { select: { averageRating: true } },
        },
      },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 30, // Analyze top 30 recent jobs
  })

  if (jobs.length === 0) {
    return NextResponse.json({ success: true, data: { matches: [] } })
  }

  const jobSummaries = jobs
    .map(
      (j, i) =>
        `Job ${i + 1} (ID: ${j.id}): "${j.title}" - Category: ${j.category} - Budget: $${j.budgetMin ?? '?'}-$${j.budgetMax ?? '?'} - Location: ${j.city || j.address} - Skills: ${j.skills.join(', ') || 'none listed'} - Bids: ${j._count.bids}`
    )
    .join('\n')

  const prompt = AI_PROMPTS.matchJobs(
    workerProfile.skills,
    workerProfile.baseAddress || 'Unknown',
    workerProfile.hourlyRate || 25,
    jobSummaries
  )

  const result = await callAIJSON<{
    matches: Array<{ jobId: string; score: number; reason: string }>
  }>(prompt, {
    feature: 'match-jobs',
    userId: session.user.id,
    cacheKey: {
      skills: workerProfile.skills,
      jobIds: jobs.map((j) => j.id).slice(0, 5), // Cache key based on top 5 job IDs
    },
    cacheTTLHours: 2, // Short TTL — jobs change frequently
  })

  // Enrich matches with full job data
  const matchedJobIds = result.data.matches.map((m) => m.jobId)
  const matchedJobs = jobs.filter((j) => matchedJobIds.includes(j.id))

  const enrichedMatches = result.data.matches
    .map((match) => ({
      ...match,
      job: matchedJobs.find((j) => j.id === match.jobId) || null,
    }))
    .filter((m) => m.job !== null)

  return NextResponse.json({
    success: true,
    data: { matches: enrichedMatches },
    cached: result.cached,
  })
})
```

**Step 2: Commit**

```bash
git add src/app/api/ai/match-jobs/route.ts
git commit -m "feat: add AI intelligent job matching API route"
```

---

### Task 9: AI Routes — Remaining 13 Endpoints (Batch)

**Files:**
- Create: `src/app/api/ai/review-summary/route.ts`
- Create: `src/app/api/ai/chat-suggestions/route.ts`
- Create: `src/app/api/ai/clean-scope/route.ts`
- Create: `src/app/api/ai/profile-writer/route.ts`
- Create: `src/app/api/ai/bid-writer/route.ts`
- Create: `src/app/api/ai/search/route.ts`
- Create: `src/app/api/ai/job-quality-score/route.ts`
- Create: `src/app/api/ai/fraud-check/route.ts`
- Create: `src/app/api/ai/dispute-assist/route.ts`
- Create: `src/app/api/ai/demand-heatmap/route.ts`
- Create: `src/app/api/ai/smart-notification/route.ts`
- Create: `src/app/api/ai/photo-analysis/route.ts`
- Create: `src/app/api/ai/onboarding-tips/route.ts`

Each route follows the exact same pattern as Tasks 6-8:
1. Zod validation of input
2. `withAIAuth` wrapper for auth + error handling
3. Call `callAIJSON` with the appropriate prompt from `AI_PROMPTS`
4. Return `{ success: true, data, cached }`

**Step 1: Create review-summary route**

`src/app/api/ai/review-summary/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'
import { prisma } from '@/lib/db'

const schema = z.object({
  workerId: z.string().min(1),
})

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  const reviews = await prisma.review.findMany({
    where: { subjectId: validation.data.workerId, isPublic: true },
    select: { rating: true, content: true, title: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  if (reviews.length < 3) {
    return NextResponse.json({ success: false, error: 'Not enough reviews for summary (need 3+)' }, { status: 400 })
  }

  const reviewsText = reviews.map((r, i) => `Review ${i + 1}: ${r.rating}★ - ${r.title || ''} ${r.content || ''}`).join('\n')
  const prompt = AI_PROMPTS.reviewSummary(reviewsText)

  const result = await callAIJSON<{
    summary: string
    strengths: string[]
    areasForImprovement: string[]
    keywords: string[]
  }>(prompt, {
    feature: 'review-summary',
    userId: session.user.id,
    cacheKey: { workerId: validation.data.workerId, reviewCount: reviews.length },
    cacheTTLHours: 72,
  })

  return NextResponse.json({ success: true, data: result.data, cached: result.cached })
})
```

**Step 2: Create chat-suggestions route**

`src/app/api/ai/chat-suggestions/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'
import { prisma } from '@/lib/db'

const schema = z.object({
  threadId: z.string().min(1),
})

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  // Verify user is participant
  const participant = await prisma.threadParticipant.findFirst({
    where: { threadId: validation.data.threadId, userId: session.user.id },
  })
  if (!participant) {
    return NextResponse.json({ success: false, error: 'Not a participant' }, { status: 403 })
  }

  // Get recent messages
  const messages = await prisma.message.findMany({
    where: { threadId: validation.data.threadId, isDeleted: false },
    select: { content: true, senderId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  if (messages.length === 0) {
    return NextResponse.json({ success: true, data: { suggestions: [] } })
  }

  const lastMessage = messages[0]
  if (lastMessage.senderId === session.user.id) {
    return NextResponse.json({ success: true, data: { suggestions: [] } })
  }

  const context = messages.reverse().map((m) => `${m.senderId === session.user.id ? 'You' : 'Them'}: ${m.content}`).join('\n')
  const prompt = AI_PROMPTS.chatSuggestions(context, lastMessage.content, session.user.role)

  const result = await callAIJSON<{ suggestions: string[] }>(prompt, {
    feature: 'chat-suggestions',
    userId: session.user.id,
  })

  return NextResponse.json({ success: true, data: result.data })
})
```

**Step 3: Create clean-scope route**

`src/app/api/ai/clean-scope/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'

const schema = z.object({
  description: z.string().min(10).max(2000),
  category: z.string().min(1),
})

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  const prompt = AI_PROMPTS.cleanScope(validation.data.description, validation.data.category)
  const result = await callAIJSON<{
    title: string
    description: string
    tasks: string[]
    estimatedHours: number
    suggestedBudget: { min: number; max: number }
    requiredSkills: string[]
    safetyNotes: string[]
  }>(prompt, {
    feature: 'clean-scope',
    userId: session.user.id,
    cacheKey: { description: validation.data.description.substring(0, 100), category: validation.data.category },
    cacheTTLHours: 48,
  })

  return NextResponse.json({ success: true, data: result.data, cached: result.cached })
})
```

**Step 4: Create profile-writer route**

`src/app/api/ai/profile-writer/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'
import { prisma } from '@/lib/db'

export const POST = withAIAuth(async (_request: NextRequest, session) => {
  if (session.user.role !== 'worker') {
    return NextResponse.json({ success: false, error: 'Only workers can use profile writer' }, { status: 403 })
  }

  const profile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
  })

  if (!profile) {
    return NextResponse.json({ success: false, error: 'Worker profile not found' }, { status: 404 })
  }

  const primaryCategory = profile.skills[0] || 'general services'
  const prompt = AI_PROMPTS.profileWriter(
    profile.skills,
    profile.completedJobs,
    profile.averageRating,
    primaryCategory
  )

  const result = await callAIJSON<{ headline: string; bio: string }>(prompt, {
    feature: 'profile-writer',
    userId: session.user.id,
  })

  return NextResponse.json({ success: true, data: result.data })
})
```

**Step 5: Create bid-writer route**

`src/app/api/ai/bid-writer/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'
import { prisma } from '@/lib/db'

const schema = z.object({ jobId: z.string().min(1) })

export const POST = withAIAuth(async (request: NextRequest, session) => {
  if (session.user.role !== 'worker') {
    return NextResponse.json({ success: false, error: 'Only workers can use bid writer' }, { status: 403 })
  }

  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  const [job, workerProfile] = await Promise.all([
    prisma.job.findUnique({ where: { id: validation.data.jobId }, select: { title: true, description: true, category: true } }),
    prisma.workerProfile.findUnique({ where: { userId: session.user.id } }),
  ])

  if (!job) {
    return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 })
  }

  const prompt = AI_PROMPTS.bidWriter(
    job.title,
    job.description.substring(0, 500),
    workerProfile?.skills || [],
    workerProfile?.averageRating || 0
  )

  const result = await callAIJSON<{ message: string }>(prompt, {
    feature: 'bid-writer',
    userId: session.user.id,
  })

  return NextResponse.json({ success: true, data: result.data })
})
```

**Step 6: Create search route**

`src/app/api/ai/search/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'

const schema = z.object({ query: z.string().min(3).max(200) })

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  const prompt = AI_PROMPTS.searchParse(validation.data.query)

  const result = await callAIJSON<{
    category: string | null
    location: string | null
    budgetMin: number | null
    budgetMax: number | null
    scheduleType: string | null
    skills: string[]
    searchTerms: string
  }>(prompt, {
    feature: 'search',
    userId: session.user.id,
    cacheKey: { query: validation.data.query.toLowerCase().trim() },
    cacheTTLHours: 24,
  })

  return NextResponse.json({ success: true, data: result.data, cached: result.cached })
})
```

**Step 7: Create job-quality-score route**

`src/app/api/ai/job-quality-score/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  budget: z.string(),
  category: z.string().min(1),
})

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  const { title, description, budget, category } = validation.data
  const prompt = AI_PROMPTS.jobQualityScore(title, description, budget, category)

  const result = await callAIJSON<{
    score: number
    improvements: string[]
    strengths: string[]
  }>(prompt, {
    feature: 'job-quality-score',
    userId: session.user.id,
    cacheKey: { title, description: description.substring(0, 100), category },
    cacheTTLHours: 24,
  })

  return NextResponse.json({ success: true, data: result.data, cached: result.cached })
})
```

**Step 8: Create fraud-check route**

`src/app/api/ai/fraud-check/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'
import { prisma } from '@/lib/db'

const schema = z.object({ content: z.string().min(1), contentType: z.enum(['job', 'bid', 'review']) })

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  // Get user history for context
  const [jobCount, bidCount, reviewCount] = await Promise.all([
    prisma.job.count({ where: { posterId: session.user.id } }),
    prisma.bid.count({ where: { workerId: session.user.id } }),
    prisma.review.count({ where: { authorId: session.user.id } }),
  ])

  const userHistory = `Jobs posted: ${jobCount}, Bids made: ${bidCount}, Reviews written: ${reviewCount}`
  const prompt = AI_PROMPTS.fraudCheck(validation.data.content, userHistory)

  const result = await callAIJSON<{
    riskLevel: string
    flags: string[]
    recommendation: string
  }>(prompt, {
    feature: 'fraud-check',
    userId: session.user.id,
  })

  return NextResponse.json({ success: true, data: result.data })
})
```

**Step 9: Create dispute-assist route**

`src/app/api/ai/dispute-assist/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'
import { prisma } from '@/lib/db'

const schema = z.object({ bookingId: z.string().min(1), issue: z.string().min(10).max(1000) })

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: validation.data.bookingId,
      OR: [{ hirerId: session.user.id }, { workerId: session.user.id }],
    },
    include: {
      job: { select: { title: true, description: true, category: true } },
    },
  })

  if (!booking) {
    return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
  }

  const prompt = AI_PROMPTS.disputeAssist(
    `${booking.job.title}: ${booking.job.description.substring(0, 300)}`,
    `Booking status: ${booking.status}, Agreed amount: $${booking.agreedAmount}`,
    validation.data.issue
  )

  const result = await callAIJSON<{
    analysis: string
    suggestedResolution: string
    forHirer: string
    forWorker: string
  }>(prompt, {
    feature: 'dispute-assist',
    userId: session.user.id,
  })

  return NextResponse.json({ success: true, data: result.data })
})
```

**Step 10: Create demand-heatmap route**

`src/app/api/ai/demand-heatmap/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'
import { prisma } from '@/lib/db'

const schema = z.object({ location: z.string().min(1) })

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  // Get recent job data for the area
  const recentJobs = await prisma.job.groupBy({
    by: ['category'],
    where: {
      status: 'posted',
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })

  const jobData = recentJobs.map((j) => `${j.category}: ${j._count.id} jobs`).join(', ')
  const prompt = AI_PROMPTS.demandHeatmap(jobData, validation.data.location)

  const result = await callAIJSON<{
    hotCategories: Array<{ category: string; demand: string; trend: string }>
    insights: string[]
    recommendation: string
  }>(prompt, {
    feature: 'demand-heatmap',
    userId: session.user.id,
    cacheKey: { location: validation.data.location, jobData },
    cacheTTLHours: 6,
  })

  return NextResponse.json({ success: true, data: result.data, cached: result.cached })
})
```

**Step 11: Create smart-notification route**

`src/app/api/ai/smart-notification/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'

const schema = z.object({
  eventType: z.string().min(1),
  eventData: z.string().min(1),
  recipientRole: z.enum(['hirer', 'worker']),
})

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  const { eventType, eventData, recipientRole } = validation.data
  const prompt = AI_PROMPTS.smartNotification(eventType, eventData, recipientRole)

  const result = await callAIJSON<{ title: string; body: string }>(prompt, {
    feature: 'smart-notification',
    userId: session.user.id,
    cacheKey: { eventType, eventData: eventData.substring(0, 50) },
    cacheTTLHours: 24,
  })

  return NextResponse.json({ success: true, data: result.data, cached: result.cached })
})
```

**Step 12: Create photo-analysis route**

`src/app/api/ai/photo-analysis/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'

const schema = z.object({ jobDescription: z.string().min(10).max(2000) })

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  const prompt = AI_PROMPTS.photoAnalysis(validation.data.jobDescription)

  const result = await callAIJSON<{
    expectedElements: string[]
    verificationPrompt: string
  }>(prompt, {
    feature: 'photo-analysis',
    userId: session.user.id,
    cacheKey: { desc: validation.data.jobDescription.substring(0, 100) },
    cacheTTLHours: 72,
  })

  return NextResponse.json({ success: true, data: result.data, cached: result.cached })
})
```

**Step 13: Create onboarding-tips route**

`src/app/api/ai/onboarding-tips/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { callAIJSON, AI_PROMPTS } from '@/lib/ai'
import { withAIAuth } from '@/lib/ai/api-handler'

const schema = z.object({
  currentStep: z.string().min(1),
  profileCompleteness: z.number().min(0).max(100),
})

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json()
  const validation = schema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
  }

  const prompt = AI_PROMPTS.onboardingTips(
    session.user.role,
    validation.data.currentStep,
    validation.data.profileCompleteness
  )

  const result = await callAIJSON<{
    tip: string
    nextAction: string
    motivation: string
  }>(prompt, {
    feature: 'onboarding-tips',
    userId: session.user.id,
  })

  return NextResponse.json({ success: true, data: result.data })
})
```

**Step 14: Commit all remaining AI routes**

```bash
git add src/app/api/ai/
git commit -m "feat: add all 16 AI API routes (pricing, matching, search, chat, fraud, etc.)"
```

---

## Phase 3: Stripe Connect Integration

### Task 10: Create Stripe Library and Payment APIs

**Files:**
- Create: `src/lib/stripe.ts`
- Create: `src/app/api/payments/create-intent/route.ts`
- Create: `src/app/api/payments/confirm/route.ts`
- Create: `src/app/api/payments/webhook/route.ts`
- Create: `src/app/api/payments/connect/route.ts`
- Create: `src/app/api/payments/payout/route.ts`
- Create: `src/app/api/payments/refund/route.ts`

**Step 1: Create Stripe client singleton**

`src/lib/stripe.ts`:
```typescript
import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  }
  return stripeInstance
}
```

**Step 2: Create payment intent route (escrow)**

`src/app/api/payments/create-intent/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { z } from 'zod'

const schema = z.object({ bookingId: z.string().min(1) })

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = schema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
    }

    const booking = await prisma.booking.findFirst({
      where: { id: validation.data.bookingId, hirerId: session.user.id },
      include: { job: { select: { title: true } } },
    })

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    if (booking.paymentStatus !== 'pending') {
      return NextResponse.json({ success: false, error: 'Payment already processed' }, { status: 400 })
    }

    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.agreedAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: booking.id,
        hirerId: session.user.id,
        workerId: booking.workerId,
        jobTitle: booking.job.title,
      },
      capture_method: 'manual', // Hold funds — capture on job completion
    })

    // Record the payment intent
    await prisma.paymentRecord.create({
      data: {
        bookingId: booking.id,
        userId: session.user.id,
        amount: booking.agreedAmount,
        type: 'escrow_hold',
        status: 'pending',
        externalId: paymentIntent.id,
        provider: 'stripe',
      },
    })

    return NextResponse.json({
      success: true,
      data: { clientSecret: paymentIntent.client_secret },
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create payment' }, { status: 500 })
  }
}
```

**Step 3: Create payment confirm route**

`src/app/api/payments/confirm/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { z } from 'zod'

const schema = z.object({ bookingId: z.string().min(1) })

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = schema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
    }

    const booking = await prisma.booking.findFirst({
      where: { id: validation.data.bookingId, hirerId: session.user.id, status: 'completed' },
    })

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found or not completed' }, { status: 404 })
    }

    // Find the escrow payment record
    const paymentRecord = await prisma.paymentRecord.findFirst({
      where: { bookingId: booking.id, type: 'escrow_hold', status: 'pending' },
    })

    if (!paymentRecord?.externalId) {
      return NextResponse.json({ success: false, error: 'No pending payment found' }, { status: 400 })
    }

    // Capture the held payment
    const stripe = getStripe()
    await stripe.paymentIntents.capture(paymentRecord.externalId)

    // Update payment record
    await prisma.paymentRecord.update({
      where: { id: paymentRecord.id },
      data: { status: 'completed', processedAt: new Date() },
    })

    // Update booking payment status
    await prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: 'paid', finalAmount: booking.agreedAmount },
    })

    // Update worker earnings
    await prisma.workerProfile.updateMany({
      where: { userId: booking.workerId },
      data: { totalEarnings: { increment: booking.agreedAmount } },
    })

    return NextResponse.json({ success: true, data: { status: 'captured' } })
  } catch (error) {
    console.error('Payment confirm error:', error)
    return NextResponse.json({ success: false, error: 'Failed to confirm payment' }, { status: 500 })
  }
}
```

**Step 4: Create Stripe webhook handler**

`src/app/api/payments/webhook/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object
      await prisma.paymentRecord.updateMany({
        where: { externalId: paymentIntent.id },
        data: { status: 'completed', processedAt: new Date() },
      })
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object
      await prisma.paymentRecord.updateMany({
        where: { externalId: paymentIntent.id },
        data: { status: 'failed' },
      })
      break
    }

    case 'account.updated': {
      // Stripe Connect account updates
      const account = event.data.object
      if (account.charges_enabled && account.payouts_enabled) {
        // Worker's Stripe account is fully onboarded
        console.log(`Stripe Connect account ${account.id} is now active`)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
```

**Step 5: Create Stripe Connect onboarding route**

`src/app/api/payments/connect/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'worker') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const stripe = getStripe()
    const { returnUrl } = await request.json()

    // Create connected account
    const account = await stripe.accounts.create({
      type: 'express',
      email: session.user.email || undefined,
      metadata: { userId: session.user.id },
    })

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/work/settings/payout?refresh=true`,
      return_url: `${returnUrl || process.env.NEXT_PUBLIC_APP_URL}/work/settings/payout?success=true`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      success: true,
      data: { url: accountLink.url, accountId: account.id },
    })
  } catch (error) {
    console.error('Stripe Connect error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create Stripe account' }, { status: 500 })
  }
}
```

**Step 6: Create payout route**

`src/app/api/payments/payout/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({ amount: z.number().positive() })

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'worker') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = schema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
    }

    // For now, record the payout request
    // Full Stripe Transfer implementation requires connected account ID stored on WorkerProfile
    return NextResponse.json({
      success: true,
      data: {
        status: 'pending',
        message: 'Payout request submitted. Connect your Stripe account in settings to receive payouts.',
      },
    })
  } catch (error) {
    console.error('Payout error:', error)
    return NextResponse.json({ success: false, error: 'Failed to process payout' }, { status: 500 })
  }
}
```

**Step 7: Create refund route**

`src/app/api/payments/refund/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { z } from 'zod'

const schema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().min(10).max(500),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = schema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 })
    }

    const booking = await prisma.booking.findFirst({
      where: { id: validation.data.bookingId, hirerId: session.user.id },
    })

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    const paymentRecord = await prisma.paymentRecord.findFirst({
      where: { bookingId: booking.id, status: 'completed' },
    })

    if (!paymentRecord?.externalId) {
      return NextResponse.json({ success: false, error: 'No completed payment to refund' }, { status: 400 })
    }

    const stripe = getStripe()
    const refund = await stripe.refunds.create({
      payment_intent: paymentRecord.externalId,
      reason: 'requested_by_customer',
    })

    await prisma.paymentRecord.create({
      data: {
        bookingId: booking.id,
        userId: session.user.id,
        amount: -paymentRecord.amount,
        type: 'refund',
        status: 'completed',
        externalId: refund.id,
        provider: 'stripe',
        description: validation.data.reason,
        processedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: { status: 'refunded' } })
  } catch (error) {
    console.error('Refund error:', error)
    return NextResponse.json({ success: false, error: 'Failed to process refund' }, { status: 500 })
  }
}
```

**Step 8: Commit**

```bash
git add src/lib/stripe.ts src/app/api/payments/
git commit -m "feat: add Stripe Connect payment processing (escrow, capture, webhook, connect, payout, refund)"
```

---

## Phase 4: Real-Time SSE, Location Search, File Uploads

### Task 11: Server-Sent Events Endpoint

**Files:**
- Create: `src/app/api/sse/route.ts`
- Create: `src/lib/sse.ts`

**Step 1: Create SSE event emitter**

`src/lib/sse.ts`:
```typescript
type SSEClient = {
  userId: string
  controller: ReadableStreamDefaultController
}

class SSEManager {
  private clients: Map<string, Set<SSEClient>> = new Map()

  addClient(userId: string, controller: ReadableStreamDefaultController): SSEClient {
    const client: SSEClient = { userId, controller }
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set())
    }
    this.clients.get(userId)!.add(client)
    return client
  }

  removeClient(client: SSEClient): void {
    const userClients = this.clients.get(client.userId)
    if (userClients) {
      userClients.delete(client)
      if (userClients.size === 0) {
        this.clients.delete(client.userId)
      }
    }
  }

  sendToUser(userId: string, event: string, data: unknown): void {
    const userClients = this.clients.get(userId)
    if (!userClients) return

    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
    const encoder = new TextEncoder()

    for (const client of userClients) {
      try {
        client.controller.enqueue(encoder.encode(message))
      } catch {
        this.removeClient(client)
      }
    }
  }
}

export const sseManager = new SSEManager()
```

**Step 2: Create SSE endpoint**

`src/app/api/sse/route.ts`:
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sseManager } from '@/lib/sse'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = session.user.id

  const stream = new ReadableStream({
    start(controller) {
      const client = sseManager.addClient(userId, controller)

      // Send initial connection confirmation
      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`))

      // Keepalive every 30 seconds
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`))
        } catch {
          clearInterval(keepalive)
          sseManager.removeClient(client)
        }
      }, 30000)

      // Cleanup on close
      const cleanup = () => {
        clearInterval(keepalive)
        sseManager.removeClient(client)
      }

      // AbortController not available in ReadableStream start, so we rely on enqueue failures
      return cleanup
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

**Step 3: Commit**

```bash
git add src/lib/sse.ts src/app/api/sse/route.ts
git commit -m "feat: add Server-Sent Events for real-time updates"
```

---

### Task 12: Location-Based Job Search API

**Files:**
- Create: `src/app/api/jobs/nearby/route.ts`

**Step 1: Create nearby jobs route with Haversine distance**

`src/app/api/jobs/nearby/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(100).default(25), // miles
  category: z.string().optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(new URL(request.url).searchParams)
    const validation = schema.safeParse(params)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { lat, lng, radius, category, budgetMin, budgetMax, limit, offset } = validation.data

    // Haversine distance query using raw SQL for performance
    const radiusKm = radius * 1.60934 // miles to km

    const categoryFilter = category ? `AND j.category = '${category.replace(/'/g, "''")}'` : ''
    const budgetMinFilter = budgetMin ? `AND (j."budgetMin" >= ${budgetMin} OR j."budgetMax" >= ${budgetMin})` : ''
    const budgetMaxFilter = budgetMax ? `AND (j."budgetMax" <= ${budgetMax} OR j."budgetMin" <= ${budgetMax})` : ''

    const jobs = await prisma.$queryRawUnsafe<Array<{
      id: string
      title: string
      description: string
      category: string
      address: string
      city: string | null
      lat: number
      lng: number
      budgetType: string
      budgetMin: number | null
      budgetMax: number | null
      scheduleType: string
      status: string
      bidCount: number
      createdAt: Date
      distance: number
      posterName: string | null
      posterAvatar: string | null
      posterRating: number | null
    }>>(
      `SELECT
        j.id, j.title, j.description, j.category, j.address, j.city,
        j.lat, j.lng, j."budgetType", j."budgetMin", j."budgetMax",
        j."scheduleType", j.status, j."bidCount", j."createdAt",
        u.name as "posterName", u."avatarUrl" as "posterAvatar",
        hp."averageRating" as "posterRating",
        (6371 * acos(
          cos(radians(${lat})) * cos(radians(j.lat)) *
          cos(radians(j.lng) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(j.lat))
        )) as distance
      FROM "Job" j
      LEFT JOIN "User" u ON j."posterId" = u.id
      LEFT JOIN "HirerProfile" hp ON hp."userId" = u.id
      WHERE j.status = 'posted'
        ${categoryFilter}
        ${budgetMinFilter}
        ${budgetMaxFilter}
      HAVING (6371 * acos(
        cos(radians(${lat})) * cos(radians(j.lat)) *
        cos(radians(j.lng) - radians(${lng})) +
        sin(radians(${lat})) * sin(radians(j.lat))
      )) <= ${radiusKm}
      ORDER BY distance ASC
      LIMIT ${limit} OFFSET ${offset}`
    )

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: { limit, offset, hasMore: jobs.length === limit },
    })
  } catch (error) {
    console.error('Nearby jobs error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch nearby jobs' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/jobs/nearby/route.ts
git commit -m "feat: add location-based job search with Haversine distance calculation"
```

---

### Task 13: File Upload API

**Files:**
- Create: `src/app/api/upload/route.ts`

**Step 1: Create upload route**

`src/app/api/upload/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const purpose = formData.get('purpose') as string | null // 'avatar', 'job-photo', 'completion-proof'

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'File type not allowed. Use JPG, PNG, or WebP' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'File too large. Max 5MB' }, { status: 400 })
    }

    const folder = purpose || 'general'
    const filename = `${session.user.id}/${folder}/${Date.now()}-${file.name}`

    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    return NextResponse.json({
      success: true,
      data: { url: blob.url, pathname: blob.pathname },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, error: 'Failed to upload file' }, { status: 500 })
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/upload/route.ts
git commit -m "feat: add file upload API with Vercel Blob storage"
```

---

## Phase 5: Wire Mock Pages to Real APIs

### Task 14: Wire Worker Jobs Page to Real API

**Files:**
- Modify: `src/app/work/jobs/page.tsx` — Replace mock data with API calls

**Step 1: Read the current file, then replace mock data with real API fetching**

The current file has ~373 lines with hardcoded mockJobs (lines 13-125). Replace the mock data array and the filtering logic with:

1. Remove the `mockJobs` array entirely
2. Add `useState` for loading/error states
3. Add `useEffect` that calls `/api/jobs?status=posted` on mount and when filters change
4. Add skeleton loading cards while data loads
5. Wire the AI search bar to `/api/ai/search` for natural language parsing
6. Add infinite scroll pagination
7. Add "AI Recommended" section at top that calls `/api/ai/match-jobs`

This is a large file rewrite — implement the full page with real API integration, skeleton loading states, and the AI features integrated into the search and recommendations sections.

**Step 2: Commit**

```bash
git add src/app/work/jobs/page.tsx
git commit -m "feat: wire worker jobs page to real API with AI search and recommendations"
```

---

### Task 15: Wire Worker Earnings Page to Real Data

**Files:**
- Modify: `src/app/work/earnings/page.tsx` — Replace mock data with real PaymentRecord + Booking queries

**Step 1: Replace mock earnings data with real API calls**

1. Create a new API route `/api/earnings/route.ts` that returns:
   - Available balance (sum of completed bookings minus withdrawn amounts)
   - Monthly earnings (current month)
   - Total earned (lifetime)
   - Transaction history from PaymentRecord
2. Wire the earnings page to this API
3. Add Recharts area chart for 30-day earnings trend
4. Wire withdrawal button to `/api/payments/payout`

**Step 2: Commit**

```bash
git add src/app/work/earnings/page.tsx src/app/api/earnings/route.ts
git commit -m "feat: wire earnings page to real payment data with Recharts chart"
```

---

## Phase 6: Premium UI Overhaul

### Task 16: Build Hirer Dashboard

**Files:**
- Modify: `src/app/hiring/page.tsx` — Full rebuild from redirect stub

**Step 1: Build the full hirer dashboard**

Replace the 23-line redirect with a full dashboard page:

1. Stats row (4 GlassPanel cards): Active Jobs, Total Spent, Open Bids, Avg Rating
   - Fetch from `/api/jobs?mine=true` and `/api/profile`
   - Use gradient backgrounds matching the brand colors
2. Recent activity feed (last 5 notifications)
   - Fetch from `/api/notifications?limit=5`
   - Show icons + timestamps + action links
3. Quick actions grid: Post Job, View Bids, Messages, Settings
   - Gradient accent buttons with Lucide icons
4. AI insight card
   - Call `/api/ai/demand-heatmap` for local insights
   - Show in a FeatureCard component with subtle glow

Follow the existing design patterns:
- Glass morphism panels (`bg-slate-900/80 backdrop-blur-md border border-white/5`)
- Brand color gradients (`from-cyan-500 to-blue-600`)
- Stagger animations with Framer Motion
- Skeleton loading states while APIs load
- Mobile-responsive grid (1 col mobile, 2 col tablet, 4 col desktop)

**Step 2: Commit**

```bash
git add src/app/hiring/page.tsx
git commit -m "feat: build full hirer dashboard with stats, activity feed, and AI insights"
```

---

### Task 17: Build Worker Dashboard

**Files:**
- Modify: `src/app/work/page.tsx` — Full rebuild from redirect stub

**Step 1: Build the full worker dashboard**

Replace the 23-line redirect with a full dashboard:

1. Earnings summary card with sparkline (Recharts)
   - Available balance in large text
   - 7-day earnings trend mini-chart
   - "View Earnings" link
2. "Recommended for You" section
   - Call `/api/ai/match-jobs`
   - Show top 3 matched job cards with match score badges
   - "View All Jobs" link
3. Active bids tracker
   - Fetch from `/api/bids`
   - Show pending/accepted/rejected counts with colored badges
4. Quick actions: Browse Jobs, Messages, Earnings, Profile
5. Demand insights card
   - Call `/api/ai/demand-heatmap` with worker's location
   - Show hot categories and trends
6. AI onboarding coach (conditional: show if completedJobs < 3)
   - Call `/api/ai/onboarding-tips`
   - Show tip card with next action suggestion

Same design patterns as hirer dashboard:
- Glass panels, brand gradients, stagger animations
- Emerald color scheme for worker mode
- Skeleton states, mobile-responsive grid

**Step 2: Commit**

```bash
git add src/app/work/page.tsx
git commit -m "feat: build full worker dashboard with earnings, AI recommendations, and insights"
```

---

### Task 18: Upgrade Job Posting Form (Multi-Step Wizard)

**Files:**
- Modify: `src/app/hiring/post/page.tsx` — Rebuild as multi-step wizard with AI assist

**Step 1: Rebuild as 4-step wizard**

Replace the current single-page form with a multi-step wizard:

**Step indicator bar** at top showing: Category & Description → Location & Schedule → Budget & Photos → Review & Post

**Step 1 UI: Category & Description**
- Category grid (same as current but with Lucide icons instead of emoji)
- Brief description textarea
- "Generate with AI" button → calls `/api/ai/generate-description`
- Shows AI-generated title + full description in editable fields
- "Clean Scope" button → calls `/api/ai/clean-scope`
- Shows structured task list, estimated hours

**Step 2 UI: Location & Schedule**
- Address autocomplete (existing AddressAutocomplete component)
- Map preview showing selected location pin
- Schedule type selector (ASAP / This Week / Specific Date)
- Date picker for specific dates
- Estimated hours input

**Step 3 UI: Budget & Photos**
- AI pricing suggestion → calls `/api/ai/pricing-suggestion`
- Shows suggested range with "Accept" button
- Budget type toggle (Hourly / Fixed / Bidding)
- Min/max range inputs or slider
- Photo upload area (drag & drop or click)
- Upload to `/api/upload` with purpose='job-photo'
- Photo previews with remove button

**Step 4 UI: Review & Post**
- Full preview of the job posting
- AI Job Quality Score → calls `/api/ai/job-quality-score`
- Shows score (1-10) with improvement suggestions
- "Improve" buttons that auto-apply suggestions
- "Post Job" button with loading state
- Success animation on completion

Use `react-hook-form` with Zod schema validation per step.
Use `useJobFormStore` for draft persistence between steps.
Framer Motion for step transitions (slide left/right).

**Step 2: Commit**

```bash
git add src/app/hiring/post/page.tsx
git commit -m "feat: rebuild job posting as 4-step wizard with AI description, pricing, and quality scoring"
```

---

### Task 19: Add Skeleton Components and Micro-Interactions

**Files:**
- Create: `src/components/ui/Skeleton.tsx`
- Create: `src/components/ui/StaggerList.tsx`

**Step 1: Create Skeleton component**

`src/components/ui/Skeleton.tsx`:
```typescript
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-800/60 rounded'

  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'h-48 w-full rounded-2xl',
  }

  return <div className={cn(baseClasses, variants[variant], className)} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-white/5 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonJobCard() {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-white/5 p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-2xl bg-slate-900/80 border border-white/5 p-6 space-y-3">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}
```

**Step 2: Create StaggerList animation wrapper**

`src/components/ui/StaggerList.tsx`:
```typescript
'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerListProps {
  children: ReactNode[]
  delay?: number
  className?: string
}

export function StaggerList({ children, delay = 0.05, className }: StaggerListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

export function FadeIn({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
```

**Step 3: Commit**

```bash
git add src/components/ui/Skeleton.tsx src/components/ui/StaggerList.tsx
git commit -m "feat: add Skeleton loading components and StaggerList animation wrapper"
```

---

### Task 20: Add SSE Client Hook for Real-Time Updates

**Files:**
- Create: `src/hooks/useSSE.ts`

**Step 1: Create SSE client hook**

`src/hooks/useSSE.ts`:
```typescript
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useNotificationsStore, useMessagesStore } from '@/store'

type SSEEventHandler = (data: unknown) => void

export function useSSE() {
  const eventSourceRef = useRef<EventSource | null>(null)
  const handlersRef = useRef<Map<string, SSEEventHandler>>(new Map())
  const addNotification = useNotificationsStore((s) => s.addNotification)
  const reconnectAttempts = useRef(0)

  const connect = useCallback(() => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) return

    const es = new EventSource('/api/sse')
    eventSourceRef.current = es

    es.addEventListener('connected', () => {
      reconnectAttempts.current = 0
    })

    es.addEventListener('new-message', (e) => {
      const data = JSON.parse(e.data)
      handlersRef.current.get('new-message')?.(data)
    })

    es.addEventListener('bid-received', (e) => {
      const data = JSON.parse(e.data)
      addNotification({
        id: `bid-${Date.now()}`,
        type: 'bid_received',
        title: data.title || 'New bid received',
        body: data.body || 'A worker submitted a bid on your job',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
      handlersRef.current.get('bid-received')?.(data)
    })

    es.addEventListener('bid-accepted', (e) => {
      const data = JSON.parse(e.data)
      addNotification({
        id: `bid-accept-${Date.now()}`,
        type: 'bid_accepted',
        title: data.title || 'Bid accepted',
        body: data.body || 'Your bid was accepted!',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
      handlersRef.current.get('bid-accepted')?.(data)
    })

    es.addEventListener('job-status-change', (e) => {
      const data = JSON.parse(e.data)
      handlersRef.current.get('job-status-change')?.(data)
    })

    es.addEventListener('payment-received', (e) => {
      const data = JSON.parse(e.data)
      addNotification({
        id: `payment-${Date.now()}`,
        type: 'payment',
        title: data.title || 'Payment received',
        body: data.body || 'You received a payment',
        isRead: false,
        createdAt: new Date().toISOString(),
      })
      handlersRef.current.get('payment-received')?.(data)
    })

    es.onerror = () => {
      es.close()
      // Exponential backoff reconnect
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
      reconnectAttempts.current++
      setTimeout(connect, delay)
    }
  }, [addNotification])

  const on = useCallback((event: string, handler: SSEEventHandler) => {
    handlersRef.current.set(event, handler)
  }, [])

  useEffect(() => {
    connect()
    return () => {
      eventSourceRef.current?.close()
    }
  }, [connect])

  return { on }
}
```

**Step 2: Commit**

```bash
git add src/hooks/useSSE.ts
git commit -m "feat: add useSSE hook for real-time event handling with auto-reconnect"
```

---

### Task 21: Create Earnings Chart Component

**Files:**
- Create: `src/components/charts/EarningsChart.tsx`

**Step 1: Create the Recharts earnings chart**

`src/components/charts/EarningsChart.tsx`:
```typescript
'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface EarningsChartProps {
  data: Array<{ date: string; amount: number }>
  height?: number
  showAxis?: boolean
}

export function EarningsChart({ data, height = 200, showAxis = true }: EarningsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        {showAxis && (
          <>
            <XAxis
              dataKey="date"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
          </>
        )}
        <Tooltip
          contentStyle={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            color: '#e2e8f0',
            fontSize: '13px',
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
        />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#earningsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function EarningsSparkline({ data }: { data: Array<{ date: string; amount: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <defs>
          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#10b981"
          strokeWidth={1.5}
          fill="url(#sparkGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

**Step 2: Commit**

```bash
git add src/components/charts/EarningsChart.tsx
git commit -m "feat: add EarningsChart and EarningsSparkline components with Recharts"
```

---

### Task 22: Add AI Hooks for Frontend Integration

**Files:**
- Create: `src/hooks/useAI.ts`

**Step 1: Create reusable AI hooks**

`src/hooks/useAI.ts`:
```typescript
'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

interface UseAIOptions {
  onSuccess?: (data: unknown) => void
  onError?: (error: string) => void
  showErrorToast?: boolean
}

export function useAI<T>(endpoint: string, options: UseAIOptions = {}) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const call = useCallback(
    async (body?: unknown) => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/ai/${endpoint}`, {
          method: body ? 'POST' : 'GET',
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        })

        const result = await response.json()

        if (!result.success) {
          const errMsg =
            result.code === 'RATE_LIMIT'
              ? 'AI usage limit reached for today. Try again tomorrow.'
              : result.code === 'NOT_CONFIGURED'
                ? 'AI features are not yet configured.'
                : result.error || 'AI request failed'

          setError(errMsg)
          if (options.showErrorToast !== false) {
            toast.error(errMsg)
          }
          options.onError?.(errMsg)
          return null
        }

        setData(result.data)
        options.onSuccess?.(result.data)
        return result.data as T
      } catch {
        const errMsg = 'Failed to connect to AI service'
        setError(errMsg)
        if (options.showErrorToast !== false) {
          toast.error(errMsg)
        }
        options.onError?.(errMsg)
        return null
      } finally {
        setLoading(false)
      }
    },
    [endpoint, options]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
  }, [])

  return { data, loading, error, call, reset }
}

// Convenience hooks for specific AI features
export function useAIPricing() {
  return useAI<{ minPrice: number; maxPrice: number; confidence: string; reasoning: string }>('pricing-suggestion')
}

export function useAIDescription() {
  return useAI<{ title: string; description: string; estimatedHours: number; suggestedSkills: string[] }>('generate-description')
}

export function useAIJobMatches() {
  return useAI<{ matches: Array<{ jobId: string; score: number; reason: string; job: unknown }> }>('match-jobs')
}

export function useAIChatSuggestions() {
  return useAI<{ suggestions: string[] }>('chat-suggestions')
}

export function useAIBidWriter() {
  return useAI<{ message: string }>('bid-writer')
}

export function useAIProfileWriter() {
  return useAI<{ headline: string; bio: string }>('profile-writer')
}

export function useAISearch() {
  return useAI<{
    category: string | null
    location: string | null
    budgetMin: number | null
    budgetMax: number | null
    scheduleType: string | null
    skills: string[]
    searchTerms: string
  }>('search')
}

export function useAIJobQuality() {
  return useAI<{ score: number; improvements: string[]; strengths: string[] }>('job-quality-score')
}

export function useAIDemandHeatmap() {
  return useAI<{
    hotCategories: Array<{ category: string; demand: string; trend: string }>
    insights: string[]
    recommendation: string
  }>('demand-heatmap')
}

export function useAIOnboardingTips() {
  return useAI<{ tip: string; nextAction: string; motivation: string }>('onboarding-tips')
}
```

**Step 2: Commit**

```bash
git add src/hooks/useAI.ts
git commit -m "feat: add useAI hooks for frontend AI integration"
```

---

### Task 23: Update next.config.js for New Features

**Files:**
- Modify: `next.config.js`

**Step 1: Add Vercel Blob and Stripe domains to image config**

Add `'*.public.blob.vercel-storage.com'` to image domains. Add `serverExternalPackages` for Stripe webhook body parsing:

```javascript
const nextConfig = {
  images: {
    domains: ['api.mapbox.com', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Increased for file uploads
    },
  },
  // ... keep existing redirects
}
```

**Step 2: Commit**

```bash
git add next.config.js
git commit -m "feat: update Next.js config for Vercel Blob images and larger upload limit"
```

---

## Phase 7: Integration and Polish

### Task 24: Integrate AI into Existing Job Creation Flow

**Files:**
- Modify: `src/app/api/jobs/route.ts` — Add auto fraud-check and quality score on job creation

**Step 1: Add AI hooks to POST handler**

After the job is created successfully (around line 245), add:

```typescript
// Auto-run AI fraud check and quality score (non-blocking)
Promise.allSettled([
  fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/fraud-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: request.headers.get('cookie') || '' },
    body: JSON.stringify({
      content: `${data.title} ${data.description}`,
      contentType: 'job',
    }),
  }),
]).catch(() => {}) // Fire and forget — don't block job creation
```

**Step 2: Commit**

```bash
git add src/app/api/jobs/route.ts
git commit -m "feat: integrate AI fraud check into job creation flow"
```

---

### Task 25: Integrate AI Chat Suggestions into Messaging UI

**Files:**
- Modify: the messaging page component (find at `src/app/hiring/messages/page.tsx` or `src/app/work/messages/page.tsx`)

**Step 1: Add AI chat suggestion buttons**

In the message input area, add:
1. A "Quick Reply" button that triggers `/api/ai/chat-suggestions`
2. Show 3 suggestion chips above the input
3. Clicking a chip fills the input with the suggestion text
4. User can edit before sending

**Step 2: Commit**

```bash
git add src/app/hiring/messages/page.tsx src/app/work/messages/page.tsx
git commit -m "feat: add AI quick reply suggestions to messaging UI"
```

---

### Task 26: Add AI Profile Writer to Worker Profile

**Files:**
- Modify: `src/app/work/profile/page.tsx`

**Step 1: Add "Generate with AI" button to profile editor**

In the headline and bio fields section, add:
1. "Generate with AI" button next to headline field
2. Calls `/api/ai/profile-writer`
3. Shows generated headline + bio in a preview card
4. "Use This" button fills the form fields
5. "Try Again" button regenerates

**Step 2: Commit**

```bash
git add src/app/work/profile/page.tsx
git commit -m "feat: add AI profile writer to worker profile page"
```

---

### Task 27: Add AI Bid Writer to Bid Submission

**Files:**
- Find and modify the bid submission component/page

**Step 1: Add "Draft with AI" button to bid form**

In the bid message textarea:
1. "Draft with AI" button calls `/api/ai/bid-writer` with the jobId
2. Shows generated message in textarea
3. Worker can edit before submitting
4. Subtle "(AI-assisted)" label if AI was used

**Step 2: Commit**

```bash
git add [bid-related files]
git commit -m "feat: add AI bid writer to bid submission flow"
```

---

### Task 28: Final Build Verification

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Fix any build errors**

Address any TypeScript or build errors that surface.

**Step 4: Final commit**

```bash
git add -A
git commit -m "fix: resolve build errors from comprehensive upgrade"
```

---

## Summary

| Phase | Tasks | New Files | Modified Files |
|-------|-------|-----------|----------------|
| 1. Foundation | 1-4 | 7 | 3 |
| 2. AI Routes | 5-9 | 14 | 0 |
| 3. Payments | 10 | 7 | 0 |
| 4. Real-time + Location + Upload | 11-13 | 4 | 0 |
| 5. Wire Mock Pages | 14-15 | 1 | 2 |
| 6. Premium UI | 16-22 | 6 | 2 |
| 7. Integration + Polish | 23-28 | 0 | 5 |
| **Total** | **28** | **~39** | **~12** |

**Estimated new API routes:** 23 (16 AI + 6 payments + 1 nearby jobs)
**Estimated new components:** 5 (Skeleton, StaggerList, EarningsChart, EarningsSparkline)
**Estimated new hooks:** 2 (useSSE, useAI)
**New library code:** AI provider layer (6 files), Stripe client, SSE manager
