import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Avatar from '../../../components/common/Avatar'
import { PhoneIcon } from '../../../components/common/icons'
import { useCall } from '../CallContext'

export default function OutgoingCallOverlay() {
  const { phase, callType, peerInfo, cancelCall } = useCall()
  const cancelButtonRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  const isVisible = phase === 'ringing-outgoing'

  useEffect(() => {
    if (isVisible) cancelButtonRef.current?.focus()
  }, [isVisible])

  if (!isVisible) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Outgoing call"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      >
        <motion.div
          className="w-full max-w-xs rounded-xl bg-white p-6 text-center shadow-lg dark:bg-gray-900"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <Avatar src={peerInfo?.avatarUrl} alt={peerInfo?.username} size="xl" className="mx-auto" />
          <p className="mt-4 text-base font-semibold">{peerInfo?.username}</p>
          <p className="mt-1 text-sm text-gray-500">
            Calling{callType === 'video' ? ' (video)' : ''}…
          </p>
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={cancelCall}
            aria-label="Cancel call"
            className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-danger text-white transition-transform hover:scale-105"
          >
            <PhoneIcon className="h-6 w-6 rotate-[135deg]" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
