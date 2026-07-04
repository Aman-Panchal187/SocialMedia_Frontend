import { useCall } from '../CallContext'
import { PhoneIcon, VideoCameraIcon } from '../../../components/common/icons'

export default function CallButton({ user }) {
  const { startCall, phase } = useCall()
  const isBusy = phase !== 'idle'

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => startCall(user, 'voice')}
        disabled={isBusy}
        aria-label="Voice call"
        className="rounded-full p-2 text-gray-700 transition-[background-color,transform] duration-150 hover:bg-gray-100 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <PhoneIcon />
      </button>
      <button
        type="button"
        onClick={() => startCall(user, 'video')}
        disabled={isBusy}
        aria-label="Video call"
        className="rounded-full p-2 text-gray-700 transition-[background-color,transform] duration-150 hover:bg-gray-100 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-200 dark:hover:bg-gray-800 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <VideoCameraIcon />
      </button>
    </div>
  )
}
