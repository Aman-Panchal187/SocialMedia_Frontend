import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Avatar from '../../../components/common/Avatar'
import { MicIcon, CameraIcon, PhoneIcon } from '../../../components/common/icons'
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
  const {
    phase,
    callType,
    peerInfo,
    localStream,
    remoteStream,
    activeSince,
    hangUp,
    isMuted,
    isCameraOff,
    isRemoteMuted,
    toggleMute,
    toggleCamera,
  } = useCall()
  const remoteVideoRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const hangUpButtonRef = useRef(null)
  const elapsed = useElapsedSeconds(activeSince)
  const prefersReducedMotion = useReducedMotion()

  const isVisible = phase === 'connecting' || phase === 'active'
  const isVideoCall = callType === 'video'

  // Assigning srcObject alone relies on the element's `autoplay` attribute to
  // start it — but that assignment happens asynchronously, well after the
  // WebRTC negotiation completes and long outside the "Accept"/"Call" click's
  // original user-gesture window. Browsers commonly honor autoplay for the
  // *video* (silent) but block the *unmuted audio* track without an explicit
  // play() call, which is exactly "video works, no sound". play() is called
  // imperatively (and retried) everywhere srcObject is assigned, and a
  // rejection is swallowed since the element still recovers once the browser
  // allows it (e.g. after any click on the page).
  const playSafely = (node) => {
    node?.play().catch(() => {})
  }

  // This component stays mounted the whole call (it just returns null when
  // not visible), so the stream can be assigned to state while phase is still
  // 'ringing-*' — before the <video>/<audio> elements exist in the DOM. A
  // plain useEffect keyed on the stream would then find a null ref and never
  // re-run once the element actually mounts, since the stream value itself
  // doesn't change again. Callback refs fire exactly when the node appears,
  // so they're used instead of (well, in addition to) the effects below.
  const attachRemoteVideo = useCallback(
    (node) => {
      remoteVideoRef.current = node
      if (node) {
        node.srcObject = remoteStream || null
        playSafely(node)
      }
    },
    [remoteStream]
  )

  const attachLocalVideo = useCallback(
    (node) => {
      localVideoRef.current = node
      if (node) {
        node.srcObject = localStream || null
        playSafely(node)
      }
    },
    [localStream]
  )

  const attachRemoteAudio = useCallback(
    (node) => {
      remoteAudioRef.current = node
      if (node) {
        node.srcObject = remoteStream || null
        playSafely(node)
      }
    },
    [remoteStream]
  )

  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream || null
      playSafely(remoteVideoRef.current)
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream || null
      playSafely(remoteAudioRef.current)
    }
  }, [remoteStream])

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream || null
      playSafely(localVideoRef.current)
    }
  }, [localStream])

  // A fresh MediaStream is only created once (in useCallSocket's pc.ontrack,
  // the first time a remote track arrives) and every later track (e.g. audio
  // arriving in a separate ontrack event shortly after video) is added to
  // that same object via addTrack — which doesn't change the object
  // reference, so the effects above (keyed on the remoteStream value) don't
  // re-run for it. The stream's own 'addtrack' event fires exactly when that
  // happens, so re-attempt play() right then rather than guessing at timing.
  useEffect(() => {
    if (!remoteStream) return undefined
    const handleAddTrack = () => {
      playSafely(remoteVideoRef.current)
      playSafely(remoteAudioRef.current)
    }
    remoteStream.addEventListener('addtrack', handleAddTrack)
    return () => remoteStream.removeEventListener('addtrack', handleAddTrack)
  }, [remoteStream])

  // Belt-and-suspenders: also retry on the 'active' transition, in case the
  // browser's autoplay block was the actual cause rather than track timing.
  useEffect(() => {
    if (phase !== 'active') return
    playSafely(remoteVideoRef.current)
    playSafely(remoteAudioRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    if (isVisible) hangUpButtonRef.current?.focus()
  }, [isVisible])

  if (!isVisible) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Active call"
        className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      >
      {isVideoCall ? (
        <div className="relative min-h-0 flex-1">
          <video
            ref={attachRemoteVideo}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          <video
            ref={attachLocalVideo}
            autoPlay
            playsInline
            muted
            // Mirrored like every other video call app (WhatsApp, Instagram,
            // FaceTime, etc.) — people expect to see themselves the way a
            // mirror shows them, not the way the camera actually sees them.
            // Only the local self-view gets this; the remote peer's video
            // must stay unmirrored, since that's genuinely how they look.
            className="absolute bottom-4 right-4 h-20 w-16 -scale-x-100 rounded-lg border border-white/30 object-cover shadow-popover sm:h-32 sm:w-24"
          />
          {phase === 'connecting' && (
            <p className="absolute left-1/2 top-4 -translate-x-1/2 text-sm text-white/80">Connecting…</p>
          )}
          {isRemoteMuted && phase === 'active' && (
            <span
              className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white"
              aria-label={`${peerInfo?.username || 'Other person'} is muted`}
            >
              <MicIcon muted className="h-4 w-4" />
              Muted
            </span>
          )}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-white">
          <audio ref={attachRemoteAudio} autoPlay />
          <div className="relative">
            <Avatar src={peerInfo?.avatarUrl} alt={peerInfo?.username} size="xl" />
            {isRemoteMuted && phase === 'active' && (
              <span
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-danger ring-2 ring-black"
                aria-label={`${peerInfo?.username || 'Other person'} is muted`}
              >
                <MicIcon muted className="h-4 w-4 text-white" />
              </span>
            )}
          </div>
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

      <div className="flex shrink-0 items-center justify-center gap-6 bg-black/40 py-6">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          aria-pressed={isMuted}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-[background-color,transform] duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-white/70 motion-reduce:transition-none motion-reduce:active:scale-100 ${
            isMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          <MicIcon muted={isMuted} />
        </button>
        {isVideoCall && (
          <button
            type="button"
            onClick={toggleCamera}
            aria-label={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
            aria-pressed={isCameraOff}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-[background-color,transform] duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-white/70 motion-reduce:transition-none motion-reduce:active:scale-100 ${
              isCameraOff ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <CameraIcon off={isCameraOff} />
          </button>
        )}
        <button
          ref={hangUpButtonRef}
          type="button"
          onClick={hangUp}
          aria-label="Hang up"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-danger text-white transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-danger/50 motion-reduce:transition-none"
        >
          <PhoneIcon className="h-6 w-6 rotate-[135deg]" />
        </button>
      </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
