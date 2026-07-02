import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useUnreadCount } from '../hooks/useNotifications'
import { useNotificationSocket } from '../hooks/useNotificationSocket'
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
        className="relative rounded-full p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {badgeLabel}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 z-50">
            <NotificationPanel />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
