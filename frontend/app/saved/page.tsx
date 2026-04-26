"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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

const PREP_ITEMS = [
  { label: "Bring water bottles", defaultChecked: false },
  { label: "Light jackets packed", defaultChecked: true },
  { label: "Check library website", defaultChecked: false },
  { label: "Confirm parking", defaultChecked: false },
]

export default function SavedPage() {
  const router = useRouter()
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    PREP_ITEMS.map((item) => item.defaultChecked)
  )
  const [backupOpen, setBackupOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const toggleItem = (i: number) => {
    setCheckedItems((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/results"
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

      <div className="max-w-lg mx-auto px-4 py-6 pb-12">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Saved Plans</h1>
          <p className="text-sm text-gray-500 mt-1">1 plan saved</p>
        </div>

        {/* Plan card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">

          {/* Title + badge */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-semibold text-lg text-gray-900 leading-snug">
              Library Storytime + Deer Lake Walk
            </h2>
            <Badge className="bg-teal-100 text-teal-700 border-teal-200 shrink-0 mt-0.5">
              Upcoming
            </Badge>
          </div>

          {/* Date & reminder */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="size-4 text-gray-400 shrink-0" />
              <span>Saturday, April 26</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bell className="size-4 text-gray-400 shrink-0" />
                <span>Reminder: Day before</span>
              </div>
              <button
                type="button"
                onClick={() => toast("Reminder settings coming soon")}
                className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4">
            {/* Preparation checklist */}
            <p className="text-sm font-medium text-gray-700 mb-3">
              Preparation checklist
            </p>
            <div className="flex flex-col gap-3">
              {PREP_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Checkbox
                    checked={checkedItems[i]}
                    onCheckedChange={() => toggleItem(i)}
                  />
                  <span
                    className={cn(
                      "text-sm cursor-pointer select-none",
                      checkedItems[i]
                        ? "text-gray-400 line-through"
                        : "text-gray-700"
                    )}
                    onClick={() => toggleItem(i)}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4">
            {/* Open in Maps */}
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() =>
                window.open(
                  "https://maps.google.com/?q=Burnaby+Public+Library",
                  "_blank"
                )
              }
            >
              <MapPin className="size-4 shrink-0" />
              Open in Maps →
            </Button>
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4">
            {/* Backup plan (collapsible) */}
            <button
              type="button"
              onClick={() => setBackupOpen((v) => !v)}
              className="flex items-center justify-between w-full text-left"
            >
              <p className="text-sm font-medium text-gray-700">Backup plan</p>
              {backupOpen ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </button>
            {backupOpen && (
              <div className="mt-3 bg-blue-50 rounded-xl p-3 text-sm text-blue-600">
                If it rains: Skip the park and stay in the library extended
                area.
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 mt-4 pt-4">
            {/* Source */}
            <p className="text-xs text-gray-400">
              Burnaby Public Library · Last checked Apr 22, 2025
            </p>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col gap-3">
            <Button
              className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none"
              onClick={() => {
                toast("Plan completed! 🎉")
                setTimeout(() => router.push("/"), 800)
              }}
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

      {/* Dialog: Cancel plan */}
      <Dialog open={cancelOpen} onOpenChange={(open) => setCancelOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this plan?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 py-2">
            This plan will be removed from your saved list. You can always find new plans.
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <Button
              className="w-full h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white border-none"
              onClick={() => {
                setCancelOpen(false)
                router.push("/results")
              }}
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
