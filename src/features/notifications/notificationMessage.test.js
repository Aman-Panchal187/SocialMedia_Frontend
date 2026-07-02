import { describe, it, expect } from 'vitest'
import { notificationMessage } from './notificationMessage'

describe('notificationMessage', () => {
  it('returns the correct message for each known type', () => {
    expect(notificationMessage('like')).toBe('liked your post')
    expect(notificationMessage('comment')).toBe('commented on your post')
    expect(notificationMessage('reply')).toBe('replied to your comment')
    expect(notificationMessage('follow')).toBe('started following you')
    expect(notificationMessage('follow_request')).toBe('requested to follow you')
    expect(notificationMessage('story_reaction')).toBe('reacted to your story')
    expect(notificationMessage('story_reply')).toBe('replied to your story')
  })

  it('falls back to a generic message for an unknown type', () => {
    expect(notificationMessage('unknown_type')).toBe('sent you a notification')
  })
})
