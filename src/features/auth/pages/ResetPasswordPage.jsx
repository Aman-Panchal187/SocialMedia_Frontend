import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Button from '../../../components/common/Button'
import Logo from '../../../components/common/Logo'
import { useAuth } from '../hooks/useAuth'

const resetPasswordSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export default function ResetPasswordPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email
  const { resetPassword, isResetPasswordLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) })

  if (!email) {
    return <Navigate to="/forgot-password" replace />
  }

  const onSubmit = async (values) => {
    try {
      await resetPassword({ email, ...values })
      toast.success('Password reset. Please log in.')
      navigate('/login')
    } catch {
      // Error toast already surfaced by the axios interceptor.
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="mb-6 flex justify-center">
        <Logo iconClassName="h-12 w-12" wordmarkClassName="text-2xl" />
      </div>
      <h1 className="mb-2 text-center text-2xl font-bold">Reset password</h1>
      <p className="mb-6 text-center text-sm text-gray-500">Enter the code sent to {email}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <input
            type="text"
            placeholder="6-digit code"
            {...register('code')}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
          />
          {errors.code && <p className="mt-1 text-xs text-danger">{errors.code.message}</p>}
        </div>
        <div>
          <input
            type="password"
            placeholder="New password"
            {...register('newPassword')}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
          />
          {errors.newPassword && <p className="mt-1 text-xs text-danger">{errors.newPassword.message}</p>}
        </div>
        <Button type="submit" isLoading={isResetPasswordLoading}>
          Reset password
        </Button>
      </form>
    </div>
  )
}
