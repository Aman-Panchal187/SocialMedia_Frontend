import { createContext, useContext, useRef, useState } from 'react'
import { io } from 'socket.io-client'

const SOCKET_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1').replace(
  /\/api\/v1\/?$/,
  ''
)

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const socketRef = useRef(null)
  const [socket, setSocket] = useState(null)

  const value = {
    socket,
    connect: (accessToken) => {
      if (socketRef.current) return
      const instance = io(SOCKET_ORIGIN, {
        auth: { token: accessToken },
        autoConnect: true,
      })
      socketRef.current = instance
      setSocket(instance)
    },
    disconnect: () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setSocket(null)
    },
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider')
  return ctx
}
