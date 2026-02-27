import { callAIJSON, AI_PROMPTS } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const FraudCheckInputSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  contentType: z.enum(['job', 'bid', 'review'], {
    errorMap: () => ({ message: 'Content type must be job, bid, or review' }),
  }),
});

interface FraudCheckResponse {
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  recommendation: string;
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = FraudCheckInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { content, contentType } = parsed.data;

  let userHistory: {
    accountAge: number;
    totalJobs: number;
    totalReviews: number;
    averageRating: number;
  };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      createdAt: true,
      _count: {
        select: {
          jobs: true,
          reviewsGiven: true,
          reviewsReceived: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  const accountAgeDays = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  const avgRatingResult = await prisma.review.aggregate({
    where: { subjectId: session.user.id },
    _avg: { rating: true },
  });

  userHistory = {
    accountAge: accountAgeDays,
    totalJobs: user._count.jobs,
    totalReviews: user._count.reviewsReceived,
    averageRating: avgRatingResult._avg.rating ?? 0,
  };

  const prompt = AI_PROMPTS.fraudCheck({
    content,
    contentType,
    userHistory,
  });

  const { data, cached } = await callAIJSON<FraudCheckResponse>(prompt, {
    feature: 'fraud-check',
    userId: session.user.id,
    temperature: 0.1,
    maxTokens: 600,
  });

  return NextResponse.json({ success: true, data, cached });
});
