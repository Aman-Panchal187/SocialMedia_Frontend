import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../../../api/usersApi'
import ProfileHeader from '../components/ProfileHeader'
import PostGrid from '../../posts/components/PostGrid'

export default function ProfilePage() {
  const { username } = useParams()
  const queryKey = ['profile', username]

  const profileQuery = useQuery({
    queryKey,
    queryFn: () => usersApi.getByUsername(username),
    enabled: Boolean(username),
  })

  if (profileQuery.isLoading) {
    return <p className="py-10 text-center text-sm text-gray-500">Loading profile…</p>
  }

  if (profileQuery.isError) {
    return <p className="py-10 text-center text-sm text-gray-500">Profile not found</p>
  }

  const profile = profileQuery.data.data

  return (
    <div className="mx-auto max-w-3xl">
      <ProfileHeader profile={profile} queryKey={queryKey} />
      {profile.isPrivate && !profile.isFollowing && !profile.isOwnProfile ? (
        <p className="py-10 text-center text-sm text-gray-500">This account is private</p>
      ) : (
        <div className="p-4">
          <PostGrid username={username} />
        </div>
      )}
    </div>
  )
}
