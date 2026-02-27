import { callAIJSON, cleanScope } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const CleanScopeInputSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
});

interface CleanScopeResponse {
  title: string;
  description: string;
  tasks: string[];
  estimatedHours: number;
  suggestedBudget: {
    min: number;
    max: number;
  };
  requiredSkills: string[];
  safetyNotes: string[];
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = CleanScopeInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { description, category } = parsed.data;

  const prompt = cleanScope({ rawScope: description, category });

  const { data, cached } = await callAIJSON<CleanScopeResponse>(
    session.user.id,
    'clean-scope',
    prompt,
    { cacheTTLHours: 12, temperature: 0.4, maxTokens: 1500 }
  );

  return NextResponse.json({ success: true, data, cached });
});
