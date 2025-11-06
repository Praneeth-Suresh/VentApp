"use client"

import { Info } from "lucide-react"

export function DisclaimerSection() {
  return (
    <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto text-sm text-foreground space-y-3">
      <div className="flex gap-2">
        <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-primary mb-2">Disclaimer</h3>
          <p className="text-muted-foreground">
            This platform is for anonymous feedback only. All submissions are moderated and analyzed to identify trends
            and concerns. Your identity is protected and will not be disclosed. Submissions containing hate speech,
            threats, or harassment will be removed. This tool is designed to improve NUS community experience and is not
            a crisis service.
          </p>
        </div>
      </div>
    </div>
  )
}
