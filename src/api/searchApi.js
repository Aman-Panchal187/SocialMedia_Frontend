import { axiosInstance } from './axiosInstance'

export const searchApi = {
  searchUsers: (q, limit = 20) =>
    axiosInstance.get('/search/users', { params: { q, limit } }).then((r) => r.data),
  getRecentSearches: (limit = 10) =>
    axiosInstance.get('/search/recent', { params: { limit } }).then((r) => r.data),
  recordSearch: (searchedUserId) =>
    axiosInstance.post('/search/recent', { searchedUserId }).then((r) => r.data),
  deleteRecentSearch: (searchedUserId) =>
    axiosInstance.delete(`/search/recent/${searchedUserId}`).then((r) => r.data),
  clearRecentSearches: () => axiosInstance.delete('/search/recent').then((r) => r.data),
}
