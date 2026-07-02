import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Avatar from '../../../components/common/Avatar'
import { useCall } from '../CallContext'

function useElapsedSeconds(activeSince) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!activeSince) {
      setElapsed(0)
      return
    }
    setElapsed(Math.floor((Date.now() - activeSince) / 1000))
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeSince) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [activeSince])

  return elapsed
}

function formatElapsed(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export default function ActiveCallOverlay() {
  const { phase, callType, peerInfo, localStream, remoteStream, activeSince, hangUp } = useCall()
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const remoteVideoRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const hangUpButtonRef = useRef(null)
  const elapsed = useElapsedSeconds(activeSince)
  const prefersReducedMotion = useReducedMotion()

  const isVisible = phase === 'connecting' || phase === 'active'
  const isVideoCall = callType === 'video'

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream || null
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream || null
  }, [remoteStream])

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream || null
  }, [localStream])

  useEffect(() => {
    setIsMuted(false)
    setIsCameraOff(false)
  }, [localStream])

  useEffect(() => {
    if (isVisible) hangUpButtonRef.current?.focus()
  }, [isVisible])

  if (!isVisible) return null

  const toggleMute = () => {
    if (!localStream) return
    const nextMuted = !isMuted
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted
    })
    setIsMuted(nextMuted)
  }

  const toggleCamera = () => {
    if (!localStream) return
    const nextCameraOff = !isCameraOff
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !nextCameraOff
    })
    setIsCameraOff(nextCameraOff)
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Active call"
        className="fixed inset-0 z-50 flex flex-col bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      >
      {isVideoCall ? (
        <div className="relative flex-1">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 h-20 w-16 rounded-lg border border-white/30 object-cover shadow-lg sm:h-32 sm:w-24"
          />
          {phase === 'connecting' && (
            <p className="absolute left-1/2 top-4 -translate-x-1/2 text-sm text-white/80">Connecting…</p>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-white">
          <audio ref={remoteAudioRef} autoPlay />
          <Avatar src={peerInfo?.avatarUrl} alt={peerInfo?.username} size="xl" />
          <p className="text-lg font-semibold">{peerInfo?.fullName || peerInfo?.username}</p>
          <p className="text-sm text-white/70">
            {phase === 'connecting' ? 'Connecting…' : formatElapsed(elapsed)}
          </p>
        </div>
      )}

      {isVideoCall && phase === 'active' && (
        <p className="absolute left-1/2 top-4 -translate-x-1/2 text-sm text-white/80">
          {formatElapsed(elapsed)}
        </p>
      )}

      <div className="flex items-center justify-center gap-6 bg-black/40 py-6">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl text-white hover:bg-white/30"
        >
          {isMuted ? '🔇' : '🎙️'}
        </button>
        {isVideoCall && (
          <button
            type="button"
            onClick={toggleCamera}
            aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl text-white hover:bg-white/30"
          >
            {isCameraOff ? '📷' : '🎥'}
          </button>
        )}
        <button
          ref={hangUpButtonRef}
          type="button"
          onClick={hangUp}
          aria-label="Hang up"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-danger text-2xl text-white hover:scale-105"
        >
          ✕
        </button>
      </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
