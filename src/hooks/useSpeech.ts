import { useState, useCallback, useRef, useEffect } from 'react'

interface UseSpeechOptions {
  onResult: (transcript: string) => void
}

interface SpeechRec {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

export function useSpeech({ onResult }: UseSpeechOptions) {
  const [isListening, setIsListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<SpeechRec | null>(null)

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRec
      webkitSpeechRecognition?: new () => SpeechRec
    }
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    setSupported(true)
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-IN'

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) onResult(transcript)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [onResult])

  const start = useCallback(() => {
    if (!recognitionRef.current || isListening) return
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      setIsListening(false)
    }
  }, [isListening])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const toggle = useCallback(() => {
    if (isListening) stop()
    else start()
  }, [isListening, start, stop])

  return { isListening, supported, start, stop, toggle }
}
