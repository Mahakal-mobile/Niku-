import { Settings, Trash2, Zap } from 'lucide-react'
import { APP_NAME } from '../lib/constants'

interface HeaderProps {
  apiReady: boolean
  onOpenSettings: () => void
  onClear: () => void
}

export function Header({ apiReady, onOpenSettings, onClear }: HeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f5c518, #d4a017)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            color: '#0a0a0a',
            boxShadow: '0 0 12px var(--gold-glow)',
          }}
        >
          G
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.02em' }}>
            {APP_NAME}
          </div>
          <div
            style={{
              fontSize: 11,
              color: apiReady ? 'var(--success)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Zap size={10} />
            {apiReady ? 'Online · Gemini ready' : 'Limited mode · add API key'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        <button
          onClick={onClear}
          title="Clear chat"
          style={{
            padding: 8,
            borderRadius: 10,
            color: 'var(--text-secondary)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Trash2 size={18} />
        </button>
        <button
          onClick={onOpenSettings}
          title="Settings & API keys"
          style={{
            padding: 8,
            borderRadius: 10,
            color: 'var(--text-secondary)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
