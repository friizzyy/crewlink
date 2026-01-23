'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirect /hiring to /hiring/map
export default function HiringIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/hiring/map')
  }, [router])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Redirecting...</p>
      </div>
    </div>
  )
}
