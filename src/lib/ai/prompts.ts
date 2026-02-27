/**
 * Centralized prompts for all 16 AI features in CrewLink.
 *
 * Each function accepts typed context parameters and returns a prompt string
 * that instructs the model to respond with JSON matching a specific schema.
 * Prompts are written to sound natural and helpful, not corporate.
 */

// ---------------------------------------------------------------------------
// 1. Pricing Suggestion
// ---------------------------------------------------------------------------

interface PricingSuggestionContext {
  category: string
  description: string
  city: string
  estimatedHours?: number
}

export function pricingSuggestion(ctx: PricingSuggestionContext): string {
  return `You're helping someone figure out a fair price for a local gig.

Category: ${ctx.category}
Description: ${ctx.description}
City: ${ctx.city}
${ctx.estimatedHours ? `Estimated hours: ${ctx.estimatedHours}` : ''}

Based on this, suggest a reasonable price range. Think about what's fair for both the person hiring and the worker in this area.

Respond with JSON:
{
  "suggestedMin": number,
  "suggestedMax": number,
  "hourlyRate": number,
  "confidence": "low" | "medium" | "high",
  "reasoning": "short explanation of how you arrived at these numbers"
}`
}

// ---------------------------------------------------------------------------
// 2. Generate Description
// ---------------------------------------------------------------------------

interface GenerateDescriptionContext {
  title: string
  category: string
  notes?: string
  budgetMin?: number
  budgetMax?: number
}

export function generateDescription(ctx: GenerateDescriptionContext): string {
  return `Write a clear, friendly job description for a local gig posting.

Title: ${ctx.title}
Category: ${ctx.category}
${ctx.notes ? `Extra notes from the poster: ${ctx.notes}` : ''}
${ctx.budgetMin !== undefined ? `Budget range: $${ctx.budgetMin}${ctx.budgetMax !== undefined ? ` - $${ctx.budgetMax}` : ''}` : ''}

Keep it concise (2-3 paragraphs). Be specific about what's needed but don't make up requirements that weren't mentioned. Use a friendly, straightforward tone.

Respond with JSON:
{
  "description": "the full job description text",
  "suggestedSkills": ["skill1", "skill2", "skill3"],
  "estimatedDuration": "e.g. 2-3 hours"
}`
}

// ---------------------------------------------------------------------------
// 3. Match Jobs
// ---------------------------------------------------------------------------

interface MatchJobsContext {
  workerSkills: string[]
  workerBio: string
  workerRating: number
  availableJobs: Array<{
    id: string
    title: string
    category: string
    description: string
    budgetMin?: number
    budgetMax?: number
    skills: string[]
  }>
}

export function matchJobs(ctx: MatchJobsContext): string {
  return `You're a job matching assistant. A worker is looking for gigs that fit their skills and experience.

Worker skills: ${ctx.workerSkills.join(', ')}
Worker bio: ${ctx.workerBio}
Worker rating: ${ctx.workerRating}/5

Available jobs:
${ctx.availableJobs.map((j) => `- [${j.id}] "${j.title}" (${j.category}) - Skills: ${j.skills.join(', ')} - ${j.description.slice(0, 100)}...`).join('\n')}

Rank the jobs by how well they match this worker. Consider skill overlap, experience fit, and earning potential.

Respond with JSON:
{
  "matches": [
    {
      "jobId": "string",
      "score": number between 0 and 100,
      "reason": "why this is a good or bad fit"
    }
  ]
}`
}

// ---------------------------------------------------------------------------
// 4. Review Summary
// ---------------------------------------------------------------------------

interface ReviewSummaryContext {
  workerName: string
  reviews: Array<{
    rating: number
    content: string
    category: string
  }>
}

export function reviewSummary(ctx: ReviewSummaryContext): string {
  return `Summarize these reviews for a worker named ${ctx.workerName} into a helpful overview that a potential hirer can quickly scan.

Reviews:
${ctx.reviews.map((r) => `- ${r.rating}/5 (${r.category}): "${r.content}"`).join('\n')}

Be honest and balanced. Mention strengths and any patterns, good or bad.

Respond with JSON:
{
  "summary": "2-3 sentence overview",
  "strengths": ["strength1", "strength2"],
  "areasForImprovement": ["area1"] or [],
  "averageSentiment": "positive" | "mixed" | "negative",
  "bestCategory": "the category they get the best feedback in"
}`
}

// ---------------------------------------------------------------------------
// 5. Chat Suggestions
// ---------------------------------------------------------------------------

interface ChatSuggestionsContext {
  userRole: 'hirer' | 'worker'
  conversationHistory: Array<{ sender: string; message: string }>
  jobTitle: string
  jobCategory: string
}

export function chatSuggestions(ctx: ChatSuggestionsContext): string {
  return `You're helping a ${ctx.userRole} in a conversation about a "${ctx.jobTitle}" gig (${ctx.jobCategory}).

Recent messages:
${ctx.conversationHistory.map((m) => `${m.sender}: ${m.message}`).join('\n')}

Suggest 3 short, natural responses they could send next. Keep them practical and relevant to the conversation flow. Don't be overly formal.

Respond with JSON:
{
  "suggestions": [
    "suggestion text 1",
    "suggestion text 2",
    "suggestion text 3"
  ]
}`
}

// ---------------------------------------------------------------------------
// 6. Clean Scope
// ---------------------------------------------------------------------------

interface CleanScopeContext {
  rawScope: string
  category: string
}

export function cleanScope(ctx: CleanScopeContext): string {
  return `A hirer described the scope of their ${ctx.category} job in their own words. Clean it up into a structured scope that's clear for workers.

Raw scope from hirer:
"${ctx.rawScope}"

Organize this into clear bullet points. Don't add things they didn't mention, but do clarify vague parts where possible.

Respond with JSON:
{
  "cleanedScope": "formatted scope with bullet points",
  "tasks": ["task1", "task2", "task3"],
  "estimatedHours": number or null,
  "clarifyingQuestions": ["question a worker might want to ask"] or []
}`
}

// ---------------------------------------------------------------------------
// 7. Profile Writer
// ---------------------------------------------------------------------------

interface ProfileWriterContext {
  name: string
  skills: string[]
  experience?: string
  completedJobs: number
  averageRating: number
}

export function profileWriter(ctx: ProfileWriterContext): string {
  return `Help ${ctx.name} write a great worker profile bio for a gig platform.

Skills: ${ctx.skills.join(', ')}
${ctx.experience ? `Experience notes: ${ctx.experience}` : ''}
Completed jobs: ${ctx.completedJobs}
Average rating: ${ctx.averageRating}/5

Write something that sounds like a real person, not a resume. Keep it under 150 words. Highlight what makes them reliable and skilled.

Respond with JSON:
{
  "bio": "the profile bio text",
  "headline": "a short catchy headline (under 10 words)",
  "suggestedSkillsToAdd": ["skill1"] or []
}`
}

// ---------------------------------------------------------------------------
// 8. Bid Writer
// ---------------------------------------------------------------------------

interface BidWriterContext {
  jobTitle: string
  jobDescription: string
  jobBudgetMin?: number
  jobBudgetMax?: number
  workerName: string
  workerSkills: string[]
  workerRating: number
}

export function bidWriter(ctx: BidWriterContext): string {
  return `Help ${ctx.workerName} write a compelling bid message for this job.

Job: "${ctx.jobTitle}"
Description: ${ctx.jobDescription.slice(0, 300)}
${ctx.jobBudgetMin !== undefined ? `Budget: $${ctx.jobBudgetMin}${ctx.jobBudgetMax !== undefined ? ` - $${ctx.jobBudgetMax}` : ''}` : ''}

Worker skills: ${ctx.workerSkills.join(', ')}
Worker rating: ${ctx.workerRating}/5

Write a short, professional bid message (2-3 sentences). Be specific about why they're a good fit without being salesy. Sound genuine.

Respond with JSON:
{
  "message": "the bid message",
  "suggestedAmount": number or null,
  "keySellingPoints": ["point1", "point2"]
}`
}

// ---------------------------------------------------------------------------
// 9. Search Parse
// ---------------------------------------------------------------------------

interface SearchParseContext {
  query: string
  availableCategories: string[]
  availableCities: string[]
}

export function searchParse(ctx: SearchParseContext): string {
  return `Parse this natural language job search query into structured filters.

Query: "${ctx.query}"

Available categories: ${ctx.availableCategories.join(', ')}
Available cities: ${ctx.availableCities.join(', ')}

Extract what you can from the query. If something isn't mentioned, leave it null.

Respond with JSON:
{
  "category": "matched category" or null,
  "city": "matched city" or null,
  "minBudget": number or null,
  "maxBudget": number or null,
  "keywords": ["keyword1", "keyword2"],
  "urgency": "asap" | "flexible" | null,
  "interpretation": "what you think they're looking for in plain English"
}`
}

// ---------------------------------------------------------------------------
// 10. Job Quality Score
// ---------------------------------------------------------------------------

interface JobQualityScoreContext {
  title: string
  description: string
  budgetMin?: number
  budgetMax?: number
  category: string
  hasLocation: boolean
  hasSchedule: boolean
}

export function jobQualityScore(ctx: JobQualityScoreContext): string {
  return `Rate the quality of this job posting. Is it clear enough for workers to understand and bid on?

Title: "${ctx.title}"
Description: "${ctx.description}"
Category: ${ctx.category}
Budget: ${ctx.budgetMin !== undefined ? `$${ctx.budgetMin}${ctx.budgetMax !== undefined ? ` - $${ctx.budgetMax}` : ''}` : 'not specified'}
Has location: ${ctx.hasLocation ? 'yes' : 'no'}
Has schedule: ${ctx.hasSchedule ? 'yes' : 'no'}

Score the posting and give actionable tips to improve it.

Respond with JSON:
{
  "score": number between 0 and 100,
  "grade": "A" | "B" | "C" | "D" | "F",
  "issues": ["issue1", "issue2"] or [],
  "suggestions": ["suggestion1", "suggestion2"] or [],
  "missingInfo": ["what's missing"] or []
}`
}

// ---------------------------------------------------------------------------
// 11. Fraud Check
// ---------------------------------------------------------------------------

interface FraudCheckContext {
  content: string
  contentType: 'job_posting' | 'bid_message' | 'review' | 'profile_bio'
  userAccountAge: number // days
  userCompletedJobs: number
}

export function fraudCheck(ctx: FraudCheckContext): string {
  return `Check this ${ctx.contentType.replace('_', ' ')} for potential red flags or suspicious patterns.

Content:
"${ctx.content}"

User account age: ${ctx.userAccountAge} days
User completed jobs: ${ctx.userCompletedJobs}

Look for things like: payment outside the platform, personal info harvesting, unrealistic offers, spam patterns, or anything that feels off. Be pragmatic, not paranoid.

Respond with JSON:
{
  "riskLevel": "low" | "medium" | "high",
  "flags": ["flag1", "flag2"] or [],
  "reasoning": "brief explanation",
  "shouldBlock": false,
  "shouldFlag": false
}`
}

// ---------------------------------------------------------------------------
// 12. Dispute Assist
// ---------------------------------------------------------------------------

interface DisputeAssistContext {
  hirerMessage: string
  workerMessage: string
  jobTitle: string
  agreedAmount: number
  jobStatus: string
}

export function disputeAssist(ctx: DisputeAssistContext): string {
  return `Help mediate a dispute between a hirer and worker on a gig.

Job: "${ctx.jobTitle}"
Agreed amount: $${ctx.agreedAmount}
Job status: ${ctx.jobStatus}

Hirer says: "${ctx.hirerMessage}"
Worker says: "${ctx.workerMessage}"

Be fair to both sides. Suggest a reasonable resolution based on what each person described.

Respond with JSON:
{
  "summary": "neutral summary of the dispute",
  "hirerPoints": ["valid points from hirer"],
  "workerPoints": ["valid points from worker"],
  "suggestedResolution": "what seems fair",
  "suggestedPayout": number or null,
  "needsHumanReview": false
}`
}

// ---------------------------------------------------------------------------
// 13. Demand Heatmap
// ---------------------------------------------------------------------------

interface DemandHeatmapContext {
  city: string
  recentJobs: Array<{
    category: string
    budgetAvg: number
    count: number
  }>
  timeframe: string
}

export function demandHeatmap(ctx: DemandHeatmapContext): string {
  return `Analyze job demand patterns for ${ctx.city} over the ${ctx.timeframe}.

Recent job data:
${ctx.recentJobs.map((j) => `- ${j.category}: ${j.count} jobs, avg budget $${j.budgetAvg}`).join('\n')}

Identify trends, hot categories, and opportunities for workers.

Respond with JSON:
{
  "hotCategories": ["category1", "category2"],
  "growingCategories": ["category with increasing demand"],
  "avgBudgetTrend": "increasing" | "stable" | "decreasing",
  "insights": ["insight1", "insight2"],
  "bestTimeToWork": "when demand typically peaks"
}`
}

// ---------------------------------------------------------------------------
// 14. Smart Notification
// ---------------------------------------------------------------------------

interface SmartNotificationContext {
  eventType: string
  recipientRole: 'hirer' | 'worker'
  recipientName: string
  data: Record<string, string | number>
}

export function smartNotification(ctx: SmartNotificationContext): string {
  return `Write a short, friendly push notification for a ${ctx.recipientRole} named ${ctx.recipientName}.

Event: ${ctx.eventType}
Details: ${Object.entries(ctx.data).map(([k, v]) => `${k}: ${v}`).join(', ')}

Keep it casual and informative. Under 100 characters for the title, under 200 for the body. Make them want to tap it.

Respond with JSON:
{
  "title": "notification title",
  "body": "notification body",
  "priority": "low" | "normal" | "high"
}`
}

// ---------------------------------------------------------------------------
// 15. Photo Analysis
// ---------------------------------------------------------------------------

interface PhotoAnalysisContext {
  photoDescription: string
  context: 'profile_photo' | 'job_completion' | 'job_posting'
}

export function photoAnalysis(ctx: PhotoAnalysisContext): string {
  return `Analyze this photo used in a ${ctx.context.replace('_', ' ')} context.

Photo description: "${ctx.photoDescription}"

Check if it's appropriate and useful for its purpose. For profile photos, is it professional? For job completion, does it show the work? For job postings, does it help explain the task?

Respond with JSON:
{
  "isAppropriate": true,
  "quality": "good" | "okay" | "poor",
  "suggestions": ["suggestion1"] or [],
  "flags": [] or ["concern1"]
}`
}

// ---------------------------------------------------------------------------
// 16. Onboarding Tips
// ---------------------------------------------------------------------------

interface OnboardingTipsContext {
  role: 'hirer' | 'worker'
  profileCompleteness: number // 0-100
  completedSteps: string[]
  missingSteps: string[]
}

export function onboardingTips(ctx: OnboardingTipsContext): string {
  return `Give personalized onboarding tips to a new ${ctx.role} who's ${ctx.profileCompleteness}% done setting up.

Completed: ${ctx.completedSteps.join(', ') || 'nothing yet'}
Still needed: ${ctx.missingSteps.join(', ')}

Be encouraging and specific. Tell them what to do next and why it matters. Keep it friendly, not preachy.

Respond with JSON:
{
  "nextStep": "the single most important thing to do next",
  "tips": ["tip1", "tip2", "tip3"],
  "motivation": "a short encouraging message",
  "estimatedTimeToComplete": "e.g. 5 minutes"
}`
}
