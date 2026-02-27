'use client'

import { motion } from 'framer-motion'
import { ReactNode, Children } from 'react'
import { cn } from '@/lib/utils'

// ============================================
// STAGGER LIST - Animated list with staggered children
// ============================================

interface StaggerListProps {
  children: ReactNode[]
  delay?: number
  className?: string
}

export function StaggerList({ children, delay = 0.05, className }: StaggerListProps) {
  return (
    <div className={cn(className)}>
      {Children.map(children, (child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * delay,
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}

// ============================================
// FADE IN - Simple fade + slide up wrapper
// ============================================

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeIn({ children, className, delay = 0, duration = 0.4 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
