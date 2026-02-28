'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Star, ArrowLeft, AlertCircle, Loader2, RefreshCw
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton, Rating } from '@/components/ui/Card'
import { GlassPanel, GlassCard, FeatureCard } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'
import { AmbientBackground } from '@/components/AmbientBackground'

interface ReviewAuthor {
  id: string
  name: string | null
  avatarUrl: string | null
  image: string | null
}

interface ReviewBooking {
  id: string
  job: {
    id: string
    title: string
    category: string
  } | null
}

interface Review {
  id: string
  rating: number
  title: string | null
  content: string | null
  response: string | null
  createdAt: string
  author: ReviewAuthor
  booking: ReviewBooking | null
}

interface ReviewStats {
  avgRating: number
  totalReviews: number
  distribution: Record<number, number>
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex items-center gap-3">
            <Skeleton variant="text" width={80} height={48} />
            <div className="space-y-1">
              <Skeleton variant="text" width={100} height={16} />
              <Skeleton variant="text" width={70} height={14} />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton variant="text" width={40} height={14} />
                <Skeleton variant="text" width="100%" height={8} />
                <Skeleton variant="text" width={20} height={14} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Reviews skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <Skeleton variant="rectangular" width={48} height={48} className="!rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton variant="text" width={100} height={16} />
                <Skeleton variant="text" width={80} height={14} />
              </div>
              <Skeleton variant="text" width="90%" height={14} />
              <Skeleton variant="text" width="60%" height={14} />
              <Skeleton variant="text" width={120} height={12} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function computeStats(reviews: Review[]): ReviewStats {
  if (reviews.length === 0) {
    return { avgRating: 0, totalReviews: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
  }

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let sum = 0

  for (const review of reviews) {
    sum += review.rating
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1
    }
  }

  return {
    avgRating: Math.round((sum / reviews.length) * 10) / 10,
    totalReviews: reviews.length,
    distribution,
  }
}

export default function HiringReviewsPage() {
  const { data: session } = useSession()
  const toast = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all')

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/reviews?type=received')
      if (!res.ok) throw new Error('Failed to load reviews')
      const json = await res.json()
      setReviews(json.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const stats = computeStats(reviews)

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(r => r.rating === parseInt(filter))

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8 relative">
      <AmbientBackground intensity="low" />

      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/hiring/profile"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <h1 className="text-2xl font-bold text-white">Reviews from Workers</h1>
          <p className="text-slate-400 mt-1">See what workers say about working with you</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {loading ? (
          <ReviewsSkeleton />
        ) : error ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Failed to load reviews</h2>
            <p className="text-slate-400 max-w-sm mx-auto mb-6">{error}</p>
            <Button
              variant="primary"
              onClick={fetchReviews}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <GlassPanel variant="elevated" padding="lg" border="light" rounded="xl">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Rating Summary */}
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                      {stats.avgRating || '0.0'}
                    </span>
                    <div className="flex flex-col">
                      <Rating value={stats.avgRating} size="sm" showValue={false} />
                      <span className="text-sm text-slate-400">{stats.totalReviews} reviews</span>
                    </div>
                  </div>
                </div>

                {/* Rating Breakdown */}
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.distribution[rating] || 0
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm text-slate-400 w-8">{rating} star</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-400 w-8">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </GlassPanel>

            {/* Filter */}
            <GlassPanel variant="subtle" padding="none" border="light" rounded="lg" className="flex items-center gap-1 p-1 overflow-x-auto">
              {(['all', '5', '4', '3', '2', '1'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="whitespace-nowrap"
                >
                  {f === 'all' ? 'All Reviews' : `${f} Stars`}
                </Button>
              ))}
            </GlassPanel>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review, index) => {
                  const authorName = review.author?.name || 'Anonymous'
                  const avatarInitial = authorName.charAt(0).toUpperCase()
                  const jobTitle = review.booking?.job?.title || 'Job'

                  return (
                    <GlassCard
                      key={review.id}
                      interactive={false}
                      className="animate-card-enter"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-semibold shrink-0">
                          {review.author?.avatarUrl || review.author?.image ? (
                            <img
                              src={review.author.avatarUrl || review.author.image || ''}
                              alt={authorName}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          ) : (
                            avatarInitial
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white">{authorName}</span>
                            <Rating value={review.rating} size="sm" showValue={false} />
                          </div>
                          {review.title && (
                            <p className="text-white font-medium mt-1">{review.title}</p>
                          )}
                          <p className="text-slate-300 mt-2">{review.content || 'No comment provided.'}</p>
                          <p className="text-xs text-slate-500 mt-3">
                            {jobTitle} {' '} {formatRelativeTime(review.createdAt)}
                          </p>

                          {review.response && (
                            <div className="mt-4 pl-4 border-l-2 border-cyan-500/30">
                              <p className="text-sm text-slate-400">
                                <span className="text-cyan-400 font-medium">Your response:</span> {review.response}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">No reviews found</h3>
                  <p className="text-slate-400">
                    {filter === 'all'
                      ? 'No reviews yet. Reviews will appear here after workers review completed jobs.'
                      : 'No reviews match the selected filter.'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
