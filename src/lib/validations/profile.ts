import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().max(20).optional(),
})

export const updateWorkerProfileSchema = z.object({
  headline: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  hourlyRate: z.number().positive().optional(),
  skills: z.array(z.string()).optional(),
  serviceRadius: z.number().positive().max(100).optional(),
  baseLat: z.number().min(-90).max(90).optional(),
  baseLng: z.number().min(-180).max(180).optional(),
  baseAddress: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  instantBook: z.boolean().optional(),
})

export const updateHirerProfileSchema = z.object({
  companyName: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  defaultLat: z.number().min(-90).max(90).optional(),
  defaultLng: z.number().min(-180).max(180).optional(),
  defaultAddress: z.string().max(500).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdateWorkerProfileInput = z.infer<typeof updateWorkerProfileSchema>
export type UpdateHirerProfileInput = z.infer<typeof updateHirerProfileSchema>
