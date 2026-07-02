import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import Avatar from '../../../components/common/Avatar'
import OnlineStatusDot from './OnlineStatusDot'

const CONTENT_TYPE_PREVIEW = {
  image: 'Photo',
  video: 'Video',
  file: 'File',
}

export default function ConversationListItem({ conversation }) {
  const { otherUser, lastMessage, unreadCount, updatedAt } = conversation
  const hasUnread = unreadCount > 0
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  const preview = lastMessage
    ? lastMessage.contentType === 'text'
      ? lastMessage.content
      : CONTENT_TYPE_PREVIEW[lastMessage.contentType] || 'Attachment'
    : 'Start a conversation'

  return (
    <Link
      to={`/messages/${otherUser?.username}`}
      className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <div className="relative shrink-0">
        <Avatar src={otherUser?.avatarUrl} alt={otherUser?.username} size="md" />
        <OnlineStatusDot isOnline={otherUser?.isOnline} className="absolute bottom-0 right-0" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{otherUser?.username}</p>
        <p className={`truncate text-xs ${hasUnread ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>
          {preview}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {updatedAt && (
          <span className="text-[11px] text-gray-400">
            {formatDistanceToNowStrict(new Date(updatedAt))} ago
          </span>
        )}
        {hasUnread && (
          <span className="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {badgeLabel}
          </span>
        )}
      </div>
    </Link>
  )
}
