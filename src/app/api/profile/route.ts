import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/profile - Get current user's profile
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
      include: {
        workerProfile: true,
        hirerProfile: true,
        _count: {
          select: {
            jobs: true,
            bids: true,
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

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PATCH /api/profile - Update current user's profile
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

    // Get current user to determine which profile to update
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Update base user fields
    const userUpdateData: Record<string, unknown> = {}
    if (body.name !== undefined) userUpdateData.name = body.name
    if (body.phone !== undefined) userUpdateData.phone = body.phone
    if (body.avatarUrl !== undefined) userUpdateData.avatarUrl = body.avatarUrl

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdateData,
      })
    }

    // Update role-specific profile
    if (user.role === 'worker' && body.workerProfile) {
      const { headline, bio, hourlyRate, skills, serviceRadius, baseLat, baseLng, baseAddress, isActive, instantBook } = body.workerProfile

      await prisma.workerProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          headline,
          bio,
          hourlyRate,
          skills: skills || [],
          serviceRadius,
          baseLat,
          baseLng,
          baseAddress,
          isActive,
          instantBook,
        },
        update: {
          ...(headline !== undefined && { headline }),
          ...(bio !== undefined && { bio }),
          ...(hourlyRate !== undefined && { hourlyRate }),
          ...(skills !== undefined && { skills }),
          ...(serviceRadius !== undefined && { serviceRadius }),
          ...(baseLat !== undefined && { baseLat }),
          ...(baseLng !== undefined && { baseLng }),
          ...(baseAddress !== undefined && { baseAddress }),
          ...(isActive !== undefined && { isActive }),
          ...(instantBook !== undefined && { instantBook }),
        },
      })
    }

    if (user.role === 'hirer' && body.hirerProfile) {
      const { companyName, bio, defaultLat, defaultLng, defaultAddress } = body.hirerProfile

      await prisma.hirerProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          companyName,
          bio,
          defaultLat,
          defaultLng,
          defaultAddress,
        },
        update: {
          ...(companyName !== undefined && { companyName }),
          ...(bio !== undefined && { bio }),
          ...(defaultLat !== undefined && { defaultLat }),
          ...(defaultLng !== undefined && { defaultLng }),
          ...(defaultAddress !== undefined && { defaultAddress }),
        },
      })
    }

    // Return updated profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        workerProfile: true,
        hirerProfile: true,
      },
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
