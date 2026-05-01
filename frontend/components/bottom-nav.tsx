"use client"

import { usePathname, useRouter } from "next/navigation"
import { Compass, Bookmark, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

// Pages with their own sticky bottom CTA — hide the nav there
const HIDDEN_PREFIXES = [
  "/admin",
]

const TABS = [
  { label: "Plan", icon: Compass, href: "/idea" },
  { label: "Saved", icon: Bookmark, href: "/saved-plans" },
  { label: "Settings", icon: Settings, href: "/settings" },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const hidden = HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))

  if (hidden) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_12px_0_rgba(0,0,0,0.06)]">
      <div className="max-w-lg mx-auto flex">
        {TABS.map(({ label, icon: Icon, href }) => {
          const active =
            pathname === href || pathname.startsWith(href + "/")
          return (
            <button
              key={href}
              type="button"
              onClick={() => router.push(href)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-3 transition-colors",
                active
                  ? "text-teal-600"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
