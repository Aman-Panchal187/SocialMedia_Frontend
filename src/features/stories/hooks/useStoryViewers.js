import { useInfiniteQuery } from '@tanstack/react-query'
import { storiesApi } from '../../../api/storiesApi'

export function useStoryViewers(storyId, { enabled = true } = {}) {
  return useInfiniteQuery({
    queryKey: ['stories', storyId, 'viewers'],
    queryFn: ({ pageParam }) => storiesApi.getStoryViewers(storyId, { cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: enabled && Boolean(storyId),
  })
}
