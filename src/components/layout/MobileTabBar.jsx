import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import { ChatBubbleIcon } from '../common/icons'
import { useAuthStore } from '../../app/store'
import { useUnreadCount } from '../../features/chat/hooks/useConversations'

export default function MobileTabBar({ onCreateClick }) {
  const user = useAuthStore((state) => state.user)
  const unreadCount = useUnreadCount().data ?? 0

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 z-40 flex h-14 w-full items-center justify-around border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-black sm:hidden">
      <Link to="/" aria-label="Feed" className="text-2xl">
        🏠
      </Link>
      <button type="button" onClick={onCreateClick} aria-label="Create post" className="text-2xl">
        ➕
      </button>
      <Link to="/messages" aria-label="Messages" className="relative">
        <ChatBubbleIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
      <Link to={`/${user.username}`} aria-label="Profile">
        <Avatar src={user.avatarUrl} alt={user.username} size="xs" />
      </Link>
    </nav>
  )
}
