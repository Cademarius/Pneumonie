"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler la vérification d'authentification
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"

      if (isAuthenticated) {
        router.push("/dashboard")
      } else {
        router.push("/auth/login")
      }
    }

    // Petit délai pour éviter le flash
    setTimeout(checkAuth, 500)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Chargement de PneumoDetect...</p>
      </div>
    </div>
  )
}
