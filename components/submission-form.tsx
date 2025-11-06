"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface SubmissionFormProps {
  onSuccess: () => void
  currentCount: number
}

export function SubmissionForm({ onSuccess, currentCount }: SubmissionFormProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!content.trim()) {
      setError("Please enter your feedback")
      return
    }

    if (content.length > 1000) {
      setError("Feedback must be under 1000 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      const data = await response.json()
      setContent("")
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("[v0] Submission error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's your problem?"
            maxLength={1000}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-card text-foreground placeholder-muted-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
          />
          <div className="text-sm text-muted-foreground mt-1">{content.length}/1000</div>
        </div>

        {error && <div className="text-destructive text-sm">{error}</div>}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground font-bold py-3 rounded-lg transition-all neon-glow"
        >
          {isLoading ? "Submitting..." : "Submit"}
        </Button>

        <div className="text-center text-muted-foreground text-sm">{currentCount} others have vented</div>
      </div>
    </form>
  )
}
