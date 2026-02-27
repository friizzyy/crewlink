import { callAIJSON, AI_PROMPTS } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const SmartNotificationInputSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  eventData: z.record(z.unknown()),
  recipientRole: z.enum(['hirer', 'worker'], {
    errorMap: () => ({ message: 'Recipient role must be hirer or worker' }),
  }),
});

interface SmartNotificationResponse {
  title: string;
  body: string;
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = SmartNotificationInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { eventType, eventData, recipientRole } = parsed.data;

  const prompt = AI_PROMPTS.smartNotification({
    eventType,
    eventData,
    recipientRole,
  });

  const { data, cached } = await callAIJSON<SmartNotificationResponse>(prompt, {
    feature: 'smart-notification',
    userId: session.user.id,
    cacheKey: { eventType, eventData, recipientRole },
    cacheTTLHours: 24,
    temperature: 0.6,
    maxTokens: 300,
  });

  return NextResponse.json({ success: true, data, cached });
});
