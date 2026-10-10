import type { Metadata } from "next"
import Link from "next/link"

import { FinnaOrb } from "@/components/finna-orb"

export const metadata: Metadata = {
  title: "Finna — your personal AI",
  description: "Finna is your personal AI for finance, fundraising, and running the company.",
}

export default function FinnaSitePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f5f2] text-[#1c1c1c]">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-black/[0.04]">
            <FinnaOrb size={20} />
          </span>
          <span className="text-sm font-medium text-[#c4a574]">Finna</span>
        </div>
        <Link href="/sign-in?redirect=/finna" className="text-sm text-neutral-500 hover:text-[#1c1c1c]">
          Sign in
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 pb-24">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Your personal AI.</h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-neutral-500">
          Finna helps you with finance, fundraising, and the work of running the company.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/sign-up?redirect=/finna"
            className="inline-flex h-12 items-center rounded-full bg-[#1c1c1c] px-6 text-sm font-semibold text-white"
          >
            Meet Finna
          </Link>
          <Link href="/finna" className="inline-flex h-12 items-center px-2 text-sm font-medium text-neutral-500 hover:text-[#1c1c1c]">
            Open the workspace
          </Link>
        </div>
      </main>
    </div>
  )
}
