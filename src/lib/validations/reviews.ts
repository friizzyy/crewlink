import { z } from 'zod'

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  rating: z.number().int().min(1, 'Rating must be 1-5').max(5, 'Rating must be 1-5'),
  title: z.string().max(200, 'Title too long').optional(),
  content: z.string().max(2000, 'Review too long').optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  qualityRating: z.number().int().min(1).max(5).optional(),
  timelinessRating: z.number().int().min(1).max(5).optional(),
  valueRating: z.number().int().min(1).max(5).optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
