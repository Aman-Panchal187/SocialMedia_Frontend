import { useNavigate } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import FollowButton from '../../follow/components/FollowButton'
import UserListRow from '../components/UserListRow'
import {
  useSearch,
  useRecordSearch,
  useDeleteRecentSearch,
  useClearRecentSearches,
} from '../hooks/useSearch'

export default function SearchPage() {
  const navigate = useNavigate()
  const { input, setInput, isSearching, usersQuery, recentQuery, users, recent } = useSearch()
  const recordSearchMutation = useRecordSearch()
  const deleteRecentMutation = useDeleteRecentSearch()
  const clearRecentMutation = useClearRecentSearches()

  const handleSelectUser = (user) => {
    recordSearchMutation.mutate(user.id)
    navigate(`/${user.username}`)
  }

  return (
    <div className="mx-auto max-w-lg px-2">
      <h1 className="px-2 py-3 text-lg font-semibold">Search</h1>

      <label htmlFor="search-input" className="sr-only">
        Search
      </label>
      <input
        id="search-input"
        type="text"
        autoFocus
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Search"
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-gray-400 dark:border-gray-800 dark:bg-gray-900"
      />

      {isSearching ? (
        <div className="mt-2 flex flex-col gap-1">
          {usersQuery.isLoading && (
            <div className="space-y-3 p-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton circle width={40} height={40} />
                  <div className="flex-1">
                    <Skeleton width="60%" height={12} />
                    <Skeleton width="40%" height={10} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!usersQuery.isLoading && users.length === 0 && (
            <p className="py-16 text-center text-sm text-gray-500">No results found.</p>
          )}

          {users.map((user) => (
            <UserListRow
              key={user.id}
              user={user}
              onClick={() => handleSelectUser(user)}
              trailing={
                <FollowButton
                  username={user.username}
                  isFollowing={user.isFollowing}
                  isFollowRequested={user.isFollowRequested}
                />
              }
            />
          ))}
        </div>
      ) : (
        recent.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center justify-between px-2 py-1">
              <h2 className="text-sm font-semibold">Recent</h2>
              <button
                type="button"
                onClick={() => clearRecentMutation.mutate()}
                className="text-xs font-semibold text-brand hover:underline"
              >
                Clear all
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {recent.map((entry) => (
                <UserListRow
                  key={entry.user.id}
                  user={entry.user}
                  onClick={() => handleSelectUser(entry.user)}
                  trailing={
                    <button
                      type="button"
                      aria-label="Remove"
                      onClick={() => deleteRecentMutation.mutate(entry.user.id)}
                      className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    >
                      ✕
                    </button>
                  }
                />
              ))}
            </div>
          </div>
        )
      )}

      {!isSearching && recentQuery.isLoading && (
        <div className="space-y-3 p-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton circle width={40} height={40} />
              <div className="flex-1">
                <Skeleton width="60%" height={12} />
                <Skeleton width="40%" height={10} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
