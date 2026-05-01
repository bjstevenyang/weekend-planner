"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Bell } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"
import { plans } from "@/lib/api"

const TIME_OPTIONS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
]

const REMINDER_OPTIONS = [
  { value: "day_before", label: "Day before", sublabel: "9:00 AM the day before" },
  { value: "same_day", label: "Same day morning", sublabel: "8:00 AM on the day" },
  { value: "none", label: "No reminder", sublabel: "" },
]

function getNextSaturday(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = (6 - day + 7) % 7 || 7
  d.setDate(d.getDate() + diff)
  return d.toISOString().split("T")[0]
}

export default function SaveConfirmationPage() {
  const router = useRouter()
  const params = useParams()
  const planId = params.id as string

  const [date, setDate] = useState(getNextSaturday())
  const [time, setTime] = useState("2:00 PM")
  const [reminder, setReminder] = useState("day_before")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    const familyId = localStorage.getItem("family_id")
    if (!familyId) {
      toast.error("Please sign in to save plans.")
      router.push("/login")
      return
    }
    setSaving(true)
    try {
      await plans.save({
        generated_plan_id: planId,
        family_id: familyId,
        scheduled_date: date,
        scheduled_start_time: time,
        reminder,
      })
      toast("Plan saved!")
      setTimeout(() => router.push("/saved-plans"), 800)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      toast.error(`Couldn't save: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href={`/plans/${planId}`}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="text-teal-600 font-semibold text-base tracking-tight">
            Weekend Planner
          </span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6 pb-40">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Save plan</h1>
        <p className="text-sm text-gray-500 mb-6">Choose when you&apos;d like to go.</p>

        {/* Date */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="size-4 text-teal-600" />
            <h2 className="font-medium text-gray-900 text-sm">Date</h2>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Start time */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-4 text-teal-600" />
            <h2 className="font-medium text-gray-900 text-sm">Start time</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTime(t)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  time === t
                    ? "bg-teal-50 border-teal-600 text-teal-700 font-medium"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Reminder */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="size-4 text-teal-600" />
            <h2 className="font-medium text-gray-900 text-sm">Reminder</h2>
          </div>
          <div className="flex flex-col gap-2">
            {REMINDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setReminder(opt.value)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors",
                  reminder === opt.value
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  reminder === opt.value ? "text-teal-700" : "text-gray-700"
                )}>
                  {opt.label}
                </span>
                {opt.sublabel && (
                  <span className="text-xs text-gray-400">{opt.sublabel}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="sticky bottom-16 z-40 bg-white border-t border-gray-100 shadow-[0_-2px_12px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto px-4 h-[72px] flex items-center gap-4">
          <Link
            href={`/plans/${planId}`}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </Link>
          <Button
            className="flex-1 h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Confirm and save →"}
          </Button>
        </div>
      </div>
    </div>
  )
}
