import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Mic, MicOff, Image as ImageIcon, X, Camera } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'

interface ChatInputProps {
  onSend: (text: string, imageBase64?: string, mimeType?: string) => void
  disabled?: boolean
  onOpenCamera: () => void
}

export function ChatInput({ onSend, disabled, onOpenCamera }: ChatInputProps) {
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [mime, setMime] = useState<string>('image/jpeg')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleVoiceResult = useCallback((transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript))
  }, [])

  const { isListening, supported, toggle } = useSpeech({ onResult: handleVoiceResult })

  useEffect(() => {
    const handler = (e: Event) => {
      const prompt = (e as CustomEvent<string>).detail
      setText(prompt)
      textareaRef.current?.focus()
    }
    window.addEventListener('guru-shortcut', handler)
    return () => window.removeEventListener('guru-shortcut', handler)
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [text])

  const submit = () => {
    if (disabled) return
    if (!text.trim() && !preview) return
    onSend(text, preview || undefined, mime)
    setText('')
    setPreview(null)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Please select an image or PDF')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
      setMime(file.type)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div
      style={{
        padding: '10px 12px 14px',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
      }}
    >
      {preview && (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
          {mime.startsWith('image/') ? (
            <img
              src={preview}
              alt="preview"
              style={{ height: 72, borderRadius: 10, border: '1px solid var(--border)' }}
            />
          ) : (
            <div
              style={{
                height: 72,
                width: 72,
                borderRadius: 10,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: 'var(--text-muted)',
              }}
            >
              PDF
            </div>
          )}
          <button
            onClick={() => setPreview(null)}
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          background: 'var(--bg-tertiary)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: '6px 8px 6px 12px',
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          onChange={onFile}
        />

        <button
          onClick={() => fileRef.current?.click()}
          title="Upload image or PDF"
          style={{ padding: 8, color: 'var(--text-secondary)', flexShrink: 0 }}
        >
          <ImageIcon size={20} />
        </button>

        <button
          onClick={onOpenCamera}
          title="Open camera"
          style={{ padding: 8, color: 'var(--text-secondary)', flexShrink: 0 }}
        >
          <Camera size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Message Guru…"
          rows={1}
          disabled={disabled}
          style={{
            flex: 1,
            resize: 'none',
            fontSize: 15,
            lineHeight: 1.4,
            padding: '8px 4px',
            maxHeight: 140,
            color: 'var(--text-primary)',
          }}
        />

        {supported && (
          <button
            onClick={toggle}
            title={isListening ? 'Stop listening' : 'Voice input'}
            style={{
              padding: 8,
              flexShrink: 0,
              color: isListening ? 'var(--danger)' : 'var(--text-secondary)',
              animation: isListening ? 'pulse-gold 1.5s infinite' : undefined,
            }}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        )}

        <button
          onClick={submit}
          disabled={disabled || (!text.trim() && !preview)}
          title="Send"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            flexShrink: 0,
            background:
              text.trim() || preview
                ? 'linear-gradient(135deg, #f5c518, #d4a017)'
                : 'var(--bg-elevated)',
            color: text.trim() || preview ? '#0a0a0a' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s, transform 0.1s',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
