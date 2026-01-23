'use client'

import { useState } from 'react'
import { MapPin, Navigation, X, AlertCircle, RefreshCw, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GeolocationModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationGranted: (coords: { lat: number; lng: number }) => void
  onChooseCity: () => void
  mode: 'work' | 'hiring'
}

export function GeolocationModal({
  isOpen,
  onClose,
  onLocationGranted,
  onChooseCity,
  mode,
}: GeolocationModalProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'denied' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const modeColor = mode === 'work' ? 'emerald' : 'cyan'
  const modeLabel = mode === 'work' ? 'jobs' : 'help'

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setStatus('error')
      setErrorMessage('Geolocation is not supported by your browser.')
      return
    }

    setStatus('requesting')
    setErrorMessage(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        onLocationGranted(coords)
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied')
          setErrorMessage('Location access was denied. You can enable it in your browser settings.')
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setStatus('error')
          setErrorMessage('Location information is unavailable.')
        } else if (error.code === error.TIMEOUT) {
          setStatus('error')
          setErrorMessage('Location request timed out. Please try again.')
        } else {
          setStatus('error')
          setErrorMessage('An unknown error occurred.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn(
            'absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[100px]',
            modeColor === 'emerald' ? 'bg-emerald-500/10' : 'bg-cyan-500/10'
          )} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Icon */}
          <div className={cn(
            'w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center',
            modeColor === 'emerald'
              ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20'
              : 'bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-500/20'
          )}>
            {status === 'requesting' ? (
              <RefreshCw className={cn(
                'w-10 h-10 animate-spin',
                modeColor === 'emerald' ? 'text-emerald-400' : 'text-cyan-400'
              )} />
            ) : status === 'denied' || status === 'error' ? (
              <AlertCircle className="w-10 h-10 text-amber-400" />
            ) : (
              <Navigation className={cn(
                'w-10 h-10',
                modeColor === 'emerald' ? 'text-emerald-400' : 'text-cyan-400'
              )} />
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            {status === 'denied' ? 'Location Access Denied' :
             status === 'error' ? 'Something Went Wrong' :
             status === 'requesting' ? 'Finding Your Location...' :
             `Find ${modeLabel} near you`}
          </h2>

          {/* Description */}
          <p className="text-slate-400 mb-8 leading-relaxed">
            {status === 'denied' || status === 'error' ? (
              errorMessage
            ) : status === 'requesting' ? (
              'Please wait while we determine your location.'
            ) : (
              <>
                Share your location to see {modeLabel} within 20 miles of you.
                Your location is only used to show nearby results.
              </>
            )}
          </p>

          {/* Actions */}
          <div className="space-y-3">
            {status === 'idle' && (
              <>
                <button
                  onClick={requestLocation}
                  className={cn(
                    'w-full py-4 rounded-2xl font-semibold text-white transition-all shadow-lg flex items-center justify-center gap-2.5',
                    modeColor === 'emerald'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
                  )}
                >
                  <MapPin className="w-5 h-5" />
                  Share My Location
                </button>
                <button
                  onClick={onChooseCity}
                  className="w-full py-4 rounded-2xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-white/5 transition-colors flex items-center justify-center gap-2.5"
                >
                  <Building2 className="w-5 h-5" />
                  Choose a City Instead
                </button>
              </>
            )}

            {status === 'requesting' && (
              <div className="text-sm text-slate-500">
                If prompted, please allow location access in your browser.
              </div>
            )}

            {(status === 'denied' || status === 'error') && (
              <>
                <button
                  onClick={() => {
                    setStatus('idle')
                    setErrorMessage(null)
                  }}
                  className={cn(
                    'w-full py-4 rounded-2xl font-semibold text-white transition-all shadow-lg flex items-center justify-center gap-2.5',
                    modeColor === 'emerald'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20'
                  )}
                >
                  <RefreshCw className="w-5 h-5" />
                  Try Again
                </button>
                <button
                  onClick={onChooseCity}
                  className="w-full py-4 rounded-2xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-white/5 transition-colors flex items-center justify-center gap-2.5"
                >
                  <Building2 className="w-5 h-5" />
                  Choose a City Instead
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="px-8 pb-6 text-center">
          <p className="text-xs text-slate-600">
            Your location is never stored or shared with third parties.
          </p>
        </div>
      </div>
    </div>
  )
}

export default GeolocationModal
