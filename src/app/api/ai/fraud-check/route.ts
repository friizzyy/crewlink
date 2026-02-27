import { callAIJSON, fraudCheck } from '@/lib/ai';
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

const CONTENT_TYPE_MAP: Record<string, 'job_posting' | 'bid_message' | 'review' | 'profile_bio'> = {
  job: 'job_posting',
  bid: 'bid_message',
  review: 'review',
};

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

  const prompt = fraudCheck({
    content,
    contentType: CONTENT_TYPE_MAP[contentType] ?? 'job_posting',
    userAccountAge: accountAgeDays,
    userCompletedJobs: user._count.jobs,
  });

  const { data, cached } = await callAIJSON<FraudCheckResponse>(
    session.user.id,
    'fraud-check',
    prompt,
    { temperature: 0.1, maxTokens: 600 }
  );

  return NextResponse.json({ success: true, data, cached });
});
