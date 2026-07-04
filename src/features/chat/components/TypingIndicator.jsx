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
          className="flex items-center gap-1 overflow-hidden px-3 py-1 text-xs text-gray-400"
          aria-live="polite"
        >
          <span className="flex gap-0.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
          </span>
          typing…
        </motion.div>
      )}
    </AnimatePresence>
  )
}
