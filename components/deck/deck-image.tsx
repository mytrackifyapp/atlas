import { cn } from "@/lib/utils"

type DeckImageProps = {
  src: string
  alt: string
  className?: string
  /** Use for profile photos — explicit dimensions print reliably */
  width?: number
  height?: number
  priority?: boolean
}

/**
 * Native <img> for pitch/CV decks. Next.js Image + fill often fails in print/PDF
 * (zero-height parents, lazy load, absolute positioning).
 */
export function DeckImage({ src, alt, className, width, height, priority }: DeckImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "eager"}
      decoding="sync"
      className={cn("deck-image", className)}
    />
  )
}
