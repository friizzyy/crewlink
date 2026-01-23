import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// ============================================
// GET /api/jobs - List all jobs
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'posted'
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status !== 'all') {
      where.status = status
    }

    if (category) {
      where.category = category
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

interface CreateJobBody {
  title: string
  description: string
  category: string
  address: string
  lat: number
  lng: number
  isRemote?: boolean
  scheduleType?: string
  urgency?: string
  estimatedHours?: number
  budgetType?: string
  budgetMin?: number
  budgetMax?: number
  // For MVP, we'll use a temporary poster ID
  posterId?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateJobBody = await request.json()

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'address', 'lat', 'lng']
    const missingFields = requiredFields.filter((field) => {
      const value = body[field as keyof CreateJobBody]
      return value === undefined || value === null || value === ''
    })

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields,
        },
        { status: 400 }
      )
    }

    // Validate coordinates
    if (typeof body.lat !== 'number' || typeof body.lng !== 'number') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates. lat and lng must be numbers.',
        },
        { status: 400 }
      )
    }

    if (body.lat < -90 || body.lat > 90 || body.lng < -180 || body.lng > 180) {
      return NextResponse.json(
        {
          success: false,
          error: 'Coordinates out of range. lat must be -90 to 90, lng must be -180 to 180.',
        },
        { status: 400 }
      )
    }

    // For MVP, create a temporary user if posterId not provided
    // In production, this would come from auth session
    let posterId = body.posterId

    if (!posterId) {
      // Check for existing demo user or create one
      let demoUser = await prisma.user.findFirst({
        where: { phone: '+1000000000' },
      })

      if (!demoUser) {
        demoUser = await prisma.user.create({
          data: {
            phone: '+1000000000',
            name: 'Demo User',
            email: 'demo@crewlink.app',
          },
        })
      }

      posterId = demoUser.id
    }

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
        title: body.title.trim(),
        description: body.description.trim(),
        category: body.category,
        address: body.address.trim(),
        lat: body.lat,
        lng: body.lng,
        isRemote: body.isRemote || false,
        scheduleType: body.urgency ? scheduleTypeMap[body.urgency] || 'flexible' : body.scheduleType || 'flexible',
        estimatedHours: body.estimatedHours || null,
        budgetType: body.budgetType || 'bidding',
        budgetMin: body.budgetMin || null,
        budgetMax: body.budgetMax || null,
        status: 'posted', // Immediately post for MVP
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
