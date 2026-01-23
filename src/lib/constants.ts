// ============================================
// APP CONSTANTS
// ============================================

export const APP_NAME = 'CrewLink'
export const APP_DESCRIPTION = 'Find work. Hire help. Get it done.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ============================================
// CATEGORIES
// ============================================

export const JOB_CATEGORIES = [
  { id: 'cleaning', name: 'Cleaning', icon: 'Sparkles', color: '#10b981' },
  { id: 'moving', name: 'Moving & Delivery', icon: 'Truck', color: '#f59e0b' },
  { id: 'handyman', name: 'Handyman', icon: 'Wrench', color: '#3b82f6' },
  { id: 'yard', name: 'Yard & Garden', icon: 'TreeDeciduous', color: '#22c55e' },
  { id: 'assembly', name: 'Assembly & Install', icon: 'Package', color: '#8b5cf6' },
  { id: 'painting', name: 'Painting', icon: 'Paintbrush', color: '#ec4899' },
  { id: 'event', name: 'Event Help', icon: 'PartyPopper', color: '#f43f5e' },
  { id: 'tech', name: 'Tech Support', icon: 'Monitor', color: '#06b6d4' },
  { id: 'petcare', name: 'Pet Care', icon: 'PawPrint', color: '#84cc16' },
  { id: 'errands', name: 'Errands', icon: 'ShoppingBag', color: '#a855f7' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#64748b' },
] as const

export const CATEGORY_MAP = Object.fromEntries(
  JOB_CATEGORIES.map((c) => [c.id, c])
)

// ============================================
// SKILLS
// ============================================

export const SKILLS = [
  // Cleaning
  { id: 'deep-cleaning', name: 'Deep Cleaning', category: 'cleaning' },
  { id: 'window-cleaning', name: 'Window Cleaning', category: 'cleaning' },
  { id: 'carpet-cleaning', name: 'Carpet Cleaning', category: 'cleaning' },
  { id: 'move-out-cleaning', name: 'Move-out Cleaning', category: 'cleaning' },
  
  // Moving
  { id: 'heavy-lifting', name: 'Heavy Lifting', category: 'moving' },
  { id: 'packing', name: 'Packing', category: 'moving' },
  { id: 'furniture-moving', name: 'Furniture Moving', category: 'moving' },
  { id: 'delivery', name: 'Delivery', category: 'moving' },
  
  // Handyman
  { id: 'plumbing', name: 'Basic Plumbing', category: 'handyman' },
  { id: 'electrical', name: 'Minor Electrical', category: 'handyman' },
  { id: 'drywall', name: 'Drywall Repair', category: 'handyman' },
  { id: 'mounting', name: 'TV/Shelf Mounting', category: 'handyman' },
  
  // Yard
  { id: 'lawn-mowing', name: 'Lawn Mowing', category: 'yard' },
  { id: 'weeding', name: 'Weeding', category: 'yard' },
  { id: 'hedge-trimming', name: 'Hedge Trimming', category: 'yard' },
  { id: 'leaf-removal', name: 'Leaf Removal', category: 'yard' },
  
  // Assembly
  { id: 'furniture-assembly', name: 'Furniture Assembly', category: 'assembly' },
  { id: 'ikea-assembly', name: 'IKEA Assembly', category: 'assembly' },
  { id: 'equipment-install', name: 'Equipment Installation', category: 'assembly' },
  
  // Painting
  { id: 'interior-painting', name: 'Interior Painting', category: 'painting' },
  { id: 'exterior-painting', name: 'Exterior Painting', category: 'painting' },
  { id: 'touch-ups', name: 'Touch-ups', category: 'painting' },
  
  // Event
  { id: 'serving', name: 'Serving', category: 'event' },
  { id: 'bartending', name: 'Bartending', category: 'event' },
  { id: 'setup-cleanup', name: 'Setup & Cleanup', category: 'event' },
  
  // Tech
  { id: 'computer-setup', name: 'Computer Setup', category: 'tech' },
  { id: 'smart-home', name: 'Smart Home Setup', category: 'tech' },
  { id: 'wifi-setup', name: 'WiFi Setup', category: 'tech' },
  
  // Pet Care
  { id: 'dog-walking', name: 'Dog Walking', category: 'petcare' },
  { id: 'pet-sitting', name: 'Pet Sitting', category: 'petcare' },
  { id: 'pet-grooming', name: 'Pet Grooming', category: 'petcare' },
  
  // Errands
  { id: 'grocery-shopping', name: 'Grocery Shopping', category: 'errands' },
  { id: 'pickup-dropoff', name: 'Pickup/Dropoff', category: 'errands' },
  { id: 'waiting-in-line', name: 'Waiting in Line', category: 'errands' },
] as const

export const SKILL_MAP = Object.fromEntries(
  SKILLS.map((s) => [s.id, s])
)

// ============================================
// SCHEDULE OPTIONS
// ============================================

export const SCHEDULE_TYPES = [
  { id: 'asap', name: 'As Soon As Possible', description: 'Within 24-48 hours' },
  { id: 'flexible', name: 'Flexible', description: 'Within the next week' },
  { id: 'specific', name: 'Specific Date & Time', description: 'Pick a date' },
] as const

// ============================================
// BUDGET OPTIONS
// ============================================

export const BUDGET_TYPES = [
  { id: 'hourly', name: 'Hourly Rate', description: 'Pay per hour worked' },
  { id: 'fixed', name: 'Fixed Price', description: 'One price for the job' },
  { id: 'bidding', name: 'Request Bids', description: 'Let workers suggest their price' },
] as const

// ============================================
// JOB STATUS
// ============================================

export const JOB_STATUSES = {
  draft: { label: 'Draft', color: 'neutral' },
  posted: { label: 'Posted', color: 'brand' },
  in_progress: { label: 'In Progress', color: 'accent' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
} as const

// ============================================
// BOOKING STATUS
// ============================================

export const BOOKING_STATUSES = {
  confirmed: { label: 'Confirmed', color: 'brand' },
  in_progress: { label: 'In Progress', color: 'accent' },
  completed: { label: 'Completed', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
  disputed: { label: 'Disputed', color: 'warning' },
} as const

// ============================================
// DAYS OF WEEK
// ============================================

export const DAYS_OF_WEEK = [
  { id: 0, name: 'Sunday', short: 'Sun' },
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
] as const

// ============================================
// TIME OPTIONS
// ============================================

export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  const time24 = `${hour.toString().padStart(2, '0')}:${minute}`
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  const ampm = hour < 12 ? 'AM' : 'PM'
  const label = `${hour12}:${minute} ${ampm}`
  return { value: time24, label }
})

// ============================================
// MAP DEFAULTS
// ============================================

export const DEFAULT_MAP_CENTER = { lat: 37.7749, lng: -122.4194 } // San Francisco
export const DEFAULT_MAP_ZOOM = 12
export const MAX_SERVICE_RADIUS = 50 // miles

// ============================================
// PAGINATION
// ============================================

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// ============================================
// VALIDATION
// ============================================

export const VALIDATION = {
  title: { min: 5, max: 100 },
  description: { min: 20, max: 2000 },
  bio: { min: 10, max: 500 },
  headline: { min: 5, max: 100 },
  message: { min: 1, max: 1000 },
  review: { min: 10, max: 500 },
  hourlyRate: { min: 15, max: 500 },
  budget: { min: 10, max: 10000 },
}

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURES = {
  AI_SCOPE_CLEANER: true,
  AI_SMART_QUESTIONS: true,
  AI_SAFETY_ASSISTANT: true,
  INSTANT_BOOK: true,
  BACKGROUND_CHECKS: true,
  PAYMENTS: false, // Stub for MVP
} as const
