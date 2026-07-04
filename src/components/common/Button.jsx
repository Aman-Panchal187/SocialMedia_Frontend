import clsx from 'clsx'

const VARIANT_CLASSES = {
  primary: 'bg-brand text-white shadow-sm shadow-brand/25 hover:bg-brand-hover disabled:opacity-50 disabled:shadow-none',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  danger: 'bg-danger text-white shadow-sm shadow-danger/25 hover:opacity-90 disabled:opacity-50 disabled:shadow-none',
  ghost: 'bg-transparent text-brand hover:text-brand-hover',
}

function Spinner({ className }) {
  return (
    <svg className={clsx('animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12H4Z" />
    </svg>
  )
}

export default function Button({
  variant = 'primary',
  className,
  isLoading = false,
  disabled,
  children,
  ...props
}) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold',
        'transition-[background-color,box-shadow,transform] duration-150 ease-out',
        'active:scale-[0.97] disabled:cursor-not-allowed disabled:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900',
        'motion-reduce:transition-none motion-reduce:active:scale-100',
        VARIANT_CLASSES[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="h-4 w-4" />}
      {isLoading ? 'Loading…' : children}
    </button>
  )
}
