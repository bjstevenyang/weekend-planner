"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

type CityStatus = "available" | "beta" | "coming-soon"

interface City {
  name: string
  region: string
  status: CityStatus
}

interface StatusConfig {
  badge: string
  badgeClass: string
  description: string
  actionLabel: string
  actionHref: string
  buttonClass: string
  isOutline: boolean
}

const allCities: City[] = [
  { name: "Vancouver", region: "Canada", status: "available" },
  { name: "Burnaby", region: "Canada", status: "available" },
  { name: "Beijing", region: "China", status: "beta" },
  { name: "Shanghai", region: "China", status: "coming-soon" },
  { name: "Toronto", region: "Canada", status: "coming-soon" },
]

const statusConfig: Record<CityStatus, StatusConfig> = {
  available: {
    badge: "Available",
    badgeClass: "bg-teal-100 text-teal-700 border-teal-200",
    description: "Full local plan recommendations available",
    actionLabel: "Continue →",
    actionHref: "/onboarding",
    buttonClass: "bg-teal-600 hover:bg-teal-700 text-white border-none",
    isOutline: false,
  },
  beta: {
    badge: "Beta",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    description: "Limited verified sources",
    actionLabel: "Try beta →",
    actionHref: "/onboarding",
    buttonClass: "border-amber-400 text-amber-600 hover:bg-amber-50",
    isOutline: true,
  },
  "coming-soon": {
    badge: "Coming soon",
    badgeClass: "bg-gray-100 text-gray-500 border-gray-200",
    description: "Join waitlist to be notified",
    actionLabel: "Join waitlist",
    actionHref: "/waitlist",
    buttonClass: "",
    isOutline: true,
  },
}

export default function CityPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const filtered = allCities.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.region.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <Link
            href="/"
            className="text-teal-600 font-semibold text-base tracking-tight"
          >
            Weekend Planner
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Where is your family based?
          </h1>
          <p className="text-sm text-gray-500">
            Choose your city to get personalized weekend plans.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search city or region"
            className="pl-9 h-10 text-sm"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* City list */}
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">
            Featured cities
          </p>
          <div className="flex flex-col gap-3">
            {filtered.map((city) => {
              const config = statusConfig[city.status]
              return (
                <div
                  key={`${city.name}-${city.region}`}
                  className="bg-white rounded-xl shadow-sm p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-medium text-gray-900">
                          {city.name}
                        </span>
                        <Badge className={config.badgeClass}>
                          {config.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{city.region}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {config.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {config.isOutline ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(config.actionHref)}
                        >
                          {config.actionLabel}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className={config.buttonClass}
                          onClick={() => router.push(config.actionHref)}
                        >
                          {config.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">
                No cities found for &ldquo;{query}&rdquo;
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500 mb-1">
            Can&apos;t find your city?
          </p>
          <Link
            href="/waitlist"
            className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            Request your city →
          </Link>
        </div>
      </div>
    </div>
  )
}
