import { callAIJSON, AI_PROMPTS } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const PricingInputSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

interface PricingSuggestion {
  minPrice: number;
  maxPrice: number;
  confidence: number;
  reasoning: string;
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = PricingInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { category, location, description } = parsed.data;

  const prompt = AI_PROMPTS.pricingSuggestion({ category, location, description });

  const { data, cached, tokensUsed } = await callAIJSON<PricingSuggestion>(prompt, {
    feature: 'pricing-suggestion',
    userId: session.user.id,
    cacheKey: { category, location, description },
    cacheTTLHours: 24,
    temperature: 0.3,
    maxTokens: 500,
  });

  return NextResponse.json({ success: true, data, cached });
});
