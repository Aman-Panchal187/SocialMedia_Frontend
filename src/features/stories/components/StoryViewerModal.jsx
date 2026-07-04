import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import { formatDistanceToNowStrict } from 'date-fns'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Avatar from '../../../components/common/Avatar'
import { useAuthStore } from '../../../app/store'
import { useStoryViewer } from '../hooks/useStoryViewer'
import StoryViewersListModal from './StoryViewersListModal'

const REACTION_EMOJIS = ['❤️', '😂', '😮', '😢', '🔥', '👏']

export default function StoryViewerModal({ rings, initialAuthorIndex, initialStoryIndex, isOpen, onClose }) {
  const currentUser = useAuthStore((state) => state.user)
  const [replyText, setReplyText] = useState('')
  const [isViewersListOpen, setIsViewersListOpen] = useState(false)
  const closeButtonRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()

  const {
    currentRing,
    currentStory,
    progress,
    goNext,
    goPrev,
    pause,
    resume,
    react,
    reactedEmoji,
    reply,
    replyError,
    isReplying,
    registerVideoDuration,
    handleVideoTimeUpdate,
    handleVideoEnded,
  } = useStoryViewer({
    rings,
    initialAuthorIndex: initialAuthorIndex ?? 0,
    initialStoryIndex: initialStoryIndex ?? 0,
    isOpen,
    onClose,
  })

  useEffect(() => {
    if (!isOpen) return undefined
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, goNext, goPrev])

  useEffect(() => {
    setReplyText('')
  }, [currentStory?.id])

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus()
  }, [isOpen])

  if (!isOpen || !currentRing || !currentStory) return null

  const isOwnStory = currentUser && currentRing.author.id === currentUser.id

  const handleReplySubmit = (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    reply(replyText)
    setReplyText('')
  }

  return createPortal(
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Story viewer"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      >
      <div className="relative flex h-full w-full max-w-md flex-col">
        <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 p-2">
          {currentRing.stories.map((story, index) => (
            <div key={story.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-white"
                style={{
                  width: `${
                    index < currentRing.stories.findIndex((s) => s.id === currentStory.id)
                      ? 100
                      : story.id === currentStory.id
                        ? progress * 100
                        : 0
                  }%`,
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute left-0 right-0 top-4 z-20 flex items-center gap-2 px-3">
          <Avatar src={currentRing.author.avatarUrl} alt={currentRing.author.username} size="sm" />
          <span className="text-sm font-semibold text-white">{currentRing.author.username}</span>
          <span className="text-xs text-white/70">
            {formatDistanceToNowStrict(new Date(currentStory.createdAt))} ago
          </span>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="ml-auto text-xl text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="relative flex-1 bg-black">
          {currentStory.mediaType === 'video' ? (
            <video
              key={currentStory.id}
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              className="h-full w-full object-contain"
              onLoadedMetadata={(e) => registerVideoDuration(e.currentTarget.duration)}
              onTimeUpdate={(e) => handleVideoTimeUpdate(e.currentTarget.currentTime)}
              onEnded={handleVideoEnded}
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt={currentStory.caption || 'Story'}
              className="h-full w-full object-contain"
            />
          )}

          <button
            type="button"
            aria-label="Previous story"
            className="absolute bottom-0 left-0 top-0 w-1/3"
            onPointerDown={pause}
            onPointerUp={resume}
            onClick={goPrev}
          />
          <button
            type="button"
            aria-label="Next story"
            className="absolute bottom-0 right-0 top-0 w-2/3"
            onPointerDown={pause}
            onPointerUp={resume}
            onClick={goNext}
          />

          {currentStory.caption && (
            <p className="absolute bottom-4 left-4 right-4 rounded-lg bg-black/40 px-3 py-2 text-sm text-white">
              {currentStory.caption}
            </p>
          )}
        </div>

        <div className="z-20 flex flex-col gap-2 bg-black/60 p-3">
          {isOwnStory ? (
            <button
              type="button"
              onClick={() => setIsViewersListOpen(true)}
              className="self-start text-sm text-white/80 underline"
            >
              {currentStory.viewCount ?? ''} viewers
            </button>
          ) : (
            <>
              <div className="flex gap-2">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => react(emoji)}
                    className={clsx(
                      'rounded-full text-xl transition-transform',
                      reactedEmoji === emoji ? 'scale-125' : 'opacity-80 hover:opacity-100'
                    )}
                    aria-label={`React with ${emoji}`}
                    aria-pressed={reactedEmoji === emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <form onSubmit={handleReplySubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onFocus={pause}
                  onBlur={resume}
                  placeholder={replyError ? 'Replies unavailable' : `Reply to ${currentRing.author.username}…`}
                  disabled={isReplying}
                  className="flex-1 rounded-full border border-white/30 bg-transparent px-3 py-2 text-sm text-white placeholder-white/50 outline-none"
                />
                <button
                  type="submit"
                  disabled={isReplying || !replyText.trim()}
                  className={clsx(
                    'text-sm font-semibold text-white',
                    (isReplying || !replyText.trim()) && 'opacity-50'
                  )}
                >
                  Send
                </button>
              </form>
              {replyError && <p className="text-xs text-red-400">{replyError}</p>}
            </>
          )}
        </div>
      </div>

      {isOwnStory && (
        <StoryViewersListModal
          storyId={currentStory.id}
          isOpen={isViewersListOpen}
          onClose={() => setIsViewersListOpen(false)}
        />
      )}
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
