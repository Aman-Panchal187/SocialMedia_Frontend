import { CloseIcon } from './icons'

export default function ModalHeader({ title, onClose }) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="rounded-full p-1 text-gray-400 transition-[background-color,transform] duration-150 hover:bg-gray-100 hover:text-gray-600 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:hover:bg-gray-800 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <CloseIcon />
      </button>
    </div>
  )
}
