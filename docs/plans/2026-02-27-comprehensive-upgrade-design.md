# CrewLink Comprehensive Upgrade Design

**Date:** 2026-02-27
**Scope:** Full-stack upgrade — AI integration, backend APIs, premium UI
**AI Provider:** Google Gemini (free tier), provider-agnostic architecture
**Payments:** Stripe Connect (full integration)

---

## Layer 1: AI Integration (16 Features)

### Architecture

Provider-agnostic AI service layer at `src/lib/ai/`:

| File | Purpose |
|------|---------|
| `provider.ts` | Abstract AI interface — swap Gemini for Claude/GPT later |
| `gemini.ts` | Google Gemini client using `@google/generative-ai` |
| `prompts.ts` | All system prompts centralized |
| `cache.ts` | Response caching (Prisma-backed, 48hr TTL) |
| `rate-limit.ts` | Per-user rate limiting (in-memory + DB fallback) |
| `cost-tracker.ts` | Usage tracking per feature per user |

### AI API Routes

All under `/api/ai/`:

| # | Route | Feature | Rate Limit | Trigger |
|---|-------|---------|------------|---------|
| 1 | `/api/ai/pricing-suggestion` | Smart pricing from category + location + description | 10/day | Job post form |
| 2 | `/api/ai/generate-description` | Full job description from brief input | 5/day | Job post form |
| 3 | `/api/ai/match-jobs` | Personalized job rankings for workers | 20/day | Worker dashboard |
| 4 | `/api/ai/review-summary` | Aggregate review themes for a worker | 10/day | Profile view |
| 5 | `/api/ai/chat-suggestions` | Context-aware quick replies in messaging | 30/day | Message thread |
| 6 | `/api/ai/clean-scope` | Structured scope from rough description | 10/day | Job post form |
| 7 | `/api/ai/profile-writer` | Professional headline + bio for workers | 3/day | Worker profile |
| 8 | `/api/ai/bid-writer` | Personalized bid message draft | 15/day | Bid submission |
| 9 | `/api/ai/search` | Natural language → structured job filters | 30/day | Job search bar |
| 10 | `/api/ai/job-quality-score` | Score + improvement suggestions for job posts | Auto | Job creation |
| 11 | `/api/ai/fraud-check` | Spam/fraud pattern detection | Auto | Job/bid creation |
| 12 | `/api/ai/dispute-assist` | Mediation suggestions from conversation context | 5/day | Dispute flow |
| 13 | `/api/ai/demand-heatmap` | Hot areas by category + location | 5/day | Worker map |
| 14 | `/api/ai/smart-notification` | Personalized notification text | Auto | Notification trigger |
| 15 | `/api/ai/photo-analysis` | Completion photo verification | 5/day | Job completion |
| 16 | `/api/ai/onboarding-tips` | Contextual guidance for new users | 10/day | Onboarding flow |

### New Prisma Models

```prisma
model AIUsageLog {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  feature     String
  tokensUsed  Int
  cached      Boolean  @default(false)
  createdAt   DateTime @default(now())
  @@index([userId, feature, createdAt])
}

model AIResponseCache {
  id          String   @id @default(cuid())
  feature     String
  inputHash   String
  response    String
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  @@unique([feature, inputHash])
}
```

### Fallback Strategy

If Gemini is unavailable or rate-limited:
- Pricing: show "Market average: $X-$Y" from historical DB data
- Descriptions: return category-based template
- Matching: fall back to distance + category sort
- All others: gracefully hide AI feature, show manual alternative
- UI shows subtle "AI unavailable" indicator (not an error)

---

## Layer 2: Backend APIs

### Stripe Connect Integration

Routes at `/api/payments/`:

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/payments/create-intent` | POST | Create payment intent when bid accepted (escrow) |
| `/api/payments/confirm` | POST | Release payment after job completion |
| `/api/payments/webhook` | POST | Stripe webhook handler |
| `/api/payments/payout` | POST | Worker withdrawal to connected account |
| `/api/payments/connect` | POST | Onboard worker to Stripe Connect |
| `/api/payments/refund` | POST | Process refunds for disputes |

Payment flow:
1. Hirer accepts bid → Stripe PaymentIntent created (funds held)
2. Worker completes job → Hirer confirms completion
3. Payment released to worker's Stripe Connect account
4. Worker withdraws to bank at will

### Server-Sent Events (Real-time)

Single SSE endpoint at `/api/sse/route.ts`:

Events emitted:
- `new-message` — real-time message delivery
- `bid-received` — hirer gets notified of new bids
- `bid-accepted` — worker gets notified bid was accepted
- `job-status-change` — both parties notified
- `payment-received` — worker notified of payment
- `notification` — generic notification push

Client connects once on app mount, reconnects on disconnect.

### Location-Based Job Search

Replace mock data in worker job browsing with:
- Haversine formula in Prisma raw query for distance calculation
- Radius filter (5mi, 10mi, 25mi, 50mi)
- "Near me" using browser geolocation
- Sort by distance option
- Viewport-based queries for map view (debounced)

### File Uploads

Route at `/api/upload/route.ts`:
- Vercel Blob storage
- Supports: job photos (up to 5), profile avatars, completion proof
- Validates: file type (jpg/png/webp), max size 5MB
- Returns: public URL for storage in Prisma

### Wire Mock Pages to Real APIs

- `/work/jobs` → real job search API with location filters
- `/work/earnings` → real PaymentRecord + Booking queries
- `/hiring/jobs` → real filtered job list for authenticated hirer

---

## Layer 3: Premium UI Overhaul

### Hirer Dashboard (`/hiring/page.tsx`)

Full rebuild from stub:
- Stats row: Active Jobs, Total Spent, Open Bids, Avg Rating (GlassPanel cards)
- Recent activity feed (last 5 events with icons + timestamps)
- Quick actions: Post Job, View Bids, Messages (gradient buttons)
- AI insight card: "Your last 3 jobs filled in avg 2.1 days"
- Consistent with existing dark premium aesthetic

### Worker Dashboard (`/work/page.tsx`)

Full rebuild from stub:
- Earnings card with sparkline chart (Recharts, 7-day trend)
- "Recommended for You" AI-powered job cards (top 3)
- Active bids status tracker (pending/accepted/rejected counts)
- Quick actions: Browse Jobs, Messages, Earnings
- Demand heatmap preview card ("Cleaning is hot in Brooklyn today")
- AI onboarding coach for users with < 3 completed jobs

### Job Posting Form (`/hiring/post/page.tsx`)

Multi-step wizard rebuild:
- Step 1: Category selection + brief description → AI generates full description
- Step 2: Location (map picker + address autocomplete) + schedule + urgency
- Step 3: Budget (AI suggests range via slider) + photo upload
- Step 4: Preview + AI Job Quality Score + publish button
- Progress bar with step indicators
- Save as draft functionality
- react-hook-form + Zod validation with field-level errors

### Worker Job Discovery (`/work/jobs/page.tsx`)

Complete rebuild from mock to real:
- API-powered with skeleton loading states
- "AI Recommended" section at top (3 cards)
- Natural language search bar (AI-parsed)
- Infinite scroll with stagger animation
- Card hover: translateY(-2px) + shadow elevation
- Filters: category, distance, budget range, urgency, rating
- Empty state illustrations

### Earnings Dashboard (`/work/earnings/page.tsx`)

Wire to real data + visual upgrade:
- Revenue chart (Recharts area chart, last 30 days)
- Transaction history from real PaymentRecord data
- Withdrawal flow connected to Stripe Connect
- Payout method management (add/edit bank account)
- Tax summary section

### Universal Micro-Interactions

Applied across all pages:
- Skeleton screens on every data-loading state
- Card hover: translateY(-2px) + shadow-glow elevation
- Stagger animation on list renders (50ms per item, Framer Motion)
- AI-personalized notification toasts
- Page transitions (fade + slide, Framer Motion)
- Pull-to-refresh on mobile job lists

---

## New Dependencies

```json
{
  "@google/generative-ai": "^0.21.0",
  "stripe": "^17.0.0",
  "recharts": "^2.15.0",
  "@vercel/blob": "^0.27.0",
  "react-hook-form": "^7.54.0",
  "@hookform/resolvers": "^3.9.0"
}
```

All free or pay-as-you-use. No fixed monthly costs added.

---

## Implementation Order

1. **Phase 1:** AI infrastructure (provider layer, caching, rate limiting, Prisma models)
2. **Phase 2:** AI API routes (16 endpoints)
3. **Phase 3:** Stripe Connect integration (payment APIs)
4. **Phase 4:** SSE real-time + location search + file uploads
5. **Phase 5:** Wire mock pages to real APIs
6. **Phase 6:** Premium UI overhaul (dashboards, forms, job discovery)
7. **Phase 7:** Micro-interactions and polish pass

---

**Approved by user:** 2026-02-27
