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
        className="rounded-full p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800"
      >
        <PhoneIcon />
      </button>
      <button
        type="button"
        onClick={() => startCall(user, 'video')}
        disabled={isBusy}
        aria-label="Video call"
        className="rounded-full p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800"
      >
        <VideoCameraIcon />
      </button>
    </div>
  )
}
