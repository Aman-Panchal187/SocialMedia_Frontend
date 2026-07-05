import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
import EmptyState from '../../../components/common/EmptyState'
import { BellIcon } from '../../../components/common/icons'
import PostDetailModal from '../../posts/components/PostDetailModal'
import { useMarkRead, useNotifications } from '../hooks/useNotifications'
import NotificationItem from '../components/NotificationItem'

// A full page rather than reusing the desktop NotificationBell's dropdown
// panel — that panel is positioned relative to the bell icon it drops down
// from, which works fine in the top navbar but would render off the bottom
// of the screen if opened from a fixed bottom tab bar on mobile.
export default function NotificationsPage() {
  const [activePostId, setActivePostId] = useState(null)
  const notificationsQuery = useNotifications()
  const markReadMutation = useMarkRead()

  const notifications = notificationsQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  return (
    <div className="mx-auto max-w-lg animate-fade-in px-2">
      <h1 className="px-2 py-3 text-lg font-semibold">Notifications</h1>

      {notificationsQuery.isLoading && (
        <div className="space-y-3 p-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton circle width={32} height={32} />
              <Skeleton width={220} height={12} />
            </div>
          ))}
        </div>
      )}

      {!notificationsQuery.isLoading && notifications.length === 0 && (
        <EmptyState icon={BellIcon} title="No notifications yet" />
      )}

      <div className="flex flex-col gap-1">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onOpenPost={setActivePostId}
            onMarkRead={(id) => markReadMutation.mutate(id)}
          />
        ))}
      </div>

      <InfiniteScrollSentinel
        enabled={notificationsQuery.hasNextPage && !notificationsQuery.isFetchingNextPage}
        onIntersect={() => notificationsQuery.fetchNextPage()}
      />

      <PostDetailModal
        postId={activePostId}
        isOpen={Boolean(activePostId)}
        onClose={() => setActivePostId(null)}
      />
    </div>
  )
}
