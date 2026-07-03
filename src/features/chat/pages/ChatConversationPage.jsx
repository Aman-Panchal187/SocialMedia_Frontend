import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { formatDistanceToNowStrict, isSameDay, isToday, isYesterday, format } from 'date-fns'
import Skeleton from 'react-loading-skeleton'
import Avatar from '../../../components/common/Avatar'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
import { ArrowLeftIcon } from '../../../components/common/icons'
import { useSocket } from '../../../context/SocketContext'
import { useAuthStore } from '../../../app/store'
import { chatApi } from '../../../api/chatApi'
import { extractErrorMessage } from '../../../api/axiosInstance'
import { useMarkRead, useMessages } from '../hooks/useMessages'
import { useChatSocket } from '../hooks/useChatSocket'
import OnlineStatusDot from '../components/OnlineStatusDot'
import CallButton from '../../calls/components/CallButton'
import MessageBubble from '../components/MessageBubble'
import MessageComposer from '../components/MessageComposer'
import TypingIndicator from '../components/TypingIndicator'

function formatDaySeparator(dateStr) {
  const date = new Date(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

export default function ChatConversationPage() {
  const { username } = useParams()
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.user)
  const { socket } = useSocket()
  const [isTypingRemote, setIsTypingRemote] = useState(false)

  // Starting a conversation just resolves/creates the underlying record for
  // sending messages — it deliberately does NOT get added to either user's
  // conversation list until a message actually exists (see useSendMessage).
  const startConversationMutation = useMutation({
    mutationFn: () => chatApi.startConversation(username),
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

  const backButton = (
    <button
      type="button"
      onClick={() => navigate('/messages')}
      aria-label="Back to messages"
      className="shrink-0 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
    >
      <ArrowLeftIcon />
    </button>
  )

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
      <div className="flex items-center gap-2 border-b border-gray-200 px-2 py-3 dark:border-gray-800">
        {backButton}
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
        <CallButton user={otherUser} />
      </div>

      <div className="flex flex-1 flex-col-reverse gap-2 overflow-y-auto bg-gray-50 px-3 py-3 dark:bg-black">
        {messagesNewestFirst.map((message, index) => {
          const olderMessage = messagesNewestFirst[index + 1]
          const showDaySeparator = !olderMessage || !isSameDay(new Date(message.createdAt), new Date(olderMessage.createdAt))

          return (
            <div key={message.id} className="contents">
              <MessageBubble message={message} isOwn={message.senderId === currentUser?.id} />
              {showDaySeparator && (
                <div className="flex justify-center py-1">
                  <span className="rounded-full bg-gray-200 px-3 py-1 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {formatDaySeparator(message.createdAt)}
                  </span>
                </div>
              )}
            </div>
          )
        })}
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
