'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  User, Mail, Phone, MapPin, Camera, Edit, Shield,
  Star, CheckCircle2, Calendar, Briefcase, CreditCard,
  Settings, ChevronRight, BadgeCheck, Award, Loader2,
  AlertCircle, Save, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Card'

interface HirerProfileData {
  companyName: string | null
  bio: string | null
  defaultLat: number | null
  defaultLng: number | null
  defaultAddress: string | null
  totalJobsPosted: number
  totalSpent: number
  averageRating: number
  isVerified: boolean
  paymentVerified: boolean
}

interface ProfileData {
  id: string
  name: string | null
  email: string
  phone: string | null
  avatarUrl: string | null
  role: string
  createdAt: string
  workerProfile: null
  hirerProfile: HirerProfileData | null
  _count: {
    jobs: number
    bids: number
    reviewsReceived: number
  }
}

function ProfileSkeleton() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-start gap-6">
            <Skeleton variant="rectangular" width={96} height={96} className="rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="50%" height={16} />
              <div className="flex gap-2 mt-3">
                <Skeleton variant="rectangular" width={120} height={28} className="rounded-full" />
                <Skeleton variant="rectangular" width={100} height={28} className="rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={80} className="rounded-xl" />
          ))}
        </div>
        <Skeleton variant="rectangular" height={120} className="rounded-xl" />
        <Skeleton variant="rectangular" height={150} className="rounded-xl" />
      </div>
    </div>
  )
}

export default function HiringProfilePage() {
  const { data: session } = useSession()
  const toast = useToast()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Editable fields
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editCompanyName, setEditCompanyName] = useState('')

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to load profile')
      const json = await res.json()
      const data = json.data || json
      setProfile(data)
      // Populate edit fields
      setEditName(data.name || '')
      setEditPhone(data.phone || '')
      setEditBio(data.hirerProfile?.bio || '')
      setEditCompanyName(data.hirerProfile?.companyName || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const saveProfile = async () => {
    try {
      setSaving(true)
      const updates: Record<string, unknown> = {
        name: editName,
        phone: editPhone || undefined,
        hirerProfile: {
          bio: editBio || undefined,
          companyName: editCompanyName || undefined,
        },
      }
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to save profile')
      const json = await res.json()
      setProfile(json.data || json)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const cancelEditing = () => {
    if (profile) {
      setEditName(profile.name || '')
      setEditPhone(profile.phone || '')
      setEditBio(profile.hirerProfile?.bio || '')
      setEditCompanyName(profile.hirerProfile?.companyName || '')
    }
    setIsEditing(false)
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-white text-lg font-medium">Failed to load profile</p>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={fetchProfile}
            className="px-6 py-2.5 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-400 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const hp = profile.hirerProfile
  const displayName = profile.name || 'Hirer'
  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {profile.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt={displayName} width={96} height={96} className="w-24 h-24 rounded-2xl object-cover" />
                ) : (
                  displayName.charAt(0)
                )}
              </div>
              <button className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </button>
              {hp?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-2xl font-bold text-white bg-slate-800 border border-white/10 rounded-lg px-3 py-1"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                )}
                {hp?.isVerified && (
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {hp?.defaultAddress || 'Location not set'}
              </p>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Member since {memberSince}
              </p>

              {/* Badges */}
              <div className="flex gap-2 mt-3">
                {hp?.isVerified && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full">
                    <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-300">Verified Hirer</span>
                  </div>
                )}
                {(hp?.averageRating ?? 0) >= 4.5 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-slate-300">Top Rated</span>
                  </div>
                )}
                {(hp?.totalJobsPosted ?? 0) >= 10 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 rounded-full">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-slate-300">{hp?.totalJobsPosted}+ Jobs</span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit / Save Buttons */}
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white text-sm font-medium rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="text-2xl font-bold text-white">{hp?.totalJobsPosted ?? profile._count.jobs}</div>
            <div className="text-xs text-slate-400 mt-1">Jobs Posted</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="text-2xl font-bold text-white">{profile._count.jobs}</div>
            <div className="text-xs text-slate-400 mt-1">Completed</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              ${(hp?.totalSpent ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">Total Spent</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-2xl font-bold text-white">{hp?.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Avg Rating</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="text-2xl font-bold text-white">{profile._count.reviewsReceived}</div>
            <div className="text-xs text-slate-400 mt-1">Reviews Given</div>
          </div>
        </div>

        {/* Bio / Company */}
        {isEditing && (
          <div className="bg-slate-900 rounded-xl border border-white/5 p-5">
            <h2 className="font-semibold text-white mb-3">Company Name</h2>
            <input
              type="text"
              value={editCompanyName}
              onChange={(e) => setEditCompanyName(e.target.value)}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              placeholder="Your company name (optional)"
            />
          </div>
        )}

        {(isEditing || hp?.bio) && (
          <div className="bg-slate-900 rounded-xl border border-white/5 p-5">
            <h2 className="font-semibold text-white mb-3">About</h2>
            {isEditing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={4}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="Tell workers about yourself or your company..."
              />
            ) : (
              <p className="text-slate-300">{hp?.bio}</p>
            )}
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Contact Information</h2>
          </div>
          <div className="divide-y divide-white/5">
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Email</div>
                <div className="text-white">{profile.email}</div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Verified
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <Phone className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Phone</div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    placeholder="+1 (555) 555-0000"
                  />
                ) : (
                  <div className="text-white">{profile.phone || 'Not provided'}</div>
                )}
              </div>
              {profile.phone && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified
                </div>
              )}
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Location</div>
                <div className="text-white">{hp?.defaultAddress || 'Not set'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews from Workers - empty state since we don't fetch reviews in profile API */}
        <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-white">Reviews from Workers</h2>
            <Link
              href="/hiring/reviews"
              className="text-sm text-cyan-400 hover:underline"
            >
              View all
            </Link>
          </div>
          {profile._count.reviewsReceived > 0 ? (
            <div className="p-6 text-center">
              <p className="text-slate-400">
                You have {profile._count.reviewsReceived} review{profile._count.reviewsReceived !== 1 ? 's' : ''}.
              </p>
              <Link href="/hiring/reviews" className="text-cyan-400 hover:underline text-sm mt-1 inline-block">
                View all reviews
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-400">No reviews yet</p>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Quick Links</h2>
          </div>
          <div className="divide-y divide-white/5">
            <Link
              href="/hiring/settings"
              className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <Settings className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">Account Settings</div>
                <div className="text-sm text-slate-400">Manage your account preferences</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </Link>
            <Link
              href="/hiring/settings#payments"
              className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">Payment Methods</div>
                <div className="text-sm text-slate-400">Manage your cards and payment options</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </Link>
            <Link
              href="/hiring/settings#security"
              className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <Shield className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">Security & Privacy</div>
                <div className="text-sm text-slate-400">Password, 2FA, and privacy settings</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
