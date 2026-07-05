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
  }

  const handleOwnPointerLeave = () => {
    clearTimeout(pressTimerRef.current)
  }

  // The short-tap action fires from onClick rather than onPointerUp — onClick
  // is the browser's synthesized tap event and fires reliably across mouse,
  // touch, and assistive tech, whereas relying on onPointerUp alone was
  // fragile on mobile: this control sits inside a horizontally-scrollable row
  // with no touch-action constraint, so a tap with even a slight amount of
  // finger movement gets reinterpreted as a scroll gesture and the pointerup
  // handler's action never fires. Every other ring already uses a real
  // <button onClick>, which doesn't have this problem — this just brings the
  // own-story control in line with that.
  const handleOwnActivate = () => {
    if (longPressTriggeredRef.current) return
    if (hasOwnStory) {
      openOwnViewer(0)
    } else {
      setIsCreateOpen(true)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-lg gap-4 overflow-x-auto px-4 py-3 animate-fade-in">
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
      <div className="mx-auto flex max-w-lg animate-fade-in gap-4 overflow-x-auto px-4 py-3">
        <div
          role="button"
          tabIndex={0}
          aria-label={hasOwnStory ? 'View your story, hold to add another' : 'Add to your story'}
          onPointerDown={handleOwnPointerDown}
          onPointerUp={handleOwnPointerUp}
          onPointerLeave={handleOwnPointerLeave}
          onClick={handleOwnActivate}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleOwnActivate()
            }
          }}
          className="flex shrink-0 cursor-pointer select-none touch-manipulation flex-col items-center gap-1 rounded-xl transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 motion-reduce:transition-none motion-reduce:active:scale-100"
        >
          <div className="relative">
            {/* Always wrap in the same two-layer ring structure regardless of
                hasOwnStory — rendering a bare Avatar in the "no story" case
                would drop the ring's padding, making it a different size
                than every other entry in the tray and throwing off alignment. */}
            <div
              className={clsx(
                'rounded-full p-[2px] transition-transform duration-150',
                hasOwnStory
                  ? hasUnseenOwnStory
                    ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                    : 'bg-gray-300 dark:bg-gray-700'
                  : 'bg-transparent'
              )}
            >
              <div className="rounded-full bg-white p-[2px] dark:bg-gray-900">
                <Avatar src={currentUser?.avatarUrl} alt={currentUser?.username} size="lg" />
              </div>
            </div>
            <button
              type="button"
              aria-label="Add another story"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                setIsCreateOpen(true)
              }}
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-bold text-white ring-2 ring-white transition-transform duration-150 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 dark:ring-gray-900 motion-reduce:transition-none motion-reduce:active:scale-100"
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
            className="flex shrink-0 touch-manipulation flex-col items-center gap-1 rounded-xl transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 motion-reduce:transition-none motion-reduce:active:scale-100"
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
