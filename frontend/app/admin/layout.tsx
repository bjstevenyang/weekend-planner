"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { BarChart3, Building2, Calendar, MapPin, MessageSquare, Newspaper, Rss } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Dashboard", href: "/admin", icon: BarChart3 },
  { label: "Cities", href: "/admin/cities", icon: Building2 },
  { label: "Events", href: "/admin/events", icon: Calendar },
  { label: "Places", href: "/admin/places", icon: MapPin },
  { label: "Sources", href: "/admin/sources", icon: Rss },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { label: "Plans", href: "/admin/plans", icon: Newspaper },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/admin/login") return
    const token = localStorage.getItem("admin_token")
    if (!token) router.replace("/admin/login")
  }, [pathname, router])

  if (pathname === "/admin/login") return <>{children}</>

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 bg-white border-r border-gray-100 flex flex-col">
        <div className="h-14 flex items-center px-4 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900">WFP Admin</span>
        </div>
        <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                pathname === href
                  ? "bg-teal-50 text-teal-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("admin_token")
              router.push("/admin/login")
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
