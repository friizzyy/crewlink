export const LEAFLET_CONFIG = {
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  darkTileUrl:
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  darkAttribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  defaultCenter: [39.8283, -98.5795] as [number, number], // Center of US
  defaultZoom: 4,
  minZoom: 2,
  maxZoom: 18,
} as const
