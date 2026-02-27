import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// ============================================
// GET /api/earnings - Worker earnings summary
// ============================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'worker') {
      return NextResponse.json(
        { success: false, error: 'Only workers can view earnings' },
        { status: 403 }
      )
    }

    const userId = session.user.id

    // Get worker profile for total earnings
    const workerProfile = await prisma.workerProfile.findUnique({
      where: { userId },
      select: { totalEarnings: true, completedJobs: true, averageRating: true },
    })

    // Get current month start
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Get completed bookings this month and last month for comparison
    const [thisMonthBookings, lastMonthBookings] = await Promise.all([
      prisma.booking.findMany({
        where: {
          workerId: userId,
          status: 'completed',
          completedAt: { gte: monthStart },
        },
        select: { agreedAmount: true, finalAmount: true, completedAt: true },
      }),
      prisma.booking.findMany({
        where: {
          workerId: userId,
          status: 'completed',
          completedAt: { gte: lastMonthStart, lt: monthStart },
        },
        select: { agreedAmount: true, finalAmount: true },
      }),
    ])

    // Get payment records for transaction history
    const transactions = await prisma.paymentRecord.findMany({
      where: { userId },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        description: true,
        processedAt: true,
        createdAt: true,
        booking: {
          select: {
            job: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Calculate totals
    const thisMonthEarnings = thisMonthBookings.reduce(
      (sum, b) => sum + (b.finalAmount ?? b.agreedAmount),
      0
    )
    const lastMonthEarnings = lastMonthBookings.reduce(
      (sum, b) => sum + (b.finalAmount ?? b.agreedAmount),
      0
    )

    // Calculate withdrawn amounts
    const withdrawn = await prisma.paymentRecord.aggregate({
      where: { userId, type: 'withdrawal', status: 'completed' },
      _sum: { amount: true },
    })

    const totalEarned = workerProfile?.totalEarnings ?? 0
    const totalWithdrawn = Math.abs(withdrawn._sum.amount ?? 0)
    const availableBalance = totalEarned - totalWithdrawn

    // Build daily earnings for chart (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const recentBookings = await prisma.booking.findMany({
      where: {
        workerId: userId,
        status: 'completed',
        completedAt: { gte: thirtyDaysAgo },
      },
      select: { agreedAmount: true, finalAmount: true, completedAt: true },
      orderBy: { completedAt: 'asc' },
    })

    // Group by day
    const dailyEarnings: Array<{ date: string; amount: number }> = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const dayEarnings = recentBookings
        .filter((b) => b.completedAt && b.completedAt.toISOString().split('T')[0] === dateStr)
        .reduce((sum, b) => sum + (b.finalAmount ?? b.agreedAmount), 0)
      dailyEarnings.push({ date: dateStr, amount: dayEarnings })
    }

    // Monthly change percentage
    const monthlyChange =
      lastMonthEarnings > 0
        ? Math.round(((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100)
        : thisMonthEarnings > 0
          ? 100
          : 0

    return NextResponse.json({
      success: true,
      data: {
        availableBalance,
        totalEarned,
        totalWithdrawn,
        thisMonthEarnings,
        lastMonthEarnings,
        monthlyChange,
        completedJobs: workerProfile?.completedJobs ?? 0,
        averageRating: workerProfile?.averageRating ?? 0,
        dailyEarnings,
        transactions: transactions.map((t) => ({
          id: t.id,
          amount: t.amount,
          type: t.type,
          status: t.status,
          description: t.description || t.booking?.job?.title || 'Transaction',
          date: t.processedAt || t.createdAt,
        })),
      },
    })
  } catch (error) {
    console.error('Earnings fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}
