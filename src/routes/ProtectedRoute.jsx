import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../app/store'
import { usersApi } from '../api/usersApi'

export default function ProtectedRoute() {
  const { user, accessToken, setAuth } = useAuthStore()

  useEffect(() => {
    if (!user || !accessToken) return
    usersApi
      .getByUsername(user.username)
      .then((res) => {
        const { fullName, bio, avatarUrl, isPrivate } = res.data
        setAuth({ user: { ...user, fullName, bio, avatarUrl, isPrivate } })
      })
      .catch(() => {})
    // Refresh the cached user once per mount (e.g. app load/reload) so avatar/profile
    // edits made outside this session (another tab, direct API call) aren't stuck stale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
