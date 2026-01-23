'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  Chrome, Apple, Sparkles, Shield, Zap
} from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

// ============================================
// SIGN IN PAGE - Premium Authentication Experience
// Design: Entrance animations, focus glow states,
// staggered reveals, floating background elements
// ============================================

export default function SignInPage() {
  const router = useRouter()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // OAuth with Google/Apple - will redirect to OAuth provider
  const handleSocialLogin = (provider: 'google' | 'apple') => {
    toast.info(`${provider === 'google' ? 'Google' : 'Apple'} sign-in will be available shortly.`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // For demo, accept any credentials - redirect to hiring by default
    router.push('/hiring/map')
  }

  // Staggered animation classes
  const getStaggerClass = (index: number) => {
    const baseDelay = 100
    return mounted
      ? `opacity-100 translate-y-0 transition-all duration-700 ease-out`
      : 'opacity-0 translate-y-4'
  }

  const getStaggerStyle = (index: number) => ({
    transitionDelay: mounted ? `${index * 100}ms` : '0ms'
  })

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: '10s', animationDelay: '2s' }}
        />
      </div>

      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link
            href="/"
            className={`flex items-center gap-2.5 mb-12 group ${getStaggerClass(0)}`}
            style={getStaggerStyle(0)}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Users className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-white">CrewLink</span>
          </Link>

          {/* Header */}
          <div
            className={`mb-8 ${getStaggerClass(1)}`}
            style={getStaggerStyle(1)}
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-slate-400">Sign in to continue to CrewLink</p>
          </div>

          {/* Social Login */}
          <div
            className={`space-y-3 mb-8 ${getStaggerClass(2)}`}
            style={getStaggerStyle(2)}
          >
            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl text-white font-medium hover:bg-slate-800/80 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <Chrome className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
              Continue with Google
            </button>
            <button
              onClick={() => handleSocialLogin('apple')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl text-white font-medium hover:bg-slate-800/80 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <Apple className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div
            className={`flex items-center gap-4 mb-8 ${getStaggerClass(3)}`}
            style={getStaggerStyle(3)}
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-sm text-slate-500 px-2">or continue with email</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div
              className={getStaggerClass(4)}
              style={getStaggerStyle(4)}
            >
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative group">
                {/* Focus glow effect */}
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 blur transition-opacity duration-300 ${
                    focusedField === 'email' ? 'opacity-30' : 'group-hover:opacity-10'
                  }`}
                />
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'email' ? 'text-cyan-400' : 'text-slate-500'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900 transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div
              className={getStaggerClass(5)}
              style={getStaggerStyle(5)}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                {/* Focus glow effect */}
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 blur transition-opacity duration-300 ${
                    focusedField === 'password' ? 'opacity-30' : 'group-hover:opacity-10'
                  }`}
                />
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                    focusedField === 'password' ? 'text-cyan-400' : 'text-slate-500'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900 transition-all duration-300"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div
              className={getStaggerClass(6)}
              style={getStaggerStyle(6)}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2 group overflow-hidden active:scale-[0.98]"
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <p
            className={`mt-8 text-center text-slate-400 ${getStaggerClass(7)}`}
            style={getStaggerStyle(7)}
          >
            Don&apos;t have an account?{' '}
            <Link
              href="/create-account"
              className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 to-slate-950 items-center justify-center p-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '6s' }}
          />
          <div
            className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '8s', animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDuration: '10s', animationDelay: '2s' }}
          />
        </div>

        {/* Floating grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Content */}
        <div
          className={`relative z-10 text-center max-w-lg ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-1000 delay-300`}
        >
          {/* Animated Icon */}
          <div className="relative w-28 h-28 mx-auto mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 animate-pulse transition-opacity" style={{ animationDuration: '4s' }} />
            <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
              <Users className="w-14 h-14 text-white" />
            </div>
            {/* Floating particles */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDuration: '2.5s' }} />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Connect with the best local help
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Whether you need help with a task or want to earn money, CrewLink connects you with trusted people in your area.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-white/5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-300">Verified profiles</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-white/5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Instant booking</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-white/5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-300">Quality matches</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-12">
            {[
              { value: '50K+', label: 'Active Users' },
              { value: '4.9', label: 'Average Rating' },
              { value: '100K+', label: 'Jobs Done' }
            ].map((stat, index) => (
              <div key={stat.label} className="relative">
                {index > 0 && (
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                )}
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
