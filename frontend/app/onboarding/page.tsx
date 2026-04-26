"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

// ─── Data ─────────────────────────────────────────────────────────────────────

const AVAILABILITY_OPTIONS = [
  "Sat morning",
  "Sat afternoon",
  "Sun morning",
  "Sun afternoon",
  "Flexible",
]

const TRANSPORT_OPTIONS = ["Car", "Transit", "Walking", "Flexible"]

const DISTANCE_OPTIONS = ["Nearby only", "Within 30 min", "Flexible"]

const INTEREST_OPTIONS = [
  "Outdoor",
  "Library / Reading",
  "Science / Museum",
  "Sports",
  "Music / Art",
  "Indoor play",
  "Low-cost",
]

const BUDGET_OPTIONS = ["Free first", "Under $20", "$20–$50", "$50+"]

interface ReminderOption {
  value: string
  label: string
  recommended: boolean
}

const REMINDER_OPTIONS: ReminderOption[] = [
  { value: "day-before", label: "Day before", recommended: true },
  { value: "same-day", label: "Same day morning", recommended: false },
  { value: "no-reminder", label: "No reminder for now", recommended: false },
]

// ─── Shared UI pieces ──────────────────────────────────────────────────────────

interface ToggleChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

function ToggleChip({ label, selected, onClick }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-medium border transition-colors",
        selected
          ? "bg-teal-50 border-teal-600 text-teal-700"
          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
      )}
    >
      {label}
    </button>
  )
}

interface RadioCardProps {
  label: string
  selected: boolean
  onClick: () => void
  badge?: string
}

function RadioCard({ label, selected, onClick, badge }: RadioCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl p-4 text-left border transition-colors",
        selected
          ? "bg-teal-50 border-teal-600"
          : "bg-white border-gray-200 hover:border-gray-300"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-sm font-medium",
            selected ? "text-teal-700" : "text-gray-700"
          )}
        >
          {label}
        </span>
        {badge && (
          <Badge className="bg-teal-100 text-teal-700 border-teal-200 shrink-0">
            {badge}
          </Badge>
        )}
      </div>
    </button>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Step 1
  const [neighborhood, setNeighborhood] = useState("")

  // Step 2
  const [kids, setKids] = useState<number[]>([])
  const [showAddKid, setShowAddKid] = useState(false)
  const [newKidAge, setNewKidAge] = useState(1)

  // Step 3
  const [availability, setAvailability] = useState<string[]>([])
  const [transport, setTransport] = useState("")
  const [distance, setDistance] = useState("")

  // Step 4
  const [interests, setInterests] = useState<string[]>([])

  // Step 5
  const [budget, setBudget] = useState("")

  // Step 6
  const [reminder, setReminder] = useState("")

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const handleBack = () => {
    if (step === 1) router.push("/city")
    else setStep((s) => s - 1)
  }

  const handleContinue = () => {
    if (step < 6) setStep((s) => s + 1)
    else router.push("/idea")
  }

  const toggleMulti = (
    value: string,
    current: string[],
    setter: (v: string[]) => void
  ) => {
    setter(
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    )
  }

  // ── Step renders ─────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900">Your city</h1>
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
        <p className="font-medium text-gray-900">Vancouver, Canada</p>
        <Link
          href="/city"
          className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          Change
        </Link>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          Neighborhood or area (optional)
        </label>
        <Input
          placeholder="e.g. Kitsilano, Metrotown, Downtown"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold text-gray-900">Your children</h1>

      {kids.length > 0 && (
        <div className="flex flex-col gap-2">
          {kids.map((age, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between"
            >
              <span className="text-sm text-gray-700">
                Child {i + 1} · {age} {age === 1 ? "year" : "years"} old
              </span>
              <button
                type="button"
                onClick={() => setKids(kids.filter((_, idx) => idx !== i))}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Remove child"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddKid ? (
        <div className="flex items-center gap-2">
          <select
            value={newKidAge}
            onChange={(e) => setNewKidAge(Number(e.target.value))}
            className="flex-1 h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 bg-white focus:outline-none focus:border-teal-500 transition-colors"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((age) => (
              <option key={age} value={age}>
                {age} {age === 1 ? "year" : "years"} old
              </option>
            ))}
          </select>
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white border-none shrink-0"
            onClick={() => {
              setKids([...kids, newKidAge])
              setShowAddKid(false)
              setNewKidAge(1)
            }}
          >
            Add
          </Button>
          <button
            type="button"
            onClick={() => setShowAddKid(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            aria-label="Cancel"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowAddKid(true)}
          className="w-full"
        >
          + Add a child
        </Button>
      )}

      <p className="text-xs text-gray-400">
        Ages help us filter suitable activities
      </p>
    </div>
  )

  const renderStep3 = () => (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-gray-900">
        Availability &amp; transport
      </h1>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">
          Available this weekend
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABILITY_OPTIONS.map((opt) => (
            <ToggleChip
              key={opt}
              label={opt}
              selected={availability.includes(opt)}
              onClick={() => toggleMulti(opt, availability, setAvailability)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">
          How will you travel?
        </label>
        <div className="flex flex-wrap gap-2">
          {TRANSPORT_OPTIONS.map((opt) => (
            <ToggleChip
              key={opt}
              label={opt}
              selected={transport === opt}
              onClick={() => setTransport(transport === opt ? "" : opt)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">
          How far are you willing to go?
        </label>
        <div className="flex flex-wrap gap-2">
          {DISTANCE_OPTIONS.map((opt) => (
            <ToggleChip
              key={opt}
              label={opt}
              selected={distance === opt}
              onClick={() => setDistance(distance === opt ? "" : opt)}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Family interests
        </h1>
        <p className="text-sm text-gray-500 mt-1">Select all that apply</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {INTEREST_OPTIONS.map((opt) => (
          <ToggleChip
            key={opt}
            label={opt}
            selected={interests.includes(opt)}
            onClick={() => toggleMulti(opt, interests, setInterests)}
          />
        ))}
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900">Weekend budget</h1>
      <div className="flex flex-col gap-3">
        {BUDGET_OPTIONS.map((opt) => (
          <RadioCard
            key={opt}
            label={opt}
            selected={budget === opt}
            onClick={() => setBudget(opt)}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400">Local currency based on your city</p>
    </div>
  )

  const renderStep6 = () => (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Reminder preference
      </h1>
      <div className="flex flex-col gap-3">
        {REMINDER_OPTIONS.map((opt) => (
          <RadioCard
            key={opt.value}
            label={opt.label}
            selected={reminder === opt.value}
            onClick={() => setReminder(opt.value)}
            badge={opt.recommended ? "Recommended" : undefined}
          />
        ))}
      </div>
    </div>
  )

  const stepRenderers = [
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderStep5,
    renderStep6,
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex-1 flex flex-col gap-1.5">
            <span className="text-xs text-gray-400">Step {step} of 6</span>
            <Progress value={(step / 6) * 100} />
          </div>
        </div>
      </nav>

      {/* Step content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {stepRenderers[step - 1]()}
      </div>

      {/* Bottom action bar */}
      <div className="sticky bottom-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_12px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-2">
          <Button
            className="w-full h-12 text-base rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none"
            onClick={handleContinue}
          >
            {step < 6 ? "Continue →" : "See my plans →"}
          </Button>
          {step <= 4 && (
            <button
              type="button"
              onClick={handleContinue}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center py-1"
            >
              Skip this step
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
