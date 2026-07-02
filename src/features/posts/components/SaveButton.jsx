import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { postsApi } from '../../../api/postsApi'

export default function SaveButton({ postId, isSaved, feedQueryKey }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (nextSaved) => (nextSaved ? postsApi.savePost(postId) : postsApi.unsavePost(postId)),
    onMutate: async (nextSaved) => {
      if (!feedQueryKey) return
      await queryClient.cancelQueries({ queryKey: feedQueryKey })
      const previous = queryClient.getQueryData(feedQueryKey)

      queryClient.setQueryData(feedQueryKey, (old) => updateSavedInCache(old, postId, nextSaved))

      return { previous }
    },
    onError: (_err, _nextSaved, context) => {
      if (feedQueryKey && context?.previous) {
        queryClient.setQueryData(feedQueryKey, context.previous)
      }
      toast.error('Failed to update saved post')
    },
    onSettled: () => {
      if (feedQueryKey) {
        queryClient.invalidateQueries({ queryKey: feedQueryKey })
      }
    },
  })

  return (
    <button
      type="button"
      onClick={() => mutation.mutate(!isSaved)}
      disabled={mutation.isPending}
      aria-label={isSaved ? 'Unsave' : 'Save'}
      className="text-2xl"
    >
      {isSaved ? '🔖' : '📑'}
    </button>
  )
}

function updateSavedInCache(old, postId, nextSaved) {
  if (!old) return old
  if (!old.pages) {
    if (old.id !== postId) return old
    return { ...old, isSaved: nextSaved }
  }
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      items: page.items.map((post) => (post.id === postId ? { ...post, isSaved: nextSaved } : post)),
    })),
  }
}
