'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Graphic */}
        <div className="mb-8">
          <div className="text-8xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            404
          </div>
          <div className="mt-2 text-slate-500 text-sm tracking-widest uppercase">
            Page Not Found
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Oops! This page doesn&apos;t exist
        </h1>
        <p className="text-slate-400 mb-8">
          The page you&apos;re looking for might have been moved, deleted, or never existed.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/25"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/work/map"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
          >
            <Search className="w-4 h-4" />
            Find Jobs
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  )
}
