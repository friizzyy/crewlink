'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  Chrome, User, Phone, CheckCircle2, Briefcase, Shield, Zap, Star
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

// ============================================
// CREATE ACCOUNT PAGE - Premium Onboarding
// Design: Focus glow, ambient backgrounds,
// staggered animations, shimmer effects
// ============================================

export default function CreateAccountPage() {
  const router = useRouter()
  const toast = useToast()
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<'hire' | 'work' | 'both' | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // OAuth with Google - will redirect to OAuth provider
  const handleSocialLogin = () => {
    toast.info('Google sign-up will be available shortly.')
  }
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    router.push(userType === 'work' ? '/work/map' : '/hiring/map')
  }

  // Get color scheme based on user type selection
  const getColorScheme = () => {
    switch (userType) {
      case 'hire':
        return {
          primary: 'cyan',
          gradient: 'from-cyan-500 to-blue-600',
          gradientHover: 'hover:from-cyan-400 hover:to-blue-500',
          shadow: 'shadow-cyan-500/25',
          ring: 'focus:ring-cyan-500/50',
          glow: 'bg-cyan-500',
        }
      case 'work':
        return {
          primary: 'emerald',
          gradient: 'from-emerald-500 to-teal-600',
          gradientHover: 'hover:from-emerald-400 hover:to-teal-500',
          shadow: 'shadow-emerald-500/25',
          ring: 'focus:ring-emerald-500/50',
          glow: 'bg-emerald-500',
        }
      default:
        return {
          primary: 'purple',
          gradient: 'from-purple-500 to-pink-600',
          gradientHover: 'hover:from-purple-400 hover:to-pink-500',
          shadow: 'shadow-purple-500/25',
          ring: 'focus:ring-purple-500/50',
          glow: 'bg-purple-500',
        }
    }
  }

  const colors = getColorScheme()

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Subtle ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] animate-pulse"
            style={{ animationDuration: '12s' }}
          />
          <div
            className="absolute bottom-1/4 -right-20 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px] animate-pulse"
            style={{ animationDuration: '10s', animationDelay: '3s' }}
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 mb-12 transition-transform hover:scale-[1.02]"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-white">CrewLink</span>
          </Link>

          {/* Step 1: Choose User Type */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="mb-8" style={{ animationDelay: '0ms' }}>
                <h1 className="text-3xl font-bold text-white mb-2">Join CrewLink</h1>
                <p className="text-slate-400">How do you want to use CrewLink?</p>
              </div>

              <div className="space-y-4 mb-8">
                {/* Hire Option */}
                <button
                  onClick={() => { setUserType('hire'); setStep(2); }}
                  className="group w-full p-5 rounded-2xl border-2 border-white/10 hover:border-cyan-500/50 bg-slate-900/50 backdrop-blur-sm text-left transition-all duration-300 hover:bg-cyan-500/5 hover:shadow-lg hover:shadow-cyan-500/10 animate-slide-up"
                  style={{ animationDelay: '100ms' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Briefcase className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg group-hover:text-cyan-400 transition-colors">I want to hire</h3>
                      <p className="text-slate-400 text-sm mt-1">Post jobs and find skilled workers for your tasks</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all mt-1" />
                  </div>
                </button>

                {/* Work Option */}
                <button
                  onClick={() => { setUserType('work'); setStep(2); }}
                  className="group w-full p-5 rounded-2xl border-2 border-white/10 hover:border-emerald-500/50 bg-slate-900/50 backdrop-blur-sm text-left transition-all duration-300 hover:bg-emerald-500/5 hover:shadow-lg hover:shadow-emerald-500/10 animate-slide-up"
                  style={{ animationDelay: '200ms' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg group-hover:text-emerald-400 transition-colors">I want to work</h3>
                      <p className="text-slate-400 text-sm mt-1">Find jobs near you and earn money on your schedule</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all mt-1" />
                  </div>
                </button>

                {/* Both Option */}
                <button
                  onClick={() => { setUserType('both'); setStep(2); }}
                  className="group w-full p-5 rounded-2xl border-2 border-white/10 hover:border-purple-500/50 bg-slate-900/50 backdrop-blur-sm text-left transition-all duration-300 hover:bg-purple-500/5 hover:shadow-lg hover:shadow-purple-500/10 animate-slide-up"
                  style={{ animationDelay: '300ms' }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg group-hover:text-purple-400 transition-colors">Both</h3>
                      <p className="text-slate-400 text-sm mt-1">Hire help and offer your services</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all mt-1" />
                  </div>
                </button>
              </div>

              <p className="text-center text-slate-400 animate-slide-up" style={{ animationDelay: '400ms' }}>
                Already have an account?{' '}
                <Link href="/sign-in" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Account Details */}
          {step === 2 && (
            <div className="animate-fade-in">
              <button
                onClick={() => setStep(1)}
                className="group flex items-center gap-1 text-slate-400 hover:text-white mb-6 text-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                Back
              </button>

              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
                <p className="text-slate-400">Enter your details to get started</p>
              </div>

              {/* Social Login */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleSocialLogin}
                  className="group relative w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-slate-900/70 backdrop-blur-sm border border-white/10 rounded-xl text-white font-medium hover:bg-slate-800 hover:border-white/20 transition-all duration-300 overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                  <Chrome className="w-5 h-5 relative" />
                  <span className="relative">Continue with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-sm text-slate-500 px-2">or</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* First Name */}
                  <div className="animate-slide-up" style={{ animationDelay: '50ms' }}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">First name</label>
                    <div className="relative group">
                      {/* Focus glow */}
                      <div
                        className={`absolute -inset-0.5 ${colors.glow} rounded-xl blur opacity-0 transition-opacity duration-300 ${
                          focusedField === 'firstName' ? 'opacity-20' : 'group-hover:opacity-10'
                        }`}
                      />
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          onFocus={() => setFocusedField('firstName')}
                          onBlur={() => setFocusedField(null)}
                          placeholder="John"
                          className={`w-full pl-12 pr-4 py-3.5 bg-slate-900/70 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-all`}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Last name</label>
                    <div className="relative group">
                      <div
                        className={`absolute -inset-0.5 ${colors.glow} rounded-xl blur opacity-0 transition-opacity duration-300 ${
                          focusedField === 'lastName' ? 'opacity-20' : 'group-hover:opacity-10'
                        }`}
                      />
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Doe"
                        className="relative w-full px-4 py-3.5 bg-slate-900/70 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <div className="relative group">
                    <div
                      className={`absolute -inset-0.5 ${colors.glow} rounded-xl blur opacity-0 transition-opacity duration-300 ${
                        focusedField === 'email' ? 'opacity-20' : 'group-hover:opacity-10'
                      }`}
                    />
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900/70 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone number</label>
                  <div className="relative group">
                    <div
                      className={`absolute -inset-0.5 ${colors.glow} rounded-xl blur opacity-0 transition-opacity duration-300 ${
                        focusedField === 'phone' ? 'opacity-20' : 'group-hover:opacity-10'
                      }`}
                    />
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="+1 (555) 123-4567"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900/70 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="animate-slide-up" style={{ animationDelay: '250ms' }}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative group">
                    <div
                      className={`absolute -inset-0.5 ${colors.glow} rounded-xl blur opacity-0 transition-opacity duration-300 ${
                        focusedField === 'password' ? 'opacity-20' : 'group-hover:opacity-10'
                      }`}
                    />
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Create a strong password"
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-900/70 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Must be at least 8 characters</p>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3 py-2 animate-slide-up" style={{ animationDelay: '300ms' }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-white/20 bg-slate-900 text-cyan-500 focus:ring-cyan-500/50 cursor-pointer"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-slate-400 cursor-pointer">
                    I agree to the{' '}
                    <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">Privacy Policy</Link>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
                  <button
                    type="submit"
                    disabled={isLoading || !agreedToTerms}
                    className={`group relative w-full py-4 bg-gradient-to-r ${colors.gradient} text-white font-semibold rounded-xl ${colors.gradientHover} transition-all ${colors.shadow} shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 overflow-hidden`}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin relative" />
                        <span className="relative">Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span className="relative">Create Account</span>
                        <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-center text-slate-400 animate-slide-up" style={{ animationDelay: '400ms' }}>
                Already have an account?{' '}
                <Link href="/sign-in" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 to-slate-950 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse"
            style={{ animationDuration: '8s' }}
          />
          <div
            className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"
            style={{ animationDuration: '10s', animationDelay: '2s' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-[80px] animate-pulse"
            style={{ animationDuration: '12s', animationDelay: '4s' }}
          />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-lg">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-cyan-500/30 animate-float">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Join thousands of users
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Start earning or get help with tasks in your neighborhood. It only takes a minute to sign up.
          </p>

          {/* Features */}
          <div className="mt-12 space-y-4 text-left">
            {[
              { icon: Shield, text: 'Verified profiles and secure payments', color: 'text-emerald-400' },
              { icon: Zap, text: 'Real-time job matching in your area', color: 'text-cyan-400' },
              { icon: Star, text: 'Flexible scheduling - work when you want', color: 'text-purple-400' },
              { icon: CheckCircle2, text: '24/7 support and satisfaction guarantee', color: 'text-pink-400' },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <feature.icon className={`w-5 h-5 ${feature.color} shrink-0`} />
                <span className="text-slate-300">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '100K+', label: 'Jobs Posted' },
              { value: '4.9', label: 'Avg Rating' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.5s ease-out forwards;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
