import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from '../../../context/SocketContext'
import { callsApi } from '../../../api/callsApi'
import { CALL_HISTORY_QUERY_KEY } from './useCallHistory'

// STUN-only fallback, used just until (or if ever) the backend's ICE config
// can't be fetched. STUN alone only works when both peers can find a direct
// route through their NATs — across different ISPs/mobile networks a TURN
// relay is required, and that comes from the backend (GET /calls/ice-servers)
// so credentials can be rotated server-side without redeploying the frontend.
const FALLBACK_RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

// How long to give a connection attempt to reach 'connected'/'completed'
// before proactively escalating to TURN, rather than waiting on the
// browser's own ICE-failure detection — that can take 20-30+ seconds, which
// would make every cross-network call feel badly broken before recovering.
const ICE_CONNECT_TIMEOUT_MS = 5000

const isStunUrl = (urls) => (Array.isArray(urls) ? urls : [urls]).every((u) => u?.startsWith('stun:'))

const INITIAL_STATE = {
  phase: 'idle',
  callId: null,
  callType: null,
  peerInfo: null,
  activeSince: null,
}

export function useCallSocket() {
  const { socket } = useSocket()
  const queryClient = useQueryClient()
  const [state, setState] = useState(INITIAL_STATE)
  const [localStream, setLocalStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isRemoteMuted, setIsRemoteMuted] = useState(false)

  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const pendingCandidatesRef = useRef([])
  const callIdRef = useRef(null)
  const rtcConfigRef = useRef(FALLBACK_RTC_CONFIG)
  const stateRef = useRef(state)
  stateRef.current = state

  // Same-network calls should never need to touch the TURN relay at all — an
  // RTCPeerConnection configured with TURN servers still prefers a direct
  // route automatically when one works, but merely *listing* TURN servers
  // means the browser contacts the relay to allocate a session during ICE
  // gathering, whether or not it ends up used. These three refs implement a
  // stricter policy: attempt the connection STUN-only first, and only add
  // TURN (recreating the peer connection and redoing the offer/answer) if
  // that attempt doesn't pan out.
  const useTurnRef = useRef(false)
  const isCallerRef = useRef(false)
  const isRetryingRef = useRef(false)
  const iceTimeoutRef = useRef(null)
  const retryCallWithTurnRef = useRef(null)

  // Fetched once per mount and kept in a ref (not state) — it's only read at
  // RTCPeerConnection construction time, never rendered.
  useEffect(() => {
    let cancelled = false
    callsApi
      .getIceServers()
      .then((res) => {
        if (!cancelled && res.data?.iceServers?.length) {
          rtcConfigRef.current = { iceServers: res.data.iceServers }
        }
      })
      .catch(() => {
        // Keep the STUN-only fallback; same-network calls still work.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const clearIceTimeout = useCallback(() => {
    if (iceTimeoutRef.current) {
      clearTimeout(iceTimeoutRef.current)
      iceTimeoutRef.current = null
    }
  }, [])

  // Closes just the RTCPeerConnection (and its remote stream) — used mid-call
  // when escalating to TURN, where the local camera/mic stream must survive
  // so the retry doesn't need to re-prompt for permissions.
  const teardownPeerConnectionOnly = useCallback(() => {
    clearIceTimeout()
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    remoteStreamRef.current = null
    pendingCandidatesRef.current = []
    setRemoteStream(null)
  }, [clearIceTimeout])

  const teardownMedia = useCallback(() => {
    teardownPeerConnectionOnly()
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    setLocalStream(null)
    setIsMuted(false)
    setIsCameraOff(false)
    setIsRemoteMuted(false)
    useTurnRef.current = false
    isCallerRef.current = false
    isRetryingRef.current = false
  }, [teardownPeerConnectionOnly])

  const resetToIdle = useCallback(() => {
    teardownMedia()
    callIdRef.current = null
    setState(INITIAL_STATE)
    // Every call-ending path (hangUp, reject, cancel, timeout, busy, error, the
    // other party ending it) converges here, and each one persists a call-history
    // row server-side — refetch so the Calls page reflects it without a manual reload.
    queryClient.invalidateQueries({ queryKey: CALL_HISTORY_QUERY_KEY })
  }, [teardownMedia, queryClient])

  const buildRtcConfig = useCallback(() => {
    const allServers = rtcConfigRef.current.iceServers || []
    if (useTurnRef.current) return { iceServers: allServers }
    return { iceServers: allServers.filter((server) => isStunUrl(server.urls)) }
  }, [])

  const createPeerConnection = useCallback(
    (callId) => {
      const pc = new RTCPeerConnection(buildRtcConfig())

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit('call:ice-candidate', { callId, candidate: event.candidate })
        }
      }

      pc.ontrack = (event) => {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream()
          setRemoteStream(remoteStreamRef.current)
        }
        remoteStreamRef.current.addTrack(event.track)
      }

      // Escalates to TURN once (if not already using it), or ends the call
      // with a clear error if this failure happened *with* TURN already
      // in play — there's no further fallback to try at that point.
      const handleConnectionStuck = () => {
        if (isRetryingRef.current) return

        if (!useTurnRef.current) {
          isRetryingRef.current = true
          if (isCallerRef.current) {
            retryCallWithTurnRef.current?.()
          } else {
            socket?.emit('call:ice-retry-request', { callId: callIdRef.current })
            teardownPeerConnectionOnly()
          }
          return
        }

        toast.error('Could not establish a media connection — call ended')
        const failedCallId = callIdRef.current
        if (failedCallId) socket?.emit('call:end', { callId: failedCallId })
        resetToIdle()
      }

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          clearIceTimeout()
          return
        }
        // Without this, an ICE failure (no viable route between the peers)
        // left the call "active" — timer running, remote side black, no
        // audio — with no indication anything was wrong.
        if (pc.iceConnectionState === 'failed') {
          clearIceTimeout()
          handleConnectionStuck()
        }
      }

      clearIceTimeout()
      iceTimeoutRef.current = setTimeout(() => {
        const currentState = pc.iceConnectionState
        if (currentState !== 'connected' && currentState !== 'completed') {
          handleConnectionStuck()
        }
      }, ICE_CONNECT_TIMEOUT_MS)

      pcRef.current = pc
      return pc
    },
    [socket, resetToIdle, buildRtcConfig, clearIceTimeout, teardownPeerConnectionOnly]
  )

  // The caller side of the "retry with TURN" escalation — recreates the peer
  // connection (this time with TURN included), re-adds the still-open local
  // tracks, and redoes the offer. Defined fresh each render and stashed in a
  // ref (rather than wrapped in useCallback) purely to sidestep the circular
  // dependency with createPeerConnection above, which needs to invoke it.
  const retryCallWithTurn = async () => {
    const callId = callIdRef.current
    if (!callId || !localStreamRef.current || !socket) return
    useTurnRef.current = true
    teardownPeerConnectionOnly()
    try {
      const pc = createPeerConnection(callId)
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current))
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('call:offer', { callId, sdp: pc.localDescription })
    } catch {
      toast.error('Could not establish a media connection — call ended')
      resetToIdle()
    }
  }
  retryCallWithTurnRef.current = retryCallWithTurn

  const flushPendingCandidates = useCallback(async () => {
    const pc = pcRef.current
    if (!pc) return
    const queued = pendingCandidatesRef.current
    pendingCandidatesRef.current = []
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(candidate)
      } catch {
        // Candidate arrived for a connection that has since moved on; safe to ignore.
      }
    }
  }, [])

  const startCall = useCallback(
    (peer, callType) => {
      if (!socket) return
      isCallerRef.current = true
      setState({
        phase: 'ringing-outgoing',
        callId: null,
        callType,
        peerInfo: peer,
        activeSince: null,
      })
      // The server may optionally ack call:invite with { callId } so the caller
      // can reference it for call:cancel while still ringing (the caller isn't
      // otherwise told the callId until call:accepted). If no ack arrives, cancel
      // degrades to a local-only reset since there is no callId to relay anyway.
      socket.emit('call:invite', { calleeUsername: peer.username, callType }, (ack) => {
        const callId = ack?.callId
        if (!callId) return
        callIdRef.current = callId
        setState((prev) => (prev.phase === 'ringing-outgoing' ? { ...prev, callId } : prev))
      })
    },
    [socket]
  )

  const acceptCall = useCallback(async () => {
    if (!socket) return
    const current = stateRef.current
    if (current.phase !== 'ringing-incoming') return

    const { callId, callType } = current

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video',
      })
      localStreamRef.current = stream
      setLocalStream(stream)

      const pc = createPeerConnection(callId)
      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      callIdRef.current = callId
      setState((prev) => ({ ...prev, phase: 'connecting' }))
      socket.emit('call:accept', { callId })
    } catch {
      toast.error('Could not access camera/microphone')
      socket.emit('call:reject', { callId })
      resetToIdle()
    }
  }, [socket, createPeerConnection, resetToIdle])

  const rejectCall = useCallback(() => {
    const current = stateRef.current
    if (current.phase === 'ringing-incoming' && current.callId) {
      socket?.emit('call:reject', { callId: current.callId })
    }
    resetToIdle()
  }, [socket, resetToIdle])

  const cancelCall = useCallback(() => {
    const current = stateRef.current
    if (current.phase === 'ringing-outgoing' && current.callId) {
      socket?.emit('call:cancel', { callId: current.callId })
    }
    resetToIdle()
  }, [socket, resetToIdle])

  const hangUp = useCallback(() => {
    const callId = callIdRef.current
    if (callId) {
      socket?.emit('call:end', { callId })
    }
    resetToIdle()
  }, [socket, resetToIdle])

  // Muting only affects the local track locally (the other party's browser
  // has no way to observe that) — the peer only finds out via this explicit
  // signal, mirrored by the same event carrying their own status back.
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return
    setIsMuted((prev) => {
      const next = !prev
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !next
      })
      if (callIdRef.current) {
        socket?.emit('call:mute-status', { callId: callIdRef.current, isMuted: next })
      }
      return next
    })
  }, [socket])

  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return
    setIsCameraOff((prev) => {
      const next = !prev
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !next
      })
      return next
    })
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleIncoming = ({ callId, callType, caller }) => {
      isCallerRef.current = false
      callIdRef.current = callId
      setState({
        phase: 'ringing-incoming',
        callId,
        callType,
        peerInfo: caller,
        activeSince: null,
      })
    }

    const handleAccepted = async ({ callId }) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: state.callType === 'video',
        })
        localStreamRef.current = stream
        setLocalStream(stream)

        const pc = createPeerConnection(callId)
        stream.getTracks().forEach((track) => pc.addTrack(track, stream))

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        callIdRef.current = callId
        setState((prev) => ({ ...prev, phase: 'connecting', callId }))
        socket.emit('call:offer', { callId, sdp: pc.localDescription })
      } catch {
        toast.error('Could not access camera/microphone')
        socket.emit('call:end', { callId })
        resetToIdle()
      }
    }

    const handleOffer = async ({ callId, sdp }) => {
      let pc = pcRef.current
      if (!pc) {
        // No peer connection yet on this side — either this is the very
        // first offer racing the local acceptCall() setup, or (far more
        // likely mid-call) a prior STUN-only attempt failed and was torn
        // down via teardownPeerConnectionOnly. Either way, a fresh offer
        // arriving with nothing to receive it into means "start over here
        // too" — and since the only reason the caller would ever resend an
        // offer mid-call is the TURN escalation, mark this side as
        // escalated as well before rebuilding.
        if (!localStreamRef.current) return
        useTurnRef.current = true
        pc = createPeerConnection(callId)
        localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current))
      }
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      await flushPendingCandidates()
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('call:answer', { callId, sdp: pc.localDescription })
      setState((prev) => ({ ...prev, phase: 'active', activeSince: Date.now() }))
      isRetryingRef.current = false
    }

    const handleAnswer = async ({ sdp }) => {
      const pc = pcRef.current
      if (!pc) return
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      await flushPendingCandidates()
      setState((prev) => ({ ...prev, phase: 'active', activeSince: Date.now() }))
      isRetryingRef.current = false
    }

    const handleIceCandidate = ({ candidate }) => {
      const pc = pcRef.current
      const iceCandidate = new RTCIceCandidate(candidate)
      if (pc && pc.remoteDescription) {
        pc.addIceCandidate(iceCandidate).catch(() => {})
      } else {
        pendingCandidatesRef.current.push(iceCandidate)
      }
    }

    const handleIceRetryRequest = ({ callId }) => {
      if (callId !== callIdRef.current) return
      if (!isCallerRef.current || useTurnRef.current) return
      isRetryingRef.current = true
      retryCallWithTurnRef.current?.()
    }

    const handleRejected = () => {
      toast.error('Call declined')
      resetToIdle()
    }

    const handleCancelled = () => {
      resetToIdle()
    }

    const handleBusy = () => {
      toast.error('User is busy on another call')
      resetToIdle()
    }

    const handleTimeout = () => {
      toast.error('No answer')
      resetToIdle()
    }

    const handleError = ({ message }) => {
      toast.error(message || 'Call failed')
      resetToIdle()
    }

    const handleEnd = () => {
      resetToIdle()
    }

    const handleMuteStatus = ({ callId, isMuted: remoteMuted }) => {
      if (callId !== callIdRef.current) return
      setIsRemoteMuted(remoteMuted)
    }

    socket.on('call:incoming', handleIncoming)
    socket.on('call:accepted', handleAccepted)
    socket.on('call:offer', handleOffer)
    socket.on('call:answer', handleAnswer)
    socket.on('call:ice-candidate', handleIceCandidate)
    socket.on('call:ice-retry-request', handleIceRetryRequest)
    socket.on('call:rejected', handleRejected)
    socket.on('call:cancelled', handleCancelled)
    socket.on('call:busy', handleBusy)
    socket.on('call:timeout', handleTimeout)
    socket.on('call:error', handleError)
    socket.on('call:end', handleEnd)
    socket.on('call:mute-status', handleMuteStatus)

    return () => {
      socket.off('call:incoming', handleIncoming)
      socket.off('call:accepted', handleAccepted)
      socket.off('call:offer', handleOffer)
      socket.off('call:answer', handleAnswer)
      socket.off('call:ice-candidate', handleIceCandidate)
      socket.off('call:ice-retry-request', handleIceRetryRequest)
      socket.off('call:rejected', handleRejected)
      socket.off('call:cancelled', handleCancelled)
      socket.off('call:mute-status', handleMuteStatus)
      socket.off('call:busy', handleBusy)
      socket.off('call:timeout', handleTimeout)
      socket.off('call:error', handleError)
      socket.off('call:end', handleEnd)
    }
  }, [socket, state.callType, createPeerConnection, flushPendingCandidates, resetToIdle])

  return {
    phase: state.phase,
    callType: state.callType,
    peerInfo: state.peerInfo,
    activeSince: state.activeSince,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    isRemoteMuted,
    startCall,
    acceptCall,
    rejectCall,
    cancelCall,
    hangUp,
    toggleMute,
    toggleCamera,
  }
}
