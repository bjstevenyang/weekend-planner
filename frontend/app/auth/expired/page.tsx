"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { auth } from "@/lib/api"

export default function AuthExpiredPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    if (!email.trim()) return
    setLoading(true)
    try {
      await auth.sendLink(email.trim())
      toast("New link sent — check your inbox.")
    } catch {
      toast.error("Couldn't send the link. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <Toaster />

      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-6 size-16 rounded-full bg-amber-50 flex items-center justify-center">
          <AlertCircle className="size-8 text-amber-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Link expired</h1>
        <p className="text-sm text-gray-500 mb-8">
          Magic links expire after 10 minutes. Enter your email to get a new one.
        </p>

        <div className="flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleResend()}
            className="h-12 rounded-xl text-base"
            disabled={loading}
          />
          <Button
            className="h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none text-base"
            onClick={handleResend}
            disabled={loading || !email.trim()}
          >
            {loading ? "Sending…" : "Send new link"}
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          <Link href="/" className="text-teal-600 hover:text-teal-700 transition-colors">
            Go back home
          </Link>
        </p>
      </div>
    </div>
  )
}
