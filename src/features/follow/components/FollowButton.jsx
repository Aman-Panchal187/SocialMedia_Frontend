import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { followApi } from '../../../api/followApi'

export default function FollowButton({ username, isFollowing, isFollowRequested, queryKey }) {
  const queryClient = useQueryClient()
  const [override, setOverride] = useState(null)

  const followMutation = useMutation({
    mutationFn: () => followApi.follow(username),
    onSuccess: (res) => {
      const status = res.data.status
      const next = { isFollowing: status === 'accepted', isFollowRequested: status === 'pending' }
      setOverride(next)
      if (queryKey) {
        queryClient.setQueryData(queryKey, (old) =>
          old ? { ...old, data: { ...old.data, ...next } } : old
        )
      }
    },
    onError: () => toast.error('Failed to follow user'),
  })

  const unfollowMutation = useMutation({
    mutationFn: () => followApi.unfollow(username),
    onSuccess: () => {
      const next = { isFollowing: false, isFollowRequested: false }
      setOverride(next)
      if (queryKey) {
        queryClient.setQueryData(queryKey, (old) =>
          old ? { ...old, data: { ...old.data, ...next } } : old
        )
      }
    },
    onError: () => toast.error('Failed to unfollow user'),
  })

  const isPending = followMutation.isPending || unfollowMutation.isPending
  const effectiveIsFollowing = override ? override.isFollowing : isFollowing
  const effectiveIsFollowRequested = override ? override.isFollowRequested : isFollowRequested

  if (effectiveIsFollowing) {
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

  if (effectiveIsFollowRequested) {
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
