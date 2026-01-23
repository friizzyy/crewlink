import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/bids - Get user's bids (for workers)
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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const where: Record<string, unknown> = { workerId: session.user.id }
    if (status) {
      where.status = status
    }

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              address: true,
              city: true,
              budgetType: true,
              budgetMin: true,
              budgetMax: true,
              status: true,
              poster: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  hirerProfile: {
                    select: {
                      companyName: true,
                      averageRating: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.bid.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: bids,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + bids.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching bids:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bids' },
      { status: 500 }
    )
  }
}
