import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { followApi } from '../../../api/followApi'

export default function FollowButton({ username, isFollowing, isFollowRequested, queryKey }) {
  const queryClient = useQueryClient()

  const followMutation = useMutation({
    mutationFn: () => followApi.follow(username),
    onSuccess: (res) => {
      const status = res.data.status
      if (queryKey) {
        queryClient.setQueryData(queryKey, (old) =>
          old
            ? {
                ...old,
                data: {
                  ...old.data,
                  isFollowing: status === 'accepted',
                  isFollowRequested: status === 'pending',
                },
              }
            : old
        )
      }
    },
    onError: () => toast.error('Failed to follow user'),
  })

  const unfollowMutation = useMutation({
    mutationFn: () => followApi.unfollow(username),
    onSuccess: () => {
      if (queryKey) {
        queryClient.setQueryData(queryKey, (old) =>
          old
            ? { ...old, data: { ...old.data, isFollowing: false, isFollowRequested: false } }
            : old
        )
      }
    },
    onError: () => toast.error('Failed to unfollow user'),
  })

  const isPending = followMutation.isPending || unfollowMutation.isPending

  if (isFollowing) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (window.confirm(`Unfollow @${username}?`)) {
            unfollowMutation.mutate()
          }
        }}
        className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      >
        Following
      </button>
    )
  }

  if (isFollowRequested) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => unfollowMutation.mutate()}
        className="rounded-lg bg-gray-100 px-4 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
      >
        Requested
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => followMutation.mutate()}
      className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-50"
    >
      Follow
    </button>
  )
}
