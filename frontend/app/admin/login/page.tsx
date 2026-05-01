"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

export default function AdminLoginPage() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!token.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/admin/stats`, {
        headers: { "x-admin-token": token.trim() },
      })
      if (!res.ok) throw new Error("Invalid token")
      localStorage.setItem("admin_token", token.trim())
      router.push("/admin")
    } catch {
      toast.error("Invalid admin token.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <Toaster />
      <div className="max-w-sm w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin</h1>
        <p className="text-sm text-gray-500 mb-8">Enter your admin token to continue.</p>
        <div className="flex flex-col gap-3">
          <Input
            type="password"
            placeholder="Admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="h-12 rounded-xl text-base"
          />
          <Button
            className="h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white border-none text-base"
            onClick={handleLogin}
            disabled={loading || !token.trim()}
          >
            {loading ? "Checking…" : "Sign in"}
          </Button>
        </div>
      </div>
    </div>
  )
}
