import { useInfiniteQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import Modal from '../../../components/common/Modal'
import Avatar from '../../../components/common/Avatar'
import { followApi } from '../../../api/followApi'

export default function FollowingListModal({ username, isOpen, onClose }) {
  const query = useInfiniteQuery({
    queryKey: ['following', username],
    queryFn: ({ pageParam }) => followApi.getFollowing(username, { cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: isOpen && Boolean(username),
  })

  const users = query.data?.pages.flatMap((page) => page.data.items) ?? []

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-h-[70vh] overflow-y-auto p-4">
        <h2 className="mb-3 text-center text-base font-semibold">Following</h2>
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
            className="flex items-center gap-3 py-2"
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
            className="text-sm font-semibold text-gray-500"
          >
            Load more
          </button>
        )}
        {!query.isLoading && users.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">Not following anyone yet</p>
        )}
      </div>
    </Modal>
  )
}
