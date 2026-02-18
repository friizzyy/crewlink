'use client'

import Link from 'next/link'
import { Users, ArrowUpRight } from 'lucide-react'
import { useScrollReveal, getRevealClasses } from '@/hooks/useScrollReveal'

// ============================================
// MARKETING FOOTER - Universal footer for all marketing pages
// Extracted from home page for consistency
// ============================================

const footerLinks = {
  product: [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Cities', href: '/cities' },
    { label: 'Categories', href: '/categories' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  resources: [
    { label: 'Safety', href: '/safety' },
    { label: 'Help Center', href: '/help' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
}

const socialLinks = [
  {
    label: 'Twitter',
    href: 'https://twitter.com/crewlink',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/crewlink',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/crewlink',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
]

// Footer link with hover animation
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors duration-200"
      >
        <span className="relative">
          {children}
          {/* Underline animation */}
          <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-cyan-400 transition-all duration-300 group-hover:w-full" />
        </span>
      </Link>
    </li>
  )
}

export function MarketingFooter() {
  const { ref: footerRef, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.05 })

  return (
    <footer
      ref={footerRef}
      className="border-t border-cyan-500/10 bg-slate-950/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-10 sm:py-16">
          {/* Brand Section */}
          <div className={`mb-8 sm:mb-10 ${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '0ms' }}>
            <Link href="/" className="flex items-center gap-3 mb-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="font-display text-xl font-bold text-white">CrewLink</span>
            </Link>
            <p className="text-sm text-slate-400 mb-4 max-w-xs">
              The smartest way to hire local help or find flexible work.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-11 h-11 rounded-lg bg-slate-800 hover:bg-cyan-500/20 active:bg-cyan-500/30 flex items-center justify-center text-slate-400 hover:text-cyan-400 active:text-cyan-400 transition-all duration-200 hover:scale-105"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid - 3 columns on mobile, 3 on desktop */}
          <div className="grid grid-cols-3 gap-6 sm:gap-10">
            {/* Product Column */}
            <div className={`${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '80ms' }}>
              <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4">Product</h4>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.product.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className={`${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '160ms' }}>
              <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4">Company</h4>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.company.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>

            {/* Resources Column */}
            <div className={`${getRevealClasses(isVisible, 'up')}`} style={{ transitionDelay: '240ms' }}>
              <h4 className="text-xs sm:text-sm font-semibold text-white mb-3 sm:mb-4">Resources</h4>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.resources.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="py-6 border-t border-cyan-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} CrewLink. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default MarketingFooter
