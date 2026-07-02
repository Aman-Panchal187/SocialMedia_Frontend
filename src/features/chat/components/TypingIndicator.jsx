export default function TypingIndicator({ isTyping }) {
  if (!isTyping) return null

  return (
    <div className="flex items-center gap-1 px-3 py-1 text-xs text-gray-400" aria-live="polite">
      <span className="flex gap-0.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
      </span>
      typing…
    </div>
  )
}
