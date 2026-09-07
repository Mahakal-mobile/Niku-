import { useState, useCallback, useRef } from 'react'

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const start = useCallback(async () => {
    setError(null)
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      setStream(media)
      setIsActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = media
        await videoRef.current.play()
      }
      return media
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera permission denied'
      setError(msg)
      setIsActive(false)
      return null
    }
  }, [])

  const stop = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
    setIsActive(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  const capture = useCallback((): string | null => {
    const video = videoRef.current
    if (!video || !stream) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.85)
  }, [stream])

  return { stream, error, isActive, videoRef, start, stop, capture }
}
