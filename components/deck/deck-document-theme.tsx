"use client"

import { useEffect } from "react"

type DeckDocumentThemeProps = {
  /** Applied to <html> for scoped print CSS */
  rootClass: "pitch-print-root" | "cv-print-root"
}

/**
 * Ensures pitch/CV pages print with black backgrounds (html/body + beforeprint).
 * Browsers often default to white unless backgrounds are forced on the document root.
 */
export function DeckDocumentTheme({ rootClass }: DeckDocumentThemeProps) {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    html.classList.add("dark", rootClass)
    body.classList.add(rootClass)

    const forceBlackBackground = () => {
      html.style.setProperty("background-color", "#000000", "important")
      html.style.setProperty("color-scheme", "dark")
      body.style.setProperty("background-color", "#000000", "important")
      body.style.setProperty("-webkit-print-color-adjust", "exact")
      body.style.setProperty("print-color-adjust", "exact")
    }

    forceBlackBackground()

    const preloadDeckImages = () => {
      document.querySelectorAll<HTMLImageElement>("img.deck-image").forEach((img) => {
        const src = img.currentSrc || img.src
        if (!src) return
        if (img.complete && img.naturalWidth > 0) return
        const loader = new window.Image()
        loader.src = src
      })
    }

    preloadDeckImages()

    const onBeforePrint = () => {
      forceBlackBackground()
      preloadDeckImages()
    }
    window.addEventListener("beforeprint", onBeforePrint)

    return () => {
      html.classList.remove("dark", rootClass)
      body.classList.remove(rootClass)
      html.style.removeProperty("background-color")
      html.style.removeProperty("color-scheme")
      body.style.removeProperty("background-color")
      body.style.removeProperty("-webkit-print-color-adjust")
      body.style.removeProperty("print-color-adjust")
      window.removeEventListener("beforeprint", onBeforePrint)
    }
  }, [rootClass])

  return null
}
