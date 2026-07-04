import { formatDistanceToNowStrict } from 'date-fns'
import Avatar from '../../../components/common/Avatar'
import { PhoneIcon, VideoCameraIcon, ArrowUpRightIcon, ArrowDownLeftIcon } from '../../../components/common/icons'
import { callStatusLabel, formatCallDuration, isMissedCall } from '../callHelpers'
import { useCall } from '../CallContext'

const TYPE_ICONS = {
  voice: PhoneIcon,
  video: VideoCameraIcon,
}

export default function CallHistoryItem({ call }) {
  const { startCall, phase } = useCall()
  const { otherUser, direction, callType, status, durationSec, createdAt } = call
  const missed = isMissedCall(status)
  const duration = status === 'completed' ? formatCallDuration(durationSec) : null
  const DirectionIcon = direction === 'outgoing' ? ArrowUpRightIcon : ArrowDownLeftIcon
  const TypeIcon = TYPE_ICONS[callType] || PhoneIcon

  return (
    <div className="flex items-center gap-3 rounded-lg p-2 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-900">
      <Avatar src={otherUser?.avatarUrl} alt={otherUser?.username} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{otherUser?.username}</p>
        <p
          className={`flex items-center gap-1 truncate text-xs ${missed ? 'text-danger' : 'text-gray-500'}`}
        >
          <DirectionIcon className="h-3 w-3 shrink-0" />
          {callStatusLabel(status)}
          {duration ? ` · ${duration}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {createdAt && (
          <span className="text-[11px] text-gray-400">
            {formatDistanceToNowStrict(new Date(createdAt))} ago
          </span>
        )}
        <button
          type="button"
          onClick={() => startCall(otherUser, callType)}
          disabled={phase !== 'idle'}
          aria-label={`Call ${otherUser?.username}`}
          className="rounded-full p-1.5 text-brand transition-transform duration-150 hover:bg-gray-100 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800 motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          <TypeIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
