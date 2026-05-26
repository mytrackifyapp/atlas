"use client"

import { Download } from "lucide-react"

export function CvPrintBar() {
  return (
    <div className="print:hidden sticky top-0 z-10 border-b border-white/10 bg-black/85 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between text-sm">
        <span className="font-semibold tracking-tight text-white">Trackify Finance</span>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-white hover:bg-white/10 transition-colors"
          >
            <Download className="h-4 w-4" aria-hidden />
            Print / Save PDF
          </button>
          <p className="text-xs text-white/60 max-w-[220px] text-right">
            Enable <span className="text-white/90">Background graphics</span> in the print dialog for the black theme.
          </p>
        </div>
      </div>
    </div>
  )
}
