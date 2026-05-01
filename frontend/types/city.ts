export type CityStatus = 'active' | 'beta' | 'waitlist' | 'hidden'
export type CoverageLevel = 'none' | 'places_only' | 'limited_events' | 'full'

export interface City {
  id: string
  name: string
  country: string
  region?: string
  timezone: string
  currency: string
  lat: number
  lng: number
  defaultRadiusKm: number
  supportStatus: CityStatus
  coverageLevel: CoverageLevel
  isFeatured: boolean
  sortOrder: number
}
