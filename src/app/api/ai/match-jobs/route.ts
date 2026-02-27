import { callAIJSON, matchJobs } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface JobMatch {
  jobId: string;
  score: number;
  reason: string;
  job: {
    id: string;
    title: string;
    category: string;
    budgetMin: number | null;
    budgetMax: number | null;
    address: string;
    status: string;
  };
}

interface MatchJobsResponse {
  matches: JobMatch[];
}

export const GET = withAIAuth(async (request: NextRequest, session) => {
  if (session.user.role !== 'worker') {
    return NextResponse.json(
      { error: 'Only workers can access job matching' },
      { status: 403 }
    );
  }

  const workerProfile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      skills: true,
      hourlyRate: true,
      serviceRadius: true,
      baseLat: true,
      baseLng: true,
      bio: true,
      headline: true,
      completedJobs: true,
      averageRating: true,
    },
  });

  if (!workerProfile) {
    return NextResponse.json(
      { error: 'Worker profile not found. Please complete your profile first.' },
      { status: 404 }
    );
  }

  const recentJobs = await prisma.job.findMany({
    where: {
      status: 'posted',
      bids: {
        none: {
          workerId: session.user.id,
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      skills: true,
      budgetMin: true,
      budgetMax: true,
      budgetType: true,
      address: true,
      city: true,
      lat: true,
      lng: true,
      scheduleType: true,
      estimatedHours: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  if (recentJobs.length === 0) {
    return NextResponse.json({
      success: true,
      data: { matches: [] },
      cached: false,
    });
  }

  const prompt = matchJobs({
    workerSkills: workerProfile.skills,
    workerBio: workerProfile.bio ?? '',
    workerRating: workerProfile.averageRating ?? 0,
    availableJobs: recentJobs.map((job) => ({
      id: job.id,
      title: job.title,
      category: job.category,
      description: job.description,
      budgetMin: job.budgetMin ?? undefined,
      budgetMax: job.budgetMax ?? undefined,
      skills: job.skills,
    })),
  });

  const { data, cached } = await callAIJSON<MatchJobsResponse>(
    session.user.id,
    'match-jobs',
    prompt,
    { cacheTTLHours: 1, temperature: 0.3, maxTokens: 2000 }
  );

  const jobMap = new Map(recentJobs.map((j) => [j.id, j]));
  const enrichedMatches = data.matches
    .filter((match) => jobMap.has(match.jobId))
    .map((match) => {
      const job = jobMap.get(match.jobId)!;
      return {
        ...match,
        job: {
          id: job.id,
          title: job.title,
          category: job.category,
          budgetMin: job.budgetMin,
          budgetMax: job.budgetMax,
          address: job.address,
          status: job.status,
        },
      };
    });

  return NextResponse.json({
    success: true,
    data: { matches: enrichedMatches },
    cached,
  });
});
