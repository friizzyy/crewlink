'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Upload, Briefcase, MapPin, Clock, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react'
import { MarketingLayout } from '@/components/MarketingLayout'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'
import { getRoleBySlug, JOB_ROLES, type JobRole } from '@/lib/careers'

// ============================================
// APPLICATION PAGE - Job application form
// Functional form with validation and success state
// ============================================

interface FormData {
  name: string
  email: string
  location: string
  linkedIn: string
  resumeLink: string
  note: string
}

interface FormErrors {
  name?: string
  email?: string
  location?: string
  note?: string
}

function ApplicationFormContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const roleSlug = searchParams.get('role')
  const [role, setRole] = useState<JobRole | null>(null)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    location: '',
    linkedIn: '',
    resumeLink: '',
    note: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const { ref, isVisible } = useScrollReveal<HTMLDivElement>()

  useEffect(() => {
    if (roleSlug) {
      const foundRole = getRoleBySlug(roleSlug)
      setRole(foundRole || null)
    }
  }, [roleSlug])

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        break
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email'
        break
      case 'location':
        if (!value.trim()) return 'Location is required'
        break
      case 'note':
        if (!value.trim()) return 'Please tell us a bit about yourself'
        if (value.trim().length < 20) return 'Please write at least a few sentences'
        break
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    const fieldsToValidate: (keyof FormData)[] = ['name', 'email', 'location', 'note']
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field as keyof FormErrors] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))

    const error = validateField(name, value)
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      location: true,
      linkedIn: true,
      resumeLink: true,
      note: true,
    })

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate submission delay (in real app, this would be an API call)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Store submission in localStorage for demo purposes
    const submission = {
      ...formData,
      role: role?.title || 'General Application',
      roleSlug: roleSlug || 'general',
      submittedAt: new Date().toISOString(),
    }

    try {
      const existingSubmissions = JSON.parse(localStorage.getItem('crewlink:applications') || '[]')
      existingSubmissions.push(submission)
      localStorage.setItem('crewlink:applications', JSON.stringify(existingSubmissions))
    } catch (err) {
      console.error('Failed to save application locally:', err)
    }

    // Navigate to success page
    router.push(`/careers/apply/success?role=${roleSlug || 'general'}&name=${encodeURIComponent(formData.name)}`)
  }

  // Build mailto fallback link
  const buildMailtoLink = () => {
    const subject = encodeURIComponent(`Application: ${role?.title || 'General Application'}`)
    const body = encodeURIComponent(
      `Hi CrewLink team,

I'm applying for the ${role?.title || 'open'} position.

Name: ${formData.name || '[Your Name]'}
Email: ${formData.email || '[Your Email]'}
Location: ${formData.location || '[Your Location]'}
LinkedIn/Portfolio: ${formData.linkedIn || '[Your LinkedIn]'}
Resume: ${formData.resumeLink || '[Link to Resume]'}

About me:
${formData.note || '[Tell us about yourself]'}

Best regards`
    )
    return `mailto:careers@crewlink.com?subject=${subject}&body=${body}`
  }

  return (
    <div ref={ref} className="pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto px-6 sm:px-8 lg:px-12 relative">
        {/* Back link */}
        <Link
          href={role ? `/careers/${role.slug}` : '/careers'}
          className={`inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8 group ${getRevealClasses(isVisible, 'up')}`}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {role ? `Back to ${role.title}` : 'Back to careers'}
        </Link>

        {/* Header */}
        <div className={getRevealClasses(isVisible, 'up')} style={{ transitionDelay: '60ms' }}>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Apply{role ? ` for ${role.title}` : ''}
          </h1>

          {role && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                {role.department}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {role.location}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                <Clock className="w-4 h-4 text-emerald-400" />
                {role.type}
              </span>
            </div>
          )}

          <p className="mt-4 text-slate-400">
            Fill out the form below and we&apos;ll get back to you within a week.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={`mt-10 space-y-6 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '120ms' }}>
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
              Full name <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 bg-slate-800/60 border rounded-xl text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 ${
                errors.name && touched.name
                  ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500'
                  : 'border-white/10 focus:ring-emerald-500/30 focus:border-emerald-500/50'
              }`}
              placeholder="Jane Doe"
            />
            {errors.name && touched.name && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email <span className="text-emerald-400">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 bg-slate-800/60 border rounded-xl text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 ${
                errors.email && touched.email
                  ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500'
                  : 'border-white/10 focus:ring-emerald-500/30 focus:border-emerald-500/50'
              }`}
              placeholder="jane@example.com"
            />
            {errors.email && touched.email && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-white mb-2">
              Location <span className="text-emerald-400">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 bg-slate-800/60 border rounded-xl text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 ${
                errors.location && touched.location
                  ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500'
                  : 'border-white/10 focus:ring-emerald-500/30 focus:border-emerald-500/50'
              }`}
              placeholder="San Francisco, CA"
            />
            {errors.location && touched.location && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {errors.location}
              </p>
            )}
          </div>

          {/* LinkedIn / Portfolio */}
          <div>
            <label htmlFor="linkedIn" className="block text-sm font-medium text-white mb-2">
              LinkedIn or Portfolio
            </label>
            <input
              type="url"
              id="linkedIn"
              name="linkedIn"
              value={formData.linkedIn}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
              placeholder="https://linkedin.com/in/janedoe"
            />
          </div>

          {/* Resume link */}
          <div>
            <label htmlFor="resumeLink" className="block text-sm font-medium text-white mb-2">
              Resume / CV link
            </label>
            <input
              type="url"
              id="resumeLink"
              name="resumeLink"
              value={formData.resumeLink}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-slate-800/60 border border-white/10 rounded-xl text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
              placeholder="https://drive.google.com/... or Dropbox link"
            />
            <p className="mt-2 text-xs text-slate-500">
              Upload your resume to Google Drive, Dropbox, or similar and paste the link
            </p>
          </div>

          {/* Note */}
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-white mb-2">
              Tell us about yourself <span className="text-emerald-400">*</span>
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              onBlur={handleBlur}
              rows={5}
              className={`w-full px-4 py-3 bg-slate-800/60 border rounded-xl text-white placeholder-slate-500 transition-all focus:outline-none focus:ring-2 resize-none ${
                errors.note && touched.note
                  ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500'
                  : 'border-white/10 focus:ring-emerald-500/30 focus:border-emerald-500/50'
              }`}
              placeholder="What interests you about this role? What relevant experience do you bring?"
            />
            {errors.note && touched.note && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {errors.note}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit application
                </>
              )}
            </button>

            {/* Mailto fallback */}
            <p className="text-center text-sm text-slate-500">
              Having trouble?{' '}
              <a
                href={buildMailtoLink()}
                className="text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
              >
                Email us directly
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ApplicationPage() {
  return (
    <MarketingLayout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading...</p>
          </div>
        </div>
      }>
        <ApplicationFormContent />
      </Suspense>
    </MarketingLayout>
  )
}
