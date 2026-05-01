"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

interface Source {
  id: string
  name: string
  spider_class?: string
  base_url?: string
  reliability_score: number
  crawl_enabled: boolean
  last_checked_at?: string
}

function adminHeaders() {
  const token = typeof window !== "undefined" ? (localStorage.getItem("admin_token") ?? "") : ""
  return { "x-admin-token": token, "Content-Type": "application/json" }
}

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${BASE}/api/admin/sources`, { headers: adminHeaders() })
      .then((r) => r.json())
      .then(setSources)
      .catch(() => toast.error("Failed to load sources"))
      .finally(() => setLoading(false))
  }, [])

  const triggerCrawl = async (sourceId: string) => {
    setTriggering(sourceId)
    try {
      const res = await fetch(`${BASE}/api/admin/crawl/${sourceId}`, {
        method: "POST",
        headers: adminHeaders(),
      })
      const data = await res.json()
      toast(`Crawl queued (job: ${data.job_id?.slice(0, 8)}…)`)
    } catch {
      toast.error("Failed to trigger crawl")
    } finally {
      setTriggering(null)
    }
  }

  return (
    <div className="p-8">
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sources</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background border-b border-gray-100">
            <tr>
              {["Name", "Spider", "URL", "Score", "Enabled", "Last checked", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">Loading…</td></tr>
            )}
            {!loading && sources.map((s) => (
              <tr key={s.id} className="hover:bg-background">
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.spider_class ?? "—"}</td>
                <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{s.base_url ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{s.reliability_score.toFixed(1)}</td>
                <td className="px-4 py-3 text-gray-500">{s.crawl_enabled ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {s.last_checked_at ? new Date(s.last_checked_at).toLocaleString() : "Never"}
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    disabled={triggering === s.id}
                    onClick={() => triggerCrawl(s.id)}
                  >
                    {triggering === s.id ? "Running…" : "Run now"}
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && sources.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No sources configured yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
