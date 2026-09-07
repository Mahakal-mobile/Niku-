import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai'
import { SYSTEM_PROMPT } from './constants'
import type { Message } from '../types'

let model: GenerativeModel | null = null

export function initGemini(apiKey: string) {
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    model = null
    return false
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.85,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    })
    return true
  } catch {
    model = null
    return false
  }
}

export function isGeminiReady() {
  return model !== null
}

function buildHistory(messages: Message[]) {
  const filtered = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .filter((m) => !m.isTyping && m.content.trim())

  const recent = filtered.slice(-20)

  return recent.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
}

export async function chatWithGemini(
  messages: Message[],
  userText: string,
  extraContext?: string
): Promise<string> {
  if (!model) {
    return getOfflineFallback(userText)
  }

  try {
    const history = buildHistory(messages)
    const chat = model.startChat({ history })

    const prompt = extraContext
      ? `${extraContext}\n\nUser message: ${userText}`
      : userText

    const result = await chat.sendMessage(prompt)
    const response = result.response
    return response.text() || 'Hmm, I drew a blank. Try again?'
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('API_KEY') || msg.includes('401') || msg.includes('403')) {
      return '🔑 API key issue. Double-check `VITE_GEMINI_API_KEY` in your environment and redeploy.'
    }
    if (msg.includes('quota') || msg.includes('429')) {
      return '⏳ Rate limit hit. Give it a minute and try again, friend.'
    }
    console.error('Gemini error:', err)
    return `Something went sideways on my end: ${msg.slice(0, 120)}. Want to rephrase?`
  }
}

export async function analyzeImageWithGemini(
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  if (!model) {
    return 'Camera analysis needs a valid Gemini API key. Add `VITE_GEMINI_API_KEY` and try again.'
  }

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image.replace(/^data:[^;]+;base64,/, ''),
          mimeType,
        },
      },
      {
        text: `${prompt}\n\nYou are helping diagnose or understand this image. If it looks like phone hardware (board, sockets, display strip, flex cable, charging port), give precise repair-oriented advice for a Nothing Phone (3a) Lite.`,
      },
    ])
    return result.response.text() || 'Could not analyze the image.'
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return `Image analysis failed: ${msg.slice(0, 150)}`
  }
}

function getOfflineFallback(text: string): string {
  const lower = text.toLowerCase()
  if (lower.includes('weather') || lower.includes('gold') || lower.includes('price') || lower.includes('news')) {
    return '🌐 Live search needs a Gemini API key. Set `VITE_GEMINI_API_KEY` in your Vercel/Netlify environment variables (or `.env` locally) and redeploy. Once set, I can fetch real-time weather, metal prices, flights, and news for you.'
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hey! 👋 I'm Guru – your witty sidekick. Drop an API key so I can fully wake up, or just chat and I'll do my best offline."
  }
  return `I'm running in limited mode because no valid Gemini API key is configured.\n\n1. Get a free key → https://aistudio.google.com/apikey\n2. Add \`VITE_GEMINI_API_KEY=your_key\` to environment variables on Vercel/Netlify (or \`.env\` locally)\n3. Redeploy / restart.\n\nThen I can search the web, analyze photos, remember things, and banter properly. What would you like to do once I'm fully online?`
}
