import { DeckImage } from "@/components/deck/deck-image"
import { cn } from "@/lib/utils"

const TOTAL = 6

const CREATOR =
  "A creator can build an audience without having the infrastructure to build a business."

const GROWTH =
  "And when these businesses are ready to grow, the path from operating a company to becoming investment-ready and accessing capital is still fragmented."

const PROBLEM_NOT = "The problem is not a lack of ideas or ambition."

const PLATFORMS = ["banking", "payments", "finances", "operations", "AI tools", "fundraising"] as const

const JOURNEY = ["building a business", "operating it", "growing it", "financing it"] as const

function Page({
  index,
  children,
  bleed = false,
}: {
  index: number
  children: React.ReactNode
  bleed?: boolean
}) {
  const n = String(index + 1).padStart(2, "0")

  return (
    <article
      id={`gap-${n}`}
      className={cn(
        "gap-page relative flex flex-col overflow-hidden bg-black text-white",
        bleed ? "p-0" : "px-12 py-8",
      )}
    >
      {!bleed && <div className="masterclass-spine" aria-hidden />}
      {!bleed && (
        <header className="mb-6 flex items-baseline justify-between">
          <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-primary">{n}</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/35">
            The infrastructure gap
          </p>
        </header>
      )}
      <div className={cn("min-h-0 flex-1", bleed && "h-full")}>{children}</div>
      {!bleed && (
        <footer className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">Trackify</p>
          <p className="font-mono text-[10px] text-white/30">
            {index + 1} / {TOTAL}
          </p>
        </footer>
      )}
    </article>
  )
}

function CoverSlide() {
  return (
    <Page index={0} bleed>
      <div className="relative flex h-full flex-col justify-between overflow-hidden">
        <DeckImage
          src="/bg-04.jpg"
          alt=""
          className="deck-image-banner absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/40" />
        <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
        <div className="relative z-10 flex items-start justify-between px-12 pt-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Trackify</p>
          <p className="font-mono text-[11px] text-white/40">01 / 06</p>
        </div>
        <div className="relative z-10 max-w-4xl px-12 pb-12">
          <h1 className="text-[2.65rem] font-semibold leading-[1.12] tracking-tight text-white">
            Africa is producing a new generation of founders, creators and digital businesses,
          </h1>
          <p className="mt-6 max-w-3xl text-[1.65rem] font-medium leading-snug text-white/70">
            but the infrastructure available to turn an idea into a scalable, financeable company{" "}
            <span className="text-primary">remains fragmented.</span>
          </p>
        </div>
      </div>
    </Page>
  )
}

function CreatorSlide() {
  return (
    <Page index={1}>
      <div className="flex h-full flex-col justify-between">
        <p className="max-w-4xl text-[2.35rem] font-semibold leading-[1.18] tracking-tight text-white">
          {CREATOR}
        </p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">Audience</p>
            <div className="mt-4 flex gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="h-10 w-10 rounded-full bg-primary/80" />
              ))}
            </div>
          </div>
          <div className="mb-5 flex items-center gap-2 text-white/25" aria-hidden>
            <span className="h-px w-16 bg-white/25" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-px w-10 border-t border-dashed border-white/30" />
            <span className="text-lg leading-none text-white/35">×</span>
            <span className="h-px w-10 border-t border-dashed border-white/30" />
          </div>
          <div className="justify-self-end text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">Business</p>
            <div className="mt-4 h-16 w-56 border border-dashed border-white/20" />
          </div>
        </div>
      </div>
    </Page>
  )
}

function FounderSlide() {
  return (
    <Page index={2}>
      <div className="flex h-full flex-col justify-between">
        <p className="max-w-5xl text-[1.85rem] font-semibold leading-[1.22] tracking-tight text-white">
          A founder can build a product while managing{" "}
          <span className="text-white/45">
            banking, payments, finances, operations, AI tools and fundraising
          </span>{" "}
          across completely disconnected platforms.
        </p>
        <div className="grid grid-cols-6 gap-3">
          {PLATFORMS.map((name, i) => (
            <div key={name} className="border border-white/12 bg-white/[0.03] px-3 py-5">
              <p className="font-mono text-[10px] text-white/30">0{i + 1}</p>
              <p className="mt-3 text-lg font-semibold leading-tight text-white">{name}</p>
              <div className="mt-6 h-px w-8 bg-primary" />
            </div>
          ))}
        </div>
      </div>
    </Page>
  )
}

function GrowthSlide() {
  return (
    <Page index={3}>
      <div className="flex h-full flex-col justify-between">
        <p className="max-w-5xl text-[2.05rem] font-semibold leading-[1.2] tracking-tight text-white">
          {GROWTH}
        </p>
        <div className="grid grid-cols-[1fr_72px_1fr_72px_1fr] items-center">
          {["operating a company", "investment-ready", "accessing capital"].map((label, i) => (
            <div key={label} className="contents">
              {i > 0 && (
                <div className="flex items-center justify-center text-white/30" aria-hidden>
                  <span className="h-px w-5 border-t border-dashed border-white/30" />
                  <span className="px-1 text-sm">×</span>
                  <span className="h-px w-5 border-t border-dashed border-white/30" />
                </div>
              )}
              <div className={cn("border px-5 py-6", i === 2 ? "border-primary/50" : "border-white/12")}>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">0{i + 1}</p>
                <p className={cn("mt-3 text-2xl font-semibold", i === 2 ? "text-primary" : "text-white")}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  )
}

function ProblemSlide() {
  return (
    <Page index={4}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <p className="text-2xl font-medium text-white/40">{PROBLEM_NOT}</p>
          <p className="mt-5 max-w-5xl text-[2rem] font-semibold leading-[1.18] tracking-tight text-white">
            It is the lack of an integrated infrastructure layer connecting the journey from{" "}
            <span className="text-primary">building a business</span>, to{" "}
            <span className="text-primary">operating it</span>, to{" "}
            <span className="text-primary">growing it</span>, to{" "}
            <span className="text-primary">financing it</span>.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {JOURNEY.map((step, i) => (
            <div key={step} className="relative border-t-2 border-primary pt-4">
              <p className="font-mono text-[11px] text-white/35">0{i + 1}</p>
              <p className="mt-2 text-xl font-semibold text-white">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </Page>
  )
}

function GapSlide() {
  return (
    <Page index={5} bleed>
      <div className="relative flex h-full flex-col justify-between overflow-hidden">
        <DeckImage
          src="/inc-hero2.jpg"
          alt=""
          className="deck-image-banner absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/55" />
        <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
        <div className="relative z-10 flex items-start justify-between px-12 pt-9">
          <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-primary">06</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/35">
            The infrastructure gap
          </p>
        </div>
        <p className="relative z-10 max-w-5xl px-12 pb-14 text-[1.85rem] font-semibold leading-[1.28] tracking-tight text-white">
          This gap is particularly significant across Africa&apos;s rapidly expanding creator, digital and startup
          economies, where individuals and small teams are increasingly building businesses that can reach global
          markets but often{" "}
          <span className="text-primary">lack the infrastructure to scale like modern companies.</span>
        </p>
      </div>
    </Page>
  )
}

export function InfrastructureGapDeck() {
  return (
    <div className="gap-deck dark bg-neutral-950 text-white">
      <div className="gap-page-stack mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-8 print:max-w-none print:gap-0 print:p-0">
        <CoverSlide />
        <CreatorSlide />
        <FounderSlide />
        <GrowthSlide />
        <ProblemSlide />
        <GapSlide />
      </div>
    </div>
  )
}
