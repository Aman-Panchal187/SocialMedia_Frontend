import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

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

  useEffect(() => {
    if (!isOpen) return undefined

    const panel = panelRef.current
    const focusableElements = panel ? Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)) : []
    const initialTarget = focusableElements[0] || panel
    initialTarget?.focus()

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
            className={`max-h-[90vh] w-full max-w-full overflow-y-auto rounded-xl bg-white dark:bg-gray-900 sm:max-w-lg ${className}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
