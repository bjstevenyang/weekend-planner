"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface Place {
  id: string; name: string; category?: string; address?: string
  suitable_age_min?: number; suitable_age_max?: number
  cost_level?: string; indoor_outdoor?: string
  rainy_day_friendly: boolean; status: string
}

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<Place[]>([])

  useEffect(() => {
    const token = localStorage.getItem("admin_token") ?? ""
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/admin/places`, {
      headers: { "x-admin-token": token },
    }).then((r) => r.json()).then(setPlaces).catch(() => {})
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Places</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background border-b border-gray-100">
            <tr>
              {["Name", "Category", "Ages", "Cost", "Indoor/Outdoor", "Rainy Day", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {places.map((p) => (
              <tr key={p.id} className="hover:bg-background">
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{p.suitable_age_min != null ? `${p.suitable_age_min}–${p.suitable_age_max}` : "—"}</td>
                <td className="px-4 py-3 text-gray-500">{p.cost_level ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{p.indoor_outdoor ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{p.rainy_day_friendly ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <Badge className={p.status === "active" ? "bg-teal-100 text-teal-700 border-teal-200" : "bg-gray-100 text-gray-500 border-gray-200"}>
                    {p.status}
                  </Badge>
                </td>
              </tr>
            ))}
            {places.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No places yet. Run seed.py first.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
