import { formatDistanceToNowStrict } from 'date-fns'
import Avatar from '../../../components/common/Avatar'
import { callStatusLabel, formatCallDuration, isMissedCall } from '../callHelpers'
import { useCall } from '../CallContext'

const DIRECTION_ICON = {
  outgoing: '↗',
  incoming: '↙',
}

const TYPE_ICON = {
  voice: '📞',
  video: '🎥',
}

export default function CallHistoryItem({ call }) {
  const { startCall, phase } = useCall()
  const { otherUser, direction, callType, status, durationSec, createdAt } = call
  const missed = isMissedCall(status)
  const duration = status === 'completed' ? formatCallDuration(durationSec) : null

  return (
    <div className="flex items-center gap-3 rounded-lg p-2">
      <Avatar src={otherUser?.avatarUrl} alt={otherUser?.username} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{otherUser?.username}</p>
        <p className={`truncate text-xs ${missed ? 'text-danger' : 'text-gray-500'}`}>
          <span aria-hidden="true">{DIRECTION_ICON[direction] || ''}</span>{' '}
          <span aria-hidden="true">{TYPE_ICON[callType] || ''}</span>{' '}
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
          className="rounded-full p-1 text-base hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800"
        >
          {TYPE_ICON[callType] || '📞'}
        </button>
      </div>
    </div>
  )
}
