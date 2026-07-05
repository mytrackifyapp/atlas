"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type SpeechRecognitionCtor = new () => SpeechRecognition

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export type VoiceInputState = "idle" | "listening" | "processing"

type Options = {
  onFinalTranscript?: (text: string) => void
  lang?: string
}

export function useVoiceInput({ onFinalTranscript, lang = "en-US" }: Options = {}) {
  const [state, setState] = useState<VoiceInputState>("idle")
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [supported, setSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const bufferRef = useRef("")
  const onFinalRef = useRef(onFinalTranscript)

  useEffect(() => {
    onFinalRef.current = onFinalTranscript
  }, [onFinalTranscript])

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionCtor()))
  }, [])

  const stopListening = useCallback(() => {
    const active = recognitionRef.current
    if (!active) return
    active.stop()
  }, [])

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setError("Voice input is not supported in this browser. Try Chrome or Edge.")
      return false
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }

    setError(null)
    setTranscript("")
    setInterimTranscript("")
    bufferRef.current = ""

    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => setState("listening")

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const piece = event.results[i][0]?.transcript ?? ""
        if (event.results[i].isFinal) {
          bufferRef.current = `${bufferRef.current} ${piece}`.trim()
          setTranscript(bufferRef.current)
        } else {
          interim = `${interim} ${piece}`.trim()
        }
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted" || event.error === "no-speech") return
      setError(
        event.error === "not-allowed"
          ? "Microphone access denied. Allow mic permission and try again."
          : `Voice error: ${event.error}`
      )
      recognitionRef.current = null
      setState("idle")
      setInterimTranscript("")
    }

    recognition.onend = () => {
      const finalText = bufferRef.current.trim()
      recognitionRef.current = null
      setState("idle")
      setInterimTranscript("")
      bufferRef.current = ""
      if (finalText) {
        onFinalRef.current?.(finalText)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    return true
  }, [lang])

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  return {
    state,
    transcript,
    interimTranscript,
    error,
    supported,
    isListening: state === "listening",
    startListening,
    stopListening,
    displayTranscript: [transcript, interimTranscript].filter(Boolean).join(" ").trim(),
  }
}
