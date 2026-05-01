import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-bold text-teal-600 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-sm text-gray-500 mb-8">
        That page doesn&apos;t exist. Maybe the link is outdated?
      </p>
      <Link
        href="/"
        className="inline-flex items-center h-11 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
      >
        Go back home
      </Link>
    </div>
  )
}
