import { axiosInstance } from './axiosInstance'

export const followApi = {
  follow: (username) => axiosInstance.post(`/follow/${username}`).then((r) => r.data),
  unfollow: (username) => axiosInstance.delete(`/follow/${username}`).then((r) => r.data),
  acceptRequest: (username) =>
    axiosInstance.post(`/follow/requests/${username}/accept`).then((r) => r.data),
  rejectRequest: (username) =>
    axiosInstance.post(`/follow/requests/${username}/reject`).then((r) => r.data),
  getRequests: ({ cursor, limit = 20 } = {}) =>
    axiosInstance.get('/follow/requests', { params: { cursor, limit } }).then((r) => r.data),
  getFollowers: (username, { cursor, limit = 20 } = {}) =>
    axiosInstance
      .get(`/follow/${username}/followers`, { params: { cursor, limit } })
      .then((r) => r.data),
  getFollowing: (username, { cursor, limit = 20 } = {}) =>
    axiosInstance
      .get(`/follow/${username}/following`, { params: { cursor, limit } })
      .then((r) => r.data),
}
