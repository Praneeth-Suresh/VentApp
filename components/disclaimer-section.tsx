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
            This is a feedback prototype, not an official NUS reporting or crisis service. Use fictional examples only.
            Do not include names, contact details, or other information that could identify someone.
          </p>
        </div>
      </div>
    </div>
  )
}
