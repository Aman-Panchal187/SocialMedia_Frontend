import { Link } from 'react-router-dom'
import { useUnreadCount } from '../hooks/useConversations'
import { useChatSocket } from '../hooks/useChatSocket'
import { ChatBubbleIcon } from '../../../components/common/icons'

export default function MessagesLink() {
  const unreadCountQuery = useUnreadCount()
  useChatSocket(null)

  const unreadCount = unreadCountQuery.data ?? 0
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    <Link
      to="/messages"
      aria-label="Messages"
      className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <ChatBubbleIcon />
      {unreadCount > 0 && (
        <span className="absolute right-0 top-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
          {badgeLabel}
        </span>
      )}
    </Link>
  )
}
