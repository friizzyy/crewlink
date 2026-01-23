'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User, Mail, Phone, MapPin, Camera, Edit, Shield,
  Star, CheckCircle2, Calendar, Briefcase, CreditCard,
  Settings, ChevronRight, BadgeCheck, Award
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock user profile data
const mockProfile = {
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1 (415) 555-0123',
  location: 'San Francisco, CA',
  avatar: null,
  verified: true,
  memberSince: 'January 2024',
  stats: {
    jobsPosted: 12,
    jobsCompleted: 8,
    totalSpent: 2450,
    avgRating: 4.9,
    reviewsGiven: 7,
  },
  badges: [
    { id: '1', name: 'Verified Hirer', icon: BadgeCheck, color: 'text-cyan-400' },
    { id: '2', name: 'Top Rated', icon: Star, color: 'text-amber-400' },
    { id: '3', name: '10+ Jobs', icon: Award, color: 'text-purple-400' },
  ],
  recentReviews: [
    {
      id: '1',
      worker: 'Sarah K.',
      rating: 5,
      comment: 'Great communication and paid promptly. Would work with again!',
      job: 'IKEA Furniture Assembly',
      date: '2 days ago',
    },
    {
      id: '2',
      worker: 'Marcus T.',
      rating: 5,
      comment: 'Very clear instructions and easy to work with.',
      job: 'Help Moving Furniture',
      date: '1 week ago',
    },
  ],
}

export default function HiringProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                {mockProfile.avatar || mockProfile.name.charAt(0)}
              </div>
              <button className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </button>
              {mockProfile.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{mockProfile.name}</h1>
                {mockProfile.verified && (
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {mockProfile.location}
              </p>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Member since {mockProfile.memberSince}
              </p>

              {/* Badges */}
              <div className="flex gap-2 mt-3">
                {mockProfile.badges.map((badge) => {
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

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="text-2xl font-bold text-white">{mockProfile.stats.jobsPosted}</div>
            <div className="text-xs text-slate-400 mt-1">Jobs Posted</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="text-2xl font-bold text-white">{mockProfile.stats.jobsCompleted}</div>
            <div className="text-xs text-slate-400 mt-1">Completed</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              ${mockProfile.stats.totalSpent.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">Total Spent</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-2xl font-bold text-white">{mockProfile.stats.avgRating}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Avg Rating</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="text-2xl font-bold text-white">{mockProfile.stats.reviewsGiven}</div>
            <div className="text-xs text-slate-400 mt-1">Reviews Given</div>
          </div>
        </div>

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
                <div className="text-white">{mockProfile.email}</div>
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
                <div className="text-white">{mockProfile.phone}</div>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Verified
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Location</div>
                <div className="text-white">{mockProfile.location}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reviews from Workers */}
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
          {mockProfile.recentReviews.length > 0 ? (
            <div className="divide-y divide-white/5">
              {mockProfile.recentReviews.map((review) => (
                <div key={review.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
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
                      <p className="text-sm text-slate-400 mt-1">{review.comment}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {review.job} • {review.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
