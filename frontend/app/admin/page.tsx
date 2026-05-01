"use client"

import { useEffect, useState } from "react"
import { Users, Layers, BookmarkCheck, Calendar, MapPin, MessageSquare } from "lucide-react"

interface Stats {
  total_users: number
  total_families: number
  total_generated_plans: number
  total_saved_plans: number
  total_events: number
  total_places: number
}

const STAT_CARDS = (s: Stats) => [
  { label: "Users", value: s.total_users, icon: Users },
  { label: "Families", value: s.total_families, icon: Layers },
  { label: "Generated Plans", value: s.total_generated_plans, icon: Layers },
  { label: "Saved Plans", value: s.total_saved_plans, icon: BookmarkCheck },
  { label: "Events", value: s.total_events, icon: Calendar },
  { label: "Places", value: s.total_places, icon: MapPin },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("admin_token") ?? ""
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/admin/stats`, {
      headers: { "x-admin-token": token },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setError("Failed to load stats"))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {stats ? (
        <div className="grid grid-cols-3 gap-4">
          {STAT_CARDS(stats).map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="size-4 text-teal-600" />
                <span className="text-xs text-gray-500 font-medium">{label}</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        !error && <p className="text-sm text-gray-400">Loading…</p>
      )}
    </div>
  )
}
