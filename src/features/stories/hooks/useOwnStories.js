import { useQuery } from '@tanstack/react-query'
import { storiesApi } from '../../../api/storiesApi'

export function ownStoriesQueryKey(username) {
  return ['stories', 'own', username]
}

export function useOwnStories(username) {
  return useQuery({
    queryKey: ownStoriesQueryKey(username),
    queryFn: () => storiesApi.getUserStories(username),
    enabled: Boolean(username),
    staleTime: 30 * 1000,
  })
}
