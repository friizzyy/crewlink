import { callAIJSON, bidWriter } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const BidWriterInputSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
});

interface BidWriterResponse {
  message: string;
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  if (session.user.role !== 'worker') {
    return NextResponse.json(
      { error: 'Only workers can use the bid writer' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = BidWriterInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { jobId } = parsed.data;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      skills: true,
      budgetMin: true,
      budgetMax: true,
      budgetType: true,
      scheduleType: true,
      estimatedHours: true,
      address: true,
      city: true,
    },
  });

  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  const workerProfile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      skills: true,
      hourlyRate: true,
      completedJobs: true,
      averageRating: true,
      headline: true,
      bio: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!workerProfile) {
    return NextResponse.json(
      { error: 'Worker profile not found. Please complete your profile first.' },
      { status: 404 }
    );
  }

  const prompt = bidWriter({
    jobTitle: job.title,
    jobDescription: job.description,
    jobBudgetMin: job.budgetMin ?? undefined,
    jobBudgetMax: job.budgetMax ?? undefined,
    workerName: workerProfile.user.name ?? 'Worker',
    workerSkills: workerProfile.skills,
    workerRating: workerProfile.averageRating ?? 0,
  });

  const { data, cached } = await callAIJSON<BidWriterResponse>(
    session.user.id,
    'bid-writer',
    prompt,
    { cacheTTLHours: 1, temperature: 0.7, maxTokens: 600 }
  );

  return NextResponse.json({ success: true, data, cached });
});
