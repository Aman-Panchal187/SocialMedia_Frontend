import { axiosInstance } from './axiosInstance'

export const chatApi = {
  getConversations: ({ cursor, limit = 20 } = {}) =>
    axiosInstance.get('/chat/conversations', { params: { cursor, limit } }).then((r) => r.data),
  startConversation: (username) =>
    axiosInstance
      .post('/chat/conversations', { username }, { meta: { skipErrorToast: true } })
      .then((r) => r.data),
  getMessages: (conversationId, { cursor, limit = 20 } = {}) =>
    axiosInstance
      .get(`/chat/conversations/${conversationId}/messages`, { params: { cursor, limit } })
      .then((r) => r.data),
  sendTextMessage: (conversationId, content) =>
    axiosInstance
      .post(`/chat/conversations/${conversationId}/messages`, { contentType: 'text', content })
      .then((r) => r.data),
  sendAttachmentMessage: (conversationId, { contentType, file }) => {
    const formData = new FormData()
    formData.append('contentType', contentType)
    formData.append('attachment', file)
    return axiosInstance
      .post(`/chat/conversations/${conversationId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
  markRead: (conversationId) =>
    axiosInstance.patch(`/chat/conversations/${conversationId}/read`).then((r) => r.data),
  getUnreadCount: () => axiosInstance.get('/chat/unread-count').then((r) => r.data),
}
