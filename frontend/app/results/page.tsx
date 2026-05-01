"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import type { GeneratedPlan } from "@/lib/api"

// ─── Badge mapping ─────────────────────────────────────────────────────────────

const PLAN_TYPE_BADGE: Record<string, string> = {
  low_cost: "Low-cost",
  rain_friendly: "Rain-friendly",
  special_event: "Special event",
  place_based_fallback: "Place-based",
  custom_idea: "Custom idea",
}

const PLAN_GRADIENTS: Record<string, string> = {
  low_cost: "from-emerald-400 to-teal-600",
  rain_friendly: "from-sky-400 to-blue-600",
  special_event: "from-orange-400 to-rose-500",
  place_based_fallback: "from-teal-400 to-cyan-500",
  custom_idea: "from-violet-400 to-purple-500",
}

const PLAN_BADGE_BG: Record<string, string> = {
  low_cost: "bg-emerald-500",
  rain_friendly: "bg-sky-500",
  special_event: "bg-orange-500",
  place_based_fallback: "bg-teal-500",
  custom_idea: "bg-violet-500",
}

const CHANGE_REASONS = [
  "Closer to home",
  "Lower cost",
  "More indoor",
  "More outdoor",
  "Better for younger kids",
  "More active",
  "Quieter",
  "Different category",
  "Already visited",
  "Just show others",
]

// ─── Plan Card ─────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: GeneratedPlan
  onSave: () => void
  onViewDetails: () => void
  onNotThis: () => void
}

function PlanCard({ plan, onSave, onViewDetails, onNotThis }: PlanCardProps) {
  const badgeLabel = PLAN_TYPE_BADGE[plan.plan_type] ?? plan.plan_type
  const gradient = PLAN_GRADIENTS[plan.plan_type] ?? "from-teal-400 to-emerald-600"
  const badgeBg = PLAN_BADGE_BG[plan.plan_type] ?? "bg-teal-500"

  const metaParts: string[] = [
    plan.estimated_duration,
    plan.budget,
    plan.age_min != null || plan.age_max != null ? `Ages ${plan.age_min ?? 0}–${plan.age_max ?? 12}` : null,
    plan.location,
  ].filter(Boolean) as string[]

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Gradient image area */}
      <div className={cn("h-36 bg-gradient-to-br relative", gradient)}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-3 left-3">
          <span className={cn("text-white text-xs font-semibold px-2.5 py-1 rounded-full", badgeBg)}>
            {badgeLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">{plan.title}</h3>
        {metaParts.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
            {metaParts.map((part, i) => (
              <span key={i}>{part}</span>
            ))}
          </div>
        )}
        {plan.recommendation_reason && (
          <p className="italic text-xs text-gray-400 mt-2">&ldquo;{plan.recommendation_reason}&rdquo;</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onViewDetails}
            className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            View details
          </button>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white border-none"
            onClick={onSave}
          >
            Save plan
          </Button>
          <button
            type="button"
            onClick={onNotThis}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Not this
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter()
  const [planList, setPlanList] = useState<GeneratedPlan[]>([])
  const [profileSummary, setProfileSummary] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notThisOpen, setNotThisOpen] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])

  useEffect(() => {
    const raw = localStorage.getItem("current_plans")
    if (raw) {
      try {
        setPlanList(JSON.parse(raw))
      } catch {
        // ignore parse errors
      }
    }

    const profile = (() => {
      try { return JSON.parse(localStorage.getItem("family_profile") ?? "{}") } catch { return {} }
    })()
    const cityName = profile.city_name ?? localStorage.getItem("city_name") ?? "Your city"
    const ages = (profile.children ?? []).map((c: { age: number }) => c.age)
    const agePart = ages.length ? `Kids ${ages.join(" & ")}` : null
    const budgetMap: Record<string, string> = {
      free: "Free", under_20: "Under $20", "20_50": "Under $50", "50_plus": "$50+",
    }
    const budgetPart = budgetMap[profile.budget] ?? null
    const transportPart = profile.transport === "car" ? "Car" : profile.transport ?? null
    setProfileSummary(
      [cityName, agePart, budgetPart, transportPart].filter(Boolean).join(" · ")
    )
  }, [])

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason) ? prev.filter((r) => r !== reason) : [...prev, reason]
    )
  }

  const handleSave = (plan: GeneratedPlan) => {
    const token = localStorage.getItem("session_token")
    if (!token) {
      router.push(`/login?redirect=/plans/${plan.id}/save`)
      return
    }
    router.push(`/plans/${plan.id}/save`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-teal-600 font-semibold text-base tracking-tight">
            Weekend Planner
          </span>
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6 pb-20">
        {/* Summary */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">This Weekend</h1>
          <p className="text-sm text-gray-500 mt-1">
            {planList.length > 0
              ? `Here are ${planList.length} family plan${planList.length > 1 ? "s" : ""} picked for you.`
              : "No plans available — try adjusting your preferences."}
          </p>
          {profileSummary && (
            <p className="text-xs text-gray-500 mt-2">{profileSummary}</p>
          )}
          <div className="flex gap-4 mt-3">
            <Link
              href="/settings"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Change preferences
            </Link>
            <Link
              href="/idea"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Change idea
            </Link>
          </div>
        </div>

        {/* Plan cards */}
        {planList.length > 0 ? (
          <div className="flex flex-col gap-4">
            {planList.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSave={() => handleSave(plan)}
                onViewDetails={() => router.push(`/plans/${plan.id}`)}
                onNotThis={() => setNotThisOpen(true)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">
              We couldn&apos;t find matching activities right now.
            </p>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white border-none"
              onClick={() => router.push("/idea")}
            >
              Try a different idea
            </Button>
          </div>
        )}

        {/* Want something different */}
        {planList.length > 0 && (
          <div className="mt-6 bg-teal-600 rounded-2xl p-5 text-white">
            <p className="font-semibold text-base mb-1">
              Not what you were looking for?
            </p>
            <p className="text-sm text-teal-100 mb-4">
              Tell us what to change and we&apos;ll regenerate better options.
            </p>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="w-full bg-white text-teal-700 font-medium rounded-xl py-3 text-sm hover:bg-teal-50 transition-colors"
            >
              Show different plans
            </button>
            <button
              type="button"
              onClick={() => router.push("/idea")}
              className="w-full mt-2 border border-teal-400 text-white rounded-xl py-3 text-sm hover:bg-teal-500 transition-colors"
            >
              Change my idea
            </button>
          </div>
        )}
      </div>

      {/* Dialog: Not this */}
      <Dialog open={notThisOpen} onOpenChange={(open) => setNotThisOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Not interested in this plan?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 py-2">
            We&apos;ll swap it out for something different. What didn&apos;t work?
          </p>
          <div className="flex flex-wrap gap-2 pb-2">
            {CHANGE_REASONS.slice(0, 6).map((reason) => (
              <button
                key={reason}
                type="button"
                className="px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 text-gray-700 bg-white hover:border-gray-300 transition-colors"
              >
                {reason}
              </button>
            ))}
          </div>
          <Button
            className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none mt-2"
            onClick={() => {
              setNotThisOpen(false)
              router.push("/generating")
            }}
          >
            Show me another plan
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dialog: What should we change? */}
      <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>What should we change?</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 py-2">
            {CHANGE_REASONS.map((reason) => {
              const selected = selectedReasons.includes(reason)
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => toggleReason(reason)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    selected
                      ? "bg-teal-50 border-teal-600 text-teal-700"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  )}
                >
                  {reason}
                </button>
              )
            })}
          </div>
          <Button
            className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none mt-2"
            onClick={() => {
              setDialogOpen(false)
              router.push("/generating")
            }}
          >
            Generate new plans
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
