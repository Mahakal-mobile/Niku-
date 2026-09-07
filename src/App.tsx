import { useState, useCallback } from 'react'
import { Header } from './components/Header'
import { Shortcuts } from './components/Shortcuts'
import { MessageList } from './components/MessageList'
import { ChatInput } from './components/ChatInput'
import { SettingsModal } from './components/SettingsModal'
import { CameraModal } from './components/CameraModal'
import { useChat } from './hooks/useChat'
import type { ShortcutId } from './types'

export default function App() {
  const {
    messages,
    isLoading,
    apiReady,
    sendMessage,
    clearChat,
    bottomRef,
  } = useChat()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [ready, setReady] = useState(apiReady)

  const handleShortcut = useCallback(
    (id: ShortcutId, prompt: string) => {
      if (id === 'camera') {
        setCameraOpen(true)
        return
      }
      window.dispatchEvent(new CustomEvent('guru-shortcut', { detail: prompt }))
    },
    []
  )

  const handleCameraCapture = useCallback(
    (dataUrl: string) => {
      sendMessage(
        'Analyze this photo. If it shows phone hardware (board, sockets, display, flex, port), give repair-oriented advice for a Nothing Phone (3a) Lite.',
        dataUrl,
        'image/jpeg'
      )
    },
    [sendMessage]
  )

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        position: 'relative',
      }}
    >
      <Header
        apiReady={ready}
        onOpenSettings={() => setSettingsOpen(true)}
        onClear={clearChat}
      />

      <Shortcuts
        visible={messages.length === 0 && !isLoading}
        onSelect={handleShortcut}
      />

      <MessageList messages={messages} isLoading={isLoading} bottomRef={bottomRef} />

      <ChatInput
        onSend={sendMessage}
        disabled={isLoading}
        onOpenCamera={() => setCameraOpen(true)}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onApiChange={(r) => setReady(r)}
      />

      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  )
}
