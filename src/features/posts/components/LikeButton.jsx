import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { postsApi } from '../../../api/postsApi'
import { HeartIcon } from '../../../components/common/icons'
import { patchPostInCache } from '../postCacheUtils'

export default function LikeButton({ postId, isLiked, likeCount, feedQueryKey, postQueryKey }) {
  const queryClient = useQueryClient()
  const queryKeys = [feedQueryKey, postQueryKey].filter(Boolean)

  const mutation = useMutation({
    mutationFn: (nextLiked) => (nextLiked ? postsApi.likePost(postId) : postsApi.unlikePost(postId)),
    onMutate: async (nextLiked) => {
      if (queryKeys.length === 0) return

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
      className="flex items-center gap-1.5"
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
