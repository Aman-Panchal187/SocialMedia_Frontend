import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../app/store'

export default function PublicRoute() {
  const { user, accessToken } = useAuthStore()

  if (user && accessToken) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
