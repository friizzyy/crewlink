'use client'

import { UniversalNav } from '@/components/UniversalNav'
import { MarketingFooter } from '@/components/MarketingFooter'

// ============================================
// MARKETING LAYOUT - Universal layout for all marketing pages
// Includes: UniversalNav + children + MarketingFooter
// Does NOT include footer for app pages (/work, /hiring)
// ============================================

interface MarketingLayoutProps {
  children: React.ReactNode
  hideFooter?: boolean
}

export function MarketingLayout({ children, hideFooter = false }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen text-white flex flex-col">
      {/* Universal Navigation - marketing variant */}
      <UniversalNav variant="marketing" />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Universal Footer - only for marketing pages */}
      {!hideFooter && <MarketingFooter />}
    </div>
  )
}

export default MarketingLayout
