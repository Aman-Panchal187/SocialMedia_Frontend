import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import Skeleton from 'react-loading-skeleton'
import Avatar from '../../../components/common/Avatar'
import { useAuthStore } from '../../../app/store'
import { useStoryFeed } from '../hooks/useStoryFeed'
import { useOwnStories } from '../hooks/useOwnStories'
import CreateStoryModal from './CreateStoryModal'
import StoryViewerModal from './StoryViewerModal'

const LONG_PRESS_MS = 500

export default function StoryTray() {
  const currentUser = useAuthStore((state) => state.user)
  const { data, isLoading } = useStoryFeed()
  const ownStoriesQuery = useOwnStories(currentUser?.username)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isOwnViewerOpen, setIsOwnViewerOpen] = useState(false)
  const [ownViewerStoryIndex, setOwnViewerStoryIndex] = useState(0)
  const [activeAuthorIndex, setActiveAuthorIndex] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  // The owner viewing their own story is intentionally not tracked server-side
  // (it shouldn't count as a "view" or list them as their own viewer), so
  // whether the own-story ring shows as "seen" is tracked locally instead —
  // reset per story id, so adding a new story lights the ring back up.
  const [seenOwnStoryIds, setSeenOwnStoryIds] = useState(() => new Set())

  const pressTimerRef = useRef(null)
  const longPressTriggeredRef = useRef(false)

  const rings = data?.data.items ?? []
  const ownStories = ownStoriesQuery.data?.data.items ?? []
  const hasOwnStory = ownStories.length > 0
  const hasUnseenOwnStory = ownStories.some((story) => !seenOwnStoryIds.has(story.id))

  const ownRing = hasOwnStory
    ? { author: ownStoriesQuery.data.data.author, hasUnviewed: false, stories: ownStories }
    : null

  const openOwnViewer = (storyIndex) => {
    setSeenOwnStoryIds((prev) => {
      const next = new Set(prev)
      ownStories.forEach((story) => next.add(story.id))
      return next
    })
    setOwnViewerStoryIndex(storyIndex)
    setIsOwnViewerOpen(true)
  }

  // Deep link from a "reacted to your story" notification (?story=<id>) — jump
  // straight to that specific story in your own ring instead of just opening it.
  useEffect(() => {
    const targetStoryId = searchParams.get('story')
    if (!targetStoryId || ownStoriesQuery.isLoading) return

    const index = ownStories.findIndex((story) => story.id === targetStoryId)
    if (index === -1) {
      toast.error('That story is no longer available')
    } else {
      openOwnViewer(index)
    }

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('story')
      return next
    }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, ownStoriesQuery.isLoading])

  const handleOwnPointerDown = () => {
    longPressTriggeredRef.current = false
    pressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true
      setIsCreateOpen(true)
    }, LONG_PRESS_MS)
  }

  const handleOwnPointerUp = () => {
    clearTimeout(pressTimerRef.current)
    if (longPressTriggeredRef.current) return
    if (hasOwnStory) {
      openOwnViewer(0)
    } else {
      setIsCreateOpen(true)
    }
  }

  const handleOwnPointerLeave = () => {
    clearTimeout(pressTimerRef.current)
  }

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
        <div
          role="button"
          tabIndex={0}
          aria-label={hasOwnStory ? 'View your story, hold to add another' : 'Add to your story'}
          onPointerDown={handleOwnPointerDown}
          onPointerUp={handleOwnPointerUp}
          onPointerLeave={handleOwnPointerLeave}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (hasOwnStory) {
                openOwnViewer(0)
              } else {
                setIsCreateOpen(true)
              }
            }
          }}
          className="flex shrink-0 cursor-pointer select-none flex-col items-center gap-1"
        >
          <div className="relative">
            {hasOwnStory ? (
              <div
                className={clsx(
                  'rounded-full p-[2px]',
                  hasUnseenOwnStory
                    ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                    : 'bg-gray-300 dark:bg-gray-700'
                )}
              >
                <div className="rounded-full bg-white p-[2px] dark:bg-gray-900">
                  <Avatar src={currentUser?.avatarUrl} alt={currentUser?.username} size="lg" />
                </div>
              </div>
            ) : (
              <Avatar src={currentUser?.avatarUrl} alt={currentUser?.username} size="lg" />
            )}
            <button
              type="button"
              aria-label="Add another story"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                setIsCreateOpen(true)
              }}
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900"
            >
              +
            </button>
          </div>
          <span className="max-w-[64px] truncate text-xs">Your story</span>
        </div>

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

      {ownRing && (
        <StoryViewerModal
          rings={[ownRing]}
          initialAuthorIndex={0}
          initialStoryIndex={ownViewerStoryIndex}
          isOpen={isOwnViewerOpen}
          onClose={() => {
            setIsOwnViewerOpen(false)
            setOwnViewerStoryIndex(0)
          }}
        />
      )}
    </>
  )
}
