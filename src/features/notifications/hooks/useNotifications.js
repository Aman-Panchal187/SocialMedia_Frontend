import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../../../api/notificationsApi'

export const NOTIFICATIONS_QUERY_KEY = ['notifications']
export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count']

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: ({ pageParam }) => notificationsApi.getNotifications({ cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => notificationsApi.getUnreadCount(),
    select: (data) => data.data.count,
  })
}

function markItemRead(old, id) {
  if (!old) return old
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        items: page.data.items.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
      },
    })),
  }
}

function markAllItemsRead(old) {
  if (!old) return old
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        items: page.data.items.map((item) => ({ ...item, isRead: true })),
      },
    })),
  }
}

export function useMarkRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })

      const previousList = queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY)
      const previousCount = queryClient.getQueryData(UNREAD_COUNT_QUERY_KEY)

      const wasUnread = previousList?.pages
        ?.flatMap((page) => page.data.items)
        .find((item) => item.id === id && !item.isRead)

      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (old) => markItemRead(old, id))
      if (wasUnread) {
        queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, (old) =>
          old ? { ...old, data: { count: Math.max(0, old.data.count - 1) } } : old
        )
      }

      return { previousList, previousCount }
    },
    onError: (_err, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previousList)
      }
      if (context?.previousCount) {
        queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, context.previousCount)
      }
    },
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })

      const previousList = queryClient.getQueryData(NOTIFICATIONS_QUERY_KEY)
      const previousCount = queryClient.getQueryData(UNREAD_COUNT_QUERY_KEY)

      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, markAllItemsRead)
      queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, (old) =>
        old ? { ...old, data: { count: 0 } } : old
      )

      return { previousList, previousCount }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previousList)
      }
      if (context?.previousCount) {
        queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, context.previousCount)
      }
    },
  })
}
