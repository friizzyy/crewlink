# 02-BACKEND-API.md — CrewLink Backend API Reference

## Overview

CrewLink's backend is built on **Next.js 14+ (App Router)** with **TypeScript**, using **Prisma v5.10** as the ORM for **PostgreSQL (Neon)** and **NextAuth.js v4** for authentication. This document details all API routes, data models, security patterns, and critical data flows.

---

## Architecture Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Next.js | 14+ (App Router) |
| **Language** | TypeScript | Latest |
| **Database** | PostgreSQL | Neon (production) |
| **ORM** | Prisma | v5.10 |
| **Authentication** | NextAuth.js | v4 |
| **Auth Adapter** | PrismaAdapter | Built-in |
| **State Management** | Zustand + React Query | Planned |
| **Payments** | (Not integrated) | — |
| **Email** | (Not integrated) | — |
| **File Storage** | (Not integrated) | — |
| **Error Monitoring** | (Recommend Sentry) | — |
| **Caching** | Next.js built-in | revalidate tags |
| **Rate Limiting** | (Recommend Upstash) | — |

---

## API Route Structure

All API routes live in `app/api/` and follow Next.js naming conventions. Each route exports `GET`, `POST`, `PATCH`, or `DELETE` handlers with full TypeScript support.

### Route Manifest

| Route | Method | Purpose | Auth Required | Role |
|-------|--------|---------|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler (login/logout/callback) | N/A | N/A |
| `/api/auth/register` | POST | User registration | No | N/A |
| `/api/auth/me` | GET | Current user profile | Yes | Any |
| `/api/jobs` | GET | List jobs (with filters) | No | Any |
| `/api/jobs` | POST | Create job | Yes | hirer |
| `/api/jobs/[id]` | GET | Job detail | No | Any |
| `/api/jobs/[id]` | PATCH | Update job | Yes | hirer (owner) |
| `/api/jobs/[id]` | DELETE | Delete job | Yes | hirer (owner) |
| `/api/jobs/[id]/bids` | GET | List bids for job | Yes | hirer (owner) |
| `/api/jobs/[id]/bids` | POST | Submit bid | Yes | worker |
| `/api/jobs/[id]/status` | PATCH | Update job status | Yes | hirer (owner) |
| `/api/bids` | GET | User's bids | Yes | Any |
| `/api/bids/[id]` | PATCH | Accept/reject bid (hirer) or withdraw (worker) | Yes | Either |
| `/api/bids/[id]` | DELETE | Withdraw bid (worker only) | Yes | worker |
| `/api/conversations` | GET | User's conversations | Yes | Any |
| `/api/conversations` | POST | Start conversation | Yes | Any |
| `/api/conversations/[id]` | GET | Conversation detail | Yes | Participant |
| `/api/conversations/[id]/messages` | GET | Messages in thread | Yes | Participant |
| `/api/conversations/[id]/messages` | POST | Send message | Yes | Participant |
| `/api/notifications` | GET | User's notifications | Yes | Any |
| `/api/notifications` | PATCH | Mark notification as read | Yes | Any |
| `/api/profile` | GET | User's profile | Yes | Any |
| `/api/profile` | PATCH | Update profile | Yes | Any |
| `/api/health` | GET | Health check | No | N/A |

---

## Prisma Data Models

### User
Root authentication entity. Every user has exactly one `WorkerProfile` and/or one `HirerProfile`.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?   // Hashed via bcrypt
  phone         String?
  name          String
  role          String    // 'hirer' | 'worker'
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  workerProfile WorkerProfile?
  hirerProfile  HirerProfile?
  jobs          Job[]
  bids          Bid[]
  bookings      Booking[]
  sentMessages  Message[]
  notifications Notification[]
  reviews       Review[]        // Reviews authored
  reviewsReceived Review[]       @relation("ReviewedUser") // Reviews received
  threads       ThreadParticipant[]
}
```

### WorkerProfile
Extended profile for users with role='worker'.

```prisma
model WorkerProfile {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  headline            String?  // e.g., "Plumber with 5 years experience"
  bio                 String?  // Detailed description
  hourlyRate          Int?     // In cents (e.g., 5000 = $50/hr)
  skills              String[] // JSON array: ["plumbing", "tile work"]
  isVerified          Boolean  @default(false)
  verificationStatus  String?  // 'pending' | 'approved' | 'rejected'
  serviceRadius       Int?     // In km
  baseLat             Float?   // Base location latitude
  baseLng             Float?   // Base location longitude
  completedJobs       Int      @default(0)
  totalEarnings       Int      @default(0) // In cents
  averageRating       Float?
  instantBook         Boolean  @default(false) // Auto-accept bids?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### HirerProfile
Extended profile for users with role='hirer'.

```prisma
model HirerProfile {
  id                  String   @id @default(cuid())
  userId              String   @unique
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  companyName         String?
  bio                 String?
  defaultLat          Float?   // Default job location latitude
  defaultLng          Float?   // Default job location longitude
  totalJobsPosted     Int      @default(0)
  totalSpent          Int      @default(0) // In cents
  averageRating       Float?
  paymentVerified     Boolean  @default(false)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### Job
Core work posting entity. Jobs transition through statuses: `open` → `assigned` → `in_progress` → `completed` / `cancelled`.

```prisma
model Job {
  id              String   @id @default(cuid())
  userId          String   // Hirer ID
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title           String
  description     String   // Markdown supported
  category        String   // e.g., "plumbing", "cleaning", "landscaping"
  budget          Int      // In cents
  budgetType      String   // 'fixed' | 'hourly'
  status          String   @default("open") // open|assigned|in_progress|completed|cancelled

  // Location
  lat             Float
  lng             Float
  address         String?
  city            String?

  // Timing
  scheduledDate   DateTime? // When work should happen
  duration        Int?      // In minutes (for hourly jobs)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  bids            Bid[]
  booking         Booking?
  notifications   Notification[]
}
```

### Bid
Worker's proposal to complete a job.

```prisma
model Bid {
  id                  String   @id @default(cuid())
  jobId               String
  job                 Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)

  userId              String   // Worker ID
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  amount              Int      // In cents
  message             String?  // Bid cover letter
  status              String   @default("pending") // pending|accepted|rejected|withdrawn
  estimatedDuration   Int?     // In minutes

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  booking             Booking?
  notifications       Notification[]

  @@unique([jobId, userId]) // One bid per worker per job
}
```

### Booking
Created when hirer accepts a bid. Links worker and hirer via a specific job.

```prisma
model Booking {
  id              String   @id @default(cuid())
  jobId           String   @unique
  job             Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)

  bidId           String
  bid             Bid      @relation(fields: [bidId], references: [id], onDelete: Cascade)

  workerId        String
  worker          User     @relation(fields: [workerId], references: [id], onDelete: Cascade)

  status          String   @default("scheduled") // scheduled|in_progress|completed|cancelled
  startTime       DateTime?
  endTime         DateTime?
  finalAmount     Int?     // In cents; can override bid amount

  hirerRating     Int?     // 1-5
  hirerComment    String?
  workerRating    Int?     // 1-5
  workerComment   String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Review
Ratings and feedback left by users after bookings.

```prisma
model Review {
  id          String   @id @default(cuid())
  jobId       String?

  authorId    String
  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  subjectId   String
  subject     User     @relation("ReviewedUser", fields: [subjectId], references: [id], onDelete: Cascade)

  rating      Int      // 1-5
  comment     String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([jobId, authorId, subjectId])
}
```

### Message
Messages within conversations (threads).

```prisma
model Message {
  id        String   @id @default(cuid())
  threadId  String
  thread    Thread   @relation(fields: [threadId], references: [id], onDelete: Cascade)

  senderId  String
  sender    User     @relation(fields: [senderId], references: [id], onDelete: Cascade)

  content   String
  readAt    DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Thread & ThreadParticipant
Conversation threads between users (hirer ↔ worker).

```prisma
model Thread {
  id            String   @id @default(cuid())
  jobId         String?  // Conversation context (optional)

  messages      Message[]
  participants  ThreadParticipant[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model ThreadParticipant {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  threadId  String
  thread    Thread   @relation(fields: [threadId], references: [id], onDelete: Cascade)

  joinedAt  DateTime @default(now())

  @@unique([userId, threadId])
}
```

### Notification
Alerts for users (job posted, bid received, message, etc.).

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type      String   // 'bid_received'|'bid_accepted'|'job_started'|'message'|'review'
  title     String
  message   String
  isRead    Boolean  @default(false)

  // Optional relation fields
  jobId     String?
  job       Job?     @relation(fields: [jobId], references: [id], onDelete: SetNull)

  bidId     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### PaymentRecord
Tracks all financial transactions (future integration).

```prisma
model PaymentRecord {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  amount      Int      // In cents
  type        String   // 'earnings'|'payout'|'fee'
  status      String   // 'pending'|'completed'|'failed'
  description String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Validation Schemas (Zod)

### Job Creation & Update

```typescript
// lib/validation/job.ts
import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(20).max(5000),
  category: z.enum([
    'plumbing',
    'electrical',
    'landscaping',
    'cleaning',
    'repairs',
    'painting',
    'custom',
  ]),
  budget: z.number().int().positive(), // In cents
  budgetType: z.enum(['fixed', 'hourly']),
  lat: z.number().refine((v) => v >= -90 && v <= 90, 'Invalid latitude'),
  lng: z.number().refine((v) => v >= -180 && v <= 180, 'Invalid longitude'),
  address: z.string().optional(),
  city: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  duration: z.number().int().positive().optional(), // In minutes
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
```

### Bid Creation & Management

```typescript
// lib/validation/bid.ts
import { z } from 'zod';

export const createBidSchema = z.object({
  amount: z.number().int().positive(), // In cents
  message: z.string().max(1000).optional(),
  estimatedDuration: z.number().int().positive().optional(), // In minutes
});

export const updateBidSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'withdrawn']),
});

export type CreateBidInput = z.infer<typeof createBidSchema>;
export type UpdateBidInput = z.infer<typeof updateBidSchema>;
```

### User Registration

```typescript
// lib/validation/auth.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(2).max(100),
  role: z.enum(['hirer', 'worker']),
  phone: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

### Profile Updates

```typescript
// lib/validation/profile.ts
import { z } from 'zod';

export const updateWorkerProfileSchema = z.object({
  headline: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  hourlyRate: z.number().int().positive().optional(), // In cents
  skills: z.array(z.string()).optional(),
  serviceRadius: z.number().int().positive().optional(), // In km
  baseLat: z.number().optional(),
  baseLng: z.number().optional(),
  instantBook: z.boolean().optional(),
});

export const updateHirerProfileSchema = z.object({
  companyName: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  defaultLat: z.number().optional(),
  defaultLng: z.number().optional(),
});

export type UpdateWorkerProfileInput = z.infer<typeof updateWorkerProfileSchema>;
export type UpdateHirerProfileInput = z.infer<typeof updateHirerProfileSchema>;
```

---

## Critical Data Flows

### 1. User Registration

**Flow**: User submits email/password/name/role → Validation → Hash password → Create User → Auto-login

**Route**: `POST /api/auth/register`

```typescript
// app/api/auth/register/route.ts
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validation/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = registerSchema.parse(body);

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(parsed.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        password: hashedPassword,
        name: parsed.name,
        role: parsed.role,
        phone: parsed.phone,
      },
    });

    // Create empty profile based on role
    if (parsed.role === 'worker') {
      await prisma.workerProfile.create({
        data: { userId: user.id },
      });
    } else if (parsed.role === 'hirer') {
      await prisma.hirerProfile.create({
        data: { userId: user.id },
      });
    }

    // Return user (frontend will auto-login via NextAuth)
    return NextResponse.json(
      { id: user.id, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
```

---

### 2. Job Posting (Hirer Only)

**Flow**: Hirer creates job → Validation → Save to DB → Broadcast to nearby workers → Return job with ID

**Route**: `POST /api/jobs`

**Security**: Must verify `session.user.role === 'hirer'`

```typescript
// app/api/jobs/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { createJobSchema } from '@/lib/validation/job';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // Verify auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is hirer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (user?.role !== 'hirer') {
      return NextResponse.json(
        { error: 'Only hirers can post jobs' },
        { status: 403 }
      );
    }

    // Validate input
    const body = await req.json();
    const parsed = createJobSchema.parse(body);

    // Create job
    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
        ...parsed,
      },
      include: {
        bids: true,
        booking: true,
      },
    });

    // TODO: Broadcast to workers via WebSocket/notifications
    // TODO: Index in Meilisearch or similar for location-based search

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Job creation failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Optional: filters from query params
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const maxDistance = searchParams.get('maxDistance'); // In km
    const status = searchParams.get('status') || 'open';

    // Build filter
    const where: any = {
      status,
    };
    if (category) where.category = category;
    if (city) where.city = city;
    // TODO: Implement distance-based filtering using lat/lng

    const jobs = await prisma.job.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
        bids: {
          select: { id: true, status: true },
        },
        booking: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
```

---

### 3. Bidding (Worker Only)

**Flow**: Worker views job → Submits bid with amount/message → Validation → Save to DB → Notify hirer

**Route**: `POST /api/jobs/[id]/bids`

**Security**: Must verify `session.user.role === 'worker'` and job exists

```typescript
// app/api/jobs/[id]/bids/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { createBidSchema } from '@/lib/validation/bid';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is worker
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (user?.role !== 'worker') {
      return NextResponse.json(
        { error: 'Only workers can bid on jobs' },
        { status: 403 }
      );
    }

    // Verify job exists and is still open
    const job = await prisma.job.findUnique({
      where: { id: params.id },
    });
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    if (job.status !== 'open') {
      return NextResponse.json(
        { error: 'Job is not open for bidding' },
        { status: 400 }
      );
    }

    // Check for duplicate bid
    const existing = await prisma.bid.findUnique({
      where: {
        jobId_userId: {
          jobId: params.id,
          userId: session.user.id,
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'You have already bid on this job' },
        { status: 409 }
      );
    }

    // Validate input
    const body = await req.json();
    const parsed = createBidSchema.parse(body);

    // Create bid
    const bid = await prisma.bid.create({
      data: {
        jobId: params.id,
        userId: session.user.id,
        ...parsed,
      },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Create notification for hirer
    await prisma.notification.create({
      data: {
        userId: job.userId,
        type: 'bid_received',
        title: 'New bid received',
        message: `${user?.name} bid $${(parsed.amount / 100).toFixed(2)} on "${job.title}"`,
        jobId: params.id,
      },
    });

    // TODO: Send email to hirer if enabled

    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Bid submission failed' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify job exists and belongs to user (hirer only)
    const job = await prisma.job.findUnique({
      where: { id: params.id },
    });
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    if (job.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch all bids for this job
    const bids = await prisma.bid.findMany({
      where: { jobId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            workerProfile: {
              select: {
                headline: true,
                completedJobs: true,
                averageRating: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bids);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}
```

---

### 4. Bid Acceptance (Hirer Only)

**Flow**: Hirer views bids → Accepts one bid → Update bid status → Create booking → Reject other bids → Notify worker

**Route**: `PATCH /api/bids/[id]`

**Security**: Must verify the job belongs to the authenticated hirer

```typescript
// app/api/bids/[id]/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { updateBidSchema } from '@/lib/validation/bid';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch bid with job info
    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
      include: { job: true },
    });
    if (!bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }

    // Validate ownership
    if (bid.job.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Parse request
    const body = await req.json();
    const parsed = updateBidSchema.parse(body);

    // Handle acceptance
    if (parsed.status === 'accepted') {
      // Update bid status
      const updatedBid = await prisma.bid.update({
        where: { id: params.id },
        data: { status: 'accepted' },
        include: { user: true },
      });

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          jobId: bid.jobId,
          bidId: params.id,
          workerId: bid.userId,
          status: 'scheduled',
          finalAmount: bid.amount,
        },
      });

      // Update job status
      await prisma.job.update({
        where: { id: bid.jobId },
        data: { status: 'assigned' },
      });

      // Reject all other bids for this job
      await prisma.bid.updateMany({
        where: {
          jobId: bid.jobId,
          id: { not: params.id },
          status: 'pending',
        },
        data: { status: 'rejected' },
      });

      // Notify accepted worker
      await prisma.notification.create({
        data: {
          userId: bid.userId,
          type: 'bid_accepted',
          title: 'Your bid was accepted!',
          message: `Your bid of $${(bid.amount / 100).toFixed(2)} on "${bid.job.title}" was accepted`,
          jobId: bid.jobId,
        },
      });

      // Notify rejected workers (fetch them first)
      const rejectedBids = await prisma.bid.findMany({
        where: {
          jobId: bid.jobId,
          status: 'rejected',
        },
        select: { userId: true },
      });
      for (const rejectedBid of rejectedBids) {
        await prisma.notification.create({
          data: {
            userId: rejectedBid.userId,
            type: 'bid_rejected',
            title: 'Bid not selected',
            message: `Your bid on "${bid.job.title}" was not selected`,
            jobId: bid.jobId,
          },
        });
      }

      return NextResponse.json(updatedBid);
    }

    // Handle rejection
    if (parsed.status === 'rejected') {
      const updatedBid = await prisma.bid.update({
        where: { id: params.id },
        data: { status: 'rejected' },
      });

      // Notify worker
      await prisma.notification.create({
        data: {
          userId: bid.userId,
          type: 'bid_rejected',
          title: 'Bid not selected',
          message: `Your bid on "${bid.job.title}" was not selected`,
          jobId: bid.jobId,
        },
      });

      return NextResponse.json(updatedBid);
    }

    return NextResponse.json(
      { error: 'Invalid status' },
      { status: 400 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Bid update failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch bid
    const bid = await prisma.bid.findUnique({
      where: { id: params.id },
    });
    if (!bid) {
      return NextResponse.json(
        { error: 'Bid not found' },
        { status: 404 }
      );
    }

    // Verify worker owns this bid (withdrawal only by worker)
    if (bid.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Can only withdraw pending bids
    if (bid.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot withdraw a non-pending bid' },
        { status: 400 }
      );
    }

    // Delete bid
    await prisma.bid.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Bid withdrawn' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Bid withdrawal failed' },
      { status: 500 }
    );
  }
}
```

---

### 5. Messaging (Both Parties)

**Flow**: Either party initiates message in existing/new thread → Validation → Save message → Notify other party

**Route**: `POST /api/conversations/[id]/messages`

**Security**: Must verify user is a participant in the thread

```typescript
// app/api/conversations/[id]/messages/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const createMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify thread exists
    const thread = await prisma.thread.findUnique({
      where: { id: params.id },
      include: { participants: true },
    });
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Verify user is a participant
    const isParticipant = thread.participants.some(
      (p) => p.userId === session.user.id
    );
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Validate input
    const body = await req.json();
    const parsed = createMessageSchema.parse(body);

    // Create message
    const message = await prisma.message.create({
      data: {
        threadId: params.id,
        senderId: session.user.id,
        content: parsed.content,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Notify other participants
    const otherParticipants = thread.participants.filter(
      (p) => p.userId !== session.user.id
    );
    for (const participant of otherParticipants) {
      await prisma.notification.create({
        data: {
          userId: participant.userId,
          type: 'message',
          title: 'New message',
          message: `You have a new message from ${session.user.name || 'a user'}`,
        },
      });
    }

    // TODO: Send real-time WebSocket update

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Message send failed' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify thread exists and user is participant
    const thread = await prisma.thread.findUnique({
      where: { id: params.id },
      include: { participants: true },
    });
    if (!thread) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const isParticipant = thread.participants.some(
      (p) => p.userId === session.user.id
    );
    if (!isParticipant) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { threadId: params.id },
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
```

---

### 6. Job Status Transitions

**Flow**: Worker marks job as in_progress → Hirer confirms completion → Trigger review prompts

**Route**: `PATCH /api/jobs/[id]/status`

**Security**: Worker can update to `in_progress`, hirer can update to `completed`/`cancelled`

```typescript
// app/api/jobs/[id]/status/route.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled']),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch job
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: { booking: { include: { worker: true } } },
    });
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Parse request
    const body = await req.json();
    const parsed = updateStatusSchema.parse(body);

    // Verify permissions
    const isHirer = job.userId === session.user.id;
    const isWorker = job.booking?.workerId === session.user.id;

    if (!isHirer && !isWorker) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Worker can only mark as in_progress
    if (isWorker && parsed.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Workers can only mark jobs as in_progress' },
        { status: 403 }
      );
    }

    // Hirer can mark as completed or cancelled
    if (isHirer && !['completed', 'cancelled'].includes(parsed.status)) {
      return NextResponse.json(
        { error: 'Invalid status transition' },
        { status: 400 }
      );
    }

    // Update job
    const updated = await prisma.job.update({
      where: { id: params.id },
      data: { status: parsed.status },
      include: { booking: true },
    });

    // If completed, update booking and trigger reviews
    if (parsed.status === 'completed' && job.booking) {
      await prisma.booking.update({
        where: { id: job.booking.id },
        data: { status: 'completed' },
      });

      // Create review requests
      await prisma.notification.create({
        data: {
          userId: job.userId, // Hirer
          type: 'review',
          title: 'Job completed',
          message: `Please leave a review for ${job.booking.worker.name}`,
          jobId: params.id,
        },
      });

      await prisma.notification.create({
        data: {
          userId: job.booking.workerId, // Worker
          type: 'review',
          title: 'Job completed',
          message: 'Please leave a review for your hirer',
          jobId: params.id,
        },
      });

      // Update worker stats
      const workerProfile = await prisma.workerProfile.findUnique({
        where: { userId: job.booking.workerId },
      });
      if (workerProfile) {
        await prisma.workerProfile.update({
          where: { userId: job.booking.workerId },
          data: {
            completedJobs: workerProfile.completedJobs + 1,
            totalEarnings: workerProfile.totalEarnings + (job.booking.finalAmount || 0),
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Status update failed' },
      { status: 500 }
    );
  }
}
```

---

## Security Patterns

### Authentication & Authorization

All protected routes must:

1. **Verify Session**
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

2. **Validate Ownership**
```typescript
// For job ownership
if (job.userId !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// For booking/worker ownership
if (booking.workerId !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

3. **Verify Role**
```typescript
if (user.role !== 'worker') {
  return NextResponse.json({ error: 'Only workers can perform this action' }, { status: 403 });
}
```

4. **Verify Conversation Participation**
```typescript
const isParticipant = thread.participants.some(
  (p) => p.userId === session.user.id
);
if (!isParticipant) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Input Validation

Always use Zod schemas before processing:

```typescript
try {
  const parsed = jobSchema.parse(body);
  // Safe to use parsed
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
}
```

### Error Handling Template

```typescript
try {
  // Main logic
  return NextResponse.json(result);
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
  console.error('Route error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## Database Queries Reference

### Common Patterns

**Fetch job with all related data:**
```typescript
const job = await prisma.job.findUnique({
  where: { id: jobId },
  include: {
    user: {
      select: { id: true, name: true, avatarUrl: true, hirerProfile: true },
    },
    bids: {
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true, workerProfile: true },
        },
      },
      orderBy: { amount: 'asc' },
    },
    booking: {
      include: {
        worker: { select: { id: true, name: true } },
      },
    },
  },
});
```

**Fetch worker profile with stats:**
```typescript
const worker = await prisma.user.findUnique({
  where: { id: workerId },
  include: {
    workerProfile: true,
    reviews: {
      where: { subjectId: workerId },
      take: 10,
      orderBy: { createdAt: 'desc' },
    },
    bids: {
      include: { job: true },
      where: { status: 'accepted' },
    },
  },
});
```

**Fetch user conversations:**
```typescript
const conversations = await prisma.thread.findMany({
  where: {
    participants: {
      some: { userId: sessionUserId },
    },
  },
  include: {
    participants: {
      select: { user: { select: { id: true, name: true, avatarUrl: true } } },
    },
    messages: {
      orderBy: { createdAt: 'desc' },
      take: 1,
    },
  },
  orderBy: { updatedAt: 'desc' },
});
```

---

## Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| `400` | Bad Request (validation) | Invalid Zod schema |
| `401` | Unauthorized (no session) | Missing NextAuth session |
| `403` | Forbidden (permission denied) | Worker posting job, or hirer accepting own bid |
| `404` | Not Found | Job doesn't exist, bid not found |
| `409` | Conflict | Email already exists, duplicate bid from same worker |
| `500` | Internal Server Error | Database connection failed |

---

## Future Integrations

### Payment Processing
- Stripe integration for payments
- PaymentRecord model tracks all transactions
- Automatic payout to worker after job completion
- Fee structure (platform takes %)

### Email Notifications
- Resend/SendGrid for transactional emails
- Welcome email on registration
- Job alerts to nearby workers
- Bid notifications, bid acceptance, job start reminders

### File Storage
- AWS S3 or Vercel Blob for avatars and job images
- Multiple images per job listing
- Signed URLs for temporary access

### Real-time Updates
- WebSocket via Socket.io or Pusher
- Live job map updates
- Real-time messaging
- Live bid notifications

### Error Monitoring
- Sentry for error tracking
- Performance monitoring
- Rate limiting with Upstash (key-based)

### Search & Discovery
- Meilisearch or Algolia for full-text job search
- Location-based filtering with PostGIS
- Skills-based filtering for workers

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@neon.tech/crewlink

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Email (when integrated)
RESEND_API_KEY=<key>

# Storage (when integrated)
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<key>
AWS_S3_BUCKET=crewlink-prod

# Monitoring (when integrated)
SENTRY_DSN=<dsn>
UPSTASH_REDIS_REST_URL=<url>
UPSTASH_REDIS_REST_TOKEN=<token>
```

---

## Testing Checklist

- [ ] User registration creates User + Profile
- [ ] Hirer can post jobs
- [ ] Worker can submit bids
- [ ] Hirer can accept/reject bids
- [ ] Bid acceptance creates Booking
- [ ] Bid acceptance updates job status to `assigned`
- [ ] Bid acceptance rejects other pending bids
- [ ] Messages create Notification for other party
- [ ] Job completion triggers review requests
- [ ] Worker stats update on job completion
- [ ] All auth checks prevent unauthorized access
- [ ] All Zod validations reject invalid input

---

## Performance Notes

- Index `job.status` and `job.userId` for faster queries
- Batch fetch bids with `.include()` to avoid N+1 queries
- Use `.select()` to minimize returned fields
- Cache job listings with Next.js `revalidate`
- Consider pagination on large result sets
- Monitor notification creation frequency (potential bottleneck)

---

*Last Updated: 2026-02-27*
*Maintained by: CrewLink Team*
