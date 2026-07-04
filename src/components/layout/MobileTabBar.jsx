import { Link, useLocation } from 'react-router-dom'
import Avatar from '../common/Avatar'
import { ChatBubbleIcon, HomeIcon, PlusSquareIcon } from '../common/icons'
import { useAuthStore } from '../../app/store'
import { useUnreadCount } from '../../features/chat/hooks/useConversations'

export default function MobileTabBar({ onCreateClick }) {
  const user = useAuthStore((state) => state.user)
  const unreadCount = useUnreadCount().data ?? 0
  const location = useLocation()
  const isFeedActive = location.pathname === '/'

  if (!user) return null

  const isMessagesActive = location.pathname.startsWith('/messages')
  const isProfileActive = location.pathname === `/${user.username}`
  const tabClass =
    'rounded-full p-1.5 transition-transform duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 motion-reduce:transition-none motion-reduce:active:scale-100'

  return (
    <nav
      className="fixed bottom-0 left-0 z-40 flex h-14 w-full items-center justify-around border-t border-gray-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md dark:border-gray-800 dark:bg-black/80 sm:hidden"
    >
      <Link to="/" aria-label="Feed" className={tabClass}>
        <HomeIcon filled={isFeedActive} />
      </Link>
      <button type="button" onClick={onCreateClick} aria-label="Create post" className={tabClass}>
        <PlusSquareIcon />
      </button>
      <Link to="/messages" aria-label="Messages" className={`relative ${tabClass}`}>
        <ChatBubbleIcon className="h-6 w-6" filled={isMessagesActive} />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-4 min-w-[1rem] animate-scale-in items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white motion-reduce:animate-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
      <Link
        to={`/${user.username}`}
        aria-label="Profile"
        className={`${tabClass} ${isProfileActive ? 'ring-2 ring-brand' : ''}`}
      >
        <Avatar src={user.avatarUrl} alt={user.username} size="xs" />
      </Link>
    </nav>
  )
}
