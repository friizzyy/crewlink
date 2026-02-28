'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Star, MapPin, Clock, BadgeCheck, Award,
  MessageCircle, Calendar, CheckCircle2, Briefcase,
  Shield, ThumbsUp, ExternalLink, Loader2, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Card'

interface WorkerProfileInfo {
  headline: string | null
  bio: string | null
  hourlyRate: number | null
  skills: string[]
  isVerified: boolean
  serviceRadius: number
  averageRating: number
  completedJobs: number
}

interface UserData {
  id: string
  name: string | null
  avatarUrl: string | null
  role: string
  memberSince: string
  reviewCount: number
  workerProfile: WorkerProfileInfo | null
  hirerProfile: null
}

function WorkerProfileSkeleton() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Skeleton variant="text" width={80} height={20} />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Skeleton variant="rectangular" width={96} height={96} className="rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton variant="text" width="50%" height={28} />
              <Skeleton variant="text" width="70%" height={16} />
              <div className="flex gap-2">
                <Skeleton variant="rectangular" width={100} height={28} className="rounded-full" />
                <Skeleton variant="rectangular" width={100} height={28} className="rounded-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton variant="rectangular" height={120} className="rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={80} className="rounded-xl" />
            ))}
          </div>
          <Skeleton variant="rectangular" height={100} className="rounded-2xl" />
          <Skeleton variant="rectangular" height={150} className="rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export default function WorkerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast()
  const userId = params.id as string

  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'jobs'>('about')

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/users/${userId}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('User not found')
        throw new Error('Failed to load profile')
      }
      const json = await res.json()
      setUser(json.data || json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchUser()
    }
  }, [userId, fetchUser])

  const handleMessage = () => {
    router.push('/hiring/messages')
  }

  const handleHire = () => {
    toast.success('Redirecting to job posting...')
    router.push('/hiring/post')
  }

  if (loading) {
    return <WorkerProfileSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-white text-lg font-medium">
            {error === 'User not found' ? 'Worker not found' : 'Failed to load profile'}
          </p>
          <p className="text-slate-400">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={fetchUser}
              className="px-6 py-2.5 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-400 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const wp = user.workerProfile
  const displayName = user.name || 'Worker'
  const memberSince = new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

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
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={displayName} width={96} height={96} className="w-24 h-24 rounded-2xl object-cover" />
                ) : (
                  displayName.charAt(0)
                )}
              </div>
              {wp?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                {wp?.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full mx-auto sm:mx-0">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              {wp?.headline && (
                <p className="text-slate-300 text-sm mt-1">{wp.headline}</p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-semibold">{wp?.averageRating?.toFixed(1) || '0.0'}</span>
                  <span>({user.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {wp?.completedJobs ?? 0} jobs
                </div>
                {wp?.hourlyRate && (
                  <div className="flex items-center gap-1 text-cyan-400">
                    ${wp.hourlyRate}/hr
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex gap-2 mt-4 justify-center sm:justify-start flex-wrap">
                {wp?.isVerified && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-300">Verified</span>
                  </div>
                )}
                {(wp?.averageRating ?? 0) >= 4.5 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-slate-300">Top Rated</span>
                  </div>
                )}
                {(wp?.completedJobs ?? 0) >= 200 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-slate-300">{wp?.completedJobs}+ Jobs</span>
                  </div>
                )}
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
          {(['about', 'reviews'] as const).map((tab) => (
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
              <p className="text-slate-300 leading-relaxed">
                {wp?.bio || 'This worker has not added a bio yet.'}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{wp?.completedJobs ?? 0}</div>
                <div className="text-sm text-slate-400 mt-1">Jobs Done</div>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{user.reviewCount}</div>
                <div className="text-sm text-slate-400 mt-1">Reviews</div>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{wp?.serviceRadius ?? 25} mi</div>
                <div className="text-sm text-slate-400 mt-1">Service Radius</div>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="text-2xl font-bold text-white">{wp?.averageRating?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="text-sm text-slate-400 mt-1">Rating</div>
              </div>
            </div>

            {/* Skills */}
            {(wp?.skills ?? []).length > 0 && (
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {wp?.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Member Info */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Member since</span>
                  <span className="text-white">{memberSince}</span>
                </div>
                {wp?.hourlyRate && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Hourly Rate</span>
                    <span className="text-cyan-400 font-semibold">${wp.hourlyRate}/hr</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Verification</span>
                  <span className="flex items-center gap-1">
                    {wp?.isVerified ? (
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Shield className="w-4 h-4" />
                        ID Verified
                      </span>
                    ) : (
                      <span className="text-slate-500">Not verified</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {user.reviewCount > 0 ? (
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center">
                <p className="text-slate-400">
                  {user.reviewCount} review{user.reviewCount !== 1 ? 's' : ''} available.
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Detailed review listing coming soon.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 text-center">
                <p className="text-slate-400">No reviews yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
