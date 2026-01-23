'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Loader2, X, Navigation, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// TYPES
// ============================================

export interface AddressResult {
  address: string
  lat: number
  lng: number
  placeId: string
  placeName: string
  context?: {
    city?: string
    state?: string
    country?: string
    postcode?: string
  }
}

interface MapboxFeature {
  id: string
  place_name: string
  center: [number, number] // [lng, lat]
  context?: Array<{
    id: string
    text: string
    short_code?: string
  }>
  properties?: {
    address?: string
  }
  text: string
}

interface MapboxResponse {
  features: MapboxFeature[]
}

export interface AddressAutocompleteProps {
  value?: string
  onChange?: (value: string) => void
  onSelect?: (result: AddressResult) => void
  onClear?: () => void
  placeholder?: string
  label?: string
  error?: string
  helper?: string
  required?: boolean
  disabled?: boolean
  className?: string
  showUseMyLocation?: boolean
}

// ============================================
// COMPONENT
// ============================================

export function AddressAutocomplete({
  value = '',
  onChange,
  onSelect,
  onClear,
  placeholder = 'Enter an address...',
  label,
  error,
  helper,
  required,
  disabled,
  className,
  showUseMyLocation = true,
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isGeolocating, setIsGeolocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Get Mapbox token
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  // Sync external value changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false)
        setSuggestions([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions from Mapbox
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 3 || !mapboxToken) {
      setSuggestions([])
      return
    }

    setIsLoading(true)

    try {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
      const params = new URLSearchParams({
        access_token: mapboxToken,
        types: 'address,place,locality,neighborhood',
        limit: '5',
        country: 'us', // Limit to US for now
        autocomplete: 'true',
      })

      const response = await fetch(`${endpoint}?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }

      const data: MapboxResponse = await response.json()
      setSuggestions(data.features || [])
    } catch (err) {
      console.error('Address autocomplete error:', err)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [mapboxToken])

  // Debounced search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
    setSelectedIndex(-1)
    setGeoError(null)

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce API calls
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300)
  }

  // Parse context from Mapbox result
  const parseContext = (feature: MapboxFeature): AddressResult['context'] => {
    const context: AddressResult['context'] = {}

    if (feature.context) {
      for (const ctx of feature.context) {
        if (ctx.id.startsWith('place')) {
          context.city = ctx.text
        } else if (ctx.id.startsWith('region')) {
          context.state = ctx.short_code?.replace('US-', '') || ctx.text
        } else if (ctx.id.startsWith('country')) {
          context.country = ctx.text
        } else if (ctx.id.startsWith('postcode')) {
          context.postcode = ctx.text
        }
      }
    }

    return context
  }

  // Handle selection
  const handleSelect = (feature: MapboxFeature) => {
    const result: AddressResult = {
      address: feature.place_name,
      lat: feature.center[1], // Mapbox returns [lng, lat]
      lng: feature.center[0],
      placeId: feature.id,
      placeName: feature.text,
      context: parseContext(feature),
    }

    setInputValue(feature.place_name)
    onChange?.(feature.place_name)
    onSelect?.(result)
    setSuggestions([])
    setIsFocused(false)
    setSelectedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setSuggestions([])
        setIsFocused(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Use current location
  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }

    setIsGeolocating(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Reverse geocode to get address
          const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`
          const params = new URLSearchParams({
            access_token: mapboxToken || '',
            types: 'address',
            limit: '1',
          })

          const response = await fetch(`${endpoint}?${params}`)
          const data: MapboxResponse = await response.json()

          if (data.features?.[0]) {
            const feature = data.features[0]
            const result: AddressResult = {
              address: feature.place_name,
              lat: latitude,
              lng: longitude,
              placeId: feature.id,
              placeName: feature.text,
              context: parseContext(feature),
            }

            setInputValue(feature.place_name)
            onChange?.(feature.place_name)
            onSelect?.(result)
          } else {
            // No address found, but we have coords
            const result: AddressResult = {
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              lat: latitude,
              lng: longitude,
              placeId: 'current-location',
              placeName: 'Current Location',
            }

            setInputValue('Current Location')
            onChange?.('Current Location')
            onSelect?.(result)
          }
        } catch (err) {
          console.error('Reverse geocode error:', err)
          setGeoError('Could not determine your address')
        } finally {
          setIsGeolocating(false)
        }
      },
      (error) => {
        setIsGeolocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Location access was denied')
            break
          case error.POSITION_UNAVAILABLE:
            setGeoError('Location unavailable')
            break
          case error.TIMEOUT:
            setGeoError('Location request timed out')
            break
          default:
            setGeoError('Could not get your location')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // Clear input
  const handleClear = () => {
    setInputValue('')
    onChange?.('')
    onClear?.()
    setSuggestions([])
    setGeoError(null)
    inputRef.current?.focus()
  }

  const showDropdown = isFocused && (suggestions.length > 0 || isLoading || (showUseMyLocation && !inputValue))

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {isLoading || isGeolocating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isGeolocating}
            className={cn(
              'w-full h-11 pl-10 pr-10 bg-slate-800/50 text-white placeholder-slate-500',
              'border rounded-xl transition-all duration-200 ease-out',
              'focus:outline-none focus:ring-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-white/10 focus:border-cyan-500/50 focus:ring-cyan-500/20 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)]'
            )}
          />

          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl shadow-black/20 overflow-hidden"
          >
            {/* Use My Location option */}
            {showUseMyLocation && !inputValue && !isLoading && (
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isGeolocating}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/5 transition-colors border-b border-white/5"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Use my current location</p>
                  <p className="text-xs text-slate-500">Find your address automatically</p>
                </div>
              </button>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="px-4 py-3 flex items-center gap-3 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            )}

            {/* Suggestions */}
            {!isLoading && suggestions.map((feature, index) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => handleSelect(feature)}
                className={cn(
                  'w-full px-4 py-3 flex items-start gap-3 text-left transition-colors',
                  index === selectedIndex
                    ? 'bg-cyan-500/10'
                    : 'hover:bg-white/5'
                )}
              >
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {feature.text}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {feature.place_name}
                  </p>
                </div>
              </button>
            ))}

            {/* No results */}
            {!isLoading && inputValue.length >= 3 && suggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-500">
                No addresses found. Try a different search.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Geolocation error */}
      {geoError && (
        <div className="mt-2 flex items-center gap-2 text-sm text-amber-400">
          <AlertCircle className="w-4 h-4" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Helper/Error text */}
      {(helper || error) && !geoError && (
        <p className={cn(
          'mt-2 text-sm',
          error ? 'text-red-400' : 'text-slate-500'
        )}>
          {error || helper}
        </p>
      )}
    </div>
  )
}

export default AddressAutocomplete
