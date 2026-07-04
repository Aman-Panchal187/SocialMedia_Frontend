import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { usersApi } from '../../../api/usersApi'
import { postsApi } from '../../../api/postsApi'
import { GridIcon, BookmarkIcon } from '../../../components/common/icons'
import ProfileHeader from '../components/ProfileHeader'
import PostGrid from '../../posts/components/PostGrid'

export default function ProfilePage() {
  const { username } = useParams()
  const queryKey = ['profile', username]
  const [activeTab, setActiveTab] = useState('posts')

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
  const tab = profile.isOwnProfile ? activeTab : 'posts'

  return (
    <div className="mx-auto max-w-3xl">
      <ProfileHeader profile={profile} queryKey={queryKey} />
      {profile.isPrivate && !profile.isFollowing && !profile.isOwnProfile ? (
        <p className="py-10 text-center text-sm text-gray-500">This account is private</p>
      ) : (
        <>
          {profile.isOwnProfile && (
            <div className="flex border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-1.5 border-t py-3 text-xs font-semibold uppercase tracking-wide',
                  tab === 'posts'
                    ? 'border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                    : 'border-transparent text-gray-400'
                )}
              >
                <GridIcon className="h-4 w-4" />
                Posts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-1.5 border-t py-3 text-xs font-semibold uppercase tracking-wide',
                  tab === 'saved'
                    ? 'border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                    : 'border-transparent text-gray-400'
                )}
              >
                <BookmarkIcon className="h-4 w-4" />
                Saved
              </button>
            </div>
          )}

          <div className="p-4">
            {tab === 'saved' ? (
              <PostGrid
                queryKey={['savedPosts']}
                queryFn={postsApi.getSavedPosts}
                emptyMessage="No saved posts yet"
              />
            ) : (
              <PostGrid
                queryKey={['userPosts', username]}
                queryFn={(params) => postsApi.getUserPosts(username, params)}
                emptyMessage="No posts yet"
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
