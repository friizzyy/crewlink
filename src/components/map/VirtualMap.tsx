'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Navigation, Plus, Minus, Layers, RefreshCw, AlertCircle, Briefcase, Users, X, Locate } from 'lucide-react'
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

export interface VirtualMapProps {
  className?: string
  markers?: MapMarker[]
  onMarkerClick?: (marker: MapMarker) => void
  onMapMove?: (bounds: { north: number; south: number; east: number; west: number }) => void
  onLocationChange?: (location: UserLocation | null) => void
  onSearchThisArea?: () => void
  initialCenter?: { lat: number; lng: number }
  initialZoom?: number
  showUserLocation?: boolean
  selectedMarkerId?: string | null
}

// ============================================
// CONSTANTS
// ============================================
const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 } // San Francisco
const DEFAULT_ZOOM = 12
const MIN_ZOOM = 8
const MAX_ZOOM = 18

// Map tile style - creates a stylized grid that looks like a map
const GRID_COLORS = {
  background: '#0f172a', // slate-900
  gridMajor: 'rgba(6, 182, 212, 0.08)',
  gridMinor: 'rgba(6, 182, 212, 0.03)',
  road: 'rgba(100, 116, 139, 0.15)',
  water: 'rgba(6, 182, 212, 0.05)',
  park: 'rgba(34, 197, 94, 0.05)',
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
    cleaner: '🧹',
    mover: '📦',
    carpenter: '🔧',
    gardener: '🌱',
    techsupport: '💻',
  }
  return emojiMap[category || ''] || '📋'
}

// Convert lat/lng to pixel position relative to map center
function latLngToPixel(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number,
  zoom: number,
  mapWidth: number,
  mapHeight: number
): { x: number; y: number } {
  const scale = Math.pow(2, zoom) * 256 / 360
  const x = (lng - centerLng) * scale + mapWidth / 2
  const y = (centerLat - lat) * scale * Math.cos((centerLat * Math.PI) / 180) + mapHeight / 2
  return { x, y }
}

// ============================================
// LIVE DOT COMPONENT
// ============================================
function LiveDot({ className, count }: { className?: string; count?: number }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
      </span>
      {count !== undefined && (
        <span className="text-sm font-medium text-white">{count} nearby</span>
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
// VIRTUAL MAP COMPONENT
// ============================================
export function VirtualMap({
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
}: VirtualMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const watchId = useRef<number | null>(null)

  const [mapSize, setMapSize] = useState({ width: 800, height: 600 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
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
    needsRefresh,
    setViewport,
    setBounds,
    setUserLocation,
    setLocationPermission,
    setIsLocating,
    setFollowMode,
    setNeedsRefresh,
    updateLocationAndRecenter,
    recenterToUser,
  } = useMapStore()

  // Local map state
  const [center, setCenter] = useState(initialCenter || DEFAULT_CENTER)
  const [zoom, setZoom] = useState(initialZoom || DEFAULT_ZOOM)

  // ============================================
  // RESIZE OBSERVER
  // ============================================
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMapSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // ============================================
  // DRAW MAP
  // ============================================
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = mapSize.width
    canvas.height = mapSize.height

    // Clear canvas
    ctx.fillStyle = GRID_COLORS.background
    ctx.fillRect(0, 0, mapSize.width, mapSize.height)

    // Calculate grid size based on zoom
    const gridSize = Math.pow(2, zoom - 10) * 50

    // Draw minor grid
    ctx.strokeStyle = GRID_COLORS.gridMinor
    ctx.lineWidth = 1
    const minorGridSize = gridSize / 4

    for (let x = 0; x < mapSize.width; x += minorGridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, mapSize.height)
      ctx.stroke()
    }
    for (let y = 0; y < mapSize.height; y += minorGridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(mapSize.width, y)
      ctx.stroke()
    }

    // Draw major grid
    ctx.strokeStyle = GRID_COLORS.gridMajor
    ctx.lineWidth = 1

    for (let x = 0; x < mapSize.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, mapSize.height)
      ctx.stroke()
    }
    for (let y = 0; y < mapSize.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(mapSize.width, y)
      ctx.stroke()
    }

    // Draw some "roads" (random lines based on center position)
    ctx.strokeStyle = GRID_COLORS.road
    ctx.lineWidth = 2

    // Horizontal roads
    const roadSeed = Math.floor(center.lat * 100) + Math.floor(center.lng * 100)
    for (let i = 0; i < 5; i++) {
      const y = ((roadSeed * (i + 1) * 137) % mapSize.height)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(mapSize.width, y)
      ctx.stroke()
    }

    // Vertical roads
    for (let i = 0; i < 5; i++) {
      const x = ((roadSeed * (i + 1) * 97) % mapSize.width)
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, mapSize.height)
      ctx.stroke()
    }

    // Draw some "parks" (green rectangles)
    ctx.fillStyle = GRID_COLORS.park
    for (let i = 0; i < 3; i++) {
      const x = ((roadSeed * (i + 2) * 67) % (mapSize.width - 100))
      const y = ((roadSeed * (i + 3) * 89) % (mapSize.height - 80))
      const w = 60 + ((roadSeed * i) % 80)
      const h = 40 + ((roadSeed * i) % 60)
      ctx.fillRect(x, y, w, h)
    }

    // Draw gradient overlays for depth
    const gradient1 = ctx.createRadialGradient(
      mapSize.width * 0.25, mapSize.height * 0.25, 0,
      mapSize.width * 0.25, mapSize.height * 0.25, mapSize.width * 0.5
    )
    gradient1.addColorStop(0, 'rgba(6, 182, 212, 0.08)')
    gradient1.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient1
    ctx.fillRect(0, 0, mapSize.width, mapSize.height)

    const gradient2 = ctx.createRadialGradient(
      mapSize.width * 0.75, mapSize.height * 0.75, 0,
      mapSize.width * 0.75, mapSize.height * 0.75, mapSize.width * 0.5
    )
    gradient2.addColorStop(0, 'rgba(37, 99, 235, 0.06)')
    gradient2.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient2
    ctx.fillRect(0, 0, mapSize.width, mapSize.height)

  }, [mapSize, center, zoom])

  // ============================================
  // CALCULATE BOUNDS
  // ============================================
  const calculateBounds = useCallback(() => {
    const latRange = 180 / Math.pow(2, zoom)
    const lngRange = 360 / Math.pow(2, zoom) * (mapSize.width / mapSize.height)

    return {
      north: center.lat + latRange / 2,
      south: center.lat - latRange / 2,
      east: center.lng + lngRange / 2,
      west: center.lng - lngRange / 2,
    }
  }, [center, zoom, mapSize])

  // ============================================
  // LOCATION FUNCTIONS
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

        updateLocationAndRecenter(location)
        onLocationChange?.(location)

        // Center map on user location
        if (followMode) {
          setCenter({ lat: location.latitude, lng: location.longitude })
          setZoom(15)
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
        setIsLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationPermission('denied')
        } else {
          setError('Unable to get your location. Please try again.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
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
      (err) => {
        console.error('Watch position error:', err)
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
  // AUTO-REQUEST LOCATION
  // ============================================
  useEffect(() => {
    if (showUserLocation && locationPermission === 'prompt') {
      requestLocation()
    }
  }, [showUserLocation, locationPermission, requestLocation])

  useEffect(() => {
    if (locationPermission === 'granted' && showUserLocation) {
      startWatchingLocation()
    }
    return () => stopWatchingLocation()
  }, [locationPermission, showUserLocation, startWatchingLocation, stopWatchingLocation])

  // ============================================
  // MOUSE HANDLERS
  // ============================================
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setFollowMode(false)
  }, [setFollowMode])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return

    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y

    const scale = 360 / Math.pow(2, zoom) / mapSize.width
    const newLng = center.lng - dx * scale
    const newLat = center.lat + dy * scale * Math.cos((center.lat * Math.PI) / 180)

    setCenter({ lat: newLat, lng: newLng })
    setDragStart({ x: e.clientX, y: e.clientY })
  }, [isDragging, dragStart, center, zoom, mapSize])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      setNeedsRefresh(true)
      const bounds = calculateBounds()
      setBounds(bounds)
      onMapMove?.(bounds)
    }
  }, [isDragging, calculateBounds, setBounds, setNeedsRefresh, onMapMove])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.5 : 0.5
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta))
    setZoom(newZoom)
    setFollowMode(false)
    setNeedsRefresh(true)
  }, [zoom, setFollowMode, setNeedsRefresh])

  // ============================================
  // CONTROL HANDLERS
  // ============================================
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + 1))
    setNeedsRefresh(true)
  }, [setNeedsRefresh])

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - 1))
    setNeedsRefresh(true)
  }, [setNeedsRefresh])

  const handleRecenter = useCallback(() => {
    if (!userLocation) {
      requestLocation()
      return
    }

    setFollowMode(true)
    setCenter({ lat: userLocation.latitude, lng: userLocation.longitude })
    setZoom(15)
    recenterToUser()
  }, [userLocation, requestLocation, setFollowMode, recenterToUser])

  const handleSearchThisArea = useCallback(() => {
    setNeedsRefresh(false)
    onSearchThisArea?.()
  }, [onSearchThisArea, setNeedsRefresh])

  const dismissError = useCallback(() => {
    setError(null)
  }, [])

  // ============================================
  // MARKER POSITIONS
  // ============================================
  const markerPositions = useMemo(() => {
    return markers.map((marker) => {
      const pos = latLngToPixel(
        marker.latitude,
        marker.longitude,
        center.lat,
        center.lng,
        zoom,
        mapSize.width,
        mapSize.height
      )
      return { ...marker, x: pos.x, y: pos.y }
    })
  }, [markers, center, zoom, mapSize])

  const userMarkerPosition = useMemo(() => {
    if (!userLocation) return null
    return latLngToPixel(
      userLocation.latitude,
      userLocation.longitude,
      center.lat,
      center.lng,
      zoom,
      mapSize.width,
      mapSize.height
    )
  }, [userLocation, center, zoom, mapSize])

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {/* Map Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Canvas for map background */}
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* Markers */}
        {markerPositions.map((marker) => {
          const isSelected = marker.id === selectedMarkerId
          const isActive = marker.isActive
          const isVisible = marker.x > -50 && marker.x < mapSize.width + 50 &&
                           marker.y > -50 && marker.y < mapSize.height + 50

          if (!isVisible) return null

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
                'absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 hover:z-20',
                isSelected && 'scale-125 z-30'
              )}
              style={{ left: marker.x, top: marker.y }}
              onClick={(e) => {
                e.stopPropagation()
                onMarkerClick?.(marker)
              }}
            >
              <div className="relative">
                {/* Pulsing halo for active markers */}
                {isActive && (
                  <div className="absolute inset-0 -m-3 rounded-full bg-cyan-400/30 animate-ping" />
                )}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg border-2 transition-all',
                    urgencyColor,
                    isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-cyan-500/30' : 'border-white/20'
                  )}
                >
                  <span className="text-lg">{getCategoryEmoji(marker.category)}</span>
                </div>
                {marker.price && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900 text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 whitespace-nowrap shadow-lg">
                    {marker.price}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* User Location Marker */}
        {userMarkerPosition && showUserLocation && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
            style={{ left: userMarkerPosition.x, top: userMarkerPosition.y }}
          >
            <div className="relative">
              {/* Accuracy ring */}
              <div className="absolute inset-0 -m-4 rounded-full bg-cyan-400/10 border border-cyan-400/20" />
              {/* Pulse ring */}
              <div className="absolute inset-0 -m-2 rounded-full bg-cyan-400/30 animate-ping" />
              {/* Dot */}
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 border-2 border-white shadow-lg shadow-cyan-500/50" />
            </div>
          </div>
        )}
      </div>

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

      {/* Map Controls - Top Left */}
      <div className="absolute left-4 top-4 z-20">
        <ModeToggle />
      </div>

      {/* Map Controls - Top Right */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 z-20">
        {/* Jobs/Workers Nearby Badge */}
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 flex items-center gap-2">
          <LiveDot count={markers.length} />
          <span className="text-sm text-slate-400">
            {mode === 'work' ? 'jobs' : 'workers'}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-slate-800 transition-colors border-b border-white/10"
            title="Zoom in"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
            title="Zoom out"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>

        {/* Recenter Button */}
        <button
          onClick={handleRecenter}
          className={cn(
            'w-10 h-10 rounded-xl border flex items-center justify-center transition-all',
            followMode
              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
              : 'bg-slate-900/90 backdrop-blur-sm border-white/10 text-white hover:bg-slate-800'
          )}
          title={followMode ? 'Following your location' : 'Recenter on your location'}
        >
          {isLocating ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Navigation className={cn('w-5 h-5', followMode && 'text-cyan-400')} />
          )}
        </button>
      </div>

      {/* Search This Area Button */}
      {needsRefresh && !followMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={handleSearchThisArea}
            className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium text-sm shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Search this area
          </button>
        </div>
      )}

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10 text-xs text-slate-400">
          Zoom: {zoom.toFixed(1)}x
        </div>
      </div>
    </div>
  )
}

export default VirtualMap
