import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Avatar from '../common/Avatar'
import { useAuth } from '../../features/auth/hooks/useAuth'

export default function NavbarMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const { logout } = useAuth()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!isOpen) return undefined
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    function handleEscape(event) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Account menu"
        aria-expanded={isOpen}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <Avatar src={user.avatarUrl} alt={user.username} size="sm" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-popover dark:border-gray-800 dark:bg-gray-900"
          >
            <Link
              to={`/${user.username}`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Profile
            </Link>
            <Link
              to="/edit-profile"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Edit profile
            </Link>
            <div className="my-1 border-t border-gray-200 dark:border-gray-800" />
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              className="block w-full px-4 py-2 text-left text-sm text-danger transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
