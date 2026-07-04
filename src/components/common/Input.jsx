import { forwardRef } from 'react'
import clsx from 'clsx'

const Input = forwardRef(function Input({ label, id, error, className, ...props }, ref) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={clsx(
          'w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm outline-none transition-colors duration-150',
          'focus:border-brand focus-visible:ring-2 focus-visible:ring-brand/20',
          error ? 'border-danger' : 'border-gray-300 dark:border-gray-700',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 animate-fade-in text-xs text-danger">{error}</p>}
    </div>
  )
})

export default Input
