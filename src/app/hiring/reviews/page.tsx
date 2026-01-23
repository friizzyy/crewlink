'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Star, ArrowLeft, Filter, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock reviews data
const mockReviews = [
  {
    id: '1',
    worker: {
      name: 'Sarah K.',
      avatar: 'S',
    },
    rating: 5,
    comment: 'Great communication and paid promptly. Would work with again!',
    job: 'IKEA Furniture Assembly',
    date: '2 days ago',
    response: null,
  },
  {
    id: '2',
    worker: {
      name: 'Marcus T.',
      avatar: 'M',
    },
    rating: 5,
    comment: 'Very clear instructions and easy to work with. The job went smoothly.',
    job: 'Help Moving Furniture',
    date: '1 week ago',
    response: 'Thanks Marcus! Great job on the move.',
  },
  {
    id: '3',
    worker: {
      name: 'David C.',
      avatar: 'D',
    },
    rating: 4,
    comment: 'Good client overall. Fair expectations and reasonable timeline.',
    job: 'Deep House Cleaning',
    date: '2 weeks ago',
    response: null,
  },
  {
    id: '4',
    worker: {
      name: 'Lisa M.',
      avatar: 'L',
    },
    rating: 5,
    comment: 'Excellent experience! Very respectful and the home was ready for cleaning.',
    job: 'Regular Cleaning',
    date: '3 weeks ago',
    response: 'Thank you Lisa! Your work was amazing.',
  },
  {
    id: '5',
    worker: {
      name: 'James P.',
      avatar: 'J',
    },
    rating: 5,
    comment: 'One of the best clients on the platform. Clear communication and prompt payment.',
    job: 'Yard Work',
    date: '1 month ago',
    response: null,
  },
]

const stats = {
  avgRating: 4.9,
  totalReviews: 7,
  fiveStars: 6,
  fourStars: 1,
  threeStars: 0,
  twoStars: 0,
  oneStars: 0,
}

export default function HiringReviewsPage() {
  const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all')

  const filteredReviews = filter === 'all'
    ? mockReviews
    : mockReviews.filter(r => r.rating === parseInt(filter))

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
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

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Rating Summary */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-5xl font-bold text-white">{stats.avgRating}</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-4 h-4',
                          i < Math.round(stats.avgRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-400">{stats.totalReviews} reviews</span>
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats[`${rating === 5 ? 'fiveStars' : rating === 4 ? 'fourStars' : rating === 3 ? 'threeStars' : rating === 2 ? 'twoStars' : 'oneStars'}` as keyof typeof stats] as number
                const percentage = (count / stats.totalReviews) * 100
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-8">{rating} star</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-400 w-8">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', '5', '4', '3', '2', '1'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                filter === f
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-white'
              )}
            >
              {f === 'all' ? 'All Reviews' : `${f} Stars`}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-slate-900 border border-white/5 rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-semibold shrink-0">
                    {review.worker.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white">{review.worker.name}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-3.5 h-3.5',
                              i < review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 mt-2">{review.comment}</p>
                    <p className="text-xs text-slate-500 mt-3">
                      {review.job} • {review.date}
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
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">No reviews found</h3>
              <p className="text-slate-400">No reviews match the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
