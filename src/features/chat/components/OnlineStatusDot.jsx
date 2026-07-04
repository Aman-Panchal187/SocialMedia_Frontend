import clsx from 'clsx'

// The outer element only ever carries the caller's own layout/position
// classes (e.g. "absolute bottom-0 right-0" to pin it to an avatar's corner)
// — it must never also declare its own position utility itself, since two
// conflicting position utilities (this component's and the caller's) don't
// reliably cascade by className order, only by Tailwind's fixed stylesheet
// order. The inner wrapper carries "relative" instead, purely to anchor the
// ping/dot absolutely within itself, fully independent of the outer element.
export default function OnlineStatusDot({ isOnline, className }) {
  return (
    <span className={clsx('inline-block h-2.5 w-2.5', className)}>
      <span className="relative block h-full w-full">
        {isOnline && (
          <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-75 motion-reduce:animate-none" />
        )}
        <span
          aria-label={isOnline ? 'Online' : 'Offline'}
          className={clsx(
            'absolute inset-0 rounded-full border-2 border-white dark:border-gray-900',
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      </span>
    </span>
  )
}
