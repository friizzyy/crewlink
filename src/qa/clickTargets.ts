/**
 * CrewLink Click Targets Registry
 *
 * This file defines all critical interactive elements that must be tested.
 * The QA Sentinel agent reads this registry to run deterministic checks.
 *
 * IMPORTANT: When adding new interactive elements, add them here with
 * the appropriate data-qa attribute and expected outcome.
 *
 * NOTE: The app uses role-based routing:
 * - /hiring/* for HIRERs (cyan theme)
 * - /work/* for WORKERs (emerald theme)
 * - /select-role for role selection
 */

// ============================================
// OUTCOME TYPES
// ============================================

export type ClickOutcome =
  | { type: 'route'; path: string; exact?: boolean }
  | { type: 'modal'; modalId: string }
  | { type: 'popover'; popoverId: string }
  | { type: 'dropdown'; dropdownId: string }
  | { type: 'toast'; toastType?: 'success' | 'error' | 'info' }
  | { type: 'action'; description: string }
  | { type: 'external'; url: string }

export interface ClickTarget {
  /** The data-qa attribute value */
  selector: string
  /** Human-readable name for reports */
  name: string
  /** Category for grouping in reports */
  category: 'navigation' | 'cta' | 'form' | 'settings' | 'social' | 'modal'
  /** Expected outcome when clicked */
  outcome: ClickOutcome
  /** Routes where this element should be visible */
  visibleOn: string[] | 'all'
  /** Whether this is a critical user flow element */
  critical: boolean
  /** Mobile-only element */
  mobileOnly?: boolean
  /** Desktop-only element */
  desktopOnly?: boolean
  /** Role-specific element */
  roleSpecific?: 'HIRER' | 'WORKER'
}

// ============================================
// ROLE SELECTION TARGETS
// ============================================

export const roleSelectionTargets: ClickTarget[] = [
  {
    selector: 'role-select-hirer',
    name: 'Select Hirer Role',
    category: 'cta',
    outcome: { type: 'route', path: '/hiring/map' },
    visibleOn: ['/select-role'],
    critical: true,
  },
  {
    selector: 'role-select-worker',
    name: 'Select Worker Role',
    category: 'cta',
    outcome: { type: 'route', path: '/work/map' },
    visibleOn: ['/select-role'],
    critical: true,
  },
]

// ============================================
// HIRER NAVIGATION TARGETS (/hiring/*)
// ============================================

export const hirerNavigationTargets: ClickTarget[] = [
  // Logo - navigates to hiring map
  {
    selector: 'nav-logo',
    name: 'Logo (Hiring Home)',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/map' },
    visibleOn: ['/hiring'],
    critical: true,
    roleSpecific: 'HIRER',
  },

  // Desktop Navigation - Hirer Mode
  {
    selector: 'nav-find-workers',
    name: 'Find Workers Nav Item',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/map' },
    visibleOn: ['/hiring'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'HIRER',
  },
  {
    selector: 'nav-post-job',
    name: 'Post Job Nav Item',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/post' },
    visibleOn: ['/hiring'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'HIRER',
  },
  {
    selector: 'nav-my-jobs',
    name: 'My Jobs Nav Item',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/jobs' },
    visibleOn: ['/hiring'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'HIRER',
  },
  {
    selector: 'nav-messages',
    name: 'Messages Nav Item',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/messages' },
    visibleOn: ['/hiring'],
    critical: true,
    roleSpecific: 'HIRER',
  },

  // Notifications
  {
    selector: 'nav-notifications',
    name: 'Notifications Button',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/notifications' },
    visibleOn: ['/hiring'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'HIRER',
  },

  // User Menu
  {
    selector: 'nav-user-menu',
    name: 'User Menu Button',
    category: 'navigation',
    outcome: { type: 'dropdown', dropdownId: 'user-dropdown' },
    visibleOn: ['/hiring'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'HIRER',
  },
  {
    selector: 'user-menu-profile',
    name: 'My Profile Link',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/profile' },
    visibleOn: ['/hiring'],
    critical: true,
    roleSpecific: 'HIRER',
  },
  {
    selector: 'user-menu-settings',
    name: 'Settings Link',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/settings' },
    visibleOn: ['/hiring'],
    critical: true,
    roleSpecific: 'HIRER',
  },
  {
    selector: 'user-menu-switch-role',
    name: 'Switch to Worker Mode',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/map' },
    visibleOn: ['/hiring'],
    critical: true,
    roleSpecific: 'HIRER',
  },
]

// ============================================
// WORKER NAVIGATION TARGETS (/work/*)
// ============================================

export const workerNavigationTargets: ClickTarget[] = [
  // Logo - navigates to work map
  {
    selector: 'nav-logo',
    name: 'Logo (Work Home)',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/map' },
    visibleOn: ['/work'],
    critical: true,
    roleSpecific: 'WORKER',
  },

  // Desktop Navigation - Worker Mode
  {
    selector: 'nav-find-jobs',
    name: 'Find Jobs Nav Item',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/map' },
    visibleOn: ['/work'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'nav-browse',
    name: 'Browse Nav Item',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/jobs' },
    visibleOn: ['/work'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'nav-my-profile',
    name: 'My Profile Nav Item',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/profile' },
    visibleOn: ['/work'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'nav-messages',
    name: 'Messages Nav Item',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/messages' },
    visibleOn: ['/work'],
    critical: true,
    roleSpecific: 'WORKER',
  },

  // Earnings Badge
  {
    selector: 'nav-earnings',
    name: 'Earnings Badge',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/earnings' },
    visibleOn: ['/work'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'WORKER',
  },

  // Notifications
  {
    selector: 'nav-notifications',
    name: 'Notifications Button',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/notifications' },
    visibleOn: ['/work'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'WORKER',
  },

  // User Menu
  {
    selector: 'nav-user-menu',
    name: 'User Menu Button',
    category: 'navigation',
    outcome: { type: 'dropdown', dropdownId: 'user-dropdown' },
    visibleOn: ['/work'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'user-menu-profile',
    name: 'My Profile Link',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/profile' },
    visibleOn: ['/work'],
    critical: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'user-menu-settings',
    name: 'Settings Link',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/settings' },
    visibleOn: ['/work'],
    critical: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'user-menu-switch-role',
    name: 'Switch to Hiring Mode',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/map' },
    visibleOn: ['/work'],
    critical: true,
    roleSpecific: 'WORKER',
  },
]

// ============================================
// CTA TARGETS
// ============================================

export const ctaTargets: ClickTarget[] = [
  // Post Job (Hirer Mode)
  {
    selector: 'cta-post-job',
    name: 'Post Job Button',
    category: 'cta',
    outcome: { type: 'route', path: '/hiring/post' },
    visibleOn: ['/hiring/map', '/hiring/jobs'],
    critical: true,
    roleSpecific: 'HIRER',
  },

  // Apply for Job (Worker Mode)
  {
    selector: 'cta-apply-job',
    name: 'Apply for Job Button',
    category: 'cta',
    outcome: { type: 'action', description: 'Opens bid submission form' },
    visibleOn: ['/work/job', '/work/map'],
    critical: true,
    roleSpecific: 'WORKER',
  },

  // Landing Page CTAs
  {
    selector: 'cta-get-started',
    name: 'Get Started Button',
    category: 'cta',
    outcome: { type: 'route', path: '/select-role' },
    visibleOn: ['/', '/landing-a', '/landing-b', '/landing-c'],
    critical: true,
  },
  {
    selector: 'cta-sign-in',
    name: 'Sign In Button',
    category: 'cta',
    outcome: { type: 'route', path: '/sign-in' },
    visibleOn: ['/', '/landing-a', '/landing-b', '/landing-c'],
    critical: true,
  },

  // Hero CTAs
  {
    selector: 'cta-find-work',
    name: 'Find Work CTA',
    category: 'cta',
    outcome: { type: 'route', path: '/select-role' },
    visibleOn: ['/'],
    critical: true,
  },
  {
    selector: 'cta-hire-help',
    name: 'Hire Help CTA',
    category: 'cta',
    outcome: { type: 'route', path: '/select-role' },
    visibleOn: ['/'],
    critical: true,
  },
]

// ============================================
// MARKETING NAVIGATION TARGETS
// ============================================

export const marketingNavTargets: ClickTarget[] = [
  {
    selector: 'nav-how-it-works',
    name: 'How It Works',
    category: 'navigation',
    outcome: { type: 'route', path: '/how-it-works' },
    visibleOn: ['/', '/how-it-works', '/safety', '/pricing', '/cities'],
    critical: false,
    desktopOnly: true,
  },
  {
    selector: 'nav-safety',
    name: 'Safety',
    category: 'navigation',
    outcome: { type: 'route', path: '/safety' },
    visibleOn: ['/', '/how-it-works', '/safety', '/pricing', '/cities'],
    critical: false,
    desktopOnly: true,
  },
  {
    selector: 'nav-pricing',
    name: 'Pricing',
    category: 'navigation',
    outcome: { type: 'route', path: '/pricing' },
    visibleOn: ['/', '/how-it-works', '/safety', '/pricing', '/cities'],
    critical: false,
    desktopOnly: true,
  },
  {
    selector: 'nav-cities',
    name: 'Cities',
    category: 'navigation',
    outcome: { type: 'route', path: '/cities' },
    visibleOn: ['/', '/how-it-works', '/safety', '/pricing', '/cities'],
    critical: false,
    desktopOnly: true,
  },
]

// ============================================
// SETTINGS TARGETS
// ============================================

export const settingsTargets: ClickTarget[] = [
  // Hirer Settings
  {
    selector: 'settings-payment',
    name: 'Payment Methods',
    category: 'settings',
    outcome: { type: 'action', description: 'Opens payment methods section' },
    visibleOn: ['/hiring/settings'],
    critical: true,
    roleSpecific: 'HIRER',
  },
  // Worker Settings
  {
    selector: 'settings-payout',
    name: 'Payout Settings',
    category: 'settings',
    outcome: { type: 'action', description: 'Opens payout settings section' },
    visibleOn: ['/work/settings'],
    critical: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'settings-availability',
    name: 'Availability Toggle',
    category: 'settings',
    outcome: { type: 'action', description: 'Toggles availability status' },
    visibleOn: ['/work/settings'],
    critical: true,
    roleSpecific: 'WORKER',
  },
]

// ============================================
// MOBILE NAVIGATION TARGETS
// ============================================

export const mobileNavTargets: ClickTarget[] = [
  // Hirer Mobile Nav
  {
    selector: 'mobile-nav-map',
    name: 'Mobile Map Link (Hirer)',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/map' },
    visibleOn: ['/hiring'],
    critical: true,
    mobileOnly: true,
    roleSpecific: 'HIRER',
  },
  {
    selector: 'mobile-nav-jobs',
    name: 'Mobile Jobs Link (Hirer)',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/jobs' },
    visibleOn: ['/hiring'],
    critical: true,
    mobileOnly: true,
    roleSpecific: 'HIRER',
  },
  {
    selector: 'mobile-nav-messages',
    name: 'Mobile Messages Link (Hirer)',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/messages' },
    visibleOn: ['/hiring'],
    critical: true,
    mobileOnly: true,
    roleSpecific: 'HIRER',
  },
  {
    selector: 'mobile-nav-profile',
    name: 'Mobile Profile Link (Hirer)',
    category: 'navigation',
    outcome: { type: 'route', path: '/hiring/profile' },
    visibleOn: ['/hiring'],
    critical: true,
    mobileOnly: true,
    roleSpecific: 'HIRER',
  },

  // Worker Mobile Nav
  {
    selector: 'mobile-nav-map',
    name: 'Mobile Map Link (Worker)',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/map' },
    visibleOn: ['/work'],
    critical: true,
    mobileOnly: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'mobile-nav-jobs',
    name: 'Mobile Jobs Link (Worker)',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/jobs' },
    visibleOn: ['/work'],
    critical: true,
    mobileOnly: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'mobile-nav-messages',
    name: 'Mobile Messages Link (Worker)',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/messages' },
    visibleOn: ['/work'],
    critical: true,
    mobileOnly: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'mobile-nav-profile',
    name: 'Mobile Profile Link (Worker)',
    category: 'navigation',
    outcome: { type: 'route', path: '/work/profile' },
    visibleOn: ['/work'],
    critical: true,
    mobileOnly: true,
    roleSpecific: 'WORKER',
  },
]

// ============================================
// MAP PAGE TARGETS
// ============================================

export const mapTargets: ClickTarget[] = [
  // Hirer Map
  {
    selector: 'map-recenter',
    name: 'Recenter Button',
    category: 'cta',
    outcome: { type: 'action', description: 'Recenters map to user location' },
    visibleOn: ['/hiring/map', '/work/map'],
    critical: false,
  },
  {
    selector: 'map-worker-card',
    name: 'Worker Card in Sidebar (Hirer)',
    category: 'cta',
    outcome: { type: 'action', description: 'Opens worker detail panel' },
    visibleOn: ['/hiring/map'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'HIRER',
  },
  {
    selector: 'worker-panel-invite',
    name: 'Invite to Job Button',
    category: 'cta',
    outcome: { type: 'action', description: 'Opens job selection modal' },
    visibleOn: ['/hiring/map'],
    critical: true,
    roleSpecific: 'HIRER',
  },
  {
    selector: 'worker-panel-message',
    name: 'Message Worker Button',
    category: 'cta',
    outcome: { type: 'route', path: '/hiring/messages' },
    visibleOn: ['/hiring/map'],
    critical: true,
    roleSpecific: 'HIRER',
  },

  // Worker Map
  {
    selector: 'map-job-card',
    name: 'Job Card in Sidebar (Worker)',
    category: 'cta',
    outcome: { type: 'action', description: 'Opens job detail panel' },
    visibleOn: ['/work/map'],
    critical: true,
    desktopOnly: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'job-panel-apply',
    name: 'Apply to Job Button',
    category: 'cta',
    outcome: { type: 'action', description: 'Opens bid submission form' },
    visibleOn: ['/work/map'],
    critical: true,
    roleSpecific: 'WORKER',
  },
  {
    selector: 'job-panel-message',
    name: 'Message Hirer Button',
    category: 'cta',
    outcome: { type: 'route', path: '/work/messages' },
    visibleOn: ['/work/map'],
    critical: true,
    roleSpecific: 'WORKER',
  },
]

// ============================================
// WRONG SIDE PAGE TARGETS
// ============================================

export const wrongSideTargets: ClickTarget[] = [
  {
    selector: 'wrong-side-go-back',
    name: 'Go to Correct Dashboard',
    category: 'cta',
    outcome: { type: 'action', description: 'Navigates to user role dashboard' },
    visibleOn: ['/wrong-side'],
    critical: true,
  },
  {
    selector: 'wrong-side-switch',
    name: 'Switch Role',
    category: 'cta',
    outcome: { type: 'action', description: 'Switches user role and navigates' },
    visibleOn: ['/wrong-side'],
    critical: true,
  },
]

// ============================================
// COMBINED REGISTRY
// ============================================

export const allClickTargets: ClickTarget[] = [
  ...roleSelectionTargets,
  ...hirerNavigationTargets,
  ...workerNavigationTargets,
  ...ctaTargets,
  ...marketingNavTargets,
  ...settingsTargets,
  ...mobileNavTargets,
  ...mapTargets,
  ...wrongSideTargets,
]

// ============================================
// CRITICAL ROUTES
// ============================================

export const criticalRoutes = [
  // Marketing
  '/',
  '/how-it-works',
  '/safety',
  '/pricing',
  '/cities',
  '/sign-in',
  '/create-account',
  '/help',

  // Role Selection
  '/select-role',
  '/wrong-side',

  // Hirer Routes
  '/hiring',
  '/hiring/map',
  '/hiring/post',
  '/hiring/jobs',
  '/hiring/messages',
  '/hiring/notifications',
  '/hiring/profile',
  '/hiring/settings',

  // Worker Routes
  '/work',
  '/work/map',
  '/work/jobs',
  '/work/messages',
  '/work/notifications',
  '/work/profile',
  '/work/earnings',
  '/work/settings',
] as const

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all targets that should be visible on a given route
 */
export function getTargetsForRoute(route: string): ClickTarget[] {
  return allClickTargets.filter((target) => {
    if (target.visibleOn === 'all') return true
    return target.visibleOn.some((r) => route.startsWith(r))
  })
}

/**
 * Get all targets for a specific role
 */
export function getTargetsForRole(role: 'HIRER' | 'WORKER'): ClickTarget[] {
  return allClickTargets.filter((target) => {
    return !target.roleSpecific || target.roleSpecific === role
  })
}

/**
 * Get all critical targets
 */
export function getCriticalTargets(): ClickTarget[] {
  return allClickTargets.filter((target) => target.critical)
}

/**
 * Get targets by category
 */
export function getTargetsByCategory(category: ClickTarget['category']): ClickTarget[] {
  return allClickTargets.filter((target) => target.category === category)
}

/**
 * Build a data-qa selector string
 */
export function buildSelector(qaValue: string): string {
  return `[data-qa="${qaValue}"]`
}

export default {
  allClickTargets,
  criticalRoutes,
  getTargetsForRoute,
  getTargetsForRole,
  getCriticalTargets,
  getTargetsByCategory,
  buildSelector,
}
