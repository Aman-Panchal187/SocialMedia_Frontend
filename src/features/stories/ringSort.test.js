import { describe, it, expect } from 'vitest'
import { sortRings } from './ringSort'

function ring({ id, hasUnviewed, createdAt }) {
  return {
    author: { id, username: `user-${id}` },
    hasUnviewed,
    stories: [{ id: `${id}-story`, createdAt }],
  }
}

describe('sortRings', () => {
  it('puts unseen rings before seen rings', () => {
    const rings = [
      ring({ id: 'a', hasUnviewed: false, createdAt: '2026-07-02T10:00:00Z' }),
      ring({ id: 'b', hasUnviewed: true, createdAt: '2026-07-01T10:00:00Z' }),
    ]
    expect(sortRings(rings).map((r) => r.author.id)).toEqual(['b', 'a'])
  })

  it('orders rings within the same seen-state by most recent story first', () => {
    const rings = [
      ring({ id: 'a', hasUnviewed: true, createdAt: '2026-07-01T10:00:00Z' }),
      ring({ id: 'b', hasUnviewed: true, createdAt: '2026-07-02T10:00:00Z' }),
    ]
    expect(sortRings(rings).map((r) => r.author.id)).toEqual(['b', 'a'])
  })

  it('does not mutate the input array', () => {
    const rings = [
      ring({ id: 'a', hasUnviewed: false, createdAt: '2026-07-01T10:00:00Z' }),
      ring({ id: 'b', hasUnviewed: true, createdAt: '2026-07-02T10:00:00Z' }),
    ]
    const original = [...rings]
    sortRings(rings)
    expect(rings).toEqual(original)
  })
})
