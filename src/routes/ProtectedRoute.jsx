import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../app/store'

export default function ProtectedRoute() {
  const { user, accessToken } = useAuthStore()

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
