import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import Modal from '../../../components/common/Modal'
import ModalHeader from '../../../components/common/ModalHeader'
import Avatar from '../../../components/common/Avatar'
import EmptyState from '../../../components/common/EmptyState'
import { UsersIcon } from '../../../components/common/icons'
import { followApi } from '../../../api/followApi'

export default function FollowersListModal({ username, isOpen, onClose }) {
  const query = useInfiniteQuery({
    queryKey: ['followers', username],
    queryFn: ({ pageParam }) => followApi.getFollowers(username, { cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: isOpen && Boolean(username),
  })

  const users = query.data?.pages.flatMap((page) => page.data.items) ?? []

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Followers" className="overflow-hidden p-0 sm:max-w-lg">
      <ModalHeader title="Followers" onClose={onClose} />
      <div className="max-h-[70vh] overflow-y-auto p-4">
        {query.isLoading && (
          <div className="space-y-3 p-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton circle width={32} height={32} />
                <div className="flex-1">
                  <Skeleton width="50%" height={12} />
                  <Skeleton width="30%" height={10} />
                </div>
              </div>
            ))}
          </div>
        )}
        {users.map((user) => (
          <Link
            key={user.id}
            to={`/${user.username}`}
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Avatar src={user.avatarUrl} alt={user.username} size="sm" />
            <div>
              <p className="text-sm font-semibold">{user.username}</p>
              {user.fullName && <p className="text-xs text-gray-500">{user.fullName}</p>}
            </div>
          </Link>
        ))}
        {query.hasNextPage && (
          <button
            type="button"
            onClick={() => query.fetchNextPage()}
            className="rounded-lg px-1 py-2 text-sm font-semibold text-gray-500 transition-colors duration-150 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:hover:text-gray-300"
          >
            Load more
          </button>
        )}
        {!query.isLoading && users.length === 0 && (
          <EmptyState icon={UsersIcon} title="No followers yet" />
        )}
      </div>
    </Modal>
  )
}
