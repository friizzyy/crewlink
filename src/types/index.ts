// ============================================
// USER TYPES
// ============================================

export type UserRole = 'hirer' | 'worker'

export interface User {
  id: string
  phone: string
  email?: string | null
  name?: string | null
  avatarUrl?: string | null
  role: UserRole  // Primary role that controls UI/route access
  createdAt: Date
  updatedAt: Date
  workerProfile?: WorkerProfile | null
  hirerProfile?: HirerProfile | null
}

export interface WorkerProfile {
  id: string
  userId: string
  headline?: string | null
  bio?: string | null
  hourlyRate?: number | null
  skills: string[] // Parsed from JSON
  isVerified: boolean
  verificationStatus: VerificationStatus
  idDocumentUrl?: string | null
  backgroundCheckStatus: BackgroundCheckStatus
  serviceRadius: number
  baseLat?: number | null
  baseLng?: number | null
  baseAddress?: string | null
  completedJobs: number
  totalEarnings: number
  averageRating: number
  responseRate: number
  isActive: boolean
  instantBook: boolean
  createdAt: Date
  updatedAt: Date
  availability?: AvailabilityWindow[]
  user?: User
}

export interface HirerProfile {
  id: string
  userId: string
  companyName?: string | null
  bio?: string | null
  defaultLat?: number | null
  defaultLng?: number | null
  defaultAddress?: string | null
  totalJobsPosted: number
  totalSpent: number
  averageRating: number
  isVerified: boolean
  paymentVerified: boolean
  createdAt: Date
  updatedAt: Date
  user?: User
}

// ============================================
// AVAILABILITY TYPES
// ============================================

export interface AvailabilityWindow {
  id: string
  workerProfileId: string
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:MM
  endTime: string // HH:MM
  isAvailable: boolean
}

// ============================================
// JOB TYPES
// ============================================

export interface Job {
  id: string
  posterId: string
  poster?: User
  title: string
  description: string
  category: string
  skills: string[] // Parsed from JSON
  scopeRaw?: string | null
  scopeCleaned?: string | null
  lat: number
  lng: number
  address: string
  isRemote: boolean
  scheduleType: ScheduleType
  startDate?: Date | null
  endDate?: Date | null
  estimatedHours?: number | null
  budgetType: BudgetType
  budgetMin?: number | null
  budgetMax?: number | null
  status: JobStatus
  viewCount: number
  bidCount: number
  createdAt: Date
  updatedAt: Date
  bids?: Bid[]
  bookings?: Booking[]
  distance?: number // Computed field for distance from user
}

export interface JobFilters {
  category?: string
  skills?: string[]
  budgetMin?: number
  budgetMax?: number
  scheduleType?: ScheduleType
  isRemote?: boolean
  radius?: number
  lat?: number
  lng?: number
  sortBy?: 'distance' | 'recent' | 'budget' | 'bids'
  status?: JobStatus
}

// ============================================
// BID TYPES
// ============================================

export interface Bid {
  id: string
  jobId: string
  job?: Job
  workerId: string
  worker?: User
  amount: number
  message?: string | null
  estimatedHours?: number | null
  status: BidStatus
  createdAt: Date
  updatedAt: Date
}

// ============================================
// BOOKING TYPES
// ============================================

export interface Booking {
  id: string
  jobId: string
  job?: Job
  hirerId: string
  hirer?: User
  workerId: string
  worker?: User
  scheduledStart: Date
  scheduledEnd?: Date | null
  actualStart?: Date | null
  actualEnd?: Date | null
  agreedAmount: number
  finalAmount?: number | null
  paymentStatus: PaymentStatus
  status: BookingStatus
  completedAt?: Date | null
  cancelledAt?: Date | null
  cancelReason?: string | null
  createdAt: Date
  updatedAt: Date
  payments?: PaymentRecord[]
  reviews?: Review[]
}

// ============================================
// REVIEW TYPES
// ============================================

export interface Review {
  id: string
  bookingId: string
  booking?: Booking
  authorId: string
  author?: User
  subjectId: string
  subject?: User
  rating: number // 1-5
  title?: string | null
  content?: string | null
  communicationRating?: number | null
  qualityRating?: number | null
  timelinessRating?: number | null
  valueRating?: number | null
  isPublic: boolean
  response?: string | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// MESSAGING TYPES
// ============================================

export interface MessageThread {
  id: string
  jobId?: string | null
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
  participants?: ThreadParticipant[]
  messages?: Message[]
  // Computed
  otherParticipant?: User
  unreadCount?: number
  lastMessage?: Message
}

export interface ThreadParticipant {
  id: string
  threadId: string
  userId: string
  user?: User
  lastReadAt?: Date | null
  isMuted: boolean
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  sender?: User
  content: string
  messageType: MessageType
  metadata?: Record<string, any> | null
  isEdited: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

// ============================================
// PAYMENT TYPES
// ============================================

export interface PaymentRecord {
  id: string
  bookingId: string
  userId: string
  amount: number
  type: PaymentType
  status: PaymentRecordStatus
  externalId?: string | null
  provider?: string | null
  description?: string | null
  metadata?: Record<string, any> | null
  processedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, any> | null
  isRead: boolean
  readAt?: Date | null
  createdAt: Date
}

// ============================================
// REFERENCE TYPES
// ============================================

export interface Skill {
  id: string
  name: string
  category: string
  iconName?: string | null
  isActive: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  iconName?: string | null
  description?: string | null
  isActive: boolean
  sortOrder: number
}

// ============================================
// ENUMS
// ============================================

export type VerificationStatus = 'pending' | 'submitted' | 'approved' | 'rejected'
export type BackgroundCheckStatus = 'none' | 'pending' | 'passed' | 'failed'
export type JobStatus = 'draft' | 'posted' | 'in_progress' | 'completed' | 'cancelled'
export type ScheduleType = 'flexible' | 'specific' | 'asap'
export type BudgetType = 'hourly' | 'fixed' | 'bidding'
export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type BookingStatus = 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
export type PaymentStatus = 'pending' | 'held' | 'released' | 'refunded'
export type PaymentType = 'charge' | 'payout' | 'refund' | 'fee'
export type PaymentRecordStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type MessageType = 'text' | 'image' | 'system' | 'offer'
export type NotificationType = 
  | 'new_bid'
  | 'bid_accepted'
  | 'bid_rejected'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'message'
  | 'review_received'
  | 'payment_received'
  | 'payment_sent'
  | 'job_completed'

// ============================================
// APP MODE
// ============================================

export type AppMode = 'hire' | 'work'

// ============================================
// MAP TYPES
// ============================================

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface MapCenter {
  lat: number
  lng: number
}

export interface MapPin {
  id: string
  lat: number
  lng: number
  type: 'job' | 'worker' | 'user'
  data?: Job | WorkerProfile
}

// ============================================
// FORM TYPES
// ============================================

export interface JobFormData {
  title: string
  description: string
  category: string
  skills: string[]
  address: string
  lat: number
  lng: number
  isRemote: boolean
  scheduleType: ScheduleType
  startDate?: string
  endDate?: string
  estimatedHours?: number
  budgetType: BudgetType
  budgetMin?: number
  budgetMax?: number
}

export interface WorkerOnboardingData {
  headline: string
  bio: string
  skills: string[]
  hourlyRate: number
  serviceRadius: number
  baseAddress: string
  baseLat: number
  baseLng: number
  availability: Partial<AvailabilityWindow>[]
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ============================================
// AI TYPES
// ============================================

export interface AICleanedScope {
  title: string
  description: string
  tasks: string[]
  estimatedHours: number
  suggestedBudget: { min: number; max: number }
  requiredSkills: string[]
  safetyNotes?: string[]
}

export interface AISmartQuestion {
  question: string
  options?: string[]
  required: boolean
  field: keyof JobFormData
}
