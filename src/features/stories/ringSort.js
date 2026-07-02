function ringMostRecentTimestamp(ring) {
  return ring.stories.reduce((latest, story) => {
    const createdAt = new Date(story.createdAt).getTime()
    return createdAt > latest ? createdAt : latest
  }, 0)
}

export function sortRings(rings) {
  return [...rings].sort((a, b) => {
    if (a.hasUnviewed !== b.hasUnviewed) return a.hasUnviewed ? -1 : 1
    return ringMostRecentTimestamp(b) - ringMostRecentTimestamp(a)
  })
}
