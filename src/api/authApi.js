import { axiosInstance } from './axiosInstance'

export const authApi = {
  register: (payload) => axiosInstance.post('/auth/register', payload).then((r) => r.data),
  verifyOtp: (payload) => axiosInstance.post('/auth/verify-otp', payload).then((r) => r.data),
  resendOtp: (payload) => axiosInstance.post('/auth/resend-otp', payload).then((r) => r.data),
  login: (payload) => axiosInstance.post('/auth/login', payload).then((r) => r.data),
  refreshToken: () => axiosInstance.post('/auth/refresh-token').then((r) => r.data),
  forgotPassword: (payload) => axiosInstance.post('/auth/forgot-password', payload).then((r) => r.data),
  resetPassword: (payload) => axiosInstance.post('/auth/reset-password', payload).then((r) => r.data),
  logout: () => axiosInstance.post('/auth/logout').then((r) => r.data),
  logoutAll: () => axiosInstance.post('/auth/logout-all').then((r) => r.data),
  me: () => axiosInstance.get('/auth/me').then((r) => r.data),
}
