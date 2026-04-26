"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const MESSAGES = [
  "Finding activities near Vancouver...",
  "Filtering by age and budget...",
  "Checking registration requirements...",
  "Building your weekend timeline...",
  "Almost ready...",
]

const REDIRECT_DELAY_MS = 5000
const MESSAGE_INTERVAL_MS = 1500
const FADE_MS = 300

export default function GeneratingPage() {
  const router = useRouter()
  const [messageIndex, setMessageIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  // Auto-redirect after 5 s
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/results")
    }, REDIRECT_DELAY_MS)
    return () => clearTimeout(timer)
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
    <div className="bg-gray-50">
      {/* Preference summary bar */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-2">
          <p className="text-xs text-gray-500 text-center">
            Vancouver · Kids 6 &amp; 10 · Under $50 · Car
          </p>
        </div>
      </div>

      {/* Centered content */}
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        {/* SVG spinner: gray full circle + teal quarter-arc */}
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

        {/* Cycling message */}
        <p
          className="text-lg text-gray-700 text-center transition-opacity"
          style={{
            opacity: visible ? 1 : 0,
            transitionDuration: `${FADE_MS}ms`,
          }}
        >
          {MESSAGES[messageIndex]}
        </p>

        {/* Footer note */}
        <p className="text-sm text-gray-400 text-center">
          This usually takes 5–10 seconds
        </p>
      </div>
    </div>
  )
}
