'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Star, MapPin, Clock, BadgeCheck, Award,
  MessageCircle, Calendar, CheckCircle2, Briefcase,
  Shield, DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

// Mock hirer data
const mockHirer = {
  id: 'h1',
  name: 'Alex Johnson',
  avatar: 'A',
  bio: 'Busy professional looking for reliable help with various household tasks. I value punctuality, quality work, and good communication.',
  rating: 4.9,
  reviews: 12,
  verified: true,
  jobsPosted: 15,
  memberSince: 'January 2024',
  location: 'San Francisco, CA',
  responseTime: '< 1 hour',
  responseRate: '95%',
  totalSpent: 2450,
  badges: [
    { id: '1', name: 'Verified', icon: BadgeCheck, color: 'text-emerald-400' },
    { id: '2', name: 'Quick Payer', icon: DollarSign, color: 'text-emerald-400' },
    { id: '3', name: '10+ Jobs', icon: Briefcase, color: 'text-purple-400' },
  ],
  recentReviews: [
    {
      id: '1',
      worker: 'Sarah K.',
      rating: 5,
      comment: 'Great client! Clear instructions, fair pay, and quick to respond. Would work with again.',
      job: 'IKEA Furniture Assembly',
      date: '2 days ago',
    },
    {
      id: '2',
      worker: 'Marcus T.',
      rating: 5,
      comment: 'Very respectful and paid promptly after the job was done. Easy to work with.',
      job: 'Help Moving Furniture',
      date: '1 week ago',
    },
    {
      id: '3',
      worker: 'David C.',
      rating: 4,
      comment: 'Good communication throughout the job. Fair expectations.',
      job: 'Deep House Cleaning',
      date: '2 weeks ago',
    },
  ],
  recentJobs: [
    { id: '1', title: 'Deep House Cleaning', date: 'Posted 2 hours ago', budget: '$120-180', status: 'active' },
    { id: '2', title: 'Help Moving Furniture', date: '1 day ago', budget: '$150-250', status: 'in-progress' },
    { id: '3', title: 'IKEA Furniture Assembly', date: '3 days ago', budget: '$80-120', status: 'completed' },
  ],
}

export default function HirerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'jobs'>('about')

  const handleMessage = () => {
    router.push('/work/messages')
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="relative shrink-0 mx-auto sm:mx-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
                {mockHirer.avatar}
              </div>
              {mockHirer.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl font-bold text-white">{mockHirer.name}</h1>
                {mockHirer.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full mx-auto sm:mx-0">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-semibold">{mockHirer.rating}</span>
                  <span>({mockHirer.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {mockHirer.location}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {mockHirer.jobsPosted} jobs posted
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mt-4 justify-center sm:justify-start flex-wrap">
                {mockHirer.badges.map((badge) => {
                  const Icon = badge.icon
                  return (
                    <div
                      key={badge.id}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full"
                    >
                      <Icon className={cn('w-3.5 h-3.5', badge.color)} />
                      <span className="text-xs text-slate-300">{badge.name}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:w-auto w-full">
              <button
                onClick={handleMessage}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['about', 'reviews', 'jobs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors capitalize',
                activeTab === tab
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Bio */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">About</h2>
              <p className="text-slate-300 leading-relaxed">{mockHirer.bio}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{mockHirer.jobsPosted}</div>
                <div className="text-sm text-slate-400 mt-1">Jobs Posted</div>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{mockHirer.responseRate}</div>
                <div className="text-sm text-slate-400 mt-1">Response Rate</div>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{mockHirer.responseTime}</div>
                <div className="text-sm text-slate-400 mt-1">Response Time</div>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-2xl font-bold text-white">{mockHirer.rating}</span>
                </div>
                <div className="text-sm text-slate-400 mt-1">Rating</div>
              </div>
            </div>

            {/* Member Info */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Member since</span>
                  <span className="text-white">{mockHirer.memberSince}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Location</span>
                  <span className="text-white">{mockHirer.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Verification</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Shield className="w-4 h-4" />
                    ID Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Total spent on platform</span>
                  <span className="text-emerald-400 font-semibold">${mockHirer.totalSpent.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-400">
                Reviews from workers who have completed jobs for {mockHirer.name}
              </p>
            </div>
            {mockHirer.recentReviews.map((review) => (
              <div
                key={review.id}
                className="bg-slate-900 border border-white/5 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{review.worker}</span>
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
                    <p className="text-sm text-slate-300 mt-2">{review.comment}</p>
                    <p className="text-xs text-slate-500 mt-3">
                      {review.job} • {review.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center py-4">
              <p className="text-slate-400 text-sm">
                Showing {mockHirer.recentReviews.length} of {mockHirer.reviews} reviews
              </p>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-400">
                Recent jobs posted by {mockHirer.name}
              </p>
            </div>
            {mockHirer.recentJobs.map((job) => (
              <Link
                key={job.id}
                href={`/work/job/${job.id}`}
                className="block bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{job.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{job.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 font-semibold">{job.budget}</div>
                    <div className={cn(
                      'text-xs mt-1 px-2 py-0.5 rounded-full inline-block',
                      job.status === 'active' && 'bg-emerald-500/20 text-emerald-400',
                      job.status === 'in-progress' && 'bg-blue-500/20 text-blue-400',
                      job.status === 'completed' && 'bg-slate-500/20 text-slate-400'
                    )}>
                      {job.status === 'in-progress' ? 'In Progress' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
