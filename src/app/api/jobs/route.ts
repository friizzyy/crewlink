import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// ============================================
// GET /api/jobs - List jobs with filters
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'posted'
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const city = searchParams.get('city')
    const budgetMin = searchParams.get('budgetMin')
    const budgetMax = searchParams.get('budgetMax')
    const mine = searchParams.get('mine') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build where clause
    const where: Record<string, unknown> = {}

    // If mine=true, get user's own jobs
    if (mine) {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        )
      }
      where.posterId = session.user.id
    }

    if (status !== 'all') {
      where.status = status
    }

    if (category) {
      where.category = category
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (budgetMin) {
      where.budgetMin = { gte: parseFloat(budgetMin) }
    }

    if (budgetMax) {
      where.budgetMax = { lte: parseFloat(budgetMax) }
    }

    // Fetch jobs with poster info
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          poster: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              image: true,
              hirerProfile: {
                select: {
                  companyName: true,
                  averageRating: true,
                  isVerified: true,
                },
              },
            },
          },
          _count: {
            select: {
              bids: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.job.count({ where }),
    ])

    // Transform for API response
    const transformedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category,
      address: job.address,
      city: job.city,
      lat: job.lat,
      lng: job.lng,
      isRemote: job.isRemote,
      scheduleType: job.scheduleType,
      startDate: job.startDate,
      endDate: job.endDate,
      estimatedHours: job.estimatedHours,
      budgetType: job.budgetType,
      budgetMin: job.budgetMin,
      budgetMax: job.budgetMax,
      status: job.status,
      viewCount: job.viewCount,
      bidCount: job._count.bids,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      poster: job.poster,
    }))

    return NextResponse.json({
      success: true,
      data: transformedJobs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + jobs.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// ============================================
// POST /api/jobs - Create a new job
// ============================================

const createJobSchema = z.object({
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

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'hirer') {
      return NextResponse.json(
        { success: false, error: 'Only hirers can create jobs' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = createJobSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0].message,
          errors: validation.error.errors,
        },
        { status: 400 }
      )
    }

    const data = validation.data
    const posterId = session.user.id

    // Map urgency to schedule type
    const scheduleTypeMap: Record<string, string> = {
      urgent: 'asap',
      today: 'asap',
      'this-week': 'flexible',
      flexible: 'flexible',
    }

    // Create the job
    const job = await prisma.job.create({
      data: {
        posterId,
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        address: data.address.trim(),
        city: data.city || null,
        lat: data.lat,
        lng: data.lng,
        isRemote: data.isRemote || false,
        scheduleType: data.urgency
          ? scheduleTypeMap[data.urgency] || 'flexible'
          : data.scheduleType || 'flexible',
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        estimatedHours: data.estimatedHours || null,
        budgetType: data.budgetType || 'bidding',
        budgetMin: data.budgetMin || null,
        budgetMax: data.budgetMax || null,
        skills: data.skills || [],
        status: 'posted',
      },
      include: {
        poster: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    })

    // Update hirer's job count
    await prisma.hirerProfile.updateMany({
      where: { userId: posterId },
      data: { totalJobsPosted: { increment: 1 } },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: job.id,
          title: job.title,
          description: job.description,
          category: job.category,
          address: job.address,
          lat: job.lat,
          lng: job.lng,
          status: job.status,
          createdAt: job.createdAt,
          poster: job.poster,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
