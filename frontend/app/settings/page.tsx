"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, LogOut, Plus, X, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { families, cities as citiesApi, type City } from "@/lib/api"

const BUDGET_OPTIONS = [
  { value: "free", label: "Free first" },
  { value: "under_20", label: "Under $20" },
  { value: "20_50", label: "$20–$50" },
  { value: "50_plus", label: "$50+" },
]

const REMINDER_OPTIONS = [
  { value: "day_before", label: "Day before" },
  { value: "same_day", label: "Same day morning" },
  { value: "none", label: "No reminders" },
]

const TRANSPORT_OPTIONS = [
  { value: "car", label: "Car" },
  { value: "transit", label: "Transit" },
  { value: "walking", label: "Walking" },
  { value: "flexible", label: "Flexible" },
]

export default function SettingsPage() {
  const router = useRouter()

  // Profile state
  const [cityId, setCityId] = useState("")
  const [cityName, setCityName] = useState("")
  const [budget, setBudget] = useState("20_50")
  const [reminder, setReminder] = useState("day_before")
  const [transport, setTransport] = useState("car")
  const [kids, setKids] = useState<number[]>([])

  // City picker state
  const [cityList, setCityList] = useState<City[]>([])
  const [cityPickerOpen, setCityPickerOpen] = useState(false)
  const [citySearch, setCitySearch] = useState("")

  // UI state
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const loadProfile = () => {
    try {
      const raw = localStorage.getItem("family_profile")
      const p = raw ? JSON.parse(raw) : {}
      if (p.city_id) setCityId(p.city_id)
      if (p.budget) setBudget(p.budget)
      if (p.reminder) setReminder(p.reminder)
      if (p.transport) setTransport(p.transport)
      if (Array.isArray(p.children)) setKids(p.children.map((c: { age: number }) => c.age))
      setCityName(localStorage.getItem("city_name") ?? p.city_name ?? "")
    } catch {
      setCityName("")
    }
  }

  useEffect(() => {
    loadProfile()
    citiesApi.list().then(setCityList).catch(() => {})
    window.addEventListener("storage", loadProfile)
    return () => window.removeEventListener("storage", loadProfile)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredCities = cityList.filter(
    (c) =>
      (c.support_status === "active" || c.support_status === "beta") &&
      (`${c.name} ${c.country}`.toLowerCase().includes(citySearch.toLowerCase()))
  )

  const handleSelectCity = (city: City) => {
    setCityId(city.id)
    setCityName(`${city.name}, ${city.country}`)
    setCityPickerOpen(false)
    setCitySearch("")
  }

  const addKid = () => setKids((prev) => [...prev, 5])
  const removeKid = (i: number) => setKids((prev) => prev.filter((_, idx) => idx !== i))
  const updateKidAge = (i: number, delta: number) =>
    setKids((prev) => prev.map((age, idx) => idx === i ? Math.min(17, Math.max(0, age + delta)) : age))

  const handleSave = async () => {
    if (!cityId) {
      toast.error("Please select a city first.")
      return
    }
    setSaving(true)
    try {
      const raw = localStorage.getItem("family_profile")
      const profile = raw ? JSON.parse(raw) : {}
      const merged = {
        ...profile,
        city_id: cityId,
        city_name: cityName,
        budget,
        reminder,
        transport,
        children: kids.map((age) => ({ age })),
      }
      localStorage.setItem("family_profile", JSON.stringify(merged))
      if (cityName) localStorage.setItem("city_name", cityName)
      if (cityId) localStorage.setItem("city_id", cityId)

      const sessionToken = localStorage.getItem("session_token")
      if (!sessionToken) {
        router.push("/login?redirect=/settings")
        return
      }

      const familyId = localStorage.getItem("family_id")
      const apiPayload = {
        city_id: cityId,
        neighborhood: merged.neighborhood,
        children: kids.map((age) => ({ age })),
        budget,
        transport,
        distance: merged.distance ?? "flexible",
        interests: merged.interests ?? [],
        availability: merged.availability ?? [],
        reminder,
      }
      let resolvedFamilyId = familyId
      if (!resolvedFamilyId) {
        try {
          const existing = await families.get()
          resolvedFamilyId = existing.id
          localStorage.setItem("family_id", existing.id)
        } catch {
          // No existing family — will create below
        }
      }
      const family = resolvedFamilyId
        ? await families.update(resolvedFamilyId, apiPayload)
        : await families.create(apiPayload)
      localStorage.setItem("family_id", family.id)

      toast("Settings saved!")
      router.push("/idea")
    } catch {
      toast.error("Couldn't save settings.")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem("user_id")
    localStorage.removeItem("session_token")
    localStorage.removeItem("family_id")
    setSignOutOpen(false)
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
          </button>
          <span className="text-teal-600 font-semibold text-base tracking-tight">Weekend Planner</span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-6 pb-40">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>

        {/* Family profile */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Family profile
          </h2>

          {/* City */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-3">
            <p className="text-sm font-medium text-gray-700 mb-3">City</p>
            {cityPickerOpen ? (
              <div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    placeholder="Search city…"
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    autoFocus
                    className="pl-9"
                  />
                </div>
                <div className="flex flex-col max-h-52 overflow-y-auto -mx-1">
                  {filteredCities.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No cities found.</p>
                  )}
                  {filteredCities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={cn(
                        "text-left px-3 py-2.5 rounded-xl text-sm transition-colors",
                        city.id === cityId
                          ? "bg-teal-50 text-teal-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {city.name}, {city.country}
                      {city.support_status === "beta" && (
                        <span className="ml-2 text-xs text-amber-500">Beta</span>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { setCityPickerOpen(false); setCitySearch("") }}
                  className="mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{cityName || "Not set"}</p>
                <button
                  type="button"
                  onClick={() => setCityPickerOpen(true)}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  {cityName ? "Change" : "Select city"}
                </button>
              </div>
            )}
          </div>

          {/* Children */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-3">
            <p className="text-sm font-medium text-gray-700 mb-3">Children</p>
            <div className="flex flex-col gap-3">
              {kids.length === 0 && (
                <p className="text-sm text-gray-400">No children added yet.</p>
              )}
              {kids.map((age, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-14 shrink-0">Child {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateKidAge(i, -1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-medium transition-colors"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium text-gray-800 w-14 text-center">
                      Age {age}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateKidAge(i, 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-medium transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeKid(i)}
                    className="ml-auto text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addKid}
                className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 transition-colors mt-1"
              >
                <Plus className="size-4" />
                Add child
              </button>
            </div>
          </div>

          {/* Transport */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">How will you get there?</p>
            <div className="flex flex-wrap gap-2">
              {TRANSPORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTransport(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm border transition-colors",
                    transport === opt.value
                      ? "bg-teal-50 border-teal-600 text-teal-700 font-medium"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Preferences
          </h2>

          <div className="bg-white rounded-2xl shadow-sm p-4 mb-3">
            <p className="text-sm font-medium text-gray-700 mb-3">Default budget</p>
            <div className="flex flex-wrap gap-2">
              {BUDGET_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBudget(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm border transition-colors",
                    budget === opt.value
                      ? "bg-teal-50 border-teal-600 text-teal-700 font-medium"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Reminders</p>
            <div className="flex flex-col gap-2">
              {REMINDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReminder(opt.value)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl border text-left transition-colors",
                    reminder === opt.value
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    reminder === opt.value ? "text-teal-700" : "text-gray-700"
                  )}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="mb-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">
            Account
          </h2>
          <div className="bg-white rounded-2xl shadow-sm">
            <button
              type="button"
              onClick={() => setSignOutOpen(true)}
              className="flex items-center gap-3 w-full px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
            >
              <LogOut className="size-4" />
              <span className="text-sm font-medium">Sign out</span>
            </button>
          </div>
        </section>
      </div>

      {/* Sticky save */}
      <div className="sticky bottom-16 z-40 bg-white border-t border-gray-100 shadow-[0_-2px_12px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-lg mx-auto px-4 h-[72px] flex items-center">
          <Button
            className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white border-none"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      {/* Sign out dialog */}
      <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 py-2">
            You&apos;ll need to sign in again to access your saved plans.
          </p>
          <div className="flex flex-col gap-2 mt-2">
            <Button
              className="w-full h-10 rounded-xl bg-red-500 hover:bg-red-600 text-white border-none"
              onClick={handleSignOut}
            >
              Sign out
            </Button>
            <button
              type="button"
              onClick={() => setSignOutOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors text-center py-2"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
