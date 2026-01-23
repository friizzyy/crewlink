'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User, Mail, Phone, MapPin, Camera, Edit, Shield,
  Star, CheckCircle2, Calendar, Briefcase, DollarSign,
  Settings, ChevronRight, BadgeCheck, Award, Clock,
  Plus, Trash2, Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock worker profile data
const mockProfile = {
  name: 'Sarah Martinez',
  email: 'sarah.martinez@email.com',
  phone: '+1 (415) 555-0199',
  location: 'San Francisco, CA',
  avatar: null,
  verified: true,
  memberSince: 'March 2024',
  bio: 'Experienced cleaner and handyperson with 5+ years of professional experience. Detail-oriented and reliable. I take pride in my work and always ensure customer satisfaction.',
  hourlyRate: { min: 25, max: 45 },
  availability: 'Full-time',
  responseTime: '< 1 hour',
  stats: {
    jobsCompleted: 127,
    totalEarned: 8450,
    avgRating: 4.9,
    reviewsReceived: 98,
    repeatClients: 23,
  },
  skills: [
    'Deep Cleaning',
    'Furniture Assembly',
    'Moving Help',
    'Yard Work',
    'Organization',
    'Pet Sitting',
  ],
  badges: [
    { id: '1', name: 'Verified Worker', icon: BadgeCheck, color: 'text-emerald-400' },
    { id: '2', name: 'Top Rated', icon: Star, color: 'text-amber-400' },
    { id: '3', name: '100+ Jobs', icon: Award, color: 'text-purple-400' },
    { id: '4', name: 'Quick Responder', icon: Clock, color: 'text-cyan-400' },
  ],
  portfolio: [
    { id: '1', title: 'Kitchen Deep Clean', image: null },
    { id: '2', title: 'Furniture Assembly', image: null },
    { id: '3', title: 'Garden Makeover', image: null },
  ],
  recentReviews: [
    {
      id: '1',
      hirer: 'Alex J.',
      rating: 5,
      comment: 'Sarah did an amazing job cleaning our apartment. Very thorough and professional!',
      job: 'Deep House Cleaning',
      date: '3 days ago',
    },
    {
      id: '2',
      hirer: 'Jordan K.',
      rating: 5,
      comment: 'Fast and efficient furniture assembly. Would definitely hire again.',
      job: 'IKEA Furniture Assembly',
      date: '1 week ago',
    },
  ],
}

export default function WorkProfilePage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
                {mockProfile.avatar || mockProfile.name.charAt(0)}
              </div>
              <button className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </button>
              {mockProfile.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{mockProfile.name}</h1>
                {mockProfile.verified && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {mockProfile.location}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-white font-medium">{mockProfile.stats.avgRating}</span>
                  <span className="text-slate-500">({mockProfile.stats.reviewsReceived} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">
                    ${mockProfile.hourlyRate.min}-${mockProfile.hourlyRate.max}/hr
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
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
            <div className="text-2xl font-bold text-white">{mockProfile.stats.jobsCompleted}</div>
            <div className="text-xs text-slate-400 mt-1">Jobs Done</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="text-2xl font-bold text-emerald-400">
              ${mockProfile.stats.totalEarned.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">Total Earned</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-2xl font-bold text-white">{mockProfile.stats.avgRating}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Avg Rating</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="text-2xl font-bold text-white">{mockProfile.stats.reviewsReceived}</div>
            <div className="text-xs text-slate-400 mt-1">Reviews</div>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 text-center">
            <div className="text-2xl font-bold text-white">{mockProfile.stats.repeatClients}</div>
            <div className="text-xs text-slate-400 mt-1">Repeat Clients</div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-slate-900 rounded-xl border border-white/5 p-5">
          <h2 className="font-semibold text-white mb-3">About Me</h2>
          <p className="text-slate-300">{mockProfile.bio}</p>
        </div>

        {/* Skills */}
        <div className="bg-slate-900 rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Skills & Services</h2>
            <button className="text-sm text-emerald-400 hover:underline">+ Add Skill</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {mockProfile.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-slate-900 rounded-xl border border-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Portfolio</h2>
            <button className="flex items-center gap-1.5 text-sm text-emerald-400 hover:underline">
              <Plus className="w-4 h-4" />
              Add Work
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {mockProfile.portfolio.map((item) => (
              <div
                key={item.id}
                className="aspect-square bg-slate-800 rounded-xl flex items-center justify-center group cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <ImageIcon className="w-8 h-8 text-slate-600 group-hover:text-slate-500" />
              </div>
            ))}
            <button className="aspect-square bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center hover:border-emerald-500/50 transition-colors">
              <Plus className="w-6 h-6 text-slate-500" />
              <span className="text-xs text-slate-500 mt-1">Add Photo</span>
            </button>
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
                <Clock className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Availability</div>
                <div className="text-white">{mockProfile.availability}</div>
              </div>
            </div>
            <div className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-slate-400">Response Time</div>
                <div className="text-white">{mockProfile.responseTime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-semibold text-white">Recent Reviews</h2>
            <Link href="/work/reviews" className="text-sm text-emerald-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {mockProfile.recentReviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
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
                    <p className="text-sm text-slate-400 mt-1">{review.comment}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {review.job} • {review.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-slate-900 rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Quick Links</h2>
          </div>
          <div className="divide-y divide-white/5">
            <Link
              href="/work/earnings"
              className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">Earnings & Payouts</div>
                <div className="text-sm text-slate-400">View earnings and manage payouts</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500" />
            </Link>
            <Link
              href="/work/settings"
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
          </div>
        </div>
      </div>
    </div>
  )
}
