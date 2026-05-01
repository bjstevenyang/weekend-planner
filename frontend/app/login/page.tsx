"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { auth } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") ?? undefined

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!email.trim()) return
    setLoading(true)
    try {
      await auth.sendLink(email.trim(), redirectUrl)
      router.push(`/auth/check-email?email=${encodeURIComponent(email.trim())}`)
    } catch {
      toast.error("Couldn't send the link. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
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

      <div className="max-w-md mx-auto px-6 py-16 pb-24">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in</h1>
        <p className="text-sm text-gray-500 mb-8">
          We&apos;ll send a magic link to your email — no password needed.
        </p>

        <div className="flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="h-12 rounded-xl text-base"
            disabled={loading}
          />
          <Button
            className="h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none text-base"
            onClick={handleSend}
            disabled={loading || !email.trim()}
          >
            {loading ? "Sending…" : "Send sign-in link"}
          </Button>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          No account? We&apos;ll create one automatically when you first sign in.
        </p>
      </div>
    </div>
  )
}
