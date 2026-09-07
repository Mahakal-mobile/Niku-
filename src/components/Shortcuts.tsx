import { SHORTCUTS } from '../lib/constants'
import type { ShortcutId } from '../types'

interface ShortcutsProps {
  onSelect: (id: ShortcutId, prompt: string) => void
  visible: boolean
}

export function Shortcuts({ onSelect, visible }: ShortcutsProps) {
  if (!visible) return null

  return (
    <div
      className="animate-fade-in"
      style={{
        padding: '12px 16px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        Quick actions
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 8,
        }}
      >
        {SHORTCUTS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id, s.prompt)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 4,
              padding: '12px 14px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'left',
              transition: 'border-color 0.15s, background 0.15s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--gold-dim)'
              e.currentTarget.style.background = 'var(--bg-elevated)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--bg-tertiary)'
            }}
          >
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{s.label}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.3 }}>
              {s.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
