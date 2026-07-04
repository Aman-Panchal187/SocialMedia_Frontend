import { useInfiniteQuery } from '@tanstack/react-query'
import { postsApi } from '../../../api/postsApi'
import SkeletonPostCard from '../../../components/common/SkeletonPostCard'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
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

  const posts = feedQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  if (posts.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-500">No posts yet. Follow people to see their posts here.</p>
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
