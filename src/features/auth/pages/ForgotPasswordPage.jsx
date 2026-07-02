import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/common/Button'
import { useAuth } from '../hooks/useAuth'

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email'),
})

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { forgotPassword, isForgotPasswordLoading } = useAuth()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (values) => {
    try {
      await forgotPassword(values)
      navigate('/reset-password', { state: { email: getValues('email') } })
    } catch {
      // Error toast already surfaced by the axios interceptor.
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-2 text-center text-2xl font-bold">Forgot password</h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        We&apos;ll send a reset code to your email
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register('email')}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <Button type="submit" isLoading={isForgotPasswordLoading}>
          Send code
        </Button>
      </form>
    </div>
  )
}
