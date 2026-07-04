import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import Skeleton from 'react-loading-skeleton'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
import EmptyState from '../../../components/common/EmptyState'
import { HeartIcon, ChatBubbleIcon, PlayIcon, ImageIcon } from '../../../components/common/icons'
import PostDetailModal from './PostDetailModal'

function GridImage({ post }) {
  const [isLoaded, setIsLoaded] = useState(false)
  return (
    <img
      src={post.media?.[0]?.mediaUrl}
      alt={post.caption || 'Post'}
      onLoad={() => setIsLoaded(true)}
      className={`h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}

export default function PostGrid({ queryKey, queryFn, emptyMessage = 'No posts yet', emptyIcon = ImageIcon }) {
  const [activePostId, setActivePostId] = useState(null)

  const gridQuery = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
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
    return <EmptyState icon={emptyIcon} title={emptyMessage} />
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => setActivePostId(post.id)}
            className="group relative aspect-square overflow-hidden bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50 dark:bg-gray-800"
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
                <PlayIcon className="absolute right-1.5 top-1.5 h-4 w-4 text-white drop-shadow" />
              </div>
            ) : (
              <GridImage post={post} />
            )}

            {(post.likeCount > 0 || post.commentCount > 0) && (
              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/0 opacity-0 transition-all duration-150 group-hover:bg-black/30 group-hover:opacity-100 group-focus-visible:bg-black/30 group-focus-visible:opacity-100">
                <span className="flex items-center gap-1 text-sm font-semibold text-white">
                  <HeartIcon filled className="h-4 w-4" />
                  {post.likeCount ?? 0}
                </span>
                <span className="flex items-center gap-1 text-sm font-semibold text-white">
                  <ChatBubbleIcon filled className="h-4 w-4" />
                  {post.commentCount ?? 0}
                </span>
              </div>
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
