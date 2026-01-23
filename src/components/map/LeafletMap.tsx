'use client'

import { useEffect, useRef, useState, useCallback, useImperativeHandle } from 'react'
import { Navigation, Plus, Minus, RefreshCw, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMapStore, useAppModeStore } from '@/store'

// ============================================
// TYPES
// ============================================
export interface UserLocation {
  latitude: number
  longitude: number
  accuracy: number
  heading?: number | null
  timestamp?: number
}

export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  type: 'job' | 'worker' | 'user'
  category?: string
  title?: string
  price?: string
  urgency?: 'urgent' | 'today' | 'flexible' | 'scheduled'
  isActive?: boolean
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface LeafletMapProps {
  className?: string
  markers?: MapMarker[]
  onMarkerClick?: (marker: MapMarker) => void
  onMapMove?: (bounds: MapBounds) => void
  onLocationChange?: (location: UserLocation | null) => void
  onSearchThisArea?: () => void
  initialCenter?: { lat: number; lng: number }
  initialZoom?: number
  /** Initial bounds to fit the map to (e.g., city bounds). Takes precedence over initialCenter/initialZoom */
  initialBounds?: MapBounds | null
  showUserLocation?: boolean
  selectedMarkerId?: string | null
  /** Ref to expose map control methods */
  mapRef?: React.MutableRefObject<LeafletMapHandle | null>
}

export interface LeafletMapHandle {
  flyToLocation: (lat: number, lng: number, zoom?: number) => void
  flyToWithAnimation: (lat: number, lng: number) => void
  fitToBounds: (bounds: MapBounds, animate?: boolean) => void
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getCategoryEmoji(category?: string): string {
  const emojiMap: Record<string, string> = {
    cleaning: '🧹',
    moving: '📦',
    handyman: '🔧',
    yard: '🌱',
    assembly: '🪑',
    events: '🎉',
    tech: '💻',
    petcare: '🐕',
    errands: '🛒',
  }
  return emojiMap[category || ''] || '📋'
}

// ============================================
// LIVE DOT COMPONENT (Mode-aware)
// ============================================
function LiveDot({
  className,
  count,
  variant = 'cyan'
}: {
  className?: string
  count?: number
  variant?: 'cyan' | 'emerald'
}) {
  const colors = variant === 'emerald'
    ? { ping: 'bg-emerald-400', dot: 'bg-emerald-500' }
    : { ping: 'bg-cyan-400', dot: 'bg-cyan-500' }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex h-3 w-3">
        <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', colors.ping)} />
        <span className={cn('relative inline-flex rounded-full h-3 w-3', colors.dot)} />
      </span>
      {count !== undefined && (
        <span className="text-sm font-medium text-white">{count} nearby</span>
      )}
    </div>
  )
}


// ============================================
// LEAFLET MAP COMPONENT
// ============================================
export function LeafletMap({
  className,
  markers = [],
  onMarkerClick,
  onMapMove,
  onLocationChange,
  onSearchThisArea,
  initialCenter,
  initialZoom,
  initialBounds,
  showUserLocation = true,
  selectedMarkerId,
  mapRef: externalMapRef,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const watchId = useRef<number | null>(null)

  const [isMapReady, setIsMapReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [L, setL] = useState<typeof import('leaflet') | null>(null)

  // Get app mode from store
  const { mode } = useAppModeStore()

  // Get state from centralized store
  const {
    userLocation,
    locationPermission,
    isLocating,
    followMode,
    needsRefresh,
    setUserLocation,
    setLocationPermission,
    setIsLocating,
    setFollowMode,
    setNeedsRefresh,
    updateLocationAndRecenter,
    recenterToUser,
  } = useMapStore()

  const defaultCenter = initialCenter || { lat: 37.7749, lng: -122.4194 }
  // City-level default zoom (12) shows ~20 mile radius - Uber-like home screen view
  const defaultZoom = initialZoom || 12
  // Neighborhood-level zoom for detail view when selecting a specific job
  const detailZoom = 15

  // ============================================
  // LOAD LEAFLET (CLIENT-SIDE ONLY)
  // ============================================
  useEffect(() => {
    const loadLeaflet = async () => {
      const leaflet = await import('leaflet')
      // @ts-ignore - CSS import for leaflet styles
      await import('leaflet/dist/leaflet.css')
      setL(leaflet.default)
    }
    loadLeaflet()
  }, [])

  // ============================================
  // INITIALIZE MAP
  // ============================================
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return

    // Create map with initial view
    // If initialBounds provided, we'll fit to those after creation
    const map = L.map(mapContainerRef.current, {
      center: [defaultCenter.lat, defaultCenter.lng],
      zoom: defaultZoom,
      zoomControl: false, // We'll add custom controls
    })

    // If we have initial bounds (city lock), fit to them
    if (initialBounds) {
      const bounds = L.latLngBounds(
        [initialBounds.south, initialBounds.west],
        [initialBounds.north, initialBounds.east]
      )
      map.fitBounds(bounds, {
        padding: [40, 40],
        animate: false, // No animation on initial load
      })
    }

    // Add OpenStreetMap tiles with dark style (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map)

    // Create markers layer
    markersLayerRef.current = L.layerGroup().addTo(map)

    // Handle map movement
    map.on('moveend', () => {
      const bounds = map.getBounds()
      onMapMove?.({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      })
      setNeedsRefresh(true)
    })

    map.on('dragstart', () => {
      setFollowMode(false)
    })

    mapRef.current = map
    setIsMapReady(true)

    // Request location
    if (showUserLocation) {
      requestLocation()
    }

    return () => {
      stopWatchingLocation()
      map.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L])

  // ============================================
  // LOCATION FUNCTIONS
  // ============================================
  // userLocation intentionally excluded - we check current value at call time, not callback creation
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationPermission('unavailable')
      return
    }

    setIsLocating(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          timestamp: Date.now(),
        }

        updateLocationAndRecenter(location)
        onLocationChange?.(location)

        // On initial load, use city-level zoom (12) to show metro area context
        // This provides an Uber-like home screen view with jobs in ~20 mile radius
        if (mapRef.current) {
          const isInitialLoad = !userLocation
          const zoomLevel = isInitialLoad ? 12 : (followMode ? detailZoom : mapRef.current.getZoom())
          mapRef.current.setView([location.latitude, location.longitude], zoomLevel, {
            animate: true,
          })
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        setIsLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationPermission('denied')
        } else {
          setError('Unable to get your location.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followMode, onLocationChange, setIsLocating, setLocationPermission, updateLocationAndRecenter])

  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation || watchId.current !== null) return

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          timestamp: Date.now(),
        }
        setUserLocation(location)
        onLocationChange?.(location)
      },
      (err) => console.error('Watch position error:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
  }, [onLocationChange, setUserLocation])

  const stopWatchingLocation = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }, [])

  // Start watching after permission granted
  useEffect(() => {
    if (locationPermission === 'granted' && showUserLocation) {
      startWatchingLocation()
    }
    return () => stopWatchingLocation()
  }, [locationPermission, showUserLocation, startWatchingLocation, stopWatchingLocation])

  // ============================================
  // UPDATE MARKERS
  // ============================================
  useEffect(() => {
    if (!L || !mapRef.current || !markersLayerRef.current || !isMapReady) return

    // Clear existing markers
    markersLayerRef.current.clearLayers()

    // Add new markers
    markers.forEach((marker) => {
      const isSelected = marker.id === selectedMarkerId
      const isWorkMode = mode === 'work'

      // Mode-aware color palettes
      // Work mode: Emerald/teal tones (jobs to find)
      // Hiring mode: Cyan/blue tones (workers/companies to hire)
      const workModeColors = {
        urgent: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', glow: 'rgba(239, 68, 68, 0.4)', ring: '#10b981', price: '#10b981' },
        today: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', glow: 'rgba(16, 185, 129, 0.4)', ring: '#10b981', price: '#10b981' },
        flexible: { bg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', glow: 'rgba(20, 184, 166, 0.4)', ring: '#14b8a6', price: '#14b8a6' },
        scheduled: { bg: 'linear-gradient(135deg, #059669 0%, #047857 100%)', glow: 'rgba(5, 150, 105, 0.4)', ring: '#059669', price: '#059669' },
      }
      const hireModeColors = {
        urgent: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', glow: 'rgba(239, 68, 68, 0.4)', ring: '#06b6d4', price: '#06b6d4' },
        today: { bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', glow: 'rgba(6, 182, 212, 0.4)', ring: '#06b6d4', price: '#06b6d4' },
        flexible: { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', glow: 'rgba(59, 130, 246, 0.4)', ring: '#3b82f6', price: '#3b82f6' },
        scheduled: { bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', glow: 'rgba(139, 92, 246, 0.4)', ring: '#8b5cf6', price: '#8b5cf6' },
      }
      const colorPalette = isWorkMode ? workModeColors : hireModeColors
      const colors = colorPalette[marker.urgency || 'flexible']

      // Ring color for selected state depends on mode
      const ringColor = isWorkMode ? '#10b981' : '#06b6d4'
      const priceColor = colors.price

      // Create custom icon with premium CrewLink styling
      const iconHtml = `
        <div class="relative ${isSelected ? 'scale-110' : ''}" style="transition: transform 0.2s ease-out;">
          ${isSelected ? `<div class="absolute inset-0 -m-2 rounded-full animate-ping" style="background: ${colors.glow};"></div>` : ''}
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl" style="background: ${colors.bg}; box-shadow: 0 4px 20px ${colors.glow};${isSelected ? ` outline: 2px solid ${ringColor}; outline-offset: 2px;` : ''}">
            <span style="font-size: 18px;">${getCategoryEmoji(marker.category)}</span>
          </div>
          ${marker.price ? `
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900/95 text-[10px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap backdrop-blur-sm shadow-lg" style="color: ${priceColor}; border-color: ${priceColor}33;">
              ${marker.price}
            </div>
          ` : ''}
        </div>
      `

      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-marker',
        iconSize: [40, 50],
        iconAnchor: [20, 40],
      })

      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon })
        .on('click', () => onMarkerClick?.(marker))

      markersLayerRef.current?.addLayer(leafletMarker)
    })
  }, [L, markers, isMapReady, selectedMarkerId, onMarkerClick, mode])

  // ============================================
  // UPDATE USER MARKER
  // ============================================
  useEffect(() => {
    if (!L || !mapRef.current || !userLocation || !isMapReady) return

    // Remove existing user marker
    if (userMarkerRef.current) {
      mapRef.current.removeLayer(userMarkerRef.current)
    }

    // Create user location marker - mode-aware colors
    const isWorkMode = mode === 'work'
    const userMarkerColors = isWorkMode
      ? { bg: 'from-emerald-400 to-teal-500', ring: 'bg-emerald-400/20 border-emerald-400/30', ping: 'bg-emerald-400/30' }
      : { bg: 'from-cyan-400 to-blue-500', ring: 'bg-cyan-400/20 border-cyan-400/30', ping: 'bg-cyan-400/30' }

    const userIcon = L.divIcon({
      html: `
        <div class="relative">
          <div class="absolute inset-0 -m-4 rounded-full ${userMarkerColors.ring}"></div>
          <div class="absolute inset-0 -m-2 rounded-full ${userMarkerColors.ping} animate-ping"></div>
          <div class="w-4 h-4 rounded-full bg-gradient-to-br ${userMarkerColors.bg} border-2 border-white shadow-lg"></div>
        </div>
      `,
      className: 'user-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    })

    userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
      .addTo(mapRef.current)

    // Follow user if enabled - maintain current zoom level
    if (followMode) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], mapRef.current.getZoom(), {
        animate: true,
        duration: 0.3,
      })
    }
  }, [L, userLocation, isMapReady, followMode, mode])

  // ============================================
  // CONTROL HANDLERS
  // ============================================
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn()
  }, [])

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut()
  }, [])

  const handleRecenter = useCallback(() => {
    if (!userLocation) {
      requestLocation()
      return
    }

    setFollowMode(true)
    recenterToUser()

    // Recenter to user at city level zoom (shows metro area context)
    if (mapRef.current) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 12, {
        animate: true,
        duration: 0.5,
      })
    }
  }, [userLocation, requestLocation, setFollowMode, recenterToUser])

  const handleSearchThisArea = useCallback(() => {
    setNeedsRefresh(false)
    onSearchThisArea?.()
  }, [onSearchThisArea, setNeedsRefresh])

  const dismissError = useCallback(() => setError(null), [])

  // ============================================
  // PREMIUM FLY-TO ANIMATION (Cinematic / Uber-like)
  // ============================================
  const flyToLocation = useCallback((lat: number, lng: number, zoom?: number) => {
    if (!mapRef.current) return
    mapRef.current.flyTo([lat, lng], zoom || 15, {
      duration: 1.2,
      easeLinearity: 0.1,
    })
    setFollowMode(false)
  }, [setFollowMode])

  // Fit to bounds (for city lock behavior)
  const fitToBounds = useCallback((bounds: MapBounds, animate: boolean = true) => {
    if (!mapRef.current || !L) return

    const leafletBounds = L.latLngBounds(
      [bounds.south, bounds.west],
      [bounds.north, bounds.east]
    )

    if (animate) {
      mapRef.current.flyToBounds(leafletBounds, {
        padding: [40, 40],
        duration: 1.0,
        easeLinearity: 0.15,
      })
    } else {
      mapRef.current.fitBounds(leafletBounds, {
        padding: [40, 40],
      })
    }

    setFollowMode(false)
  }, [L, setFollowMode])

  // Premium multi-step animation: smooth cinematic camera movement
  const flyToWithAnimation = useCallback((lat: number, lng: number) => {
    if (!mapRef.current || !L) return

    const map = mapRef.current
    const currentZoom = map.getZoom()
    const currentCenter = map.getCenter()
    const targetZoom = 15

    // Calculate distance to determine animation style
    const distance = map.distance(currentCenter, L.latLng(lat, lng))

    setFollowMode(false)

    if (distance < 500) {
      // Very close by - gentle ease
      map.flyTo([lat, lng], targetZoom, {
        duration: 0.8,
        easeLinearity: 0.1,
      })
    } else if (distance < 3000) {
      // Close by - smooth cinematic fly
      map.flyTo([lat, lng], targetZoom, {
        duration: 1.2,
        easeLinearity: 0.1,
      })
    } else if (distance < 10000) {
      // Medium distance - premium smooth fly with slight zoom out
      const midZoom = Math.max(targetZoom - 1, currentZoom - 1)

      map.flyTo([lat, lng], midZoom, {
        duration: 1.0,
        easeLinearity: 0.15,
      })

      // Gentle zoom in to final position
      setTimeout(() => {
        map.flyTo([lat, lng], targetZoom, {
          duration: 0.6,
          easeLinearity: 0.1,
        })
      }, 900)
    } else {
      // Far away - cinematic zoom out, pan, zoom in
      const midZoom = Math.min(currentZoom - 2, 11)

      // Step 1: Zoom out smoothly
      map.flyTo([currentCenter.lat, currentCenter.lng], midZoom, {
        duration: 0.6,
        easeLinearity: 0.2,
      })

      // Step 2: Pan to target location
      setTimeout(() => {
        map.flyTo([lat, lng], midZoom, {
          duration: 0.8,
          easeLinearity: 0.15,
        })
      }, 550)

      // Step 3: Zoom in to detail view
      setTimeout(() => {
        map.flyTo([lat, lng], targetZoom, {
          duration: 0.7,
          easeLinearity: 0.1,
        })
      }, 1250)
    }
  }, [L, setFollowMode])

  // Expose methods via ref
  useImperativeHandle(externalMapRef, () => ({
    flyToLocation,
    flyToWithAnimation,
    fitToBounds,
  }), [flyToLocation, flyToWithAnimation, fitToBounds])

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* Loading State */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Location Permission Denied Overlay */}
      {locationPermission === 'denied' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-sm mx-4 border border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Location Access Needed</h3>
            <p className="text-slate-400 text-sm mb-4">
              To find {mode === 'work' ? 'jobs' : 'workers'} near you, we need access to your location.
            </p>
            <button
              onClick={requestLocation}
              className={cn(
                'w-full py-3 text-white font-semibold rounded-xl',
                mode === 'work'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600'
              )}
            >
              Try Again
            </button>
            <button
              onClick={() => setLocationPermission('prompt')}
              className="w-full py-2 mt-2 text-slate-400 hover:text-white text-sm"
            >
              Continue Without Location
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-red-500/20 backdrop-blur-sm text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={dismissError} className="ml-2 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Map Controls - Top Right - Horizontal layout */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 z-20">
        {/* Jobs/Workers Nearby Badge */}
        <div className={cn(
          'bg-slate-900/90 backdrop-blur-xl rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg shadow-black/20',
          mode === 'work' ? 'border border-emerald-500/20' : 'border border-cyan-500/10'
        )}>
          <LiveDot count={markers.length} variant={mode === 'work' ? 'emerald' : 'cyan'} />
          <span className="text-[10px] text-slate-400">
            {mode === 'work' ? 'jobs' : 'workers'}
          </span>
        </div>

        {/* Zoom & Location Controls - Horizontal */}
        <div className={cn(
          'bg-slate-900/90 backdrop-blur-xl rounded-lg overflow-hidden shadow-lg shadow-black/20 flex',
          mode === 'work' ? 'border border-emerald-500/20' : 'border border-cyan-500/10'
        )}>
          <button
            onClick={handleZoomIn}
            className={cn(
              'w-7 h-7 flex items-center justify-center transition-all duration-200 border-r border-white/5',
              mode === 'work' ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10'
            )}
            style={{ touchAction: 'manipulation' }}
            aria-label="Zoom in"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className={cn(
              'w-7 h-7 flex items-center justify-center transition-all duration-200 border-r border-white/5',
              mode === 'work' ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10'
            )}
            style={{ touchAction: 'manipulation' }}
            aria-label="Zoom out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRecenter}
            className={cn(
              'w-7 h-7 flex items-center justify-center transition-all duration-200',
              followMode
                ? (mode === 'work' ? 'text-emerald-400 bg-emerald-500/10' : 'text-cyan-400 bg-cyan-500/10')
                : (mode === 'work' ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10')
            )}
            style={{ touchAction: 'manipulation' }}
            aria-label="Recenter map"
            data-qa="map-recenter"
          >
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Search This Area Button - Premium glass style, mode-aware */}
      {needsRefresh && !followMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={handleSearchThisArea}
            className={cn(
              'bg-slate-900/90 backdrop-blur-xl text-white px-4 py-2 rounded-full font-medium text-sm shadow-lg shadow-black/20 transition-all duration-200 flex items-center gap-2',
              mode === 'work'
                ? 'border border-emerald-500/20 hover:bg-slate-800 hover:border-emerald-500/40'
                : 'border border-cyan-500/20 hover:bg-slate-800 hover:border-cyan-500/40'
            )}
          >
            <RefreshCw className={cn(
              'w-3.5 h-3.5',
              mode === 'work' ? 'text-emerald-400' : 'text-cyan-400'
            )} />
            Search this area
          </button>
        </div>
      )}

      {/* Custom styles for Leaflet */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .user-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: #0f172a;
          font-family: inherit;
        }
        .leaflet-control-attribution {
          background: rgba(15, 23, 42, 0.8) !important;
          color: rgba(148, 163, 184, 0.6) !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: rgba(6, 182, 212, 0.6) !important;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  )
}

export default LeafletMap
