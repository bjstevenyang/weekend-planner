"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Clock,
  CreditCard,
  Users,
  MapPin,
  Sun,
  Cloud,
  ClipboardList,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

// ─── Types & Data ──────────────────────────────────────────────────────────────

type BadgeColor = "teal" | "blue" | "purple"

interface PlanData {
  id: string
  badge: string
  badgeColor: BadgeColor
  title: string
  time: string
  budget: string
  ages: string
  location: string
  environment: "Indoor" | "Outdoor"
  registration: string
  reason: string
  source: string
  lastChecked: string
}

const PLANS: PlanData[] = [
  {
    id: "1",
    badge: "Low-cost",
    badgeColor: "teal",
    title: "Library Storytime + Deer Lake Walk",
    time: "Saturday afternoon · 2.5 hours",
    budget: "Free",
    ages: "Ages 4–8",
    location: "Burnaby",
    environment: "Outdoor",
    registration: "No registration needed",
    reason: "Matches low-cost + outdoor for kids aged 6",
    source: "Burnaby Public Library",
    lastChecked: "Last checked Apr 22",
  },
  {
    id: "2",
    badge: "Rain-friendly",
    badgeColor: "blue",
    title: "Science World Indoor Afternoon",
    time: "Sunday afternoon · 3 hours",
    budget: "$20–50",
    ages: "Ages 6–12",
    location: "Vancouver",
    environment: "Indoor",
    registration: "Tickets recommended in advance",
    reason: "Great rainy day option, fits age range and budget",
    source: "Science World",
    lastChecked: "Last checked Apr 20",
  },
  {
    id: "3",
    badge: "Special event",
    badgeColor: "purple",
    title: "Family Art Workshop",
    time: "Saturday morning · 2 hours",
    budget: "Under $20",
    ages: "Ages 5–10",
    location: "Vancouver",
    environment: "Indoor",
    registration: "Registration required",
    reason: "Unique this weekend, creative and age-appropriate",
    source: "Vancouver Art Gallery",
    lastChecked: "Last checked Apr 21",
  },
]

const BADGE_STYLES: Record<BadgeColor, string> = {
  teal: "bg-teal-100 text-teal-700 border-teal-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
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
  plan: PlanData
  onSave: () => void
  onViewDetails: () => void
  onNotThis: () => void
}

function PlanCard({ plan, onSave, onViewDetails, onNotThis }: PlanCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <Badge className={BADGE_STYLES[plan.badgeColor]}>{plan.badge}</Badge>
      <h3 className="font-semibold text-gray-800 text-base mt-2 leading-snug">
        {plan.title}
      </h3>

      {/* Info rows */}
      <div className="flex flex-col gap-1.5 mt-3 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 shrink-0" />
          <span>{plan.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="size-3.5 shrink-0" />
          <span>{plan.budget}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="size-3.5 shrink-0" />
          <span>{plan.ages}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-3.5 shrink-0" />
          <span>{plan.location}</span>
        </div>
        <div className="flex items-center gap-2">
          {plan.environment === "Indoor" ? (
            <Cloud className="size-3.5 shrink-0" />
          ) : (
            <Sun className="size-3.5 shrink-0" />
          )}
          <span>{plan.environment}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClipboardList className="size-3.5 shrink-0" />
          <span>{plan.registration}</span>
        </div>
      </div>

      {/* Reason + source */}
      <div className="border-t border-gray-100 mt-3 pt-3">
        <p className="italic text-xs text-gray-500">
          &ldquo;{plan.reason}&rdquo;
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {plan.source} · {plan.lastChecked}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 mt-3 pt-3">
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
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notThisOpen, setNotThisOpen] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-teal-600 font-semibold text-base tracking-tight">
            Weekend Planner
          </span>
          <div
            className="w-8 h-8 rounded-full bg-gray-200 shrink-0"
            aria-hidden="true"
          />
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6 pb-12">
        {/* Summary */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            This Weekend
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here are 3 family plans picked for you.
          </p>
          <div className="mt-3">
            <Badge className="bg-teal-50 text-teal-700 border-teal-100 rounded-full">
              Vancouver · Kitsilano
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Kids 6 &amp; 10 · Under $50 · Car · Within 30 min
          </p>
          <div className="mt-3 inline-block bg-teal-50 rounded-lg px-3 py-1.5">
            <p className="text-xs text-teal-700">
              Based on your idea: Indoor · Low-cost · Half-day
            </p>
          </div>
          <div className="flex gap-4 mt-3">
            <Link
              href="/onboarding"
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
        <div className="flex flex-col gap-4">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSave={() => {
                toast("Plan saved!")
                setTimeout(() => router.push("/saved"), 800)
              }}
              onViewDetails={() => router.push(`/plans/${plan.id}`)}
              onNotThis={() => setNotThisOpen(true)}
            />
          ))}
        </div>

        {/* Want something different */}
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
