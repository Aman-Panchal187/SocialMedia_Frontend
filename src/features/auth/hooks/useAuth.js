import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../../../api/authApi'
import { useAuthStore } from '../../../app/store'

export function useAuth() {
  const { user, accessToken, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      setAuth({ user: res.data.user, accessToken: res.data.accessToken })
      queryClient.invalidateQueries()
      navigate('/')
    },
  })

  const registerMutation = useMutation({
    mutationFn: authApi.register,
  })

  const verifyOtpMutation = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: (res) => {
      setAuth({ user: res.data.user, accessToken: res.data.accessToken })
      queryClient.invalidateQueries()
      navigate('/')
    },
  })

  const resendOtpMutation = useMutation({
    mutationFn: authApi.resendOtp,
    onSuccess: () => toast.success('Code resent'),
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
  })

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
  })

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Best-effort: even if the network call fails, clear local session state.
    } finally {
      clearAuth()
      queryClient.clear()
      navigate('/login')
    }
  }

  const logoutAll = async () => {
    try {
      await authApi.logoutAll()
    } finally {
      clearAuth()
      queryClient.clear()
      navigate('/login')
    }
  }

  return {
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
    login: loginMutation.mutateAsync,
    isLoginLoading: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegisterLoading: registerMutation.isPending,
    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyOtpLoading: verifyOtpMutation.isPending,
    resendOtp: resendOtpMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetPasswordLoading: resetPasswordMutation.isPending,
    logout,
    logoutAll,
  }
}
