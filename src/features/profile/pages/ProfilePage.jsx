import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import Skeleton from 'react-loading-skeleton'
import { usersApi } from '../../../api/usersApi'
import { postsApi } from '../../../api/postsApi'
import { GridIcon, BookmarkIcon } from '../../../components/common/icons'
import EmptyState from '../../../components/common/EmptyState'
import { SAVED_POSTS_QUERY_KEY } from '../../posts/postCacheUtils'
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
    return (
      <div className="mx-auto max-w-3xl animate-fade-in p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
          <Skeleton circle width={96} height={96} />
          <div className="flex-1 space-y-3">
            <Skeleton width={160} height={20} />
            <Skeleton width={220} height={14} />
            <Skeleton width={140} height={14} />
          </div>
        </div>
      </div>
    )
  }

  if (profileQuery.isError) {
    return <EmptyState icon={GridIcon} title="Profile not found" />
  }

  const profile = profileQuery.data.data
  const tab = profile.isOwnProfile ? activeTab : 'posts'

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <ProfileHeader profile={profile} queryKey={queryKey} />
      {profile.isPrivate && !profile.isFollowing && !profile.isOwnProfile ? (
        <EmptyState icon={GridIcon} title="This account is private" description="Follow this account to see their photos and videos." />
      ) : (
        <>
          {profile.isOwnProfile && (
            <div className="relative flex border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setActiveTab('posts')}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50',
                  tab === 'posts' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
                )}
              >
                <GridIcon className="h-4 w-4" />
                Posts
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50',
                  tab === 'saved' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
                )}
              >
                <BookmarkIcon className="h-4 w-4" />
                Saved
              </button>
              <motion.div
                className="absolute bottom-0 h-0.5 w-1/2 bg-gray-900 dark:bg-gray-100"
                animate={{ x: tab === 'saved' ? '100%' : '0%' }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          )}

          <div className="p-4">
            {tab === 'saved' ? (
              <PostGrid
                queryKey={SAVED_POSTS_QUERY_KEY}
                queryFn={postsApi.getSavedPosts}
                emptyMessage="No saved posts yet"
                emptyIcon={BookmarkIcon}
              />
            ) : (
              <PostGrid
                queryKey={['userPosts', username]}
                queryFn={(params) => postsApi.getUserPosts(username, params)}
                emptyMessage="No posts yet"
                emptyIcon={GridIcon}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
