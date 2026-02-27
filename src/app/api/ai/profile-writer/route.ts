import { callAIJSON, profileWriter } from '@/lib/ai';
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

  const prompt = profileWriter({
    name: workerProfile.user.name ?? 'Worker',
    skills: workerProfile.skills,
    experience: workerProfile.bio ?? undefined,
    completedJobs: workerProfile.completedJobs,
    averageRating: workerProfile.averageRating ?? 0,
  });

  const { data, cached } = await callAIJSON<ProfileWriterResponse>(
    session.user.id,
    'profile-writer',
    prompt,
    { temperature: 0.7, maxTokens: 800 }
  );

  return NextResponse.json({ success: true, data, cached });
});
