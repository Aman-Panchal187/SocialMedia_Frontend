import { useInfiniteQuery } from '@tanstack/react-query'
import Skeleton from 'react-loading-skeleton'
import { postsApi } from '../../../api/postsApi'
import CommentItem from './CommentItem'

export default function CommentSection({ postId }) {
  const commentsQuery = useInfiniteQuery({
    queryKey: ['comments', postId],
    queryFn: ({ pageParam }) => postsApi.getComments(postId, { cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
  })

  const comments = commentsQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  if (commentsQuery.isLoading) {
    return (
      <div className="space-y-3">
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
    )
  }

  if (comments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        No comments yet — be the first to comment.
      </p>
    )
  }

  return (
    <div>
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
  )
}
