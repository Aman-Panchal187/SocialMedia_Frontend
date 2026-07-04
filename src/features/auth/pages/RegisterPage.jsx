import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '../../../components/common/Button'
import Logo from '../../../components/common/Logo'
import { useAuth } from '../hooks/useAuth'

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username is too long')
    .regex(/^[a-zA-Z0-9._]+$/, 'Only letters, numbers, dots and underscores'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
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

  const onSubmit = async (values) => {
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
      <h1 className="mb-6 text-center text-2xl font-bold">Sign up</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div>
          <label htmlFor="register-username" className="mb-1 block text-sm font-medium">
            Username
          </label>
          <input
            id="register-username"
            type="text"
            placeholder="Username"
            {...register('username')}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
          />
          {errors.username && <p className="mt-1 text-xs text-danger">{errors.username.message}</p>}
        </div>
        <div>
          <label htmlFor="register-email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            placeholder="Email"
            {...register('email')}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="register-password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            placeholder="Password"
            {...register('password')}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-brand dark:border-gray-700"
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>
        <Button type="submit" isLoading={isRegisterLoading}>
          Sign up
        </Button>
      </form>
      <p className="mt-4 text-center text-sm">
        Have an account?{' '}
        <Link to="/login" className="font-semibold text-brand">
          Log in
        </Link>
      </p>
    </div>
  )
}
