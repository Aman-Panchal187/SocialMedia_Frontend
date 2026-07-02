import { describe, it, expect } from 'vitest'
import { attachmentContentType, messageStatusTick } from './messageHelpers'

describe('attachmentContentType', () => {
  it('classifies image mimetypes', () => {
    expect(attachmentContentType({ type: 'image/png' })).toBe('image')
  })

  it('classifies video mimetypes', () => {
    expect(attachmentContentType({ type: 'video/mp4' })).toBe('video')
  })

  it('falls back to file for other mimetypes', () => {
    expect(attachmentContentType({ type: 'application/pdf' })).toBe('file')
    expect(attachmentContentType({ type: 'text/plain' })).toBe('file')
  })
})

describe('messageStatusTick', () => {
  it('returns a double tick for read messages', () => {
    expect(messageStatusTick('read')).toBe('✓✓')
  })

  it('returns a single tick for sent (unread) messages', () => {
    expect(messageStatusTick('sent')).toBe('✓')
  })
})
