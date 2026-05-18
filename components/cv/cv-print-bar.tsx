"use client"

import { Download } from "lucide-react"

export function CvPrintBar() {
  return (
    <div className="print:hidden sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between text-sm">
        <span className="font-semibold tracking-tight text-foreground">Trackify Finance</span>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-foreground/90 hover:bg-muted hover:text-foreground transition-colors"
        >
          <Download className="h-4 w-4" aria-hidden />
          Print / Save PDF
        </button>
      </div>
    </div>
  )
}
