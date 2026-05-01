"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, MapPin, Calendar, Bell, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { plans as plansApi, type SavedPlan } from "@/lib/api"

const STATUS_BADGE: Record<string, string> = {
  saved: "bg-teal-100 text-teal-700 border-teal-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
}

function formatDate(iso?: string): string {
  if (!iso) return "No date set"
  return new Date(iso).toLocaleDateString("en-CA", {
    weekday: "long", month: "long", day: "numeric",
  })
}

export default function SavedPlanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const savedPlanId = params.id as string

  const [plan, setPlan] = useState<SavedPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [backupOpen, setBackupOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("session_token")
    if (!token) {
      window.location.replace(`/login?redirect=/saved-plans/${savedPlanId}`)
      return
    }
    plansApi
      .getSavedById(savedPlanId)
      .then((data) => {
        setPlan(data)
        const state: Record<string, boolean> = {}
        data.checklist_items.forEach((ci) => { state[ci.id] = ci.is_completed })
        setCheckedItems(state)
      })
      .catch(() => toast.error("Couldn't load this plan."))
      .finally(() => setLoading(false))
  }, [savedPlanId])

  const toggleItem = async (itemId: string) => {
    const next = !checkedItems[itemId]
    setCheckedItems((prev) => ({ ...prev, [itemId]: next }))
    try {
      await plansApi.updateChecklistItem(savedPlanId, itemId, next)
    } catch {
      setCheckedItems((prev) => ({ ...prev, [itemId]: !next }))
    }
  }

  const handleComplete = async () => {
    try {
      await plansApi.updateStatus(savedPlanId, "completed")
      toast("Plan completed!")
      setTimeout(() => router.push("/saved-plans"), 800)
    } catch {
      toast.error("Couldn't update status.")
    }
  }

  const handleCancel = async () => {
    try {
      await plansApi.updateStatus(savedPlanId, "cancelled")
      setCancelOpen(false)
      router.push("/saved-plans")
    } catch {
      toast.error("Couldn't cancel plan.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Plan not found.</p>
        <Link href="/saved-plans" className="text-teal-600 hover:text-teal-700 text-sm font-medium">
          Back to saved plans
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/saved-plans" className="text-gray-400 hover:text-gray-700 transition-colors" aria-label="Back">
            <ArrowLeft className="size-4" />
          </Link>
          <span className="text-teal-600 font-semibold text-base tracking-tight">Weekend Planner</span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6 pb-20">
        <div className="bg-white rounded-2xl shadow-sm p-5">
          {/* Title + badge */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-semibold text-lg text-gray-900 leading-snug flex-1">{plan.plan_title}</h1>
            <Badge className={STATUS_BADGE[plan.status] ?? STATUS_BADGE.saved}>
              {plan.status === "saved" ? "Upcoming" : plan.status}
            </Badge>
          </div>

          {/* Date & reminder */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="size-4 text-gray-400 shrink-0" />
              <span>{formatDate(plan.scheduled_date)}</span>
              {plan.scheduled_start_time && <span>· {plan.scheduled_start_time}</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bell className="size-4 text-gray-400 shrink-0" />
              <span>Reminder set</span>
            </div>
          </div>

          {/* Checklist */}
          {plan.checklist_items.length > 0 && (
            <div className="border-t border-gray-100 mt-4 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Preparation checklist</p>
              <div className="flex flex-col gap-3">
                {plan.checklist_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={checkedItems[item.id] ?? item.is_completed}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <span
                      className={cn(
                        "text-sm cursor-pointer select-none",
                        (checkedItems[item.id] ?? item.is_completed)
                          ? "text-gray-400 line-through"
                          : "text-gray-700"
                      )}
                      onClick={() => toggleItem(item.id)}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View full plan */}
          <div className="border-t border-gray-100 mt-4 pt-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => router.push(`/plans/${plan.generated_plan_id}`)}
            >
              <MapPin className="size-4 shrink-0" />
              View full plan details →
            </Button>
          </div>

          {/* Backup plan */}
          <div className="border-t border-gray-100 mt-4 pt-4">
            <button
              type="button"
              onClick={() => setBackupOpen((v) => !v)}
              className="flex items-center justify-between w-full text-left"
            >
              <p className="text-sm font-medium text-gray-700">Backup plan</p>
              {backupOpen ? <ChevronUp className="size-4 text-gray-400" /> : <ChevronDown className="size-4 text-gray-400" />}
            </button>
            {backupOpen && (
              <p className="mt-3 bg-blue-50 rounded-xl p-3 text-sm text-blue-600">
                Check the venue&apos;s indoor facilities if the weather changes.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col gap-3">
            <Button
              className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none"
              onClick={handleComplete}
            >
              Mark as completed ✓
            </Button>
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
            >
              Cancel plan
            </button>
          </div>
        </div>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this plan?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 py-2">
            This plan will be removed from your saved list.
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <Button
              className="w-full h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white border-none"
              onClick={handleCancel}
            >
              Yes, cancel plan
            </Button>
            <button
              type="button"
              onClick={() => setCancelOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors text-center py-2"
            >
              Keep plan
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
