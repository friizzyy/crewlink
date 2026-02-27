import { callAIJSON, AI_PROMPTS } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const ReviewSummaryInputSchema = z.object({
  workerId: z.string().min(1, 'Worker ID is required'),
});

interface ReviewSummaryResponse {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  keywords: string[];
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = ReviewSummaryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { workerId } = parsed.data;

  const reviews = await prisma.review.findMany({
    where: {
      subjectId: workerId,
      isPublic: true,
    },
    select: {
      rating: true,
      title: true,
      content: true,
      communicationRating: true,
      qualityRating: true,
      timelinessRating: true,
      valueRating: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  if (reviews.length < 3) {
    return NextResponse.json(
      { error: 'At least 3 reviews are required to generate a summary' },
      { status: 400 }
    );
  }

  const prompt = AI_PROMPTS.reviewSummary({
    reviews: reviews.map((r) => ({
      rating: r.rating,
      title: r.title,
      content: r.content,
      communicationRating: r.communicationRating,
      qualityRating: r.qualityRating,
      timelinessRating: r.timelinessRating,
      valueRating: r.valueRating,
    })),
  });

  const { data, cached } = await callAIJSON<ReviewSummaryResponse>(prompt, {
    feature: 'review-summary',
    userId: session.user.id,
    cacheKey: { workerId, reviewCount: reviews.length },
    cacheTTLHours: 48,
    temperature: 0.4,
    maxTokens: 800,
  });

  return NextResponse.json({ success: true, data, cached });
});
