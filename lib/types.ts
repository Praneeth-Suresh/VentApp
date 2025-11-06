export interface Submission {
  id: string
  content: string
  timestamp: number
  status: "pending" | "flagged" | "approved"
  relevance_score?: number
  sentiment_score?: number
  count?: number
}

export interface ModerationAction {
  id: string
  submission_id: string
  moderator_id: string
  action: "flag" | "clear"
  timestamp: number
  reason?: string
}

export interface AdminComment {
  id: string
  submission_id: string
  comment: string
  timestamp: number
}

export interface Analytics {
  id: string
  date: string
  total_submissions: number
  average_relevance: number
  average_sentiment: number
  flagged_count: number
  sentiment_distribution: Record<string, number>
}
