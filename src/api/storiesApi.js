import { axiosInstance } from './axiosInstance'

export const storiesApi = {
  getStoryFeed: () => axiosInstance.get('/stories/feed').then((r) => r.data),
  getUserStories: (username) =>
    axiosInstance.get(`/stories/user/${username}`).then((r) => r.data),
  createStory: ({ file, caption }) => {
    const formData = new FormData()
    formData.append('media', file)
    if (caption) formData.append('caption', caption)
    return axiosInstance
      .post('/stories', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
  deleteStory: (storyId) => axiosInstance.delete(`/stories/${storyId}`).then((r) => r.data),
  viewStory: (storyId) => axiosInstance.post(`/stories/${storyId}/view`).then((r) => r.data),
  reactToStory: (storyId, emoji) =>
    axiosInstance.post(`/stories/${storyId}/react`, { emoji }).then((r) => r.data),
  replyToStory: (storyId, content) =>
    axiosInstance.post(`/stories/${storyId}/reply`, { content }).then((r) => r.data),
  getStoryViewers: (storyId, { cursor, limit = 20 } = {}) =>
    axiosInstance
      .get(`/stories/${storyId}/viewers`, { params: { cursor, limit } })
      .then((r) => r.data),
}
