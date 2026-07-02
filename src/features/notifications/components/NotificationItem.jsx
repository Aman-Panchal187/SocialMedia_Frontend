import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { formatDistanceToNowStrict } from 'date-fns'
import Avatar from '../../../components/common/Avatar'
import Button from '../../../components/common/Button'
import { followApi } from '../../../api/followApi'
import { notificationMessage } from '../notificationMessage'
import { NOTIFICATIONS_QUERY_KEY } from '../hooks/useNotifications'

export default function NotificationItem({ notification, onOpenPost, onMarkRead }) {
  const { actor, type, entityType, entityId, isRead, createdAt, followStatus } = notification
  const queryClient = useQueryClient()
  // 'pending' | 'accepted' | 'rejected'. Backend reports null once a request is no
  // longer pending and wasn't accepted, which — for a follow_request notification —
  // only happens after a rejection, so it's normalized to 'rejected' here.
  const [localOutcome, setLocalOutcome] = useState(null)
  const effectiveStatus = localOutcome ?? followStatus ?? 'rejected'

  const acceptMutation = useMutation({
    mutationFn: () => followApi.acceptRequest(actor.username),
    onSuccess: () => {
      setLocalOutcome('accepted')
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
    onError: () => toast.error('Failed to accept request'),
  })

  const rejectMutation = useMutation({
    mutationFn: () => followApi.rejectRequest(actor.username),
    onSuccess: () => {
      setLocalOutcome('rejected')
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
    onError: () => toast.error('Failed to reject request'),
  })

  const handleClick = () => {
    if (!isRead) onMarkRead(notification.id)
    if (entityType === 'post') onOpenPost(entityId)
  }

  const avatarAndText = (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar src={actor?.avatarUrl} alt={actor?.username} size="sm" className="shrink-0" />
      <p className="min-w-0 flex-1 text-sm">
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

  if (type === 'follow_request' && followStatus !== undefined) {
    const isPending = acceptMutation.isPending || rejectMutation.isPending

    return (
      <div className={`flex w-full flex-col gap-2 rounded-lg p-2 ${isRead ? '' : 'bg-brand/5'}`}>
        <Link
          to={`/${actor?.username}`}
          onClick={() => !isRead && onMarkRead(notification.id)}
          className="rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {avatarAndText}
        </Link>

        {effectiveStatus === 'pending' ? (
          <div className="flex justify-end gap-2">
            <Button
              variant="primary"
              className="px-3 py-1 text-xs"
              disabled={isPending}
              onClick={() => acceptMutation.mutate()}
            >
              Accept
            </Button>
            <Button
              variant="secondary"
              className="px-3 py-1 text-xs"
              disabled={isPending}
              onClick={() => rejectMutation.mutate()}
            >
              Reject
            </Button>
          </div>
        ) : (
          <p className="pr-1 text-right text-xs font-semibold text-gray-500">
            {effectiveStatus === 'accepted' ? 'Accepted' : 'Rejected'}
          </p>
        )}
      </div>
    )
  }

  if (entityType === 'user') {
    return (
      <Link
        to={`/${actor?.username}`}
        onClick={() => !isRead && onMarkRead(notification.id)}
        className={rowClassName}
      >
        {avatarAndText}
      </Link>
    )
  }

  return (
    <button type="button" onClick={handleClick} className={rowClassName}>
      {avatarAndText}
    </button>
  )
}
