import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Trackify - Africa Startup Ecosystem Platform",
  description: "Premium venture capital and startup ecosystem platform for Africa",
  generator: "Trackify Finance ",
  icons: {
    icon: [
      {
        url: "/trackify-logo.png",
        type: "image/png",
      },
    ],
    apple: "/trackify-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Toaster richColors closeButton position="top-right" />
        <Analytics />
      </body>
    </html>
  )
}
