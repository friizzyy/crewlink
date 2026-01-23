import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        avatarUrl: true,
        phone: true,
        role: true,
        createdAt: true,
        workerProfile: {
          select: {
            id: true,
            headline: true,
            bio: true,
            hourlyRate: true,
            skills: true,
            isVerified: true,
            serviceRadius: true,
            baseLat: true,
            baseLng: true,
            baseAddress: true,
            completedJobs: true,
            totalEarnings: true,
            averageRating: true,
            responseRate: true,
            isActive: true,
            instantBook: true,
          },
        },
        hirerProfile: {
          select: {
            id: true,
            companyName: true,
            bio: true,
            defaultLat: true,
            defaultLng: true,
            defaultAddress: true,
            totalJobsPosted: true,
            totalSpent: true,
            averageRating: true,
            isVerified: true,
            paymentVerified: true,
          },
        },
        _count: {
          select: {
            notifications: { where: { isRead: false } },
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
        ...user,
        unreadNotifications: user._count.notifications,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, avatarUrl, profile } = body

    // Update user base fields
    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        role: true,
      },
    })

    // Update profile if provided
    if (profile) {
      if (user.role === 'worker') {
        await prisma.workerProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            ...profile,
          },
          update: profile,
        })
      } else {
        await prisma.hirerProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            ...profile,
          },
          update: profile,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
