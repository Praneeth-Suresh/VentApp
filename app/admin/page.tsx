"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import type { Submission, Analytics } from "@/lib/types"
import { AlertCircle, LogOut } from "lucide-react"

interface AdminCommentData {
  submission_id: string
  comment: string
}

export default function AdminDashboard() {
  const [apiKey, setApiKey] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      setIsAuthenticated(true)
      localStorage.setItem("admin_api_key", apiKey)
      fetchData()
    }
  }

  const fetchData = async () => {
    setIsLoading(true)
    setError("")

    try {
      const key = apiKey || localStorage.getItem("admin_api_key") || ""

      // Fetch approved submissions
      const submissionsResponse = await fetch("/api/admin/submissions?status=approved", {
        headers: { Authorization: `Bearer ${key}` },
      })

      if (submissionsResponse.status === 401) {
        setError("Invalid API key")
        setIsAuthenticated(false)
        return
      }

      if (!submissionsResponse.ok) {
        throw new Error("Failed to fetch submissions")
      }

      const submissionsData = await submissionsResponse.json()
      setSubmissions(submissionsData)

      // Fetch analytics
      const analyticsResponse = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${key}` },
      })

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("[v0] Admin fetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async (submissionId: string) => {
    if (!commentText.trim()) return

    setSubmittingComment(submissionId)

    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/comment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_api_key") || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: commentText }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      setCommentText("")
      alert("Comment added successfully")
    } catch (err) {
      console.error("[v0] Comment error:", err)
      setError("Failed to add comment")
    } finally {
      setSubmittingComment(null)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setApiKey("")
    setSubmissions([])
    setAnalytics(null)
    localStorage.removeItem("admin_api_key")
  }

  useEffect(() => {
    const savedKey = localStorage.getItem("admin_api_key")
    if (savedKey) {
      setApiKey(savedKey)
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchData()
      const interval = setInterval(fetchData, 60000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary neon-text mb-2">Admin</h1>
            <p className="text-muted-foreground">Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Admin API Key"
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary neon-text">Admin Dashboard</h1>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Analytics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Submissions</div>
              <div className="text-3xl font-bold text-primary">{analytics.total_submissions}</div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Avg Relevance</div>
              <div className="text-3xl font-bold text-accent">{analytics.average_relevance.toFixed(2)}</div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Avg Sentiment</div>
              <div className="text-3xl font-bold text-foreground">{analytics.average_sentiment.toFixed(2)}</div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Flagged</div>
              <div className="text-3xl font-bold text-destructive">{analytics.flagged_count}</div>
            </div>
          </div>
        )}

        {/* Submissions with Comments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">Submissions</h2>
            <Button
              onClick={fetchData}
              variant="outline"
              disabled={isLoading}
              className="text-primary border-primary hover:bg-card bg-transparent"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>

          {submissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No approved submissions yet</div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground">ID: {submission.id}</div>
                        <p className="text-foreground text-lg break-words mt-2">{submission.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                        className="text-primary hover:bg-primary/10"
                      >
                        {expandedId === submission.id ? "Hide" : "Show"} Analysis
                      </Button>
                    </div>

                    {expandedId === submission.id && (
                      <div className="pt-4 border-t border-border space-y-3">
                        {submission.relevance_score !== undefined && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Relevance Score</div>
                              <div className="text-lg font-bold text-accent">
                                {submission.relevance_score.toFixed(3)}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Sentiment Score</div>
                              <div className="text-lg font-bold text-foreground">
                                {submission.sentiment_score?.toFixed(3) || "N/A"}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Comment Section */}
                        <div className="pt-4 border-t border-border space-y-3">
                          <div className="text-sm font-bold text-primary">Add Analysis Comment</div>
                          <textarea
                            value={expandedId === submission.id ? commentText : ""}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add your analysis here..."
                            maxLength={500}
                            disabled={submittingComment === submission.id}
                            className="w-full px-3 py-2 bg-input text-foreground placeholder-muted-foreground border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={3}
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">{commentText.length}/500</span>
                            <Button
                              onClick={() => handleAddComment(submission.id)}
                              disabled={!commentText.trim() || submittingComment === submission.id}
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-accent"
                            >
                              {submittingComment === submission.id ? "Saving..." : "Save Comment"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
