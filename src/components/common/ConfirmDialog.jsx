import clsx from 'clsx'
import Modal from './Modal'

// Instagram-style confirmation sheet: centered message on top, full-width
// stacked action buttons below, replacing native window.confirm() popups
// with something that matches the rest of the app's design.
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isConfirming = false,
  destructive = true,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel={title} className="sm:max-w-xs">
      <div className="flex flex-col items-center px-6 py-6 text-center">
        {title && <h2 className="text-sm font-semibold">{title}</h2>}
        {description && <p className="mt-1.5 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="flex flex-col border-t border-gray-200 dark:border-gray-800">
        <button
          type="button"
          disabled={isConfirming}
          onClick={onConfirm}
          className={clsx(
            'border-b border-gray-200 py-3 text-sm font-semibold disabled:opacity-50 dark:border-gray-800',
            destructive
              ? 'text-danger hover:bg-gray-50 dark:hover:bg-gray-800'
              : 'text-brand hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          {isConfirming ? 'Please wait…' : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="py-3 text-sm text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800"
        >
          {cancelLabel}
        </button>
      </div>
    </Modal>
  )
}
