import Skeleton from 'react-loading-skeleton'
import InfiniteScrollSentinel from '../../../components/common/InfiniteScrollSentinel'
import EmptyState from '../../../components/common/EmptyState'
import { ChatBubbleIcon } from '../../../components/common/icons'
import { useConversations } from '../hooks/useConversations'
import ConversationListItem from '../components/ConversationListItem'

export default function ChatListPage() {
  const conversationsQuery = useConversations()

  const conversations = conversationsQuery.data?.pages.flatMap((page) => page.data.items) ?? []

  return (
    <div className="mx-auto max-w-lg animate-fade-in px-2">
      <h1 className="px-2 py-3 text-lg font-semibold">Messages</h1>

      {conversationsQuery.isLoading && (
        <div className="space-y-3 p-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton circle width={40} height={40} />
              <div className="flex-1">
                <Skeleton width="60%" height={12} />
                <Skeleton width="40%" height={10} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!conversationsQuery.isLoading && conversations.length === 0 && (
        <EmptyState
          icon={ChatBubbleIcon}
          title="No conversations yet"
          description="Visit a mutual follower's profile to start chatting."
        />
      )}

      <div className="flex flex-col gap-1">
        {conversations.map((conversation) => (
          <ConversationListItem key={conversation.id} conversation={conversation} />
        ))}
      </div>

      <InfiniteScrollSentinel
        enabled={conversationsQuery.hasNextPage && !conversationsQuery.isFetchingNextPage}
        onIntersect={() => conversationsQuery.fetchNextPage()}
      />
    </div>
  )
}
