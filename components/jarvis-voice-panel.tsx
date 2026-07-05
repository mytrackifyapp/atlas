"use client"

import { Mic, MicOff, Radio, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export type JarvisPhase = "idle" | "listening" | "thinking" | "speaking"

type Props = {
  agentName?: string
  phase: JarvisPhase
  disabled?: boolean
  conversationMode: boolean
  onConversationModeChange: (enabled: boolean) => void
  onMicPress: () => void
  voiceSupported: boolean
  displayTranscript: string
  voiceError?: string | null
}

function phaseLabel(phase: JarvisPhase, agentName?: string) {
  switch (phase) {
    case "listening":
      return "Listening…"
    case "thinking":
      return "Thinking…"
    case "speaking":
      return `${agentName ?? "Agent"} is speaking`
    default:
      return `Talk to ${agentName ?? "your agent"}`
  }
}

export function JarvisVoicePanel({
  agentName,
  phase,
  disabled,
  conversationMode,
  onConversationModeChange,
  onMicPress,
  voiceSupported,
  displayTranscript,
  voiceError,
}: Props) {
  const isListening = phase === "listening"

  return (
    <Card className="p-4 sm:p-6 border-border/50 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_55%)] pointer-events-none" />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Voice conversation
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Speak naturally — {agentName ?? "your agent"} listens and talks back.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Radio className="h-3.5 w-3.5 text-muted-foreground" />
            <Switch
              checked={conversationMode}
              onCheckedChange={onConversationModeChange}
              disabled={disabled}
              aria-label="Hands-free conversation mode"
            />
          </div>
        </div>

        <div className="flex flex-col items-center py-4">
          <div className="relative flex items-center justify-center h-36 w-36">
            <AnimatePresence>
              {isListening ? (
                <>
                  <motion.span
                    className="absolute inset-0 rounded-full border border-primary/30"
                    initial={{ scale: 0.85, opacity: 0.6 }}
                    animate={{ scale: 1.25, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.span
                    className="absolute inset-2 rounded-full border border-primary/40"
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1.15, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.35 }}
                  />
                </>
              ) : null}
              {phase === "speaking" ? (
                <motion.span
                  className="absolute inset-4 rounded-full bg-primary/10"
                  animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.6, 0.35] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}
            </AnimatePresence>

            <Button
              type="button"
              size="icon"
              disabled={!voiceSupported || disabled || phase === "thinking"}
              onClick={onMicPress}
              className={cn(
                "relative z-10 h-20 w-20 rounded-full shadow-lg transition-all",
                isListening
                  ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  : "bg-primary hover:bg-primary/90 text-primary-foreground",
                phase === "speaking" && !isListening && "ring-2 ring-primary/40"
              )}
              aria-label={isListening ? "Stop listening and send" : "Start listening"}
            >
              {isListening ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          </div>

          <p
            className={cn(
              "mt-4 text-sm font-medium text-center",
              isListening && "text-primary",
              phase === "thinking" && "text-muted-foreground",
              phase === "speaking" && "text-primary"
            )}
          >
            {phaseLabel(phase, agentName)}
          </p>

          <p className="text-xs text-muted-foreground text-center mt-1 max-w-[260px]">
            {conversationMode
              ? "Hands-free on — listens again after each spoken reply"
              : "Tap the mic, speak, tap again to send"}
          </p>

          {displayTranscript ? (
            <div className="mt-3 w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-center min-h-[2.5rem]">
              {displayTranscript}
            </div>
          ) : null}

          {!voiceSupported ? (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 text-center">
              Use Chrome or Edge for built-in voice input.
            </p>
          ) : null}

          {voiceError ? (
            <p className="mt-2 text-xs text-destructive text-center">{voiceError}</p>
          ) : null}
        </div>

      </div>
    </Card>
  )
}
