import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import ThemeToggle from '../../features/theme/ThemeToggle'
import NotificationBell from '../../features/notifications/components/NotificationBell'
import MessagesLink from '../../features/chat/components/MessagesLink'
import CallsLink from '../../features/calls/components/CallsLink'
import SearchLink from '../../features/search/components/SearchLink'
import { useAuthStore } from '../../app/store'

export default function Navbar({ onCreateClick }) {
  const user = useAuthStore((state) => state.user)

  return (
    <header className="sticky top-0 z-40 hidden h-16 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black sm:block">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold">
          SocialMedia
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <>
              <button
                type="button"
                onClick={onCreateClick}
                className="text-sm font-semibold text-brand hover:underline"
              >
                Create
              </button>
              <SearchLink />
              <NotificationBell />
              <MessagesLink />
              <CallsLink />
              <Link to={`/${user.username}`}>
                <Avatar src={user.avatarUrl} alt={user.username} size="sm" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
