import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/transactions - Get user's payment records and booking-based transactions
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
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const type = searchParams.get('type') // 'earning' | 'payout' | 'refund' | null (all)

    const where: Record<string, unknown> = { userId: session.user.id }
    if (type) {
      where.type = type
    }

    const [transactions, total] = await Promise.all([
      prisma.paymentRecord.findMany({
        where,
        include: {
          booking: {
            select: {
              id: true,
              job: {
                select: { id: true, title: true, category: true },
              },
              hirer: {
                select: { id: true, name: true },
              },
              worker: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.paymentRecord.count({ where }),
    ])

    // Compute summary stats for the user
    const [earningsAgg, payoutsAgg] = await Promise.all([
      prisma.paymentRecord.aggregate({
        where: { userId: session.user.id, type: 'earning', status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.paymentRecord.aggregate({
        where: { userId: session.user.id, type: 'payout', status: 'completed' },
        _sum: { amount: true },
      }),
    ])

    const totalEarnings = earningsAgg._sum.amount || 0
    const totalWithdrawn = payoutsAgg._sum.amount || 0
    const available = totalEarnings - totalWithdrawn

    return NextResponse.json({
      success: true,
      data: transactions,
      summary: {
        totalEarnings,
        totalWithdrawn,
        available,
      },
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + transactions.length < total,
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
