import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/common/Button'
import Input from '../../../components/common/Input'
import Logo from '../../../components/common/Logo'
import { useAuth } from '../hooks/useAuth'

const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username is too long')
      .regex(/^[a-zA-Z0-9._]+$/, 'Only letters, numbers, dots and underscores'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, isRegisterLoading } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async ({ confirmPassword: _confirmPassword, ...values }) => {
    try {
      const res = await registerUser(values)
      navigate('/verify-otp', { state: { email: res.data.email, purpose: 'email_verify' } })
    } catch (error) {
      const details = error?.response?.data?.error?.details
      if (Array.isArray(details)) {
        details.forEach((detail) => {
          if (detail.field) setError(detail.field, { message: detail.message })
        })
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <div className="mb-6 flex justify-center">
        <Logo iconClassName="h-12 w-12" wordmarkClassName="text-2xl" />
      </div>
      <div className="animate-scale-in rounded-2xl border border-gray-200 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900 sm:p-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign up</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Input
            id="register-username"
            label="Username"
            type="text"
            placeholder="Username"
            error={errors.username?.message}
            {...register('username')}
          />
          <Input
            id="register-email"
            label="Email"
            type="email"
            placeholder="Email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            id="register-password"
            label="Password"
            type="password"
            placeholder="Password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            id="register-confirm-password"
            label="Confirm password"
            type="password"
            placeholder="Confirm password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" isLoading={isRegisterLoading} className="mt-2 w-full">
            Sign up
          </Button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm">
        Have an account?{' '}
        <Link to="/login" className="font-semibold text-brand transition-colors hover:text-brand-hover">
          Log in
        </Link>
      </p>
    </div>
  )
}
