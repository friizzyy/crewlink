import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...')
  await prisma.notification.deleteMany()
  await prisma.message.deleteMany()
  await prisma.threadParticipant.deleteMany()
  await prisma.messageThread.deleteMany()
  await prisma.review.deleteMany()
  await prisma.paymentRecord.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.bid.deleteMany()
  await prisma.job.deleteMany()
  await prisma.availabilityWindow.deleteMany()
  await prisma.workerProfile.deleteMany()
  await prisma.hirerProfile.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.city.deleteMany()
  await prisma.category.deleteMany()
  await prisma.skill.deleteMany()

  // Seed Cities
  console.log('🏙️ Seeding cities...')
  const cities = await Promise.all([
    prisma.city.create({
      data: {
        name: 'New York',
        state: 'NY',
        slug: 'new-york',
        lat: 40.7128,
        lng: -74.006,
        isActive: true,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Los Angeles',
        state: 'CA',
        slug: 'los-angeles',
        lat: 34.0522,
        lng: -118.2437,
        isActive: true,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Chicago',
        state: 'IL',
        slug: 'chicago',
        lat: 41.8781,
        lng: -87.6298,
        isActive: true,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Houston',
        state: 'TX',
        slug: 'houston',
        lat: 29.7604,
        lng: -95.3698,
        isActive: true,
      },
    }),
    prisma.city.create({
      data: {
        name: 'Miami',
        state: 'FL',
        slug: 'miami',
        lat: 25.7617,
        lng: -80.1918,
        isActive: true,
      },
    }),
  ])

  // Seed Categories
  console.log('📁 Seeding categories...')
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Moving', slug: 'moving', iconName: 'Truck', sortOrder: 1 } }),
    prisma.category.create({ data: { name: 'Cleaning', slug: 'cleaning', iconName: 'Sparkles', sortOrder: 2 } }),
    prisma.category.create({ data: { name: 'Handyman', slug: 'handyman', iconName: 'Wrench', sortOrder: 3 } }),
    prisma.category.create({ data: { name: 'Delivery', slug: 'delivery', iconName: 'Package', sortOrder: 4 } }),
    prisma.category.create({ data: { name: 'Assembly', slug: 'assembly', iconName: 'Puzzle', sortOrder: 5 } }),
    prisma.category.create({ data: { name: 'Yardwork', slug: 'yardwork', iconName: 'Trees', sortOrder: 6 } }),
    prisma.category.create({ data: { name: 'Painting', slug: 'painting', iconName: 'PaintBrush', sortOrder: 7 } }),
    prisma.category.create({ data: { name: 'Pet Care', slug: 'pet-care', iconName: 'Dog', sortOrder: 8 } }),
    prisma.category.create({ data: { name: 'Tech Help', slug: 'tech-help', iconName: 'Laptop', sortOrder: 9 } }),
    prisma.category.create({ data: { name: 'Events', slug: 'events', iconName: 'Calendar', sortOrder: 10 } }),
    prisma.category.create({ data: { name: 'Errands', slug: 'errands', iconName: 'ShoppingBag', sortOrder: 11 } }),
    prisma.category.create({ data: { name: 'Other', slug: 'other', iconName: 'MoreHorizontal', sortOrder: 12 } }),
  ])

  // Seed Skills
  console.log('🎯 Seeding skills...')
  await prisma.skill.createMany({
    data: [
      { name: 'Heavy Lifting', category: 'physical' },
      { name: 'Furniture Assembly', category: 'assembly' },
      { name: 'Deep Cleaning', category: 'cleaning' },
      { name: 'Plumbing Basics', category: 'handyman' },
      { name: 'Electrical Basics', category: 'handyman' },
      { name: 'Painting', category: 'painting' },
      { name: 'Lawn Care', category: 'yardwork' },
      { name: 'Pet Sitting', category: 'pet-care' },
      { name: 'Dog Walking', category: 'pet-care' },
      { name: 'Computer Setup', category: 'tech' },
      { name: 'Smart Home Setup', category: 'tech' },
      { name: 'Event Setup', category: 'events' },
      { name: 'Driving', category: 'delivery' },
      { name: 'Organization', category: 'cleaning' },
      { name: 'Carpentry', category: 'handyman' },
    ],
  })

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Seed Users (Hirers)
  console.log('👤 Seeding hirer users...')
  const hirers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'sarah@example.com',
        password: hashedPassword,
        name: 'Sarah Johnson',
        role: 'hirer',
        hirerProfile: {
          create: {
            companyName: 'Johnson Properties',
            bio: 'Property manager looking for reliable help',
            defaultLat: 40.7580,
            defaultLng: -73.9855,
            defaultAddress: '123 Main St, New York, NY',
            isVerified: true,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'mike@example.com',
        password: hashedPassword,
        name: 'Mike Chen',
        role: 'hirer',
        hirerProfile: {
          create: {
            bio: 'Busy professional needing help around the house',
            defaultLat: 34.0195,
            defaultLng: -118.4912,
            defaultAddress: '456 Oak Ave, Los Angeles, CA',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'demo@crewlink.app',
        password: hashedPassword,
        name: 'Demo User',
        role: 'hirer',
        hirerProfile: {
          create: {
            bio: 'Demo account for testing',
            defaultLat: 40.7128,
            defaultLng: -74.006,
            defaultAddress: 'New York, NY',
          },
        },
      },
    }),
  ])

  // Seed Users (Workers)
  console.log('👷 Seeding worker users...')
  const workers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alex@example.com',
        password: hashedPassword,
        name: 'Alex Rivera',
        role: 'worker',
        workerProfile: {
          create: {
            headline: 'Professional Mover & Handyman',
            bio: '5 years of experience in moving and home repairs. Always on time and careful with your belongings.',
            hourlyRate: 35,
            skills: ['Heavy Lifting', 'Furniture Assembly', 'Carpentry'],
            isVerified: true,
            completedJobs: 127,
            averageRating: 4.9,
            responseRate: 98,
            baseLat: 40.7580,
            baseLng: -73.9855,
            baseAddress: 'Midtown, New York, NY',
            serviceRadius: 25,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma@example.com',
        password: hashedPassword,
        name: 'Emma Williams',
        role: 'worker',
        workerProfile: {
          create: {
            headline: 'Cleaning & Organization Expert',
            bio: 'Certified professional cleaner. I take pride in making spaces spotless and organized.',
            hourlyRate: 28,
            skills: ['Deep Cleaning', 'Organization'],
            isVerified: true,
            completedJobs: 89,
            averageRating: 4.8,
            responseRate: 95,
            baseLat: 40.7282,
            baseLng: -73.7949,
            baseAddress: 'Queens, New York, NY',
            serviceRadius: 20,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'james@example.com',
        password: hashedPassword,
        name: 'James Martinez',
        role: 'worker',
        workerProfile: {
          create: {
            headline: 'Delivery & Errands Specialist',
            bio: 'Fast, reliable delivery service. Own vehicle. Available on short notice.',
            hourlyRate: 25,
            skills: ['Driving', 'Heavy Lifting'],
            completedJobs: 234,
            averageRating: 4.7,
            responseRate: 92,
            baseLat: 34.0522,
            baseLng: -118.2437,
            baseAddress: 'Downtown, Los Angeles, CA',
            serviceRadius: 30,
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'lisa@example.com',
        password: hashedPassword,
        name: 'Lisa Park',
        role: 'worker',
        workerProfile: {
          create: {
            headline: 'Pet Care Professional',
            bio: 'Animal lover with 3 years of pet sitting experience. Insured and bonded.',
            hourlyRate: 22,
            skills: ['Pet Sitting', 'Dog Walking'],
            isVerified: true,
            completedJobs: 156,
            averageRating: 5.0,
            responseRate: 99,
            baseLat: 41.8781,
            baseLng: -87.6298,
            baseAddress: 'Lincoln Park, Chicago, IL',
            serviceRadius: 15,
          },
        },
      },
    }),
  ])

  // Seed Jobs
  console.log('📋 Seeding jobs...')
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        posterId: hirers[0].id,
        title: 'Help Moving Furniture to New Apartment',
        description: 'Need two strong people to help move a couch, bed frame, dresser, and several boxes from my 3rd floor apartment to a new place 5 miles away. Must have experience with heavy lifting. Building has elevator access.',
        category: 'moving',
        lat: 40.7580,
        lng: -73.9855,
        address: '123 Main St, New York, NY 10001',
        city: 'New York',
        scheduleType: 'specific',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        estimatedHours: 4,
        budgetType: 'fixed',
        budgetMin: 150,
        budgetMax: 200,
        status: 'posted',
        skills: ['Heavy Lifting'],
      },
    }),
    prisma.job.create({
      data: {
        posterId: hirers[0].id,
        title: 'Deep Clean 2BR Apartment Before Move-in',
        description: 'Need thorough cleaning of a 2-bedroom apartment including kitchen, bathrooms, floors, and windows. Previous tenant left it in rough shape. All supplies will be provided.',
        category: 'cleaning',
        lat: 40.7282,
        lng: -73.7949,
        address: '456 Queens Blvd, Queens, NY 11375',
        city: 'New York',
        scheduleType: 'flexible',
        estimatedHours: 5,
        budgetType: 'hourly',
        budgetMin: 25,
        budgetMax: 35,
        status: 'posted',
        skills: ['Deep Cleaning'],
      },
    }),
    prisma.job.create({
      data: {
        posterId: hirers[1].id,
        title: 'IKEA Furniture Assembly',
        description: 'Just purchased several IKEA items that need assembly: 1 wardrobe (PAX), 2 bookshelves (BILLY), and a desk (MALM). All items are still in boxes. Tools can be provided if needed.',
        category: 'assembly',
        lat: 34.0195,
        lng: -118.4912,
        address: '789 Wilshire Blvd, Los Angeles, CA 90025',
        city: 'Los Angeles',
        scheduleType: 'flexible',
        estimatedHours: 6,
        budgetType: 'fixed',
        budgetMin: 120,
        budgetMax: 180,
        status: 'posted',
        skills: ['Furniture Assembly'],
      },
    }),
    prisma.job.create({
      data: {
        posterId: hirers[1].id,
        title: 'Weekly Dog Walking - 2 Golden Retrievers',
        description: 'Looking for a reliable dog walker for my two friendly Golden Retrievers. Need walks 5 days a week, approximately 30-45 minutes each. Dogs are well-trained but energetic.',
        category: 'pet-care',
        lat: 34.0522,
        lng: -118.2437,
        address: 'Santa Monica, Los Angeles, CA',
        city: 'Los Angeles',
        scheduleType: 'flexible',
        estimatedHours: 2,
        budgetType: 'hourly',
        budgetMin: 20,
        budgetMax: 30,
        status: 'posted',
        skills: ['Dog Walking'],
      },
    }),
    prisma.job.create({
      data: {
        posterId: hirers[2].id,
        title: 'Lawn Mowing and Basic Yard Maintenance',
        description: 'Regular lawn care needed for suburban home. Includes mowing front and back yards, edging, and leaf blowing. Roughly 1/4 acre total. Equipment provided.',
        category: 'yardwork',
        lat: 41.8781,
        lng: -87.6298,
        address: '321 Elm Street, Chicago, IL 60601',
        city: 'Chicago',
        scheduleType: 'asap',
        estimatedHours: 2,
        budgetType: 'fixed',
        budgetMin: 50,
        budgetMax: 75,
        status: 'posted',
        skills: ['Lawn Care'],
      },
    }),
    prisma.job.create({
      data: {
        posterId: hirers[0].id,
        title: 'Smart Home Device Setup',
        description: 'Need help setting up smart home devices including: Ring doorbell, Nest thermostat, and 5 smart bulbs. Should also connect everything to a hub and demonstrate how to use the app.',
        category: 'tech-help',
        lat: 40.7128,
        lng: -74.006,
        address: 'Financial District, New York, NY',
        city: 'New York',
        scheduleType: 'flexible',
        estimatedHours: 3,
        budgetType: 'fixed',
        budgetMin: 80,
        budgetMax: 120,
        status: 'posted',
        skills: ['Smart Home Setup', 'Computer Setup'],
      },
    }),
  ])

  // Seed Bids
  console.log('💰 Seeding bids...')
  await Promise.all([
    prisma.bid.create({
      data: {
        jobId: jobs[0].id,
        workerId: workers[0].id,
        amount: 175,
        message: "Hi! I have a truck and 5 years of moving experience. I can bring a helper. Let's get your stuff moved safely!",
        estimatedHours: 4,
        status: 'pending',
      },
    }),
    prisma.bid.create({
      data: {
        jobId: jobs[1].id,
        workerId: workers[1].id,
        amount: 30,
        message: "I specialize in move-in/move-out cleaning. I'll make sure every corner is spotless!",
        estimatedHours: 5,
        status: 'pending',
      },
    }),
    prisma.bid.create({
      data: {
        jobId: jobs[2].id,
        workerId: workers[0].id,
        amount: 150,
        message: "I've assembled hundreds of IKEA pieces. Quick and efficient work guaranteed.",
        estimatedHours: 5,
        status: 'pending',
      },
    }),
    prisma.bid.create({
      data: {
        jobId: jobs[3].id,
        workerId: workers[3].id,
        amount: 25,
        message: "I love Golden Retrievers! I have experience with large, energetic dogs. Happy to meet them first.",
        estimatedHours: 1,
        status: 'pending',
      },
    }),
  ])

  // Update job bid counts
  await prisma.job.update({ where: { id: jobs[0].id }, data: { bidCount: 1 } })
  await prisma.job.update({ where: { id: jobs[1].id }, data: { bidCount: 1 } })
  await prisma.job.update({ where: { id: jobs[2].id }, data: { bidCount: 1 } })
  await prisma.job.update({ where: { id: jobs[3].id }, data: { bidCount: 1 } })

  // Seed a sample conversation
  console.log('💬 Seeding conversations...')
  const conversation = await prisma.messageThread.create({
    data: {
      jobId: jobs[0].id,
      participants: {
        create: [
          { userId: hirers[0].id },
          { userId: workers[0].id },
        ],
      },
    },
  })

  await prisma.message.createMany({
    data: [
      {
        threadId: conversation.id,
        senderId: workers[0].id,
        content: "Hi Sarah! I saw your moving job posting. I have a truck and can definitely help. When would work best for you?",
      },
      {
        threadId: conversation.id,
        senderId: hirers[0].id,
        content: "Hi Alex! Thanks for reaching out. I was thinking Saturday morning around 9am. Does that work?",
      },
      {
        threadId: conversation.id,
        senderId: workers[0].id,
        content: "Saturday at 9am works perfectly. I'll bring all the necessary moving supplies. See you then!",
      },
    ],
  })

  // Seed Notifications
  console.log('🔔 Seeding notifications...')
  await prisma.notification.createMany({
    data: [
      {
        userId: hirers[0].id,
        type: 'new_bid',
        title: 'New Bid Received',
        body: 'Alex Rivera submitted a bid of $175 for your moving job',
        data: { jobId: jobs[0].id },
        actionUrl: `/hiring/job/${jobs[0].id}`,
      },
      {
        userId: hirers[0].id,
        type: 'new_bid',
        title: 'New Bid Received',
        body: 'Emma Williams submitted a bid for your cleaning job',
        data: { jobId: jobs[1].id },
        actionUrl: `/hiring/job/${jobs[1].id}`,
      },
      {
        userId: workers[0].id,
        type: 'new_message',
        title: 'New Message',
        body: 'Sarah Johnson sent you a message',
        data: { conversationId: conversation.id },
        actionUrl: `/work/messages`,
      },
    ],
  })

  // Update city counts
  await prisma.city.update({
    where: { slug: 'new-york' },
    data: { jobCount: 3, workerCount: 2 },
  })
  await prisma.city.update({
    where: { slug: 'los-angeles' },
    data: { jobCount: 2, workerCount: 1 },
  })
  await prisma.city.update({
    where: { slug: 'chicago' },
    data: { jobCount: 1, workerCount: 1 },
  })

  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('📝 Demo Accounts:')
  console.log('   Hirer: demo@crewlink.app / password123')
  console.log('   Hirer: sarah@example.com / password123')
  console.log('   Worker: alex@example.com / password123')
  console.log('   Worker: emma@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
