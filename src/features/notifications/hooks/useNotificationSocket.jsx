import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useSocket } from '../../../context/SocketContext'
import { NOTIFICATIONS_QUERY_KEY, UNREAD_COUNT_QUERY_KEY } from './useNotifications'
import NotificationToast from '../components/NotificationToast'

export function useNotificationSocket() {
  const { socket } = useSocket()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!socket) return

    const handleNew = (notification) => {
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (old) => {
        if (!old) return old
        const [firstPage, ...restPages] = old.pages
        return {
          ...old,
          pages: [
            { ...firstPage, data: { ...firstPage.data, items: [notification, ...firstPage.data.items] } },
            ...restPages,
          ],
        }
      })

      toast.custom((t) => <NotificationToast notification={notification} visible={t.visible} />)
    }

    const handleUnreadCount = (payload) => {
      queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, { data: payload })
    }

    socket.on('notification:new', handleNew)
    socket.on('notification:unread-count', handleUnreadCount)

    return () => {
      socket.off('notification:new', handleNew)
      socket.off('notification:unread-count', handleUnreadCount)
    }
  }, [socket, queryClient])
}
