import { z } from 'zod'

export const createBidSchema = z.object({
  amount: z.number().positive('Bid amount must be positive'),
  message: z.string().max(2000, 'Message too long').optional(),
  estimatedHours: z.number().positive('Estimated hours must be positive').optional(),
})

export const bidActionSchema = z.object({
  action: z.enum(['accept', 'reject', 'withdraw'], {
    required_error: 'Action is required',
  }),
})

export type CreateBidInput = z.infer<typeof createBidSchema>
export type BidActionInput = z.infer<typeof bidActionSchema>
