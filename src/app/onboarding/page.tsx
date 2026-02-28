'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles,
  MapPin,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
  DollarSign,
  Briefcase,
  CreditCard,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOnboardingStore, useAuthStore } from '@/store'
import { useUserRole } from '@/contexts/UserRoleContext'
import { GlassPanel, GlassCard, FeatureCard } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'

// ============================================
// SKILL OPTIONS
// ============================================

const WORKER_SKILLS = [
  'Cleaning',
  'Moving',
  'Handyman',
  'Yard Work',
  'Painting',
  'Assembly',
  'Delivery',
  'Pet Care',
  'Errands',
  'Cooking',
] as const

const RADIUS_OPTIONS = [
  { value: '5', label: '5 miles' },
  { value: '10', label: '10 miles' },
  { value: '15', label: '15 miles' },
  { value: '25', label: '25 miles' },
  { value: '50', label: '50 miles' },
]

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select a category', disabled: true },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'moving', label: 'Moving & Hauling' },
  { value: 'handyman', label: 'Handyman' },
  { value: 'yard-work', label: 'Yard Work' },
  { value: 'painting', label: 'Painting' },
  { value: 'assembly', label: 'Assembly' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'pet-care', label: 'Pet Care' },
  { value: 'errands', label: 'Errands' },
  { value: 'cooking', label: 'Cooking' },
]

// ============================================
// TYPES
// ============================================

interface WorkerData {
  skills: string[]
  hourlyRate: number
  address: string
  serviceRadius: number
  bio: string
  avatarFile: File | null
}

interface HirerData {
  name: string
  companyName: string
  defaultLocation: string
  jobTitle: string
  jobCategory: string
  budgetMin: number
  budgetMax: number
}

type SlideDirection = 'next' | 'prev'

// ============================================
// ONBOARDING PAGE
// ============================================

export default function OnboardingPage() {
  const router = useRouter()
  const { role } = useUserRole()
  const { step, setStep, setData, markComplete, reset } = useOnboardingStore()
  const { user } = useAuthStore()

  const [direction, setDirection] = useState<SlideDirection>('next')
  const [isAnimating, setIsAnimating] = useState(false)

  // Worker state
  const [workerData, setWorkerData] = useState<WorkerData>({
    skills: [],
    hourlyRate: 25,
    address: '',
    serviceRadius: 15,
    bio: '',
    avatarFile: null,
  })

  // Hirer state
  const [hirerData, setHirerData] = useState<HirerData>({
    name: user?.name || '',
    companyName: '',
    defaultLocation: '',
    jobTitle: '',
    jobCategory: '',
    budgetMin: 0,
    budgetMax: 0,
  })

  const isWorker = role === 'WORKER'
  const totalSteps = isWorker ? 4 : 3
  const progress = (step / totalSteps) * 100

  // Reset onboarding store on mount if previously completed
  useEffect(() => {
    const stored = useOnboardingStore.getState()
    if (stored.isComplete) {
      reset()
    }
  }, [reset])

  // Redirect if no role selected
  useEffect(() => {
    if (role === null) {
      router.replace('/select-role')
    }
  }, [role, router])

  const animateTransition = useCallback((dir: SlideDirection, callback: () => void) => {
    setDirection(dir)
    setIsAnimating(true)
    setTimeout(() => {
      callback()
      setIsAnimating(false)
    }, 200)
  }, [])

  const handleNext = useCallback(() => {
    if (step < totalSteps) {
      animateTransition('next', () => {
        setStep(step + 1)
      })
    }
  }, [step, totalSteps, animateTransition, setStep])

  const handleBack = useCallback(() => {
    if (step > 1) {
      animateTransition('prev', () => {
        setStep(step - 1)
      })
    }
  }, [step, animateTransition, setStep])

  const handleComplete = useCallback(() => {
    // Persist relevant data
    if (isWorker) {
      setData({
        skills: workerData.skills,
        hourlyRate: workerData.hourlyRate,
        baseAddress: workerData.address,
        serviceRadius: workerData.serviceRadius,
        bio: workerData.bio,
      })
    }
    markComplete()
    router.push(isWorker ? '/work/map' : '/hiring/map')
  }, [isWorker, workerData, setData, markComplete, router])

  const handleSkip = useCallback(() => {
    handleNext()
  }, [handleNext])

  const toggleSkill = useCallback((skill: string) => {
    setWorkerData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }))
  }, [])

  // ============================================
  // GRADIENT CLASSES
  // ============================================

  const gradientFrom = isWorker ? 'from-emerald-400' : 'from-cyan-400'
  const gradientTo = isWorker ? 'to-teal-500' : 'to-blue-500'
  const glowColor = isWorker
    ? 'shadow-[0_0_8px_rgba(16,185,129,0.5)]'
    : 'shadow-[0_0_8px_rgba(6,182,212,0.5)]'
  const accentText = isWorker ? 'text-emerald-400' : 'text-cyan-400'
  const accentBg = isWorker ? 'bg-emerald-500' : 'bg-cyan-500'

  // ============================================
  // WORKER STEP RENDERERS
  // ============================================

  const renderWorkerStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          <span className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
            What are you great at?
          </span>
        </h2>
        <p className="text-slate-400 text-lg">Select the services you offer</p>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {WORKER_SKILLS.map((skill) => {
          const isSelected = workerData.skills.includes(skill)
          return (
            <GlassCard
              key={skill}
              interactive
              padding="md"
              rounded="xl"
              className={cn(
                'cursor-pointer text-center transition-all duration-200',
                isSelected
                  ? isWorker
                    ? 'border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                    : 'border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                  : 'hover:border-white/20'
              )}
              onClick={() => toggleSkill(skill)}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  'font-medium text-sm',
                  isSelected ? 'text-white' : 'text-slate-300'
                )}>
                  {skill}
                </span>
                {isSelected && (
                  <Check className={cn('w-4 h-4', accentText)} />
                )}
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Hourly Rate */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">
          Hourly Rate
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={workerData.hourlyRate}
              onChange={(e) => setWorkerData(prev => ({ ...prev, hourlyRate: Number(e.target.value) }))}
              className={cn(
                'w-full h-2 rounded-full appearance-none cursor-pointer',
                'bg-slate-700',
                '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full',
                isWorker
                  ? '[&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : '[&::-webkit-slider-thumb]:bg-cyan-500 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              )}
            />
          </div>
          <div className="min-w-[80px] text-right">
            <span className={cn('text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent', gradientFrom, gradientTo)}>
              ${workerData.hourlyRate}
            </span>
            <span className="text-slate-500 text-sm">/hr</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">You can always adjust this later</p>
      </div>
    </div>
  )

  const renderWorkerStep2 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          <span className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
            Where do you work?
          </span>
        </h2>
        <p className="text-slate-400 text-lg">Set your home base and service area</p>
      </div>

      <div className="space-y-6">
        <Input
          label="Your address or city"
          placeholder="e.g. San Francisco, CA"
          value={workerData.address}
          onChange={(e) => setWorkerData(prev => ({ ...prev, address: e.target.value }))}
          leftIcon={<MapPin className="w-5 h-5" />}
          glowOnFocus
        />

        <Select
          label="Service radius"
          options={RADIUS_OPTIONS}
          value={String(workerData.serviceRadius)}
          onChange={(e) => setWorkerData(prev => ({ ...prev, serviceRadius: Number(e.target.value) }))}
          glowOnFocus
        />

        {/* Visual radius indicator */}
        <GlassPanel variant="subtle" padding="lg" rounded="xl" border="light">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <div className={cn(
                'absolute inset-0 rounded-full border-2 border-dashed',
                isWorker ? 'border-emerald-500/30' : 'border-cyan-500/30'
              )} />
              <div className={cn(
                'w-3 h-3 rounded-full',
                accentBg
              )} />
            </div>
            <div>
              <p className="text-white font-medium">
                {workerData.serviceRadius} mile radius
              </p>
              <p className="text-slate-400 text-sm">
                {workerData.address
                  ? `Jobs within ${workerData.serviceRadius} miles of ${workerData.address}`
                  : 'Enter your location to see your coverage area'}
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  )

  const renderWorkerStep3 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          <span className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
            Let people know who you are
          </span>
        </h2>
        <p className="text-slate-400 text-lg">A great profile gets more jobs</p>
      </div>

      <div className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex justify-center">
          <GlassPanel
            variant="subtle"
            padding="none"
            rounded="3xl"
            border="light"
            className="w-28 h-28 flex items-center justify-center cursor-pointer border-dashed border-2 border-white/10 hover:border-white/30 transition-colors"
          >
            <div className="flex flex-col items-center gap-2">
              <Camera className="w-8 h-8 text-slate-500" />
              <span className="text-xs text-slate-500">Add Photo</span>
            </div>
          </GlassPanel>
        </div>

        {/* Bio */}
        <div className="relative">
          <Textarea
            label="Short bio"
            placeholder="Tell potential clients about your experience, skills, and what makes you great..."
            value={workerData.bio}
            onChange={(e) => setWorkerData(prev => ({ ...prev, bio: e.target.value }))}
            maxLength={300}
            glowOnFocus
          />
          <p className="text-xs text-slate-500 text-right mt-1">
            {workerData.bio.length}/300
          </p>
        </div>

        {/* Live Preview Card */}
        <div>
          <p className="text-sm font-medium text-slate-400 mb-3">Profile preview</p>
          <GlassCard interactive={false} padding="lg" rounded="xl">
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
                isWorker
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
                  : 'bg-gradient-to-br from-cyan-400 to-blue-600'
              )}>
                <span className="text-white font-bold text-lg">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white">{user?.name || 'Your Name'}</h4>
                <div className="flex items-center gap-2 mt-1">
                  {workerData.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        isWorker
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-cyan-500/10 text-cyan-400'
                      )}
                    >
                      {skill}
                    </span>
                  ))}
                  {workerData.skills.length > 3 && (
                    <span className="text-xs text-slate-500">
                      +{workerData.skills.length - 3}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                  {workerData.bio || 'Your bio will appear here...'}
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className={cn('font-semibold', accentText)}>
                    ${workerData.hourlyRate}/hr
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {workerData.address || 'Your area'}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )

  const renderWorkerStep4 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center',
            isWorker
              ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
              : 'bg-gradient-to-br from-cyan-400 to-blue-600'
          )}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          <span className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
            You&apos;re all set!
          </span>
        </h2>
        <p className="text-slate-400 text-lg">Here&apos;s a summary of your profile</p>
      </div>

      {/* Summary Card */}
      <GlassPanel variant="elevated" padding="xl" rounded="2xl" border="light">
        <div className="space-y-5">
          {/* Skills */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {workerData.skills.length > 0 ? workerData.skills.map((skill) => (
                <span
                  key={skill}
                  className={cn(
                    'text-sm px-3 py-1 rounded-full font-medium',
                    isWorker
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  )}
                >
                  {skill}
                </span>
              )) : (
                <span className="text-sm text-slate-500">No skills selected</span>
              )}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Rate */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hourly Rate</p>
            <span className={cn('text-lg font-bold', accentText)}>${workerData.hourlyRate}/hr</span>
          </div>

          <div className="h-px bg-white/5" />

          {/* Area */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Service Area</p>
            <span className="text-sm text-white">
              {workerData.address || 'Not set'} ({workerData.serviceRadius} mi)
            </span>
          </div>

          <div className="h-px bg-white/5" />

          {/* Bio */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Bio</p>
            <p className="text-sm text-slate-300">
              {workerData.bio || 'No bio added yet'}
            </p>
          </div>
        </div>
      </GlassPanel>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="success"
          size="xl"
          glow
          fullWidth
          onClick={handleComplete}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Start Browsing Jobs
        </Button>
        <p className="text-sm text-slate-500">
          You can always update these in your profile settings
        </p>
      </div>
    </div>
  )

  // ============================================
  // HIRER STEP RENDERERS
  // ============================================

  const renderHirerStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          <span className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
            Tell us about yourself
          </span>
        </h2>
        <p className="text-slate-400 text-lg">Just a few details to get started</p>
      </div>

      <div className="space-y-5">
        <Input
          label="Your name"
          placeholder="John Doe"
          value={hirerData.name}
          onChange={(e) => setHirerData(prev => ({ ...prev, name: e.target.value }))}
          glowOnFocus
        />

        <Input
          label="Company name (optional)"
          placeholder="e.g. My Home Services LLC"
          value={hirerData.companyName}
          onChange={(e) => setHirerData(prev => ({ ...prev, companyName: e.target.value }))}
          glowOnFocus
        />

        <Input
          label="Default location"
          placeholder="e.g. San Francisco, CA"
          value={hirerData.defaultLocation}
          onChange={(e) => setHirerData(prev => ({ ...prev, defaultLocation: e.target.value }))}
          leftIcon={<MapPin className="w-5 h-5" />}
          glowOnFocus
        />
      </div>
    </div>
  )

  const renderHirerStep2 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          <span className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
            Ready to hire?
          </span>
        </h2>
        <p className="text-slate-400 text-lg">Post your first job or skip for now</p>
      </div>

      <div className="space-y-5">
        <Input
          label="Job title"
          placeholder="e.g. Deep clean my apartment"
          value={hirerData.jobTitle}
          onChange={(e) => setHirerData(prev => ({ ...prev, jobTitle: e.target.value }))}
          glowOnFocus
        />

        <Select
          label="Category"
          options={CATEGORY_OPTIONS}
          value={hirerData.jobCategory}
          onChange={(e) => setHirerData(prev => ({ ...prev, jobCategory: e.target.value }))}
          placeholder="Select a category"
          glowOnFocus
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Budget min ($)"
            type="number"
            placeholder="50"
            value={hirerData.budgetMin || ''}
            onChange={(e) => setHirerData(prev => ({ ...prev, budgetMin: Number(e.target.value) }))}
            leftIcon={<DollarSign className="w-4 h-4" />}
            glowOnFocus
          />
          <Input
            label="Budget max ($)"
            type="number"
            placeholder="200"
            value={hirerData.budgetMax || ''}
            onChange={(e) => setHirerData(prev => ({ ...prev, budgetMax: Number(e.target.value) }))}
            leftIcon={<DollarSign className="w-4 h-4" />}
            glowOnFocus
          />
        </div>

        {/* AI hint */}
        <GlassPanel variant="subtle" padding="md" rounded="xl" border="light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">AI will help write your description</p>
              <p className="text-xs text-slate-500">Just provide the basics and we handle the rest</p>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Skip link */}
      <div className="text-center">
        <button
          onClick={handleSkip}
          className="text-sm text-slate-500 hover:text-white transition-colors underline-offset-4 hover:underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  )

  const renderHirerStep3 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className={cn(
            'w-16 h-16 rounded-2xl flex items-center justify-center',
            'bg-gradient-to-br from-cyan-400 to-blue-600'
          )}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          <span className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
            Welcome to CrewLink!
          </span>
        </h2>
        <p className="text-slate-400 text-lg">Everything you need to find great help</p>
      </div>

      {/* Feature Highlights */}
      <div className="grid gap-4">
        <FeatureCard gradient="cyan" shine>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
              <Briefcase className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Post Jobs</h3>
              <p className="text-sm text-slate-400">Describe what you need and get bids from verified workers</p>
            </div>
          </div>
        </FeatureCard>

        <FeatureCard gradient="emerald" shine>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Find Workers</h3>
              <p className="text-sm text-slate-400">Browse local professionals with ratings and reviews</p>
            </div>
          </div>
        </FeatureCard>

        <FeatureCard gradient="purple" shine>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Secure Payments</h3>
              <p className="text-sm text-slate-400">Pay safely through the platform with protection for both sides</p>
            </div>
          </div>
        </FeatureCard>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="primary"
          size="xl"
          glow
          fullWidth
          onClick={handleComplete}
          rightIcon={<ArrowRight className="w-5 h-5" />}
        >
          Go to Dashboard
        </Button>
        <p className="text-sm text-slate-500">
          You can explore all features from your dashboard
        </p>
      </div>
    </div>
  )

  // ============================================
  // STEP DISPATCHER
  // ============================================

  const renderStep = () => {
    if (isWorker) {
      switch (step) {
        case 1: return renderWorkerStep1()
        case 2: return renderWorkerStep2()
        case 3: return renderWorkerStep3()
        case 4: return renderWorkerStep4()
        default: return renderWorkerStep1()
      }
    } else {
      switch (step) {
        case 1: return renderHirerStep1()
        case 2: return renderHirerStep2()
        case 3: return renderHirerStep3()
        default: return renderHirerStep1()
      }
    }
  }

  const isLastStep = step === totalSteps
  const showNextButton = !isLastStep
  const showBackButton = step > 1

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={cn(
          'absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]',
          isWorker ? 'bg-emerald-500/5' : 'bg-cyan-500/5'
        )} />
        <div className={cn(
          'absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px]',
          isWorker ? 'bg-teal-500/5' : 'bg-blue-500/5'
        )} />
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 w-full">
        <div className="h-1 bg-slate-800/50">
          <div
            className={cn(
              'h-full bg-gradient-to-r transition-all duration-500 ease-out',
              isWorker
                ? 'from-emerald-400 to-teal-500'
                : 'from-cyan-400 to-blue-500',
              glowColor
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center',
              isWorker
                ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
                : 'bg-gradient-to-br from-cyan-400 to-blue-600'
            )}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">CrewLink</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Step {step} of {totalSteps}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-start justify-center px-6 py-10 md:py-16">
        <div className="w-full max-w-lg">
          <GlassPanel variant="elevated" padding="xl" rounded="2xl" border="light">
            {/* Step content with transition */}
            <div
              className={cn(
                'transition-all duration-200 ease-out',
                isAnimating && direction === 'next' && 'opacity-0 translate-x-4',
                isAnimating && direction === 'prev' && 'opacity-0 -translate-x-4',
                !isAnimating && 'opacity-100 translate-x-0'
              )}
            >
              {renderStep()}
            </div>
          </GlassPanel>

          {/* Navigation Buttons */}
          {showNextButton && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleBack}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back
                  </Button>
                )}
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className={cn(
                  isWorker && 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500'
                )}
              >
                Continue
              </Button>
            </div>
          )}

          {/* Skip link for non-final steps */}
          {!isLastStep && step !== 2 && (
            <div className="text-center mt-4">
              <button
                onClick={handleSkip}
                className="text-sm text-slate-500 hover:text-white transition-colors underline-offset-4 hover:underline"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
