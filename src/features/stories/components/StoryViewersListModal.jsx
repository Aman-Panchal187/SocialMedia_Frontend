import { formatDistanceToNowStrict } from 'date-fns'
import Skeleton from 'react-loading-skeleton'
import Modal from '../../../components/common/Modal'
import ModalHeader from '../../../components/common/ModalHeader'
import Avatar from '../../../components/common/Avatar'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
import EmptyState from '../../../components/common/EmptyState'
import { EyeIcon } from '../../../components/common/icons'
import { useStoryViewers } from '../hooks/useStoryViewers'

export default function StoryViewersListModal({ storyId, isOpen, onClose }) {
  const viewersQuery = useStoryViewers(storyId, { enabled: isOpen })
  const viewers = viewersQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Viewers" className="overflow-hidden p-0 max-w-sm">
      <ModalHeader title="Viewers" onClose={onClose} />
      <div className="max-h-[28rem] overflow-y-auto p-4">
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
          <EmptyState icon={EyeIcon} title="No views yet" />
        )}

        <div className="flex flex-col gap-3">
          {viewers.map((item) => (
            <div key={item.viewer?.id} className="flex items-center gap-3">
              <Avatar src={item.viewer?.avatarUrl} alt={item.viewer?.username} size="sm" />
              <span className="flex-1 text-sm font-medium">{item.viewer?.username}</span>
              {item.reactionEmoji && <span className="text-base">{item.reactionEmoji}</span>}
              <span className="text-xs text-gray-400">
                {formatDistanceToNowStrict(new Date(item.viewedAt))} ago
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
