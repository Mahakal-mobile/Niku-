import { useState, useCallback, useEffect, useRef } from 'react'
import type { Message } from '../types'
import { chatWithGemini, analyzeImageWithGemini, initGemini, isGeminiReady } from '../lib/gemini'
import {
  loadMessages,
  saveMessages,
  getMemoryContext,
  addMemory,
  loadSettings,
} from '../lib/storage'

function uid() {
  return crypto.randomUUID()
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(() => loadMessages())
  const [isLoading, setIsLoading] = useState(false)
  const [apiReady, setApiReady] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const settings = loadSettings()
    const key = settings.apiKeys.gemini || import.meta.env.VITE_GEMINI_API_KEY || ''
    const ok = initGemini(key)
    setApiReady(ok)
  }, [])

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = useCallback(
    async (text: string, imageBase64?: string, mimeType?: string) => {
      const trimmed = text.trim()
      if (!trimmed && !imageBase64) return

      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: trimmed || (imageBase64 ? '[Image attached]' : ''),
        timestamp: Date.now(),
        imageUrl: imageBase64,
      }

      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)

      const rememberMatch = trimmed.match(/^(?:remember|note|save this)[:\s]+(.+)/i)
      if (rememberMatch) {
        const value = rememberMatch[1].trim()
        addMemory(value.slice(0, 40), value)
        const reply: Message = {
          id: uid(),
          role: 'assistant',
          content: `Got it — locked that in my long-term memory (up to 1 year): “${value}”. Ask me anytime.`,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, reply])
        setIsLoading(false)
        return
      }

      try {
        let replyText: string
        const memoryCtx = getMemoryContext()

        if (imageBase64 && mimeType) {
          replyText = await analyzeImageWithGemini(imageBase64, mimeType, trimmed || 'Analyze this image.')
        } else {
          replyText = await chatWithGemini(
            messages.concat(userMsg),
            trimmed,
            memoryCtx || undefined
          )
        }

        const assistantMsg: Message = {
          id: uid(),
          role: 'assistant',
          content: replyText,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch (err) {
        const errMsg: Message = {
          id: uid(),
          role: 'assistant',
          content: 'Something broke on my side. Try again in a sec?',
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, errMsg])
      } finally {
        setIsLoading(false)
      }
    },
    [messages]
  )

  const clearChat = useCallback(() => {
    setMessages([])
    saveMessages([])
  }, [])

  const injectShortcut = useCallback(
    (prompt: string) => {
      window.dispatchEvent(new CustomEvent('guru-shortcut', { detail: prompt }))
    },
    []
  )

  return {
    messages,
    isLoading,
    apiReady,
    isGeminiReady: isGeminiReady(),
    sendMessage,
    clearChat,
    injectShortcut,
    bottomRef,
  }
}
