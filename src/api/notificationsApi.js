import { axiosInstance } from './axiosInstance'

export const notificationsApi = {
  getNotifications: ({ cursor, limit = 20 } = {}) =>
    axiosInstance.get('/notifications', { params: { cursor, limit } }).then((r) => r.data),
  getUnreadCount: () => axiosInstance.get('/notifications/unread-count').then((r) => r.data),
  markRead: (id) => axiosInstance.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => axiosInstance.patch('/notifications/read-all').then((r) => r.data),
}
