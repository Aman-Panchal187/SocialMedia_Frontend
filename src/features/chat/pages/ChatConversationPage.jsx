import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNowStrict } from 'date-fns'
import Skeleton from 'react-loading-skeleton'
import Avatar from '../../../components/common/Avatar'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
import { useSocket } from '../../../context/SocketContext'
import { useAuthStore } from '../../../app/store'
import { chatApi } from '../../../api/chatApi'
import { extractErrorMessage } from '../../../api/axiosInstance'
import { CONVERSATIONS_QUERY_KEY } from '../hooks/useConversations'
import { useMarkRead, useMessages } from '../hooks/useMessages'
import { useChatSocket } from '../hooks/useChatSocket'
import OnlineStatusDot from '../components/OnlineStatusDot'
import CallButton from '../../calls/components/CallButton'
import MessageBubble from '../components/MessageBubble'
import MessageComposer from '../components/MessageComposer'
import TypingIndicator from '../components/TypingIndicator'

export default function ChatConversationPage() {
  const { username } = useParams()
  const currentUser = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const { socket } = useSocket()
  const [isTypingRemote, setIsTypingRemote] = useState(false)

  const startConversationMutation = useMutation({
    mutationFn: () => chatApi.startConversation(username),
    onSuccess: (response) => {
      queryClient.setQueryData(CONVERSATIONS_QUERY_KEY, (old) => {
        if (!old) return old
        const conversation = response.data
        const alreadyPresent = old.pages.some((page) =>
          page.data.items.some((item) => item.id === conversation.id)
        )
        if (alreadyPresent) return old
        const [firstPage, ...restPages] = old.pages
        return {
          ...old,
          pages: [
            { ...firstPage, data: { ...firstPage.data, items: [conversation, ...firstPage.data.items] } },
            ...restPages,
          ],
        }
      })
    },
  })
  const { mutate: startConversation } = startConversationMutation

  useEffect(() => {
    if (username) startConversation()
  }, [username, startConversation])

  const conversation = startConversationMutation.data?.data
  const conversationId = conversation?.id

  const { emitTyping } = useChatSocket(conversationId)
  const messagesQuery = useMessages(conversationId)
  const markReadMutation = useMarkRead(conversationId)

  const messagesNewestFirst = useMemo(() => {
    const pages = messagesQuery.data?.pages ?? []
    return pages.flatMap((page) => page.data.items)
  }, [messagesQuery.data])

  useEffect(() => {
    if (conversationId) markReadMutation.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, messagesNewestFirst.length])

  useEffect(() => {
    if (!socket || !conversationId) return

    const handleTyping = ({ conversationId: eventConversationId, isTyping }) => {
      if (eventConversationId !== conversationId) return
      setIsTypingRemote(isTyping)
    }

    socket.on('chat:typing', handleTyping)
    return () => socket.off('chat:typing', handleTyping)
  }, [socket, conversationId])

  const handleTyping = (isTyping) => {
    if (conversationId) emitTyping(conversationId, isTyping)
  }

  if (startConversationMutation.isPending || startConversationMutation.isIdle) {
    return (
      <div className="mx-auto max-w-lg space-y-3 px-4 py-6">
        <Skeleton height={40} />
        <Skeleton height={300} />
      </div>
    )
  }

  if (startConversationMutation.isError) {
    const status = startConversationMutation.error?.response?.status
    if (status === 403) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-sm text-gray-500">
            You can only message {username} once you follow each other.
          </p>
          <Link to={`/${username}`} className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
            View profile
          </Link>
        </div>
      )
    }
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-sm text-gray-500">
          {extractErrorMessage(startConversationMutation.error)}
        </p>
      </div>
    )
  }

  const { otherUser } = conversation

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-lg flex-col">
      <div className="flex items-center gap-3 border-b border-gray-200 px-3 py-3 dark:border-gray-800">
        <div className="relative shrink-0">
          <Avatar src={otherUser.avatarUrl} alt={otherUser.username} size="sm" />
          <OnlineStatusDot isOnline={otherUser.isOnline} className="absolute bottom-0 right-0" />
        </div>
        <div className="min-w-0 flex-1">
          <Link to={`/${otherUser.username}`} className="block truncate text-sm font-semibold hover:underline">
            {otherUser.username}
          </Link>
          <p className="text-xs text-gray-400">
            {otherUser.isOnline
              ? 'Online'
              : otherUser.lastSeenAt
                ? `Last seen ${formatDistanceToNowStrict(new Date(otherUser.lastSeenAt))} ago`
                : 'Offline'}
          </p>
        </div>
        <CallButton username={otherUser.username} />
      </div>

      <div className="flex flex-1 flex-col-reverse gap-2 overflow-y-auto px-3 py-3">
        {messagesNewestFirst.map((message) => (
          <MessageBubble key={message.id} message={message} isOwn={message.senderId === currentUser?.id} />
        ))}
        {messagesQuery.isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} height={40} width="70%" />
            ))}
          </div>
        )}
        {!messagesQuery.isLoading && messagesNewestFirst.length === 0 && (
          <p className="py-16 text-center text-sm text-gray-500">
            Say hi 👋 — start the conversation.
          </p>
        )}
        <InfiniteScrollSentinel
          enabled={messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage}
          onIntersect={() => messagesQuery.fetchNextPage()}
        />
      </div>

      <TypingIndicator isTyping={isTypingRemote} />
      <MessageComposer conversationId={conversationId} onTyping={handleTyping} />
    </div>
  )
}
