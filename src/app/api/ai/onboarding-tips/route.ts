import { callAIJSON, onboardingTips } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const OnboardingTipsInputSchema = z.object({
  currentStep: z.string().min(1, 'Current step is required'),
  profileCompleteness: z.number().min(0).max(100),
});

interface OnboardingTipsResponse {
  tip: string;
  nextAction: string;
  motivation: string;
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = OnboardingTipsInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { currentStep, profileCompleteness } = parsed.data;

  const prompt = onboardingTips({
    role: session.user.role as 'hirer' | 'worker',
    profileCompleteness,
    completedSteps: [currentStep],
    missingSteps: [],
  });

  const { data, cached } = await callAIJSON<OnboardingTipsResponse>(
    session.user.id,
    'onboarding-tips',
    prompt,
    { cacheTTLHours: 24, temperature: 0.7, maxTokens: 400 }
  );

  return NextResponse.json({ success: true, data, cached });
});
