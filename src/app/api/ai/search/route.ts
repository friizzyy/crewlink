import { callAIJSON, AI_PROMPTS } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const SearchInputSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
});

interface SearchParseResponse {
  category: string | null;
  location: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  scheduleType: string | null;
  skills: string[];
  searchTerms: string[];
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = SearchInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { query } = parsed.data;

  const prompt = AI_PROMPTS.search({ query });

  const { data, cached } = await callAIJSON<SearchParseResponse>(prompt, {
    feature: 'search',
    userId: session.user.id,
    cacheKey: { query: query.toLowerCase().trim() },
    cacheTTLHours: 24,
    temperature: 0.2,
    maxTokens: 500,
  });

  return NextResponse.json({ success: true, data, cached });
});
