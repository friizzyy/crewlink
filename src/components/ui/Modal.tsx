'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { IconButton } from './Button'

// ============================================
// FOCUS TRAP HOOK
// Traps focus within a container for modals/sheets/drawers
// ============================================
function useFocusTrap(isOpen: boolean, containerRef: React.RefObject<HTMLElement | null>) {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    previousFocusRef.current = document.activeElement as HTMLElement

    const container = containerRef.current
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstFocusable = focusableElements[0]
    const lastFocusable = focusableElements[focusableElements.length - 1]

    // Focus first focusable element
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 50)
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable?.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      // Restore focus on close
      previousFocusRef.current?.focus()
    }
  }, [isOpen, containerRef])
}

// ============================================
// MODAL COMPONENT
// ============================================

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
  closeOnOverlayClick?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useFocusTrap(isOpen, dialogRef)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose()
    }
  }

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
  }

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-xl animate-scale-in overscroll-contain',
          sizes[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {(title || showClose) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
                  {title}
                </h2>
              )}
              {description && (
                <p id="modal-description" className="text-sm text-slate-500 mt-1">
                  {description}
                </p>
              )}
            </div>
            {showClose && (
              <IconButton
                variant="ghost"
                size="icon-sm"
                icon={<X size={18} />}
                aria-label="Close modal"
                onClick={onClose}
                className="shrink-0 -mt-1 -mr-1"
              />
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  )
}

// ============================================
// BOTTOM SHEET COMPONENT
// ============================================

export interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  height?: 'auto' | 'half' | 'full'
  showHandle?: boolean
  showClose?: boolean
  className?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = 'auto',
  showHandle = true,
  showClose = true,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)
  const startY = useRef(0)

  useFocusTrap(isOpen, sheetRef)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true)
    startY.current = clientY
  }, [])

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return
      const delta = clientY - startY.current
      if (delta > 0) {
        setDragY(delta)
      }
    },
    [isDragging]
  )

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    if (dragY > 100) {
      onClose()
    }
    setDragY(0)
  }, [dragY, onClose])

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY)
    }

    const handleMouseUp = () => {
      handleDragEnd()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  const heights = {
    auto: 'max-h-[85vh]',
    half: 'h-[50vh]',
    full: 'h-[85vh]',
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl',
          'animate-slide-up overflow-hidden overscroll-contain',
          'pb-safe-area',
          heights[height],
          className
        )}
        style={{
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease',
        }}
      >
        {showHandle && (
          <div
            className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleDragEnd}
            onMouseDown={handleMouseDown}
          >
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>
        )}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {showClose && (
              <IconButton
                variant="ghost"
                size="icon-sm"
                icon={<X size={18} />}
                aria-label="Close"
                onClick={onClose}
              />
            )}
          </div>
        )}
        <div className="overflow-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

// ============================================
// CONFIRM DIALOG
// ============================================

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        {description && <p className="text-slate-500 mb-6">{description}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            className="btn btn-secondary btn-md flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={cn(
              'btn btn-md flex-1',
              variant === 'danger' ? 'btn-danger' : 'btn-primary'
            )}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ============================================
// DRAWER COMPONENT
// ============================================

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  side?: 'left' | 'right'
  width?: string
  className?: string
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  width = '320px',
  className,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useFocusTrap(isOpen, drawerRef)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        className={cn(
          'absolute top-0 bottom-0 bg-white shadow-xl overflow-auto overscroll-contain',
          'w-[min(320px,calc(100vw-2rem))]',
          side === 'right' ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in-left',
          className
        )}
        style={{ width: `min(${width}, calc(100vw - 2rem))` }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <IconButton
              variant="ghost"
              size="icon-sm"
              icon={<X size={18} />}
              aria-label="Close drawer"
              onClick={onClose}
            />
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  )
}

// ============================================
// TOOLTIP COMPONENT
// ============================================

export interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const showTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsVisible(true)
  }, [])

  const hideTooltip = useCallback(() => {
    timeoutRef.current = setTimeout(() => setIsVisible(false), 150)
  }, [])

  // Touch: show on tap, hide after 2s
  const handleTouch = useCallback(() => {
    setIsVisible(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setIsVisible(false), 2000)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onTouchStart={handleTouch}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg whitespace-nowrap',
            'animate-fade-in pointer-events-none',
            positions[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export default Modal
