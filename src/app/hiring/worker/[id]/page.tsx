'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Star, MapPin, Clock, BadgeCheck, Award,
  MessageCircle, Calendar, CheckCircle2, Briefcase,
  Shield, ThumbsUp, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

// Mock worker data
const mockWorker = {
  id: 'w1',
  name: 'Maria Garcia',
  avatar: 'M',
  bio: 'Professional cleaner with 5+ years of experience. I specialize in deep cleaning, move-out cleaning, and regular maintenance. I take pride in my attention to detail and always leave homes spotless.',
  rating: 4.9,
  reviews: 127,
  verified: true,
  completedJobs: 215,
  memberSince: 'March 2023',
  location: 'San Francisco, CA',
  responseTime: '< 30 min',
  responseRate: '98%',
  skills: ['Deep Cleaning', 'Move-out Cleaning', 'Window Cleaning', 'Organization', 'Laundry'],
  badges: [
    { id: '1', name: 'Verified', icon: BadgeCheck, color: 'text-cyan-400' },
    { id: '2', name: 'Top Rated', icon: Star, color: 'text-amber-400' },
    { id: '3', name: '200+ Jobs', icon: Award, color: 'text-purple-400' },
  ],
  recentReviews: [
    {
      id: '1',
      hirer: 'Alex J.',
      rating: 5,
      comment: 'Maria did an amazing job! My apartment has never looked this clean. She was punctual, professional, and thorough. Highly recommend!',
      job: 'Deep House Cleaning',
      date: '1 week ago',
    },
    {
      id: '2',
      hirer: 'Sam W.',
      rating: 5,
      comment: 'Excellent work on the move-out cleaning. Got my full deposit back thanks to Maria!',
      job: 'Move-out Cleaning',
      date: '2 weeks ago',
    },
    {
      id: '3',
      hirer: 'Jordan K.',
      rating: 4,
      comment: 'Great job overall. Very detail-oriented and friendly.',
      job: 'Regular Cleaning',
      date: '3 weeks ago',
    },
  ],
  completedJobsRecent: [
    { id: '1', title: 'Deep House Cleaning', date: '1 week ago', amount: 150 },
    { id: '2', title: 'Move-out Cleaning', date: '2 weeks ago', amount: 200 },
    { id: '3', title: 'Regular Cleaning', date: '3 weeks ago', amount: 80 },
  ],
}

export default function WorkerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'jobs'>('about')

  const handleMessage = () => {
    router.push('/hiring/messages')
  }

  const handleHire = () => {
    toast.success('Redirecting to job posting...')
    router.push('/hiring/post')
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
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {mockWorker.avatar}
              </div>
              {mockWorker.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl font-bold text-white">{mockWorker.name}</h1>
                {mockWorker.verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full mx-auto sm:mx-0">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-semibold">{mockWorker.rating}</span>
                  <span>({mockWorker.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {mockWorker.location}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {mockWorker.completedJobs} jobs
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mt-4 justify-center sm:justify-start flex-wrap">
                {mockWorker.badges.map((badge) => {
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
                onClick={handleHire}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Hire Now
              </button>
              <button
                onClick={handleMessage}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
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
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
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
              <p className="text-slate-300 leading-relaxed">{mockWorker.bio}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{mockWorker.completedJobs}</div>
                <div className="text-sm text-slate-400 mt-1">Jobs Done</div>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{mockWorker.responseRate}</div>
                <div className="text-sm text-slate-400 mt-1">Response Rate</div>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{mockWorker.responseTime}</div>
                <div className="text-sm text-slate-400 mt-1">Response Time</div>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-2xl font-bold text-white">{mockWorker.rating}</span>
                </div>
                <div className="text-sm text-slate-400 mt-1">Rating</div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {mockWorker.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Member Info */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Member since</span>
                  <span className="text-white">{mockWorker.memberSince}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Location</span>
                  <span className="text-white">{mockWorker.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Verification</span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Shield className="w-4 h-4" />
                    ID Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {mockWorker.recentReviews.map((review) => (
              <div
                key={review.id}
                className="bg-slate-900 border border-white/5 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{review.hirer}</span>
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
                Showing {mockWorker.recentReviews.length} of {mockWorker.reviews} reviews
              </p>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {mockWorker.completedJobsRecent.map((job) => (
              <div
                key={job.id}
                className="bg-slate-900 border border-white/5 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">{job.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{job.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 font-semibold">${job.amount}</div>
                    <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
