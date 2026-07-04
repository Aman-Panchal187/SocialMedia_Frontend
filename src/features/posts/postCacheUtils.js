// The two "global" post lists every viewer implicitly has cached at once —
// like/save actions must always reach both regardless of where the action was
// triggered from (feed card, a specific user's grid, the saved-posts grid, or
// the post-detail modal), not just whichever keys that one caller passed.
export const FEED_QUERY_KEY = ['feed']
export const SAVED_POSTS_QUERY_KEY = ['savedPosts']

// Applies an { isLiked/isSaved, likeCount } patch to a post wherever it lives in the
// React Query cache: a paginated feed/grid page ({ pages: [{ data: { items } }] }) or
// a single-post detail query ({ data: { id, ... } }).
export function patchPostInCache(old, postId, patch) {
  if (!old) return old

  if (old.pages) {
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        data: {
          ...page.data,
          items: page.data.items.map((post) =>
            post.id === postId ? { ...post, ...patch(post) } : post
          ),
        },
      })),
    }
  }

  if (old.data?.id === postId) {
    return { ...old, data: { ...old.data, ...patch(old.data) } }
  }

  return old
}

// Drops a post from a paginated list entirely — for lists that only exist
// because of a condition (e.g. "saved posts"), toggling that condition off
// means the item no longer belongs there, not just that a flag flipped.
export function removePostFromCache(old, postId) {
  if (!old?.pages) return old
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        items: page.data.items.filter((post) => post.id !== postId),
      },
    })),
  }
}

// Finds the full post object wherever it already lives in the cache (a
// paginated page or a single-post detail query), so an action that needs to
// add the post to a *different* list doesn't have to refetch just to get its
// author/media/etc.
export function findPostInCache(old, postId) {
  if (!old) return undefined
  if (old.pages) {
    for (const page of old.pages) {
      const found = page.data?.items?.find((post) => post.id === postId)
      if (found) return found
    }
    return undefined
  }
  return old.data?.id === postId ? old.data : undefined
}

// Prepends a post into a paginated list's first page — for lists that only
// show a post because of a condition just turned on (e.g. "saved posts"),
// so it appears immediately instead of waiting on a refetch.
export function insertPostIntoCache(old, post) {
  if (!old?.pages?.length) return old
  if (findPostInCache(old, post.id)) return old
  return {
    ...old,
    pages: old.pages.map((page, index) =>
      index === 0
        ? { ...page, data: { ...page.data, items: [post, ...page.data.items] } }
        : page
    ),
  }
}
