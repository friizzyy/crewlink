'use client'

import Link from 'next/link'
import { Users } from 'lucide-react'
import { LiveDot } from '@/components/ui'

// All footer links flattened for compact inline display
const allLinks = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Cities', href: '/cities' },
  { label: 'Categories', href: '/categories' },
  { label: 'About', href: '/about' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
  { label: 'Safety', href: '/safety' },
  { label: 'Help Center', href: '/help' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]

const socialLinks = [
  {
    label: 'Twitter',
    href: 'https://twitter.com/crewlink',
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/crewlink',
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/crewlink',
    icon: (
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
]

export function MarketingFooter() {
  return (
    <footer className="border-t border-cyan-500/10 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop: single row | Mobile: 2 rows */}
        <div className="py-4 sm:py-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 rounded-lg blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <span className="font-display text-sm font-bold text-white">CrewLink</span>
          </Link>

          {/* Center: Inline links (dot-separated) */}
          <nav className="flex flex-wrap items-center gap-x-1 gap-y-1">
            {allLinks.map((link, i) => (
              <span key={link.href} className="inline-flex items-center">
                {i > 0 && <span className="text-slate-600 mx-1.5 text-[8px] select-none">&bull;</span>}
                <Link
                  href={link.href}
                  className="group inline-flex text-xs text-slate-400 hover:text-white transition-colors duration-200"
                >
                  <span className="relative">
                    {link.label}
                    <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              </span>
            ))}
          </nav>

          {/* Right: Social + Status + Copyright */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <LiveDot variant="green" size="sm" pulse />
              All systems operational
            </span>
            <span className="text-slate-700 text-xs select-none">|</span>
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-7 h-7 rounded-md bg-slate-800/80 hover:bg-cyan-500/20 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-all duration-200 hover:scale-105"
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <span className="text-slate-700 text-xs select-none hidden sm:inline">|</span>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              &copy; {new Date().getFullYear()} CrewLink
            </p>
          </div>
        </div>

        {/* Mobile-only copyright row */}
        <p className="text-[11px] text-slate-500 pb-3 sm:hidden">
          &copy; {new Date().getFullYear()} CrewLink. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default MarketingFooter
