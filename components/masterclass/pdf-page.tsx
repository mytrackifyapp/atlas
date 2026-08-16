import { MASTERCLASS, SLIDE_META } from "@/lib/masterclass-content"
import { cn } from "@/lib/utils"

const TOTAL = SLIDE_META.length

export function PdfPage({
  index,
  children,
  bleed = false,
  className,
}: {
  index: number
  children: React.ReactNode
  bleed?: boolean
  className?: string
}) {
  const meta = SLIDE_META[index]
  const n = String(index + 1).padStart(2, "0")

  return (
    <article
      id={`p${index + 1}`}
      className={cn(
        "masterclass-page relative flex flex-col overflow-hidden bg-black text-white",
        bleed ? "p-0" : "px-11 py-7",
        className,
      )}
    >
      {!bleed && <div className="masterclass-spine" aria-hidden />}
      {!bleed && (
        <header className="mb-5 flex items-baseline justify-between gap-4">
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-primary">{n}</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/35">
            {meta.section}
          </p>
        </header>
      )}
      <div className={cn("min-h-0 flex-1", bleed ? "h-full" : "")}>{children}</div>
      {!bleed && (
        <footer className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
            {MASTERCLASS.title} · {MASTERCLASS.presenter}
          </p>
          <p className="font-mono text-[10px] text-white/30">
            {index + 1} / {TOTAL}
          </p>
        </footer>
      )}
    </article>
  )
}
