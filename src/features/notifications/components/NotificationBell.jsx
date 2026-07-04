import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useUnreadCount } from '../hooks/useNotifications'
import { useNotificationSocket } from '../hooks/useNotificationSocket'
import { BellIcon } from '../../../components/common/icons'
import NotificationPanel from './NotificationPanel'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const unreadCountQuery = useUnreadCount()
  useNotificationSocket()

  const unreadCount = unreadCountQuery.data ?? 0
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100/70 text-gray-700 transition-[background-color,transform] duration-150 hover:bg-gray-200 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:bg-gray-700 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-4 min-w-[1rem] animate-scale-in items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white motion-reduce:animate-none">
            {badgeLabel}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute right-0 top-full z-50 mt-2">
            <NotificationPanel />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
