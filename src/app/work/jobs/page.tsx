'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, Filter, MapPin, Clock, DollarSign, Users,
  ChevronDown, Star, Bookmark, BookmarkCheck, AlertCircle,
  Zap, Calendar, CheckCircle2, Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock jobs data
const mockJobs = [
  {
    id: '1',
    title: 'Deep House Cleaning',
    category: 'cleaning',
    categoryIcon: '🧹',
    description: 'Looking for an experienced cleaner to do a thorough deep cleaning of my 2-bedroom apartment...',
    budget: { min: 120, max: 180 },
    location: 'Mission District',
    distance: '0.8 mi',
    postedAt: '2 hours ago',
    bids: 5,
    urgency: 'today',
    hirer: {
      name: 'Alex J.',
      rating: 4.9,
      jobsPosted: 12,
    },
    saved: false,
  },
  {
    id: '2',
    title: 'Help Moving Furniture',
    category: 'moving',
    categoryIcon: '📦',
    description: 'Need help moving furniture from a 2-bedroom apartment to a new location about 5 miles away...',
    budget: { min: 150, max: 250 },
    location: 'SOMA',
    distance: '1.2 mi',
    postedAt: '4 hours ago',
    bids: 8,
    urgency: 'urgent',
    hirer: {
      name: 'Sam W.',
      rating: 4.8,
      jobsPosted: 5,
    },
    saved: true,
  },
  {
    id: '3',
    title: 'IKEA Furniture Assembly',
    category: 'assembly',
    categoryIcon: '🪑',
    description: 'Need someone to assemble a MALM bed frame, PAX wardrobe, and KALLAX shelf unit...',
    budget: { min: 80, max: 120 },
    location: 'Hayes Valley',
    distance: '1.5 mi',
    postedAt: '6 hours ago',
    bids: 3,
    urgency: 'this-week',
    hirer: {
      name: 'Jordan K.',
      rating: 5.0,
      jobsPosted: 8,
    },
    saved: false,
  },
  {
    id: '4',
    title: 'Yard Work & Landscaping',
    category: 'yard',
    categoryIcon: '🌱',
    description: 'Looking for help with lawn mowing, hedge trimming, and general garden cleanup...',
    budget: { min: 100, max: 150 },
    location: 'Noe Valley',
    distance: '2.1 mi',
    postedAt: '1 day ago',
    bids: 2,
    urgency: 'flexible',
    hirer: {
      name: 'Chris M.',
      rating: 4.7,
      jobsPosted: 3,
    },
    saved: false,
  },
  {
    id: '5',
    title: 'Dog Walking - Daily',
    category: 'pets',
    categoryIcon: '🐕',
    description: 'Need a reliable dog walker for my golden retriever. 30-45 minute walks, once a day...',
    budget: { min: 25, max: 35 },
    location: 'Pacific Heights',
    distance: '2.8 mi',
    postedAt: '1 day ago',
    bids: 6,
    urgency: 'ongoing',
    hirer: {
      name: 'Taylor R.',
      rating: 4.9,
      jobsPosted: 15,
    },
    saved: true,
  },
]

const categories = [
  { id: 'all', label: 'All Jobs', icon: '📋' },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { id: 'moving', label: 'Moving', icon: '📦' },
  { id: 'assembly', label: 'Assembly', icon: '🪑' },
  { id: 'yard', label: 'Yard Work', icon: '🌱' },
  { id: 'delivery', label: 'Delivery', icon: '🚚' },
  { id: 'pets', label: 'Pet Care', icon: '🐕' },
]

const urgencyConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  urgent: { label: 'Urgent', color: 'bg-red-500/20 text-red-400', icon: Zap },
  today: { label: 'Today', color: 'bg-amber-500/20 text-amber-400', icon: Clock },
  'this-week': { label: 'This Week', color: 'bg-blue-500/20 text-blue-400', icon: Calendar },
  flexible: { label: 'Flexible', color: 'bg-slate-500/20 text-slate-400', icon: Calendar },
  ongoing: { label: 'Ongoing', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle2 },
}

export default function WorkJobsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set(['2', '5']))
  const [sortBy, setSortBy] = useState('relevance')

  const filteredJobs = mockJobs.filter((job) => {
    if (selectedCategory !== 'all' && job.category !== selectedCategory) return false
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const toggleSaved = (jobId: string) => {
    setSavedJobs((prev) => {
      const next = new Set(prev)
      if (next.has(jobId)) {
        next.delete(jobId)
      } else {
        next.add(jobId)
      }
      return next
    })
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Find Jobs</h1>
              <p className="text-slate-400 mt-1">
                {filteredJobs.length} jobs available near you
              </p>
            </div>
            <Link
              href="/work/map"
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-xl hover:bg-emerald-500/20 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Map View
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search for jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                  selectedCategory === cat.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                )}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-sm text-slate-400 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-sm text-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="newest">Sort: Newest</option>
              <option value="highest-pay">Sort: Highest Pay</option>
              <option value="closest">Sort: Closest</option>
            </select>
          </div>
          <div className="text-sm text-slate-500">
            Showing {filteredJobs.length} of {mockJobs.length} jobs
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-5xl mx-auto px-4">
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const UrgencyIcon = urgencyConfig[job.urgency]?.icon || Calendar
              const isSaved = savedJobs.has(job.id)

              return (
                <div
                  key={job.id}
                  className="bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Category Icon */}
                    <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-3xl shrink-0">
                      {job.categoryIcon}
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/work/job/${job.id}`}
                            className="text-lg font-semibold text-white hover:text-emerald-400 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                              <span className="text-emerald-400">({job.distance})</span>
                            </div>
                            <span>•</span>
                            <span>{job.postedAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full',
                              urgencyConfig[job.urgency]?.color
                            )}
                          >
                            <UrgencyIcon className="w-3.5 h-3.5" />
                            {urgencyConfig[job.urgency]?.label}
                          </span>
                          <button
                            onClick={() => toggleSaved(job.id)}
                            className={cn(
                              'p-2 rounded-lg transition-colors',
                              isSaved
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            )}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="w-5 h-5" />
                            ) : (
                              <Bookmark className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-slate-400 mt-3 line-clamp-2">{job.description}</p>

                      {/* Stats & Hirer Info */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">
                              ${job.budget.min} - ${job.budget.max}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Users className="w-4 h-4" />
                            <span>{job.bids} bids</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-semibold">
                            {job.hirer.name.charAt(0)}
                          </div>
                          <span className="text-white">{job.hirer.name}</span>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-slate-400">{job.hirer.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4">
                        <Link
                          href={`/work/job/${job.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-colors"
                        >
                          <Briefcase className="w-4 h-4" />
                          Apply Now
                        </Link>
                        <Link
                          href={`/work/job/${job.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No jobs found</h2>
            <p className="text-slate-400 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="px-6 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
