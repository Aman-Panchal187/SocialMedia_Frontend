import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { postsApi } from '../../../api/postsApi'

export default function LikeButton({ postId, isLiked, likeCount, feedQueryKey }) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (nextLiked) => (nextLiked ? postsApi.likePost(postId) : postsApi.unlikePost(postId)),
    onMutate: async (nextLiked) => {
      if (!feedQueryKey) return
      await queryClient.cancelQueries({ queryKey: feedQueryKey })
      const previous = queryClient.getQueryData(feedQueryKey)

      queryClient.setQueryData(feedQueryKey, (old) => updatePostInCache(old, postId, nextLiked))

      return { previous }
    },
    onError: (_err, _nextLiked, context) => {
      if (feedQueryKey && context?.previous) {
        queryClient.setQueryData(feedQueryKey, context.previous)
      }
      toast.error('Something went wrong, please try again')
    },
    onSettled: () => {
      if (feedQueryKey) {
        queryClient.invalidateQueries({ queryKey: feedQueryKey })
      }
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
      className="flex items-center gap-1 text-2xl"
    >
      <motion.span
        key={isLiked ? 'liked' : 'unliked'}
        initial={isLiked ? { scale: 1 } : false}
        animate={isLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
        className={isLiked ? 'text-danger' : 'text-current'}
      >
        {isLiked ? '❤️' : '🤍'}
      </motion.span>
      <span className="text-sm font-medium">{likeCount}</span>
    </button>
  )
}

function updatePostInCache(old, postId, nextLiked) {
  if (!old) return old
  if (!old.pages) {
    if (old.id !== postId) return old
    return {
      ...old,
      isLiked: nextLiked,
      likeCount: old.likeCount + (nextLiked ? 1 : -1),
    }
  }
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      items: page.items.map((post) =>
        post.id === postId
          ? { ...post, isLiked: nextLiked, likeCount: post.likeCount + (nextLiked ? 1 : -1) }
          : post
      ),
    })),
  }
}
