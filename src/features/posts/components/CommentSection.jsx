import { useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Skeleton from 'react-loading-skeleton'
import { postsApi } from '../../../api/postsApi'
import CommentItem from './CommentItem'
import Button from '../../../components/common/Button'

export default function CommentSection({ postId }) {
  const [content, setContent] = useState('')
  const queryClient = useQueryClient()

  const commentsQuery = useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) => postsApi.getComments(postId, { cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
  })

  const addCommentMutation = useMutation({
    mutationFn: (payload) => postsApi.addComment(postId, payload),
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
    },
    onError: () => toast.error('Failed to post comment'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    addCommentMutation.mutate({ content: content.trim() })
  }

  const comments = commentsQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  return (
    <div>
      <div className="max-h-72 overflow-y-auto">
        {commentsQuery.isLoading && (
          <div className="space-y-3 p-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton circle width={28} height={28} />
                <div className="flex-1">
                  <Skeleton width="70%" height={10} />
                  <Skeleton width="40%" height={10} />
                </div>
              </div>
            ))}
          </div>
        )}
        {!commentsQuery.isLoading && comments.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-500">
            No comments yet — be the first to comment.
          </p>
        )}
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
        {commentsQuery.hasNextPage && (
          <button
            type="button"
            onClick={() => commentsQuery.fetchNextPage()}
            className="text-sm font-semibold text-gray-500"
          >
            Load more comments
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
        <label htmlFor={`comment-input-${postId}`} className="sr-only">
          Add a comment
        </label>
        <input
          id={`comment-input-${postId}`}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 bg-transparent text-sm outline-none"
        />
        <Button
          type="submit"
          variant="ghost"
          disabled={!content.trim() || addCommentMutation.isPending}
        >
          Post
        </Button>
      </form>
    </div>
  )
}
