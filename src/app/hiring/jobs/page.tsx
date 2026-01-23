'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Plus, Search, Filter, MapPin, Clock, DollarSign, Users,
  MoreHorizontal, CheckCircle2, XCircle, AlertCircle, Eye,
  MessageCircle, Edit, Trash2, ChevronDown, Star, BadgeCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock jobs data
const mockJobs = [
  {
    id: '1',
    title: 'Deep House Cleaning',
    category: 'cleaning',
    categoryIcon: '🧹',
    status: 'active',
    budget: { min: 120, max: 180 },
    location: 'Mission District',
    postedAt: '2 hours ago',
    bids: 5,
    views: 23,
    urgency: 'today',
  },
  {
    id: '2',
    title: 'Help Moving Furniture',
    category: 'moving',
    categoryIcon: '📦',
    status: 'in-progress',
    budget: { min: 150, max: 250 },
    location: 'SOMA',
    postedAt: '1 day ago',
    bids: 8,
    views: 45,
    urgency: 'urgent',
    assignedTo: { name: 'Marcus T.', rating: 4.9 },
  },
  {
    id: '3',
    title: 'IKEA Furniture Assembly',
    category: 'assembly',
    categoryIcon: '🪑',
    status: 'completed',
    budget: { min: 80, max: 120 },
    location: 'Hayes Valley',
    postedAt: '3 days ago',
    bids: 3,
    views: 18,
    urgency: 'flexible',
    assignedTo: { name: 'Sarah K.', rating: 5.0 },
    completedAt: '2 days ago',
    finalAmount: 95,
  },
  {
    id: '4',
    title: 'Yard Work & Landscaping',
    category: 'yard',
    categoryIcon: '🌱',
    status: 'draft',
    budget: { min: 100, max: 150 },
    location: 'Noe Valley',
    postedAt: 'Draft',
    bids: 0,
    views: 0,
    urgency: 'this-week',
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  completed: { label: 'Completed', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: CheckCircle2 },
  draft: { label: 'Draft', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Edit },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
}

export default function HiringJobsPage() {
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredJobs = mockJobs.filter((job) => {
    if (filter !== 'all' && job.status !== filter) return false
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const stats = {
    active: mockJobs.filter((j) => j.status === 'active').length,
    inProgress: mockJobs.filter((j) => j.status === 'in-progress').length,
    completed: mockJobs.filter((j) => j.status === 'completed').length,
    total: mockJobs.length,
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">My Jobs</h1>
              <p className="text-slate-400 mt-1">Manage your job postings</p>
            </div>
            <Link
              href="/hiring/post"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25"
            >
              <Plus className="w-4 h-4" />
              Post Job
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
              <div className="text-2xl font-bold text-white">{stats.active}</div>
              <div className="text-sm text-slate-400">Active</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
              <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
              <div className="text-sm text-slate-400">In Progress</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
              <div className="text-2xl font-bold text-white">{stats.completed}</div>
              <div className="text-sm text-slate-400">Completed</div>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-slate-400">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/5 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'active', 'in-progress', 'completed', 'draft'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                  filter === status
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 border border-white/5 hover:text-white'
                )}
              >
                {status === 'all'
                  ? 'All'
                  : status === 'in-progress'
                  ? 'In Progress'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-5xl mx-auto px-4">
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const StatusIcon = statusConfig[job.status].icon
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
                            href={`/hiring/job/${job.id}`}
                            className="text-lg font-semibold text-white hover:text-cyan-400 transition-colors"
                          >
                            {job.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location}
                            </div>
                            <span>•</span>
                            <span>{job.postedAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border',
                              statusConfig[job.status].color
                            )}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig[job.status].label}
                          </span>
                          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Stats Row */}
                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-400 font-semibold">
                            ${job.budget.min} - ${job.budget.max}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Users className="w-4 h-4" />
                          <span>{job.bids} bids</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Eye className="w-4 h-4" />
                          <span>{job.views} views</span>
                        </div>

                        {job.assignedTo && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                              {job.assignedTo.name.charAt(0)}
                            </div>
                            <span className="text-white">{job.assignedTo.name}</span>
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="text-slate-400">{job.assignedTo.rating}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4">
                        <Link
                          href={`/hiring/job/${job.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                        {job.status === 'active' && (
                          <Link
                            href={`/hiring/job/${job.id}#bids`}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-medium rounded-xl hover:bg-cyan-500/20 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                            Review Bids ({job.bids})
                          </Link>
                        )}
                        {job.status === 'in-progress' && (
                          <Link
                            href="/hiring/messages"
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-medium rounded-xl hover:bg-cyan-500/20 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message Worker
                          </Link>
                        )}
                        {job.status === 'draft' && (
                          <Link
                            href="/hiring/post"
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 text-sm font-medium rounded-xl hover:bg-amber-500/20 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Continue Editing
                          </Link>
                        )}
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
              {filter === 'all' ? "You haven't posted any jobs yet" : `No ${filter} jobs`}
            </p>
            <Link
              href="/hiring/post"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl"
            >
              <Plus className="w-5 h-5" />
              Post Your First Job
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
