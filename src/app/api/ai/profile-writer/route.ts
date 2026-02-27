import { callAIJSON, AI_PROMPTS } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface ProfileWriterResponse {
  headline: string;
  bio: string;
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  if (session.user.role !== 'worker') {
    return NextResponse.json(
      { error: 'Only workers can use the profile writer' },
      { status: 403 }
    );
  }

  const workerProfile = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      skills: true,
      hourlyRate: true,
      serviceRadius: true,
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

  const recentReviews = await prisma.review.findMany({
    where: {
      subjectId: session.user.id,
      isPublic: true,
    },
    select: {
      rating: true,
      content: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const prompt = AI_PROMPTS.profileWriter({
    name: workerProfile.user.name,
    skills: workerProfile.skills,
    hourlyRate: workerProfile.hourlyRate,
    completedJobs: workerProfile.completedJobs,
    averageRating: workerProfile.averageRating,
    currentHeadline: workerProfile.headline,
    currentBio: workerProfile.bio,
    recentReviews: recentReviews.map((r) => ({
      rating: r.rating,
      content: r.content,
    })),
  });

  const { data, cached } = await callAIJSON<ProfileWriterResponse>(prompt, {
    feature: 'profile-writer',
    userId: session.user.id,
    temperature: 0.7,
    maxTokens: 800,
  });

  return NextResponse.json({ success: true, data, cached });
});
