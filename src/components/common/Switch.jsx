import clsx from 'clsx'

export default function Switch({ checked, defaultChecked, onChange, disabled, ariaLabel }) {
  return (
    <label className={clsx('relative inline-flex h-6 w-11 shrink-0 cursor-pointer', disabled && 'cursor-not-allowed opacity-50')}>
      <input
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className="peer sr-only"
      />
      <span
        className={clsx(
          'absolute inset-0 rounded-full bg-gray-300 transition-colors duration-200 dark:bg-gray-700',
          'peer-checked:bg-brand',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brand/50 peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-gray-900'
        )}
      />
      <span
        className={clsx(
          'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-xs transition-transform duration-200 motion-reduce:transition-none',
          'peer-checked:translate-x-5'
        )}
      />
    </label>
  )
}
