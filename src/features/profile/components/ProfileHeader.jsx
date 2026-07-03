import { useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../../../components/common/Avatar'
import Button from '../../../components/common/Button'
import FollowButton from '../../follow/components/FollowButton'
import FollowersListModal from '../../follow/components/FollowersListModal'
import FollowingListModal from '../../follow/components/FollowingListModal'
import { useAuth } from '../../auth/hooks/useAuth'

export default function ProfileHeader({ profile, queryKey }) {
  const [modal, setModal] = useState(null)
  const { logout } = useAuth()

  return (
    <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:gap-10">
      <Avatar src={profile.avatarUrl} alt={profile.username} size="xl" />

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-xl font-semibold">{profile.username}</h1>
          {profile.isOwnProfile ? (
            <>
              <Link to="/edit-profile">
                <Button variant="secondary">Edit profile</Button>
              </Link>
              <Button variant="secondary" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <FollowButton
                username={profile.username}
                isFollowing={profile.isFollowing}
                isFollowRequested={profile.isFollowRequested}
                queryKey={queryKey}
              />
              <Link to={`/messages/${profile.username}`}>
                <Button variant="secondary">Message</Button>
              </Link>
            </>
          )}
        </div>

        <div className="mt-4 flex gap-6 text-sm">
          <span>
            <strong>{profile.postCount}</strong> posts
          </span>
          <button type="button" onClick={() => setModal('followers')}>
            <strong>{profile.followerCount}</strong> followers
          </button>
          <button type="button" onClick={() => setModal('following')}>
            <strong>{profile.followingCount}</strong> following
          </button>
        </div>

        {profile.fullName && <p className="mt-3 text-sm font-semibold">{profile.fullName}</p>}
        {profile.bio && <p className="text-sm">{profile.bio}</p>}
      </div>

      <FollowersListModal
        username={profile.username}
        isOpen={modal === 'followers'}
        onClose={() => setModal(null)}
      />
      <FollowingListModal
        username={profile.username}
        isOpen={modal === 'following'}
        onClose={() => setModal(null)}
      />
    </div>
  )
}
