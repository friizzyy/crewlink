// ============================================
// CANONICAL CATEGORIES CONFIG
// Single source of truth for all category data
// ============================================

export interface Category {
  slug: string
  label: string
  icon: string
  description: string
  avgPay: string
  jobs: string
  popular?: boolean
}

// All available job categories
export const CATEGORIES: Category[] = [
  {
    slug: 'cleaning',
    label: 'Cleaning',
    icon: '🧹',
    description: 'Home cleaning, deep cleaning, move-out cleaning, office cleaning',
    avgPay: '$25-45/hr',
    jobs: '1.2K active jobs',
    popular: true,
  },
  {
    slug: 'moving',
    label: 'Moving',
    icon: '📦',
    description: 'Moving help, heavy lifting, packing, loading and unloading',
    avgPay: '$30-50/hr',
    jobs: '890 active jobs',
  },
  {
    slug: 'handyman',
    label: 'Handyman',
    icon: '🔧',
    description: 'Repairs, installations, mounting, minor fixes around the house',
    avgPay: '$35-60/hr',
    jobs: '1.5K active jobs',
    popular: true,
  },
  {
    slug: 'yard-work',
    label: 'Yard Work',
    icon: '🌱',
    description: 'Lawn care, gardening, landscaping, leaf removal, trimming',
    avgPay: '$20-40/hr',
    jobs: '720 active jobs',
  },
  {
    slug: 'assembly',
    label: 'Assembly',
    icon: '🪑',
    description: 'Furniture assembly, IKEA assembly, equipment setup',
    avgPay: '$25-45/hr',
    jobs: '430 active jobs',
  },
  {
    slug: 'events',
    label: 'Events',
    icon: '🎉',
    description: 'Event setup, party help, catering assistance, bartending',
    avgPay: '$20-35/hr',
    jobs: '280 active jobs',
  },
  {
    slug: 'delivery',
    label: 'Delivery',
    icon: '🚚',
    description: 'Local deliveries, pickup, drop-off, courier services',
    avgPay: '$18-30/hr',
    jobs: '560 active jobs',
  },
  {
    slug: 'pet-care',
    label: 'Pet Care',
    icon: '🐕',
    description: 'Dog walking, pet sitting, pet transportation, grooming help',
    avgPay: '$15-30/hr',
    jobs: '340 active jobs',
  },
  {
    slug: 'errands',
    label: 'Errands',
    icon: '🏃',
    description: 'Grocery shopping, returns, waiting in line, general errands',
    avgPay: '$18-28/hr',
    jobs: '450 active jobs',
  },
  {
    slug: 'painting',
    label: 'Painting',
    icon: '🎨',
    description: 'Interior painting, exterior painting, touch-ups, prep work',
    avgPay: '$25-45/hr',
    jobs: '320 active jobs',
  },
  {
    slug: 'electrical',
    label: 'Electrical',
    icon: '⚡',
    description: 'Light fixture installation, outlet work, basic electrical',
    avgPay: '$40-70/hr',
    jobs: '180 active jobs',
  },
  {
    slug: 'plumbing',
    label: 'Plumbing',
    icon: '🔩',
    description: 'Minor plumbing, fixture installation, leak fixes',
    avgPay: '$45-75/hr',
    jobs: '210 active jobs',
  },
]

// Category slugs for validation
export const CATEGORY_SLUGS = CATEGORIES.map(c => c.slug)

// All category option for dropdowns
export const ALL_CATEGORY = {
  slug: 'all',
  label: 'All',
  icon: '📋',
}

// Get category by slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(c => c.slug === slug)
}

// Get category icon by slug
export function getCategoryIcon(slug: string): string {
  if (slug === 'all') return ALL_CATEGORY.icon
  return getCategoryBySlug(slug)?.icon || '📋'
}

// Get category label by slug
export function getCategoryLabel(slug: string): string {
  if (slug === 'all') return ALL_CATEGORY.label
  return getCategoryBySlug(slug)?.label || slug
}

// Validate category slug
export function isValidCategorySlug(slug: string | null): boolean {
  if (!slug) return false
  if (slug === 'all') return true
  return CATEGORY_SLUGS.includes(slug)
}

// Normalize category slug (handle legacy/variant names)
// Maps legacy names like 'yard' to canonical 'yard-work'
export function normalizeCategorySlug(slug: string | null): string {
  if (!slug) return 'all'

  // Lowercase and trim
  const normalized = slug.toLowerCase().trim()

  // Direct match
  if (isValidCategorySlug(normalized)) return normalized

  // Legacy mappings (for backwards compatibility)
  const legacyMappings: Record<string, string> = {
    'yard': 'yard-work',
    'yardwork': 'yard-work',
    'petcare': 'pet-care',
    'pet': 'pet-care',
  }

  if (legacyMappings[normalized]) {
    return legacyMappings[normalized]
  }

  // No match, return 'all'
  return 'all'
}

// Format for dropdown options (includes 'all')
export function getCategoryDropdownOptions() {
  return [
    { id: ALL_CATEGORY.slug, label: ALL_CATEGORY.label, icon: ALL_CATEGORY.icon },
    ...CATEGORIES.map(c => ({
      id: c.slug,
      label: c.label,
      icon: c.icon,
    })),
  ]
}

// ============================================
// CATEGORY STORAGE HELPERS
// ============================================

const CATEGORY_STORAGE_KEY = 'crewlink:selectedCategory'

// Save category to localStorage
export function saveCategory(slug: string): void {
  if (typeof window === 'undefined') return
  if (slug === 'all') {
    localStorage.removeItem(CATEGORY_STORAGE_KEY)
  } else {
    localStorage.setItem(CATEGORY_STORAGE_KEY, slug)
  }
}

// Get category from localStorage
export function getSavedCategory(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CATEGORY_STORAGE_KEY)
}

// Clear saved category
export function clearSavedCategory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CATEGORY_STORAGE_KEY)
}

// ============================================
// URL HELPERS
// ============================================

// Build URL with category param
export function buildUrlWithCategory(basePath: string, category: string | null, otherParams?: Record<string, string>): string {
  const params = new URLSearchParams()

  // Add category if not 'all'
  if (category && category !== 'all') {
    params.set('category', category)
  }

  // Add other params
  if (otherParams) {
    Object.entries(otherParams).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
  }

  const queryString = params.toString()
  return queryString ? `${basePath}?${queryString}` : basePath
}
