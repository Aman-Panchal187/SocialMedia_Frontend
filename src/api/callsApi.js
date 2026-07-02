import { axiosInstance } from './axiosInstance'

export const callsApi = {
  getCallHistory: ({ cursor, limit = 20 } = {}) =>
    axiosInstance.get('/calls/history', { params: { cursor, limit } }).then((r) => r.data),
}
