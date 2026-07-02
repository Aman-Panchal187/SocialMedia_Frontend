import { axiosInstance } from './axiosInstance'

export const postsApi = {
  createPost: ({ media, caption, hashtags }) => {
    const formData = new FormData()
    media.forEach((file) => formData.append('media', file))
    if (caption) formData.append('caption', caption)
    ;(hashtags || []).forEach((tag) => formData.append('hashtags[]', tag))
    return axiosInstance
      .post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
  getFeed: ({ cursor, limit = 20 } = {}) =>
    axiosInstance.get('/posts/feed', { params: { cursor, limit } }).then((r) => r.data),
  getPost: (postId) => axiosInstance.get(`/posts/${postId}`).then((r) => r.data),
  deletePost: (postId) => axiosInstance.delete(`/posts/${postId}`).then((r) => r.data),
  updateCaption: (postId, caption) =>
    axiosInstance.patch(`/posts/${postId}`, { caption }).then((r) => r.data),
  getUserPosts: (username, { cursor, limit = 20 } = {}) =>
    axiosInstance
      .get(`/posts/user/${username}`, { params: { cursor, limit } })
      .then((r) => r.data),
  likePost: (postId) => axiosInstance.post(`/posts/${postId}/like`).then((r) => r.data),
  unlikePost: (postId) => axiosInstance.delete(`/posts/${postId}/like`).then((r) => r.data),
  savePost: (postId) => axiosInstance.post(`/posts/${postId}/save`).then((r) => r.data),
  unsavePost: (postId) => axiosInstance.delete(`/posts/${postId}/save`).then((r) => r.data),
  getComments: (postId, { cursor, limit = 20 } = {}) =>
    axiosInstance
      .get(`/posts/${postId}/comments`, { params: { cursor, limit } })
      .then((r) => r.data),
  getReplies: (commentId, { cursor, limit = 20 } = {}) =>
    axiosInstance
      .get(`/posts/comments/${commentId}/replies`, { params: { cursor, limit } })
      .then((r) => r.data),
  addComment: (postId, { content, parentCommentId }) =>
    axiosInstance
      .post(`/posts/${postId}/comments`, { content, parentCommentId })
      .then((r) => r.data),
  deleteComment: (commentId) =>
    axiosInstance.delete(`/posts/comments/${commentId}`).then((r) => r.data),
  likeComment: (commentId) =>
    axiosInstance.post(`/posts/comments/${commentId}/like`).then((r) => r.data),
  unlikeComment: (commentId) =>
    axiosInstance.delete(`/posts/comments/${commentId}/like`).then((r) => r.data),
}
