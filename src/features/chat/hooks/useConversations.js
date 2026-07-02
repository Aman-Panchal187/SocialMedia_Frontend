import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { chatApi } from '../../../api/chatApi'

export const CONVERSATIONS_QUERY_KEY = ['chat', 'conversations']
export const UNREAD_COUNT_QUERY_KEY = ['chat', 'unread-count']

export function useConversations() {
  return useInfiniteQuery({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: ({ pageParam }) => chatApi.getConversations({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => chatApi.getUnreadCount(),
    select: (data) => data.data.count,
  })
}
