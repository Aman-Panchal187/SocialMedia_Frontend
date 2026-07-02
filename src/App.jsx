import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './app/queryClient'
import { ThemeProvider } from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'
import { useSocketConnection } from './hooks/useSocketConnection'
import AppRouter from './routes/AppRouter'
import Toaster from './components/common/Toaster'
import { CallProvider } from './features/calls/CallContext'
import IncomingCallModal from './features/calls/components/IncomingCallModal'
import OutgoingCallOverlay from './features/calls/components/OutgoingCallOverlay'
import ActiveCallOverlay from './features/calls/components/ActiveCallOverlay'

function SocketConnectionManager() {
  useSocketConnection()
  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SocketProvider>
          <SocketConnectionManager />
          <CallProvider>
            <AppRouter />
            <IncomingCallModal />
            <OutgoingCallOverlay />
            <ActiveCallOverlay />
            <Toaster />
          </CallProvider>
        </SocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
