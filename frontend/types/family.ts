export interface Child { age: number }

export type BudgetLevel = 'free' | 'under_20' | '20_50' | '50_plus'
export type TransportMode = 'car' | 'transit' | 'walking' | 'flexible'
export type DistancePref = 'nearby' | '30min' | 'flexible'
export type ReminderPref = 'day_before' | 'same_day' | 'none'

export interface FamilyProfile {
  id: string
  userId: string
  cityId: string
  neighborhood?: string
  children: Child[]
  budget: BudgetLevel
  transport: TransportMode
  distance: DistancePref
  interests: string[]
  availability: string[]
  reminder: ReminderPref
}
