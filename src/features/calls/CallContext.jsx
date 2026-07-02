import { createContext, useContext } from 'react'
import { useCallSocket } from './hooks/useCallSocket'

const CallContext = createContext(null)

export function CallProvider({ children }) {
  const call = useCallSocket()
  return <CallContext.Provider value={call}>{children}</CallContext.Provider>
}

export function useCall() {
  const ctx = useContext(CallContext)
  if (!ctx) throw new Error('useCall must be used within a CallProvider')
  return ctx
}
