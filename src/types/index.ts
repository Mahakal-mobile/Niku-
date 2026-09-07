export type Role = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: Role
  content: string
  timestamp: number
  imageUrl?: string
  isTyping?: boolean
}

export interface MemoryEntry {
  id: string
  key: string
  value: string
  createdAt: number
  expiresAt: number
}

export type ShortcutId =
  | 'mobile-repair'
  | 'explain'
  | 'web-search'
  | 'writing'
  | 'camera'

export interface Shortcut {
  id: ShortcutId
  label: string
  icon: string
  prompt: string
  description: string
}

export interface ApiKeys {
  gemini: string
  whatsapp?: string
  gmail?: string
  facebook?: string
  x?: string
}

export interface AppSettings {
  apiKeys: ApiKeys
  deviceModel: string
  deviceOs: string
  voiceEnabled: boolean
  memoryEnabled: boolean
}
