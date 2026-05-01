"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlanCard } from "@/components/plan-card"
import { Heart, MapPin, Lightbulb, Star, ListChecks, Bell } from "lucide-react"
const samplePlans = [
  {
    badge: "Low-cost",
    badgeColor: "teal" as const,
    title: "Library Storytime + Deer Lake Walk",
    time: "Saturday afternoon · 2.5h",
    budget: "Free",
    ages: "Ages 4–8",
    location: "Burnaby",
  },
  {
    badge: "Rain-friendly",
    badgeColor: "blue" as const,
    title: "Science World Indoor Afternoon",
    time: "Sunday afternoon · 3h",
    budget: "$20–50",
    ages: "Ages 6–12",
    location: "Vancouver",
  },
  {
    badge: "Special event",
    badgeColor: "purple" as const,
    title: "Family Art Workshop",
    time: "Saturday morning · 2h",
    budget: "Under $20",
    ages: "Ages 5–10",
    location: "Vancouver",
  },
]

const features = [
  { icon: Heart, label: "Personalized to your family" },
  { icon: MapPin, label: "Built around your city and nearby areas" },
  { icon: Lightbulb, label: "Tell us your idea, or let us suggest plans" },
  { icon: Star, label: "Real local activities and trusted places" },
  { icon: ListChecks, label: "Clear timeline, budget, and preparation checklist" },
  { icon: Bell, label: "Reminder before the plan" },
]

export default function Home() {
  const router = useRouter()
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    setHasProfile(!!localStorage.getItem("family_profile"))
  }, [])

  const handleStart = () => {
    const hasProfile = !!localStorage.getItem("family_profile")
    router.push(hasProfile ? "/idea" : "/settings")
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-teal-600 font-semibold text-base tracking-tight">
            Weekend Planner
          </span>
          <a
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Sign in
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-lg mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          Plan a better family weekend in minutes
        </h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          Get 3 personalized weekend plans based on your city, kids&apos; ages,
          budget, interests, and what you feel like doing this weekend.
        </p>
        <div className="flex justify-center">
          <Button
            className="w-full max-w-xs h-12 text-base rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none"
            onClick={handleStart}
          >
            {hasProfile ? "Plan this weekend →" : "Get started →"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Available in selected cities
        </p>
      </section>

      {/* Sample Plans */}
      <section className="py-10">
        <p className="text-center text-xs font-semibold tracking-widest text-gray-400 uppercase mb-6">
          Sample Plans
        </p>
        <div className="px-4 overflow-x-auto">
          <div className="flex gap-4 md:grid md:grid-cols-3 md:max-w-5xl md:mx-auto pb-2">
            {samplePlans.map((plan) => (
              <PlanCard key={plan.title} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-2xl mx-auto px-6 py-14">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-10">
          Everything a busy parent needs
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {features.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="mt-0.5 flex-shrink-0 size-6 rounded-full bg-teal-50 flex items-center justify-center">
                <Icon className="size-3 text-teal-600" />
              </span>
              <span className="text-sm text-gray-600 leading-snug">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-50 py-16 px-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
          Ready to plan this weekend?
        </h2>
        <Button
          className="h-12 px-8 text-base rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none"
          onClick={handleStart}
        >
          Plan this weekend →
        </Button>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-xs text-gray-400">
          © 2025 Weekend Family Planner ·{" "}
          <a href="#" className="hover:text-gray-600 transition-colors">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="#" className="hover:text-gray-600 transition-colors">
            Terms
          </a>
        </p>
      </footer>
    </div>
  )
}
