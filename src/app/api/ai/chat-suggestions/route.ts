import { callAIJSON, chatSuggestions } from '@/lib/ai';
import { withAIAuth } from '@/lib/ai/api-handler';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

const ChatSuggestionsInputSchema = z.object({
  threadId: z.string().min(1, 'Thread ID is required'),
});

interface ChatSuggestionsResponse {
  suggestions: string[];
}

export const POST = withAIAuth(async (request: NextRequest, session) => {
  const body = await request.json();
  const parsed = ChatSuggestionsInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { threadId } = parsed.data;

  const participant = await prisma.threadParticipant.findUnique({
    where: {
      threadId_userId: {
        threadId,
        userId: session.user.id,
      },
    },
  });

  if (!participant) {
    return NextResponse.json(
      { error: 'You are not a participant of this conversation' },
      { status: 403 }
    );
  }

  const messages = await prisma.message.findMany({
    where: {
      threadId,
      isDeleted: false,
    },
    select: {
      content: true,
      senderId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  if (messages.length === 0) {
    return NextResponse.json({
      success: true,
      data: { suggestions: [] },
      cached: false,
    });
  }

  const lastMessage = messages[0];
  if (lastMessage.senderId === session.user.id) {
    return NextResponse.json({
      success: true,
      data: { suggestions: [] },
      cached: false,
    });
  }

  const thread = await prisma.messageThread.findUnique({
    where: { id: threadId },
    select: {
      job: {
        select: {
          title: true,
          category: true,
        },
      },
    },
  });

  const reversedMessages = [...messages].reverse();

  const prompt = chatSuggestions({
    userRole: session.user.role as 'hirer' | 'worker',
    conversationHistory: reversedMessages.map((m) => ({
      sender: m.senderId === session.user.id ? 'You' : 'Other',
      message: m.content,
    })),
    jobTitle: thread?.job?.title ?? 'a gig',
    jobCategory: thread?.job?.category ?? 'general',
  });

  const { data, cached } = await callAIJSON<ChatSuggestionsResponse>(
    session.user.id,
    'chat-suggestions',
    prompt,
    { temperature: 0.8, maxTokens: 500 }
  );

  return NextResponse.json({ success: true, data, cached });
});
