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
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100/70 text-gray-700 transition-[background-color,transform] duration-150 hover:bg-gray-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:bg-gray-700 motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      <ChatBubbleIcon />
      {unreadCount > 0 && (
        <span className="absolute right-0 top-0 flex h-4 min-w-[1rem] animate-scale-in items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white motion-reduce:animate-none">
          {badgeLabel}
        </span>
      )}
    </Link>
  )
}
