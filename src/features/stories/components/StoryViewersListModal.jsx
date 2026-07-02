import { formatDistanceToNowStrict } from 'date-fns'
import Skeleton from 'react-loading-skeleton'
import Modal from '../../../components/common/Modal'
import Avatar from '../../../components/common/Avatar'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
import { useStoryViewers } from '../hooks/useStoryViewers'

export default function StoryViewersListModal({ storyId, isOpen, onClose }) {
  const viewersQuery = useStoryViewers(storyId, { enabled: isOpen })
  const viewers = viewersQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-sm">
      <div className="max-h-[28rem] overflow-y-auto p-4">
        <h2 className="mb-3 text-sm font-semibold">Viewers</h2>

        {viewersQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton circle width={32} height={32} />
                <Skeleton width={140} height={12} />
              </div>
            ))}
          </div>
        )}

        {!viewersQuery.isLoading && viewers.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">No views yet</p>
        )}

        <div className="flex flex-col gap-3">
          {viewers.map((viewer) => (
            <div key={viewer.id} className="flex items-center gap-3">
              <Avatar src={viewer.avatarUrl} alt={viewer.username} size="sm" />
              <span className="flex-1 text-sm font-medium">{viewer.username}</span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNowStrict(new Date(viewer.viewedAt))} ago
              </span>
            </div>
          ))}
        </div>

        <InfiniteScrollSentinel
          enabled={viewersQuery.hasNextPage && !viewersQuery.isFetchingNextPage}
          onIntersect={() => viewersQuery.fetchNextPage()}
        />
      </div>
    </Modal>
  )
}
