import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { postsApi } from '../../../api/postsApi'
import { BookmarkIcon } from '../../../components/common/icons'
import { patchPostInCache } from '../postCacheUtils'

export default function SaveButton({ postId, isSaved, feedQueryKey, postQueryKey, className }) {
  const queryClient = useQueryClient()
  const queryKeys = [feedQueryKey, postQueryKey].filter(Boolean)

  const mutation = useMutation({
    mutationFn: (nextSaved) => (nextSaved ? postsApi.savePost(postId) : postsApi.unsavePost(postId)),
    onMutate: async (nextSaved) => {
      if (queryKeys.length === 0) return

      await Promise.all(queryKeys.map((key) => queryClient.cancelQueries({ queryKey: key })))
      const previousByKey = queryKeys.map((key) => [key, queryClient.getQueryData(key)])

      for (const key of queryKeys) {
        queryClient.setQueryData(key, (old) =>
          patchPostInCache(old, postId, () => ({ isSaved: nextSaved }))
        )
      }

      return { previousByKey }
    },
    onError: (_err, _nextSaved, context) => {
      context?.previousByKey?.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error('Failed to update saved post')
    },
    onSettled: () => {
      queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
    },
  })

  return (
    <button
      type="button"
      onClick={() => mutation.mutate(!isSaved)}
      disabled={mutation.isPending}
      aria-label={isSaved ? 'Unsave' : 'Save'}
      className={clsx('text-gray-900 dark:text-gray-100', className)}
    >
      <BookmarkIcon filled={isSaved} />
    </button>
  )
}
