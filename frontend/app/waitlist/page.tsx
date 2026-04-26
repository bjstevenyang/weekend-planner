"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/sonner"

export default function WaitlistPage() {
  const [email, setEmail] = useState("")

  const handleSubmit = () => {
    if (!email.trim()) return
    toast("You're on the list!")
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/city"
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

      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Coming to your city soon
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          We&apos;re expanding to new cities. Join the waitlist and we&apos;ll let you know
          when Weekend Planner is available near you.
        </p>

        <div className="flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-12 rounded-xl text-base"
          />
          <Button
            className="h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none text-base"
            onClick={handleSubmit}
          >
            Join waitlist
          </Button>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          No spam. We&apos;ll only email you when your city launches.
        </p>
      </div>
    </div>
  )
}
