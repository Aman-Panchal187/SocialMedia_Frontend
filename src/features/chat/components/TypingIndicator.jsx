import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

export default function TypingIndicator({ isTyping }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <AnimatePresence>
      {isTyping && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden px-3 pb-1 pt-2"
          aria-live="polite"
          aria-label="Typing"
        >
          {/* Mirrors the other person's message bubble (rounded-2xl, same
              surface color, left-aligned) so it reads as a live preview of
              the next incoming message, the way Instagram's does — just
              three dancing dots, no "typing…" label. */}
          <div className="inline-flex items-center gap-1 rounded-2xl bg-white px-4 py-3 shadow-xs dark:bg-gray-800">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s] [animation-duration:1s] dark:bg-gray-500" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s] [animation-duration:1s] dark:bg-gray-500" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-duration:1s] dark:bg-gray-500" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
