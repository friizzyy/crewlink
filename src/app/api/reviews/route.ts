import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createReviewSchema } from '@/lib/validations/reviews'
import { sanitizeHtml } from '@/lib/sanitize'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'

// GET /api/reviews - Get reviews for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id
    const type = searchParams.get('type') || 'received' // 'received' or 'given'
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where =
      type === 'given'
        ? { authorId: userId }
        : { subjectId: userId, isPublic: true }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true, image: true },
          },
          subject: {
            select: { id: true, name: true, avatarUrl: true, image: true },
          },
          booking: {
            select: {
              id: true,
              job: { select: { id: true, title: true, category: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: { total, limit, offset, hasMore: offset + reviews.length < total },
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    const { success: allowed } = rateLimit(
      getRateLimitKey(ip, 'reviews'),
      { windowMs: 60_000, maxRequests: 5 }
    )
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validation = createReviewSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const data = validation.data

    // Verify booking exists and is completed
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      select: {
        id: true,
        status: true,
        hirerId: true,
        workerId: true,
        jobId: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Can only review completed bookings' },
        { status: 400 }
      )
    }

    // Verify user is part of the booking
    const isHirer = booking.hirerId === session.user.id
    const isWorker = booking.workerId === session.user.id

    if (!isHirer && !isWorker) {
      return NextResponse.json(
        { success: false, error: 'You are not part of this booking' },
        { status: 403 }
      )
    }

    // Determine subject (the other party)
    const subjectId = isHirer ? booking.workerId : booking.hirerId

    // Check for duplicate review
    const existingReview = await prisma.review.findUnique({
      where: {
        bookingId_authorId: {
          bookingId: data.bookingId,
          authorId: session.user.id,
        },
      },
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this booking' },
        { status: 409 }
      )
    }

    const review = await prisma.review.create({
      data: {
        bookingId: data.bookingId,
        authorId: session.user.id,
        subjectId,
        rating: data.rating,
        title: data.title ? sanitizeHtml(data.title) : null,
        content: data.content ? sanitizeHtml(data.content) : null,
        communicationRating: data.communicationRating,
        qualityRating: data.qualityRating,
        timelinessRating: data.timelinessRating,
        valueRating: data.valueRating,
      },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    })

    // Update subject's average rating
    const allReviews = await prisma.review.aggregate({
      where: { subjectId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    const avgRating = allReviews._avg.rating || 0
    const reviewCount = allReviews._count.rating

    // Update worker or hirer profile rating
    if (isHirer) {
      await prisma.workerProfile.updateMany({
        where: { userId: subjectId },
        data: { averageRating: avgRating },
      })
    } else {
      await prisma.hirerProfile.updateMany({
        where: { userId: subjectId },
        data: { averageRating: avgRating },
      })
    }

    // Notify the reviewed user
    await prisma.notification.create({
      data: {
        userId: subjectId,
        type: 'new_review',
        title: 'New Review',
        body: `${session.user.name || 'Someone'} left you a ${data.rating}-star review`,
        data: { reviewId: review.id, bookingId: data.bookingId },
        actionUrl: isHirer ? `/work/profile` : `/hiring/profile`,
      },
    })

    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
