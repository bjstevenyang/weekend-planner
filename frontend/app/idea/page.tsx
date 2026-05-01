"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const MAX_CHARS = 200

const AVAILABILITY_OPTIONS = [
  "Sat morning",
  "Sat afternoon",
  "Sun morning",
  "Sun afternoon",
  "Flexible",
]

const QUICK_TAGS = [
  "Indoor",
  "Outdoor",
  "Free",
  "Low-cost",
  "Half-day",
  "Within 30 min",
  "Rain-friendly",
  "Active",
  "Quiet",
  "Science",
  "Library",
  "Music & art",
]

function removeTagFromText(text: string, tag: string): string {
  if (text === tag) return ""
  if (text.startsWith(tag + " · ")) return text.slice(tag.length + " · ".length)
  return text.split(` · ${tag}`).join("").trim()
}

export default function IdeaPage() {
  const router = useRouter()
  const [inputText, setInputText] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availability, setAvailability] = useState<string[]>([])
  const [profileSummary, setProfileSummary] = useState("")

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("family_profile") ?? "{}")
      const cityName = p.city_name ?? localStorage.getItem("city_name") ?? ""
      const ages = (p.children ?? []).map((c: { age: number }) => c.age)
      const agePart = ages.length ? `Kids ${ages.join(" & ")}` : null
      const budgetMap: Record<string, string> = {
        free: "Free", under_20: "Under $20", "20_50": "Under $50", "50_plus": "$50+",
      }
      const budgetPart = budgetMap[p.budget] ?? null
      const transportMap: Record<string, string> = {
        car: "Car", transit: "Transit", walk: "Walking", flexible: "Flexible",
      }
      const transportPart = transportMap[p.transport] ?? null
      setProfileSummary([cityName, agePart, budgetPart, transportPart].filter(Boolean).join(" · "))
    } catch {
      setProfileSummary("")
    }
  }, [])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_CHARS) {
      setInputText(e.target.value)
    }
  }

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setInputText((prev) => removeTagFromText(prev, tag))
      setSelectedTags((prev) => prev.filter((t) => t !== tag))
    } else {
      setInputText((prev) => (prev.trim() ? `${prev} · ${tag}` : tag))
      setSelectedTags((prev) => [...prev, tag])
    }
  }

  const toggleAvailability = (opt: string) => {
    setAvailability((prev) =>
      prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]
    )
  }

  const handleGenerate = (withIdea: boolean) => {
    if (withIdea) {
      localStorage.setItem("idea_text", inputText.trim())
    } else {
      localStorage.removeItem("idea_text")
    }
    localStorage.setItem("plan_availability", JSON.stringify(availability))
    router.push("/generating")
  }

  return (
    <div className="min-h-screen bg-background pb-52">
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

      {/* Preference summary bar */}
      {profileSummary && (
        <div className="bg-gray-100 border-b border-gray-200">
          <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">{profileSummary}</p>
            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Plan this weekend
          </h1>
          <p className="text-sm text-gray-500">
            Tell us when you&apos;re free and what you feel like doing.
          </p>
        </div>

        {/* Availability */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">When are you free?</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABILITY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => toggleAvailability(opt)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  availability.includes(opt)
                    ? "bg-teal-50 border-teal-600 text-teal-700 font-medium"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Idea input */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Anything specific in mind? <span className="font-normal text-gray-400">(optional)</span>
          </p>
          <div className="relative">
            <Textarea
              rows={3}
              value={inputText}
              onChange={handleTextChange}
              placeholder={"e.g. Something indoor, under $30,\ngood for a 6-year-old"}
              className="rounded-xl border-gray-200 bg-white px-4 py-3 resize-none pb-7 focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
            />
            <span className="absolute bottom-2.5 right-3 text-xs text-gray-400 pointer-events-none">
              {inputText.length} / {MAX_CHARS}
            </span>
          </div>
        </div>

        {/* Quick tags */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Quick filters</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => {
              const selected = selectedTags.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    selected
                      ? "bg-teal-50 border-teal-600 text-teal-700"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  )}
                >
                  {tag}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="sticky bottom-16 z-40 bg-white border-t border-gray-100 shadow-[0_-2px_12px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-2">
          <Button
            className={cn(
              "w-full h-12 text-base rounded-xl border-none transition-colors",
              inputText.trim() || availability.length
                ? "bg-teal-600 hover:bg-teal-700 text-white"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            )}
            onClick={() => handleGenerate(true)}
          >
            Generate 3 plans →
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-base rounded-xl text-gray-600 hover:bg-background"
            onClick={() => handleGenerate(false)}
          >
            Skip, surprise me
          </Button>
        </div>
      </div>
    </div>
  )
}
