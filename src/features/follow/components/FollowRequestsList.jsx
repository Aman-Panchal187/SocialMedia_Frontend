import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Avatar from '../../../components/common/Avatar'
import Button from '../../../components/common/Button'
import { followApi } from '../../../api/followApi'

export default function FollowRequestsList() {
  const queryClient = useQueryClient()

  const query = useInfiniteQuery({
    queryKey: ['followRequests'],
    queryFn: ({ pageParam }) => followApi.getRequests({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
  })

  const acceptMutation = useMutation({
    mutationFn: (username) => followApi.acceptRequest(username),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['followRequests'] }),
    onError: () => toast.error('Failed to accept request'),
  })

  const rejectMutation = useMutation({
    mutationFn: (username) => followApi.rejectRequest(username),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['followRequests'] }),
    onError: () => toast.error('Failed to reject request'),
  })

  const requests = query.data?.pages.flatMap((page) => page.data.items) ?? []

  if (query.isLoading) {
    return <p className="text-sm text-gray-500">Loading requests…</p>
  }

  if (requests.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-500">No pending follow requests</p>
  }

  return (
    <div>
      {requests.map((user) => (
        <div key={user.id} className="flex items-center justify-between py-2">
          <Link to={`/${user.username}`} className="flex items-center gap-3">
            <Avatar src={user.avatarUrl} alt={user.username} size="sm" />
            <span className="text-sm font-semibold">{user.username}</span>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="primary"
              className="px-3 py-1"
              onClick={() => acceptMutation.mutate(user.username)}
              isLoading={acceptMutation.isPending}
            >
              Accept
            </Button>
            <Button
              variant="secondary"
              className="px-3 py-1"
              onClick={() => rejectMutation.mutate(user.username)}
              isLoading={rejectMutation.isPending}
            >
              Reject
            </Button>
          </div>
        </div>
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
    </div>
  )
}
