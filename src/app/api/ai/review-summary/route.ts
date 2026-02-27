import { callAIJSON, reviewSummary } from '@/lib/ai';
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

  const worker = await prisma.user.findUnique({
    where: { id: workerId },
    select: { name: true },
  });

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
      booking: {
        select: {
          job: {
            select: { category: true },
          },
        },
      },
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

  const prompt = reviewSummary({
    workerName: worker?.name ?? 'Worker',
    reviews: reviews.map((r) => ({
      rating: r.rating,
      content: r.content ?? '',
      category: r.booking?.job?.category ?? 'general',
    })),
  });

  const { data, cached } = await callAIJSON<ReviewSummaryResponse>(
    session.user.id,
    'review-summary',
    prompt,
    { cacheTTLHours: 48, temperature: 0.4, maxTokens: 800 }
  );

  return NextResponse.json({ success: true, data, cached });
});
