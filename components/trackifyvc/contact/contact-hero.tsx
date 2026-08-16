import Link from "next/link"
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react"

import { TRACKIFYVC_CONTACT_CARDS } from "@/lib/trackifyvc-constants"

const CONTACT_LINKS = {
  Phone: "tel:+233532818725",
  Mail: "mailto:hey@mytrackify.com",
} as const

const ICONS = {
  Phone,
  MapPin,
  Mail,
} as const

export default function TrackifyVcContactHero() {
  return (
    <div className="lg:sticky lg:top-28">
      <p className="text-sm font-medium text-neutral-500">Contact</p>
      <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        Talk to our team
      </h1>
      <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-neutral-500 sm:text-lg">
        Sales, partnerships, or a question about your account — send a note and we&apos;ll get back to you.
      </p>

      <p className="mt-6 inline-flex items-center gap-2 text-sm text-neutral-600">
        <Clock className="h-4 w-4 text-neutral-400" />
        Typically replies within 1 business day
      </p>

      <ul className="mt-8 space-y-3">
        {TRACKIFYVC_CONTACT_CARDS.map((card) => {
          const Icon = ICONS[card.icon] ?? Phone
          const href = CONTACT_LINKS[card.icon as keyof typeof CONTACT_LINKS]
          const inner = (
            <>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-xs font-medium text-neutral-400">{card.title}</span>
                <span className="mt-0.5 block text-sm font-medium text-neutral-950">{card.value}</span>
              </span>
              {href ? <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300" /> : null}
            </>
          )

          const className =
            "flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 transition-colors"

          return (
            <li key={card.title}>
              {href ? (
                <a href={href} className={`${className} hover:border-neutral-300 hover:bg-white`}>
                  {inner}
                </a>
              ) : (
                <div className={className}>{inner}</div>
              )}
            </li>
          )
        })}
      </ul>

      <p className="mt-8 text-sm text-neutral-500">
        Prefer to look around first?{" "}
        <Link href="/sign-up" className="font-medium text-neutral-950 underline-offset-4 hover:underline">
          Get started free
        </Link>
      </p>
    </div>
  )
}
