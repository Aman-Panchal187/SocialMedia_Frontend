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

  const pcRef = useRef(null)
  const localStreamRef = useRef(null)
  const remoteStreamRef = useRef(null)
  const pendingCandidatesRef = useRef([])
  const callIdRef = useRef(null)
  const rtcConfigRef = useRef(FALLBACK_RTC_CONFIG)
  const stateRef = useRef(state)
  stateRef.current = state

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

  const teardownMedia = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
    }
    remoteStreamRef.current = null
    pendingCandidatesRef.current = []
    setLocalStream(null)
    setRemoteStream(null)
  }, [])

  const resetToIdle = useCallback(() => {
    teardownMedia()
    callIdRef.current = null
    setState(INITIAL_STATE)
    // Every call-ending path (hangUp, reject, cancel, timeout, busy, error, the
    // other party ending it) converges here, and each one persists a call-history
    // row server-side — refetch so the Calls page reflects it without a manual reload.
    queryClient.invalidateQueries({ queryKey: CALL_HISTORY_QUERY_KEY })
  }, [teardownMedia, queryClient])

  const createPeerConnection = useCallback(
    (callId) => {
      const pc = new RTCPeerConnection(rtcConfigRef.current)

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

      // Without this, an ICE failure (no viable route between the peers, e.g.
      // TURN unavailable across restrictive NATs) left the call "active" —
      // timer running, remote side black, no audio — with no indication
      // anything was wrong. Surface it and end the call instead.
      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          toast.error('Could not establish a media connection — call ended')
          const failedCallId = callIdRef.current
          if (failedCallId) socket?.emit('call:end', { callId: failedCallId })
          resetToIdle()
        }
      }

      pcRef.current = pc
      return pc
    },
    [socket, resetToIdle]
  )

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

  useEffect(() => {
    if (!socket) return

    const handleIncoming = ({ callId, callType, caller }) => {
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
      const pc = pcRef.current
      if (!pc) return
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      await flushPendingCandidates()
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('call:answer', { callId, sdp: pc.localDescription })
      setState((prev) => ({ ...prev, phase: 'active', activeSince: Date.now() }))
    }

    const handleAnswer = async ({ sdp }) => {
      const pc = pcRef.current
      if (!pc) return
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      await flushPendingCandidates()
      setState((prev) => ({ ...prev, phase: 'active', activeSince: Date.now() }))
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

    socket.on('call:incoming', handleIncoming)
    socket.on('call:accepted', handleAccepted)
    socket.on('call:offer', handleOffer)
    socket.on('call:answer', handleAnswer)
    socket.on('call:ice-candidate', handleIceCandidate)
    socket.on('call:rejected', handleRejected)
    socket.on('call:cancelled', handleCancelled)
    socket.on('call:busy', handleBusy)
    socket.on('call:timeout', handleTimeout)
    socket.on('call:error', handleError)
    socket.on('call:end', handleEnd)

    return () => {
      socket.off('call:incoming', handleIncoming)
      socket.off('call:accepted', handleAccepted)
      socket.off('call:offer', handleOffer)
      socket.off('call:answer', handleAnswer)
      socket.off('call:ice-candidate', handleIceCandidate)
      socket.off('call:rejected', handleRejected)
      socket.off('call:cancelled', handleCancelled)
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
    startCall,
    acceptCall,
    rejectCall,
    cancelCall,
    hangUp,
  }
}
