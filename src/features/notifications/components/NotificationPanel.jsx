import { useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import { motion, useReducedMotion } from 'framer-motion'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
import PostDetailModal from '../../posts/components/PostDetailModal'
import { useMarkRead, useNotifications } from '../hooks/useNotifications'
import NotificationItem from './NotificationItem'

export default function NotificationPanel() {
  const [activePostId, setActivePostId] = useState(null)
  const notificationsQuery = useNotifications()
  const markReadMutation = useMarkRead()
  const prefersReducedMotion = useReducedMotion()

  const notifications = notificationsQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
      className="max-h-[28rem] w-80 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <h2 className="px-2 py-1 text-sm font-semibold">Notifications</h2>

      {notificationsQuery.isLoading && (
        <div className="space-y-2 p-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton circle width={32} height={32} />
              <Skeleton width={180} height={12} />
            </div>
          ))}
        </div>
      )}

      {!notificationsQuery.isLoading && notifications.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-500">No notifications yet</p>
      )}

      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onOpenPost={setActivePostId}
          onMarkRead={(id) => markReadMutation.mutate(id)}
        />
      ))}

      <InfiniteScrollSentinel
        enabled={notificationsQuery.hasNextPage && !notificationsQuery.isFetchingNextPage}
        onIntersect={() => notificationsQuery.fetchNextPage()}
      />

      <PostDetailModal
        postId={activePostId}
        isOpen={Boolean(activePostId)}
        onClose={() => setActivePostId(null)}
      />
    </motion.div>
  )
}
