import ReactMarkdown from 'react-markdown'
import type { Message } from '../types'
import { Bot, User } from 'lucide-react'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  bottomRef: React.RefObject<HTMLDivElement | null>
}

export function MessageList({ messages, isLoading, bottomRef }: MessageListProps) {
  if (messages.length === 0 && !isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f5c51833, #d4a01722)',
            border: '2px solid var(--gold-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            fontSize: 28,
          }}
        >
          ✨
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          Hey, I'm Guru
        </h2>
        <p style={{ fontSize: 14, maxWidth: 280, lineHeight: 1.5 }}>
          Your witty companion. Ask anything, use a shortcut, or hit the mic. I know your Nothing
          Phone inside-out.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {messages.map((m) => (
        <div
          key={m.id}
          className="animate-fade-in"
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                m.role === 'user'
                  ? 'var(--bg-elevated)'
                  : 'linear-gradient(135deg, #f5c518, #d4a017)',
              color: m.role === 'user' ? 'var(--text-secondary)' : '#0a0a0a',
            }}
          >
            {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
          </div>

          <div
            style={{
              maxWidth: '78%',
              padding: '10px 14px',
              borderRadius: 14,
              background: m.role === 'user' ? 'var(--bg-elevated)' : 'var(--bg-tertiary)',
              border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            {m.imageUrl && (
              <img
                src={m.imageUrl}
                alt="Uploaded"
                style={{
                  maxWidth: '100%',
                  borderRadius: 10,
                  marginBottom: 8,
                  display: 'block',
                }}
              />
            )}
            <div className="msg-content">
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                marginTop: 6,
                textAlign: m.role === 'user' ? 'right' : 'left',
              }}
            >
              {new Date(m.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f5c518, #d4a017)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a0a0a',
            }}
          >
            <Bot size={16} />
          </div>
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--bg-tertiary)',
              borderRadius: 14,
              border: '1px solid var(--border)',
              display: 'flex',
              gap: 5,
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--gold)',
                  animation: `typing 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
