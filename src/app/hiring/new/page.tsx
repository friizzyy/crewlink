'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, ArrowRight, MapPin, Calendar, Clock, DollarSign,
  Sparkles, CheckCircle2, AlertCircle, Loader2, X, Plus,
  Zap, Shield, ChevronDown, Camera, FileText,
  Package, Wrench, Leaf, Armchair, Truck, PartyPopper, ClipboardList
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AddressAutocomplete, type AddressResult } from '@/components/ui/AddressAutocomplete'

const categories: { id: string; name: string; Icon: LucideIcon; description: string }[] = [
  { id: 'cleaning', name: 'Cleaning', Icon: Sparkles, description: 'Home, office, deep clean' },
  { id: 'moving', name: 'Moving', Icon: Package, description: 'Packing, loading, transport' },
  { id: 'handyman', name: 'Handyman', Icon: Wrench, description: 'Repairs, installations' },
  { id: 'yard', name: 'Yard Work', Icon: Leaf, description: 'Lawn, garden, outdoor' },
  { id: 'assembly', name: 'Assembly', Icon: Armchair, description: 'Furniture, equipment' },
  { id: 'delivery', name: 'Delivery', Icon: Truck, description: 'Pickup, transport' },
  { id: 'events', name: 'Events', Icon: PartyPopper, description: 'Setup, service, cleanup' },
  { id: 'other', name: 'Other', Icon: ClipboardList, description: 'Custom tasks' },
]

const urgencyOptions = [
  { id: 'urgent', label: 'As soon as possible', sublabel: 'Within hours', icon: Zap, color: 'red' },
  { id: 'today', label: 'Today', sublabel: 'Anytime today', icon: Clock, color: 'orange' },
  { id: 'this-week', label: 'This week', sublabel: 'Next few days', icon: Calendar, color: 'blue' },
  { id: 'flexible', label: 'Flexible', sublabel: 'No rush', icon: Calendar, color: 'slate' },
]

export default function NewJobPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location: '',
    lat: null as number | null,
    lng: null as number | null,
    urgency: '',
    budgetMin: '',
    budgetMax: '',
    duration: '',
    photos: [] as string[],
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const [aiSuggestions, setAiSuggestions] = useState<{
    title?: string
    description?: string
    budget?: { min: number; max: number }
  } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({ ...prev, category: categoryId }))
    // Show template suggestions based on category
    const templates: Record<string, { title?: string; description?: string; budget?: { min: number; max: number } }> = {
      cleaning: { title: 'House Cleaning', description: 'I need help with cleaning my home including vacuuming, mopping, and bathroom cleaning.', budget: { min: 80, max: 150 } },
      moving: { title: 'Moving Help', description: 'Need help moving furniture and boxes. Will need to lift heavy items.', budget: { min: 100, max: 250 } },
      handyman: { title: 'Home Repairs', description: 'Looking for someone to help with general repairs around the house.', budget: { min: 60, max: 120 } },
      assembly: { title: 'Furniture Assembly', description: 'Need help assembling furniture from IKEA or similar.', budget: { min: 50, max: 100 } },
    }
    if (templates[categoryId]) {
      setAiSuggestions(templates[categoryId])
    }
    setStep(2)
  }

  const applySuggestion = (field: 'title' | 'description') => {
    if (aiSuggestions && aiSuggestions[field]) {
      setFormData(prev => ({ ...prev, [field]: aiSuggestions[field] }))
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    // Validate coordinates before submission
    if (!formData.lat || !formData.lng) {
      setSubmitError('Please select a valid address from the suggestions')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          address: formData.location,
          lat: formData.lat,
          lng: formData.lng,
          urgency: formData.urgency,
          budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
          estimatedHours: formData.duration ? parseFloat(formData.duration) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create job')
      }

      // Success - redirect to jobs list
      router.push('/hiring/jobs?new=true')
    } catch (error) {
      console.error('Error creating job:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to create job. Please try again.')
      setIsSubmitting(false)
    }
  }

  const progress = (step / 4) * 100

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.category
      case 2: return !!formData.title && !!formData.description
      case 3: return !!formData.location && !!formData.urgency && formData.lat !== null && formData.lng !== null
      case 4: return !!formData.budgetMin
      default: return false
    }
  }

  // Handle address selection from autocomplete
  const handleAddressSelect = (result: AddressResult) => {
    setFormData(prev => ({
      ...prev,
      location: result.address,
      lat: result.lat,
      lng: result.lng,
    }))
  }

  // Handle address text change (clear coordinates if user edits)
  const handleAddressChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      location: value,
      // Clear coordinates when user types manually - they need to select from suggestions
      lat: null,
      lng: null,
    }))
  }

  // Handle address clear
  const handleAddressClear = () => {
    setFormData(prev => ({
      ...prev,
      location: '',
      lat: null,
      lng: null,
    }))
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-16 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : router.back()}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <span className="text-sm text-slate-500">Step {step} of 4</span>
            <button
              onClick={() => router.back()}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">What do you need help with?</h1>
              <p className="text-slate-400">Select a category to get started</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`relative p-4 rounded-2xl border transition-all text-left group hover:scale-[1.02] ${
                    formData.category === cat.id
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-slate-900 border-white/5 hover:border-white/20'
                  }`}
                >
                  <cat.Icon className="w-8 h-8 text-cyan-400 mb-2" />
                  <span className="font-semibold text-white block">{cat.name}</span>
                  <span className="text-xs text-slate-500 block mt-0.5">{cat.description}</span>
                  {formData.category === cat.id && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Job Details */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Describe your job</h1>
              <p className="text-slate-400">Be specific to get better matches</p>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Job Title</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Deep Clean 2BR Apartment"
                    className="w-full px-4 py-3.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  />
                  {aiSuggestions?.title && formData.title !== aiSuggestions.title && (
                    <button
                      onClick={() => applySuggestion('title')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-lg hover:bg-cyan-500/20 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Template
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">Description</label>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you need done in detail. Include any specific requirements, tools needed, or access instructions."
                  rows={5}
                  className="w-full px-4 py-3.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
                />
                {aiSuggestions?.description && formData.description !== aiSuggestions.description && (
                  <button
                    onClick={() => applySuggestion('description')}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-lg hover:bg-cyan-500/20 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Use template
                  </button>
                )}
              </div>

              {/* Photos (optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Photos (optional)</label>
                <button className="w-full p-6 border-2 border-dashed border-white/10 rounded-xl hover:border-white/20 transition-colors group">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                      <Camera className="w-6 h-6 text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-400">Add photos to help workers understand the job</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location & Timing */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">When and where?</h1>
              <p className="text-slate-400">Set the location and timing</p>
            </div>

            <div className="space-y-6">
              {/* Location */}
              <div>
                <AddressAutocomplete
                  label="Location"
                  value={formData.location}
                  onChange={handleAddressChange}
                  onSelect={handleAddressSelect}
                  onClear={handleAddressClear}
                  placeholder="Enter address or neighborhood"
                  required
                  error={formData.location && !formData.lat ? 'Please select an address from the suggestions' : undefined}
                />
                <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Exact address shared only after booking
                </p>
                {formData.lat && formData.lng && (
                  <p className="mt-1 text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Location verified
                  </p>
                )}
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">When do you need this done?</label>
                <div className="grid grid-cols-2 gap-3">
                  {urgencyOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setFormData(prev => ({ ...prev, urgency: option.id }))}
                      className={`relative p-4 rounded-xl border transition-all text-left ${
                        formData.urgency === option.id
                          ? 'bg-cyan-500/10 border-cyan-500/50'
                          : 'bg-slate-900 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <option.icon className={`w-5 h-5 mb-2 ${
                        formData.urgency === option.id ? 'text-cyan-400' : 'text-slate-500'
                      }`} />
                      <span className="font-medium text-white block">{option.label}</span>
                      <span className="text-xs text-slate-500">{option.sublabel}</span>
                      {formData.urgency === option.id && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration estimate */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Estimated duration (optional)</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full pl-12 pr-10 py-3.5 bg-slate-900 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                  >
                    <option value="">Select duration</option>
                    <option value="1">About 1 hour</option>
                    <option value="2">2-3 hours</option>
                    <option value="4">Half day (4+ hours)</option>
                    <option value="8">Full day</option>
                    <option value="multi">Multiple days</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Budget */}
        {step === 4 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Set your budget</h1>
              <p className="text-slate-400">Workers will bid within this range</p>
            </div>

            <div className="space-y-6">
              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Budget range</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="number"
                      value={formData.budgetMin}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: e.target.value }))}
                      placeholder="Min"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                    />
                  </div>
                  <span className="text-slate-500">to</span>
                  <div className="flex-1 relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: e.target.value }))}
                      placeholder="Max"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                {/* AI Budget Suggestion */}
                {aiSuggestions?.budget && (
                  <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-white font-medium">Suggested budget: ${aiSuggestions.budget.min} - ${aiSuggestions.budget.max}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Based on typical rates for this category</p>
                        <button
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            budgetMin: aiSuggestions.budget!.min.toString(),
                            budgetMax: aiSuggestions.budget!.max.toString()
                          }))}
                          className="mt-2 text-xs text-cyan-400 font-medium hover:text-cyan-300"
                        >
                          Apply suggestion →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl">
                <h3 className="font-semibold text-white mb-4">Job Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Category</span>
                    <span className="text-white flex items-center gap-1.5">
                      {(() => {
                        const selectedCat = categories.find(c => c.id === formData.category)
                        if (selectedCat) {
                          const CatIcon = selectedCat.Icon
                          return <CatIcon className="w-4 h-4 text-cyan-400" />
                        }
                        return null
                      })()}
                      {categories.find(c => c.id === formData.category)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Title</span>
                    <span className="text-white">{formData.title || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Location</span>
                    <span className="text-white">{formData.location || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Timing</span>
                    <span className="text-white">{urgencyOptions.find(u => u.id === formData.urgency)?.label || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Budget</span>
                    <span className="text-emerald-400 font-semibold">
                      {formData.budgetMin && formData.budgetMax
                        ? `$${formData.budgetMin} - $${formData.budgetMax}`
                        : formData.budgetMin
                          ? `$${formData.budgetMin}+`
                          : '-'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-white/5 p-4 z-40 lg:relative lg:bg-transparent lg:border-0 lg:p-0">
        <div className="max-w-2xl mx-auto lg:mt-8">
          {/* Error Message */}
          {submitError && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-400 font-medium">Error</p>
                <p className="text-sm text-red-300 mt-0.5">{submitError}</p>
              </div>
            </div>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  Post Job
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  )
}
