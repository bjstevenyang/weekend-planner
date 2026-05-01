"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

interface Plan {
  id: string; title: string; plan_type: string
  budget?: string; location?: string
  generation_status: string; created_at: string
}

const TYPE_COLORS: Record<string, string> = {
  low_cost: "bg-teal-100 text-teal-700 border-teal-200",
  rain_friendly: "bg-blue-100 text-blue-700 border-blue-200",
  special_event: "bg-purple-100 text-purple-700 border-purple-200",
  place_based_fallback: "bg-gray-100 text-gray-500 border-gray-200",
  custom_idea: "bg-amber-100 text-amber-700 border-amber-200",
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    const token = localStorage.getItem("admin_token") ?? ""
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/admin/plans`, {
      headers: { "x-admin-token": token },
    }).then((r) => r.json()).then(setPlans).catch(() => {})
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Generated Plans</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background border-b border-gray-100">
            <tr>
              {["Title", "Type", "Budget", "Location", "Status", "Created"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-background">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                <td className="px-4 py-3">
                  <Badge className={TYPE_COLORS[p.plan_type] ?? ""}>{p.plan_type}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.budget ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{p.location ?? "—"}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{p.generation_status}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {plans.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No generated plans yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
