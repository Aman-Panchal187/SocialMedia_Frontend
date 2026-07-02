import { useState } from 'react'
import clsx from 'clsx'
import Skeleton from 'react-loading-skeleton'
import Avatar from '../../../components/common/Avatar'
import { useAuthStore } from '../../../app/store'
import { useStoryFeed } from '../hooks/useStoryFeed'
import CreateStoryModal from './CreateStoryModal'
import StoryViewerModal from './StoryViewerModal'

export default function StoryTray() {
  const currentUser = useAuthStore((state) => state.user)
  const { data, isLoading } = useStoryFeed()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [activeAuthorIndex, setActiveAuthorIndex] = useState(null)

  const rings = data?.data.items ?? []

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-lg gap-4 overflow-x-auto px-4 py-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <Skeleton circle height={64} width={64} />
            <Skeleton width={40} height={10} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto flex max-w-lg gap-4 overflow-x-auto px-4 py-3">
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex shrink-0 flex-col items-center gap-1"
        >
          <div className="relative">
            <Avatar src={currentUser?.avatarUrl} alt={currentUser?.username} size="lg" />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900">
              +
            </span>
          </div>
          <span className="max-w-[64px] truncate text-xs">Your story</span>
        </button>

        {rings.map((ring, index) => (
          <button
            key={ring.author.id}
            type="button"
            onClick={() => setActiveAuthorIndex(index)}
            className="flex shrink-0 flex-col items-center gap-1"
          >
            <div
              className={clsx(
                'rounded-full p-[2px]',
                ring.hasUnviewed
                  ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                  : 'bg-gray-300 dark:bg-gray-700'
              )}
            >
              <div className="rounded-full bg-white p-[2px] dark:bg-gray-900">
                <Avatar src={ring.author.avatarUrl} alt={ring.author.username} size="lg" />
              </div>
            </div>
            <span className="max-w-[64px] truncate text-xs">{ring.author.username}</span>
          </button>
        ))}
      </div>

      <CreateStoryModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <StoryViewerModal
        rings={rings}
        initialAuthorIndex={activeAuthorIndex}
        isOpen={activeAuthorIndex !== null}
        onClose={() => setActiveAuthorIndex(null)}
      />
    </>
  )
}
