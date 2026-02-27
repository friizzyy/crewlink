import { callAIJSON, jobQualityScore } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const JobQualityInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  budget: z.number().positive('Budget must be a positive number'),
  category: z.string().min(1, 'Category is required'),
});

interface JobQualityScoreResponse {
  score: number;
  improvements: string[];
  strengths: string[];
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = JobQualityInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { title, description, budget, category } = parsed.data;

  const prompt = jobQualityScore({
    title,
    description,
    budgetMax: budget,
    category,
    hasLocation: false,
    hasSchedule: false,
  });

  const { data, cached } = await callAIJSON<JobQualityScoreResponse>(
    session.user.id,
    'job-quality-score',
    prompt,
    { cacheTTLHours: 12, temperature: 0.3, maxTokens: 600 }
  );

  return NextResponse.json({ success: true, data, cached });
});
