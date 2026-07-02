import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar'
import { useAuth } from '../../features/auth/hooks/useAuth'

export default function NavbarMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const { logout } = useAuth()

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Account menu"
        aria-expanded={isOpen}
      >
        <Avatar src={user.avatarUrl} alt={user.username} size="sm" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <Link
            to={`/${user.username}`}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Profile
          </Link>
          <Link
            to="/edit-profile"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Edit profile
          </Link>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              logout()
            }}
            className="block w-full px-4 py-2 text-left text-sm text-danger hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
