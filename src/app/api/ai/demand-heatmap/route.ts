import { callAIJSON, demandHeatmap } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const DemandHeatmapInputSchema = z.object({
  location: z.string().min(1, 'Location is required'),
});

interface DemandHeatmapResponse {
  hotCategories: Array<{
    category: string;
    jobCount: number;
    avgBudget: number;
    trend: 'rising' | 'stable' | 'declining';
  }>;
  insights: string[];
  recommendation: string;
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = DemandHeatmapInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { location } = parsed.data;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentJobs = await prisma.job.findMany({
    where: {
      createdAt: { gte: thirtyDaysAgo },
      status: { in: ['posted', 'assigned', 'in_progress', 'completed'] },
    },
    select: {
      category: true,
      budgetMin: true,
      budgetMax: true,
      city: true,
      address: true,
      bidCount: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const categoryStats = new Map<
    string,
    { count: number; totalBudget: number; budgetEntries: number }
  >();

  for (const job of recentJobs) {
    const existing = categoryStats.get(job.category) ?? {
      count: 0,
      totalBudget: 0,
      budgetEntries: 0,
    };
    existing.count += 1;
    if (job.budgetMax) {
      existing.totalBudget += job.budgetMax;
      existing.budgetEntries += 1;
    } else if (job.budgetMin) {
      existing.totalBudget += job.budgetMin;
      existing.budgetEntries += 1;
    }
    categoryStats.set(job.category, existing);
  }

  const aggregatedData = Array.from(categoryStats.entries()).map(
    ([category, stats]) => ({
      category,
      budgetAvg:
        stats.budgetEntries > 0
          ? Math.round(stats.totalBudget / stats.budgetEntries)
          : 0,
      count: stats.count,
    })
  );

  const prompt = demandHeatmap({
    city: location,
    recentJobs: aggregatedData,
    timeframe: 'last 30 days',
  });

  const { data, cached } = await callAIJSON<DemandHeatmapResponse>(
    session.user.id,
    'demand-heatmap',
    prompt,
    { cacheTTLHours: 6, temperature: 0.4, maxTokens: 1000 }
  );

  return NextResponse.json({ success: true, data, cached });
});
