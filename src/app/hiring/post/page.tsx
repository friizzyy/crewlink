'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, MapPin, DollarSign, Clock, FileText, Image,
  ChevronDown, X, Plus, Sparkles, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

const categories = [
  { id: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { id: 'moving', label: 'Moving', icon: '📦' },
  { id: 'handyman', label: 'Handyman', icon: '🔧' },
  { id: 'yard', label: 'Yard Work', icon: '🌱' },
  { id: 'assembly', label: 'Assembly', icon: '🪑' },
  { id: 'events', label: 'Events', icon: '🎉' },
]

const urgencyOptions = [
  { id: 'urgent', label: 'Urgent (Today)', description: 'Need help ASAP' },
  { id: 'today', label: 'Today', description: 'Sometime today' },
  { id: 'this-week', label: 'This Week', description: 'Flexible within the week' },
  { id: 'flexible', label: 'Flexible', description: 'No rush' },
]

export default function PostJobPage() {
  const router = useRouter()
  const toast = useToast()

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    budgetMin: '',
    budgetMax: '',
    urgency: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.category || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success('Job posted successfully!')
    router.push('/hiring/jobs')
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/hiring/map"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to map
          </Link>
          <h1 className="text-2xl font-bold text-white">Post Job</h1>
          <p className="text-slate-400 mt-1">Describe what you need help with</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Job Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Deep House Cleaning Needed"
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Category <span className="text-cyan-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateField('category', cat.id)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
                    formData.category === cat.id
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                  )}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-medium">{cat.label}</span>
                  {formData.category === cat.id && (
                    <Check className="w-5 h-5 text-cyan-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description <span className="text-cyan-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe the job in detail. Include what needs to be done, any special requirements, and what you'll provide."
              rows={5}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Enter address or neighborhood"
                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Budget Range
            </label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="number"
                  value={formData.budgetMin}
                  onChange={(e) => updateField('budgetMin', e.target.value)}
                  placeholder="Min"
                  className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                />
              </div>
              <span className="text-slate-500">to</span>
              <div className="relative flex-1">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="number"
                  value={formData.budgetMax}
                  onChange={(e) => updateField('budgetMax', e.target.value)}
                  placeholder="Max"
                  className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                />
              </div>
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              When do you need this done?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {urgencyOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => updateField('urgency', option.id)}
                  className={cn(
                    'p-4 rounded-xl border transition-all text-left',
                    formData.urgency === option.id
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-slate-900 border-white/10 hover:border-white/20'
                  )}
                >
                  <p className={cn(
                    'font-medium',
                    formData.urgency === option.id ? 'text-white' : 'text-slate-300'
                  )}>
                    {option.label}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all',
                isSubmitting
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25'
              )}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Post Job
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
