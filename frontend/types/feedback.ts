export type FeedbackRating = 'helpful' | 'okay' | 'not_helpful'
export type FeedbackReason =
  | 'too_far'
  | 'too_expensive'
  | 'bad_time'
  | 'age_mismatch'
  | 'not_interesting'
  | 'already_visited'
  | 'inaccurate_information'
  | 'event_full_or_cancelled'
  | 'other'

export interface PlanFeedback {
  generatedPlanId: string
  rating: FeedbackRating
  reasons: FeedbackReason[]
  comment?: string
}
