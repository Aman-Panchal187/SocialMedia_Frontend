import { useQuery, useQueryClient } from '@tanstack/react-query'
import { storiesApi } from '../../../api/storiesApi'
import { sortRings } from '../ringSort'

export const STORY_FEED_QUERY_KEY = ['stories', 'feed']

export function useStoryFeed() {
  return useQuery({
    queryKey: STORY_FEED_QUERY_KEY,
    queryFn: () => storiesApi.getStoryFeed(),
    staleTime: 30 * 1000,
  })
}

export function useMarkStoryViewedInCache() {
  const queryClient = useQueryClient()

  return (storyId) => {
    queryClient.setQueryData(STORY_FEED_QUERY_KEY, (old) => {
      if (!old) return old
      const items = old.data.items.map((ring) => {
        const storyIndex = ring.stories.findIndex((story) => story.id === storyId)
        if (storyIndex === -1) return ring
        const stories = ring.stories.map((story, index) =>
          index === storyIndex ? { ...story, viewed: true } : story
        )
        return { ...ring, stories, hasUnviewed: stories.some((story) => !story.viewed) }
      })
      return { ...old, data: { ...old.data, items: sortRings(items) } }
    })
  }
}
