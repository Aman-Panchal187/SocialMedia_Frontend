import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import { useAuthStore } from '../../app/store'

export default function MobileTabBar({ onCreateClick }) {
  const user = useAuthStore((state) => state.user)

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 z-40 flex h-14 w-full items-center justify-around border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-black sm:hidden">
      <Link to="/" aria-label="Feed" className="text-2xl">
        🏠
      </Link>
      <button type="button" onClick={onCreateClick} aria-label="Create post" className="text-2xl">
        ➕
      </button>
      <Link to={`/${user.username}`} aria-label="Profile">
        <Avatar src={user.avatarUrl} alt={user.username} size="xs" />
      </Link>
    </nav>
  )
}
