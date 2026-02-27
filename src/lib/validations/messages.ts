import { z } from 'zod'

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  messageType: z.enum(['text', 'image', 'offer']).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const createConversationSchema = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
  jobId: z.string().optional(),
  initialMessage: z.string().max(5000, 'Message too long').optional(),
})

export type MessageInput = z.infer<typeof messageSchema>
export type CreateConversationInput = z.infer<typeof createConversationSchema>
