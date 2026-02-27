import { z } from 'zod'

export const createJobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000, 'Description too long'),
  category: z.string().min(1, 'Category is required'),
  address: z.string().min(5, 'Address is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  city: z.string().optional(),
  isRemote: z.boolean().optional(),
  scheduleType: z.enum(['flexible', 'specific', 'asap']).optional(),
  urgency: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedHours: z.number().positive().optional(),
  budgetType: z.enum(['hourly', 'fixed', 'bidding']).optional(),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  skills: z.array(z.string()).optional(),
})

export const updateJobSchema = createJobSchema.partial()

export const jobFilterSchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  city: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
  mine: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
})

export type CreateJobInput = z.infer<typeof createJobSchema>
export type UpdateJobInput = z.infer<typeof updateJobSchema>
