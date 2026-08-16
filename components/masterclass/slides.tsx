import { DeckImage } from "@/components/deck/deck-image"
import { PdfPage } from "@/components/masterclass/pdf-page"
import {
  AFRICA_ADVANTAGES,
  AGENT_JOBS,
  AI_FUNCTIONS,
  DILIGENCE_LENS,
  ERAS,
  EXERCISE_INDUSTRIES,
  EXERCISE_QUESTIONS,
  FINTECH_ERAS,
  FOUNDER_SHIFTS,
  MASTERCLASS,
  MOATS,
  NOT_THE_UNICORN,
  OLD_RULES,
  SCARCITY,
  THESIS_VECTORS,
  VALUE_STACK,
} from "@/lib/masterclass-content"
import { cn } from "@/lib/utils"

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{children}</p>
  )
}

function Title({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2 className={cn("text-[2.15rem] font-semibold leading-[1.12] tracking-tight text-white", className)}>
      {children}
    </h2>
  )
}

function CoverSlide() {
  return (
    <PdfPage index={0} bleed>
      <div className="relative flex h-full flex-col justify-between overflow-hidden">
        <DeckImage
          src="/bg-04.jpg"
          alt=""
          className="deck-image-banner absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/35" />
        <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
        <div className="relative z-10 flex items-start justify-between px-12 pt-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            {MASTERCLASS.duration}
          </p>
          <p className="font-mono text-[11px] text-white/40">01 / 20</p>
        </div>
        <div className="relative z-10 px-12 pb-10">
          <h1 className="max-w-3xl text-[4.25rem] font-semibold leading-[0.92] tracking-tight text-white">
            The AI
            <br />
            Investment
            <br />
            <span className="text-primary">Thesis</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/70">{MASTERCLASS.subtitle}</p>
          <div className="mt-8 grid max-w-3xl grid-cols-3 gap-8 border-t border-white/15 pt-5">
            <div>
              <p className="text-sm font-semibold text-white">{MASTERCLASS.presenter}</p>
              <p className="mt-0.5 text-xs text-white/45">{MASTERCLASS.role}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Trackify</p>
              <p className="mt-0.5 text-xs text-white/45">{MASTERCLASS.tagline}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">PDF brief</p>
              <p className="mt-0.5 text-xs text-white/45">20 pages · 60–90 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </PdfPage>
  )
}

function QuestionSlide() {
  return (
    <PdfPage index={1}>
      <div className="grid h-full grid-cols-[1.15fr_0.85fr] gap-10">
        <div className="flex flex-col justify-between">
          <div>
            <Kicker>The question</Kicker>
            <Title className="mt-3 text-[2.6rem]">
              What if we&apos;re investing with yesterday&apos;s rules?
            </Title>
          </div>
          <p className="max-w-md border-l-2 border-primary pl-4 text-base leading-relaxed text-white/70">
            If AI changes how companies are built, it should change how we underwrite them.
          </p>
        </div>
        <div className="flex flex-col justify-center border-l border-white/10 pl-8">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Inherited heuristics
          </p>
          <ul className="space-y-2.5">
            {OLD_RULES.map((rule) => (
              <li key={rule} className="text-lg text-white/40 line-through decoration-white/25">
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PdfPage>
  )
}

function ErasSlide() {
  return (
    <PdfPage index={2}>
      <div className="flex h-full flex-col">
        <Kicker>Every era rewarded a different advantage</Kicker>
        <Title className="mt-3">What did each revolution reward?</Title>
        <div className="relative mt-10 grid flex-1 grid-cols-5 gap-3">
          <div className="absolute left-0 right-0 top-[2.35rem] h-px bg-white/15" />
          {ERAS.map((item, i) => (
            <div key={item.era} className="relative flex flex-col">
              <div
                className={cn(
                  "relative z-10 mb-5 h-3 w-3 rounded-full",
                  item.highlight ? "bg-primary ring-4 ring-primary/25" : "bg-white/35",
                )}
              />
              <p className="font-mono text-[10px] text-white/35">0{i + 1}</p>
              <p className="mt-2 text-lg font-semibold text-white">{item.era}</p>
              <p className={cn("mt-1 text-sm", item.highlight ? "text-primary" : "text-white/50")}>
                {item.rewarded}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-auto border-t border-white/10 pt-4 text-xl font-medium text-white">
          From owning infrastructure <span className="text-white/30">→</span>{" "}
          <span className="text-primary">orchestrating intelligence.</span>
        </p>
      </div>
    </PdfPage>
  )
}

function NewCompanySlide() {
  const portraits = [
    { src: "/cfo.png", label: "Finance" },
    { src: "/lawyer.png", label: "Legal" },
    { src: "/marketer.png", label: "Growth" },
    { src: "/ops.png", label: "Ops" },
  ]

  return (
    <PdfPage index={3}>
      <div className="grid h-full grid-cols-[0.9fr_1.1fr] gap-10">
        <div className="flex flex-col justify-between">
          <div>
            <Kicker>The new company</Kicker>
            <Title className="mt-3">What happens when a startup has AI employees?</Title>
          </div>
          <p className="text-2xl font-medium text-white">
            How much company can a small team build?
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex items-end gap-4 border-b border-white/10 pb-6">
            <span className="text-7xl font-semibold leading-none text-white">10</span>
            <span className="mb-2 text-lg text-white/45">people</span>
            <span className="mb-1 text-4xl text-primary">+</span>
            <div className="mb-1 flex">
              {portraits.map((p) => (
                <div key={p.label} className="masterclass-portrait -ml-2 first:ml-0 h-12 w-12 overflow-hidden border-2 border-black">
                  <DeckImage src={p.src} alt={p.label} width={48} height={48} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <span className="mb-2 text-lg text-white/45">agents</span>
          </div>
          <p className="mt-5 text-sm uppercase tracking-[0.16em] text-primary">
            Operational capacity of a much larger organization
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2">
            {AI_FUNCTIONS.map((fn) => (
              <p key={fn} className="border-t border-white/10 pt-2 text-sm text-white/75">
                {fn}
              </p>
            ))}
          </div>
        </div>
      </div>
    </PdfPage>
  )
}

function EconomicsSlide() {
  return (
    <PdfPage index={4}>
      <div className="flex h-full flex-col">
        <Kicker>New economics of company building</Kicker>
        <Title className="mt-3">Headcount ≠ capacity</Title>
        <div className="mt-8 grid flex-1 grid-cols-2 gap-0 border border-white/10">
          <div className="border-r border-white/10 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Traditional startup
            </p>
            <VerticalFlow steps={["Capital", "Employees", "Operations", "Revenue"]} muted />
          </div>
          <div className="bg-primary/10 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              AI-native startup
            </p>
            <VerticalFlow steps={["Capital", "Intelligence", "Automation", "Revenue"]} />
          </div>
        </div>
        <p className="mt-5 text-xl font-medium text-white">
          The smallest team may not be the weakest team.
        </p>
      </div>
    </PdfPage>
  )
}

function VerticalFlow({ steps, muted }: { steps: string[]; muted?: boolean }) {
  return (
    <ol className="mt-5 space-y-0">
      {steps.map((step, i) => (
        <li key={step} className="flex gap-4">
          <div className="flex w-6 flex-col items-center">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center font-mono text-[10px]",
                muted ? "text-white/40" : "bg-primary text-primary-foreground",
              )}
            >
              {i + 1}
            </span>
            {i < steps.length - 1 && (
              <span className={cn("h-5 w-px", muted ? "bg-white/15" : "bg-primary/50")} />
            )}
          </div>
          <p className={cn("pt-0.5 text-base", muted ? "text-white/55" : "text-white")}>{step}</p>
        </li>
      ))}
    </ol>
  )
}

function LensSlide() {
  return (
    <PdfPage index={5}>
      <div className="flex h-full flex-col">
        <Kicker>A new investment lens</Kicker>
        <div className="mt-4 grid grid-cols-2 gap-8">
          <p className="text-xl text-white/35 line-through decoration-white/20">
            How many people are building this?
          </p>
          <p className="text-xl font-semibold text-white">
            How much intelligence can this company deploy?
          </p>
        </div>
        <div className="mt-8 grid flex-1 grid-cols-4 grid-rows-2 gap-px bg-white/10">
          {DILIGENCE_LENS.map((item) => (
            <div key={item.label} className="bg-black p-4">
              <p className="text-sm font-semibold text-white">{item.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/45">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </PdfPage>
  )
}

function MoatSlide() {
  return (
    <PdfPage index={6}>
      <div className="grid h-full grid-cols-[0.95fr_1.05fr] gap-10">
        <div className="flex flex-col justify-between">
          <div>
            <Kicker>The new moat</Kicker>
            <Title className="mt-3">
              If everyone has AI, defensibility moves{" "}
              <span className="text-primary">above the model.</span>
            </Title>
          </div>
          <p className="text-sm leading-relaxed text-white/50">
            Models commoditize. The company is the system around the model: data, distribution,
            workflow, rails, trust, and networks.
          </p>
        </div>
        <ol className="flex flex-col justify-center gap-2">
          {MOATS.map((moat, i) => (
            <li
              key={moat.title}
              className="grid grid-cols-[4.5rem_1fr] items-baseline gap-4 border-b border-white/10 pb-2"
            >
              <span className="font-mono text-[11px] text-primary">0{i + 1} {moat.title}</span>
              <span className="text-sm text-white/65">{moat.body}</span>
            </li>
          ))}
        </ol>
      </div>
    </PdfPage>
  )
}

function AgentsSlide() {
  return (
    <PdfPage index={7}>
      <div className="flex h-full flex-col">
        <Kicker>From software to agents</Kicker>
        <Title className="mt-3">Software used to wait for us.</Title>
        <div className="mt-8 grid flex-1 grid-cols-2 gap-0 border border-white/10">
          <div className="border-r border-white/10 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Traditional software
            </p>
            <VerticalFlow steps={["Human", "Software", "Outcome"]} muted />
          </div>
          <div className="bg-primary/10 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              AI agents
            </p>
            <VerticalFlow steps={["Goal", "Agent", "Decisions", "Actions", "Outcome"]} />
          </div>
        </div>
        <p className="mt-5 text-2xl font-semibold text-white">
          Software becomes an <span className="text-primary">actor.</span>
        </p>
      </div>
    </PdfPage>
  )
}

function FintechSlide() {
  return (
    <PdfPage index={8}>
      <div className="flex h-full flex-col">
        <Kicker>The next evolution of fintech</Kicker>
        <Title className="mt-3">Enter autonomous finance.</Title>
        <ol className="mt-8 grid flex-1 grid-cols-4 gap-0">
          {FINTECH_ERAS.map((item, i) => (
            <li
              key={item.gen}
              className={cn(
                "flex flex-col justify-between border-l border-white/10 px-5 py-2",
                item.highlight && "bg-primary/10",
              )}
              style={{ marginTop: `${(3 - i) * 18}px` }}
            >
              <p className={cn("font-mono text-sm", item.highlight ? "text-primary" : "text-white/35")}>
                {item.gen}
              </p>
              <div>
                <p className="text-lg font-semibold text-white">{item.name}</p>
                <p className="mt-1 text-xs text-white/50">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-base text-white/65">
          Financial systems that don&apos;t just show you what is happening — they understand, decide, and act.
        </p>
      </div>
    </PdfPage>
  )
}

function DefinitionSlide() {
  return (
    <PdfPage index={9}>
      <div className="grid h-full grid-cols-[0.9fr_1.1fr] gap-10">
        <div className="flex flex-col justify-between">
          <div>
            <Kicker>From financial tools → financial agents</Kicker>
            <Title className="mt-3">The interface isn&apos;t the product.</Title>
            <p className="mt-4 text-2xl font-medium text-primary">The intelligence is.</p>
          </div>
        </div>
        <ol className="grid grid-cols-1 content-center gap-0">
          {AGENT_JOBS.map((job, i) => (
            <li key={job} className="grid grid-cols-[2rem_1fr] border-t border-white/10 py-2 text-sm text-white/80">
              <span className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
              {job}
            </li>
          ))}
        </ol>
      </div>
    </PdfPage>
  )
}

function StackSlide() {
  return (
    <PdfPage index={10}>
      <div className="flex h-full flex-col">
        <Kicker>Where will value be captured?</Kicker>
        <Title className="mt-3">The autonomous finance stack</Title>
        <ol className="mt-6 flex flex-1 flex-col justify-center gap-1.5">
          {VALUE_STACK.map((layer, i) => (
            <li
              key={layer.n}
              className="grid grid-cols-[3.5rem_9rem_1fr] items-center border border-white/10 px-4 py-2.5"
              style={{ marginLeft: `${i * 1.15}rem`, marginRight: `${(4 - i) * 0.35}rem` }}
            >
              <span className="font-mono text-xs text-primary">{layer.n}</span>
              <span className="text-sm font-semibold text-white">{layer.title}</span>
              <span className="text-xs text-white/45">{layer.body}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-white/50">
          Opportunity exists across every layer. Durable value concentrates where execution and distribution meet.
        </p>
      </div>
    </PdfPage>
  )
}

function AfricaSlide() {
  return (
    <PdfPage index={11}>
      <div className="flex h-full flex-col">
        <Kicker>Why Africa</Kicker>
        <Title className="mt-3">Africa has done this before.</Title>
        <div className="mt-8 grid flex-1 grid-cols-2 border border-white/10">
          <div className="border-r border-white/10 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Traditional path
            </p>
            <VerticalFlow steps={["Bank branches", "Cards", "Digital banking", "Mobile"]} muted />
          </div>
          <div className="bg-primary/10 p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Africa</p>
            <VerticalFlow steps={["Limited banking infrastructure", "Mobile money"]} />
          </div>
        </div>
        <p className="mt-5 text-xl font-medium text-white">
          When infrastructure is limited, <span className="text-primary">leapfrogging becomes possible.</span>
        </p>
      </div>
    </PdfPage>
  )
}

function FromAfricaSlide() {
  return (
    <PdfPage index={12}>
      <div className="grid h-full grid-cols-[1fr_1fr] gap-10">
        <div className="flex flex-col justify-between">
          <div>
            <Kicker>Africa&apos;s AI opportunity</Kicker>
            <Title className="mt-3">Don&apos;t just build AI for Africa.</Title>
            <p className="mt-4 text-2xl font-medium text-primary">
              Build AI from Africa for the world.
            </p>
          </div>
          <p className="text-sm text-white/50">
            These aren&apos;t only constraints. They can become innovation advantages.
          </p>
        </div>
        <ul className="grid grid-rows-6 content-center">
          {AFRICA_ADVANTAGES.map((item, i) => (
            <li key={item} className="grid grid-cols-[2rem_1fr] items-center border-t border-white/10 py-2.5">
              <span className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm text-white/80">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </PdfPage>
  )
}

function UnicornSlide() {
  return (
    <PdfPage index={13}>
      <div className="grid h-full grid-cols-2">
        <div className="flex flex-col justify-between pr-8">
          <div>
            <Kicker>The next African unicorn</Kicker>
            <Title className="mt-3">What might it look like?</Title>
          </div>
          <ul className="space-y-3">
            {NOT_THE_UNICORN.map((item) => (
              <li key={item} className="text-lg text-white/35 line-through decoration-white/20">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between bg-primary px-8 py-6 text-primary-foreground">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">It could be</p>
          <p className="text-[2rem] font-semibold leading-tight">
            An AI-native company that owns an entire workflow.
          </p>
          <div>
            <p className="text-sm font-medium">AI + Finance + Payments + Infrastructure</p>
            <p className="mt-4 text-lg font-semibold">
              The AI doesn&apos;t recommend the work.
              <br />
              It does the work.
            </p>
          </div>
        </div>
      </div>
    </PdfPage>
  )
}

function ThesisSlide() {
  return (
    <PdfPage index={14}>
      <div className="flex h-full flex-col">
        <Kicker>The investment thesis</Kicker>
        <Title className="mt-3">So, what should we invest in?</Title>
        <div className="mt-6 grid flex-1 grid-cols-3 grid-rows-2 gap-px bg-white/10">
          {THESIS_VECTORS.map((v, i) => (
            <div key={v.title} className="flex flex-col bg-black p-5">
              <p className="font-mono text-[11px] text-primary">0{i + 1}</p>
              <p className="mt-2 text-base font-semibold text-white">{v.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-white/50">{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </PdfPage>
  )
}

function FounderSlide() {
  return (
    <PdfPage index={15}>
      <div className="grid h-full grid-cols-[1fr_1fr] gap-10">
        <div className="flex flex-col justify-between">
          <div>
            <Kicker>The founder profile is changing</Kicker>
            <Title className="mt-3">
              Architects of <span className="text-primary">intelligence</span>
            </Title>
          </div>
          <p className="text-xl font-medium text-white">
            From managing people <span className="text-white/30">→</span> orchestrating intelligence.
          </p>
        </div>
        <ol>
          {FOUNDER_SHIFTS.map((item, i) => (
            <li key={item} className="grid grid-cols-[2rem_1fr] border-t border-white/10 py-3 text-sm text-white/85">
              <span className="font-mono text-[11px] text-primary">{String(i + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>
      </div>
    </PdfPage>
  )
}

function ExerciseSlide() {
  return (
    <PdfPage index={16}>
      <div className="flex h-full flex-col">
        <div className="flex items-end justify-between gap-6">
          <div>
            <Kicker>Workshop · 5 minutes</Kicker>
            <Title className="mt-3">Build your AI investment thesis</Title>
          </div>
          <p className="pb-1 text-xs text-white/40">Then decide: invest or pass.</p>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Industry</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXERCISE_INDUSTRIES.map((industry) => (
            <span
              key={industry}
              className="border border-white/15 px-3 py-1 text-xs text-white/70"
            >
              □ {industry}
            </span>
          ))}
        </div>
        <ol className="mt-5 grid flex-1 grid-cols-2 gap-x-8 gap-y-3">
          {EXERCISE_QUESTIONS.map((q, i) => (
            <li key={q.key} className={cn("flex flex-col", i === 0 && "col-span-2")}>
              <p className="text-[11px] text-white/50">
                <span className="font-mono text-primary">{String(i + 1).padStart(2, "0")}</span>{" "}
                {q.label}
              </p>
              <div className="mt-2 h-8 border-b border-white/20" />
            </li>
          ))}
        </ol>
        <div className="mt-3 grid grid-cols-2 gap-6 border-t border-white/10 pt-3">
          <p className="text-sm text-white/70">□ Invest</p>
          <p className="text-sm text-white/70">□ Pass</p>
        </div>
      </div>
    </PdfPage>
  )
}

function ScarcitySlide() {
  return (
    <PdfPage index={17}>
      <div className="flex h-full flex-col">
        <Kicker>The final question</Kicker>
        <Title className="mt-3 max-w-3xl">
          When intelligence becomes cheap, what becomes scarce?
        </Title>
        <div className="mt-10 grid flex-1 grid-cols-7 gap-px bg-white/10">
          {SCARCITY.map((item) => (
            <div key={item} className="flex items-end bg-black p-4">
              <p className="text-sm font-semibold leading-snug text-white">{item}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-lg text-white/65">
          That&apos;s where the next generation of value may be created.
        </p>
      </div>
    </PdfPage>
  )
}

function ClosingSlide() {
  const points = [
    "Fewer employees.",
    "Less capital.",
    "More intelligence.",
    "More autonomy.",
    "Greater leverage.",
  ]
  return (
    <PdfPage index={18}>
      <div className="grid h-full grid-cols-[1.1fr_0.9fr] gap-10">
        <div className="flex flex-col justify-between">
          <div>
            <Kicker>Close</Kicker>
            <Title className="mt-3">The next unicorn won&apos;t look like the last.</Title>
          </div>
          <p className="text-sm leading-relaxed text-white/50">
            The opportunity isn&apos;t simply to use AI. It&apos;s to rethink how companies are built,
            how capital is allocated, and how financial systems operate.
          </p>
        </div>
        <ul className="flex flex-col justify-center">
          {points.map((p) => (
            <li key={p} className="border-t border-white/10 py-3 text-2xl font-medium text-white">
              {p}
            </li>
          ))}
        </ul>
      </div>
    </PdfPage>
  )
}

function FinalSlide() {
  return (
    <PdfPage index={19} bleed>
      <div className="relative flex h-full flex-col justify-between overflow-hidden">
        <DeckImage
          src="/bg-04.jpg"
          alt=""
          className="deck-image-banner absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />
        <div className="relative z-10 flex items-start justify-between px-12 pt-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            {MASTERCLASS.title}
          </p>
          <p className="font-mono text-[11px] text-white/40">20 / 20</p>
        </div>
        <div className="relative z-10 px-12 pb-10">
          <h2 className="max-w-4xl text-[2.8rem] font-semibold leading-[1.08] tracking-tight text-white">
            Don&apos;t invest in the future you understand.
          </h2>
          <p className="mt-4 text-[2rem] font-medium text-primary">
            Invest in the future you can see coming.
          </p>
          <div className="mt-10 grid max-w-3xl grid-cols-3 gap-8 border-t border-white/15 pt-5">
            <div>
              <p className="text-sm font-semibold text-white">{MASTERCLASS.presenter}</p>
              <p className="mt-0.5 text-xs text-white/45">{MASTERCLASS.role}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{MASTERCLASS.email}</p>
              <p className="mt-0.5 text-xs text-white/45">{MASTERCLASS.tagline}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Trackify</p>
              <p className="mt-0.5 text-xs text-white/45">Confidential masterclass</p>
            </div>
          </div>
        </div>
      </div>
    </PdfPage>
  )
}

export const SLIDE_COMPONENTS = [
  CoverSlide,
  QuestionSlide,
  ErasSlide,
  NewCompanySlide,
  EconomicsSlide,
  LensSlide,
  MoatSlide,
  AgentsSlide,
  FintechSlide,
  DefinitionSlide,
  StackSlide,
  AfricaSlide,
  FromAfricaSlide,
  UnicornSlide,
  ThesisSlide,
  FounderSlide,
  ExerciseSlide,
  ScarcitySlide,
  ClosingSlide,
  FinalSlide,
]

export function MasterclassPages() {
  return (
    <>
      <CoverSlide />
      <QuestionSlide />
      <ErasSlide />
      <NewCompanySlide />
      <EconomicsSlide />
      <LensSlide />
      <MoatSlide />
      <AgentsSlide />
      <FintechSlide />
      <DefinitionSlide />
      <StackSlide />
      <AfricaSlide />
      <FromAfricaSlide />
      <UnicornSlide />
      <ThesisSlide />
      <FounderSlide />
      <ExerciseSlide />
      <ScarcitySlide />
      <ClosingSlide />
      <FinalSlide />
    </>
  )
}
