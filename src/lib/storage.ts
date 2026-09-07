import type { Message, MemoryEntry, AppSettings } from '../types'
import {
  STORAGE_KEY_MESSAGES,
  STORAGE_KEY_MEMORY,
  STORAGE_KEY_SETTINGS,
  MEMORY_MAX_AGE_MS,
  DEVICE_MODEL,
  DEVICE_OS,
} from './constants'

export function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES)
    if (!raw) return []
    return JSON.parse(raw) as Message[]
  } catch {
    return []
  }
}

export function saveMessages(messages: Message[]) {
  try {
    const trimmed = messages.slice(-200)
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(trimmed))
  } catch {
    try {
      const half = messages.slice(-100)
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(half))
    } catch {
      /* ignore */
    }
  }
}

export function loadMemory(): MemoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMORY)
    if (!raw) return []
    const entries = JSON.parse(raw) as MemoryEntry[]
    const now = Date.now()
    return entries.filter((e) => e.expiresAt > now)
  } catch {
    return []
  }
}

export function saveMemory(entries: MemoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY_MEMORY, JSON.stringify(entries))
  } catch {
    /* ignore */
  }
}

export function addMemory(key: string, value: string): MemoryEntry {
  const entry: MemoryEntry = {
    id: crypto.randomUUID(),
    key,
    value,
    createdAt: Date.now(),
    expiresAt: Date.now() + MEMORY_MAX_AGE_MS,
  }
  const current = loadMemory()
  const filtered = current.filter((e) => e.key.toLowerCase() !== key.toLowerCase())
  filtered.push(entry)
  saveMemory(filtered)
  return entry
}

export function getMemoryContext(): string {
  const entries = loadMemory()
  if (entries.length === 0) return ''
  return (
    'Long-term memory (things the user asked you to remember):\n' +
    entries.map((e) => `- ${e.key}: ${e.value}`).join('\n')
  )
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS)
    if (raw) {
      const parsed = JSON.parse(raw) as AppSettings
      return {
        ...defaultSettings(),
        ...parsed,
        apiKeys: { ...defaultSettings().apiKeys, ...parsed.apiKeys },
      }
    }
  } catch {
    /* ignore */
  }
  return defaultSettings()
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
}

function defaultSettings(): AppSettings {
  return {
    apiKeys: {
      gemini: import.meta.env.VITE_GEMINI_API_KEY || '',
    },
    deviceModel: DEVICE_MODEL,
    deviceOs: DEVICE_OS,
    voiceEnabled: true,
    memoryEnabled: true,
  }
}
