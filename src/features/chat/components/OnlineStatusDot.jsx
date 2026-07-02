import clsx from 'clsx'

export default function OnlineStatusDot({ isOnline, className }) {
  return (
    <span
      aria-label={isOnline ? 'Online' : 'Offline'}
      className={clsx(
        'inline-block h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-900',
        isOnline ? 'bg-green-500' : 'bg-gray-400',
        className
      )}
    />
  )
}
