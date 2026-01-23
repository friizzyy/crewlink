import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/Toast'
import { AmbientBackground } from '@/components/AmbientBackground'
import { UserRoleProvider } from '@/contexts/UserRoleContext'
import './globals.css'

// ============================================
// UNIVERSAL FONT - SINGLE SOURCE OF TRUTH
// This MUST be Inter to match landing page exactly
// ============================================
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CrewLink | Find Work. Hire Help. Get It Done.',
  description: 'CrewLink is the trusted marketplace for finding local work and hiring reliable help. Post jobs, discover opportunities, and build your crew.',
  keywords: ['jobs', 'gig work', 'local services', 'hire help', 'find work', 'marketplace'],
  openGraph: {
    title: 'CrewLink | Find Work. Hire Help. Get It Done.',
    description: 'The trusted marketplace for finding local work and hiring reliable help.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#020617', // slate-950 for dark theme
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans text-white bg-slate-950 min-h-screen">
        {/* Universal animated background - appears on ALL pages */}
        <AmbientBackground />

        {/* Main content container - sits above background at z-10+ */}
        <UserRoleProvider>
          <div className="relative z-10">
            {children}
          </div>
        </UserRoleProvider>

        <Toaster />
      </body>
    </html>
  )
}
