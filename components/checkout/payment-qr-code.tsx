"use client"

import QRCode from "react-qr-code"

import { cn } from "@/lib/utils"

type Props = {
  value: string
  title?: string
  subtitle?: string
  className?: string
}

export function PaymentQrCode({ value, title, subtitle, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      {subtitle ? <p className="mt-1 max-w-xs text-xs text-neutral-500">{subtitle}</p> : null}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <QRCode value={value} size={192} level="M" bgColor="#ffffff" fgColor="#0a0a0a" />
      </div>
    </div>
  )
}
