"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, ChevronRight, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { plans as plansApi, type SavedPlan } from "@/lib/api"

const PLAN_TYPE_LABEL: Record<string, string> = {
  low_cost: "Low-cost",
  rain_friendly: "Rain-friendly",
  special_event: "Special event",
  place_based_fallback: "Place-based",
  custom_idea: "Custom idea",
}

const STATUS_BADGE: Record<string, string> = {
  saved: "bg-teal-100 text-teal-700 border-teal-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
}

function formatDate(iso?: string): string {
  if (!iso) return "No date set"
  const d = new Date(iso)
  return d.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })
}

export default function SavedPlansPage() {
  const router = useRouter()
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("session_token")
    if (!token) {
      window.location.replace("/login?redirect=/saved-plans")
      return
    }
    plansApi
      .getSaved()
      .then(setSavedPlans)
      .catch(() => setError("Couldn't load saved plans."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Go back">
              <ArrowLeft className="size-4" />
            </Link>
            <span className="text-teal-600 font-semibold text-base tracking-tight">Weekend Planner</span>
          </div>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6 pb-20">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Saved Plans</h1>
            {!loading && !error && (
              <p className="text-sm text-gray-500 mt-0.5">
                {savedPlans.length} plan{savedPlans.length !== 1 ? "s" : ""} saved
              </p>
            )}
          </div>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white border-none rounded-xl"
            onClick={() => router.push("/idea")}
          >
            <Plus className="size-3.5 mr-1" />
            New plan
          </Button>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 text-center py-10">{error}</p>
        )}

        {!loading && !error && savedPlans.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-4">No saved plans yet.</p>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white border-none rounded-xl"
              onClick={() => router.push("/")}
            >
              Plan this weekend
            </Button>
          </div>
        )}

        {!loading && !error && savedPlans.length > 0 && (
          <div className="flex flex-col gap-3">
            {savedPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => router.push(`/saved-plans/${plan.id}`)}
                className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">
                      {PLAN_TYPE_LABEL[plan.plan_type] ?? plan.plan_type}
                    </p>
                    <h2 className="font-semibold text-gray-900 text-base leading-snug truncate">
                      {plan.plan_title}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                      <Calendar className="size-3.5 shrink-0" />
                      <span>{formatDate(plan.scheduled_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={STATUS_BADGE[plan.status] ?? STATUS_BADGE.saved}>
                      {plan.status === "saved" ? "Upcoming" : plan.status}
                    </Badge>
                    <ChevronRight className="size-4 text-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
