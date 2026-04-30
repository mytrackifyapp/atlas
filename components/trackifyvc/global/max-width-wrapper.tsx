import React from "react"

import { cn } from "@/utils/functions/cn"

interface Props {
  className?: string
  children: React.ReactNode
}

export default function MaxWidthWrapper({ className, children }: Props) {
  return (
    <section
      className={cn(
        "h-full mx-auto w-full max-w-full md:max-w-screen-xl px-4 md:px-12 lg:px-20",
        className,
      )}
    >
      {children}
    </section>
  )
}

