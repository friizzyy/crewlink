import { callAIJSON, AI_PROMPTS } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const PhotoAnalysisInputSchema = z.object({
  jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
});

interface PhotoAnalysisResponse {
  expectedElements: string[];
  verificationPrompt: string;
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = PhotoAnalysisInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { jobDescription } = parsed.data;

  const prompt = AI_PROMPTS.photoAnalysis({ jobDescription });

  const { data, cached } = await callAIJSON<PhotoAnalysisResponse>(prompt, {
    feature: 'photo-analysis',
    userId: session.user.id,
    cacheKey: { jobDescription },
    cacheTTLHours: 48,
    temperature: 0.3,
    maxTokens: 600,
  });

  return NextResponse.json({ success: true, data, cached });
});
