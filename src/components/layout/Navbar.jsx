import { Link } from 'react-router-dom'
import ThemeToggle from '../../features/theme/ThemeToggle'
import NotificationBell from '../../features/notifications/components/NotificationBell'
import MessagesLink from '../../features/chat/components/MessagesLink'
import CallsLink from '../../features/calls/components/CallsLink'
import SearchLink from '../../features/search/components/SearchLink'
import NavbarMenu from './NavbarMenu'
import { PlusSquareIcon } from '../common/icons'
import Logo from '../common/Logo'
import { useAuthStore } from '../../app/store'

export default function Navbar({ onCreateClick }) {
  const user = useAuthStore((state) => state.user)

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-black/70">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        {/* Always rendered in the same top-left spot on every screen size —
            MobileTabBar covers primary navigation on small screens, but the
            brand mark itself shouldn't disappear there. */}
        <Link to="/" className="transition-transform duration-150 active:scale-95">
          <Logo />
        </Link>

        {/* Mobile only has room for the theme toggle here (everything else
            below is covered by MobileTabBar's bottom icons); the full icon
            cluster is desktop-only. */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <ThemeToggle />
          {user && (
            <>
              <button
                type="button"
                onClick={onCreateClick}
                aria-label="Create post"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100/70 text-gray-700 transition-[background-color,transform] duration-150 hover:bg-gray-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:bg-gray-700 motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                <PlusSquareIcon />
              </button>
              <SearchLink />
              <NotificationBell />
              <MessagesLink />
              <CallsLink />
              <NavbarMenu user={user} />
            </>
          )}
        </div>
      </div>
    </header>
  )
}
