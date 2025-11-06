"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { Submission } from "@/lib/types"
import { AlertCircle, Check, X } from "lucide-react"

export default function ModeratorDashboard() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      setIsAuthenticated(true)
      localStorage.setItem("moderator_api_key", apiKey)
      fetchSubmissions()
    }
  }

  const fetchSubmissions = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/submissions?status=pending", {
        headers: {
          Authorization: `Bearer ${apiKey || localStorage.getItem("moderator_api_key") || ""}`,
        },
      })

      if (response.status === 401) {
        setError("Invalid API key")
        setIsAuthenticated(false)
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch submissions")
      }

      const data = await response.json()
      setSubmissions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("[v0] Fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFlag = async (id: string) => {
    setProcessingId(id)

    try {
      const response = await fetch(`/api/submissions/${id}/flag`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("moderator_api_key") || ""}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to flag submission")
      }

      setSubmissions((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error("[v0] Flag error:", err)
      setError("Failed to flag submission")
    } finally {
      setProcessingId(null)
    }
  }

  const handleClear = async (id: string) => {
    setProcessingId(id)

    try {
      const response = await fetch(`/api/submissions/${id}/clear`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("moderator_api_key") || ""}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to clear submission")
      }

      setSubmissions((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error("[v0] Clear error:", err)
      setError("Failed to clear submission")
    } finally {
      setProcessingId(null)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setApiKey("")
    setSubmissions([])
    localStorage.removeItem("moderator_api_key")
  }

  useEffect(() => {
    const savedKey = localStorage.getItem("moderator_api_key")
    if (savedKey) {
      setApiKey(savedKey)
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchSubmissions()
      const interval = setInterval(fetchSubmissions, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary neon-text mb-2">Moderator</h1>
            <p className="text-muted-foreground">Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API Key"
                className="w-full px-4 py-3 bg-card text-foreground placeholder-muted-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-accent font-bold py-3 rounded-lg neon-glow"
            >
              Login
            </Button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary neon-text">Moderation Queue</h1>
            <p className="text-muted-foreground">{submissions.length} pending</p>
          </div>

          <div className="space-x-2">
            <Button
              onClick={fetchSubmissions}
              variant="outline"
              disabled={isLoading}
              className="text-primary border-primary hover:bg-card bg-transparent"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
            >
              Logout
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No pending submissions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">ID: {submission.id}</div>
                  <p className="text-foreground text-lg break-words">{submission.content}</p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => handleFlag(submission.id)}
                    disabled={processingId === submission.id}
                    className="flex-1 bg-destructive text-destructive-foreground hover:bg-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Flag for Removal
                  </Button>

                  <Button
                    onClick={() => handleClear(submission.id)}
                    disabled={processingId === submission.id}
                    className="flex-1 bg-accent text-accent-foreground hover:bg-lime-500"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
