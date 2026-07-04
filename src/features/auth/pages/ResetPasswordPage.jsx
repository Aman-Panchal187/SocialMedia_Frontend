import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
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
      <div className="animate-scale-in rounded-2xl border border-gray-200 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <h1 className="mb-2 text-center text-2xl font-bold">Reset password</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Enter the code sent to {email}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Input
            type="text"
            placeholder="6-digit code"
            error={errors.code?.message}
            {...register('code')}
          />
          <Input
            type="password"
            placeholder="New password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Button type="submit" isLoading={isResetPasswordLoading} className="mt-2 w-full">
            Reset password
          </Button>
        </form>
      </div>
    </div>
  )
}
