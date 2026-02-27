import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// ============================================
// GET /api/jobs/nearby - Location-based job search
// ============================================

const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(100).default(25),
  category: z.string().optional(),
  budgetMin: z.coerce.number().positive().optional(),
  budgetMax: z.coerce.number().positive().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
})

interface NearbyJobRow {
  id: string
  title: string
  description: string
  category: string
  address: string
  city: string | null
  lat: number
  lng: number
  budgetType: string
  budgetMin: number | null
  budgetMax: number | null
  scheduleType: string
  status: string
  bidCount: number
  createdAt: Date
  posterName: string | null
  posterAvatar: string | null
  posterRating: number | null
  distance: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse and validate query parameters
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    const validation = nearbyQuerySchema.safeParse(params)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          errors: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const { lat, lng, radius, category, budgetMin, budgetMax, limit, offset } = validation.data

    // Convert radius from miles to kilometers
    const radiusKm = radius * 1.60934

    // Build optional filter clauses
    const conditions: string[] = ['j.status = \'posted\'']
    const queryParams: (number | string)[] = [lat, lng, lat, radiusKm, limit, offset]
    let paramIndex = 7 // $1-$6 are used by lat, lng, lat, radiusKm, limit, offset

    if (category) {
      conditions.push(`j.category = $${paramIndex}`)
      queryParams.push(category)
      paramIndex++
    }

    if (budgetMin !== undefined) {
      conditions.push(`j."budgetMin" >= $${paramIndex}`)
      queryParams.push(budgetMin)
      paramIndex++
    }

    if (budgetMax !== undefined) {
      conditions.push(`j."budgetMax" <= $${paramIndex}`)
      queryParams.push(budgetMax)
      paramIndex++
    }

    const whereClause = conditions.join(' AND ')

    // Haversine formula query with parameterized values
    const query = `
      SELECT
        j.id, j.title, j.description, j.category, j.address, j.city,
        j.lat, j.lng, j."budgetType", j."budgetMin", j."budgetMax",
        j."scheduleType", j.status, j."bidCount", j."createdAt",
        u.name as "posterName", u."avatarUrl" as "posterAvatar",
        hp."averageRating" as "posterRating",
        (6371 * acos(
          cos(radians($1)) * cos(radians(j.lat)) *
          cos(radians(j.lng) - radians($2)) +
          sin(radians($1)) * sin(radians(j.lat))
        )) as distance
      FROM "Job" j
      LEFT JOIN "User" u ON j."posterId" = u.id
      LEFT JOIN "HirerProfile" hp ON hp."userId" = u.id
      WHERE ${whereClause}
      HAVING (6371 * acos(
        cos(radians($3)) * cos(radians(j.lat)) *
        cos(radians(j.lng) - radians($2)) +
        sin(radians($3)) * sin(radians(j.lat))
      )) <= $4
      ORDER BY distance ASC
      LIMIT $5 OFFSET $6
    `

    const jobs = await prisma.$queryRawUnsafe<NearbyJobRow[]>(query, ...queryParams)

    return NextResponse.json({
      success: true,
      data: jobs.map((job) => ({
        ...job,
        distance: Math.round(job.distance * 100) / 100,
      })),
      pagination: {
        limit,
        offset,
        hasMore: jobs.length === limit,
      },
    })
  } catch (error) {
    console.error('Error fetching nearby jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch nearby jobs' },
      { status: 500 }
    )
  }
}
