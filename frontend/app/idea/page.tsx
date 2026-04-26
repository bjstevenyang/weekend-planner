"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const MAX_CHARS = 200

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

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/onboarding"
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

      {/* Preference summary bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Vancouver · Kids 6 &amp; 10 · Under $50 · Car
          </p>
          <Link
            href="/onboarding"
            className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            Change
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Anything specific this weekend?
          </h1>
          <p className="text-sm text-gray-500">
            Tell us what you feel like doing, or skip and we&apos;ll suggest
            plans.
          </p>
        </div>

        {/* Textarea */}
        <div className="relative">
          <Textarea
            rows={4}
            value={inputText}
            onChange={handleTextChange}
            placeholder={
              "e.g. Something indoor, under $30,\ngood for a 6-year-old, within 30 minutes"
            }
            className="rounded-xl border-gray-200 bg-white px-4 py-3 resize-none pb-7 focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
          />
          <span className="absolute bottom-2.5 right-3 text-xs text-gray-400 pointer-events-none">
            {inputText.length} / {MAX_CHARS}
          </span>
        </div>

        {/* Quick tags */}
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-3">Quick filters</p>
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
      <div className="sticky bottom-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_12px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto px-4 py-4 flex flex-col gap-2">
          <Button
            className={cn(
              "w-full h-12 text-base rounded-xl border-none transition-colors",
              inputText.trim()
                ? "bg-teal-600 hover:bg-teal-700 text-white"
                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            )}
            onClick={() => router.push("/generating")}
          >
            Generate 3 plans →
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-base rounded-xl text-gray-600 hover:bg-gray-50"
            onClick={() => router.push("/generating")}
          >
            Skip, surprise me
          </Button>
        </div>
      </div>
    </div>
  )
}
