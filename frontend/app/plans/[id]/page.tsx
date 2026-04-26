"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Clock,
  MapPin,
  CreditCard,
  Users,
  Sun,
  ClipboardList,
  Car,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

// ─── Static data ───────────────────────────────────────────────────────────────

const KEY_INFO = [
  { icon: Clock, text: "Sat afternoon · 2:00–4:30 PM" },
  { icon: MapPin, text: "Burnaby Public Library → Deer Lake Park" },
  { icon: CreditCard, text: "Free" },
  { icon: Users, text: "Ages 4–8" },
  { icon: Sun, text: "Outdoor · Rain plan available" },
  { icon: ClipboardList, text: "No registration needed" },
  { icon: Car, text: "~20 min by car" },
]

const TIMELINE = [
  { time: "1:30 PM", label: "Leave home" },
  { time: "2:00 PM", label: "Library Storytime begins" },
  { time: "3:00 PM", label: "Walk to Deer Lake Park (~8 min)" },
  { time: "3:10 PM", label: "Park free play" },
  { time: "4:30 PM", label: "Head home or grab snacks nearby" },
]

const PREP_ITEMS = [
  "Bring water bottles",
  "Light jackets (outdoor section)",
  "Check library website before leaving",
  "Confirm parking at 6377 Gilpin St",
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PlanDetailPage() {
  const router = useRouter()
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    PREP_ITEMS.map(() => false)
  )

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

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">

        {/* Title area */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 leading-snug mb-3">
            Library Storytime + Deer Lake Walk
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-teal-50 text-teal-700 border-teal-100 rounded-full">
              Vancouver · Kitsilano
            </Badge>
            <span className="text-xs text-teal-700 bg-teal-50 rounded-full px-3 py-1">
              Matches your idea: Indoor · Low-cost
            </span>
          </div>
        </div>

        {/* Key info card */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {KEY_INFO.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-2">
                <Icon className="size-4 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600 leading-snug">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Timeline</h2>
          <div className="flex flex-col">
            {TIMELINE.map((item, i) => {
              const isLast = i === TIMELINE.length - 1
              return (
                <div key={i} className="flex items-start">
                  <span
                    className="text-sm font-medium text-teal-600 shrink-0 pt-0.5"
                    style={{ minWidth: 80 }}
                  >
                    {item.time}
                  </span>
                  <div
                    className={cn(
                      "flex-1 ml-10 pl-3 pb-4",
                      !isLast && "border-l-2 border-teal-100"
                    )}
                  >
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Preparation checklist */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Preparation</h2>
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
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Backup plan */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Backup plan</h2>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-700 mb-1">If it rains:</p>
            <p className="text-sm text-blue-600">
              Skip the park and stay in the library extended area, or go to nearby
              Metropolis indoor play.
            </p>
          </div>
        </div>

        {/* Source */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Source</h2>
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-medium text-gray-800">
              Burnaby Public Library
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Last checked: April 22, 2025
            </p>
            <a
              href="#"
              className="inline-block mt-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              View source ↗
            </a>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_12px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto px-4 h-[72px] flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push("/results")}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Not interested
          </button>
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white border-none rounded-xl px-6"
            onClick={() => {
              toast("Plan saved!")
              setTimeout(() => router.push("/saved"), 800)
            }}
          >
            Save plan →
          </Button>
        </div>
      </div>
    </div>
  )
}
