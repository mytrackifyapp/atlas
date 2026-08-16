"use client"

import { Download } from "lucide-react"
import Link from "next/link"

export function MasterclassPrintBar() {
  return (
    <div className="print:hidden sticky top-0 z-20 border-b border-white/10 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <Link href="/" className="text-sm font-semibold tracking-tight text-white hover:text-primary">
            Trackify · The AI Investment Thesis
          </Link>
          <p className="hidden text-xs text-white/45 sm:block">
            Save as PDF · Landscape · enable Background graphics
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
        >
          <Download className="h-4 w-4" aria-hidden />
          Save PDF
        </button>
      </div>
    </div>
  )
}
