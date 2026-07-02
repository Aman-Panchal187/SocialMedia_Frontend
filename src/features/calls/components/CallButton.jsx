import { useCall } from '../CallContext'

export default function CallButton({ username }) {
  const { startCall, phase } = useCall()
  const isBusy = phase !== 'idle'

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => startCall(username, 'voice')}
        disabled={isBusy}
        aria-label="Voice call"
        className="rounded-full p-2 text-lg hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800"
      >
        📞
      </button>
      <button
        type="button"
        onClick={() => startCall(username, 'video')}
        disabled={isBusy}
        aria-label="Video call"
        className="rounded-full p-2 text-lg hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800"
      >
        🎥
      </button>
    </div>
  )
}
