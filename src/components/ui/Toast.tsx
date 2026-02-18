'use client'

import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

export function Toaster() {
  const { toasts, removeToast } = useUIStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 sm:max-w-sm pb-safe-area">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
          index={index}
        />
      ))}
    </div>
  )
}

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  onClose: () => void
  index?: number
}

function Toast({ type, message, onClose, index = 0 }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />,
  }

  const backgrounds = {
    success: 'bg-slate-900/95 border-emerald-500/30',
    error: 'bg-slate-900/95 border-red-500/30',
    info: 'bg-slate-900/95 border-cyan-500/30',
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-xl shadow-black/20 backdrop-blur-xl animate-slide-up',
        backgrounds[type]
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'backwards',
      }}
    >
      {icons[type]}
      <p className="flex-1 text-sm text-slate-200">{message}</p>
      <button
        onClick={onClose}
        className="text-slate-500 hover:text-white active:text-white transition-colors p-2 -m-1 touch-target shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Hook for using toast
export function useToast() {
  const { addToast } = useUIStore()

  return {
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
  }
}

export default Toaster
