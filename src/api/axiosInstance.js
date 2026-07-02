import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '../app/store'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

function extractErrorMessage(error) {
  const payload = error?.response?.data
  if (!payload) return error?.message || 'Something went wrong'
  const details = payload.error?.details
  if (Array.isArray(details) && details.length > 0 && details[0]?.message) {
    return details[0].message
  }
  return payload.error?.message || 'Something went wrong'
}

let refreshPromise = null

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh-token`, null, { withCredentials: true })
      .then((res) => res.data.data.accessToken)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error?.response?.status
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh-token') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/verify-otp')

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true
      try {
        const newAccessToken = await refreshAccessToken()
        useAuthStore.getState().setAuth({ accessToken: newAccessToken })
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().clearAuth()
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    const skipToast = originalRequest?.meta?.skipErrorToast
    if (!skipToast) {
      toast.error(extractErrorMessage(error))
    }

    return Promise.reject(error)
  }
)

export { extractErrorMessage }
