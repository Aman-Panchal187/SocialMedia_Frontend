import { Link } from 'react-router-dom'
import { formatDistanceToNowStrict } from 'date-fns'
import Avatar from '../../../components/common/Avatar'
import { notificationMessage } from '../notificationMessage'

export default function NotificationItem({ notification, onOpenPost, onMarkRead }) {
  const { actor, type, entityType, entityId, isRead, createdAt } = notification

  const handleClick = () => {
    if (!isRead) onMarkRead(notification.id)
    if (entityType === 'post') onOpenPost(entityId)
  }

  const content = (
    <div className="flex items-center gap-3 px-1">
      <Avatar src={actor?.avatarUrl} alt={actor?.username} size="sm" />
      <p className="flex-1 text-sm">
        <span className="mr-1 font-semibold">{actor?.username}</span>
        {notificationMessage(type)}
        <span className="ml-2 text-xs text-gray-400">
          {formatDistanceToNowStrict(new Date(createdAt))} ago
        </span>
      </p>
      {!isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
    </div>
  )

  const rowClassName = `flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
    isRead ? '' : 'bg-brand/5'
  }`

  if (entityType === 'user') {
    return (
      <Link
        to={`/${actor?.username}`}
        onClick={() => !isRead && onMarkRead(notification.id)}
        className={rowClassName}
      >
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={handleClick} className={rowClassName}>
      {content}
    </button>
  )
}
