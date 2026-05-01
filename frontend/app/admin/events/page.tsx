"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface Event {
  id: string; title: string; location_name?: string
  start_time?: string; age_min?: number; age_max?: number
  price_min?: number; status: string; category?: string
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-teal-100 text-teal-700 border-teal-200",
  needs_review: "bg-amber-100 text-amber-700 border-amber-200",
  expired: "bg-gray-100 text-gray-500 border-gray-200",
  hidden: "bg-gray-100 text-gray-500 border-gray-200",
  cancelled: "bg-red-100 text-red-500 border-red-200",
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const token = localStorage.getItem("admin_token") ?? ""
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/admin/events`, {
      headers: { "x-admin-token": token },
    }).then((r) => r.json()).then(setEvents).catch(() => {})
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Events</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background border-b border-gray-100">
            <tr>
              {["Title", "Location", "Date", "Ages", "Price", "Category", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-background">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{e.title}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{e.location_name ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{e.start_time ? new Date(e.start_time).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 text-gray-500">{e.age_min != null ? `${e.age_min}–${e.age_max}` : "—"}</td>
                <td className="px-4 py-3 text-gray-500">{e.price_min === 0 ? "Free" : e.price_min != null ? `$${e.price_min}` : "—"}</td>
                <td className="px-4 py-3 text-gray-500">{e.category ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_COLORS[e.status] ?? ""}>{e.status}</Badge>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No events yet. Run the crawler to populate.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
