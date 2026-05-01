"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { auth } from "@/lib/api"

export default function CheckEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [resending, setResending] = useState(false)

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    try {
      await auth.sendLink(email)
      toast("New link sent — check your inbox.")
    } catch {
      toast.error("Couldn't resend the link. Please try again.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <Toaster />

      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-6 size-16 rounded-full bg-teal-50 flex items-center justify-center">
          <Mail className="size-8 text-teal-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-sm text-gray-500 mb-2">
          We sent a sign-in link to
        </p>
        <p className="text-sm font-medium text-gray-800 mb-8">{email}</p>

        <p className="text-xs text-gray-400 mb-6">
          The link expires in 10 minutes. Check your spam folder if you don&apos;t see it.
        </p>

        <Button
          variant="outline"
          className="w-full h-11 rounded-xl border-gray-200 text-gray-600"
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? "Sending…" : "Resend link"}
        </Button>

        <p className="mt-4 text-sm text-gray-400">
          Wrong email?{" "}
          <Link href="/login" className="text-teal-600 hover:text-teal-700 transition-colors">
            Go back
          </Link>
        </p>
      </div>
    </div>
  )
}
