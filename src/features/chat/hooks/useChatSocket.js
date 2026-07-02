import { useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from '../../../context/SocketContext'
import { CONVERSATIONS_QUERY_KEY, UNREAD_COUNT_QUERY_KEY } from './useConversations'
import { messagesQueryKey } from './useMessages'

function patchConversationsList(old, { conversationId, message, bumpUnread, userId, isOnline }) {
  if (!old) return old
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        items: page.data.items.map((item) => {
          if (message && item.id === conversationId) {
            return {
              ...item,
              lastMessage: {
                contentType: message.contentType,
                content: message.content,
                createdAt: message.createdAt,
                senderId: message.senderId,
              },
              updatedAt: message.createdAt,
              unreadCount: bumpUnread ? (item.unreadCount ?? 0) + 1 : item.unreadCount,
            }
          }
          if (userId && item.otherUser?.id === userId) {
            return { ...item, otherUser: { ...item.otherUser, isOnline } }
          }
          return item
        }),
      },
    })),
  }
}

export function useChatSocket(activeConversationId) {
  const { socket } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    const handleMessage = (message) => {
      const { conversationId } = message
      const isActive = conversationId === activeConversationId

      if (isActive) {
        queryClient.setQueryData(messagesQueryKey(conversationId), (old) => {
          if (!old) return old
          const [firstPage, ...restPages] = old.pages
          return {
            ...old,
            pages: [
              { ...firstPage, data: { ...firstPage.data, items: [message, ...firstPage.data.items] } },
              ...restPages,
            ],
          }
        })
      }

      queryClient.setQueryData(CONVERSATIONS_QUERY_KEY, (old) =>
        patchConversationsList(old, { conversationId, message, bumpUnread: !isActive })
      )
    }

    const handleUnreadCount = (payload) => {
      queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, { data: payload })
    }

    const handleRead = ({ conversationId }) => {
      queryClient.setQueryData(messagesQueryKey(conversationId), (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: {
              ...page.data,
              items: page.data.items.map((item) => ({ ...item, status: 'read' })),
            },
          })),
        }
      })
    }

    const handlePresence = ({ userId, isOnline }) => {
      queryClient.setQueryData(CONVERSATIONS_QUERY_KEY, (old) =>
        patchConversationsList(old, { userId, isOnline })
      )
    }

    socket.on('chat:message', handleMessage)
    socket.on('chat:unread-count', handleUnreadCount)
    socket.on('chat:read', handleRead)
    socket.on('presence:update', handlePresence)

    return () => {
      socket.off('chat:message', handleMessage)
      socket.off('chat:unread-count', handleUnreadCount)
      socket.off('chat:read', handleRead)
      socket.off('presence:update', handlePresence)
    }
  }, [socket, queryClient, activeConversationId])

  const emitTyping = useCallback(
    (conversationId, isTyping) => {
      socket?.emit('chat:typing', { conversationId, isTyping })
    },
    [socket]
  )

  return { emitTyping }
}
