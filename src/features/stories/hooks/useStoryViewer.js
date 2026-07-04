import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { storiesApi } from '../../../api/storiesApi'
import { STORY_FEED_QUERY_KEY, useMarkStoryViewedInCache } from './useStoryFeed'

const IMAGE_DURATION_MS = 5000

export function useStoryViewer({ rings, initialAuthorIndex = 0, initialStoryIndex = 0, isOpen, onClose }) {
  const [authorIndex, setAuthorIndex] = useState(initialAuthorIndex)
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [replyError, setReplyError] = useState(null)
  const [reactedEmoji, setReactedEmoji] = useState(null)

  // The modal component instance persists across opens (it just renders null
  // while closed), so authorIndex's useState initial value only applies on the
  // very first open ever — without this, reopening with a different
  // initialAuthorIndex leaves the viewer showing whichever story it was left
  // on last time, which looks like "the wrong person's story."
  useEffect(() => {
    if (!isOpen) return
    setAuthorIndex(initialAuthorIndex)
    setStoryIndex(initialStoryIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialAuthorIndex, initialStoryIndex])

  const viewedStoryIds = useRef(new Set())
  const rafRef = useRef(null)
  const startedAtRef = useRef(null)
  const pausedElapsedRef = useRef(0)
  const durationRef = useRef(IMAGE_DURATION_MS)

  const queryClient = useQueryClient()
  const markViewedInCache = useMarkStoryViewedInCache()

  const currentRing = rings[authorIndex] ?? null
  const currentStory = currentRing?.stories[storyIndex] ?? null

  const viewMutation = useMutation({
    mutationFn: (storyId) => storiesApi.viewStory(storyId),
  })

  const reactMutation = useMutation({
    mutationFn: ({ storyId, emoji }) => storiesApi.reactToStory(storyId, emoji),
    onSuccess: (_data, { emoji }) => {
      setReactedEmoji(emoji)
      toast.success(`Reacted ${emoji}`)
    },
    onError: () => toast.error('Could not send reaction'),
  })

  const replyMutation = useMutation({
    mutationFn: ({ storyId, content }) => storiesApi.replyToStory(storyId, content),
  })

  const goToAuthor = useCallback(
    (nextAuthorIndex, nextStoryIndex = 0) => {
      if (nextAuthorIndex < 0) {
        onClose?.()
        return
      }
      if (nextAuthorIndex >= rings.length) {
        onClose?.()
        return
      }
      setAuthorIndex(nextAuthorIndex)
      setStoryIndex(nextStoryIndex)
      setReplyError(null)
    },
    [rings.length, onClose]
  )

  const goNext = useCallback(() => {
    if (!currentRing) return
    if (storyIndex + 1 < currentRing.stories.length) {
      setStoryIndex(storyIndex + 1)
      setReplyError(null)
    } else {
      goToAuthor(authorIndex + 1, 0)
    }
  }, [currentRing, storyIndex, authorIndex, goToAuthor])

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1)
      setReplyError(null)
    } else {
      const prevRing = rings[authorIndex - 1]
      goToAuthor(authorIndex - 1, prevRing ? prevRing.stories.length - 1 : 0)
    }
  }, [storyIndex, authorIndex, rings, goToAuthor])

  useEffect(() => {
    if (!currentStory) return
    if (viewedStoryIds.current.has(currentStory.id)) return
    viewedStoryIds.current.add(currentStory.id)
    viewMutation.mutate(currentStory.id)
    markViewedInCache(currentStory.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStory?.id])

  useEffect(() => {
    setReactedEmoji(null)
  }, [currentStory?.id])

  useEffect(() => {
    setProgress(0)
    pausedElapsedRef.current = 0
    startedAtRef.current = null
    durationRef.current = IMAGE_DURATION_MS
  }, [currentStory?.id])

  const stopTimer = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    if (!startedAtRef.current) return
    const elapsed = pausedElapsedRef.current + (Date.now() - startedAtRef.current)
    const ratio = Math.min(elapsed / durationRef.current, 1)
    setProgress(ratio)
    if (ratio >= 1) {
      stopTimer()
      goNext()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [goNext, stopTimer])

  useEffect(() => {
    if (isPaused || !currentStory) {
      stopTimer()
      return undefined
    }
    if (currentStory.mediaType === 'video') {
      return undefined
    }
    startedAtRef.current = Date.now()
    rafRef.current = requestAnimationFrame(tick)
    return stopTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused, currentStory?.id, currentStory?.mediaType])

  const pause = useCallback(() => {
    if (currentStory?.mediaType === 'video') {
      setIsPaused(true)
      return
    }
    if (startedAtRef.current) {
      pausedElapsedRef.current += Date.now() - startedAtRef.current
      startedAtRef.current = null
    }
    setIsPaused(true)
  }, [currentStory?.mediaType])

  const resume = useCallback(() => {
    // If the user spent longer paused (e.g. typing a reply) than the story's
    // remaining display time, resuming would otherwise instantly complete the
    // progress bar and auto-advance — which looks like the story slamming shut
    // right as you hit Send. Guarantee at least a moment of display time back.
    const MIN_REMAINING_MS = 500
    if (pausedElapsedRef.current > durationRef.current - MIN_REMAINING_MS) {
      pausedElapsedRef.current = Math.max(0, durationRef.current - MIN_REMAINING_MS)
    }
    setIsPaused(false)
  }, [])

  const registerVideoDuration = useCallback((durationSeconds) => {
    if (durationSeconds && Number.isFinite(durationSeconds)) {
      durationRef.current = durationSeconds * 1000
    }
  }, [])

  const handleVideoTimeUpdate = useCallback((currentTimeSeconds) => {
    if (!durationRef.current) return
    const elapsedMs = currentTimeSeconds * 1000
    setProgress(Math.min(elapsedMs / durationRef.current, 1))
  }, [])

  const handleVideoEnded = useCallback(() => {
    goNext()
  }, [goNext])

  const react = useCallback(
    (emoji) => {
      if (!currentStory) return
      reactMutation.mutate({ storyId: currentStory.id, emoji })
    },
    [currentStory, reactMutation]
  )

  const reply = useCallback(
    (content) => {
      if (!currentStory || !content.trim()) return
      setReplyError(null)
      return replyMutation.mutate(
        { storyId: currentStory.id, content },
        {
          onSuccess: () => {
            toast.success('Message sent')
          },
          onError: (error) => {
            if (error?.response?.status === 403) {
              setReplyError('Only mutual followers can reply to this story')
            } else {
              toast.error('Could not send reply')
            }
          },
        }
      )
    },
    [currentStory, replyMutation]
  )

  useEffect(() => {
    return () => {
      stopTimer()
      queryClient.invalidateQueries({ queryKey: STORY_FEED_QUERY_KEY })
    }
  }, [stopTimer, queryClient])

  return useMemo(
    () => ({
      currentRing,
      currentStory,
      authorIndex,
      storyIndex,
      progress,
      isPaused,
      goNext,
      goPrev,
      pause,
      resume,
      react,
      reactedEmoji,
      reply,
      replyError,
      isReplying: replyMutation.isPending,
      registerVideoDuration,
      handleVideoTimeUpdate,
      handleVideoEnded,
    }),
    [
      currentRing,
      currentStory,
      authorIndex,
      storyIndex,
      progress,
      isPaused,
      goNext,
      goPrev,
      pause,
      resume,
      react,
      reactedEmoji,
      reply,
      replyError,
      replyMutation.isPending,
      registerVideoDuration,
      handleVideoTimeUpdate,
      handleVideoEnded,
    ]
  )
}
