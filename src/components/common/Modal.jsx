import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

// Width is entirely caller-controlled via className (e.g. "sm:max-w-lg") — there
// is deliberately no default max-width baked in here. Two same-breakpoint
// Tailwind utilities (a hardcoded default here plus a caller's override) don't
// reliably cascade by className/DOM order, since Tailwind's generated
// stylesheet order is fixed at build time, not by usage order in JSX. Giving
// every caller full ownership of width avoids that conflict outright.
export default function Modal({ isOpen, onClose, children, className = '', ariaLabel }) {
  const panelRef = useRef(null)
  const previouslyFocusedRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement
    } else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus?.()
      previouslyFocusedRef.current = null
    }
  }, [isOpen])

  // Grabbing initial focus must only happen once per open — it's split from
  // the keydown-listener effect below (which legitimately needs to depend on
  // onClose) so that a caller passing a fresh onClose function every render
  // (e.g. an inline handleClose) doesn't repeatedly steal focus back to the
  // first focusable element while the user is typing elsewhere in the modal.
  useEffect(() => {
    if (!isOpen) return

    const panel = panelRef.current
    const focusableElements = panel ? Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)) : []
    const initialTarget = focusableElements[0] || panel
    initialTarget?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return undefined

    const panel = panelRef.current

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
        return
      }

      if (e.key !== 'Tab' || !panel) return

      const elements = Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR))
      if (elements.length === 0) {
        e.preventDefault()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first || !panel.contains(document.activeElement)) {
          e.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last || !panel.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel || 'Dialog'}
            tabIndex={-1}
            className={`max-h-[90vh] w-full max-w-full overflow-y-auto rounded-xl bg-white shadow-modal dark:bg-gray-900 ${className}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
