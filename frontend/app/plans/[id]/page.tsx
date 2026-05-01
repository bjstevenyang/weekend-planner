"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Clock,
  MapPin,
  CreditCard,
  Users,
  Sun,
  Cloud,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { plans as plansApi, type GeneratedPlan } from "@/lib/api"

const PLAN_TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  low_cost:            { label: "Low-cost",     cls: "bg-teal-100 text-teal-700 border-teal-200" },
  rain_friendly:       { label: "Rain-friendly", cls: "bg-blue-100 text-blue-700 border-blue-200" },
  special_event:       { label: "Special event", cls: "bg-purple-100 text-purple-700 border-purple-200" },
  place_based_fallback:{ label: "Place-based",  cls: "bg-teal-100 text-teal-700 border-teal-200" },
  custom_idea:         { label: "Custom idea",  cls: "bg-purple-100 text-purple-700 border-purple-200" },
}

export default function PlanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.id as string

  const [plan, setPlan] = useState<GeneratedPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    plansApi
      .get(planId)
      .then(setPlan)
      .catch(() => router.replace("/results"))
      .finally(() => setLoading(false))
  }, [planId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!plan) return null

  const badge = PLAN_TYPE_BADGE[plan.plan_type] ?? { label: plan.plan_type, cls: "bg-gray-100 text-gray-600" }
  const timeLabel = [plan.recommended_date, plan.estimated_duration].filter(Boolean).join(" · ")
  const environment = plan.is_indoor === true ? "Indoor" : plan.is_indoor === false ? "Outdoor" : null
  const registration = plan.registration_required ? "Registration required" : "No registration needed"

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <span className="text-teal-600 font-semibold text-base tracking-tight">
            Weekend Planner
          </span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6 pb-40">
        {/* Title + badge */}
        <div className="mb-6">
          <Badge className={cn(badge.cls, "mb-2")}>{badge.label}</Badge>
          <h1 className="text-xl font-semibold text-gray-900 leading-snug">
            {plan.title}
          </h1>
          {plan.summary && (
            <p className="text-sm text-gray-500 mt-2">{plan.summary}</p>
          )}
        </div>

        {/* Key info */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-3">
            {timeLabel && (
              <div className="flex items-start gap-2">
                <Clock className="size-4 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">{timeLabel}</span>
              </div>
            )}
            {plan.location && (
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">{plan.location}</span>
              </div>
            )}
            {plan.budget && (
              <div className="flex items-start gap-2">
                <CreditCard className="size-4 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">{plan.budget}</span>
              </div>
            )}
            {(plan.age_min != null || plan.age_max != null) && (
              <div className="flex items-start gap-2">
                <Users className="size-4 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">
                  Ages {plan.age_min ?? 0}–{plan.age_max ?? 12}
                </span>
              </div>
            )}
            {environment && (
              <div className="flex items-start gap-2">
                {plan.is_indoor
                  ? <Cloud className="size-4 text-gray-400 shrink-0 mt-0.5" />
                  : <Sun className="size-4 text-gray-400 shrink-0 mt-0.5" />
                }
                <span className="text-sm text-gray-600">{environment}</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <ClipboardList className="size-4 text-gray-400 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">{registration}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {plan.timeline.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Timeline</h2>
            <div className="flex flex-col">
              {plan.timeline.map((item, i) => {
                const isLast = i === plan.timeline.length - 1
                return (
                  <div key={i} className="flex items-start">
                    <span className="text-sm font-medium text-teal-600 shrink-0 pt-0.5 w-20">
                      {item.time}
                    </span>
                    <div className={cn("flex-1 ml-10 pl-3 pb-4", !isLast && "border-l-2 border-teal-100")}>
                      <span className="text-sm text-gray-700">{item.description}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Preparation */}
        {plan.preparation_items.length > 0 && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Preparation</h2>
            <div className="flex flex-col gap-2">
              {plan.preparation_items.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5 shrink-0">•</span>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backup plan */}
        {plan.backup_plan && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Backup plan</h2>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-600">{plan.backup_plan}</p>
            </div>
          </div>
        )}

        {/* Source */}
        {plan.source_name && (
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900 mb-3">Source</h2>
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-sm font-medium text-gray-800">{plan.source_name}</p>
              {plan.source_url && (
                <a
                  href={plan.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  View source ↗
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-16 z-40 bg-white border-t border-gray-100 shadow-[0_-2px_12px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white border-none rounded-xl px-6"
            onClick={() => {
              const token = localStorage.getItem("session_token")
              if (!token) {
                router.push(`/login?redirect=/plans/${planId}/save`)
                return
              }
              router.push(`/plans/${planId}/save`)
            }}
          >
            Save plan →
          </Button>
        </div>
      </div>
    </div>
  )
}
