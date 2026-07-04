import { useState } from 'react'
import clsx from 'clsx'

const SIZE_CLASSES = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
}

export default function Avatar({ src, alt = '', size = 'md', className }) {
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md

  if (!src || hasError) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center rounded-full bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-300',
          sizeClass,
          className
        )}
      >
        <span className="text-xs">{alt?.[0]?.toUpperCase() || '?'}</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      className={clsx(
        'rounded-full object-cover transition-opacity duration-300 motion-reduce:transition-none',
        isLoaded ? 'opacity-100' : 'opacity-0',
        sizeClass,
        className
      )}
    />
  )
}
