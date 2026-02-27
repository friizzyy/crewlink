import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/users/[id] - Get public profile for a user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        workerProfile: {
          select: {
            headline: true,
            bio: true,
            hourlyRate: true,
            skills: true,
            isVerified: true,
            serviceRadius: true,
            averageRating: true,
            completedJobs: true,
          },
        },
        hirerProfile: {
          select: {
            companyName: true,
            bio: true,
            isVerified: true,
            totalJobsPosted: true,
            averageRating: true,
          },
        },
        _count: {
          select: {
            reviewsReceived: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        memberSince: user.createdAt,
        reviewCount: user._count.reviewsReceived,
        workerProfile: user.workerProfile,
        hirerProfile: user.hirerProfile,
      },
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
