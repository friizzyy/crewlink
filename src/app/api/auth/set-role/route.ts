import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const setRoleSchema = z.object({
  role: z.enum(['hirer', 'worker'], {
    errorMap: () => ({ message: 'Role must be "hirer" or "worker"' }),
  }),
})

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
    const validation = setRoleSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { role } = validation.data

    // Update user role in database
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
      select: { id: true, role: true },
    })

    // Create the corresponding profile if it doesn't exist
    if (role === 'hirer') {
      const existing = await prisma.hirerProfile.findUnique({
        where: { userId: session.user.id },
      })
      if (!existing) {
        await prisma.hirerProfile.create({
          data: { userId: session.user.id },
        })
      }
    } else {
      const existing = await prisma.workerProfile.findUnique({
        where: { userId: session.user.id },
      })
      if (!existing) {
        await prisma.workerProfile.create({
          data: { userId: session.user.id },
        })
      }
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Set role error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
      { status: 500 }
    )
  }
}
