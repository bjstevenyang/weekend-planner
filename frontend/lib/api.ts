const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeaders(), ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? `API error ${res.status}`)
  }
  return res.json()
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  sendLink: (email: string, redirectUrl?: string) =>
    request("/api/auth/send-link", {
      method: "POST",
      body: JSON.stringify({ email, redirect_url: redirectUrl }),
    }),
  verify: (token: string) =>
    request<{ user_id: string; email: string; session_token: string }>(
      `/api/auth/verify?token=${encodeURIComponent(token)}`
    ),
}

// ── Cities ───────────────────────────────────────────────────────────────────

export const cities = {
  list: () => request<City[]>("/api/cities"),
  get: (id: string) => request<City>(`/api/cities/${id}`),
  joinWaitlist: (payload: {
    email: string
    city_name: string
    country?: string
    children_age_range?: string
  }) => request("/api/cities/waitlist", { method: "POST", body: JSON.stringify(payload) }),
}

// ── Families ─────────────────────────────────────────────────────────────────

export const families = {
  get: () => request<FamilyProfile>("/api/families/me"),
  create: (payload: FamilyCreatePayload) =>
    request<FamilyProfile>("/api/families", { method: "POST", body: JSON.stringify(payload) }),
  update: (familyId: string, payload: FamilyCreatePayload) =>
    request<FamilyProfile>(`/api/families/${familyId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
}

// ── Plans ────────────────────────────────────────────────────────────────────

export const plans = {
  generate: (payload: {
    family_id?: string
    family_profile?: AnonymousFamilyProfile
    user_text?: string
    selected_filters?: Record<string, unknown>
    request_type?: string
  }) =>
    request<{ plan_request_id: string; plans: GeneratedPlan[] }>("/api/plans/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  claim: (planRequestId: string) =>
    request("/api/plans/claim", {
      method: "POST",
      body: JSON.stringify({ plan_request_id: planRequestId }),
    }),
  get: (planId: string) => request<GeneratedPlan>(`/api/plans/${planId}`),
  save: (payload: {
    generated_plan_id: string
    family_id: string
    scheduled_date?: string
    scheduled_start_time?: string
    reminder?: string
  }) => request<SavedPlan>("/api/plans/save", { method: "POST", body: JSON.stringify(payload) }),
  getSaved: () => request<SavedPlan[]>("/api/plans/saved/me"),
  getSavedById: (savedPlanId: string) => request<SavedPlan>(`/api/plans/saved/${savedPlanId}`),
  updateStatus: (savedPlanId: string, status: string) =>
    request(`/api/plans/saved/${savedPlanId}/status?status=${status}`, { method: "PATCH" }),
  updateChecklistItem: (savedPlanId: string, itemId: string, isCompleted: boolean) =>
    request(`/api/plans/saved/${savedPlanId}/checklist/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ is_completed: isCompleted }),
    }),
  submitFeedback: (payload: {
    generated_plan_id: string
    rating: string
    reasons: string[]
    comment?: string
  }) => request("/api/plans/feedback", { method: "POST", body: JSON.stringify(payload) }),
}

// ── Local types (mirrors backend schemas) ────────────────────────────────────

export interface City {
  id: string
  name: string
  country: string
  region?: string
  timezone: string
  currency: string
  lat: number
  lng: number
  default_radius_km: number
  support_status: "active" | "beta" | "waitlist" | "hidden"
  coverage_level: string
  is_featured: boolean
  sort_order: number
}

export interface FamilyProfile {
  id: string
  user_id: string
  city_id: string
  neighborhood?: string
  transportation_mode: string
  budget_level: string
  distance_preference: string
  reminder_preference: string
  children: { id: string; age: number }[]
  interests: string[]
  availability: string[]
}

export interface AnonymousFamilyProfile {
  city_id: string
  children: { age: number }[]
  budget?: string
  transport?: string
  distance?: string
  interests?: string[]
  availability?: string[]
}

export interface FamilyCreatePayload {
  city_id: string
  neighborhood?: string
  children: { age: number }[]
  budget: string
  transport: string
  distance: string
  interests: string[]
  availability: string[]
  reminder: string
}

export interface GeneratedPlan {
  id: string
  plan_type: string
  title: string
  summary?: string
  recommended_date?: string
  estimated_duration?: string
  budget?: string
  location?: string
  age_min?: number
  age_max?: number
  is_indoor?: boolean
  is_rain_friendly: boolean
  registration_required: boolean
  timeline: { time: string; description: string }[]
  preparation_items: string[]
  backup_plan?: string
  source_name?: string
  source_url?: string
  recommendation_reason?: string
  created_at: string
}

export interface ChecklistItem {
  id: string
  text: string
  is_completed: boolean
  sort_order: number
}

export interface SavedPlan {
  id: string
  generated_plan_id: string
  plan_title: string
  plan_type: string
  scheduled_date?: string
  scheduled_start_time?: string
  status: string
  checklist_items: ChecklistItem[]
  created_at: string
}
