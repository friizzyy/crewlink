import { callAIJSON, AI_PROMPTS } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const DisputeAssistInputSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  issue: z.string().min(10, 'Please describe the issue in at least 10 characters'),
});

interface DisputeAssistResponse {
  analysis: string;
  suggestedResolution: string;
  forHirer: string;
  forWorker: string;
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = DisputeAssistInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { bookingId, issue } = parsed.data;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      hirerId: true,
      workerId: true,
      status: true,
      agreedAmount: true,
      scheduledStart: true,
      scheduledEnd: true,
      actualStart: true,
      actualEnd: true,
      job: {
        select: {
          title: true,
          description: true,
          category: true,
          budgetMin: true,
          budgetMax: true,
        },
      },
    },
  });

  if (!booking) {
    return NextResponse.json(
      { error: 'Booking not found' },
      { status: 404 }
    );
  }

  const isParticipant =
    booking.hirerId === session.user.id ||
    booking.workerId === session.user.id;

  if (!isParticipant) {
    return NextResponse.json(
      { error: 'You are not a participant in this booking' },
      { status: 403 }
    );
  }

  const userRole = booking.hirerId === session.user.id ? 'hirer' : 'worker';

  const prompt = AI_PROMPTS.disputeAssist({
    issue,
    userRole,
    booking: {
      status: booking.status,
      agreedAmount: booking.agreedAmount,
      scheduledStart: booking.scheduledStart.toISOString(),
      scheduledEnd: booking.scheduledEnd?.toISOString() ?? null,
      actualStart: booking.actualStart?.toISOString() ?? null,
      actualEnd: booking.actualEnd?.toISOString() ?? null,
    },
    job: {
      title: booking.job.title,
      description: booking.job.description,
      category: booking.job.category,
      budgetMin: booking.job.budgetMin,
      budgetMax: booking.job.budgetMax,
    },
  });

  const { data, cached } = await callAIJSON<DisputeAssistResponse>(prompt, {
    feature: 'dispute-assist',
    userId: session.user.id,
    temperature: 0.3,
    maxTokens: 1200,
  });

  return NextResponse.json({ success: true, data, cached });
});
