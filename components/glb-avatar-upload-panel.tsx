"use client"

import { useEffect, useRef, useState } from "react"
import { BoxIcon, Upload } from "lucide-react"

import { GlbAvatarCanvas } from "@/components/glb-avatar-canvas"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  /** Optional GLB/GLTF URL (e.g. `/model.glb`) to load without uploading. */
  initialUrl?: string
  /** Optional label for the initial URL button. */
  initialLabel?: string
  /** Optional mouth value (0..1) to drive simple talking animation. */
  mouth?: number
}

/**
 * Local `.glb` / `.gltf` upload → object URL → `GlbAvatarCanvas` (React Three Fiber + drei).
 */
export function GlbAvatarUploadPanel({
  className,
  initialUrl,
  initialLabel = "Load public model",
  mouth,
}: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const blobUrlRef = useRef<string | null>(null)
  const publicUrlRef = useRef<string | null>(null)

  function revokeCurrent() {
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      blobUrlRef.current = null
      return null
    })
    publicUrlRef.current = null
    setFileName(null)
  }

  useEffect(() => {
    blobUrlRef.current = blobUrl
  }, [blobUrl])

  useEffect(
    () => () => {
      const u = blobUrlRef.current
      if (u) URL.revokeObjectURL(u)
    },
    []
  )

  function loadPublic(url: string) {
    setError(null)
    revokeCurrent()
    // Not a blob URL; keep separate from revocation bookkeeping.
    publicUrlRef.current = url
    setFileName(url)
  }

  function applyFile(file: File | undefined) {
    if (!file) return
    const lower = file.name.toLowerCase()
    if (!lower.endsWith(".glb") && !lower.endsWith(".gltf")) {
      setError("Please choose a .glb or .gltf file.")
      return
    }
    setError(null)
    setBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      const next = URL.createObjectURL(file)
      blobUrlRef.current = next
      return next
    })
    setFileName(file.name)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    applyFile(f)
    e.target.value = ""
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    applyFile(e.dataTransfer.files?.[0])
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-2xl border border-dashed px-4 py-8 text-center transition-colors",
          dragOver ? "border-primary/60 bg-primary/5" : "border-border/70 bg-muted/20 hover:bg-muted/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
          className="hidden"
          onChange={onInputChange}
        />
        <Upload className="mx-auto h-9 w-9 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Drop a GLB here or click to upload</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Files stay in this browser tab only (object URL). Add server storage when you are ready.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Choose file
        </Button>
        {initialUrl ? (
          <Button type="button" variant="outline" size="sm" onClick={() => loadPublic(initialUrl)}>
            {initialLabel}
          </Button>
        ) : null}
        {blobUrl ? (
          <Button type="button" variant="ghost" size="sm" onClick={revokeCurrent}>
            Clear
          </Button>
        ) : fileName ? (
          <Button type="button" variant="ghost" size="sm" onClick={revokeCurrent}>
            Clear
          </Button>
        ) : null}
        {fileName ? (
          <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={fileName}>
            {fileName}
          </span>
        ) : null}
      </div>

      {blobUrl || publicUrlRef.current ? (
        <GlbAvatarCanvas url={blobUrl ?? publicUrlRef.current!} mouth={mouth} />
      ) : (
        <div className="flex h-[min(58vh,440px)] min-h-[260px] items-center justify-center rounded-2xl border border-border/40 bg-muted/15">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <BoxIcon className="h-10 w-10 opacity-50" />
            <span className="text-sm">No model loaded</span>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">
        Drag with the pointer to orbit. First clip in the file plays automatically if present. For static
        rigs, use the controls to inspect before wiring lip-sync / ElevenLabs in a later step.
      </p>
    </div>
  )
}
