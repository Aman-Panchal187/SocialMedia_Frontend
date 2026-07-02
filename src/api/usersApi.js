import { axiosInstance } from './axiosInstance'

export const usersApi = {
  getByUsername: (username) => axiosInstance.get(`/users/${username}`).then((r) => r.data),
  updateMe: (payload) => axiosInstance.patch('/users/me', payload).then((r) => r.data),
  updateAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return axiosInstance
      .patch('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  updatePrivacy: (isPrivate) =>
    axiosInstance.patch('/users/me/privacy', { isPrivate }).then((r) => r.data),
  getMyStats: () => axiosInstance.get('/users/me/stats').then((r) => r.data),
}
