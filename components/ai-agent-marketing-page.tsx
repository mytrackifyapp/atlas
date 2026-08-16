"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Eye,
  FileSearch,
  Lightbulb,
  MessageSquare,
  Search,
  Sparkles,
  Target,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import TrackifyVcNavbar from "@/components/trackifyvc/navigation/navbar"
import { MarketingFooter } from "@/components/marketing-footer"
import { cn } from "@/lib/utils"
import type {
  AgentIconName,
  AgentMarketingContent,
  SerializableAgent,
} from "@/lib/ai-agents-marketing"

const ICON_MAP: Record<AgentIconName, LucideIcon> = {
  "bar-chart": BarChart3,
  calendar: Calendar,
  eye: Eye,
  "file-search": FileSearch,
  lightbulb: Lightbulb,
  "message-square": MessageSquare,
  search: Search,
  sparkles: Sparkles,
  target: Target,
  users: Users,
  wrench: Wrench,
}

function AgentCta({
  href,
  label,
  className,
}: {
  href: string
  label: string
  className?: string
}) {
  return (
    <Button
      asChild
      size="lg"
      className={cn(
        "h-12 rounded-full bg-[#4483f2] px-10 text-base font-semibold text-white hover:bg-[#3a75e0]",
        className,
      )}
    >
      <Link href={href}>
        {label}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  )
}

function PhoneMockup({
  agent,
  content,
}: {
  agent: SerializableAgent
  content: AgentMarketingContent
}) {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="rounded-[2.5rem] border-[10px] border-neutral-900 bg-neutral-900 p-2 shadow-2xl">
        <div className="overflow-hidden rounded-[2rem] bg-white">
          <div className="border-b px-4 py-3">
            <div className="text-xs text-neutral-500">{agent.category}</div>
            <div className="text-sm font-semibold text-neutral-900">
              {content.roleTitle} · {content.displayName}
            </div>
          </div>
          <div className="space-y-3 px-4 py-5">
            {content.chatDemo.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "ml-auto bg-[#4483f2]/10 text-neutral-800"
                    : "bg-neutral-100 text-neutral-700",
                )}
              >
                {msg.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AiAgentMarketingPage({
  agent,
  content,
  ctaHref,
}: {
  agent: SerializableAgent
  content: AgentMarketingContent
  ctaHref: string
}) {
  const [activeStep, setActiveStep] = useState(0)
  const ctaLabel = `Get ${content.displayName}`

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-neutral-900">
      <TrackifyVcNavbar />

      {/* Hero */}
      <section className="px-4 pb-8 pt-2 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem]">
          <img
            src="/trackify-ui-hero.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />

          <div className="relative grid min-h-[420px] items-end gap-8 p-8 sm:min-h-[480px] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div className="max-w-xl">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                {content.heroHeadline}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                {content.heroSubheadline}
              </p>
              <div className="mt-7">
                <Button
                  asChild
                  size="lg"
                  className="h-11 rounded-full bg-white px-8 text-neutral-900 hover:bg-white/90"
                >
                  <Link href={ctaHref}>
                    Get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {agent.imageSrc ? (
              <div className="hidden justify-end lg:flex">
                <div className="relative h-72 w-56 overflow-hidden rounded-2xl border-4 border-white/20 shadow-2xl sm:h-80 sm:w-64">
                  <img
                    src={agent.imageSrc}
                    alt={content.displayName}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Pitch */}
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-2xl font-medium leading-snug sm:text-3xl lg:text-4xl"
            style={{ color: content.accent }}
          >
            {content.pitchHeadline}
          </p>
          <p
            className="mt-8 text-lg leading-relaxed sm:text-xl lg:text-2xl"
            style={{ color: content.accent }}
          >
            {content.pitchBody}
          </p>
          <p
            className="mt-10 flex flex-wrap items-center justify-center gap-2 text-lg font-medium sm:text-xl"
            style={{ color: content.accent }}
          >
            <span>{content.pitchTagline.split("—")[0]?.trim()}</span>
            {agent.imageSrc ? (
              <span className="inline-flex h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md">
                <img src={agent.imageSrc} alt="" className="h-full w-full object-cover" />
              </span>
            ) : null}
            {content.pitchTagline.includes("—") ? (
              <span>— {content.pitchTagline.split("—").slice(1).join("—").trim()}</span>
            ) : null}
          </p>
          <div className="mt-12 flex justify-center">
            <AgentCta href={ctaHref} label={ctaLabel} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{content.stepsTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-neutral-600 sm:text-lg">
              {content.stepsSubtitle}
            </p>
          </div>

          <div className="mt-14 grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <PhoneMockup agent={agent} content={content} />

            <div className="divide-y divide-neutral-200 border-t border-neutral-200">
              {content.steps.map((step, i) => {
                const isActive = activeStep === i
                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActiveStep(i)}
                    className="w-full py-6 text-left transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={cn(
                          "text-4xl font-bold tabular-nums transition-colors",
                          isActive ? "text-neutral-900" : "text-neutral-300",
                        )}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <h3
                          className={cn(
                            "text-lg font-semibold",
                            isActive ? "text-neutral-900" : "text-neutral-500",
                          )}
                        >
                          {step.title}
                        </h3>
                        {isActive ? (
                          <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base">
                            {step.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-14 flex justify-center">
            <AgentCta href={ctaHref} label={ctaLabel} />
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section className="bg-gradient-to-b from-[#0c3d4a] via-[#0f5c6b] to-[#127a8c] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {content.features.map((feature) => {
              const Icon = ICON_MAP[feature.icon]
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
                >
                  <Icon className="h-6 w-6 text-white/90" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{feature.description}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-14 flex justify-center">
            <AgentCta href={ctaHref} label={ctaLabel} />
          </div>
        </div>
      </section>
      <MarketingFooter />
    </div>
  )
}
