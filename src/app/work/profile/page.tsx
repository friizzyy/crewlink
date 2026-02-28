'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import {
  User, Mail, Phone, MapPin, Camera, Edit, Shield,
  Star, CheckCircle2, Calendar, Briefcase, DollarSign,
  Settings, ChevronRight, BadgeCheck, Award, Clock,
  Plus, Trash2, Image as ImageIcon, Loader2, AlertCircle,
  Save, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'
import { Skeleton } from '@/components/ui/Card'
import { GlassPanel, GlassCard, FeatureCard } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Card'
import { AmbientBackground } from '@/components/AmbientBackground'

interface WorkerProfileData {
  headline: string | null
  bio: string | null
  hourlyRate: number | null
  skills: string[]
  isVerified: boolean
  serviceRadius: number
  baseLat: number | null
  baseLng: number | null
  baseAddress: string | null
  completedJobs: number
  totalEarnings: number
  averageRating: number
  responseRate: number
  isActive: boolean
  instantBook?: boolean
}

interface ProfileData {
  id: string
  name: string | null
  email: string
  phone: string | null
  avatarUrl: string | null
  role: string
  createdAt: string
  workerProfile: WorkerProfileData | null
  hirerProfile: null
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
        <Skeleton variant="rectangular" height={100} className="rounded-xl" />
      </div>
    </div>
  )
}

// ============================================
// COMPONENT
// ============================================

export default function WorkProfilePage() {
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
  const [editHourlyRate, setEditHourlyRate] = useState('')
  const [editSkills, setEditSkills] = useState('')

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
      setEditBio(data.workerProfile?.bio || '')
      setEditHourlyRate(data.workerProfile?.hourlyRate?.toString() || '')
      setEditSkills(data.workerProfile?.skills?.join(', ') || '')
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
        workerProfile: {
          bio: editBio || undefined,
          hourlyRate: editHourlyRate ? parseFloat(editHourlyRate) : undefined,
          skills: editSkills ? editSkills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
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
      setEditBio(profile.workerProfile?.bio || '')
      setEditHourlyRate(profile.workerProfile?.hourlyRate?.toString() || '')
      setEditSkills(profile.workerProfile?.skills?.join(', ') || '')
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
          <Button variant="success" onClick={fetchProfile}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const wp = profile.workerProfile
  const displayName = profile.name || 'Worker'
  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8 relative">
      <AmbientBackground intensity="low" />

      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50 backdrop-blur-sm relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-start gap-6">
            {/* Avatar with emerald gradient glow */}
            <div className="relative group">
              <div className="absolute -inset-3 bg-emerald-500/10 blur-3xl rounded-full" />
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold ring-2 ring-emerald-500/30 ring-offset-2 ring-offset-slate-950">
                {profile.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt={displayName} width={96} height={96} className="w-24 h-24 rounded-2xl object-cover" />
                ) : (
                  displayName.charAt(0)
                )}
              </div>
              <button className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                <Camera className="w-6 h-6 text-white" />
              </button>
              {wp?.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900 z-20">
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
                    className="text-2xl font-bold text-white bg-slate-800 border border-white/10 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                )}
                {wp?.isVerified && (
                  <Badge variant="success" size="sm">Verified</Badge>
                )}
              </div>
              <p className="text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {wp?.baseAddress || 'Location not set'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-medium">{wp?.averageRating?.toFixed(1) || '0.0'}</span>
                  <span className="text-slate-500">({profile._count.reviewsReceived} reviews)</span>
                </div>
                {wp?.hourlyRate && (
                  <div className="flex items-center gap-1 text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">${wp.hourlyRate}/hr</span>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {wp?.isVerified && (
                  <GlassPanel variant="subtle" padding="none" rounded="2xl" border="light" className="flex items-center gap-1.5 px-2.5 py-1">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs text-slate-300">Verified Worker</span>
                  </GlassPanel>
                )}
                {(wp?.averageRating ?? 0) >= 4.5 && (
                  <GlassPanel variant="subtle" padding="none" rounded="2xl" border="light" className="flex items-center gap-1.5 px-2.5 py-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-slate-300">Top Rated</span>
                  </GlassPanel>
                )}
                {(wp?.completedJobs ?? 0) >= 100 && (
                  <GlassPanel variant="subtle" padding="none" rounded="2xl" border="light" className="flex items-center gap-1.5 px-2.5 py-1">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-slate-300">{wp?.completedJobs}+ Jobs</span>
                  </GlassPanel>
                )}
                {(wp?.responseRate ?? 0) >= 90 && (
                  <GlassPanel variant="subtle" padding="none" rounded="2xl" border="light" className="flex items-center gap-1.5 px-2.5 py-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs text-slate-300">Quick Responder</span>
                  </GlassPanel>
                )}
              </div>
            </div>

            {/* Edit / Save Buttons */}
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <Button
                  variant="success"
                  size="sm"
                  onClick={saveProfile}
                  isLoading={saving}
                  leftIcon={!saving ? <Save className="w-4 h-4" /> : undefined}
                >
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={cancelEditing}
                  disabled={saving}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(true)}
                leftIcon={<Edit className="w-4 h-4" />}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Stats */}
        <GlassPanel variant="subtle" padding="lg" border="light" rounded="xl">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{wp?.completedJobs ?? 0}</div>
              <div className="text-xs text-slate-400 mt-1">Jobs Done</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                ${(wp?.totalEarnings ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">Total Earned</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-2xl font-bold text-white">{wp?.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">Avg Rating</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{profile._count.reviewsReceived}</div>
              <div className="text-xs text-slate-400 mt-1">Reviews</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{wp?.responseRate?.toFixed(0) ?? 0}%</div>
              <div className="text-xs text-slate-400 mt-1">Response Rate</div>
            </div>
          </div>
        </GlassPanel>

        {/* Bio */}
        <GlassPanel variant="default" padding="lg" border="light" rounded="xl">
          <h2 className="font-semibold text-white mb-3">About Me</h2>
          {isEditing ? (
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={4}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Tell hirers about yourself..."
            />
          ) : (
            <p className="text-slate-300">{wp?.bio || 'No bio yet. Click Edit Profile to add one.'}</p>
          )}
        </GlassPanel>

        {/* Skills */}
        <GlassPanel variant="default" padding="lg" border="light" rounded="xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Skills & Services</h2>
          </div>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={editSkills}
                onChange={(e) => setEditSkills(e.target.value)}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="Deep Cleaning, Furniture Assembly, Moving Help (comma-separated)"
              />
              <p className="text-xs text-slate-500 mt-1">Separate skills with commas</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(wp?.skills ?? []).length > 0 ? (
                wp?.skills.map((skill: string) => (
                  <GlassPanel
                    key={skill}
                    variant="subtle"
                    padding="none"
                    rounded="lg"
                    border="light"
                    className="px-3 py-1.5 text-slate-300 text-sm hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:border-emerald-500/20 transition-all cursor-default"
                  >
                    {skill}
                  </GlassPanel>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No skills added yet</p>
              )}
            </div>
          )}
        </GlassPanel>

        {/* Portfolio */}
        <GlassPanel variant="default" padding="lg" border="light" rounded="xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Portfolio</h2>
            <button className="flex items-center gap-1.5 text-sm text-emerald-400 hover:underline">
              <Plus className="w-4 h-4" />
              Add Work
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button className="aspect-square bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center hover:border-emerald-500/50 transition-colors">
              <Plus className="w-6 h-6 text-slate-500" />
              <span className="text-xs text-slate-500 mt-1">Add Photo</span>
            </button>
          </div>
        </GlassPanel>

        {/* Contact Info */}
        <GlassPanel variant="default" padding="none" border="light" rounded="xl" className="overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Contact Information</h2>
          </div>
          <div className="divide-y divide-white/5">
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-emerald-400" />
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
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Phone</div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Availability</div>
                <div className="text-white">{wp?.isActive ? 'Active' : 'Inactive'}</div>
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Hourly Rate</div>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <span className="text-white">$</span>
                    <input
                      type="number"
                      value={editHourlyRate}
                      onChange={(e) => setEditHourlyRate(e.target.value)}
                      className="w-24 bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="25"
                      min="0"
                      step="0.5"
                    />
                    <span className="text-slate-400 text-sm">/hr</span>
                  </div>
                ) : (
                  <div className="text-white">
                    {wp?.hourlyRate ? `$${wp.hourlyRate}/hr` : 'Not set'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Quick Links */}
        <GlassPanel variant="default" padding="none" border="light" rounded="xl" className="overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Quick Links</h2>
          </div>
          <div className="divide-y divide-white/5">
            <Link
              href="/work/earnings"
              className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">Earnings & Payouts</div>
                <div className="text-sm text-slate-400">View earnings and manage payouts</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/work/settings"
              className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Settings className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">Account Settings</div>
                <div className="text-sm text-slate-400">Manage your account preferences</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
