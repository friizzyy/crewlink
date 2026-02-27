import { callAIJSON, AI_PROMPTS } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const GenerateDescriptionInputSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  briefDescription: z.string().min(5, 'Brief description must be at least 5 characters'),
  location: z.string().min(1, 'Location is required'),
});

interface GeneratedDescription {
  title: string;
  description: string;
  estimatedHours: number;
  suggestedSkills: string[];
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  if (session.user.role !== 'hirer') {
    return NextResponse.json(
      { error: 'Only hirers can generate job descriptions' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = GenerateDescriptionInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { category, briefDescription, location } = parsed.data;

  const prompt = AI_PROMPTS.generateDescription({ category, briefDescription, location });

  const { data, cached } = await callAIJSON<GeneratedDescription>(prompt, {
    feature: 'generate-description',
    userId: session.user.id,
    cacheKey: { category, briefDescription, location },
    cacheTTLHours: 1,
    temperature: 0.7,
    maxTokens: 1000,
  });

  return NextResponse.json({ success: true, data, cached });
});
