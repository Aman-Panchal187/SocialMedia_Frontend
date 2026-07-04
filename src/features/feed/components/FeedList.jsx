import { useInfiniteQuery } from '@tanstack/react-query'
import { postsApi } from '../../../api/postsApi'
import SkeletonPostCard from '../../../components/common/SkeletonPostCard'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
import EmptyState from '../../../components/common/EmptyState'
import Button from '../../../components/common/Button'
import { ImageIcon, RefreshIcon } from '../../../components/common/icons'
import { FEED_QUERY_KEY } from '../../posts/postCacheUtils'
import PostCard from './PostCard'

export default function FeedList() {
  const feedQuery = useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) => postsApi.getFeed({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
  })

  if (feedQuery.isLoading) {
    return (
      <div className="mx-auto max-w-lg py-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonPostCard key={index} />
        ))}
      </div>
    )
  }

  if (feedQuery.isError) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="Couldn't load your feed"
        description="Something went wrong. Check your connection and try again."
        action={
          <Button variant="secondary" onClick={() => feedQuery.refetch()}>
            <RefreshIcon className="h-4 w-4" />
            Try again
          </Button>
        }
      />
    )
  }

  const posts = feedQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="No posts yet"
        description="Follow people to see their photos and videos here."
      />
    )
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <InfiniteScrollSentinel
        enabled={feedQuery.hasNextPage && !feedQuery.isFetchingNextPage}
        onIntersect={() => feedQuery.fetchNextPage()}
      />
      {feedQuery.isFetchingNextPage && <SkeletonPostCard />}
    </div>
  )
}
