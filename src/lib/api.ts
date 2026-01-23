// API client for frontend
const API_BASE = '/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options

  let url = `${API_BASE}${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred')
  }

  return data
}

// ============================================
// Jobs API
// ============================================

export interface Job {
  id: string
  title: string
  description: string
  category: string
  address: string
  city?: string
  lat: number
  lng: number
  isRemote: boolean
  scheduleType: string
  startDate?: string
  endDate?: string
  estimatedHours?: number
  budgetType: string
  budgetMin?: number
  budgetMax?: number
  status: string
  viewCount: number
  bidCount: number
  createdAt: string
  updatedAt: string
  poster: {
    id: string
    name: string
    avatarUrl?: string
    image?: string
    hirerProfile?: {
      companyName?: string
      averageRating?: number
      isVerified?: boolean
    }
  }
}

export interface JobsParams {
  status?: string
  category?: string
  search?: string
  city?: string
  budgetMin?: number
  budgetMax?: number
  mine?: boolean
  limit?: number
  offset?: number
}

export const jobsApi = {
  list: (params?: JobsParams) =>
    fetchApi<Job[]>('/jobs', { params: params as Record<string, string | number | boolean> }),

  get: (id: string) => fetchApi<Job>(`/jobs/${id}`),

  create: (data: Partial<Job>) =>
    fetchApi<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Job>) =>
    fetchApi<Job>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/jobs/${id}`, { method: 'DELETE' }),

  updateStatus: (id: string, status: string) =>
    fetchApi<Job>(`/jobs/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  getBids: (jobId: string) => fetchApi<Bid[]>(`/jobs/${jobId}/bids`),

  submitBid: (jobId: string, data: { amount: number; message?: string; estimatedHours?: number }) =>
    fetchApi<Bid>(`/jobs/${jobId}/bids`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// ============================================
// Bids API
// ============================================

export interface Bid {
  id: string
  jobId: string
  workerId: string
  amount: number
  message?: string
  estimatedHours?: number
  status: string
  createdAt: string
  updatedAt: string
  job?: Job
  worker?: {
    id: string
    name: string
    avatarUrl?: string
    workerProfile?: {
      headline?: string
      averageRating?: number
      completedJobs?: number
      isVerified?: boolean
    }
  }
}

export const bidsApi = {
  list: (params?: { status?: string; limit?: number; offset?: number }) =>
    fetchApi<Bid[]>('/bids', { params: params as Record<string, string | number | boolean> }),

  get: (id: string) => fetchApi<Bid>(`/bids/${id}`),

  accept: (id: string) =>
    fetchApi<{ bidStatus: string; conversationId?: string }>(`/bids/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'accept' }),
    }),

  reject: (id: string) =>
    fetchApi<{ bidStatus: string }>(`/bids/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reject' }),
    }),

  withdraw: (id: string) =>
    fetchApi<{ bidStatus: string }>(`/bids/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'withdraw' }),
    }),
}

// ============================================
// Conversations API
// ============================================

export interface Message {
  id: string
  threadId: string
  senderId: string
  content: string
  messageType: string
  createdAt: string
  sender: {
    id: string
    name: string
    avatarUrl?: string
    image?: string
  }
}

export interface Conversation {
  id: string
  job?: {
    id: string
    title: string
    status: string
  }
  otherUser?: {
    id: string
    name: string
    avatarUrl?: string
    image?: string
  }
  lastMessage?: {
    id: string
    content: string
    senderId: string
    createdAt: string
  }
  lastMessageAt: string
  lastMessagePreview?: string
  unreadCount: number
  isMuted: boolean
}

export const conversationsApi = {
  list: () => fetchApi<Conversation[]>('/conversations'),

  get: (id: string) => fetchApi<Conversation>(`/conversations/${id}`),

  create: (data: { participantId: string; jobId?: string; initialMessage?: string }) =>
    fetchApi<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMessages: (conversationId: string, params?: { limit?: number; before?: string }) =>
    fetchApi<Message[]>(`/conversations/${conversationId}/messages`, {
      params: params as Record<string, string | number | boolean>,
    }),

  sendMessage: (conversationId: string, content: string) =>
    fetchApi<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
}

// ============================================
// Notifications API
// ============================================

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  actionUrl?: string
  isRead: boolean
  readAt?: string
  createdAt: string
}

export const notificationsApi = {
  list: (params?: { limit?: number; offset?: number; unread?: boolean }) =>
    fetchApi<Notification[]>('/notifications', {
      params: params as Record<string, string | number | boolean>,
    }),

  markRead: (ids: string[]) =>
    fetchApi<{ marked: number }>('/notifications', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  markAllRead: () =>
    fetchApi<{ marked: string }>('/notifications', {
      method: 'POST',
      body: JSON.stringify({ markAllRead: true }),
    }),
}

// ============================================
// Profile API
// ============================================

export interface UserProfile {
  id: string
  email: string
  name?: string
  phone?: string
  avatarUrl?: string
  image?: string
  role: string
  workerProfile?: {
    id: string
    headline?: string
    bio?: string
    hourlyRate?: number
    skills: string[]
    isVerified: boolean
    serviceRadius: number
    baseLat?: number
    baseLng?: number
    baseAddress?: string
    completedJobs: number
    totalEarnings: number
    averageRating: number
    responseRate: number
    isActive: boolean
    instantBook: boolean
  }
  hirerProfile?: {
    id: string
    companyName?: string
    bio?: string
    defaultLat?: number
    defaultLng?: number
    defaultAddress?: string
    totalJobsPosted: number
    totalSpent: number
    averageRating: number
    isVerified: boolean
    paymentVerified: boolean
  }
}

export const profileApi = {
  get: () => fetchApi<UserProfile>('/profile'),

  update: (data: {
    name?: string
    phone?: string
    avatarUrl?: string
    workerProfile?: Partial<UserProfile['workerProfile']>
    hirerProfile?: Partial<UserProfile['hirerProfile']>
  }) =>
    fetchApi<UserProfile>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}

// ============================================
// Auth API
// ============================================

export const authApi = {
  register: (data: { email: string; password: string; name: string; role: string }) =>
    fetchApi<{ id: string; email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => fetchApi<UserProfile>('/auth/me'),
}
