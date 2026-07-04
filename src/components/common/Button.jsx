import clsx from 'clsx'

const VARIANT_CLASSES = {
  primary: 'bg-brand text-white hover:bg-brand-hover disabled:opacity-50',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  danger: 'bg-danger text-white hover:opacity-90 disabled:opacity-50',
  ghost: 'bg-transparent text-brand hover:text-brand-hover',
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
        'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading…' : children}
    </button>
  )
}
