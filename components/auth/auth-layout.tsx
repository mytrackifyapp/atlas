import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

import { cn } from "@/lib/utils"

export const authInputClass =
  "h-12 rounded-xl border border-white/10 bg-[#141414] text-white shadow-none placeholder:text-neutral-600 focus-visible:border-[#c1ff72]/40 focus-visible:ring-1 focus-visible:ring-[#c1ff72]/25"

export const authLabelClass = "text-sm font-medium text-neutral-400"

export const authButtonClass =
  "h-12 w-full rounded-full bg-[#c1ff72] text-base font-semibold text-black hover:bg-[#b8f065] shadow-[0_0_28px_-6px_rgba(193,255,114,0.45)]"

const AUTH_SLOGAN = "Finance, fundraising, deal flow, and AI — one platform for venture teams."

function AuthBrandPanel() {
  return (
    <aside className="relative hidden min-h-[560px] flex-1 overflow-hidden rounded-[2rem] border border-white/[0.06] lg:flex lg:max-w-xl lg:flex-col">
      <Image
        src="The Subtle Unfolding.jpeg"
        alt=""
        fill
        className="object-cover"
        priority
        sizes="(min-width: 1024px) 36rem, 0px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_65%,rgba(0,0,0,0.12)_100%)]" />

      {/* Top nav */}
      <div className="relative z-10 p-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm text-white transition-all hover:border-white/10 hover:bg-white/[0.04]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </Link>
      </div>

      {/* Brand footer */}
      <div className="relative z-10 mt-auto px-10 pb-10">
        <p className="text-2xl font-semibold tracking-tight text-white">Trackify Finances</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-white">{AUTH_SLOGAN}</p>
        <p className="mt-6 text-xs text-white">
          © {new Date().getFullYear()} Trackify Finances. All rights reserved.
        </p>
      </div>
    </aside>
  )
}

export function AuthLayout({
  title,
  description,
  children,
  footer,
  headerExtra,
}: {
  title: string
  description: string
  children: React.ReactNode
  footer: React.ReactNode
  headerExtra?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-stretch lg:p-8">
        <AuthBrandPanel />

        <main className="flex flex-1 flex-col justify-center px-2 py-8 sm:px-6 lg:px-12 xl:px-20">
          <Link
            href="/"
            className="mb-6 inline-flex w-fit items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
              <p className="text-sm leading-relaxed text-neutral-500 sm:text-base">{description}</p>
              {headerExtra}
            </div>

            {children}

            <div className="mt-8 text-center text-sm text-neutral-500">{footer}</div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function AuthError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className={cn(
        "mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300",
      )}
    >
      {message}
    </div>
  )
}

export function AuthSuccess({ message }: { message: string }) {
  return (
    <div className="mb-5 rounded-xl border border-[#c1ff72]/20 bg-[#c1ff72]/10 px-4 py-3 text-sm text-[#c1ff72]">
      {message}
    </div>
  )
}
