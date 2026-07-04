import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { postsApi } from '../../../api/postsApi'
import { HeartIcon } from '../../../components/common/icons'
import { patchPostInCache, FEED_QUERY_KEY, SAVED_POSTS_QUERY_KEY } from '../postCacheUtils'

export default function LikeButton({ postId, isLiked, likeCount, postQueryKey }) {
  const queryClient = useQueryClient()
  // The feed and saved-posts lists are always potentially cached regardless of
  // where this button is rendered — a like/unlike must reach both, not just
  // whatever specific list this instance happens to be inside of.
  const queryKeys = [FEED_QUERY_KEY, SAVED_POSTS_QUERY_KEY, postQueryKey].filter(Boolean)

  const mutation = useMutation({
    mutationFn: (nextLiked) => (nextLiked ? postsApi.likePost(postId) : postsApi.unlikePost(postId)),
    onMutate: async (nextLiked) => {
      await Promise.all(queryKeys.map((key) => queryClient.cancelQueries({ queryKey: key })))
      const previousByKey = queryKeys.map((key) => [key, queryClient.getQueryData(key)])

      const patch = (post) => ({ isLiked: nextLiked, likeCount: post.likeCount + (nextLiked ? 1 : -1) })
      for (const key of queryKeys) {
        queryClient.setQueryData(key, (old) => patchPostInCache(old, postId, patch))
      }

      return { previousByKey }
    },
    onError: (_err, _nextLiked, context) => {
      context?.previousByKey?.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error('Something went wrong, please try again')
    },
    onSettled: () => {
      queryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
    },
  })

  const handleClick = () => {
    mutation.mutate(!isLiked)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={mutation.isPending}
      aria-label={isLiked ? 'Unlike' : 'Like'}
      className="flex items-center gap-1.5 rounded-full transition-transform duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      <motion.span
        key={isLiked ? 'liked' : 'unliked'}
        initial={isLiked ? { scale: 1 } : false}
        animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className={isLiked ? 'text-danger' : 'text-gray-900 dark:text-gray-100'}
      >
        <HeartIcon filled={isLiked} />
      </motion.span>
      <span className="text-sm font-medium">{likeCount}</span>
    </button>
  )
}
