'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { getCityById, type City } from '@/lib/cities-data'

// ============================================
// TYPE DEFINITIONS
// ============================================

export type AppMode = 'work' | 'hiring'
export type GeoMode = 'near_me' | 'city'
export type HiringSidebarView = 'job_posts' | 'companies'

export interface GeoState {
  geoMode: GeoMode
  // City mode
  citySlug: string | null
  cityName: string | null
  cityBounds: { north: number; south: number; east: number; west: number } | null
  // Near me mode
  userCoords: { lat: number; lng: number } | null
  radiusMiles: number
}

export interface AppModeState {
  // Core mode
  mode: AppMode

  // Geo/location state
  geo: GeoState

  // Hiring-specific view state
  hiringSidebarView: HiringSidebarView

  // Geolocation status
  locationPermission: 'prompt' | 'granted' | 'denied' | 'loading'
  isRequestingLocation: boolean

  // Actions
  setMode: (mode: AppMode) => void
  setGeoMode: (geoMode: GeoMode) => void
  setCity: (citySlug: string) => void
  clearCity: () => void
  setUserLocation: (coords: { lat: number; lng: number }) => void
  setHiringSidebarView: (view: HiringSidebarView) => void
  setLocationPermission: (permission: 'prompt' | 'granted' | 'denied' | 'loading') => void
  setIsRequestingLocation: (requesting: boolean) => void
  requestGeolocation: () => Promise<{ lat: number; lng: number } | null>

  // Computed helpers
  getMapTitle: () => string
  getCTALabel: () => string
  getModeColor: () => 'cyan' | 'emerald'
}

// ============================================
// DEFAULT VALUES
// ============================================

const DEFAULT_RADIUS_MILES = 20

const DEFAULT_GEO_STATE: GeoState = {
  geoMode: 'city',
  citySlug: null,
  cityName: null,
  cityBounds: null,
  userCoords: null,
  radiusMiles: DEFAULT_RADIUS_MILES,
}

// ============================================
// CONTEXT
// ============================================

const AppModeContext = createContext<AppModeState | null>(null)

export function useAppMode() {
  const context = useContext(AppModeContext)
  if (!context) {
    throw new Error('useAppMode must be used within AppModeProvider')
  }
  return context
}

// ============================================
// HELPER: Calculate city bounds from center
// ============================================
function getCityBounds(lat: number, lng: number, radiusMiles: number = 15) {
  const latDelta = radiusMiles / 69.0
  const lngDelta = radiusMiles / (69.0 * Math.cos((lat * Math.PI) / 180))
  return {
    north: lat + latDelta,
    south: lat - latDelta,
    east: lng + lngDelta,
    west: lng - lngDelta,
  }
}

// ============================================
// PROVIDER
// ============================================

interface AppModeProviderProps {
  children: ReactNode
  initialMode?: AppMode
}

export function AppModeProvider({ children, initialMode }: AppModeProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Core mode state
  const [mode, setModeInternal] = useState<AppMode>(initialMode || 'hiring')

  // Geo state
  const [geo, setGeo] = useState<GeoState>(DEFAULT_GEO_STATE)

  // Hiring-specific view
  const [hiringSidebarView, setHiringSidebarViewInternal] = useState<HiringSidebarView>('job_posts')

  // Location status
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied' | 'loading'>('prompt')
  const [isRequestingLocation, setIsRequestingLocation] = useState(false)

  // ============================================
  // INITIALIZE FROM URL ON MOUNT
  // ============================================
  useEffect(() => {
    const urlMode = searchParams.get('mode')
    const urlGeo = searchParams.get('geo')
    const urlCity = searchParams.get('city')
    const urlView = searchParams.get('view')

    // Parse mode from URL
    if (urlMode === 'work' || urlMode === 'hiring') {
      setModeInternal(urlMode)
    }

    // Parse geo mode and city
    if (urlCity) {
      const city = getCityById(urlCity)
      if (city) {
        setGeo(prev => ({
          ...prev,
          geoMode: 'city',
          citySlug: city.id,
          cityName: city.name,
          cityBounds: getCityBounds(city.lat, city.lng),
        }))
      }
    } else if (urlGeo === 'near_me') {
      setGeo(prev => ({
        ...prev,
        geoMode: 'near_me',
      }))
    }

    // Parse hiring sidebar view
    if (urlView === 'companies') {
      setHiringSidebarViewInternal('companies')
    }
  }, [searchParams])

  // ============================================
  // URL SYNC HELPER
  // ============================================
  const updateURL = useCallback((updates: Record<string, string | null>) => {
    // Only sync URL params on map pages
    if (!pathname?.endsWith('/map')) return

    const params = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })

    const newURL = `${pathname}?${params.toString()}`
    router.replace(newURL, { scroll: false })
  }, [pathname, router, searchParams])

  // ============================================
  // ACTIONS
  // ============================================

  const setMode = useCallback((newMode: AppMode) => {
    setModeInternal(newMode)
    // Reset hiring sidebar view when switching to work mode
    if (newMode === 'work') {
      setHiringSidebarViewInternal('job_posts')
    }
    updateURL({ mode: newMode })
  }, [updateURL])

  const setGeoMode = useCallback((geoMode: GeoMode) => {
    setGeo(prev => ({
      ...prev,
      geoMode,
      // Clear city when switching to near_me
      ...(geoMode === 'near_me' && {
        citySlug: null,
        cityName: null,
        cityBounds: null,
      }),
    }))
    updateURL({
      geo: geoMode,
      city: geoMode === 'near_me' ? null : geo.citySlug,
    })
  }, [geo.citySlug, updateURL])

  const setCity = useCallback((citySlug: string) => {
    const city = getCityById(citySlug)
    if (!city) return

    setGeo(prev => ({
      ...prev,
      geoMode: 'city',
      citySlug: city.id,
      cityName: city.name,
      cityBounds: getCityBounds(city.lat, city.lng),
    }))
    updateURL({ geo: 'city', city: city.id })
  }, [updateURL])

  const clearCity = useCallback(() => {
    setGeo(prev => ({
      ...prev,
      citySlug: null,
      cityName: null,
      cityBounds: null,
    }))
    updateURL({ city: null })
  }, [updateURL])

  const setUserLocation = useCallback((coords: { lat: number; lng: number }) => {
    setGeo(prev => ({
      ...prev,
      userCoords: coords,
    }))
    setLocationPermission('granted')
  }, [])

  const setHiringSidebarView = useCallback((view: HiringSidebarView) => {
    setHiringSidebarViewInternal(view)
    updateURL({ view: view === 'companies' ? 'companies' : null })
  }, [updateURL])

  // ============================================
  // GEOLOCATION REQUEST
  // ============================================
  const requestGeolocation = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    if (!navigator.geolocation) {
      setLocationPermission('denied')
      return null
    }

    setIsRequestingLocation(true)
    setLocationPermission('loading')

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setGeo(prev => ({
            ...prev,
            geoMode: 'near_me',
            userCoords: coords,
          }))
          setLocationPermission('granted')
          setIsRequestingLocation(false)
          resolve(coords)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setLocationPermission('denied')
          setIsRequestingLocation(false)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }, [])

  // ============================================
  // COMPUTED HELPERS
  // ============================================

  const getMapTitle = useCallback(() => {
    if (geo.geoMode === 'city' && geo.cityName) {
      return `Showing: ${geo.cityName}`
    }
    if (geo.geoMode === 'near_me' && geo.userCoords) {
      return 'Showing: Near you'
    }
    return mode === 'work' ? 'Find Jobs' : 'Find Help'
  }, [geo, mode])

  const getCTALabel = useCallback(() => {
    if (mode === 'work') {
      return geo.cityName ? `View jobs in ${geo.cityName}` : 'Find work near me'
    }
    return geo.cityName ? `View help in ${geo.cityName}` : 'Find help near me'
  }, [geo.cityName, mode])

  const getModeColor = useCallback(() => {
    return mode === 'work' ? 'emerald' : 'cyan'
  }, [mode])

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AppModeState = {
    mode,
    geo,
    hiringSidebarView,
    locationPermission,
    isRequestingLocation,
    setMode,
    setGeoMode,
    setCity,
    clearCity,
    setUserLocation,
    setHiringSidebarView,
    setLocationPermission,
    setIsRequestingLocation,
    requestGeolocation,
    getMapTitle,
    getCTALabel,
    getModeColor,
  }

  return (
    <AppModeContext.Provider value={value}>
      {children}
    </AppModeContext.Provider>
  )
}

// ============================================
// LEGACY EXPORTS FOR BACKWARD COMPATIBILITY
// ============================================
export type Mode = AppMode
