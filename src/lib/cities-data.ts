// ============================================
// CITIES DATA - SINGLE SOURCE OF TRUTH
// West Coast focused - California & Lake Tahoe region
// ============================================

export type CityRegion = 'california' | 'tahoe' | 'west-coast-expansion'

export interface City {
  id: string
  name: string
  state: string
  region: CityRegion
  status: 'live' | 'coming-soon'
  workers?: number
  jobs?: number
  lat: number
  lng: number
  heroImage?: string
  description?: string
  featured?: boolean
}

// ============================================
// CURATED CITY LIST - West Coast Only
// ============================================
export const cities: City[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CALIFORNIA - Top 10 (includes mandatory: Grass Valley, Nevada City, Auburn)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'grass-valley',
    name: 'Grass Valley',
    state: 'CA',
    region: 'california',
    status: 'live',
    workers: 220,
    jobs: 140,
    lat: 39.2191,
    lng: -121.0608,
    description: 'Historic Gold Rush town with charming downtown and local service economy.',
    featured: true,
  },
  {
    id: 'nevada-city',
    name: 'Nevada City',
    state: 'CA',
    region: 'california',
    status: 'live',
    workers: 160,
    jobs: 100,
    lat: 39.2616,
    lng: -121.0160,
    description: 'Victorian gem in the Sierra foothills with arts community and tourism.',
    featured: true,
  },
  {
    id: 'auburn',
    name: 'Auburn',
    state: 'CA',
    region: 'california',
    status: 'live',
    workers: 290,
    jobs: 175,
    lat: 38.8966,
    lng: -121.0769,
    description: 'Gateway to Gold Country with outdoor recreation and growing population.',
    featured: true,
  },
  {
    id: 'san-francisco',
    name: 'San Francisco',
    state: 'CA',
    region: 'california',
    status: 'live',
    workers: 2840,
    jobs: 1250,
    lat: 37.7749,
    lng: -122.4194,
    description: 'The heart of tech and innovation, with diverse neighborhoods and a thriving gig economy.',
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles',
    state: 'CA',
    region: 'california',
    status: 'live',
    workers: 4520,
    jobs: 2180,
    lat: 34.0522,
    lng: -118.2437,
    description: 'The entertainment capital with endless opportunities for local work.',
  },
  {
    id: 'san-diego',
    name: 'San Diego',
    state: 'CA',
    region: 'california',
    status: 'live',
    workers: 2200,
    jobs: 1050,
    lat: 32.7157,
    lng: -117.1611,
    description: 'Beautiful coastal city with year-round demand for outdoor and home services.',
  },
  {
    id: 'sacramento',
    name: 'Sacramento',
    state: 'CA',
    region: 'california',
    status: 'live',
    workers: 1580,
    jobs: 720,
    lat: 38.5816,
    lng: -121.4944,
    description: 'California\'s capital city with growing population and service demand.',
  },
  {
    id: 'san-jose',
    name: 'San Jose',
    state: 'CA',
    region: 'california',
    status: 'live',
    workers: 2100,
    jobs: 980,
    lat: 37.3382,
    lng: -121.8863,
    description: 'The capital of Silicon Valley, with tech workers seeking convenient local help.',
  },
  {
    id: 'oakland',
    name: 'Oakland',
    state: 'CA',
    region: 'california',
    status: 'live',
    workers: 1680,
    jobs: 720,
    lat: 37.8044,
    lng: -122.2712,
    description: 'A vibrant city with rich culture and growing demand for local services.',
  },
  {
    id: 'santa-rosa',
    name: 'Santa Rosa',
    state: 'CA',
    region: 'california',
    status: 'live',
    workers: 680,
    jobs: 340,
    lat: 38.4404,
    lng: -122.7141,
    description: 'Wine country hub with growing population and diverse service needs.',
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LAKE TAHOE - California & Nevada sides
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'north-lake-tahoe',
    name: 'North Lake Tahoe',
    state: 'CA/NV',
    region: 'tahoe',
    status: 'live',
    workers: 380,
    jobs: 220,
    lat: 39.1677,
    lng: -120.1436,
    description: 'North shore communities including Tahoe City, Kings Beach, and Incline Village.',
    featured: true,
  },
  {
    id: 'south-lake-tahoe',
    name: 'South Lake Tahoe',
    state: 'CA/NV',
    region: 'tahoe',
    status: 'live',
    workers: 420,
    jobs: 280,
    lat: 38.9399,
    lng: -119.9772,
    description: 'Premier mountain destination with year-round tourism and vacation rental services.',
    featured: true,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WEST COAST EXPANSION - Coming Soon (Limited)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'seattle',
    name: 'Seattle',
    state: 'WA',
    region: 'west-coast-expansion',
    status: 'coming-soon',
    lat: 47.6062,
    lng: -122.3321,
    description: 'The Emerald City - expanding soon.',
  },
  {
    id: 'portland',
    name: 'Portland',
    state: 'OR',
    region: 'west-coast-expansion',
    status: 'coming-soon',
    lat: 45.5152,
    lng: -122.6784,
    description: 'Rose City - expanding soon.',
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas',
    state: 'NV',
    region: 'west-coast-expansion',
    status: 'coming-soon',
    lat: 36.1699,
    lng: -115.1398,
    description: 'Entertainment capital - expanding soon.',
  },
  {
    id: 'reno',
    name: 'Reno',
    state: 'NV',
    region: 'west-coast-expansion',
    status: 'coming-soon',
    lat: 39.5296,
    lng: -119.8138,
    description: 'Biggest Little City - expanding soon.',
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    state: 'AZ',
    region: 'west-coast-expansion',
    status: 'coming-soon',
    lat: 33.4484,
    lng: -112.0740,
    description: 'Valley of the Sun - expanding soon.',
  },
  {
    id: 'denver',
    name: 'Denver',
    state: 'CO',
    region: 'west-coast-expansion',
    status: 'coming-soon',
    lat: 39.7392,
    lng: -104.9903,
    description: 'Mile High City - expanding soon.',
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

export const regionLabels: Record<CityRegion, string> = {
  'california': 'California',
  'tahoe': 'Lake Tahoe',
  'west-coast-expansion': 'Expanding Next',
}

export const getLiveCities = () => cities.filter(c => c.status === 'live')
export const getComingSoonCities = () => cities.filter(c => c.status === 'coming-soon')
export const getCityById = (id: string) => cities.find(c => c.id === id)

export const getCaliforniaCities = () => cities.filter(c => c.region === 'california' && c.status === 'live')
export const getTahoeCities = () => cities.filter(c => c.region === 'tahoe' && c.status === 'live')
export const getExpansionCities = () => cities.filter(c => c.region === 'west-coast-expansion')

export const getFeaturedCities = () => cities.filter(c => c.featured && c.status === 'live')

// Search cities by name or state
export const searchCities = (query: string) =>
  cities.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.state.toLowerCase().includes(query.toLowerCase()) ||
    c.id.includes(query.toLowerCase())
  )

// Legacy exports for compatibility
export const getSupportedCities = getLiveCities
export const getCitiesByRegion = (region: CityRegion) => cities.filter(c => c.region === region)
export const getRegions = (): CityRegion[] => ['california', 'tahoe', 'west-coast-expansion']
