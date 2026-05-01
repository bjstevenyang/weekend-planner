"use client"

import { useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { auth, plans, families, cities } from "@/lib/api"

export default function AuthVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const redirect = searchParams.get("redirect") ?? "/saved-plans"
  const attempted = useRef(false)

  useEffect(() => {
    if (attempted.current || !token) return
    attempted.current = true

    auth.verify(token)
      .then(async ({ user_id, session_token }) => {
        localStorage.setItem("user_id", user_id)
        localStorage.setItem("session_token", session_token)

        const raw = localStorage.getItem("family_profile")
        const localPayload = (() => { try { return JSON.parse(raw ?? "") } catch { return null } })()

        if (localPayload?.city_id) {
          // Push local profile to DB
          try {
            const payload = {
              city_id: localPayload.city_id,
              neighborhood: localPayload.neighborhood,
              children: localPayload.children ?? [],
              budget: localPayload.budget ?? "20_50",
              transport: localPayload.transport ?? "flexible",
              distance: localPayload.distance ?? "flexible",
              interests: localPayload.interests ?? [],
              availability: localPayload.availability ?? [],
              reminder: localPayload.reminder ?? "day_before",
            }
            const existingId = localStorage.getItem("family_id")
            const family = existingId
              ? await families.update(existingId, payload)
              : await families.create(payload)
            localStorage.setItem("family_id", family.id)
          } catch {
            // Non-fatal
          }
        } else {
          // No local profile — pull from DB (e.g. new device login)
          try {
            const family = await families.get()
            localStorage.setItem("family_id", family.id)

            const localProfile: Record<string, unknown> = {
              city_id: family.city_id,
              neighborhood: family.neighborhood,
              transport: family.transportation_mode,
              budget: family.budget_level,
              distance: family.distance_preference,
              reminder: family.reminder_preference,
              children: family.children.map(({ age }) => ({ age })),
              interests: family.interests,
              availability: family.availability,
            }

            // Fetch city name to display in settings/idea
            if (family.city_id) {
              try {
                const city = await cities.get(family.city_id)
                const cityName = `${city.name}, ${city.country}`
                localProfile.city_name = cityName
                localStorage.setItem("city_name", cityName)
                localStorage.setItem("city_id", family.city_id)
              } catch {}
            }

            localStorage.setItem("family_profile", JSON.stringify(localProfile))
          } catch {
            // No family in DB yet — user starts fresh in settings
          }
        }

        // Claim any anonymously generated plans
        const pendingPlanRequestId = localStorage.getItem("pending_plan_request_id")
        if (pendingPlanRequestId) {
          try {
            await plans.claim(pendingPlanRequestId)
            localStorage.removeItem("pending_plan_request_id")
          } catch {
            // Non-fatal
          }
        }

        const familyId = localStorage.getItem("family_id")
        router.replace(familyId ? redirect : "/settings")
      })
      .catch(() => {
        router.replace("/auth/expired")
      })
  }, [token, redirect, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div
          className="mx-auto mb-4 w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-500">Signing you in…</p>
      </div>
    </div>
  )
}
