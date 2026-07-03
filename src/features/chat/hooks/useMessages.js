import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { chatApi } from '../../../api/chatApi'
import { useAuthStore } from '../../../app/store'
import { CONVERSATIONS_QUERY_KEY, UNREAD_COUNT_QUERY_KEY } from './useConversations'

export function messagesQueryKey(conversationId) {
  return ['chat', 'messages', conversationId]
}

export function useMessages(conversationId) {
  return useInfiniteQuery({
    queryKey: messagesQueryKey(conversationId),
    queryFn: ({ pageParam }) => chatApi.getMessages(conversationId, { cursor: pageParam, limit: 20 }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor ?? undefined,
    enabled: Boolean(conversationId),
    // Messages are real-time-critical: without this, the global 30s staleTime
    // can serve a cached page on mount and miss anything sent while the
    // conversation was closed (the live socket patch only fires while open).
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

function patchConversationPreview(old, conversationId, message) {
  if (!old) return old
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        items: page.data.items.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                lastMessage: {
                  contentType: message.contentType,
                  content: message.content,
                  createdAt: message.createdAt,
                  senderId: message.senderId,
                },
                updatedAt: message.createdAt,
              }
            : item
        ),
      },
    })),
  }
}

export function useSendMessage(conversationId) {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: ({ contentType, content, file }) =>
      contentType === 'text'
        ? chatApi.sendTextMessage(conversationId, content)
        : chatApi.sendAttachmentMessage(conversationId, { contentType, file }),
    onMutate: async ({ contentType, content, file }) => {
      await queryClient.cancelQueries({ queryKey: messagesQueryKey(conversationId) })

      const previousMessages = queryClient.getQueryData(messagesQueryKey(conversationId))
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const optimisticMessage = {
        id: tempId,
        conversationId,
        senderId: currentUser?.id,
        contentType,
        content: content ?? null,
        mediaUrl: file ? URL.createObjectURL(file) : null,
        status: 'sent',
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      }

      queryClient.setQueryData(messagesQueryKey(conversationId), (old) => {
        if (!old) return old
        const [firstPage, ...restPages] = old.pages
        return {
          ...old,
          pages: [
            { ...firstPage, data: { ...firstPage.data, items: [optimisticMessage, ...firstPage.data.items] } },
            ...restPages,
          ],
        }
      })

      queryClient.setQueryData(CONVERSATIONS_QUERY_KEY, (old) =>
        patchConversationPreview(old, conversationId, optimisticMessage)
      )

      return { previousMessages, tempId }
    },
    onSuccess: (response, _variables, context) => {
      const serverMessage = response.data
      queryClient.setQueryData(messagesQueryKey(conversationId), (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items: page.data.items.map((item) =>
                item.id === context.tempId ? serverMessage : item
              ),
            },
          })),
        }
      })

      queryClient.setQueryData(CONVERSATIONS_QUERY_KEY, (old) =>
        patchConversationPreview(old, conversationId, serverMessage)
      )
      // A conversation only appears in the list once it has a message (see
      // backend chat.repository.js:findConversationsForUser), so the very first
      // message in a brand-new conversation won't be matched by the patch above
      // — refetch so it shows up for both participants.
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY })
    },
    onError: (_err, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(messagesQueryKey(conversationId), context.previousMessages)
      }
      toast.error('Message failed to send')
    },
  })
}

export function useMarkRead(conversationId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => chatApi.markRead(conversationId),
    onSuccess: () => {
      let clearedCount = 0
      queryClient.setQueryData(CONVERSATIONS_QUERY_KEY, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items: page.data.items.map((item) => {
                if (item.id !== conversationId) return item
                clearedCount = item.unreadCount ?? 0
                return { ...item, unreadCount: 0 }
              }),
            },
          })),
        }
      })

      if (clearedCount > 0) {
        queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, (old) => {
          if (!old) return old
          return { ...old, data: { count: Math.max(0, (old.data?.count ?? 0) - clearedCount) } }
        })
      }
      // Reconcile with the server in case of drift (e.g. a message arrived
      // between the fetch and this mark-read call).
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    },
  })
}
