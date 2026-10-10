"use client"

import { useCallback } from "react"
import { useMicrophone } from "voice-glow"

import { useVoiceInput } from "@/hooks/use-voice-input"

export function useFinnaVoice({
  onFinalTranscript,
}: {
  onFinalTranscript?: (text: string) => void
} = {}) {
  const mic = useMicrophone()
  const { start: startMic, stop: stopMic } = mic
  const voice = useVoiceInput({
    onFinalTranscript: (text) => {
      stopMic()
      onFinalTranscript?.(text)
    },
  })

  const listening = mic.state === "live" || voice.isListening

  const toggle = useCallback(() => {
    if (listening) {
      voice.stopListening()
      stopMic()
      return
    }
    void startMic()
    voice.startListening()
  }, [listening, startMic, stopMic, voice.startListening, voice.stopListening])

  return {
    stream: mic.stream,
    listening,
    supported: mic.supported || voice.supported,
    error: mic.error?.message ?? voice.error,
    toggle,
  }
}
