import { useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { postsApi } from '../../../api/postsApi'
import Avatar from '../../../components/common/Avatar'

export default function CommentItem({ comment, postId }) {
  const [repliesOpen, setRepliesOpen] = useState(false)
  const queryClient = useQueryClient()

  const likeMutation = useMutation({
    mutationFn: (nextLiked) =>
      nextLiked ? postsApi.likeComment(comment.id) : postsApi.unlikeComment(comment.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
    onError: () => toast.error('Failed to update like'),
  })

  const repliesQuery = useInfiniteQuery({
    queryKey: ['replies', comment.id],
    queryFn: ({ pageParam }) => postsApi.getReplies(comment.id, { cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: repliesOpen,
    select: (data) => data.pages.flatMap((page) => page.data.items),
  })

  return (
    <div className="flex gap-3 py-2">
      <Avatar src={comment.author?.avatarUrl} alt={comment.author?.username} size="xs" />
      <div className="flex-1">
        <p className="text-sm">
          <span className="mr-1 font-semibold">{comment.author?.username}</span>
          {comment.content}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatDistanceToNowStrict(new Date(comment.createdAt))} ago</span>
          <button
            type="button"
            onClick={() => likeMutation.mutate(!comment.isLiked)}
            className={comment.isLiked ? 'font-semibold text-danger' : ''}
          >
            {comment.likeCount > 0 ? `${comment.likeCount} like${comment.likeCount === 1 ? '' : 's'}` : 'Like'}
          </button>
          {comment.replyCount > 0 && !repliesOpen && (
            <button type="button" onClick={() => setRepliesOpen(true)} className="font-semibold">
              View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {repliesOpen && (
          <div className="mt-2 border-l border-gray-200 pl-3 dark:border-gray-800">
            {repliesQuery.isLoading && <p className="text-xs text-gray-500">Loading replies…</p>}
            {(repliesQuery.data || []).map((reply) => (
              <div key={reply.id} className="flex gap-2 py-1">
                <Avatar src={reply.author?.avatarUrl} alt={reply.author?.username} size="xs" />
                <p className="text-sm">
                  <span className="mr-1 font-semibold">{reply.author?.username}</span>
                  {reply.content}
                </p>
              </div>
            ))}
            {repliesQuery.hasNextPage && (
              <button
                type="button"
                onClick={() => repliesQuery.fetchNextPage()}
                className="text-xs font-semibold text-gray-500"
              >
                Load more replies
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
