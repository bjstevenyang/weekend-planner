import { cn } from "@/lib/utils"

type BadgeColor = "teal" | "blue" | "purple"

interface PlanCardProps {
  badge: string
  badgeColor: BadgeColor
  title: string
  time: string
  budget: string
  ages: string
  location: string
}

const gradientMap: Record<BadgeColor, string> = {
  teal: "from-emerald-400 to-teal-600",
  blue: "from-sky-400 to-blue-600",
  purple: "from-orange-400 to-rose-500",
}

const badgeBgMap: Record<BadgeColor, string> = {
  teal: "bg-emerald-500",
  blue: "bg-sky-500",
  purple: "bg-orange-500",
}

export function PlanCard({ badge, badgeColor, title, time, budget, ages, location }: PlanCardProps) {
  return (
    <div className="flex-shrink-0 w-72 md:w-auto bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Gradient image area */}
      <div className={cn("h-36 bg-gradient-to-br relative", gradientMap[badgeColor])}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-3 left-3">
          <span className={cn("text-white text-xs font-semibold px-2.5 py-1 rounded-full", badgeBgMap[badgeColor])}>
            {badge}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2">{title}</h3>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
          <span>{time}</span>
          <span>·</span>
          <span>{budget}</span>
          <span>·</span>
          <span>{ages}</span>
          <span>·</span>
          <span>{location}</span>
        </div>
      </div>
    </div>
  )
}
