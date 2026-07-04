import clsx from 'clsx'

export default function Logo({ iconClassName = 'h-8 w-8', showWordmark = true, wordmarkClassName = '' }) {
  return (
    <span className="inline-flex items-center gap-2">
      <img src="/favicon.svg" alt="" className={iconClassName} />
      {showWordmark && (
        <span className={clsx('font-bold tracking-tight', wordmarkClassName || 'text-xl')}>
          PhotoSphere
        </span>
      )}
    </span>
  )
}
