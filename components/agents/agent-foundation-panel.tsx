"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { UploadButton } from "@uploadthing/react"
import { Check, FileText, Loader2, Mail, Paperclip, Plug, Upload, X } from "lucide-react"

import type { OurFileRouter } from "@/app/api/uploadthing/core"
import type { AgentFoundationConfig, FoundationField } from "@/lib/agents/foundation-config"
import type { AgentFoundationRecord, FoundationAttachment } from "@/lib/agents/foundation-prompt"
import { foundationIsConfigured } from "@/lib/agents/foundation-prompt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Props = {
  agentId: string
}

function snapshot(
  fields: Record<string, string>,
  connectedTools: string[],
  attachments: FoundationAttachment[],
) {
  return JSON.stringify({ fields, connectedTools, attachments })
}

function formatFileSize(bytes?: number) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function renderFieldCard(
  field: FoundationField,
  index: number,
  fields: Record<string, string>,
  updateField: (key: string, value: string) => void,
) {
  const filled = Boolean(fields[field.key]?.trim())
  return (
    <div
      key={field.key}
      className={cn(
        "rounded-xl border px-3 py-3 transition-colors",
        filled
          ? "border-[#c1ff72]/30 bg-[#c1ff72]/[0.04] dark:border-[#c1ff72]/20"
          : "border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900/60",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <label
          htmlFor={`setup-${field.key}`}
          className="text-xs font-medium text-neutral-800 dark:text-neutral-200"
        >
          {field.label}
        </label>
        <span className="text-[10px] tabular-nums text-neutral-400">{index + 1}</span>
      </div>
      {field.multiline ? (
        <Textarea
          id={`setup-${field.key}`}
          value={fields[field.key] ?? ""}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="min-h-[4.25rem] resize-none rounded-lg border-neutral-200/80 bg-neutral-50/80 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:focus-visible:ring-neutral-600"
        />
      ) : (
        <Input
          id={`setup-${field.key}`}
          type={field.inputType ?? "text"}
          value={fields[field.key] ?? ""}
          onChange={(e) => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="h-9 rounded-lg border-neutral-200/80 bg-neutral-50/80 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-neutral-300 dark:border-neutral-700 dark:bg-neutral-950 dark:focus-visible:ring-neutral-600"
        />
      )}
    </div>
  )
}

function SetupSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col animate-pulse gap-4">
      <div className="h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      <div className="h-2 rounded-full bg-neutral-100 dark:bg-neutral-800" />
      <div className="space-y-3">
        <div className="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </div>
    </div>
  )
}

export function AgentFoundationPanel({ agentId }: Props) {
  const [config, setConfig] = useState<AgentFoundationConfig | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [connectedTools, setConnectedTools] = useState<string[]>([])
  const [attachments, setAttachments] = useState<FoundationAttachment[]>([])
  const [initialSnapshot, setInitialSnapshot] = useState("")
  const [customTool, setCustomTool] = useState("")
  const [fileUploading, setFileUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/agents/foundation?agentId=${encodeURIComponent(agentId)}`, {
        cache: "no-store",
      })
      if (!res.ok) throw new Error("Failed to load setup")
      const data = (await res.json()) as {
        config: AgentFoundationConfig
        foundation: AgentFoundationRecord | null
      }
      const nextFields = data.foundation?.fields ?? {}
      const nextTools = data.foundation?.connectedTools ?? []
      const nextAttachments = data.foundation?.attachments ?? []
      setConfig(data.config)
      setFields(nextFields)
      setConnectedTools(nextTools)
      setAttachments(nextAttachments)
      setInitialSnapshot(snapshot(nextFields, nextTools, nextAttachments))
      setSaved(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }, [agentId])

  useEffect(() => {
    void load()
  }, [load])

  const hasChanges = useMemo(
    () => snapshot(fields, connectedTools, attachments) !== initialSnapshot,
    [fields, connectedTools, attachments, initialSnapshot],
  )

  const isConfigured = useMemo(
    () => foundationIsConfigured({ agentId, fields, connectedTools, attachments }),
    [agentId, fields, connectedTools, attachments],
  )

  const completion = useMemo(() => {
    if (!config) return 0
    const filledFields = config.fields.filter((field) => fields[field.key]?.trim()).length
    const hasToolSuggestions = config.toolSuggestions.length > 0
    const toolsDone = hasToolSuggestions && connectedTools.length > 0 ? 1 : 0
    const total = config.fields.length + (hasToolSuggestions ? 1 : 0)
    return Math.round(((filledFields + toolsDone) / total) * 100)
  }, [config, fields, connectedTools])

  const businessFields = useMemo(
    () => config?.fields.filter((field) => field.section !== "email") ?? [],
    [config],
  )

  const emailFields = useMemo(
    () => config?.fields.filter((field) => field.section === "email") ?? [],
    [config],
  )

  const showToolIntegrations = (config?.toolSuggestions.length ?? 0) > 0
  const allowCustomIntegrations = config?.allowCustomIntegrations !== false
  const showFileUpload = Boolean(config?.fileUpload)
  const maxFiles = config?.fileUpload?.maxFiles ?? 5
  const canUploadMore = attachments.length < maxFiles

  const filledFieldCount = useMemo(() => {
    if (!config) return 0
    return config.fields.filter((field) => fields[field.key]?.trim()).length
  }, [config, fields])

  const customTools = useMemo(
    () =>
      connectedTools.filter(
        (tool) => !config?.toolSuggestions.includes(tool),
      ),
    [connectedTools, config?.toolSuggestions],
  )

  function updateField(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function toggleTool(tool: string) {
    setConnectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    )
    setSaved(false)
  }

  function removeTool(tool: string) {
    setConnectedTools((prev) => prev.filter((t) => t !== tool))
    setSaved(false)
  }

  function addCustomTool() {
    const value = customTool.trim()
    if (!value || connectedTools.includes(value)) return
    setConnectedTools((prev) => [...prev, value])
    setCustomTool("")
    setSaved(false)
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((file) => file.id !== id))
    setSaved(false)
  }

  function addAttachment(file: {
    name: string
    url: string
    mimeType?: string
    sizeBytes?: number
  }) {
    setAttachments((prev) => {
      if (prev.length >= maxFiles) return prev
      if (prev.some((item) => item.url === file.url)) return prev
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: file.name,
          url: file.url,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          uploadedAt: new Date().toISOString(),
        },
      ]
    })
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch("/api/agents/foundation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, fields, connectedTools, attachments }),
      })
      if (!res.ok) throw new Error("Failed to save setup")
      setInitialSnapshot(snapshot(fields, connectedTools, attachments))
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <SetupSkeleton />

  if (!config) {
    return <p className="py-6 text-xs text-neutral-500">Setup config unavailable.</p>
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative mb-4 flex min-h-[4.25rem] items-center overflow-hidden rounded-xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white px-4 py-4 dark:border-neutral-800 dark:from-neutral-900 dark:to-[#171717]">
        <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#c1ff72]/20 blur-2xl" />
        <div className="relative min-w-0">
          <p className="text-sm font-semibold leading-snug text-neutral-950 dark:text-white">
            {config.title}
          </p>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="font-medium text-neutral-600 dark:text-neutral-400">
            {completion >= 100
              ? "Setup complete"
              : filledFieldCount > 0
                ? "Setup in progress"
                : "Get started"}
          </span>
          <span className="tabular-nums text-neutral-500">
            {filledFieldCount}/{config.fields.length} fields
            {attachments.length > 0 ? ` · ${attachments.length} file${attachments.length === 1 ? "" : "s"}` : ""}
            {showToolIntegrations && connectedTools.length > 0
              ? ` · ${connectedTools.length} tools`
              : ""}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              completion >= 100
                ? "bg-[#c1ff72]"
                : completion >= 50
                  ? "bg-neutral-800 dark:bg-neutral-200"
                  : "bg-neutral-400 dark:bg-neutral-500",
            )}
            style={{ width: `${Math.max(completion, 4)}%` }}
          />
        </div>
      </div>

      {error ? (
        <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {businessFields.length > 0 ? (
          <section className="space-y-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Your business
            </p>
            {businessFields.map((field, index) =>
              renderFieldCard(field, index, fields, updateField),
            )}
          </section>
        ) : null}

        {emailFields.length > 0 ? (
          <section className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-neutral-400" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Email
              </p>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-500">
              Replies to outreach emails will be sent to this address.
            </p>
            {emailFields.map((field, index) =>
              renderFieldCard(field, index, fields, updateField),
            )}
          </section>
        ) : null}

        {showFileUpload ? (
          <section className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5 text-neutral-400" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                Files
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/80 bg-white px-3 py-3 dark:border-neutral-800 dark:bg-neutral-900/60">
              <p className="text-[11px] leading-relaxed text-neutral-500">
                {config.fileUpload?.hint}
              </p>

              {attachments.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {attachments.map((file) => {
                    const sizeLabel = formatFileSize(file.sizeBytes)
                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-2 rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-2.5 py-2 dark:border-neutral-700 dark:bg-neutral-950"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-neutral-400" />
                        <div className="min-w-0 flex-1">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-xs font-medium text-neutral-800 hover:underline dark:text-neutral-200"
                          >
                            {file.name}
                          </a>
                          {sizeLabel ? (
                            <p className="text-[10px] text-neutral-500">{sizeLabel}</p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(file.id)}
                          className="rounded-full p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : null}

              {canUploadMore ? (
                <div className="mt-3">
                  <UploadButton<OurFileRouter, "agentSetupFile">
                    endpoint="agentSetupFile"
                    input={{ agentId }}
                    onUploadBegin={() => setFileUploading(true)}
                    onClientUploadComplete={(res) => {
                      setFileUploading(false)
                      const file = res?.[0]
                      if (!file) return
                      addAttachment({
                        name: file.name,
                        url: file.url,
                        mimeType: file.type || undefined,
                        sizeBytes: file.size,
                      })
                    }}
                    onUploadError={(error) => {
                      setFileUploading(false)
                      console.error("Setup file upload error:", error)
                      setError("Failed to upload file. Use PDF or text under 10MB.")
                    }}
                    className="ut-button:w-full ut-button:bg-transparent ut-button:text-neutral-700 ut-button:hover:bg-neutral-50 ut-button:rounded-lg ut-button:border ut-button:border-dashed ut-button:border-neutral-300 ut-button:dark:text-neutral-300 ut-button:dark:hover:bg-neutral-800 ut-button:dark:border-neutral-700"
                    content={{
                      button: ({ ready }) => (
                        <div className="flex w-full items-center justify-center gap-2 px-3 py-2.5">
                          {fileUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
                          ) : (
                            <Upload className="h-4 w-4 text-neutral-400" />
                          )}
                          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                            {!ready
                              ? "Preparing upload…"
                              : fileUploading
                                ? "Uploading…"
                                : "Upload file"}
                          </span>
                        </div>
                      ),
                      allowedContent: "PDF or text up to 10MB",
                    }}
                  />
                  <p className="mt-2 text-center text-[10px] text-neutral-400">
                    {attachments.length}/{maxFiles} files
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-center text-[10px] text-neutral-400">
                  Maximum {maxFiles} files reached
                </p>
              )}
            </div>
          </section>
        ) : null}

        {showToolIntegrations ? (
          <section className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Plug className="h-3.5 w-3.5 text-neutral-400" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
                {config.integrationsTitle ?? "Tools & integrations"}
              </p>
            </div>
            <div className="rounded-xl border border-neutral-200/80 bg-white px-3 py-3 dark:border-neutral-800 dark:bg-neutral-900/60">
              <p className="text-[11px] leading-relaxed text-neutral-500">
                {config.integrationsHint ?? "Pick the tools this agent should know you use."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {config.toolSuggestions.map((tool) => {
                  const active = connectedTools.includes(tool)
                  const iconSrc = config.toolIcons?.[tool]
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      aria-label={tool}
                      aria-pressed={active}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors",
                        iconSrc && "pl-2.5",
                        active
                          ? "border-[#c1ff72]/50 bg-[#c1ff72]/15 text-neutral-900 dark:text-white"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800",
                      )}
                    >
                      {iconSrc ? (
                        <Image
                          src={iconSrc}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 shrink-0 object-contain"
                        />
                      ) : null}
                      {active ? <Check className="h-3 w-3" /> : null}
                      {tool}
                    </button>
                  )
                })}
              </div>

              {allowCustomIntegrations && customTools.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {customTools.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {tool}
                      <button
                        type="button"
                        onClick={() => removeTool(tool)}
                        className="rounded-full p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
                        aria-label={`Remove ${tool}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}

              {allowCustomIntegrations ? (
                <div className="mt-3 flex gap-2">
                  <Input
                    value={customTool}
                    onChange={(e) => setCustomTool(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCustomTool()
                      }
                    }}
                    placeholder="Add another tool…"
                    className="h-9 flex-1 rounded-lg border-neutral-200/80 bg-neutral-50/80 text-sm shadow-none dark:border-neutral-700 dark:bg-neutral-950"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 shrink-0 rounded-lg px-3 text-xs"
                    onClick={addCustomTool}
                    disabled={!customTool.trim()}
                  >
                    Add
                  </Button>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>

      <div className="mt-4 shrink-0 space-y-2 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        {hasChanges && !saving ? (
          <p className="text-center text-[10px] font-medium text-amber-600 dark:text-amber-400">
            Unsaved changes
          </p>
        ) : saved ? (
          <p className="text-center text-[10px] font-medium text-[#5a8f1e] dark:text-[#c1ff72]">
            Setup saved — included in every chat
          </p>
        ) : null}

        <Button
          type="button"
          className={cn(
            "h-10 w-full rounded-xl font-semibold transition-colors",
            hasChanges
              ? "bg-[#c1ff72] text-neutral-950 hover:bg-[#b4f25f]"
              : "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100",
          )}
          disabled={saving || !hasChanges}
          onClick={() => void handleSave()}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : saved && !hasChanges ? (
            <>
              <Check className="mr-2 h-3.5 w-3.5" />
              Saved
            </>
          ) : (
            "Save setup"
          )}
        </Button>

        <p className="text-center text-[10px] leading-relaxed text-neutral-500">
          {isConfigured
            ? "Update anytime — your agent picks up changes on the next message."
            : "A few details here help this agent skip generic answers from day one."}
        </p>
      </div>
    </div>
  )
}
