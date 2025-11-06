"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SubmissionForm } from "@/components/submission-form"
import { DisclaimerSection } from "@/components/disclaimer-section"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()
  const [count, setCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/submissions/count")
        if (response.ok) {
          const data = await response.json()
          setCount(data.count)
        }
      } catch (err) {
        console.error("[v0] Failed to fetch count:", err)
      }
    }

    fetchCount()
  }, [refreshKey])

  const handleSuccess = () => {
    setCount((prev) => prev + 1)
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-primary neon-text">vent.</h1>
          <p className="text-muted-foreground text-sm">NUS Anonymous Feedback</p>
        </div>

        {/* Submission Form */}
        <SubmissionForm onSuccess={handleSuccess} currentCount={count} />

        {/* Disclaimer */}
        <DisclaimerSection />

        {/* Query Tracker Link */}
        <div className="text-center">
          <Button
            onClick={() => router.push("/tracker")}
            variant="outline"
            className="text-primary border-primary hover:bg-card"
          >
            Track Your Feedback
          </Button>
        </div>
      </div>
    </main>
  )
}
