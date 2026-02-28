'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Star, MapPin, Clock, BadgeCheck, Award,
  MessageCircle, Calendar, CheckCircle2, Briefcase,
  Shield, DollarSign, Loader2, AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton, Rating } from '@/components/ui/Card'
import { GlassPanel, GlassCard, FeatureCard } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Card'
import { AmbientBackground } from '@/components/AmbientBackground'

interface HirerProfileInfo {
  companyName: string | null
  bio: string | null
  isVerified: boolean
  totalJobsPosted: number
  averageRating: number
}

interface UserData {
  id: string
  name: string | null
  avatarUrl: string | null
  role: string
  memberSince: string
  reviewCount: number
  workerProfile: null
  hirerProfile: HirerProfileInfo | null
}

function HirerProfileSkeleton() {
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
          <Skeleton variant="rectangular" height={150} className="rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export default function HirerProfilePage() {
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
    router.push('/work/messages')
  }

  if (loading) {
    return <HirerProfileSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-white text-lg font-medium">
            {error === 'User not found' ? 'Hirer not found' : 'Failed to load profile'}
          </p>
          <p className="text-slate-400">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button variant="success" onClick={fetchUser}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const hp = user.hirerProfile
  const displayName = user.name || 'Hirer'
  const memberSince = new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8 relative">
      <AmbientBackground intensity="low" />

      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50 backdrop-blur-sm relative z-10">
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

      <div className="max-w-4xl mx-auto px-4 py-6 relative z-10">
        {/* Profile Header */}
        <GlassPanel variant="elevated" padding="lg" border="light" rounded="xl" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar with gradient ring */}
            <div className="relative shrink-0 mx-auto sm:mx-0">
              <div className="absolute -inset-3 bg-cyan-500/10 blur-3xl rounded-full" />
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold ring-2 ring-cyan-500/30 ring-offset-2 ring-offset-slate-950">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={displayName} width={96} height={96} className="w-24 h-24 rounded-2xl object-cover" />
                ) : (
                  displayName.charAt(0)
                )}
              </div>
              {hp?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-900 z-10">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                {hp?.isVerified && (
                  <Badge variant="success" size="sm" className="mx-auto sm:mx-0 w-fit">
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Rating value={hp?.averageRating ?? 0} size="sm" showValue={false} />
                  <span className="text-white font-semibold ml-1">{hp?.averageRating?.toFixed(1) || '0.0'}</span>
                  <span>({user.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {hp?.totalJobsPosted ?? 0} jobs posted
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mt-4 justify-center sm:justify-start flex-wrap">
                {hp?.isVerified && (
                  <GlassPanel variant="subtle" padding="none" rounded="2xl" border="light" className="flex items-center gap-1.5 px-2.5 py-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-slate-300">Verified</span>
                  </GlassPanel>
                )}
                {(hp?.averageRating ?? 0) >= 4.5 && (
                  <GlassPanel variant="subtle" padding="none" rounded="2xl" border="light" className="flex items-center gap-1.5 px-2.5 py-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-slate-300">Top Rated</span>
                  </GlassPanel>
                )}
                {(hp?.totalJobsPosted ?? 0) >= 10 && (
                  <GlassPanel variant="subtle" padding="none" rounded="2xl" border="light" className="flex items-center gap-1.5 px-2.5 py-1">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-slate-300">{hp?.totalJobsPosted}+ Jobs</span>
                  </GlassPanel>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:w-auto w-full">
              <Button
                variant="success"
                size="lg"
                onClick={handleMessage}
                leftIcon={<MessageCircle className="w-4 h-4" />}
                fullWidth
              >
                Message
              </Button>
            </div>
          </div>
        </GlassPanel>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['about', 'reviews'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'capitalize',
                activeTab === tab && 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 focus-visible:ring-emerald-500'
              )}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Bio */}
            <GlassPanel variant="default" padding="lg" border="light" rounded="xl">
              <h2 className="text-lg font-semibold text-white mb-4">About</h2>
              <p className="text-slate-300 leading-relaxed">
                {hp?.bio || 'This hirer has not added a bio yet.'}
              </p>
            </GlassPanel>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Jobs Posted', value: hp?.totalJobsPosted ?? 0, gradient: 'cyan' as const },
                { label: 'Reviews', value: user.reviewCount, gradient: 'purple' as const },
                { label: 'Rating', value: hp?.averageRating?.toFixed(1) || '0.0', gradient: 'amber' as const, showStar: true },
              ].map((stat, index) => (
                <FeatureCard
                  key={stat.label}
                  gradient={stat.gradient}
                  shine
                  className="animate-card-enter"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {stat.showStar && <Star className="w-5 h-5 text-amber-400 fill-amber-400" />}
                      <span className="text-2xl font-bold text-white">{stat.value}</span>
                    </div>
                    <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                  </div>
                </FeatureCard>
              ))}
            </div>

            {/* Member Info */}
            <GlassPanel variant="default" padding="lg" border="light" rounded="xl">
              <h2 className="text-lg font-semibold text-white mb-4">Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Member since</span>
                  <span className="text-white">{memberSince}</span>
                </div>
                {hp?.companyName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Company</span>
                    <span className="text-white">{hp.companyName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Verification</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    {hp?.isVerified ? (
                      <>
                        <Shield className="w-4 h-4" />
                        ID Verified
                      </>
                    ) : (
                      <span className="text-slate-500">Not verified</span>
                    )}
                  </span>
                </div>
              </div>
            </GlassPanel>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <GlassPanel variant="subtle" padding="md" border="light" rounded="xl" className="mb-4">
              <p className="text-sm text-slate-400">
                Reviews from workers who have completed jobs for {displayName}
              </p>
            </GlassPanel>
            {user.reviewCount > 0 ? (
              <GlassCard
                interactive={false}
                className="text-center animate-card-enter"
              >
                <p className="text-slate-400">
                  {user.reviewCount} review{user.reviewCount !== 1 ? 's' : ''} available.
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Detailed review listing coming soon.
                </p>
              </GlassCard>
            ) : (
              <GlassCard interactive={false} className="text-center animate-card-enter">
                <p className="text-slate-400">No reviews yet</p>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
