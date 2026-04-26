import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Banknote, Users, MapPin } from "lucide-react"
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

const badgeColorMap: Record<BadgeColor, string> = {
  teal: "bg-teal-100 text-teal-700 border-teal-200",
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
}

export function PlanCard({
  badge,
  badgeColor,
  title,
  time,
  budget,
  ages,
  location,
}: PlanCardProps) {
  return (
    <Card className="flex-shrink-0 w-72 md:w-auto bg-white shadow-sm rounded-2xl py-0 ring-0">
      <CardContent className="p-5 flex flex-col gap-3">
        <Badge className={cn("w-fit", badgeColorMap[badgeColor])}>{badge}</Badge>
        <h3 className="font-semibold text-gray-800 text-base leading-snug">{title}</h3>
        <div className="flex flex-col gap-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="size-3.5 shrink-0" />
            <span>{budget}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-3.5 shrink-0" />
            <span>{ages}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0" />
            <span>{location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
