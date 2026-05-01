import type { ReminderPref } from './family'

export type PlanType = 'low_cost' | 'rain_friendly' | 'special_event' | 'place_based_fallback'
export type PlanStatus = 'saved' | 'completed' | 'cancelled' | 'expired'

export interface TimelineItem {
  time: string
  description: string
}

export interface GeneratedPlan {
  id: string
  title: string
  planType: PlanType
  summary: string
  recommendedDate: string
  estimatedDuration: string
  budget: string
  location: string
  city: string
  ageMin: number
  ageMax: number
  isIndoor: boolean
  isRainFriendly: boolean
  registrationRequired: boolean
  timeline: TimelineItem[]
  preparationItems: string[]
  backupPlan: string
  sourceName: string
  sourceUrl?: string
  lastCheckedAt: string
  recommendationReason: string
}

export interface ChecklistItem {
  id: string
  text: string
  isCompleted: boolean
  sortOrder: number
}

export interface SavedPlan {
  id: string
  userId: string
  generatedPlan: GeneratedPlan
  scheduledDate: string
  scheduledStartTime: string
  status: PlanStatus
  checklistItems: ChecklistItem[]
  reminder: ReminderPref
}
