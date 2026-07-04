import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { postsApi } from '../../../api/postsApi'
import { BookmarkIcon } from '../../../components/common/icons'
import {
  patchPostInCache,
  removePostFromCache,
  findPostInCache,
  insertPostIntoCache,
  FEED_QUERY_KEY,
  SAVED_POSTS_QUERY_KEY,
} from '../postCacheUtils'

export default function SaveButton({ postId, isSaved, postQueryKey, className }) {
  const queryClient = useQueryClient()
  // The feed and saved-posts lists are always potentially cached regardless of
  // where this button is rendered — a save/unsave must reach both, not just
  // whatever specific list this instance happens to be inside of.
  const patchKeys = [FEED_QUERY_KEY, postQueryKey].filter(Boolean)
  const allKeys = [...patchKeys, SAVED_POSTS_QUERY_KEY]

  const mutation = useMutation({
    mutationFn: (nextSaved) => (nextSaved ? postsApi.savePost(postId) : postsApi.unsavePost(postId)),
    onMutate: async (nextSaved) => {
      await Promise.all(allKeys.map((key) => queryClient.cancelQueries({ queryKey: key })))
      const previousByKey = allKeys.map((key) => [key, queryClient.getQueryData(key)])

      for (const key of patchKeys) {
        queryClient.setQueryData(key, (old) =>
          patchPostInCache(old, postId, () => ({ isSaved: nextSaved }))
        )
      }

      if (!nextSaved) {
        // The saved-posts list only shows a post because it's saved —
        // unsaving must remove it from that list outright, not just flip its icon.
        queryClient.setQueryData(SAVED_POSTS_QUERY_KEY, (old) => removePostFromCache(old, postId))
      } else {
        // Saving should show up in the saved-posts list immediately too —
        // pull the full post from wherever it's already cached so it doesn't
        // wait on a refetch to appear there.
        let fullPost
        for (const key of patchKeys) {
          fullPost = findPostInCache(queryClient.getQueryData(key), postId)
          if (fullPost) break
        }
        if (fullPost) {
          queryClient.setQueryData(SAVED_POSTS_QUERY_KEY, (old) =>
            insertPostIntoCache(old, { ...fullPost, isSaved: true })
          )
        }
      }

      return { previousByKey }
    },
    onError: (_err, _nextSaved, context) => {
      context?.previousByKey?.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error('Failed to update saved post')
    },
    onSettled: () => {
      allKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
    },
  })

  return (
    <button
      type="button"
      onClick={() => mutation.mutate(!isSaved)}
      disabled={mutation.isPending}
      aria-label={isSaved ? 'Unsave' : 'Save'}
      className={clsx(
        'rounded-full text-gray-900 transition-transform duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:text-gray-100 motion-reduce:transition-none motion-reduce:active:scale-100',
        className
      )}
    >
      <motion.span
        key={isSaved ? 'saved' : 'unsaved'}
        initial={isSaved ? { scale: 1 } : false}
        animate={isSaved ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className="inline-block"
      >
        <BookmarkIcon filled={isSaved} />
      </motion.span>
    </button>
  )
}
