'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  DollarSign,
  Clock,
  Check,
  Sparkles,
  Truck,
  Wrench,
  TreePine,
  Droplets,
  Zap,
  Paintbrush,
  Package,
  MoreHorizontal,
  Calendar,
  CalendarDays,
  ImagePlus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Star,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryOption {
  id: string
  label: string
  icon: React.ElementType
}

type ScheduleType = 'asap' | 'this_week' | 'specific_date'
type BudgetType = 'hourly' | 'fixed' | 'open'

interface PhotoUpload {
  id: string
  file: File
  preview: string
  uploading: boolean
  url?: string
}

interface FormData {
  category: string
  title: string
  description: string
  isAiGenerated: boolean
  address: string
  scheduleType: ScheduleType | ''
  specificDate: string
  estimatedHours: string
  budgetType: BudgetType
  budgetMin: string
  budgetMax: string
  photos: PhotoUpload[]
}

interface AiPricingSuggestion {
  min: number
  max: number
  confidence: 'high' | 'medium' | 'low'
}

interface AiQualityScore {
  score: number
  strengths: string[]
  improvements: string[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const categories: CategoryOption[] = [
  { id: 'cleaning', label: 'Cleaning', icon: Sparkles },
  { id: 'moving', label: 'Moving', icon: Truck },
  { id: 'handyman', label: 'Handyman', icon: Wrench },
  { id: 'yard', label: 'Yard Work', icon: TreePine },
  { id: 'plumbing', label: 'Plumbing', icon: Droplets },
  { id: 'electrical', label: 'Electrical', icon: Zap },
  { id: 'painting', label: 'Painting', icon: Paintbrush },
  { id: 'assembly', label: 'Assembly', icon: Package },
  { id: 'other', label: 'Other', icon: MoreHorizontal },
]

const STEPS = ['Details', 'Location', 'Budget', 'Review'] as const

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PostJobPage() {
  const router = useRouter()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)

  // AI states
  const [aiDescLoading, setAiDescLoading] = useState(false)
  const [aiPricing, setAiPricing] = useState<AiPricingSuggestion | null>(null)
  const [aiPricingLoading, setAiPricingLoading] = useState(false)
  const [aiQuality, setAiQuality] = useState<AiQualityScore | null>(null)
  const [aiQualityLoading, setAiQualityLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    category: '',
    title: '',
    description: '',
    isAiGenerated: false,
    address: '',
    scheduleType: '',
    specificDate: '',
    estimatedHours: '',
    budgetType: 'fixed',
    budgetMin: '',
    budgetMax: '',
    photos: [],
  })

  // ------ helpers ------

  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 0:
        return !!(formData.category && formData.title.trim() && formData.description.trim())
      case 1:
        return !!(
          formData.address.trim() &&
          formData.scheduleType &&
          (formData.scheduleType !== 'specific_date' || formData.specificDate)
        )
      case 2:
        return !!(formData.budgetMin || formData.budgetMax || formData.budgetType === 'open')
      case 3:
        return true
      default:
        return false
    }
  }, [currentStep, formData])

  const goNext = useCallback(() => {
    if (currentStep < 3 && canProceed()) {
      setDirection(1)
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep, canProceed])

  const goBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((s) => s - 1)
    }
  }, [currentStep])

  // ------ AI: Generate Description ------

  const generateDescription = useCallback(async () => {
    if (!formData.category) {
      toast.error('Select a category first')
      return
    }
    setAiDescLoading(true)
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          briefDescription: formData.description || formData.title || '',
          location: formData.address || 'TBD',
        }),
      })
      if (!res.ok) throw new Error('Failed to generate')
      const data: { title: string; description: string } = await res.json()
      setFormData((prev) => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        isAiGenerated: true,
      }))
      toast.success('AI description generated!')
    } catch {
      toast.error('Could not generate description. Try again.')
    } finally {
      setAiDescLoading(false)
    }
  }, [formData.category, formData.description, formData.title, formData.address, toast])

  // ------ AI: Pricing Suggestion ------

  const fetchPricingSuggestion = useCallback(async () => {
    if (!formData.category || !formData.description) return
    setAiPricingLoading(true)
    try {
      const res = await fetch('/api/ai/pricing-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: formData.category,
          location: formData.address || 'Unknown',
          description: formData.description,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data: AiPricingSuggestion = await res.json()
      setAiPricing(data)
    } catch {
      // Silently fail - pricing suggestion is optional
      setAiPricing(null)
    } finally {
      setAiPricingLoading(false)
    }
  }, [formData.category, formData.description, formData.address])

  // ------ AI: Quality Score ------

  const fetchQualityScore = useCallback(async () => {
    if (!formData.title || !formData.description) return
    setAiQualityLoading(true)
    try {
      const res = await fetch('/api/ai/job-quality-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          budget: { min: formData.budgetMin, max: formData.budgetMax, type: formData.budgetType },
          category: formData.category,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data: AiQualityScore = await res.json()
      setAiQuality(data)
    } catch {
      setAiQuality(null)
    } finally {
      setAiQualityLoading(false)
    }
  }, [formData.title, formData.description, formData.budgetMin, formData.budgetMax, formData.budgetType, formData.category])

  // Auto-fetch AI data on step entry
  useEffect(() => {
    if (currentStep === 2) fetchPricingSuggestion()
    if (currentStep === 3) fetchQualityScore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  // ------ Photo Upload ------

  const handlePhotoSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files) return

      const remaining = 5 - formData.photos.length
      const selected = Array.from(files).slice(0, remaining)

      const newPhotos: PhotoUpload[] = selected.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        uploading: true,
      }))

      setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }))

      // Upload each photo
      for (const photo of newPhotos) {
        try {
          const fd = new window.FormData()
          fd.append('file', photo.file)
          const res = await fetch('/api/upload', { method: 'POST', body: fd })
          if (!res.ok) throw new Error('Upload failed')
          const data: { url: string } = await res.json()
          setFormData((prev) => ({
            ...prev,
            photos: prev.photos.map((p) =>
              p.id === photo.id ? { ...p, uploading: false, url: data.url } : p,
            ),
          }))
        } catch {
          toast.error(`Failed to upload ${photo.file.name}`)
          setFormData((prev) => ({
            ...prev,
            photos: prev.photos.filter((p) => p.id !== photo.id),
          }))
        }
      }

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [formData.photos.length, toast],
  )

  const removePhoto = useCallback((id: string) => {
    setFormData((prev) => {
      const photo = prev.photos.find((p) => p.id === id)
      if (photo) URL.revokeObjectURL(photo.preview)
      return { ...prev, photos: prev.photos.filter((p) => p.id !== id) }
    })
  }, [])

  // ------ Submit ------

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          address: formData.address,
          urgency: formData.scheduleType,
          specificDate: formData.specificDate || undefined,
          estimatedHours: formData.estimatedHours
            ? parseFloat(formData.estimatedHours)
            : undefined,
          budgetType: formData.budgetType,
          budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : undefined,
          budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : undefined,
          photos: formData.photos.filter((p) => p.url).map((p) => p.url),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to post job')
        return
      }
      setCreatedJobId(data.id ?? null)
      setIsSuccess(true)
      toast.success('Job posted successfully!')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, toast])

  // ------ Render helpers ------

  const getCategoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id
  const getCategoryIcon = (id: string) => categories.find((c) => c.id === id)?.icon ?? MoreHorizontal

  const confidenceColor = (c: string) => {
    if (c === 'high') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (c === 'medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
  }

  const qualityScoreColor = (score: number) => {
    if (score >= 8) return { ring: 'ring-emerald-500', text: 'text-emerald-400', label: 'Great' }
    if (score >= 5) return { ring: 'ring-amber-500', text: 'text-amber-400', label: 'Good' }
    return { ring: 'ring-red-500', text: 'text-red-400', label: 'Needs Work' }
  }

  // =========================================================================
  // SUCCESS STATE
  // =========================================================================

  if (isSuccess) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Job Posted!</h1>
          <p className="text-slate-300 mb-8">
            Your job is now live. Workers in your area will start bidding soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={createdJobId ? `/hiring/jobs/${createdJobId}` : '/hiring/jobs'}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25"
            >
              View Your Job
            </Link>
            <Link
              href="/hiring/map"
              className="px-6 py-3 rounded-xl font-semibold text-slate-300 bg-slate-800 border border-white/10 hover:border-white/20 transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // =========================================================================
  // WIZARD LAYOUT
  // =========================================================================

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 pb-24 lg:pb-8">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/hiring/map"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to map
          </Link>
          <h1 className="text-2xl font-bold text-white">Post a New Job</h1>
          <p className="text-slate-400 mt-1">
            Describe what you need and find the perfect worker.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-2">
        <div className="flex items-center justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-700" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />

          {STEPS.map((label, i) => {
            const isCompleted = i < currentStep
            const isActive = i === currentStep
            return (
              <div key={label} className="relative z-10 flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300',
                    isCompleted &&
                      'bg-emerald-500 border-emerald-500 text-white',
                    isActive &&
                      'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/30',
                    !isCompleted &&
                      !isActive &&
                      'bg-slate-800 border-slate-600 text-slate-500',
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : i + 1}
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 font-medium transition-colors',
                    isActive ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500',
                  )}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* =========== STEP 1: Category & Description =========== */}
            {currentStep === 0 && (
              <div className="space-y-8">
                {/* Category Grid */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    What do you need help with? <span className="text-cyan-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => {
                      const Icon = cat.icon
                      const selected = formData.category === cat.id
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => updateField('category', cat.id)}
                          className={cn(
                            'group relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 text-left',
                            selected
                              ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10 scale-[1.02]'
                              : 'bg-slate-900/80 border-white/5 hover:border-white/15 hover:bg-slate-800/80',
                          )}
                        >
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
                              selected
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-slate-800 text-slate-400 group-hover:text-slate-300',
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span
                            className={cn(
                              'font-medium',
                              selected ? 'text-white' : 'text-slate-300',
                            )}
                          >
                            {cat.label}
                          </span>
                          {selected && (
                            <Check className="w-5 h-5 text-cyan-400 ml-auto" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-semibold text-white">
                      Job Title <span className="text-cyan-400">*</span>
                    </label>
                    {formData.isAiGenerated && (
                      <span className="inline-flex items-center gap-1 text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        <Sparkles className="w-3 h-3" /> AI Generated
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      updateField('title', e.target.value)
                      if (formData.isAiGenerated) updateField('isAiGenerated', false)
                    }}
                    placeholder="e.g., Deep House Cleaning Needed"
                    className="w-full px-4 py-3 bg-slate-900/80 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-md"
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-semibold text-white">
                      Description <span className="text-cyan-400">*</span>
                    </label>
                    {formData.isAiGenerated && (
                      <span className="inline-flex items-center gap-1 text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
                        <Sparkles className="w-3 h-3" /> AI Generated
                      </span>
                    )}
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => {
                      updateField('description', e.target.value)
                      if (formData.isAiGenerated) updateField('isAiGenerated', false)
                    }}
                    placeholder="Describe the job in detail. Include what needs to be done, special requirements, and what you will provide."
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-900/80 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-md resize-none"
                  />
                </div>

                {/* AI Generate Button */}
                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={aiDescLoading || !formData.category}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all',
                    aiDescLoading || !formData.category
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20',
                  )}
                >
                  {aiDescLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate with AI
                    </>
                  )}
                </button>

                {/* Next */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceed()}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all',
                      canProceed()
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed',
                    )}
                  >
                    Next: Location
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* =========== STEP 2: Location & Schedule =========== */}
            {currentStep === 1 && (
              <div className="space-y-8">
                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Job Location <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Enter address or neighborhood"
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-md"
                    />
                  </div>
                </div>

                {/* Map Preview Placeholder */}
                <div className="w-full h-48 rounded-2xl bg-slate-800/80 border border-white/5 flex flex-col items-center justify-center gap-2 backdrop-blur-md">
                  <MapPin className="w-8 h-8 text-slate-500" />
                  <p className="text-sm text-slate-500">Map preview will appear here</p>
                </div>

                {/* Schedule Type */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    When do you need this? <span className="text-cyan-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(
                      [
                        { id: 'asap', label: 'ASAP', desc: 'Need it done soon', icon: Zap },
                        { id: 'this_week', label: 'This Week', desc: 'Within the next 7 days', icon: Calendar },
                        { id: 'specific_date', label: 'Specific Date', desc: 'Pick a date', icon: CalendarDays },
                      ] as const
                    ).map((opt) => {
                      const Icon = opt.icon
                      const selected = formData.scheduleType === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updateField('scheduleType', opt.id)}
                          className={cn(
                            'p-4 rounded-2xl border transition-all text-left',
                            selected
                              ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                              : 'bg-slate-900/80 border-white/5 hover:border-white/15',
                          )}
                        >
                          <Icon
                            className={cn(
                              'w-5 h-5 mb-2',
                              selected ? 'text-cyan-400' : 'text-slate-500',
                            )}
                          />
                          <p
                            className={cn(
                              'font-semibold text-sm',
                              selected ? 'text-white' : 'text-slate-300',
                            )}
                          >
                            {opt.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Specific Date Input */}
                {formData.scheduleType === 'specific_date' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <label className="block text-sm font-semibold text-white mb-2">
                      Select Date <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.specificDate}
                      onChange={(e) => updateField('specificDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-slate-900/80 border border-white/5 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-md [color-scheme:dark]"
                    />
                  </motion.div>
                )}

                {/* Estimated Hours */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Estimated Hours{' '}
                    <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.estimatedHours}
                      onChange={(e) => updateField('estimatedHours', e.target.value)}
                      placeholder="e.g., 3"
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-md"
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex-1 py-4 rounded-xl font-semibold text-slate-300 bg-slate-800 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceed()}
                    className={cn(
                      'flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                      canProceed()
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed',
                    )}
                  >
                    Next: Budget
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* =========== STEP 3: Budget & Photos =========== */}
            {currentStep === 2 && (
              <div className="space-y-8">
                {/* AI Pricing Suggestion */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/80 backdrop-blur-md p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">AI Pricing Suggestion</h3>
                  </div>
                  {aiPricingLoading ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing market rates...
                    </div>
                  ) : aiPricing ? (
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">
                          ${aiPricing.min} - ${aiPricing.max}
                        </span>
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full border font-medium capitalize',
                            confidenceColor(aiPricing.confidence),
                          )}
                        >
                          {aiPricing.confidence} confidence
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateField('budgetMin', String(aiPricing.min))
                          updateField('budgetMax', String(aiPricing.max))
                        }}
                        className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                        Use Suggestion
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No pricing data available for this job type.
                    </p>
                  )}
                </div>

                {/* Budget Type Toggle */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Budget Type
                  </label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-slate-800/80 rounded-xl">
                    {(
                      [
                        { id: 'hourly', label: 'Hourly' },
                        { id: 'fixed', label: 'Fixed' },
                        { id: 'open', label: 'Open to Bids' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => updateField('budgetType', opt.id)}
                        className={cn(
                          'py-2.5 rounded-lg text-sm font-medium transition-all',
                          formData.budgetType === opt.id
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-300',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Min / Max Budget */}
                {formData.budgetType !== 'open' && (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Budget Range{' '}
                      {formData.budgetType === 'hourly' && (
                        <span className="text-slate-500 font-normal">(per hour)</span>
                      )}
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="number"
                          min="0"
                          value={formData.budgetMin}
                          onChange={(e) => updateField('budgetMin', e.target.value)}
                          placeholder="Min"
                          className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-md"
                        />
                      </div>
                      <span className="text-slate-500 font-medium">to</span>
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="number"
                          min="0"
                          value={formData.budgetMax}
                          onChange={(e) => updateField('budgetMax', e.target.value)}
                          placeholder="Max"
                          className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-md"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Photos{' '}
                    <span className="text-slate-500 font-normal">
                      (optional, up to 5)
                    </span>
                  </label>

                  {/* Preview Grid */}
                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                      {formData.photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative aspect-square rounded-xl overflow-hidden border border-white/5 group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.preview}
                            alt="Upload preview"
                            className="w-full h-full object-cover"
                          />
                          {photo.uploading && (
                            <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center">
                              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-slate-900/80 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dropzone */}
                  {formData.photos.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-8 rounded-2xl border-2 border-dashed border-white/10 hover:border-cyan-500/30 bg-slate-900/40 flex flex-col items-center justify-center gap-2 transition-colors"
                    >
                      <ImagePlus className="w-8 h-8 text-slate-500" />
                      <p className="text-sm text-slate-400">
                        Drop photos here or click to upload
                      </p>
                      <p className="text-xs text-slate-600">
                        JPG, PNG up to 10MB each
                      </p>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    multiple
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex-1 py-4 rounded-xl font-semibold text-slate-300 bg-slate-800 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canProceed()}
                    className={cn(
                      'flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                      canProceed()
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed',
                    )}
                  >
                    Next: Review
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* =========== STEP 4: Review & Post =========== */}
            {currentStep === 3 && (
              <div className="space-y-8">
                {/* Preview Card */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/80 backdrop-blur-md p-6 space-y-5">
                  <h3 className="text-lg font-bold text-white">Job Preview</h3>

                  {/* Category Badge */}
                  <div className="flex items-center gap-2">
                    {(() => {
                      const CatIcon = getCategoryIcon(formData.category)
                      return (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20">
                          <CatIcon className="w-3.5 h-3.5" />
                          {getCategoryLabel(formData.category)}
                        </span>
                      )
                    })()}
                  </div>

                  {/* Title */}
                  <h4 className="text-xl font-semibold text-white">{formData.title}</h4>

                  {/* Description */}
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {formData.description}
                  </p>

                  <div className="border-t border-white/5 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Location */}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Location</p>
                        <p className="text-sm text-slate-300">{formData.address}</p>
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Schedule</p>
                        <p className="text-sm text-slate-300">
                          {formData.scheduleType === 'asap' && 'ASAP'}
                          {formData.scheduleType === 'this_week' && 'This Week'}
                          {formData.scheduleType === 'specific_date' && formData.specificDate}
                        </p>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Budget</p>
                        <p className="text-sm text-slate-300">
                          {formData.budgetType === 'open'
                            ? 'Open to Bids'
                            : `$${formData.budgetMin || '0'} - $${formData.budgetMax || '0'}${formData.budgetType === 'hourly' ? '/hr' : ''}`}
                        </p>
                      </div>
                    </div>

                    {/* Hours */}
                    {formData.estimatedHours && (
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">
                            Estimated Hours
                          </p>
                          <p className="text-sm text-slate-300">
                            {formData.estimatedHours} hrs
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Photo Thumbnails */}
                  {formData.photos.length > 0 && (
                    <div className="border-t border-white/5 pt-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                        Photos ({formData.photos.length})
                      </p>
                      <div className="flex gap-2">
                        {formData.photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="w-16 h-16 rounded-lg overflow-hidden border border-white/5"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.preview}
                              alt="Job photo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Quality Score */}
                <div className="rounded-2xl border border-white/5 bg-slate-900/80 backdrop-blur-md p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">AI Job Quality Score</h3>
                  </div>

                  {aiQualityLoading ? (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing your job listing...
                    </div>
                  ) : aiQuality ? (
                    <div className="space-y-4">
                      {/* Score Badge */}
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-16 h-16 rounded-full flex items-center justify-center ring-4',
                            qualityScoreColor(aiQuality.score).ring,
                          )}
                        >
                          <span
                            className={cn(
                              'text-2xl font-bold',
                              qualityScoreColor(aiQuality.score).text,
                            )}
                          >
                            {aiQuality.score}
                          </span>
                        </div>
                        <div>
                          <p
                            className={cn(
                              'text-lg font-semibold',
                              qualityScoreColor(aiQuality.score).text,
                            )}
                          >
                            {qualityScoreColor(aiQuality.score).label}
                          </p>
                          <p className="text-sm text-slate-400">out of 10</p>
                        </div>
                      </div>

                      {/* Strengths */}
                      {aiQuality.strengths.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                            Strengths
                          </p>
                          <ul className="space-y-1.5">
                            {aiQuality.strengths.map((s, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-emerald-400"
                              >
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                <span className="text-slate-300">{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvements */}
                      {aiQuality.improvements.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                            Suggestions
                          </p>
                          <ul className="space-y-1.5">
                            {aiQuality.improvements.map((s, i) => (
                              <li
                                key={i}
                                className="flex items-start gap-2 text-sm text-amber-400"
                              >
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span className="text-slate-300">{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Quality analysis unavailable.
                    </p>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex-1 py-4 rounded-xl font-semibold text-slate-300 bg-slate-800 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={cn(
                      'flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2',
                      isSubmitting
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-400 hover:to-amber-400 shadow-lg shadow-orange-500/25',
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
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
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
