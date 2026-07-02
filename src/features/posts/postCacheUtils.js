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
