export const MAPBOX_CONFIG = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
  style: 'mapbox://styles/mapbox/dark-v11',
  defaultCenter: [-98.5795, 39.8283] as [number, number], // Center of US
  defaultZoom: 4,
  minZoom: 2,
  maxZoom: 18,
  clusterRadius: 50,
  clusterMaxZoom: 14,
  markerColor: '#0ea5e9', // brand-500
  selectedMarkerColor: '#e67e3d', // accent-500
  geocodingEndpoint: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
} as const
