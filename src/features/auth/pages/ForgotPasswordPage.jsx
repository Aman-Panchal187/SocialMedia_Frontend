import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import Logo from '../../../components/common/Logo'
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
      <div className="mb-6 flex justify-center">
        <Logo iconClassName="h-12 w-12" wordmarkClassName="text-2xl" />
      </div>
      <div className="animate-scale-in rounded-2xl border border-gray-200 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <h1 className="mb-2 text-center text-2xl font-bold">Forgot password</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          We&apos;ll send a reset code to your email
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Input type="email" placeholder="Email" error={errors.email?.message} {...register('email')} />
          <Button type="submit" isLoading={isForgotPasswordLoading} className="mt-2 w-full">
            Send code
          </Button>
        </form>
      </div>
    </div>
  )
}
