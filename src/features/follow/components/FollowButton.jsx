import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { followApi } from '../../../api/followApi'
import { useAuthStore } from '../../../app/store'
import Button from '../../../components/common/Button'
import ConfirmDialog from '../../../components/common/ConfirmDialog'

// Nudges a cached profile query's follower/following count without waiting on
// a refetch — the count is only ever visible on a profile page that's likely
// not the one that triggered the mutation (e.g. following someone from search
// results), so an invalidate alone wouldn't show up until that page reloads.
function bumpProfileCount(queryClient, targetQueryKey, field, delta) {
  if (!targetQueryKey) return
  queryClient.setQueryData(targetQueryKey, (old) =>
    old ? { ...old, data: { ...old.data, [field]: Math.max(0, (old.data[field] ?? 0) + delta) } } : old
  )
}

export default function FollowButton({ username, isFollowing, isFollowRequested, queryKey }) {
  const queryClient = useQueryClient()
  const currentUsername = useAuthStore((state) => state.user?.username)
  const ownProfileQueryKey = currentUsername ? ['profile', currentUsername] : null
  const [override, setOverride] = useState(null)
  const [isConfirmingUnfollow, setIsConfirmingUnfollow] = useState(false)

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
      if (status === 'accepted') {
        bumpProfileCount(queryClient, queryKey, 'followerCount', 1)
        bumpProfileCount(queryClient, ownProfileQueryKey, 'followingCount', 1)
      }
    },
    onError: () => toast.error('Failed to follow user'),
  })

  const unfollowMutation = useMutation({
    // wasFollowing distinguishes a real unfollow from cancelling a pending
    // follow request on a private account — only the former ever counted
    // toward followerCount/followingCount in the first place.
    mutationFn: (wasFollowing) => followApi.unfollow(username).then((res) => ({ res, wasFollowing })),
    onSuccess: ({ wasFollowing }) => {
      const next = { isFollowing: false, isFollowRequested: false }
      setOverride(next)
      if (queryKey) {
        queryClient.setQueryData(queryKey, (old) =>
          old ? { ...old, data: { ...old.data, ...next } } : old
        )
      }
      if (wasFollowing) {
        bumpProfileCount(queryClient, queryKey, 'followerCount', -1)
        bumpProfileCount(queryClient, ownProfileQueryKey, 'followingCount', -1)
      }
      setIsConfirmingUnfollow(false)
    },
    onError: () => {
      toast.error('Failed to unfollow user')
      setIsConfirmingUnfollow(false)
    },
  })

  const isPending = followMutation.isPending || unfollowMutation.isPending
  const effectiveIsFollowing = override ? override.isFollowing : isFollowing
  const effectiveIsFollowRequested = override ? override.isFollowRequested : isFollowRequested

  if (effectiveIsFollowing) {
    return (
      <>
        <Button
          type="button"
          variant="secondary"
          isLoading={unfollowMutation.isPending}
          disabled={isPending}
          onClick={() => setIsConfirmingUnfollow(true)}
        >
          Following
        </Button>
        <ConfirmDialog
          isOpen={isConfirmingUnfollow}
          onClose={() => setIsConfirmingUnfollow(false)}
          onConfirm={() => unfollowMutation.mutate(true)}
          isConfirming={unfollowMutation.isPending}
          title={`Unfollow @${username}?`}
          confirmLabel="Unfollow"
        />
      </>
    )
  }

  if (effectiveIsFollowRequested) {
    return (
      <Button
        type="button"
        variant="secondary"
        isLoading={unfollowMutation.isPending}
        disabled={isPending}
        onClick={() => unfollowMutation.mutate(false)}
      >
        Requested
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="primary"
      isLoading={followMutation.isPending}
      disabled={isPending}
      onClick={() => followMutation.mutate()}
    >
      Follow
    </Button>
  )
}
