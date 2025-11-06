"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Submission } from "@/lib/types"

export default function Tracker() {
  const router = useRouter()
  const [queryId, setQueryId] = useState("")
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmission(null)

    if (!queryId.trim()) {
      setError("Please enter a query ID")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/submissions/${queryId}`)

      if (response.status === 404) {
        setError("Feedback not found. Please check your ID.")
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch feedback")
      }

      const data = await response.json()
      setSubmission(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("[v0] Tracker error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-accent"
      case "flagged":
        return "text-destructive"
      case "pending":
        return "text-muted-foreground"
      default:
        return "text-foreground"
    }
  }

  const getStatusDisplay = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-8 pt-8">
        {/* Header */}
        <div className="space-y-4">
          <Button onClick={() => router.push("/")} variant="ghost" size="sm" className="text-primary hover:bg-card">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-primary neon-text">Track Feedback</h1>
          <p className="text-muted-foreground text-sm">Enter your feedback ID to check the status</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <input
              type="text"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder="Enter your feedback ID"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-card text-foreground placeholder-muted-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="text-destructive text-sm bg-card p-3 rounded-lg border border-destructive/30">{error}</div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground font-bold py-3 rounded-lg neon-glow"
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </form>

        {/* Results */}
        {submission && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className={`text-2xl font-bold ${getStatusColor(submission.status)}`}>
                {getStatusDisplay(submission.status)}
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="text-sm text-muted-foreground">Your Feedback</div>
              <p className="text-foreground break-words">{submission.content}</p>
            </div>

            <div className="border-t border-border pt-4">
              <div className="text-sm text-muted-foreground">
                Submitted {new Date(submission.timestamp).toLocaleDateString()}
              </div>
            </div>

            {submission.status === "flagged" && (
              <div className="border-t border-border pt-4 bg-destructive/10 p-3 rounded text-destructive text-sm">
                This feedback has been flagged for review by our moderation team.
              </div>
            )}

            {submission.status === "approved" && (
              <div className="border-t border-border pt-4 bg-accent/10 p-3 rounded text-accent text-sm">
                This feedback has been reviewed and approved for analysis.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
