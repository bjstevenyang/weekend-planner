"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface City {
  id: string; name: string; country: string; support_status: string
  coverage_level: string; is_featured: boolean; sort_order: number
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-teal-100 text-teal-700 border-teal-200",
  beta: "bg-amber-100 text-amber-700 border-amber-200",
  waitlist: "bg-gray-100 text-gray-500 border-gray-200",
  hidden: "bg-red-100 text-red-500 border-red-200",
}

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([])

  useEffect(() => {
    const token = localStorage.getItem("admin_token") ?? ""
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/admin/cities`, {
      headers: { "x-admin-token": token },
    }).then((r) => r.json()).then(setCities).catch(() => {})
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cities</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background border-b border-gray-100">
            <tr>
              {["City", "Country", "Status", "Coverage", "Featured", "Order"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {cities.map((c) => (
              <tr key={c.id} className="hover:bg-background">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.country}</td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_COLORS[c.support_status] ?? ""}>{c.support_status}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.coverage_level}</td>
                <td className="px-4 py-3 text-gray-500">{c.is_featured ? "Yes" : "No"}</td>
                <td className="px-4 py-3 text-gray-500">{c.sort_order}</td>
              </tr>
            ))}
            {cities.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No cities yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
