'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Navigation, Locate, Plus, Minus, Layers, RefreshCw, MapPin, AlertCircle, Briefcase, Users, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMapStore, useAppModeStore, type UserLocation } from '@/store'

// ============================================
// TYPES
// ============================================
export type { UserLocation }

export type MapMode = 'work' | 'hire'

export interface MapMarker {
  id: string
  latitude: number
  longitude: number
  type: 'job' | 'worker' | 'user'
  category?: string
  title?: string
  price?: string
  urgency?: 'urgent' | 'today' | 'flexible' | 'scheduled'
  element?: HTMLElement
  isActive?: boolean
}

export interface MapboxMapProps {
  className?: string
  markers?: MapMarker[]
  onMarkerClick?: (marker: MapMarker) => void
  onMapMove?: (bounds: mapboxgl.LngLatBounds) => void
  onLocationChange?: (location: UserLocation | null) => void
  onSearchThisArea?: () => void
  initialCenter?: [number, number]
  initialZoom?: number
  showUserLocation?: boolean
  followUser?: boolean
  selectedMarkerId?: string | null
}

// ============================================
// PRIVACY-SAFE COORDINATE GENERALIZATION
// Generalizes coordinates to ~100m radius for privacy
// ============================================
function generalizeCoordinate(lat: number, lng: number): { lat: number; lng: number } {
  // Round to 3 decimal places (~111m precision)
  const generalizedLat = Math.round(lat * 1000) / 1000
  const generalizedLng = Math.round(lng * 1000) / 1000
  // Add small random offset (up to 50m)
  const offsetLat = (Math.random() - 0.5) * 0.001
  const offsetLng = (Math.random() - 0.5) * 0.001
  return {
    lat: generalizedLat + offsetLat,
    lng: generalizedLng + offsetLng,
  }
}

// ============================================
// LIVE DOT COMPONENT
// ============================================
function LiveDot({ className, count }: { className?: string; count?: number }) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
      </span>
      {count !== undefined && (
        <span className="text-xs font-medium text-white">{count}</span>
      )}
    </div>
  )
}

// ============================================
// MODE TOGGLE COMPONENT
// ============================================
function ModeToggle() {
  const { mode, toggleMode } = useAppModeStore()

  return (
    <button
      onClick={toggleMode}
      className="bg-slate-900/90 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden flex"
    >
      <div
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 transition-all',
          mode === 'work'
            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
            : 'text-slate-500 hover:text-slate-300'
        )}
      >
        <Briefcase className="w-4 h-4" />
        <span className="text-xs font-medium">WORK</span>
      </div>
      <div
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 transition-all',
          mode === 'hire'
            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400'
            : 'text-slate-500 hover:text-slate-300'
        )}
      >
        <Users className="w-4 h-4" />
        <span className="text-xs font-medium">HIRE</span>
      </div>
    </button>
  )
}

// ============================================
// MAPBOX MAP COMPONENT
// ============================================
export function MapboxMap({
  className,
  markers = [],
  onMarkerClick,
  onMapMove,
  onLocationChange,
  onSearchThisArea,
  initialCenter,
  initialZoom,
  showUserLocation = true,
  selectedMarkerId,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const userMarker = useRef<mapboxgl.Marker | null>(null)
  const watchId = useRef<number | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())

  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get app mode from store
  const { mode } = useAppModeStore()

  // Get state from centralized store
  const {
    viewport,
    userLocation,
    locationPermission,
    isLocating,
    followMode,
    mapStyle,
    needsRefresh,
    setViewport,
    setBounds,
    setUserLocation,
    setLocationPermission,
    setIsLocating,
    setFollowMode,
    setMapStyle,
    setNeedsRefresh,
    updateLocationAndRecenter,
    recenterToUser,
  } = useMapStore()

  // Use initialCenter/Zoom or store values
  const effectiveCenter = initialCenter || [viewport.center.lng, viewport.center.lat] as [number, number]
  const effectiveZoom = initialZoom || viewport.zoom

  // ============================================
  // CHECK LOCATION PERMISSION
  // ============================================
  const checkLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationPermission('unavailable')
      return
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      setLocationPermission(permission.state as typeof locationPermission)

      permission.addEventListener('change', () => {
        setLocationPermission(permission.state as typeof locationPermission)
      })
    } catch {
      // Fallback for browsers that don't support permissions API
      setLocationPermission('prompt')
    }
  }, [setLocationPermission])

  // ============================================
  // REQUEST LOCATION
  // ============================================
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

        // Use the store action that handles recenter
        updateLocationAndRecenter(location)
        onLocationChange?.(location)

        // Center map on user location
        if (map.current && followMode) {
          map.current.flyTo({
            center: [location.longitude, location.latitude],
            zoom: 15,
            duration: 1500,
          })
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        setIsLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission('denied')
        } else if (error.code === error.TIMEOUT) {
          setError('Location request timed out. Please try again.')
        } else {
          setError('Unable to get your location. Please check your settings.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }, [followMode, onLocationChange, setIsLocating, setLocationPermission, updateLocationAndRecenter])

  // ============================================
  // WATCH USER LOCATION
  // ============================================
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
      (error) => {
        console.error('Watch position error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )
  }, [onLocationChange, setUserLocation])

  const stopWatchingLocation = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current)
      watchId.current = null
    }
  }, [])

  // ============================================
  // INITIALIZE MAP
  // ============================================
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    const isValidToken = token && !token.includes('demo_token') && !token.includes('your_mapbox_token')

    if (!isValidToken) {
      console.warn('Mapbox token not configured. Using demo mode.')
      setIsDemo(true)
      setIsMapLoaded(true)
      checkLocationPermission()
      return
    }

    try {
      mapboxgl.accessToken = token

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle === 'dark' ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/satellite-streets-v12',
        center: effectiveCenter,
        zoom: effectiveZoom,
        pitch: 0,
        bearing: 0,
        antialias: true,
      })

      map.current.on('load', () => {
        setIsMapLoaded(true)
        checkLocationPermission()

        // Add 3D buildings layer
        const layers = map.current!.getStyle().layers
        const labelLayerId = layers?.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id

        if (labelLayerId) {
          map.current!.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': '#1e293b',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.6,
              },
            },
            labelLayerId
          )
        }
      })

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e)
        setError('Failed to load map. Check your Mapbox token.')
        setIsDemo(true)
      })

      // Handle map movement - update store
      map.current.on('moveend', () => {
        if (map.current) {
          const bounds = map.current.getBounds()
          const center = map.current.getCenter()
          const zoom = map.current.getZoom()

          if (bounds) {
            setBounds({
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest(),
            })

            onMapMove?.(bounds)
          }

          // Only update viewport if not following
          if (!followMode) {
            setViewport({
              center: { lat: center.lat, lng: center.lng },
              zoom,
            })
          }

          setNeedsRefresh(true)
        }
      })

      // Disable follow mode on user interaction
      map.current.on('dragstart', () => {
        setFollowMode(false)
      })
    } catch (err) {
      console.error('Failed to initialize Mapbox:', err)
      setIsDemo(true)
      setIsMapLoaded(true)
      checkLocationPermission()
    }

    return () => {
      stopWatchingLocation()
      map.current?.remove()
      map.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // ============================================
  // SYNC MAP STYLE WITH STORE
  // ============================================
  useEffect(() => {
    if (map.current && isMapLoaded && !isDemo) {
      const newStyle = mapStyle === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/satellite-streets-v12'
      map.current.setStyle(newStyle)
    }
  }, [mapStyle, isMapLoaded, isDemo])

  // ============================================
  // SYNC VIEWPORT WITH STORE (for external updates)
  // ============================================
  // Dependencies are intentionally specific to lat/lng/zoom to avoid unnecessary re-renders
  useEffect(() => {
    if (map.current && isMapLoaded && !isDemo) {
      const currentCenter = map.current.getCenter()
      const storeCenter = viewport.center

      // Only fly to if significantly different (avoid feedback loops)
      const distance = Math.sqrt(
        Math.pow(currentCenter.lat - storeCenter.lat, 2) +
        Math.pow(currentCenter.lng - storeCenter.lng, 2)
      )

      if (distance > 0.001) {
        map.current.flyTo({
          center: [storeCenter.lng, storeCenter.lat],
          zoom: viewport.zoom,
          duration: 1000,
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport.center.lat, viewport.center.lng, viewport.zoom, isMapLoaded, isDemo])

  // ============================================
  // AUTO-REQUEST LOCATION ON LOAD
  // ============================================
  useEffect(() => {
    if (isMapLoaded && showUserLocation && locationPermission === 'prompt') {
      requestLocation()
    }
  }, [isMapLoaded, showUserLocation, locationPermission, requestLocation])

  // ============================================
  // START WATCHING AFTER PERMISSION GRANTED
  // ============================================
  useEffect(() => {
    if (locationPermission === 'granted' && showUserLocation) {
      startWatchingLocation()
    }
    return () => {
      stopWatchingLocation()
    }
  }, [locationPermission, showUserLocation, startWatchingLocation, stopWatchingLocation])

  // ============================================
  // UPDATE USER MARKER
  // ============================================
  useEffect(() => {
    if (!map.current || !isMapLoaded || !userLocation || isDemo) return

    // Create or update user marker
    if (!userMarker.current) {
      // Create blue dot marker
      const el = document.createElement('div')
      el.className = 'user-location-marker'
      el.innerHTML = `
        <div class="user-dot-container">
          <div class="user-accuracy-ring"></div>
          <div class="user-dot-pulse"></div>
          <div class="user-dot"></div>
          <div class="user-dot-inner"></div>
        </div>
      `

      userMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([userLocation.longitude, userLocation.latitude])
        .addTo(map.current)
    } else {
      userMarker.current.setLngLat([userLocation.longitude, userLocation.latitude])
    }

    // Update accuracy circle
    const accuracyRadius = userLocation.accuracy / 1000 // Convert to km

    if (map.current.getSource('user-accuracy')) {
      (map.current.getSource('user-accuracy') as mapboxgl.GeoJSONSource).setData({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [userLocation.longitude, userLocation.latitude],
        },
        properties: {
          radius: accuracyRadius,
        },
      })
    } else if (map.current.isStyleLoaded()) {
      map.current.addSource('user-accuracy', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [userLocation.longitude, userLocation.latitude],
          },
          properties: {
            radius: accuracyRadius,
          },
        },
      })

      map.current.addLayer({
        id: 'user-accuracy-circle',
        type: 'circle',
        source: 'user-accuracy',
        paint: {
          'circle-radius': {
            stops: [
              [0, 0],
              [20, accuracyRadius * 1000],
            ],
            base: 2,
          },
          'circle-color': 'rgba(6, 182, 212, 0.15)',
          'circle-stroke-color': 'rgba(6, 182, 212, 0.3)',
          'circle-stroke-width': 1,
        },
      })
    }

    // Follow user if enabled
    if (followMode) {
      map.current.easeTo({
        center: [userLocation.longitude, userLocation.latitude],
        duration: 500,
      })
    }
  }, [userLocation, isMapLoaded, followMode, isDemo])

  // ============================================
  // UPDATE MARKERS
  // ============================================
  useEffect(() => {
    if (!map.current || !isMapLoaded || isDemo) return

    // Remove old markers
    markersRef.current.forEach((marker, id) => {
      if (!markers.find((m) => m.id === id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    })

    // Add/update markers
    markers.forEach((marker) => {
      const isSelected = marker.id === selectedMarkerId
      const isActive = marker.isActive

      if (markersRef.current.has(marker.id)) {
        // Update position
        markersRef.current.get(marker.id)?.setLngLat([marker.longitude, marker.latitude])
      } else {
        // Create new marker with privacy-safe coordinates for display
        const el = document.createElement('div')
        el.className = 'map-marker-wrapper'

        const urgencyColor = {
          urgent: 'bg-red-500',
          today: 'bg-orange-500',
          flexible: 'bg-slate-500',
          scheduled: 'bg-purple-500',
        }[marker.urgency || 'flexible']

        // Different styling for jobs vs workers
        const isJob = marker.type === 'job'
        const markerColor = isJob
          ? (mode === 'work' ? urgencyColor : 'bg-slate-600')
          : (mode === 'hire' ? 'bg-purple-500' : 'bg-slate-600')

        el.innerHTML = `
          <div class="map-marker-container group cursor-pointer ${isSelected ? 'selected' : ''} ${isActive ? 'active' : ''}">
            ${isActive ? '<div class="marker-pulse-halo"></div>' : ''}
            <div class="map-marker-pin ${markerColor} rounded-full w-10 h-10 flex items-center justify-center text-white shadow-lg border-2 ${isSelected ? 'border-cyan-400 scale-125' : 'border-white/20'} transition-transform group-hover:scale-110">
              <span class="text-lg">${getCategoryEmoji(marker.category)}</span>
            </div>
            ${marker.price ? `
              <div class="map-marker-price absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 whitespace-nowrap">
                ${marker.price}
              </div>
            ` : ''}
          </div>
        `

        el.addEventListener('click', () => {
          onMarkerClick?.(marker)
        })

        const mapboxMarker = new mapboxgl.Marker({ element: el })
          .setLngLat([marker.longitude, marker.latitude])
          .addTo(map.current!)

        markersRef.current.set(marker.id, mapboxMarker)
      }
    })
  }, [markers, isMapLoaded, onMarkerClick, isDemo, selectedMarkerId, mode])

  // ============================================
  // RECENTER ON USER
  // ============================================
  const handleRecenterOnUser = useCallback(() => {
    if (!userLocation) {
      requestLocation()
      return
    }

    setFollowMode(true)
    recenterToUser()

    if (map.current && !isDemo) {
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 15,
        duration: 1000,
      })
    }
  }, [userLocation, requestLocation, setFollowMode, recenterToUser, isDemo])

  // ============================================
  // ZOOM CONTROLS
  // ============================================
  const zoomIn = useCallback(() => {
    map.current?.zoomIn({ duration: 300 })
  }, [])

  const zoomOut = useCallback(() => {
    map.current?.zoomOut({ duration: 300 })
  }, [])

  // ============================================
  // TOGGLE MAP STYLE
  // ============================================
  const toggleMapStyle = useCallback(() => {
    setMapStyle(mapStyle === 'dark' ? 'satellite' : 'dark')
  }, [mapStyle, setMapStyle])

  // ============================================
  // SEARCH THIS AREA
  // ============================================
  const handleSearchThisArea = useCallback(() => {
    setNeedsRefresh(false)
    onSearchThisArea?.()
  }, [onSearchThisArea, setNeedsRefresh])

  // ============================================
  // DISMISS ERROR
  // ============================================
  const dismissError = useCallback(() => {
    setError(null)
  }, [])

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Demo Mode / Fallback Map */}
      {isDemo && isMapLoaded && (
        <div className="absolute inset-0 bg-slate-900 overflow-hidden">
          {/* Stylized grid pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-600/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />

          {/* Demo markers with positions */}
          {markers.map((marker) => {
            const isSelected = marker.id === selectedMarkerId
            const isActive = marker.isActive
            // Map lat/lng to percentage positions (roughly SF area)
            const top = Math.max(10, Math.min(80, ((marker.latitude - 37.7) / 0.15) * 100))
            const left = Math.max(10, Math.min(90, ((marker.longitude + 122.5) / 0.15) * 100))

            const urgencyColor = {
              urgent: 'bg-red-500',
              today: 'bg-orange-500',
              flexible: 'bg-slate-500',
              scheduled: 'bg-purple-500',
            }[marker.urgency || 'flexible']

            return (
              <div
                key={marker.id}
                className={cn(
                  'absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110',
                  isSelected && 'scale-125 z-20'
                )}
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                }}
                onClick={() => onMarkerClick?.(marker)}
              >
                <div className="relative">
                  {/* Pulsing halo for active markers */}
                  {isActive && (
                    <div className="absolute inset-0 -m-3 rounded-full bg-cyan-400/30 animate-ping" />
                  )}
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg border-2 transition-all',
                    urgencyColor,
                    isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/50' : 'border-white/20'
                  )}>
                    <span className="text-lg">{getCategoryEmoji(marker.category)}</span>
                  </div>
                  {marker.price && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 whitespace-nowrap">
                      {marker.price}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* User location dot in demo mode */}
          {userLocation && (
            <div
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-30"
              style={{
                top: `${Math.max(10, Math.min(90, ((userLocation.latitude - 37.7) / 0.15) * 100))}%`,
                left: `${Math.max(10, Math.min(90, ((userLocation.longitude + 122.5) / 0.15) * 100))}%`,
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 -m-2 rounded-full bg-cyan-400/30 animate-ping" />
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 border-2 border-white shadow-lg" />
              </div>
            </div>
          )}

          {/* Demo Mode Banner */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-amber-500/20 backdrop-blur-sm text-amber-400 px-4 py-2 rounded-xl text-sm font-medium border border-amber-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>Demo Mode - Add Mapbox token for real maps</span>
            </div>
          </div>
        </div>
      )}

      {/* Location Permission Denied Overlay */}
      {locationPermission === 'denied' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-sm mx-4 border border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Location Access Needed</h3>
            <p className="text-slate-400 text-sm mb-4">
              To find {mode === 'work' ? 'jobs' : 'workers'} near you, we need access to your location. Please enable location services in your browser settings.
            </p>
            <button
              onClick={requestLocation}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => setLocationPermission('prompt')}
              className="w-full py-2 mt-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              Continue Without Location
            </button>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
          <div className="bg-red-500/20 backdrop-blur-sm text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={dismissError} className="ml-2 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Map Controls - Top Left */}
      <div className="absolute left-4 top-4 z-10">
        <ModeToggle />
      </div>

      {/* Map Controls - Top Right */}
      <div className="absolute right-4 top-4 flex items-center gap-2 z-10">
        {/* Jobs/Workers Nearby Badge */}
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 border border-white/10 flex items-center gap-1.5">
          <LiveDot count={markers.length} />
          <span className="text-xs text-slate-400">
            {mode === 'work' ? 'jobs' : 'workers'}
          </span>
        </div>

        {/* Zoom & Location Controls */}
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden flex">
          {!isDemo && (
            <>
              <button
                onClick={zoomIn}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-slate-800 transition-colors border-r border-white/10"
                title="Zoom in"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={zoomOut}
                className="w-7 h-7 flex items-center justify-center text-white hover:bg-slate-800 transition-colors border-r border-white/10"
                title="Zoom out"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={handleRecenterOnUser}
            className={cn(
              'w-7 h-7 flex items-center justify-center transition-all',
              followMode
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-white hover:bg-slate-800'
            )}
            title={followMode ? 'Following your location' : 'Recenter on your location'}
          >
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className={cn('w-3.5 h-3.5', followMode && 'text-cyan-400')} />
            )}
          </button>
        </div>
      </div>

      {/* Search This Area Button */}
      {needsRefresh && !followMode && !isDemo && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={handleSearchThisArea}
            className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium text-sm shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Search this area
          </button>
        </div>
      )}

      {/* CSS for markers */}
      <style jsx global>{`
        .user-location-marker {
          width: 40px;
          height: 40px;
        }

        .user-dot-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-accuracy-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.15);
          border: 1px solid rgba(6, 182, 212, 0.3);
        }

        .user-dot-pulse {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.4);
          animation: pulse-ring 2s ease-out infinite;
        }

        .user-dot {
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(6, 182, 212, 0.5);
        }

        .user-dot-inner {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
        }

        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }

        .map-marker-wrapper {
          z-index: 1;
        }

        .map-marker-wrapper:hover {
          z-index: 10;
        }

        .map-marker-container {
          position: relative;
        }

        .map-marker-container.selected {
          z-index: 20;
        }

        .marker-pulse-halo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(6, 182, 212, 0.2);
          animation: marker-halo-pulse 2s ease-out infinite;
        }

        @keyframes marker-halo-pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        .mapboxgl-ctrl-logo,
        .mapboxgl-ctrl-attrib {
          opacity: 0.5;
        }

        .mapboxgl-ctrl-attrib a {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  )
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
    // Worker categories
    cleaner: '🧹',
    mover: '📦',
    carpenter: '🔧',
    gardener: '🌱',
    techsupport: '💻',
  }
  return emojiMap[category || ''] || '📋'
}

export default MapboxMap
