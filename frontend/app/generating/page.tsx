"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { plans } from "@/lib/api"

const MESSAGES = [
  "Finding activities near you...",
  "Filtering by age and budget...",
  "Checking registration requirements...",
  "Building your weekend timeline...",
  "Almost ready...",
]

const MESSAGE_INTERVAL_MS = 1500
const FADE_MS = 300

export default function GeneratingPage() {
  const router = useRouter()
  const [messageIndex, setMessageIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const familyId = localStorage.getItem("family_id")
    const rawProfile = localStorage.getItem("family_profile")
    const userText = localStorage.getItem("idea_text") ?? undefined
    const sessionAvailability = (() => {
      try { return JSON.parse(localStorage.getItem("plan_availability") ?? "[]") } catch { return [] }
    })()

    const buildPayload = () => {
      if (familyId) {
        return {
          family_id: familyId,
          user_text: userText,
          selected_filters: sessionAvailability.length ? { availability: sessionAvailability } : undefined,
        }
      }
      if (rawProfile) {
        const p = JSON.parse(rawProfile)
        if (!p.city_id) {
          router.replace("/settings")
          return null
        }
        return {
          family_profile: {
            city_id: p.city_id,
            children: p.children ?? [],
            budget: p.budget ?? "20_50",
            transport: p.transport ?? "flexible",
            distance: p.distance ?? "flexible",
            interests: p.interests ?? [],
            availability: sessionAvailability,
          },
          user_text: userText,
        }
      }
      return null
    }

    const payload = buildPayload()
    if (!payload) {
      router.replace("/settings")
      return
    }

    plans
      .generate(payload)
      .then(({ plan_request_id, plans: generatedPlans }) => {
        localStorage.setItem("pending_plan_request_id", plan_request_id)
        localStorage.setItem("current_plans", JSON.stringify(generatedPlans))
        router.replace("/results")
      })
      .catch(() => {
        localStorage.removeItem("current_plans")
        router.replace("/results")
      })
  }, [router])

  // Cycle messages with fade out → swap → fade in
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      const swap = setTimeout(() => {
        setMessageIndex((i) => (i + 1) % MESSAGES.length)
        setVisible(true)
      }, FADE_MS)
      return () => clearTimeout(swap)
    }, MESSAGE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-background">
      {/* Preference summary bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-2">
          <p className="text-xs text-gray-500 text-center">
            Building your weekend plans…
          </p>
        </div>
      </div>

      {/* Centered content */}
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <div className="relative w-20 h-20" aria-hidden="true">
          <svg
            className="animate-spin w-20 h-20"
            style={{ animationDuration: "1s" }}
            viewBox="0 0 80 80"
            fill="none"
          >
            <circle cx="40" cy="40" r="32" stroke="#e2e8f0" strokeWidth="6" />
            <path
              d="M 40 8 A 32 32 0 0 1 72 40"
              stroke="#0D9488"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <p
          className="text-lg text-gray-700 text-center transition-opacity"
          style={{
            opacity: visible ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          {MESSAGES[messageIndex]}
        </p>

        <p className="text-sm text-gray-400 text-center">
          This usually takes 5–10 seconds
        </p>
      </div>
    </div>
  )
}
