// ============================================
// CAREERS DATA - Single source of truth for job listings
// All role pages and the careers index render from this data
// ============================================

export interface JobRole {
  slug: string
  title: string
  department: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract'
  summary: string
  overview: string[]
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
  compensation: {
    range?: string
    benefits: string[]
  }
  hiringProcess: {
    step: number
    title: string
    description: string
  }[]
}

export const DEPARTMENTS = ['Engineering', 'Design', 'Operations', 'Marketing'] as const
export const LOCATIONS = ['Remote (US)', 'San Francisco, CA', 'New York, NY'] as const
export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract'] as const

export type Department = typeof DEPARTMENTS[number]
export type Location = typeof LOCATIONS[number]
export type JobType = typeof JOB_TYPES[number]

export const JOB_ROLES: JobRole[] = [
  {
    slug: 'senior-frontend-engineer',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    summary: 'Build the future of local work. You\'ll own major features in our React/Next.js application, working closely with design and product to create delightful user experiences.',
    overview: [
      'Lead development of user-facing features in our Next.js application',
      'Collaborate with designers to implement pixel-perfect UI components',
      'Mentor junior engineers and contribute to engineering culture',
      'Drive technical decisions and architecture improvements',
      'Ship code that directly impacts thousands of users daily',
    ],
    responsibilities: [
      'Build and maintain React components with TypeScript',
      'Implement responsive designs using Tailwind CSS',
      'Write clean, tested, and well-documented code',
      'Participate in code reviews and technical discussions',
      'Optimize application performance and accessibility',
      'Collaborate cross-functionally with design, product, and backend teams',
    ],
    requirements: [
      '5+ years of frontend development experience',
      'Strong proficiency in React, TypeScript, and modern JavaScript',
      'Experience with Next.js or similar React frameworks',
      'Solid understanding of web fundamentals (HTML, CSS, browser APIs)',
      'Track record of shipping features in production environments',
      'Excellent communication and collaboration skills',
    ],
    niceToHave: [
      'Experience with mapping libraries (Mapbox, Leaflet)',
      'Background in real-time applications or WebSockets',
      'Familiarity with design systems and component libraries',
      'Open source contributions',
    ],
    compensation: {
      range: 'Competitive salary based on experience',
      benefits: [
        'Full medical, dental, and vision coverage',
        'Flexible work schedule and unlimited PTO',
        '$2,000 annual learning and development budget',
        'Home office stipend',
        'Equity participation',
      ],
    },
    hiringProcess: [
      { step: 1, title: 'Application Review', description: 'We\'ll review your resume and reach out within a week if there\'s a fit.' },
      { step: 2, title: 'Technical Interview', description: 'A 60-minute conversation about your experience and a practical coding exercise.' },
      { step: 3, title: 'Team Interviews', description: 'Meet the team you\'d work with. We want to make sure it\'s a great fit for everyone.' },
    ],
  },
  {
    slug: 'product-designer',
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote (US)',
    type: 'Full-time',
    summary: 'Shape how people find and hire local help. You\'ll own end-to-end design for key product areas, from research and ideation through to polished, shipped features.',
    overview: [
      'Own the design process from concept to launch',
      'Create intuitive interfaces for both workers and hirers',
      'Build and maintain our design system',
      'Conduct user research to inform design decisions',
      'Work closely with engineers to ensure quality implementation',
    ],
    responsibilities: [
      'Design user flows, wireframes, and high-fidelity prototypes',
      'Maintain and evolve our Figma design system',
      'Conduct user interviews and usability testing',
      'Collaborate with product and engineering on feature specs',
      'Present designs and rationale to stakeholders',
      'Iterate based on user feedback and data',
    ],
    requirements: [
      '4+ years of product design experience',
      'Strong portfolio demonstrating end-to-end product thinking',
      'Proficiency in Figma and modern design tools',
      'Experience with design systems and component libraries',
      'Understanding of frontend development constraints',
      'Excellent written and verbal communication',
    ],
    niceToHave: [
      'Experience designing marketplace or two-sided platforms',
      'Motion design and micro-interaction skills',
      'Background in user research',
      'Previous startup experience',
    ],
    compensation: {
      range: 'Competitive salary based on experience',
      benefits: [
        'Full medical, dental, and vision coverage',
        'Flexible work schedule and unlimited PTO',
        '$2,000 annual learning and development budget',
        'Home office stipend',
        'Equity participation',
      ],
    },
    hiringProcess: [
      { step: 1, title: 'Portfolio Review', description: 'We\'ll review your portfolio and reach out to discuss your work.' },
      { step: 2, title: 'Design Exercise', description: 'A take-home exercise that reflects real work you\'d do here.' },
      { step: 3, title: 'Team Interviews', description: 'Present your exercise and meet the team.' },
    ],
  },
  {
    slug: 'backend-engineer',
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    summary: 'Build the systems that power local work. You\'ll design and implement APIs, optimize database performance, and ensure our platform scales reliably.',
    overview: [
      'Design and build scalable backend services',
      'Own critical systems like matching, payments, and notifications',
      'Improve platform reliability and performance',
      'Collaborate with frontend engineers on API design',
      'Contribute to architectural decisions',
    ],
    responsibilities: [
      'Design and implement RESTful APIs',
      'Write efficient database queries and optimize performance',
      'Build reliable, well-tested backend services',
      'Participate in on-call rotation',
      'Document systems and APIs',
      'Review code and mentor other engineers',
    ],
    requirements: [
      '4+ years of backend development experience',
      'Strong proficiency in Node.js, Python, or Go',
      'Experience with PostgreSQL or similar databases',
      'Understanding of API design and RESTful principles',
      'Familiarity with cloud infrastructure (AWS, GCP)',
      'Good debugging and problem-solving skills',
    ],
    niceToHave: [
      'Experience with real-time systems',
      'Background in payments or fintech',
      'Knowledge of geospatial data and queries',
      'Contributions to open source projects',
    ],
    compensation: {
      range: 'Competitive salary based on experience',
      benefits: [
        'Full medical, dental, and vision coverage',
        'Flexible work schedule and unlimited PTO',
        '$2,000 annual learning and development budget',
        'Home office stipend',
        'Equity participation',
      ],
    },
    hiringProcess: [
      { step: 1, title: 'Application Review', description: 'We\'ll review your resume and reach out within a week.' },
      { step: 2, title: 'Technical Interview', description: 'System design discussion and coding exercise.' },
      { step: 3, title: 'Team Interviews', description: 'Meet the engineering team and discuss past projects.' },
    ],
  },
  {
    slug: 'customer-success-manager',
    title: 'Customer Success Manager',
    department: 'Operations',
    location: 'San Francisco, CA',
    type: 'Full-time',
    summary: 'Be the voice of our users. You\'ll help customers get the most out of CrewLink while gathering insights that shape our product roadmap.',
    overview: [
      'Own relationships with key customer accounts',
      'Onboard new users and ensure successful adoption',
      'Identify opportunities to improve the customer experience',
      'Surface user feedback to product and engineering',
      'Build scalable support processes',
    ],
    responsibilities: [
      'Manage a portfolio of customer accounts',
      'Conduct onboarding calls and training sessions',
      'Respond to customer inquiries via chat and email',
      'Identify and escalate product issues',
      'Create help documentation and tutorials',
      'Track and report on customer health metrics',
    ],
    requirements: [
      '3+ years in customer success or account management',
      'Experience with SaaS or marketplace products',
      'Strong written and verbal communication',
      'Empathy and patience in customer interactions',
      'Ability to explain technical concepts simply',
      'Comfort with ambiguity and fast-paced environments',
    ],
    niceToHave: [
      'Experience in the gig economy or labor marketplace',
      'Background in support tooling (Intercom, Zendesk)',
      'Spanish language fluency',
      'Previous startup experience',
    ],
    compensation: {
      range: 'Competitive salary based on experience',
      benefits: [
        'Full medical, dental, and vision coverage',
        'Flexible work schedule and unlimited PTO',
        '$2,000 annual learning and development budget',
        'Commuter benefits',
        'Equity participation',
      ],
    },
    hiringProcess: [
      { step: 1, title: 'Application Review', description: 'We\'ll review your background and reach out for a call.' },
      { step: 2, title: 'Role Play', description: 'A simulated customer interaction to see how you work.' },
      { step: 3, title: 'Team Interviews', description: 'Meet the operations team and discuss your approach.' },
    ],
  },
  {
    slug: 'growth-marketing-lead',
    title: 'Growth Marketing Lead',
    department: 'Marketing',
    location: 'Remote (US)',
    type: 'Full-time',
    summary: 'Drive user acquisition and engagement. You\'ll own growth experiments, paid acquisition, and the strategies that bring workers and hirers to CrewLink.',
    overview: [
      'Own user acquisition across paid and organic channels',
      'Design and run growth experiments',
      'Optimize conversion funnels and landing pages',
      'Manage marketing budget and CAC targets',
      'Build the foundation for a scalable growth function',
    ],
    responsibilities: [
      'Plan and execute paid acquisition campaigns',
      'Analyze funnel performance and identify opportunities',
      'A/B test landing pages and ad creative',
      'Collaborate with product on growth features',
      'Report on key growth metrics to leadership',
      'Manage relationships with ad platforms and vendors',
    ],
    requirements: [
      '5+ years in growth or performance marketing',
      'Experience managing paid campaigns (Google, Meta, etc.)',
      'Strong analytical skills and data fluency',
      'Track record of driving measurable growth',
      'Understanding of attribution and measurement',
      'Excellent communication and collaboration',
    ],
    niceToHave: [
      'Experience with marketplace or two-sided platforms',
      'Background in local services marketing',
      'SQL proficiency',
      'Experience building growth teams',
    ],
    compensation: {
      range: 'Competitive salary based on experience',
      benefits: [
        'Full medical, dental, and vision coverage',
        'Flexible work schedule and unlimited PTO',
        '$2,000 annual learning and development budget',
        'Home office stipend',
        'Equity participation',
      ],
    },
    hiringProcess: [
      { step: 1, title: 'Application Review', description: 'We\'ll review your background and schedule a call.' },
      { step: 2, title: 'Case Study', description: 'Present a growth strategy for a hypothetical scenario.' },
      { step: 3, title: 'Team Interviews', description: 'Meet leadership and discuss your vision.' },
    ],
  },
]

// Helper functions
export function getRoleBySlug(slug: string): JobRole | undefined {
  return JOB_ROLES.find(role => role.slug === slug)
}

export function getRolesByDepartment(department: string): JobRole[] {
  if (department === 'all') return JOB_ROLES
  return JOB_ROLES.filter(role => role.department === department)
}

export function getRolesByLocation(location: string): JobRole[] {
  if (location === 'all') return JOB_ROLES
  return JOB_ROLES.filter(role => role.location === location)
}

export function getRolesByType(type: string): JobRole[] {
  if (type === 'all') return JOB_ROLES
  return JOB_ROLES.filter(role => role.type === type)
}

export function filterRoles(filters: {
  department?: string
  location?: string
  type?: string
}): JobRole[] {
  return JOB_ROLES.filter(role => {
    if (filters.department && filters.department !== 'all' && role.department !== filters.department) {
      return false
    }
    if (filters.location && filters.location !== 'all' && role.location !== filters.location) {
      return false
    }
    if (filters.type && filters.type !== 'all' && role.type !== filters.type) {
      return false
    }
    return true
  })
}

export function getAllDepartments(): string[] {
  return [...DEPARTMENTS]
}

export function getAllLocations(): string[] {
  return [...LOCATIONS]
}

export function getAllJobTypes(): string[] {
  return [...JOB_TYPES]
}
