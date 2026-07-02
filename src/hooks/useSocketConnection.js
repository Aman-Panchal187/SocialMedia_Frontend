import { useEffect } from 'react'
import { useAuthStore } from '../app/store'
import { useSocket } from '../context/SocketContext'

export function useSocketConnection() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const { connect, disconnect } = useSocket()

  const isAuthenticated = Boolean(accessToken && user)

  useEffect(() => {
    if (isAuthenticated) {
      connect(accessToken)
    } else {
      disconnect()
    }
  }, [isAuthenticated])
}
