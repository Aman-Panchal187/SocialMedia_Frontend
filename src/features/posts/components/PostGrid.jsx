import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import Skeleton from 'react-loading-skeleton'
import { postsApi } from '../../../api/postsApi'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
import PostDetailModal from './PostDetailModal'

export default function PostGrid({ username }) {
  const [activePostId, setActivePostId] = useState(null)

  const gridQuery = useInfiniteQuery({
    queryKey: ['userPosts', username],
    queryFn: ({ pageParam }) => postsApi.getUserPosts(username, { cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: Boolean(username),
  })

  const posts = gridQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  if (gridQuery.isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }).map((_, index) => (
          <Skeleton key={index} height={140} />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-500">No posts yet</p>
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => setActivePostId(post.id)}
            className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800"
          >
            {post.media?.[0]?.mediaType === 'video' ? (
              <div className="relative h-full w-full">
                <video
                  src={post.media?.[0]?.mediaUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                <span
                  className="absolute right-1 top-1 text-lg text-white drop-shadow"
                  aria-hidden="true"
                >
                  ▶
                </span>
              </div>
            ) : (
              <img
                src={post.media?.[0]?.mediaUrl}
                alt={post.caption || 'Post'}
                className="h-full w-full object-cover"
              />
            )}
          </button>
        ))}
      </div>
      <InfiniteScrollSentinel
        enabled={gridQuery.hasNextPage && !gridQuery.isFetchingNextPage}
        onIntersect={() => gridQuery.fetchNextPage()}
      />
      <PostDetailModal
        postId={activePostId}
        isOpen={Boolean(activePostId)}
        onClose={() => setActivePostId(null)}
      />
    </>
  )
}
